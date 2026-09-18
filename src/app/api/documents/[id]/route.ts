import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDocumentById, getDbExtractedData } from '@/lib/db';
import { validationService } from '@/lib/validation/document-validation';

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

    // Role-based document ownership check
    if (user.role === 'CLIENT' && document.client_id !== user.client_id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view this document' }, { status: 403 });
    }

    // Parse requested version if specified in searchParams
    const searchParams = req.nextUrl.searchParams;
    const requestedVersion = searchParams.get('version');
    const versionNum = requestedVersion ? parseInt(requestedVersion, 10) : document.current_version;
    const activeVersion = document.versions?.find((v) => v.version_number === versionNum) || document.versions?.[0];

    // Load stored OCR extracted data (read-only query — never process OCR on GET)
    let extractedData = null;
    let validation = null;
    if (activeVersion?.id) {
      extractedData = getDbExtractedData(activeVersion.id);
      if (extractedData) {
        try {
          validation = validationService.validate(extractedData);
        } catch {
          validation = null;
        }
      }
    }

    return NextResponse.json({
      document,
      currentUser: user,
      activeVersion,
      extractedData,
      validation,
    });
  } catch (error: any) {
    const status = error?.status || (error?.name === 'WorkflowError' ? error?.statusCode : 500);
    return NextResponse.json({ error: error.message || 'Failed to fetch document' }, { status });
  }
}
