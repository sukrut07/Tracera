import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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
  Engagement,
  EngagementStatus,
  EngagementStage,
  EngagementChecklistItem,
  EngagementTask,
  EngagementApproval,
  EngagementServiceType,
  TaskStatus,
  TaskPriority,
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
      email TEXT,
      company_name TEXT NOT NULL,
      financial_year TEXT NOT NULL DEFAULT '2024-25',
      gstin TEXT,
      pan TEXT,
      phone TEXT,
      address TEXT,
      industry TEXT,
      assigned_auditor TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('CLIENT', 'AUDITOR', 'ADMIN', 'PARTNER')),
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      organization TEXT,
      phone TEXT,
      firebase_uid TEXT,
      password_hash TEXT,
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
      document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
      engagement_id TEXT,
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

    -- CA Engagements Master Table
    CREATE TABLE IF NOT EXISTS engagements (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      service_type TEXT NOT NULL,
      financial_year TEXT NOT NULL,
      status TEXT NOT NULL,
      current_stage_index INTEGER NOT NULL DEFAULT 0,
      total_stages INTEGER NOT NULL DEFAULT 10,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      assigned_partner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      assigned_partner_name TEXT,
      assigned_manager_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      assigned_manager_name TEXT,
      assigned_staff_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      assigned_staff_name TEXT,
      billing_amount REAL NOT NULL DEFAULT 0,
      billing_gst REAL NOT NULL DEFAULT 0,
      billing_total REAL NOT NULL DEFAULT 0,
      billing_status TEXT NOT NULL DEFAULT 'PENDING',
      payment_reference TEXT,
      paid_at TEXT,
      closure_id TEXT,
      closed_at TEXT,
      closed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      closed_by_name TEXT,
      closure_summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Engagement Operational Stages
    CREATE TABLE IF NOT EXISTS engagement_stages (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      stage_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      owner_name TEXT,
      due_date TEXT,
      completed_at TEXT,
      notes TEXT,
      UNIQUE(engagement_id, stage_number)
    );

    -- Engagement Document Checklist Items
    CREATE TABLE IF NOT EXISTS engagement_checklists (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'REQUIRED',
      document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      request_message TEXT,
      requested_at TEXT,
      due_date TEXT
    );

    -- Engagement Work Items / Tasks
    CREATE TABLE IF NOT EXISTS engagement_tasks (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      stage_number INTEGER,
      assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
      assigned_to_name TEXT,
      status TEXT NOT NULL DEFAULT 'TODO',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      due_date TEXT,
      blocker_reason TEXT,
      blocked_by TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Multi-tier Maker-Checker Approvals
    CREATE TABLE IF NOT EXISTS engagement_approvals (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      role_gate TEXT NOT NULL,
      approver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      approver_name TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      remarks TEXT,
      approved_at TEXT,
      UNIQUE(engagement_id, role_gate)
    );

    -- Issues / Blockers per engagement
    CREATE TABLE IF NOT EXISTS engagement_issues (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      owner_name TEXT,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'OPEN',
      blocked_by_client INTEGER DEFAULT 0,
      due_date TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Billing / Payment Records
    CREATE TABLE IF NOT EXISTS billing_records (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      invoice_number TEXT,
      fee REAL NOT NULL DEFAULT 0,
      gst REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      payment_method TEXT,
      payment_reference TEXT,
      recorded_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      recorded_by_name TEXT,
      recorded_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Auditor document requests (multi-channel)
    CREATE TABLE IF NOT EXISTS document_requests (
      id TEXT PRIMARY KEY,
      engagement_id TEXT REFERENCES engagements(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
      description TEXT,
      requested_by_id TEXT NOT NULL REFERENCES users(id),
      requested_by_name TEXT,
      requested_from_id TEXT REFERENCES users(id),
      channels TEXT NOT NULL DEFAULT '["TRACERA"]',
      status TEXT NOT NULL DEFAULT 'REQUESTED',
      due_date TEXT,
      fulfilled_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_docs_client ON documents(client_id);
    CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_docs_assigned ON documents(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_audit_doc ON audit_logs(document_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(recipient_id, read, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_eng_client ON engagements(client_id);
    CREATE INDEX IF NOT EXISTS idx_eng_status ON engagements(status);
    CREATE INDEX IF NOT EXISTS idx_eng_stages ON engagement_stages(engagement_id, stage_number);
    CREATE INDEX IF NOT EXISTS idx_eng_checklist ON engagement_checklists(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_eng_tasks ON engagement_tasks(engagement_id, status);
    CREATE INDEX IF NOT EXISTS idx_eng_approvals ON engagement_approvals(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_issues_eng ON engagement_issues(engagement_id, status);
    CREATE INDEX IF NOT EXISTS idx_billing_eng ON billing_records(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_doc_requests ON document_requests(engagement_id);
  `);

  // Safe migrations for columns
  try {
    const docCols = db.prepare('PRAGMA table_info(documents)').all() as { name: string }[];
    if (!docCols.some((c) => c.name === 'engagement_id')) {
      db.exec('ALTER TABLE documents ADD COLUMN engagement_id TEXT REFERENCES engagements(id) ON DELETE SET NULL');
    }

    const notifCols = db.prepare('PRAGMA table_info(notifications)').all() as { name: string }[];
    if (!notifCols.some((c) => c.name === 'engagement_id')) {
      db.exec('ALTER TABLE notifications ADD COLUMN engagement_id TEXT REFERENCES engagements(id) ON DELETE CASCADE');
    }

    const auditCols = db.prepare('PRAGMA table_info(audit_logs)').all() as any[];
    const docIdCol = auditCols.find((c) => c.name === 'document_id');
    const hasEngCol = auditCols.some((c) => c.name === 'engagement_id');

    // If document_id was NOT NULL, migrate table to allow NULL document_id for engagement events
    if (docIdCol && docIdCol.notnull === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs_temp (
          id TEXT PRIMARY KEY,
          document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
          engagement_id TEXT,
          actor_id TEXT NOT NULL REFERENCES users(id),
          action TEXT NOT NULL,
          metadata TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL
        );
        INSERT INTO audit_logs_temp (id, document_id, engagement_id, actor_id, action, metadata, created_at)
          SELECT id, document_id, NULL, actor_id, action, metadata, created_at FROM audit_logs;
        DROP TABLE audit_logs;
        ALTER TABLE audit_logs_temp RENAME TO audit_logs;
        CREATE INDEX IF NOT EXISTS idx_audit_doc ON audit_logs(document_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_audit_eng ON audit_logs(engagement_id, created_at ASC);
      `);
    } else if (!hasEngCol) {
      db.exec('ALTER TABLE audit_logs ADD COLUMN engagement_id TEXT');
      db.exec('CREATE INDEX IF NOT EXISTS idx_audit_eng ON audit_logs(engagement_id, created_at ASC)');
    }
  } catch (err) {
    console.warn('DB column check notice:', err);
  }

  // Safe column additions
  safeAddColumns(db);
  seedSystemUsers(db);
}

function safeAddColumns(db: Database.Database) {
  const ensureCol = (table: string, col: string, def: string) => {
    try {
      const cols = (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
      if (!cols.includes(col)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    } catch {}
  };

  ensureCol('clients', 'gstin', 'TEXT');
  ensureCol('clients', 'pan', 'TEXT');
  ensureCol('clients', 'phone', 'TEXT');
  ensureCol('clients', 'address', 'TEXT');
  ensureCol('clients', 'industry', 'TEXT');
  ensureCol('clients', 'assigned_auditor', 'TEXT');
  ensureCol('clients', 'status', "TEXT NOT NULL DEFAULT 'ACTIVE'");

  ensureCol('users', 'organization', 'TEXT');
  ensureCol('users', 'phone', 'TEXT');
  ensureCol('users', 'firebase_uid', 'TEXT');
  ensureCol('users', 'password_hash', 'TEXT');

  ensureCol('documents', 'engagement_id', 'TEXT');
  ensureCol('documents', 'source_channel', "TEXT DEFAULT 'PORTAL'");
  ensureCol('documents', 'description', 'TEXT');

  ensureCol('audit_logs', 'document_id', 'TEXT');
  ensureCol('audit_logs', 'engagement_id', 'TEXT');
  ensureCol('audit_logs', 'actor_name', 'TEXT');
  ensureCol('audit_logs', 'actor_role', 'TEXT');

  ensureCol('notifications', 'engagement_id', 'TEXT');
  ensureCol('notifications', 'link_url', 'TEXT');
}

/**
 * Seeds ONLY the 4 demo auth accounts (no business data).
 * Business data (clients, engagements, documents) is created exclusively
 * through the UI. Runs only when the users table is empty.
 */
function seedSystemUsers(db: Database.Database) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already seeded or user has created accounts
  }

  const now = new Date().toISOString();
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, client_id, organization, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // These are SYSTEM accounts only — zero business data attached
  insertUser.run('sys-client-001', 'Client Portal', 'client@demo.com', 'CLIENT', null, 'Demo Organization', now);
  insertUser.run('sys-auditor-001', 'Auditor', 'auditor@demo.com', 'AUDITOR', null, 'TRACERA Firm', now);
  insertUser.run('sys-partner-001', 'Partner', 'partner@demo.com', 'PARTNER', null, 'TRACERA Firm', now);
  insertUser.run('sys-admin-001', 'Admin', 'admin@demo.com', 'ADMIN', null, 'TRACERA Firm', now);
}

// Kept as named stub so old references compile — business logic now deleted
function seedData(_db: Database.Database) { /* removed — no fake business data */ }
function seedEngagements(_db: Database.Database) { /* removed — no fake business data */ }

// Placeholder to avoid breaking the old call-site if it exists anywhere
function _unusedSeedRef() {
  // Previously contained ABC Traders, XYZ Enterprises, fake documents, etc.
  // All removed per TRACERA functional overhaul — 18 Sep 2026
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

export function createClient(data: Partial<Client> & { name: string; company_name: string; financial_year: string }): Client {
  const db = getDb();
  const id = data.id || crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO clients (id, name, email, company_name, gstin, pan, financial_year, phone, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name.trim(),
    data.email?.trim() || null,
    data.company_name.trim(),
    data.gstin?.trim() || null,
    data.pan?.trim() || null,
    data.financial_year,
    data.phone?.trim() || null,
    data.address?.trim() || null,
    now,
    now
  );
  return getClientById(id)!;
}

export function getDocuments(filters?: {
  clientId?: string;
  status?: DocumentStatus;
  documentType?: DocumentType;
  search?: string;
  engagementId?: string;
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

  if (filters?.engagementId) {
    query += ' AND d.engagement_id = ?';
    params.push(filters.engagementId);
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
    engagement_id: row.engagement_id || null,
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
      engagement_id: a.engagement_id || undefined,
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
    engagement_id: docRow.engagement_id || null,
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
  engagementId?: string;
}) {
  const db = getDb();
  const id = params.id || crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, recipient_id, type, title, message, document_id, engagement_id, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, params.recipientId, params.type, params.title, params.message, params.documentId || null, params.engagementId || null, now);
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
  const id = crypto.randomUUID();
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

// ================= CA Engagements Repository =================

export function getAllEngagements(filters?: {
  clientId?: string;
  status?: EngagementStatus;
  serviceType?: string;
  search?: string;
}): Engagement[] {
  const db = getDb();
  let query = `
    SELECT e.*, c.name as client_name, c.email as client_email, c.company_name as client_company_name, c.financial_year as client_financial_year
    FROM engagements e
    JOIN clients c ON e.client_id = c.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.clientId) {
    query += ' AND e.client_id = ?';
    params.push(filters.clientId);
  }
  if (filters?.status) {
    query += ' AND e.status = ?';
    params.push(filters.status);
  }
  if (filters?.serviceType) {
    query += ' AND e.service_type = ?';
    params.push(filters.serviceType);
  }
  if (filters?.search) {
    query += ' AND (e.title LIKE ? OR c.name LIKE ? OR c.company_name LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY e.updated_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((row) => ({
    id: row.id,
    client_id: row.client_id,
    title: row.title,
    service_type: row.service_type as EngagementServiceType,
    financial_year: row.financial_year,
    status: row.status as EngagementStatus,
    current_stage_index: row.current_stage_index,
    total_stages: row.total_stages,
    progress_percent: row.progress_percent,
    due_date: row.due_date,
    assigned_partner_id: row.assigned_partner_id,
    assigned_partner_name: row.assigned_partner_name,
    assigned_manager_id: row.assigned_manager_id,
    assigned_manager_name: row.assigned_manager_name,
    assigned_staff_id: row.assigned_staff_id,
    assigned_staff_name: row.assigned_staff_name,
    billing_amount: row.billing_amount,
    billing_gst: row.billing_gst,
    billing_total: row.billing_total,
    billing_status: row.billing_status,
    payment_reference: row.payment_reference,
    paid_at: row.paid_at,
    closure_id: row.closure_id,
    closed_at: row.closed_at,
    closed_by_id: row.closed_by_id,
    closed_by_name: row.closed_by_name,
    closure_summary: row.closure_summary,
    created_at: row.created_at,
    updated_at: row.updated_at,
    client: {
      id: row.client_id,
      name: row.client_name,
      email: row.client_email,
      company_name: row.client_company_name,
      financial_year: row.client_financial_year,
      created_at: '',
      updated_at: '',
    },
  }));
}

export function getEngagementById(id: string): Engagement | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT e.*, c.name as client_name, c.email as client_email, c.company_name as client_company_name, c.financial_year as client_financial_year
    FROM engagements e
    JOIN clients c ON e.client_id = c.id
    WHERE e.id = ?
  `).get(id) as any;

  if (!row) return null;

  const stages = db.prepare(`
    SELECT * FROM engagement_stages WHERE engagement_id = ? ORDER BY stage_number ASC
  `).all(id) as EngagementStage[];

  const checklistRows = db.prepare(`
    SELECT c.*, d.title as doc_title, d.status as doc_status, d.current_version as doc_version
    FROM engagement_checklists c
    LEFT JOIN documents d ON c.document_id = d.id
    WHERE c.engagement_id = ?
    ORDER BY c.rowid ASC
  `).all(id) as any[];

  const checklists: EngagementChecklistItem[] = checklistRows.map((c) => ({
    id: c.id,
    engagement_id: c.engagement_id,
    title: c.title,
    category: c.category,
    is_mandatory: Boolean(c.is_mandatory),
    status: c.status,
    document_id: c.document_id,
    request_message: c.request_message,
    requested_at: c.requested_at,
    due_date: c.due_date,
    matched_document: c.document_id
      ? {
          id: c.document_id,
          client_id: row.client_id,
          title: c.doc_title || c.title,
          status: c.doc_status || 'SUBMITTED',
          current_version: c.doc_version || 1,
          document_type: 'OTHER',
          assigned_to: null,
          created_at: '',
          updated_at: '',
        }
      : undefined,
  }));

  const tasks = db.prepare(`
    SELECT * FROM engagement_tasks WHERE engagement_id = ? ORDER BY created_at DESC
  `).all(id) as EngagementTask[];

  const approvals = db.prepare(`
    SELECT * FROM engagement_approvals 
    WHERE engagement_id = ? 
    ORDER BY CASE role_gate WHEN 'PERFORMER' THEN 1 WHEN 'REVIEWER' THEN 2 WHEN 'PARTNER' THEN 3 END ASC
  `).all(id) as EngagementApproval[];

  // Linked documents (both explicitly tagged or matched via checklist)
  const documents = getDocuments({ clientId: row.client_id }).filter(
    (d) => d.engagement_id === id || checklists.some((c) => c.document_id === d.id)
  );

  // Unified Audit Trail for this engagement
  const auditLogs = getEngagementAuditLogs(id);

  return {
    id: row.id,
    client_id: row.client_id,
    title: row.title,
    service_type: row.service_type as EngagementServiceType,
    financial_year: row.financial_year,
    status: row.status as EngagementStatus,
    current_stage_index: row.current_stage_index,
    total_stages: row.total_stages,
    progress_percent: row.progress_percent,
    due_date: row.due_date,
    assigned_partner_id: row.assigned_partner_id,
    assigned_partner_name: row.assigned_partner_name,
    assigned_manager_id: row.assigned_manager_id,
    assigned_manager_name: row.assigned_manager_name,
    assigned_staff_id: row.assigned_staff_id,
    assigned_staff_name: row.assigned_staff_name,
    billing_amount: row.billing_amount,
    billing_gst: row.billing_gst,
    billing_total: row.billing_total,
    billing_status: row.billing_status,
    payment_reference: row.payment_reference,
    paid_at: row.paid_at,
    closure_id: row.closure_id,
    closed_at: row.closed_at,
    closed_by_id: row.closed_by_id,
    closed_by_name: row.closed_by_name,
    closure_summary: row.closure_summary,
    created_at: row.created_at,
    updated_at: row.updated_at,
    client: {
      id: row.client_id,
      name: row.client_name,
      email: row.client_email,
      company_name: row.client_company_name,
      financial_year: row.client_financial_year,
      created_at: '',
      updated_at: '',
    },
    stages,
    checklists,
    tasks,
    approvals,
    documents,
    audit_logs: auditLogs,
    issues: (db.prepare('SELECT * FROM engagement_issues WHERE engagement_id = ? ORDER BY created_at DESC').all(id) as any[]).map((i) => ({
      ...i,
      blocked_by_client: Boolean(i.blocked_by_client),
    })),
    billing_records: db.prepare('SELECT * FROM billing_records WHERE engagement_id = ? ORDER BY created_at DESC').all(id) as any[],
    document_requests: (db.prepare('SELECT * FROM document_requests WHERE engagement_id = ? ORDER BY created_at DESC').all(id) as any[]).map((r) => {
      let channels = ['TRACERA'];
      try { channels = JSON.parse(r.channels); } catch {}
      return { ...r, channels };
    }),
  };
}

export function createDbEngagement(data: Partial<Engagement>): Engagement {
  const db = getDb();
  const id = data.id || `eng-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO engagements (
      id, client_id, title, service_type, financial_year, status,
      current_stage_index, total_stages, progress_percent, due_date,
      assigned_partner_id, assigned_partner_name,
      assigned_manager_id, assigned_manager_name,
      assigned_staff_id, assigned_staff_name,
      billing_amount, billing_gst, billing_total, billing_status,
      payment_reference, paid_at,
      closure_id, closed_at, closed_by_id, closed_by_name, closure_summary,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
  `).run(
    id,
    data.client_id,
    data.title,
    data.service_type || 'STATUTORY_AUDIT',
    data.financial_year || '2025-26',
    data.status || 'PLANNING',
    data.current_stage_index || 0,
    data.total_stages || 10,
    data.progress_percent || 0,
    data.due_date || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    data.assigned_partner_id || null,
    data.assigned_partner_name || null,
    data.assigned_manager_id || null,
    data.assigned_manager_name || null,
    data.assigned_staff_id || null,
    data.assigned_staff_name || null,
    data.billing_amount || 0,
    data.billing_gst || 0,
    data.billing_total || 0,
    data.billing_status || 'PENDING',
    data.payment_reference || null,
    data.paid_at || null,
    data.closure_id || null,
    data.closed_at || null,
    data.closed_by_id || null,
    data.closed_by_name || null,
    data.closure_summary || null,
    now,
    now
  );

  return getEngagementById(id)!;
}

export function updateDbEngagement(id: string, updates: Partial<Engagement>): Engagement | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  const allowedKeys: (keyof Engagement)[] = [
    'title',
    'status',
    'current_stage_index',
    'total_stages',
    'progress_percent',
    'due_date',
    'assigned_partner_id',
    'assigned_partner_name',
    'assigned_manager_id',
    'assigned_manager_name',
    'assigned_staff_id',
    'assigned_staff_name',
    'billing_amount',
    'billing_gst',
    'billing_total',
    'billing_status',
    'payment_reference',
    'paid_at',
    'closure_id',
    'closed_at',
    'closed_by_id',
    'closed_by_name',
    'closure_summary',
  ];

  for (const key of allowedKeys) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return getEngagementById(id);
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE engagements SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getEngagementById(id);
}

export function getEngagementStages(engagementId: string): EngagementStage[] {
  const db = getDb();
  return db.prepare('SELECT * FROM engagement_stages WHERE engagement_id = ? ORDER BY stage_number ASC').all(engagementId) as EngagementStage[];
}

export function updateEngagementStage(
  engagementId: string,
  stageNumber: number,
  updates: Partial<EngagementStage>
): EngagementStage | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.completed_at !== undefined) {
    fields.push('completed_at = ?');
    values.push(updates.completed_at);
  }
  if (updates.owner_id !== undefined) {
    fields.push('owner_id = ?');
    values.push(updates.owner_id);
  }
  if (updates.owner_name !== undefined) {
    fields.push('owner_name = ?');
    values.push(updates.owner_name);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (fields.length > 0) {
    values.push(engagementId, stageNumber);
    db.prepare(`UPDATE engagement_stages SET ${fields.join(', ')} WHERE engagement_id = ? AND stage_number = ?`).run(...values);
  }

  return db.prepare('SELECT * FROM engagement_stages WHERE engagement_id = ? AND stage_number = ?').get(engagementId, stageNumber) as EngagementStage || null;
}

export function getEngagementChecklist(engagementId: string): EngagementChecklistItem[] {
  const db = getDb();
  return db.prepare('SELECT * FROM engagement_checklists WHERE engagement_id = ? ORDER BY rowid ASC').all(engagementId) as EngagementChecklistItem[];
}

export function updateEngagementChecklistItem(
  itemId: string,
  updates: Partial<EngagementChecklistItem>
): EngagementChecklistItem | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.document_id !== undefined) {
    fields.push('document_id = ?');
    values.push(updates.document_id);
  }
  if (updates.request_message !== undefined) {
    fields.push('request_message = ?');
    values.push(updates.request_message);
  }
  if (updates.requested_at !== undefined) {
    fields.push('requested_at = ?');
    values.push(updates.requested_at);
  }
  if (updates.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.due_date);
  }

  if (fields.length > 0) {
    values.push(itemId);
    db.prepare(`UPDATE engagement_checklists SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  return db.prepare('SELECT * FROM engagement_checklists WHERE id = ?').get(itemId) as EngagementChecklistItem || null;
}

export function getEngagementTasks(engagementId: string): EngagementTask[] {
  const db = getDb();
  return db.prepare('SELECT * FROM engagement_tasks WHERE engagement_id = ? ORDER BY created_at DESC').all(engagementId) as EngagementTask[];
}

export function createEngagementTask(task: Partial<EngagementTask>): EngagementTask {
  const db = getDb();
  const id = task.id || `tsk-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO engagement_tasks (
      id, engagement_id, title, stage_number, assigned_to, assigned_to_name,
      status, priority, due_date, blocker_reason, blocked_by, completed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    task.engagement_id,
    task.title,
    task.stage_number || 1,
    task.assigned_to || null,
    task.assigned_to_name || null,
    task.status || 'TODO',
    task.priority || 'MEDIUM',
    task.due_date || null,
    task.blocker_reason || null,
    task.blocked_by || null,
    task.completed_at || null,
    now
  );

  return db.prepare('SELECT * FROM engagement_tasks WHERE id = ?').get(id) as EngagementTask;
}

export function updateEngagementTask(
  taskId: string,
  updates: Partial<EngagementTask>
): EngagementTask | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  const keys: (keyof EngagementTask)[] = [
    'title',
    'status',
    'priority',
    'due_date',
    'blocker_reason',
    'blocked_by',
    'completed_at',
    'assigned_to',
    'assigned_to_name',
  ];

  for (const k of keys) {
    if (updates[k] !== undefined) {
      fields.push(`${k} = ?`);
      values.push(updates[k]);
    }
  }

  if (fields.length > 0) {
    values.push(taskId);
    db.prepare(`UPDATE engagement_tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  return db.prepare('SELECT * FROM engagement_tasks WHERE id = ?').get(taskId) as EngagementTask || null;
}

export function getEngagementApprovals(engagementId: string): EngagementApproval[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM engagement_approvals 
    WHERE engagement_id = ? 
    ORDER BY CASE role_gate WHEN 'PERFORMER' THEN 1 WHEN 'REVIEWER' THEN 2 WHEN 'PARTNER' THEN 3 END ASC
  `).all(engagementId) as EngagementApproval[];
}

export function updateEngagementApproval(
  engagementId: string,
  roleGate: 'PERFORMER' | 'REVIEWER' | 'PARTNER',
  updates: Partial<EngagementApproval>
): EngagementApproval | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.remarks !== undefined) {
    fields.push('remarks = ?');
    values.push(updates.remarks);
  }
  if (updates.approved_at !== undefined) {
    fields.push('approved_at = ?');
    values.push(updates.approved_at);
  }
  if (updates.approver_id !== undefined) {
    fields.push('approver_id = ?');
    values.push(updates.approver_id);
  }
  if (updates.approver_name !== undefined) {
    fields.push('approver_name = ?');
    values.push(updates.approver_name);
  }

  if (fields.length > 0) {
    values.push(engagementId, roleGate);
    db.prepare(`UPDATE engagement_approvals SET ${fields.join(', ')} WHERE engagement_id = ? AND role_gate = ?`).run(...values);
  }

  return db.prepare('SELECT * FROM engagement_approvals WHERE engagement_id = ? AND role_gate = ?').get(engagementId, roleGate) as EngagementApproval || null;
}

export function getEngagementAuditLogs(engagementId: string): AuditLog[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*, u.name as actor_name, u.role as actor_role
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.engagement_id = ? 
       OR a.document_id IN (SELECT id FROM documents WHERE engagement_id = ?)
    ORDER BY a.created_at ASC
  `).all(engagementId, engagementId) as any[];

  return rows.map((a) => {
    let meta = {};
    try {
      meta = JSON.parse(a.metadata);
    } catch {
      meta = {};
    }
    return {
      id: a.id,
      document_id: a.document_id,
      engagement_id: a.engagement_id || undefined,
      actor_id: a.actor_id,
      actor_name: a.actor_name,
      actor_role: a.actor_role,
      action: a.action,
      metadata: meta,
      created_at: a.created_at,
    };
  });
}

export function insertAuditLog(log: {
  id?: string;
  document_id?: string | null;
  engagement_id?: string | null;
  actor_id: string;
  action: string;
  metadata: Record<string, any>;
  created_at?: string;
}) {
  const db = getDb();
  const id = log.id || crypto.randomUUID();
  const now = log.created_at || new Date().toISOString();
  db.prepare(`
    INSERT INTO audit_logs (id, document_id, engagement_id, actor_id, action, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    log.document_id || null,
    log.engagement_id || null,
    log.actor_id,
    log.action,
    JSON.stringify(log.metadata || {}),
    now
  );
}

export const createAuditLog = insertAuditLog;

export function resetDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM engagement_approvals;
    DELETE FROM engagement_tasks;
    DELETE FROM engagement_checklists;
    DELETE FROM engagement_stages;
    DELETE FROM engagement_issues;
    DELETE FROM billing_records;
    DELETE FROM document_requests;
    DELETE FROM engagements;
    DELETE FROM audit_logs;
    DELETE FROM reviews;
    DELETE FROM document_versions;
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM extracted_document_data;
    DELETE FROM users;
    DELETE FROM clients;
  `);
  seedSystemUsers(db);
}

export function clearDocumentsOnly() {
  const db = getDb();
  db.exec(`
    DELETE FROM engagement_approvals;
    DELETE FROM engagement_tasks;
    DELETE FROM engagement_checklists;
    DELETE FROM engagement_stages;
    DELETE FROM engagement_issues;
    DELETE FROM billing_records;
    DELETE FROM document_requests;
    DELETE FROM engagements;
    DELETE FROM audit_logs;
    DELETE FROM reviews;
    DELETE FROM document_versions;
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM extracted_document_data;
  `);
  // After document-only reset, keep users intact (no reseed needed)
}

export function getEngagementIssues(engagementId: string) {
  const db = getDb();
  return (db.prepare('SELECT * FROM engagement_issues WHERE engagement_id = ? ORDER BY created_at DESC').all(engagementId) as any[]).map(i => ({
    ...i,
    blocked_by_client: Boolean(i.blocked_by_client),
  }));
}

export function getBillingRecords(engagementId: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM billing_records WHERE engagement_id = ? ORDER BY created_at DESC').all(engagementId) as any[];
}

export function getDocumentRequests(engagementId?: string) {
  const db = getDb();
  const rows = engagementId
    ? db.prepare('SELECT * FROM document_requests WHERE engagement_id = ? ORDER BY created_at DESC').all(engagementId)
    : db.prepare('SELECT * FROM document_requests ORDER BY created_at DESC').all();
  return (rows as any[]).map(r => {
    let channels = ['TRACERA'];
    try { channels = JSON.parse(r.channels); } catch {}
    return { ...r, channels };
  });
}

