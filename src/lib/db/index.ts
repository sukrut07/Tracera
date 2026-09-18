import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  UserProfile,
  Client,
  AuditDocument,
  DocumentVersion,
  Review,
  AuditLog,
  DocumentStatus,
  DocumentType,
  AuditAction,
  DashboardStats,
  Role,
} from '@/types';

const DB_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DB_DIR, 'tracera.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Global DB instance
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company_name TEXT NOT NULL,
      financial_year TEXT NOT NULL DEFAULT '2024-25',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('CLIENT', 'AUDITOR', 'ADMIN')),
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      document_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'APPROVED')),
      current_version INTEGER NOT NULL DEFAULT 1,
      assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      file_type TEXT DEFAULT 'application/octet-stream',
      uploaded_by TEXT NOT NULL REFERENCES users(id),
      uploaded_at TEXT NOT NULL,
      notes TEXT,
      UNIQUE(document_id, version_number)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version_id TEXT NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
      reviewer_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL CHECK (status IN ('APPROVED', 'CORRECTION_REQUIRED')),
      comment TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      actor_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      document_id TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS extracted_document_data (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version_id TEXT NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
      invoice_number TEXT,
      invoice_date TEXT,
      vendor_name TEXT,
      gstin TEXT,
      subtotal REAL,
      gst REAL,
      total REAL,
      items_json TEXT DEFAULT '[]',
      confidence_score REAL DEFAULT 0.95,
      created_at TEXT NOT NULL,
      UNIQUE(document_id, version_id)
    );

    CREATE INDEX IF NOT EXISTS idx_docs_client ON documents(client_id);
    CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_docs_assigned ON documents(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_audit_doc ON audit_logs(document_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(recipient_id, read, created_at DESC);
  `);

  seedData(db);
}

function seedData(db: Database.Database) {
  const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
  if (clientCount.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const earlier1 = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const earlier2 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const earlier3 = new Date(Date.now() - 2 * 3600 * 1000).toISOString();

  // 1. Seed Clients
  const insertClient = db.prepare(`
    INSERT INTO clients (id, name, email, company_name, financial_year, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const client1Id = 'c1111111-1111-1111-1111-111111111111';
  const client2Id = 'c2222222-2222-2222-2222-222222222222';

  insertClient.run(client1Id, 'ABC Traders', 'contact@abctraders.com', 'ABC Traders Private Limited', '2024-25', earlier1, now);
  insertClient.run(client2Id, 'XYZ Enterprises', 'finance@xyzent.com', 'XYZ Enterprises LLP', '2024-25', earlier1, now);

  // 2. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, client_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const uClientId = 'u1111111-1111-1111-1111-111111111111';
  const uAuditorId = 'u2222222-2222-2222-2222-222222222222';
  const uAdminId = 'u3333333-3333-3333-3333-333333333333';

  insertUser.run(uClientId, 'ABC Traders (Client)', 'client@demo.com', 'CLIENT', client1Id, earlier1);
  insertUser.run(uAuditorId, 'Rahul Sharma', 'auditor@demo.com', 'AUDITOR', null, earlier1);
  insertUser.run(uAdminId, 'Managing Partner (Admin)', 'admin@demo.com', 'ADMIN', null, earlier1);

  // 3. Seed Documents for ABC Traders & XYZ Enterprises
  const insertDoc = db.prepare(`
    INSERT INTO documents (id, client_id, title, document_type, status, current_version, assigned_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVersion = db.prepare(`
    INSERT INTO document_versions (id, document_id, version_number, file_name, file_path, file_size, file_type, uploaded_by, uploaded_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, document_id, version_id, reviewer_id, status, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, document_id, actor_id, action, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // ABC Traders Doc 1: Bank Statement (APPROVED)
  const doc1Id = 'd1111111-1111-1111-1111-111111111111';
  const v1_1Id = 'v1111111-1111-1111-1111-111111111111';
  insertDoc.run(doc1Id, client1Id, 'Bank Statement - Q1 HDFC', 'BANK_STATEMENT', 'APPROVED', 1, uAuditorId, earlier2, earlier1);
  insertVersion.run(v1_1Id, doc1Id, 1, 'bank_statement_q1.pdf', '/sample-files/bank_statement_demo.txt', 124500, 'application/pdf', uClientId, earlier2, 'Original HDFC Q1 statement');
  insertReview.run('r1111111-1111-1111-1111-111111111111', doc1Id, v1_1Id, uAuditorId, 'APPROVED', 'Reconciled opening balance and bank ledger. All checks cleared.', earlier1);
  insertAudit.run('a1111111-1111-1111-1111-111111111111', doc1Id, uClientId, 'DOCUMENT_UPLOADED', JSON.stringify({ version: 1, file_name: 'bank_statement_q1.pdf' }), earlier2);
  insertAudit.run('a1111111-1111-1111-1111-111111111112', doc1Id, uAuditorId, 'DOCUMENT_ASSIGNED', JSON.stringify({ assigned_to_name: 'Rahul Sharma' }), earlier2);
  insertAudit.run('a1111111-1111-1111-1111-111111111113', doc1Id, uAuditorId, 'REVIEW_STARTED', JSON.stringify({ reviewer_name: 'Rahul Sharma' }), earlier1);
  insertAudit.run('a1111111-1111-1111-1111-111111111114', doc1Id, uAuditorId, 'DOCUMENT_APPROVED', JSON.stringify({ version: 1, comment: 'Reconciled opening balance and bank ledger. All checks cleared.' }), earlier1);

  // ABC Traders Doc 2: Purchase Register (CORRECTION_REQUIRED)
  const doc2Id = 'd2222222-2222-2222-2222-222222222222';
  const v2_1Id = 'v2222222-2222-2222-2222-222222222221';
  insertDoc.run(doc2Id, client1Id, 'Purchase Register - April 2024', 'PURCHASE_REGISTER', 'CORRECTION_REQUIRED', 1, uAuditorId, earlier2, earlier3);
  insertVersion.run(v2_1Id, doc2Id, 1, 'purchase_register_apr.xlsx', '/sample-files/purchase_register_demo.csv', 48900, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uClientId, earlier2, 'Initial monthly purchase dump');
  insertReview.run('r2222222-2222-2222-2222-222222222221', doc2Id, v2_1Id, uAuditorId, 'CORRECTION_REQUIRED', 'Invoice INV-204 is missing from the purchase register. Please reconcile with GSTR-2B and re-upload.', earlier3);
  insertAudit.run('a2222222-2222-2222-2222-222222222221', doc2Id, uClientId, 'DOCUMENT_UPLOADED', JSON.stringify({ version: 1, file_name: 'purchase_register_apr.xlsx' }), earlier2);
  insertAudit.run('a2222222-2222-2222-2222-222222222222', doc2Id, uAuditorId, 'DOCUMENT_ASSIGNED', JSON.stringify({ assigned_to_name: 'Rahul Sharma' }), earlier2);
  insertAudit.run('a2222222-2222-2222-2222-222222222223', doc2Id, uAuditorId, 'REVIEW_STARTED', JSON.stringify({ reviewer_name: 'Rahul Sharma' }), earlier3);
  insertAudit.run('a2222222-2222-2222-2222-222222222224', doc2Id, uAuditorId, 'CORRECTION_REQUESTED', JSON.stringify({ version: 1, reason: 'Invoice INV-204 is missing from the purchase register. Please reconcile with GSTR-2B and re-upload.', priority: 'HIGH' }), earlier3);

  // ABC Traders Doc 3: GST Invoice (SUBMITTED)
  const doc3Id = 'd3333333-3333-3333-3333-333333333333';
  const v3_1Id = 'v3333333-3333-3333-3333-333333333331';
  insertDoc.run(doc3Id, client1Id, 'GST Invoice - Batch 04', 'GST_DOCUMENT', 'SUBMITTED', 1, uAuditorId, earlier3, earlier3);
  insertVersion.run(v3_1Id, doc3Id, 1, 'gst_invoice_batch_04.pdf', '/sample-files/bank_statement_demo.txt', 230000, 'application/pdf', uClientId, earlier3, 'Quarterly GST supporting invoices');
  insertAudit.run('a3333333-3333-3333-3333-333333333331', doc3Id, uClientId, 'DOCUMENT_UPLOADED', JSON.stringify({ version: 1, file_name: 'gst_invoice_batch_04.pdf' }), earlier3);
  insertAudit.run('a3333333-3333-3333-3333-333333333332', doc3Id, uAuditorId, 'DOCUMENT_ASSIGNED', JSON.stringify({ assigned_to_name: 'Rahul Sharma' }), earlier3);

  // XYZ Enterprises Doc 4: Purchase Register (SUBMITTED)
  const doc4Id = 'd4444444-4444-4444-4444-444444444444';
  const v4_1Id = 'v4444444-4444-4444-4444-444444444441';
  insertDoc.run(doc4Id, client2Id, 'Purchase Register - Q1 Consolidated', 'PURCHASE_REGISTER', 'SUBMITTED', 1, uAuditorId, earlier3, earlier3);
  insertVersion.run(v4_1Id, doc4Id, 1, 'xyz_purchases_q1.xlsx', '/sample-files/purchase_register_demo.csv', 89000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uClientId, earlier3, 'Q1 summary');
  insertAudit.run('a4444444-4444-4444-4444-444444444441', doc4Id, uClientId, 'DOCUMENT_UPLOADED', JSON.stringify({ version: 1, file_name: 'xyz_purchases_q1.xlsx' }), earlier3);
  insertAudit.run('a4444444-4444-4444-4444-444444444442', doc4Id, uAuditorId, 'DOCUMENT_ASSIGNED', JSON.stringify({ assigned_to_name: 'Rahul Sharma' }), earlier3);

  // XYZ Enterprises Doc 5: GST Invoice (APPROVED)
  const doc5Id = 'd5555555-5555-5555-5555-555555555555';
  const v5_1Id = 'v5555555-5555-5555-5555-555555555551';
  insertDoc.run(doc5Id, client2Id, 'GST Invoice - Machinery Import', 'INVOICE', 'APPROVED', 1, uAuditorId, earlier1, now);
  insertVersion.run(v5_1Id, doc5Id, 1, 'customs_machinery_inv.pdf', '/sample-files/bank_statement_demo.txt', 540000, 'application/pdf', uClientId, earlier1, 'Capital goods IGST credit claim');
  insertReview.run('r5555555-5555-5555-5555-555555555551', doc5Id, v5_1Id, uAuditorId, 'APPROVED', 'Bill of entry and custom duty receipt verified against ICEGATE.', now);
  insertAudit.run('a5555555-5555-5555-5555-555555555551', doc5Id, uClientId, 'DOCUMENT_UPLOADED', JSON.stringify({ version: 1, file_name: 'customs_machinery_inv.pdf' }), earlier1);
  insertAudit.run('a5555555-5555-5555-5555-555555555552', doc5Id, uAuditorId, 'REVIEW_STARTED', JSON.stringify({ reviewer_name: 'Rahul Sharma' }), now);
  insertAudit.run('a5555555-5555-5555-5555-555555555553', doc5Id, uAuditorId, 'DOCUMENT_APPROVED', JSON.stringify({ version: 1, comment: 'Bill of entry and custom duty receipt verified against ICEGATE.' }), now);
}

// ================= Repository Access Methods =================

export function getUserByEmail(email: string): UserProfile | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email) as UserProfile | undefined;
  return row || null;
}

export function getUserById(id: string): UserProfile | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserProfile | undefined;
  return row || null;
}

export function getClients(): Client[] {
  const db = getDb();
  return db.prepare('SELECT * FROM clients ORDER BY name ASC').all() as Client[];
}

export function getClientById(id: string): Client | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
  return row || null;
}

