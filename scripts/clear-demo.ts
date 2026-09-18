import { clearDocumentsOnly } from '../src/lib/db';

async function main() {
  console.log('🧹 Clearing all audit documents, versions, reviews, and audit logs...');
  try {
    clearDocumentsOnly();
    console.log('✓ Successfully cleared all documents. System is in fresh, empty state.');
    console.log('✓ Demo user accounts preserved: client@demo.com, auditor@demo.com, admin@demo.com');
    console.log('✓ You can now test uploading brand new documents from scratch without demo records.');
    console.log('\nRun "npm run seed:demo" if you ever want to re-populate sample records.');
  } catch (err) {
    console.error('Failed to clear documents:', err);
    process.exit(1);
  }
}

main();
