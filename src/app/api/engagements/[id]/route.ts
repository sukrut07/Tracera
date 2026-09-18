import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { engagementService } from '@/lib/services/engagement-service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const engagement = await engagementService.getEngagement(id);

    // Authorization: Client can only view their own engagements
    if (user.role === 'CLIENT' && user.client_id !== engagement.client_id) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this engagement' }, { status: 403 });
    }

    const closurePrereqs = engagementService.checkClosurePrerequisites(engagement);

    return NextResponse.json({
      engagement,
      closurePrereqs,
      currentUser: user,
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch engagement' }, { status: statusCode });
  }
}