export function getDocuments(filters?: {
  clientId?: string;
  status?: DocumentStatus;
  documentType?: DocumentType;
  search?: string;
}): AuditDocument[] {
  const db = getDb();
  let query = `
    SELECT 
      d.*,
      c.name as client_name,
      c.company_name as client_company_name,
      c.financial_year as client_financial_year,
      u.name as assigned_to_name,
      u.email as assigned_to_email
    FROM documents d
    JOIN clients c ON d.client_id = c.id
    LEFT JOIN users u ON d.assigned_to = u.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.clientId) {
    query += ' AND d.client_id = ?';
    params.push(filters.clientId);
  }

  if (filters?.status) {
    query += ' AND d.status = ?';
    params.push(filters.status);
  }

  if (filters?.documentType) {
    query += ' AND d.document_type = ?';
    params.push(filters.documentType);
  }

  if (filters?.search) {
    query += ' AND (d.title LIKE ? OR c.name LIKE ? OR c.company_name LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY d.updated_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((row) => ({
    id: row.id,
    client_id: row.client_id,
    title: row.title,
    document_type: row.document_type as DocumentType,
    status: row.status as DocumentStatus,
    current_version: row.current_version,
    assigned_to: row.assigned_to,
    created_at: row.created_at,
    updated_at: row.updated_at,
    client: {
      id: row.client_id,
      name: row.client_name,
      email: '',
      company_name: row.client_company_name,
      financial_year: row.client_financial_year,
      created_at: '',
      updated_at: '',
    },
    assigned_auditor: row.assigned_to
      ? {
          id: row.assigned_to,
          name: row.assigned_to_name,
          email: row.assigned_to_email,
          role: 'AUDITOR',
          client_id: null,
          created_at: '',
        }
      : undefined,
  }));
}

export function getDocumentById(id: string): AuditDocument | null {
  const db = getDb();
  const docRow = db.prepare(`
    SELECT 
      d.*,
      c.name as client_name,
      c.company_name as client_company_name,
      c.financial_year as client_financial_year,
      u.name as assigned_to_name,
      u.email as assigned_to_email
    FROM documents d
    JOIN clients c ON d.client_id = c.id
    LEFT JOIN users u ON d.assigned_to = u.id
    WHERE d.id = ?
  `).get(id) as any;

  if (!docRow) return null;

  // Load versions
  const versionRows = db.prepare(`
    SELECT v.*, u.name as uploader_name, u.email as uploader_email, u.role as uploader_role
    FROM document_versions v
    LEFT JOIN users u ON v.uploaded_by = u.id
    WHERE v.document_id = ?
    ORDER BY v.version_number DESC
  `).all(id) as any[];

  const versions: DocumentVersion[] = versionRows.map((v) => ({
    id: v.id,
    document_id: v.document_id,
    version_number: v.version_number,
    file_name: v.file_name,
    file_path: v.file_path,
    file_size: v.file_size,
    file_type: v.file_type,
    uploaded_by: v.uploaded_by,
    uploaded_at: v.uploaded_at,
    notes: v.notes,
    uploader: {
      id: v.uploaded_by,
      name: v.uploader_name,
      email: v.uploader_email,
      role: v.uploader_role,
      client_id: null,
      created_at: '',
    },
  }));

  // Load reviews
  const reviewRows = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.email as reviewer_email, u.role as reviewer_role
    FROM reviews r
    LEFT JOIN users u ON r.reviewer_id = u.id
    WHERE r.document_id = ?
    ORDER BY r.created_at DESC
  `).all(id) as any[];

  const reviews: Review[] = reviewRows.map((r) => ({
    id: r.id,
    document_id: r.document_id,
    version_id: r.version_id,
    reviewer_id: r.reviewer_id,
    status: r.status,
    comment: r.comment,
    created_at: r.created_at,
    reviewer: {
      id: r.reviewer_id,
      name: r.reviewer_name,
      email: r.reviewer_email,
      role: r.reviewer_role,
      client_id: null,
      created_at: '',
    },
  }));

  // Load audit logs (chronological)
  const auditRows = db.prepare(`
    SELECT a.*, u.name as actor_name, u.role as actor_role
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.document_id = ?
    ORDER BY a.created_at ASC
  `).all(id) as any[];

  const audit_logs: AuditLog[] = auditRows.map((a) => {
    let meta = {};
    try {
      meta = JSON.parse(a.metadata);
    } catch {
      meta = {};
    }
    return {
      id: a.id,
      document_id: a.document_id,
      actor_id: a.actor_id,
      actor_name: a.actor_name,
      actor_role: a.actor_role,
      action: a.action as AuditAction,
      metadata: meta,
      created_at: a.created_at,
    };
  });

  return {
    id: docRow.id,
    client_id: docRow.client_id,
    title: docRow.title,
    document_type: docRow.document_type as DocumentType,
    status: docRow.status as DocumentStatus,
    current_version: docRow.current_version,
    assigned_to: docRow.assigned_to,
    created_at: docRow.created_at,
    updated_at: docRow.updated_at,
    client: {
      id: docRow.client_id,
      name: docRow.client_name,
      email: '',
      company_name: docRow.client_company_name,
      financial_year: docRow.client_financial_year,
      created_at: '',
      updated_at: '',
    },
    assigned_auditor: docRow.assigned_to
      ? {
          id: docRow.assigned_to,
          name: docRow.assigned_to_name,
          email: docRow.assigned_to_email,
          role: 'AUDITOR',
          client_id: null,
          created_at: '',
        }
      : undefined,
    versions,
    reviews,
    audit_logs,
    current_review: reviews[0] || undefined,
  };
}

