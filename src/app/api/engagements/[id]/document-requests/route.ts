import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDb, createAuditLog } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: engId } = await params;
    const db = getDb();
    const requests = db.prepare(
      'SELECT * FROM document_requests WHERE engagement_id = ? ORDER BY created_at DESC'
    ).all(engId);
    return NextResponse.json({ requests, currentUser: user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: engId } = await params;
    const { documentType, description, requestedFromId, channels, dueDate } = await req.json();
    if (!documentType) return NextResponse.json({ error: 'documentType required' }, { status: 400 });

    const db = getDb();
    const now = new Date().toISOString();
    const id = randomUUID();
    db.prepare(
      `INSERT INTO document_requests
       (id, engagement_id, document_type, description, requested_by_id, requested_by_name, requested_from_id, channels, status, due_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED', ?, ?)`
    ).run(
      id, engId, documentType, description || null,
      user.id, user.name, requestedFromId || null,
      JSON.stringify(channels || ['TRACERA']), dueDate || null, now
    );

    createAuditLog({
      engagement_id: engId,
      actor_id: user.id,
      action: 'DOCUMENT_REQUESTED',
      metadata: { document_type: documentType, channels: channels || ['TRACERA'] },
    });

    const request = db.prepare('SELECT * FROM document_requests WHERE id = ?').get(id);
    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id: engId } = await params;
    const { requestId, status, fulfilledDocumentId } = await req.json();
    if (!requestId || !status) {
      return NextResponse.json({ error: 'requestId and status required' }, { status: 400 });
    }
    const db = getDb();
    db.prepare(
      'UPDATE document_requests SET status = ?, fulfilled_document_id = ? WHERE id = ? AND engagement_id = ?'
    ).run(status, fulfilledDocumentId || null, requestId, engId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
