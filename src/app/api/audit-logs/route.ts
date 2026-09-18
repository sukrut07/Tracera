import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

/**
 * GET /api/audit-logs
 *
 * Returns chronological audit events for the authenticated user.
 *
 * CLIENT: sees events for their own documents/engagements
 * AUDITOR/PARTNER/ADMIN: sees events for all documents they have access to
 *
 * Query params:
 *   documentId  - filter by document
 *   engagementId - filter by engagement
 *   page        - pagination (default: 1)
 *   limit       - records per page (default: 50, max: 200)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const documentId = searchParams.get('documentId') || null;
    const engagementId = searchParams.get('engagementId') || null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    const db = getDb();

    // Build query based on role
    // CLIENT: only sees events for documents they own (client_id match)
    // Staff (AUDITOR/PARTNER/ADMIN): can see events for all documents
    let whereClause = '';
    const params: any[] = [];

    if (user.role === 'CLIENT' && user.client_id) {
      whereClause = `
        WHERE (
          a.document_id IN (
            SELECT id FROM documents WHERE client_id = ?
          )
          OR a.engagement_id IN (
            SELECT id FROM engagements WHERE client_id = ?
          )
          OR a.actor_id = ?
        )
      `;
      params.push(user.client_id, user.client_id, user.id);
    } else if (user.role === 'CLIENT') {
      // Client with no client_id — only see their own actions
      whereClause = 'WHERE a.actor_id = ?';
      params.push(user.id);
    }

    if (documentId) {
      whereClause = whereClause
        ? `${whereClause} AND a.document_id = ?`
        : 'WHERE a.document_id = ?';
      params.push(documentId);
    }

    if (engagementId) {
      whereClause = whereClause
        ? `${whereClause} AND a.engagement_id = ?`
        : 'WHERE a.engagement_id = ?';
      params.push(engagementId);
    }

    const query = `
      SELECT
        a.id,
        a.action,
        a.actor_id,
        a.actor_name,
        a.actor_role,
        a.document_id,
        a.engagement_id,
        a.metadata,
        a.created_at,
        d.title AS document_title,
        d.status AS document_status,
        d.current_version AS document_version
      FROM audit_logs a
      LEFT JOIN documents d ON a.document_id = d.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = db.prepare(query).all(...params) as any[];

    const events = rows.map((row) => {
      let metadata: any = {};
      try {
        metadata = row.metadata ? JSON.parse(row.metadata) : {};
      } catch {
        metadata = {};
      }

      return {
        id: row.id,
        action: row.action,
        actor: {
          id: row.actor_id,
          name: row.actor_name || 'System',
          role: row.actor_role || 'SYSTEM',
        },
        document: row.document_id
          ? {
              id: row.document_id,
              title: row.document_title || 'Document',
              status: row.document_status,
              version: row.document_version,
            }
          : null,
        engagementId: row.engagement_id || null,
        metadata,
        timestamp: row.created_at,
        label: formatActionLabel(row.action),
      };
    });

    return NextResponse.json({ events, page, limit, total: events.length });
  } catch (error: any) {
    const status = error?.status || 401;
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
  }
}

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    DOCUMENT_SUBMITTED: 'Document submitted',
    DOCUMENT_REVIEW_STARTED: 'Review started',
    CORRECTION_REQUESTED: 'Correction requested',
    CORRECTION_SUBMITTED: 'Correction submitted',
    DOCUMENT_APPROVED: 'Document approved',
    DOCUMENT_REJECTED: 'Document rejected',
    REVIEW_COMPLETED: 'Review completed',
    ENGAGEMENT_CREATED: 'Engagement created',
    ENGAGEMENT_CLOSED: 'Engagement closed',
    ENGAGEMENT_ASSIGNED: 'Engagement assigned',
    DOCUMENT_REQUEST_CREATED: 'Document requested',
    TASK_COMPLETED: 'Task completed',
    ISSUE_CREATED: 'Issue logged',
    ISSUE_RESOLVED: 'Issue resolved',
    PAYMENT_RECORDED: 'Payment recorded',
    USER_REGISTERED: 'Account created',
    PARTNER_APPROVED: 'Partner approved',
    MANAGER_REVIEWED: 'Manager reviewed',
  };
  return labels[action] || action.replace(/_/g, ' ').toLowerCase();
}
