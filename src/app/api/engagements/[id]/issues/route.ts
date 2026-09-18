import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDb, createAuditLog } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: engId } = await params;
    const db = getDb();
    const issues = db.prepare(
      'SELECT * FROM engagement_issues WHERE engagement_id = ? ORDER BY created_at DESC'
    ).all(engId);
    return NextResponse.json({ issues, currentUser: user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: engId } = await params;
    const { title, description, priority, dueDate, blockedByClient } = await req.json();
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

    const db = getDb();
    const now = new Date().toISOString();
    const id = randomUUID();
    db.prepare(
      `INSERT INTO engagement_issues 
       (id, engagement_id, title, description, owner_id, owner_name, priority, status, blocked_by_client, due_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?)`
    ).run(
      id, engId, title.trim(), description || null,
      user.id, user.name, priority || 'MEDIUM',
      blockedByClient ? 1 : 0, dueDate || null, now
    );

    createAuditLog({
      engagement_id: engId,
      actor_id: user.id,
      action: 'ISSUE_CREATED',
      metadata: { issue_title: title, priority: priority || 'MEDIUM' },
    });

    const issue = db.prepare('SELECT * FROM engagement_issues WHERE id = ?').get(id);
    return NextResponse.json({ success: true, issue }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id: engId } = await params;
    const { issueId, status } = await req.json();
    if (!issueId || !status) {
      return NextResponse.json({ error: 'issueId and status required' }, { status: 400 });
    }
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(
      'UPDATE engagement_issues SET status = ?, resolved_at = ? WHERE id = ? AND engagement_id = ?'
    ).run(status, status === 'RESOLVED' ? now : null, issueId, engId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
