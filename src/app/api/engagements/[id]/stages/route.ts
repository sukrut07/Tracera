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

    const { targetStageNumber, notes } = body;

    if (!targetStageNumber || typeof targetStageNumber !== 'number') {
      return NextResponse.json({ error: 'Valid targetStageNumber is required' }, { status: 400 });
    }

    const updated = await engagementService.advanceStage(
      user,
      id,
      targetStageNumber,
      notes
    );

    return NextResponse.json({
      success: true,
      engagement: updated,
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to update stage' }, { status: statusCode });
  }
}
