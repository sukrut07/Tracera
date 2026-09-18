import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const user = await requireRole(['ADMIN', 'AUDITOR', 'PARTNER']);
    const db = getDb();
    const firmId = user.firm_id || 'firm-abc';
    const clients = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM engagements e WHERE e.client_id = c.id) as engagement_count,
        (SELECT COUNT(*) FROM documents d WHERE d.client_id = c.id) as document_count
      FROM clients c 
      WHERE c.firm_id = ?
      ORDER BY c.name ASC
    `).all(firmId);
    return NextResponse.json({ clients, currentUser: user });
  } catch (error: any) {
    const s = error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed' }, { status: s });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['ADMIN', 'PARTNER']);
    const { name, email, companyName, gstin, pan, financialYear, phone, address } = await req.json();
    if (!name || !companyName || !financialYear) {
      return NextResponse.json({ error: 'name, companyName, financialYear are required' }, { status: 400 });
    }
    const db = getDb();
    const now = new Date().toISOString();
    const clientId = randomUUID();
    const firmId = user.firm_id || 'firm-abc';
    db.prepare(`INSERT INTO clients (id, name, email, company_name, gstin, pan, financial_year, phone, address, firm_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(clientId, name.trim(), email?.trim() || null, companyName.trim(), gstin?.trim() || null, pan?.trim() || null, financialYear, phone?.trim() || null, address?.trim() || null, firmId, now, now);
    try {
      db.prepare(`INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), user.id, user.name, user.role, 'CLIENT_CREATED', JSON.stringify({ client_name: name, company_name: companyName, financial_year: financialYear }), now);
    } catch { /* safe — new columns may not exist on old DB */ }
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (error: any) {
    const s = error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed' }, { status: s });
  }
}