export function getDashboardStats(role: Role, clientId?: string | null): DashboardStats {
  const db = getDb();

  if (role === 'CLIENT' && clientId) {
    const total = (db.prepare('SELECT COUNT(*) as c FROM documents WHERE client_id = ?').get(clientId) as any).c;
    const pending = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE client_id = ? AND status IN ('SUBMITTED', 'UNDER_REVIEW')").get(clientId) as any).c;
    const underReview = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE client_id = ? AND status = 'UNDER_REVIEW'").get(clientId) as any).c;
    const correction = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE client_id = ? AND status = 'CORRECTION_REQUIRED'").get(clientId) as any).c;
    const approved = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE client_id = ? AND status = 'APPROVED'").get(clientId) as any).c;

    return {
      total_documents: total,
      pending_reviews: pending,
      under_review: underReview,
      corrections_required: correction,
      approved_today: approved,
      approved_total: approved,
    };
  } else {
    // Auditor or Admin stats
    const total = (db.prepare('SELECT COUNT(*) as c FROM documents').get() as any).c;
    const pending = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE status = 'SUBMITTED'").get() as any).c;
    const underReview = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE status = 'UNDER_REVIEW'").get() as any).c;
    const correction = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE status = 'CORRECTION_REQUIRED'").get() as any).c;
    const approved = (db.prepare("SELECT COUNT(*) as c FROM documents WHERE status = 'APPROVED'").get() as any).c;

    return {
      total_documents: total,
      pending_reviews: pending,
      under_review: underReview,
      corrections_required: correction,
      approved_today: approved,
      approved_total: approved,
    };
  }
}

