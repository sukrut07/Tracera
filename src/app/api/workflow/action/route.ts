import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { workflowService, WorkflowError } from '@/lib/workflow/service';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { action, documentId, reason, priority, comment } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'START_REVIEW':
        result = await workflowService.startReview(user, documentId);
        break;

      case 'REQUEST_CORRECTION':
        if (!reason || !reason.trim()) {
          return NextResponse.json({ error: 'Please provide a correction reason' }, { status: 400 });
        }
        result = await workflowService.requestCorrection(user, {
          documentId,
          auditorId: user.id,
          reason,
          priority: priority || 'MEDIUM',
        });
        break;

      case 'APPROVE':
        result = await workflowService.approveDocument(user, {
          documentId,
          auditorId: user.id,
          comment,
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown workflow action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      document: result,
    });
  } catch (error: any) {
    console.error('Workflow action error:', error);
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Workflow action failed' }, { status: 500 });
  }
}
