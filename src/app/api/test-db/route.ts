import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, any> = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    isVercel: Boolean(process.env.VERCEL),
    cwd: process.cwd(),
  };

  try {
    const Database = (await import('better-sqlite3')).default;
    diagnostics.betterSqlite3Import = 'OK';
    try {
      const db = new Database(':memory:');
      diagnostics.inMemoryDb = 'OK';
      const result = db.prepare('SELECT 1 as val').get() as { val: number };
      diagnostics.query = result.val === 1 ? 'OK' : 'FAIL';
      db.close();
    } catch (dbErr: any) {
      diagnostics.inMemoryDbError = dbErr.message || String(dbErr);
    }
  } catch (importErr: any) {
    diagnostics.betterSqlite3ImportError = importErr.message || String(importErr);
  }

  return NextResponse.json(diagnostics);
}
