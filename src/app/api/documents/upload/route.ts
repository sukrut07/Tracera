import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { saveUploadedFile } from '@/lib/storage';
import { workflowService, WorkflowError } from '@/lib/workflow/service';
import { DocumentType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const documentType = formData.get('documentType') as DocumentType | null;
    const clientId = (formData.get('clientId') as string | null) || user.client_id;
    const notes = (formData.get('notes') as string | null) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'Please select a document file to upload' }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client account is required' }, { status: 400 });
    }

    // Save physical file
    const saved = await saveUploadedFile(file);

    // Call centralized workflow service
    const document = await workflowService.submitDocument(user, {
      clientId,
      uploaderId: user.id,
      title: title.trim(),
      documentType,
      fileName: saved.fileName,
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      fileType: saved.fileType,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Document submitted successfully',
      document,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload document error:', error);
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to upload document' }, { status: 500 });
  }
}
