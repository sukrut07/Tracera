import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { engagementService } from '@/lib/services/engagement-service';
import { EngagementStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const clientId = searchParams.get('clientId') || undefined;
    const status = (searchParams.get('status') as EngagementStatus) || undefined;
    const serviceType = searchParams.get('serviceType') || undefined;
    const search = searchParams.get('search') || undefined;

    const engagements = await engagementService.listEngagements(user, {
      clientId,
      status,
      serviceType,
      search,
    });

    return NextResponse.json({
      engagements,
      currentUser: user,
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to list engagements' }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      clientId,
      title,
      serviceType,
      financialYear,
      dueDate,
      partnerId,
      managerId,
      staffId,
      billingAmount,
    } = body;

    if (!clientId || !title || !serviceType || !financialYear || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required engagement fields: clientId, title, serviceType, financialYear, dueDate' },
        { status: 400 }
      );
    }

    const engagement = await engagementService.createEngagement(user, {
      clientId,
      title,
      serviceType,
      financialYear,
      dueDate,
      partnerId,
      managerId,
      staffId,
      billingAmount: billingAmount ? Number(billingAmount) : undefined,
    });

    return NextResponse.json({
      success: true,
      engagement,
    }, { status: 201 });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to create engagement' }, { status: statusCode });
  }
}
