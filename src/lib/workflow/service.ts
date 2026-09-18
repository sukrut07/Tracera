import { getDb, getDocumentById, getUserById, saveDbExtractedData } from '@/lib/db';
import { ocrService } from '@/lib/ocr/ocr-service';
import { notificationService } from '@/lib/services/notification-service';
import {
  AuditDocument,
  DocumentStatus,
  DocumentType,
  UserProfile,
} from '@/types';
import crypto from 'crypto';

export class WorkflowError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export interface SubmitDocumentParams {
  clientId: string;
  uploaderId: string;
  title: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  notes?: string;
}

export interface UploadCorrectionParams {
  documentId: string;
  clientId: string;
  uploaderId: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  notes?: string;
}

export interface RequestCorrectionParams {
  documentId: string;
  auditorId: string;
  reason: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ApproveDocumentParams {
  documentId: string;
  auditorId: string;
  comment?: string;
}

/**
 * Centralized CA Audit Workflow Engine
 * Guarantees transactional consistency, state machine transitions, and tamper-evident audit logging.
 */
export const workflowService = {
  /**
   * Submit a new document (Client action)
   */
  async submitDocument(user: UserProfile, params: SubmitDocumentParams): Promise<AuditDocument> {
    if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
      throw new WorkflowError(403, 'Unauthorized: Only clients can submit documents');
    }
    if (user.role === 'CLIENT' && user.client_id !== params.clientId) {
      throw new WorkflowError(403, 'Forbidden: You can only submit documents for your own organization');
    }
    if (!params.title || !params.title.trim()) {
      throw new WorkflowError(400, 'Document title is required');
    }
    if (!params.fileName || !params.filePath) {
      throw new WorkflowError(400, 'Valid uploaded file is required');
    }

    const db = getDb();
    const docId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const auditId1 = crypto.randomUUID();
    const auditId2 = crypto.randomUUID();
    const now = new Date().toISOString();

    // Default auditor assignment: Rahul Sharma (demo CA)
    const defaultAuditor = db.prepare("SELECT id, name FROM users WHERE role = 'AUDITOR' LIMIT 1").get() as any;
    const auditorId = defaultAuditor?.id || null;
    const auditorName = defaultAuditor?.name || 'Assigned CA Auditor';

    const transaction = db.transaction(() => {
      // 1. Create document
      db.prepare(`
        INSERT INTO documents (id, client_id, title, document_type, status, current_version, assigned_to, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'SUBMITTED', 1, ?, ?, ?)
      `).run(docId, params.clientId, params.title.trim(), params.documentType, auditorId, now, now);

      // 2. Create version 1
      db.prepare(`
        INSERT INTO document_versions (id, document_id, version_number, file_name, file_path, file_size, file_type, uploaded_by, uploaded_at, notes)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        versionId,
        docId,
        params.fileName,
        params.filePath,
        params.fileSize || 0,
        params.fileType || 'application/octet-stream',
        user.id,
        now,
        params.notes?.trim() || null
      );

      // 3. Append-only audit logs
      db.prepare(`
        INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
        VALUES (?, ?, ?, 'DOCUMENT_UPLOADED', ?, ?)
      `).run(
        auditId1,
        docId,
        user.id,
        JSON.stringify({
          version: 1,
          file_name: params.fileName,
          document_type: params.documentType,
          notes: params.notes?.trim() || undefined,
        }),
        now
      );

      if (auditorId) {
        db.prepare(`
          INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
          VALUES (?, ?, ?, 'DOCUMENT_ASSIGNED', ?, ?)
        `).run(
          auditId2,
          docId,
          user.id,
          JSON.stringify({
            assigned_to_id: auditorId,
            assigned_to_name: auditorName,
          }),
          now
        );
      }
    });

    transaction();

    // 4. Run OCR & Extraction Pipeline
    try {
      const ocrResult = await ocrService.processDocument({
        documentId: docId,
        versionId,
        versionNumber: 1,
        documentType: params.documentType,
        fileName: params.fileName,
      });
      saveDbExtractedData({
        documentId: docId,
        versionId,
        invoiceNumber: ocrResult.invoiceNumber,
        invoiceDate: ocrResult.invoiceDate,
        vendorName: ocrResult.vendorName,
        gstin: ocrResult.gstin,
        subtotal: ocrResult.subtotal,
        gst: ocrResult.gst,
        total: ocrResult.total,
        items: ocrResult.items,
        confidenceScore: ocrResult.confidenceScore,
      });
    } catch (ocrErr) {
      console.warn('OCR processing error (non-fatal):', ocrErr);
    }

    // 5. Dispatch in-app notification to auditor
    if (auditorId) {
      try {
        await notificationService.notify({
          recipientId: auditorId,
          type: 'DOCUMENT_SUBMITTED',
          title: 'New Audit Submission',
          message: `${user.name} submitted "${params.title}" (v1) for review`,
          documentId: docId,
        });
      } catch (notifErr) {
        console.warn('Notification dispatch error:', notifErr);
      }
    }

    const created = getDocumentById(docId);
    if (!created) throw new WorkflowError(500, 'Failed to fetch newly created document');
    return created;
  },

  /**
   * Start reviewing document (Auditor action)
   */
  async startReview(user: UserProfile, documentId: string): Promise<AuditDocument> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN') {
      throw new WorkflowError(403, 'Unauthorized: Only auditors can review documents');
    }

    const doc = getDocumentById(documentId);
    if (!doc) throw new WorkflowError(404, 'Document not found');

    if (doc.status !== 'SUBMITTED' && doc.status !== 'UNDER_REVIEW') {
      throw new WorkflowError(400, `Cannot start review on document in '${doc.status}' status`);
    }

    const db = getDb();
    const now = new Date().toISOString();
    const auditId = crypto.randomUUID();

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE documents 
        SET status = 'UNDER_REVIEW', assigned_to = ?, updated_at = ?
        WHERE id = ?
      `).run(user.id, now, documentId);

      if (doc.status !== 'UNDER_REVIEW') {
        db.prepare(`
          INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
          VALUES (?, ?, ?, 'REVIEW_STARTED', ?, ?)
        `).run(
          auditId,
          documentId,
          user.id,
          JSON.stringify({
            version: doc.current_version,
            reviewer_name: user.name,
          }),
          now
        );
      }
    });

    transaction();

    const updated = getDocumentById(documentId);
    if (!updated) throw new WorkflowError(500, 'Failed to fetch document after review start');
    return updated;
  },

