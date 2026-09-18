import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { engagementService } from '@/lib/services/engagement-service';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();

    const { action, checklistItemId, message, dueDate, documentId } = body;

    if (!checklistItemId) {
      return NextResponse.json({ error: 'checklistItemId is required' }, { status: 400 });
    }

    if (action === 'request') {
      const updated = await engagementService.requestChecklistDocument(
        user,
        id,
        checklistItemId,
        message,
        dueDate
      );
      return NextResponse.json({ success: true, item: updated });
    } else if (action === 'link') {
      if (!documentId) {
        return NextResponse.json({ error: 'documentId is required to link evidence' }, { status: 400 });
      }
      const updated = await engagementService.linkDocumentToChecklist(
        user,
        id,
        checklistItemId,
        documentId
      );
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: 'Invalid action. Expected "request" or "link"' }, { status: 400 });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to update checklist item' }, { status: statusCode });
  }
}
