import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireEngagementAccess } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: engagementId } = await context.params;

    await requireEngagementAccess(user, engagementId);

    const db = getDb();

    // Query all chronological audit logs for this engagement or documents within this engagement
    const rows = db.prepare(`
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
      WHERE a.engagement_id = ?
         OR (a.document_id IS NOT NULL AND a.document_id IN (
              SELECT id FROM documents WHERE engagement_id = ?
            ))
      ORDER BY a.created_at ASC
    `).all(engagementId, engagementId) as any[];

    const events = rows.map((row) => {
      let meta: Record<string, unknown> = {};
      try {
        meta = row.metadata ? JSON.parse(row.metadata) : {};
      } catch {
        meta = {};
      }

      const entity = row.document_id ? 'DOCUMENT' : 'ENGAGEMENT';
      const entityId = row.document_id || row.engagement_id;

      return {
        id: row.id,
        eventType: row.action,
        actor: {
          id: row.actor_id,
          name: row.actor_name || 'System Operator',
          role: row.actor_role || 'SYSTEM',
        },
        timestamp: row.created_at,
        entity,
        entityId,
        description: generateEventDescription(row.action, row, meta),
        metadata: meta,
      };
    });

    return NextResponse.json({
      success: true,
      engagementId,
      totalEvents: events.length,
      events,
    });
  } catch (error: any) {
    const status = error?.status || 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch audit history' }, { status });
  }
}

function generateEventDescription(
  action: string,
  row: { actor_name?: string; actor_role?: string; document_title?: string },
  meta: Record<string, unknown>
): string {
  const actor = row.actor_name || 'User';
  const doc = row.document_title || (meta.title as string) || 'Document';

  switch (action) {
    case 'ENGAGEMENT_CREATED':
      return `Engagement initialized by ${actor}`;
    case 'AUDITOR_ASSIGNED':
    case 'ENGAGEMENT_ASSIGNED':
      return `Auditor assigned to engagement`;
    case 'DOCUMENT_UPLOADED':
      return `${actor} uploaded "${doc}" (v${meta.version || 1})`;
    case 'DOCUMENT_SUBMITTED':
      return `${actor} submitted "${doc}" for audit verification`;
    case 'REVIEW_STARTED':
      return `${actor} commenced statutory examination of "${doc}"`;
    case 'CORRECTION_REQUESTED':
      return `Auditor ${actor} requested revisions for "${doc}": ${meta.reason || 'Remarks provided'}`;
    case 'CORRECTION_UPLOADED':
    case 'DOCUMENT_RESUBMITTED':
      return `${actor} submitted revised version v${meta.version} for "${doc}"`;
    case 'DOCUMENT_APPROVED':
      return `Auditor ${actor} verified and approved "${doc}"`;
    case 'MAKER_CHECKER_SIGN_OFF':
      return `${meta.role_gate || 'Staff'} sign-off completed by ${actor} (${meta.status || 'APPROVED'})`;
    case 'PAYMENT_RECORDED':
      return `Professional audit fee settlement of ₹${Number(meta.amount || 0).toLocaleString('en-IN')} recorded`;
    case 'ENGAGEMENT_CLOSED':
      return `Engagement officially closed and statutory audit certificate generated`;
    default:
      return `${action.replace(/_/g, ' ')} recorded by ${actor}`;
  }
}
