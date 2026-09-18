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

    const { roleGate, status, remarks } = body;

    if (!roleGate || !['PERFORMER', 'REVIEWER', 'PARTNER'].includes(roleGate)) {
      return NextResponse.json({ error: 'Valid roleGate (PERFORMER, REVIEWER, PARTNER) is required' }, { status: 400 });
    }

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (APPROVED, REJECTED) is required' }, { status: 400 });
    }

    const updatedApproval = await engagementService.submitApproval(
      user,
      id,
      roleGate,
      status,
      remarks
    );

    const refreshedEngagement = await engagementService.getEngagement(id);

    return NextResponse.json({
      success: true,
      approval: updatedApproval,
      engagement: refreshedEngagement,
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to submit approval' }, { status: statusCode });
  }
}