// Notifications Repository
export function createDbNotification(params: {
  id?: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  documentId?: string;
}) {
  const db = getDb();
  const id = params.id || require('crypto').randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, recipient_id, type, title, message, document_id, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, params.recipientId, params.type, params.title, params.message, params.documentId || null, now);
}

export function getDbNotifications(recipientId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM notifications 
    WHERE recipient_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `).all(recipientId) as any[];
}

export function markDbNotificationRead(id: string) {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
}

// Extracted OCR Data Repository
export function saveDbExtractedData(data: {
  documentId: string;
  versionId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  vendorName?: string;
  gstin?: string;
  subtotal?: number;
  gst?: number;
  total?: number;
  items?: any[];
  confidenceScore?: number;
}) {
  const db = getDb();
  const id = require('crypto').randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO extracted_document_data 
    (id, document_id, version_id, invoice_number, invoice_date, vendor_name, gstin, subtotal, gst, total, items_json, confidence_score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.documentId,
    data.versionId,
    data.invoiceNumber || null,
    data.invoiceDate || null,
    data.vendorName || null,
    data.gstin || null,
    data.subtotal || null,
    data.gst || null,
    data.total || null,
    JSON.stringify(data.items || []),
    data.confidenceScore || 0.95,
    now
  );
}

export function getDbExtractedData(versionId: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM extracted_document_data WHERE version_id = ?').get(versionId) as any;
  if (!row) return null;
  let items = [];
  try {
    items = JSON.parse(row.items_json);
  } catch {
    items = [];
  }
  return {
    ...row,
    items,
  };
}

export function resetDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM reviews;
    DELETE FROM document_versions;
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM extracted_document_data;
    DELETE FROM users;
    DELETE FROM clients;
  `);
  seedData(db);
}

export function clearDocumentsOnly() {
  const db = getDb();
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM reviews;
    DELETE FROM document_versions;
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM extracted_document_data;
  `);
}

