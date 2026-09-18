import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { saveUploadedFile } from '@/lib/storage';
import { workflowService, WorkflowError } from '@/lib/workflow/service';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: documentId } = await context.params;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const notes = (formData.get('notes') as string | null) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'Please select a corrected file to upload' }, { status: 400 });
    }

    const saved = await saveUploadedFile(file);

    const document = await workflowService.uploadCorrection(user, {
      documentId,
      clientId: user.client_id || '',
      uploaderId: user.id,
      fileName: saved.fileName,
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      fileType: saved.fileType,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Version ${document.current_version} submitted successfully`,
      document,
    });
  } catch (error: any) {
    console.error('Correction upload error:', error);
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to upload correction' }, { status: 500 });
  }
}
