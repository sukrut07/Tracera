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

  seedData(db);
  seedEngagements(db);
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

function seedEngagements(db: Database.Database) {
  const engCount = db.prepare('SELECT COUNT(*) as count FROM engagements').get() as { count: number };
  if (engCount.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const earlier1 = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const earlier2 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const client1Id = 'c1111111-1111-1111-1111-111111111111'; // ABC Traders
  const client2Id = 'c2222222-2222-2222-2222-222222222222'; // XYZ Enterprises
  const uAuditorId = 'u2222222-2222-2222-2222-222222222222'; // Rahul Sharma
  const uAdminId = 'u3333333-3333-3333-3333-333333333333'; // Managing Partner

  const eng1Id = 'eng-statutory-abc-2025';

  // 1. ABC Traders Statutory Audit
  db.prepare(`
    INSERT INTO engagements (
      id, client_id, title, service_type, financial_year, status,
      current_stage_index, total_stages, progress_percent, due_date,
      assigned_partner_id, assigned_partner_name,
      assigned_manager_id, assigned_manager_name,
      assigned_staff_id, assigned_staff_name,
      billing_amount, billing_gst, billing_total, billing_status,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
  `).run(
    eng1Id,
    client1Id,
    'ABC Traders Pvt Ltd · FY 2025–26 Statutory Audit',
    'STATUTORY_AUDIT',
    '2025-26',
    'DOCUMENT_COLLECTION',
    2, // 0-indexed stage 3: Document Collection
    10,
    35,
    '2026-09-30',
    uAdminId,
    'Managing Partner (Admin)',
    uAuditorId,
    'Rahul Sharma',
    uAuditorId,
    'Rahul Sharma',
    25000,
    4500,
    29500,
    'INVOICED',
    earlier2,
    now
  );

  // 10 Stages for Statutory Audit
  const stages = [
    { num: 1, name: '01 Engagement Acceptance', status: 'COMPLETED', completed_at: earlier2 },
    { num: 2, name: '02 Planning & Risk Assessment', status: 'COMPLETED', completed_at: earlier1 },
    { num: 3, name: '03 Document Collection', status: 'IN_PROGRESS', completed_at: null },
    { num: 4, name: '04 Preliminary Review', status: 'PENDING', completed_at: null },
    { num: 5, name: '05 Fieldwork & Substantive Testing', status: 'PENDING', completed_at: null },
    { num: 6, name: '06 Manager Review', status: 'PENDING', completed_at: null },
    { num: 7, name: '07 Partner Review', status: 'PENDING', completed_at: null },
    { num: 8, name: '08 Client Confirmation', status: 'PENDING', completed_at: null },
    { num: 9, name: '09 Finalisation & Reporting', status: 'PENDING', completed_at: null },
    { num: 10, name: '10 Engagement Closure', status: 'PENDING', completed_at: null },
  ];

  const insertStage = db.prepare(`
    INSERT INTO engagement_stages (id, engagement_id, stage_number, name, status, owner_id, owner_name, due_date, completed_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stages.forEach((st) => {
    insertStage.run(
      `stg-${eng1Id}-${st.num}`,
      eng1Id,
      st.num,
      st.name,
      st.status,
      uAuditorId,
      'Rahul Sharma',
      '2026-09-30',
      st.completed_at,
      st.num === 3 ? 'Awaiting outstanding debtor ageing and sales registers from client.' : null
    );
  });

  // 12 Checklist Items for Statutory Audit
  const checklist = [
    { title: 'Trial Balance', cat: 'Financials', status: 'APPROVED', docId: 'd1111111-1111-1111-1111-111111111111' },
    { title: 'General Ledger', cat: 'Books of Accounts', status: 'SUBMITTED', docId: 'd3333333-3333-3333-3333-333333333333' },
    { title: 'Bank Statements (All 4 Quarters)', cat: 'Banking', status: 'APPROVED', docId: 'd1111111-1111-1111-1111-111111111111' },
    { title: 'Purchase Register with GSTR-2B Recon', cat: 'Purchases & GST', status: 'SUBMITTED', docId: 'd2222222-2222-2222-2222-222222222222' },
    { title: 'Sales Register with GSTR-1 Recon', cat: 'Sales & GST', status: 'REQUIRED', docId: null },
    { title: 'GST Returns (GSTR-3B & GSTR-1 Files)', cat: 'Statutory', status: 'APPROVED', docId: null },
    { title: 'TDS Returns & Form 26AS / AIS', cat: 'Taxation', status: 'REQUESTED', docId: null, msg: 'Please provide Q4 TDS return acknowledgment and Form 26AS download.' },
    { title: 'Fixed Asset Register & Depreciation Schedule', cat: 'Fixed Assets', status: 'REQUIRED', docId: null },
    { title: 'Debtor Ageing & Balance Confirmations', cat: 'Receivables', status: 'REQUIRED', docId: null },
    { title: 'Creditor Ageing & MSME Classification', cat: 'Payables', status: 'REQUIRED', docId: null },
    { title: 'Previous Year Signed Financial Statements', cat: 'Prior Year', status: 'APPROVED', docId: null },
    { title: 'Director Signing Declarations & MGT-7', cat: 'Corporate Compliance', status: 'REQUIRED', docId: null },
  ];

  const insertChecklist = db.prepare(`
    INSERT INTO engagement_checklists (id, engagement_id, title, category, is_mandatory, status, document_id, request_message, requested_at, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  checklist.forEach((item, idx) => {
    insertChecklist.run(
      `chk-${eng1Id}-${idx + 1}`,
      eng1Id,
      item.title,
      item.cat,
      1,
      item.status,
      item.docId,
      item.msg || null,
      item.status === 'REQUESTED' ? earlier1 : null,
      '2026-09-25'
    );
  });

  // 5 Tasks for Statutory Audit
  const tasks = [
    { title: 'Verify Bank Reconciliation Statement (BRS)', status: 'COMPLETED', prio: 'HIGH', blockedBy: null, reason: null, completedAt: earlier1 },
    { title: 'Reconcile Purchase Register with GSTR-2B', status: 'BLOCKED', prio: 'URGENT', blockedBy: 'Client - Missing June Bank Statement & Supplier Invoices', reason: 'ITC mismatch of ₹42,800 between books and GSTR-2B portal dump.', completedAt: null },
    { title: 'Fixed Asset physical verification sample selection', status: 'IN_PROGRESS', prio: 'MEDIUM', blockedBy: null, reason: null, completedAt: null },
    { title: 'TDS Challan & 26AS matching', status: 'TODO', prio: 'MEDIUM', blockedBy: null, reason: null, completedAt: null },
    { title: 'Statutory Audit Checklist Sign-off', status: 'TODO', prio: 'HIGH', blockedBy: null, reason: null, completedAt: null },
  ];

  const insertTask = db.prepare(`
    INSERT INTO engagement_tasks (id, engagement_id, title, stage_number, assigned_to, assigned_to_name, status, priority, due_date, blocker_reason, blocked_by, completed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  tasks.forEach((t, idx) => {
    insertTask.run(
      `tsk-${eng1Id}-${idx + 1}`,
      eng1Id,
      t.title,
      3,
      uAuditorId,
      'Rahul Sharma',
      t.status,
      t.prio,
      '2026-09-28',
      t.reason,
      t.blockedBy,
      t.completedAt,
      earlier2
    );
  });

  // 3 Multi-tier Maker-Checker Approvals
  const approvals = [
    { role: 'PERFORMER', name: 'Rahul Sharma', status: 'APPROVED', remarks: 'Preliminary testing & audit procedures for available documents complete.', approvedAt: earlier1 },
    { role: 'REVIEWER', name: 'Rahul Sharma', status: 'PENDING', remarks: 'Awaiting June purchase recon and client balance confirmations.', approvedAt: null },
    { role: 'PARTNER', name: 'Managing Partner (Admin)', status: 'PENDING', remarks: null, approvedAt: null },
  ];

  const insertApproval = db.prepare(`
    INSERT INTO engagement_approvals (id, engagement_id, role_gate, approver_id, approver_name, status, remarks, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  approvals.forEach((a) => {
    insertApproval.run(
      `app-${eng1Id}-${a.role}`,
      eng1Id,
      a.role,
      a.role === 'PARTNER' ? uAdminId : uAuditorId,
      a.name,
      a.status,
      a.remarks,
      a.approvedAt
    );
  });

  // Link existing ABC documents to engagement
  try {
    db.prepare(`UPDATE documents SET engagement_id = ? WHERE id IN ('d1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333')`).run(eng1Id);
  } catch {}

  // Engagement audit log
  db.prepare(`
    INSERT INTO audit_logs (id, engagement_id, actor_id, action, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `a-eng-${eng1Id}-1`,
    eng1Id,
    uAdminId,
    'ENGAGEMENT_CREATED',
    JSON.stringify({ title: 'ABC Traders Pvt Ltd · FY 2025–26 Statutory Audit', service_type: 'STATUTORY_AUDIT', financial_year: '2025-26' }),
    earlier2
  );
  db.prepare(`
    INSERT INTO audit_logs (id, engagement_id, actor_id, action, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `a-eng-${eng1Id}-2`,
    eng1Id,
    uAuditorId,
    'STAGE_ADVANCED',
    JSON.stringify({ from_stage: '02 Planning & Risk Assessment', to_stage: '03 Document Collection', stage_number: 3 }),
    earlier1
  );

  // 2. XYZ Enterprises Tax Audit
  const eng2Id = 'eng-tax-xyz-2025';
  db.prepare(`
    INSERT INTO engagements (
      id, client_id, title, service_type, financial_year, status,
      current_stage_index, total_stages, progress_percent, due_date,
      assigned_partner_id, assigned_partner_name,
      assigned_manager_id, assigned_manager_name,
      assigned_staff_id, assigned_staff_name,
      billing_amount, billing_gst, billing_total, billing_status,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
  `).run(
    eng2Id,
    client2Id,
    'XYZ Enterprises LLP · FY 2025–26 Tax Audit (Sec 44AB)',
    'TAX_AUDIT',
    '2025-26',
    'PLANNING',
    1,
    8,
    20,
    '2026-10-15',
    uAdminId,
    'Managing Partner (Admin)',
    uAuditorId,
    'Rahul Sharma',
    uAuditorId,
    'Rahul Sharma',
    35000,
    6300,
    41300,
    'PENDING',
    earlier1,
    now
  );

  // Link XYZ docs
  try {
    db.prepare(`UPDATE documents SET engagement_id = ? WHERE id IN ('d4444444-4444-4444-4444-444444444444', 'd5555555-5555-5555-5555-555555555555')`).run(eng2Id);
  } catch {}
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

export function resetDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM engagement_approvals;
    DELETE FROM engagement_tasks;
    DELETE FROM engagement_checklists;
    DELETE FROM engagement_stages;
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
  seedData(db);
  seedEngagements(db);
}

export function clearDocumentsOnly() {
  const db = getDb();
  db.exec(`
    DELETE FROM engagement_approvals;
    DELETE FROM engagement_tasks;
    DELETE FROM engagement_checklists;
    DELETE FROM engagement_stages;
    DELETE FROM engagements;
    DELETE FROM audit_logs;
    DELETE FROM reviews;
    DELETE FROM document_versions;
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM extracted_document_data;
  `);
  seedEngagements(db);
}
