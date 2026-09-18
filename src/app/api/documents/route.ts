import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getDocuments, getDashboardStats } from '@/lib/db';
import { DocumentStatus, DocumentType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    let clientId = searchParams.get('clientId') || undefined;
    const status = (searchParams.get('status') as DocumentStatus) || undefined;
    const documentType = (searchParams.get('documentType') as DocumentType) || undefined;
    const search = searchParams.get('search') || undefined;

    // Strict authorization: CLIENTs can NEVER query documents of another client
    if (user.role === 'CLIENT') {
      clientId = user.client_id || 'NONE';
    }

    const documents = getDocuments({
      clientId,
      status,
      documentType,
      search,
    });

    const stats = getDashboardStats(user.role, user.client_id);

    return NextResponse.json({
      documents,
      stats,
      currentUser: user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch documents' }, { status: 500 });
  }
}
