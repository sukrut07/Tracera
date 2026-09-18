import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDocumentById } from '@/lib/db';
import { ocrService } from '@/lib/ocr/ocr-service';
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

    // Compute OCR extraction and automated audit validations
    let extractedData = null;
    let validation = null;
    try {
      extractedData = await ocrService.processDocument({
        documentId: document.id,
        versionId: activeVersion?.id || 'v1',
        versionNumber: versionNum,
        documentType: document.document_type,
        fileName: activeVersion?.file_name || document.title,
      });
      validation = validationService.validate(extractedData);
    } catch (ocrErr) {
      console.error('OCR/Validation computation warning:', ocrErr);
    }

    return NextResponse.json({
      document,
      currentUser: user,
      activeVersion,
      extractedData,
      validation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch document' }, { status: 500 });
  }
}
