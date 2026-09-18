import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { engagementService } from '@/lib/services/engagement-service';
import { reportService } from '@/lib/services/report-service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const engagement = await engagementService.getEngagement(id);

    if (user.role === 'CLIENT' && engagement.client_id !== user.client_id) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this engagement dossier' }, { status: 403 });
    }

    const pdfBytes = reportService.generateEngagementClosureReportPdf(engagement);

    const safeTitle = (engagement.closure_id || engagement.title).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `TRACERA_Engagement_Closure_Dossier_${safeTitle}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    const statusCode = error.name === 'WorkflowError' ? error.statusCode : 500;
    return NextResponse.json({ error: error.message || 'Failed to generate closure report' }, { status: statusCode });
  }
}
