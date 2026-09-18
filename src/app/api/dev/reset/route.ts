import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const dbPath = path.join(process.cwd(), '.data', 'tracera.db');
    if (fs.existsSync(dbPath)) {
      // Clear data
      const db = getDb();
      db.exec(`
        DELETE FROM audit_logs;
        DELETE FROM reviews;
        DELETE FROM document_versions;
        DELETE FROM documents;
        DELETE FROM users;
        DELETE FROM clients;
      `);
      // Trigger re-seed
      db.close();
      fs.unlinkSync(dbPath);
    }
    // Re-init
    getDb();
    return NextResponse.json({ success: true, message: 'Database reset and re-seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
