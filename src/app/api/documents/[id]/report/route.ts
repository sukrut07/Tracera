import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDocumentById } from '@/lib/db';
import { reportService } from '@/lib/services/report-service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const document = getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (user.role === 'CLIENT' && document.client_id !== user.client_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pdfBytes = reportService.generatePdfReport(document);

    const safeTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `TRESERA_Audit_Report_${safeTitle}_v${document.current_version}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