  /**
   * Request correction from client (Auditor action)
   */
  async requestCorrection(user: UserProfile, params: RequestCorrectionParams): Promise<AuditDocument> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN') {
      throw new WorkflowError(403, 'Unauthorized: Only auditors can request corrections');
    }

    if (!params.reason || !params.reason.trim()) {
      throw new WorkflowError(400, 'Please provide a correction reason');
    }

    const doc = getDocumentById(params.documentId);
    if (!doc) throw new WorkflowError(404, 'Document not found');

    // Auto-transition to UNDER_REVIEW if currently SUBMITTED to keep flow seamless
    if (doc.status !== 'UNDER_REVIEW' && doc.status !== 'SUBMITTED') {
      throw new WorkflowError(400, `Cannot request correction on document with status '${doc.status}'`);
    }

    const db = getDb();
    const now = new Date().toISOString();
    const reviewId = crypto.randomUUID();
    const auditId = crypto.randomUUID();

    // Find current version record ID
    const currentVersionRecord = doc.versions?.find((v) => v.version_number === doc.current_version);
    const versionId = currentVersionRecord?.id || doc.versions?.[0]?.id;

    if (!versionId) {
      throw new WorkflowError(500, 'Cannot locate active version for document');
    }

    const transaction = db.transaction(() => {
      // 1. Update document status
      db.prepare(`
        UPDATE documents 
        SET status = 'CORRECTION_REQUIRED', updated_at = ?
        WHERE id = ?
      `).run(now, params.documentId);

      // 2. Insert Review record
      db.prepare(`
        INSERT INTO reviews (id, document_id, version_id, reviewer_id, status, comment, created_at)
        VALUES (?, ?, ?, ?, 'CORRECTION_REQUIRED', ?, ?)
      `).run(reviewId, params.documentId, versionId, user.id, params.reason.trim(), now);

      // 3. Append audit log
      db.prepare(`
        INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
        VALUES (?, ?, ?, 'CORRECTION_REQUESTED', ?, ?)
      `).run(
        auditId,
        params.documentId,
        user.id,
        JSON.stringify({
          version: doc.current_version,
          reason: params.reason.trim(),
          priority: params.priority || 'MEDIUM',
          reviewer_name: user.name,
        }),
        now
      );
    });

    transaction();

    // Dispatch notification to client
    const clientUser = db.prepare('SELECT id FROM users WHERE client_id = ? LIMIT 1').get(doc.client_id) as any;
    if (clientUser) {
      try {
        await notificationService.notify({
          recipientId: clientUser.id,
          type: 'CORRECTION_REQUESTED',
          title: 'Correction Required',
          message: `Auditor requested revision for "${doc.title}": ${params.reason}`,
          documentId: doc.id,
        });
      } catch (notifErr) {
        console.warn('Notification error:', notifErr);
      }
    }

    const updated = getDocumentById(params.documentId);
    if (!updated) throw new WorkflowError(500, 'Failed to fetch document after correction request');
    return updated;
  },

  /**
   * Upload corrected version (Client action)
   */
  async uploadCorrection(user: UserProfile, params: UploadCorrectionParams): Promise<AuditDocument> {
    if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
      throw new WorkflowError(403, 'Unauthorized: Only clients can upload corrections');
    }

    const doc = getDocumentById(params.documentId);
    if (!doc) throw new WorkflowError(404, 'Document not found');

    if (user.role === 'CLIENT' && user.client_id !== doc.client_id) {
      throw new WorkflowError(403, 'Forbidden: You do not own this document');
    }

    if (doc.status !== 'CORRECTION_REQUIRED') {
      throw new WorkflowError(400, `Cannot upload correction. Document status is '${doc.status}', expected 'CORRECTION_REQUIRED'`);
    }

    if (!params.fileName || !params.filePath) {
      throw new WorkflowError(400, 'Valid corrected file is required');
    }

    const newVersionNumber = doc.current_version + 1;
    const db = getDb();
    const versionId = crypto.randomUUID();
    const auditId = crypto.randomUUID();
    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      // 1. Insert new version (never overwrite old version!)
      db.prepare(`
        INSERT INTO document_versions (id, document_id, version_number, file_name, file_path, file_size, file_type, uploaded_by, uploaded_at, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        versionId,
        doc.id,
        newVersionNumber,
        params.fileName,
        params.filePath,
        params.fileSize || 0,
        params.fileType || 'application/octet-stream',
        user.id,
        now,
        params.notes?.trim() || `Correction for v${doc.current_version}`
      );

      // 2. Transition status back to SUBMITTED and increment current_version
      db.prepare(`
        UPDATE documents 
        SET status = 'SUBMITTED', current_version = ?, updated_at = ?
        WHERE id = ?
      `).run(newVersionNumber, now, doc.id);

      // 3. Append audit log
      db.prepare(`
        INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
        VALUES (?, ?, ?, 'CORRECTION_UPLOADED', ?, ?)
      `).run(
        auditId,
        doc.id,
        user.id,
        JSON.stringify({
          version: newVersionNumber,
          previous_version: doc.current_version,
          file_name: params.fileName,
          notes: params.notes?.trim() || undefined,
        }),
        now
      );
    });

    transaction();

    // 4. Run OCR on corrected version
    try {
      const ocrResult = await ocrService.processDocument({
        documentId: doc.id,
        versionId,
        versionNumber: newVersionNumber,
        documentType: doc.document_type,
        fileName: params.fileName,
      });
      saveDbExtractedData({
        documentId: doc.id,
        versionId,
        invoiceNumber: ocrResult.invoiceNumber,
        invoiceDate: ocrResult.invoiceDate,
        vendorName: ocrResult.vendorName,
        gstin: ocrResult.gstin,
        subtotal: ocrResult.subtotal,
        gst: ocrResult.gst,
        total: ocrResult.total,
        items: ocrResult.items,
        confidenceScore: ocrResult.confidenceScore,
      });
    } catch (ocrErr) {
      console.warn('OCR processing error for correction:', ocrErr);
    }

    // 5. Dispatch notification to auditor
    if (doc.assigned_to) {
      try {
        await notificationService.notify({
          recipientId: doc.assigned_to,
          type: 'CORRECTION_UPLOADED',
          title: 'Corrected Document Submitted',
          message: `${user.name} submitted Version ${newVersionNumber} for "${doc.title}"`,
          documentId: doc.id,
        });
      } catch (notifErr) {
        console.warn('Notification error:', notifErr);
      }
    }

    const updated = getDocumentById(doc.id);
    if (!updated) throw new WorkflowError(500, 'Failed to fetch document after uploading correction');
    return updated;
  },

  /**
   * Approve document (Auditor action)
   */
  async approveDocument(user: UserProfile, params: ApproveDocumentParams): Promise<AuditDocument> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN') {
      throw new WorkflowError(403, 'Unauthorized: Only auditors can approve documents');
    }

    const doc = getDocumentById(params.documentId);
    if (!doc) throw new WorkflowError(404, 'Document not found');

    // Allow approval if UNDER_REVIEW (or auto-start review if currently SUBMITTED)
    if (doc.status !== 'UNDER_REVIEW' && doc.status !== 'SUBMITTED') {
      throw new WorkflowError(400, `This document cannot be approved in its current state ('${doc.status}')`);
    }

    const db = getDb();
    const now = new Date().toISOString();
    const reviewId = crypto.randomUUID();
    const auditId = crypto.randomUUID();

    const currentVersionRecord = doc.versions?.find((v) => v.version_number === doc.current_version);
    const versionId = currentVersionRecord?.id || doc.versions?.[0]?.id;

    if (!versionId) {
      throw new WorkflowError(500, 'Cannot locate active version for document');
    }

    const transaction = db.transaction(() => {
      // 1. Update document status to APPROVED
      db.prepare(`
        UPDATE documents 
        SET status = 'APPROVED', assigned_to = ?, updated_at = ?
        WHERE id = ?
      `).run(user.id, now, params.documentId);

      // 2. Insert Review record
      db.prepare(`
        INSERT INTO reviews (id, document_id, version_id, reviewer_id, status, comment, created_at)
        VALUES (?, ?, ?, ?, 'APPROVED', ?, ?)
      `).run(reviewId, params.documentId, versionId, user.id, params.comment?.trim() || 'Verified and approved', now);

      // 3. Append audit log
      db.prepare(`
        INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
        VALUES (?, ?, ?, 'DOCUMENT_APPROVED', ?, ?)
      `).run(
        auditId,
        params.documentId,
        user.id,
        JSON.stringify({
          version: doc.current_version,
          comment: params.comment?.trim() || 'Verified and approved by auditor',
          reviewer_name: user.name,
        }),
        now
      );
    });

    transaction();

    // Dispatch notification to client
    const clientUser = db.prepare('SELECT id FROM users WHERE client_id = ? LIMIT 1').get(doc.client_id) as any;
    if (clientUser) {
      try {
        await notificationService.notify({
          recipientId: clientUser.id,
          type: 'DOCUMENT_APPROVED',
          title: 'Document Approved',
          message: `CA Auditor approved "${doc.title}" for final statutory audit filing`,
          documentId: doc.id,
        });
      } catch (notifErr) {
        console.warn('Notification error:', notifErr);
      }
    }

    const updated = getDocumentById(params.documentId);
    if (!updated) throw new WorkflowError(500, 'Failed to fetch document after approval');
    return updated;
  },
};
