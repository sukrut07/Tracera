import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { engagementService } from '@/lib/services/engagement-service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const engagement = await engagementService.getEngagement(id);
    const prereqs = engagementService.checkClosurePrerequisites(engagement);

    return NextResponse.json({
      prerequisites: prereqs,
      status: engagement.status,
      closureId: engagement.closure_id,
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to check closure prerequisites' }, { status: statusCode });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();

    const { closureSummary } = body;

    const closed = await engagementService.closeEngagement(
      user,
      id,
      closureSummary || 'Engagement verified and closed in compliance with ICAI standards.'
    );

    return NextResponse.json({
      success: true,
      engagement: closed,
      closureId: closed.closure_id,
      message: 'Engagement successfully closed and sealed with official audit closure ID.',
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to close engagement' }, { status: statusCode });
  }
}
