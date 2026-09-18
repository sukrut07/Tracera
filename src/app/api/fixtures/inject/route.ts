import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { workflowService, WorkflowError } from '@/lib/workflow/service';
import { SYNTHETIC_SAMPLE_DATASETS } from '@/lib/data/sample-datasets';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { fixtureKey, clientId: requestedClientId } = body;

    const fixture = SYNTHETIC_SAMPLE_DATASETS.find((s) => s.key === fixtureKey);
    if (!fixture) {
      return NextResponse.json(
        { error: `Fixture '${fixtureKey}' not found in synthetic dataset library` },
        { status: 404 }
      );
    }

    const targetClientId = requestedClientId || user.client_id || 'c1';

    // Write fixture file to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const storedFileName = `${Date.now()}_fixture_${fixture.fileName}`;
    const fullDiskPath = path.join(uploadDir, storedFileName);
    await fs.writeFile(fullDiskPath, fixture.content, 'utf8');

    const fileStats = await fs.stat(fullDiskPath);

    // Submit document through the verified workflow state machine
    const document = await workflowService.submitDocument(user, {
      clientId: targetClientId,
      uploaderId: user.id,
      title: fixture.title,
      documentType: fixture.documentType,
      fileName: fixture.fileName,
      filePath: `/uploads/${storedFileName}`,
      fileSize: fileStats.size,
      fileType: 'text/csv',
      notes: fixture.notes,
    });

    return NextResponse.json({
      success: true,
      message: `Fixture '${fixture.title}' injected successfully`,
      document,
    });
  } catch (error: any) {
    console.error('Fixture injection error:', error);
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to inject fixture' },
      { status: 500 }
    );
  }
}
