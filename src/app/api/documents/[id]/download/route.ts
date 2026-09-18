import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireDocumentAccess } from '@/lib/auth/session';
import { getDocumentById } from '@/lib/db';
import { getPrivateFileBuffer } from '@/lib/storage';

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

    // Role and ownership check
    await requireDocumentAccess(user, id);

    const searchParams = req.nextUrl.searchParams;
    const versionParam = searchParams.get('version');
    const versionNum = versionParam ? parseInt(versionParam, 10) : document.current_version;

    const versionRecord =
      document.versions?.find((v) => v.version_number === versionNum) ||
      document.versions?.[0];

    if (!versionRecord) {
      return NextResponse.json({ error: 'Version record not found' }, { status: 404 });
    }

    const fileBuffer = await getPrivateFileBuffer(versionRecord.file_path);
    if (!fileBuffer) {
      return NextResponse.json({ error: 'Stored document file not found on disk' }, { status: 404 });
    }

    const mimeType = versionRecord.file_type || 'application/octet-stream';
    const isInline = searchParams.get('inline') === 'true';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(versionRecord.file_name)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    const status = error?.status || 500;
    return NextResponse.json({ error: error.message || 'Failed to download document' }, { status });
  }
}
