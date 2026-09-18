import { resetDatabase } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding Trecera Demonstration Dataset into Database...');
  try {
    resetDatabase();
    console.log('✓ Successfully seeded Demo Engagement for ABC Traders & XYZ Enterprises.');
    console.log('✓ Seeded Users: client@demo.com (Client), auditor@demo.com (Auditor), admin@demo.com (Admin)');
    console.log('✓ Seeded Documents across states: SUBMITTED, UNDER_REVIEW, CORRECTION_REQUIRED, APPROVED');
    console.log('✓ Seeded Audit History and version records.');
    console.log('\nReady for evaluation at http://localhost:3000');
  } catch (err) {
    console.error('Failed to seed demo data:', err);
    process.exit(1);
  }
}

main();
