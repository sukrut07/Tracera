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

    const { action, taskId, title, stageNumber, assignedToId, priority, dueDate, status, blocker_reason, blocked_by } = body;

    if (action === 'create') {
      if (!title || !title.trim()) {
        return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
      }

      const task = await engagementService.createTask(user, id, {
        title,
        stageNumber,
        assignedToId,
        priority,
        dueDate,
      });

      return NextResponse.json({ success: true, task }, { status: 201 });
    } else if (action === 'update') {
      if (!taskId) {
        return NextResponse.json({ error: 'taskId is required for updates' }, { status: 400 });
      }

      const updated = await engagementService.updateTask(user, id, taskId, {
        status,
        priority,
        blocker_reason,
        blocked_by,
        assigned_to: assignedToId,
      });

      return NextResponse.json({ success: true, task: updated });
    }

    return NextResponse.json({ error: 'Invalid action. Expected "create" or "update"' }, { status: 400 });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to process task request' }, { status: statusCode });
  }
}
