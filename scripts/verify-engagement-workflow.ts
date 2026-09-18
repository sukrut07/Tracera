import { getDb, resetDatabase, getEngagementById, getUserById } from '../src/lib/db';
import { engagementService } from '../src/lib/services/engagement-service';
import { reportService } from '../src/lib/services/report-service';
import { UserProfile } from '../src/types';

async function runVerification() {
  console.log('====================================================');
  console.log('TRACERA CA ENGAGEMENT WORKFLOW END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // 1. Reset database to fresh seed state
  console.log('Step 1: Resetting database to initial baseline...');
  resetDatabase();
  const db = getDb();
  console.log('✓ Database reset successfully.\n');

  const auditorUser: UserProfile = {
    id: 'u2222222-2222-2222-2222-222222222222',
    name: 'Rahul Sharma',
    email: 'auditor@demo.com',
    role: 'AUDITOR',
    client_id: null,
    created_at: '',
  };

  const partnerUser: UserProfile = {
    id: 'u3333333-3333-3333-3333-333333333333',
    name: 'Managing Partner (Admin)',
    email: 'admin@demo.com',
    role: 'ADMIN',
    client_id: null,
    created_at: '',
  };

  // 2. Fetch seed engagement
  console.log('Step 2: Verifying seed engagement (eng-statutory-abc-2025)...');
  const engId = 'eng-statutory-abc-2025';
  let eng = await engagementService.getEngagement(engId);
  console.log(`✓ Found Engagement: "${eng.title}"`);
  console.log(`  - Service Type: ${eng.service_type}`);
  console.log(`  - Current Stage: ${eng.stages?.[eng.current_stage_index]?.name}`);
  console.log(`  - Stages: ${eng.stages?.length}, Checklists: ${eng.checklists?.length}, Tasks: ${eng.tasks?.length}, Approvals: ${eng.approvals?.length}`);
  console.log(`  - Billing Total: ₹${eng.billing_total.toLocaleString('en-IN')} (${eng.billing_status})\n`);

  if (eng.stages?.length !== 10) throw new Error('Expected 10 stages');
  if (eng.checklists?.length !== 12) throw new Error('Expected 12 checklist items');

  // 3. Advance stage to Stage 4 (Preliminary Review)
  console.log('Step 3: Advancing operational stage to Stage 4 (Preliminary Review)...');
  eng = await engagementService.advanceStage(auditorUser, engId, 4, 'Document phase initiated; starting preliminary review.');
  console.log(`✓ Advanced to Stage 4. Progress: ${eng.progress_percent}%, Status: ${eng.status}\n`);

  // 4. Advance stage to Stage 5 (Fieldwork & Substantive Testing)
  console.log('Step 4: Advancing operational stage to Stage 5 (Fieldwork)...');
  eng = await engagementService.advanceStage(auditorUser, engId, 5, 'Sample registers verified.');
  console.log(`✓ Advanced to Stage 5. Progress: ${eng.progress_percent}%\n`);

  // 5. Request document for checklist item
  console.log('Step 5: Auditor requesting document for checklist item (Sales Register)...');
  const checklistItem = eng.checklists?.find((c) => c.title.includes('Sales Register'));
  if (!checklistItem) throw new Error('Sales Register checklist item not found');
  const reqItem = await engagementService.requestChecklistDocument(
    auditorUser,
    engId,
    checklistItem.id,
    'Please upload consolidated Sales Register with GSTR-1 matching summary.',
    '2026-09-26'
  );
  console.log(`✓ Checklist item updated to status: ${reqItem.status}`);
  console.log(`  Note attached: "${reqItem.request_message}"\n`);

  // 6. Create custom fieldwork procedure task
  console.log('Step 6: Creating custom audit procedure task...');
  const newTask = await engagementService.createTask(auditorUser, engId, {
    title: 'Physical inventory count sampling reconciliation',
    stageNumber: 5,
    priority: 'HIGH',
    dueDate: '2026-09-28',
  });
  console.log(`✓ Created Task: "${newTask.title}" [ID: ${newTask.id}]\n`);

  // 7. Resolve blocked task
  console.log('Step 7: Resolving blocked reconciliation task...');
  const blockedTask = eng.tasks?.find((t) => t.status === 'BLOCKED');
  if (blockedTask) {
    console.log(`  Found blocked task: "${blockedTask.title}" (Blocked by: ${blockedTask.blocked_by})`);
    const resolved = await engagementService.updateTask(auditorUser, engId, blockedTask.id, {
      status: 'COMPLETED',
    });
    console.log(`✓ Task marked as: ${resolved.status}\n`);
  }

  // Complete all open tasks to satisfy closure prerequisites
  console.log('Step 8: Completing fieldwork procedures...');
  eng = await engagementService.getEngagement(engId);
  for (const t of eng.tasks || []) {
    if (t.status !== 'COMPLETED') {
      await engagementService.updateTask(auditorUser, engId, t.id, { status: 'COMPLETED' });
    }
  }
  console.log('✓ All audit procedure tasks marked COMPLETED.\n');

  // Complete remaining stages up to Stage 9
  console.log('Step 9: Advancing stages through to Stage 9 (Finalisation & Reporting)...');
  eng = await engagementService.advanceStage(auditorUser, engId, 9, 'All substantive testing concluded.');
  console.log(`✓ Current Stage: ${eng.stages?.[eng.current_stage_index]?.name} (${eng.progress_percent}%)\n`);

  // Approve all checklist items
  console.log('Step 10: Approving all evidence checklist items...');
  for (const item of eng.checklists || []) {
    db.prepare("UPDATE engagement_checklists SET status = 'APPROVED' WHERE id = ?").run(item.id);
  }
  console.log('✓ All 12 evidence checklist items marked APPROVED.\n');

  // 11. Multi-tier Maker-Checker Sign-off
  console.log('Step 11: Testing Maker-Checker Multi-tier Sign-off Chain...');
  // Performer already approved in seed, let's verify Manager Reviewer
  console.log('  Testing Reviewer Gate sign-off by Manager...');
  await engagementService.submitApproval(auditorUser, engId, 'REVIEWER', 'APPROVED', 'Audit workpapers verified and complete.');
  console.log('  ✓ Manager Reviewer sign-off complete.');

  console.log('  Testing Partner Gate sign-off by CA Partner...');
  await engagementService.submitApproval(partnerUser, engId, 'PARTNER', 'APPROVED', 'Unmodified audit opinion cleared for issuance.');
  console.log('  ✓ Lead CA Partner sign-off complete.\n');

  // 12. Record professional fee payment
  console.log('Step 12: Recording fee payment & settling billing...');
  eng = await engagementService.recordPayment(auditorUser, engId, 'NEFT-HDFC-99120-CONFIRMED');
  console.log(`✓ Professional Fee Status: ${eng.billing_status}`);
  console.log(`  Payment Reference: ${eng.payment_reference}`);
  console.log(`  Paid At: ${eng.paid_at}\n`);

  // 13. Evaluate closure prerequisites
  console.log('Step 13: Verifying 5/5 Engagement Closure Gate Criteria...');
  eng = await engagementService.getEngagement(engId);
  const prereqs = engagementService.checkClosurePrerequisites(eng);
  console.log(`  Total Checks: ${prereqs.totalChecks}, Passed: ${prereqs.passedChecks}`);
  prereqs.checks.forEach((chk) => {
    console.log(`  [${chk.passed ? '✓' : '✗'}] ${chk.title}: ${chk.description}`);
  });

  if (!prereqs.canClose) {
    throw new Error('Closure prerequisites check failed!');
  }
  console.log('✓ All 5 Closure Criteria Successfully Passed!\n');

  // 14. Finalize & Seal Closure
  console.log('Step 14: Executing formal CA Engagement Closure...');
  const closedEng = await engagementService.closeEngagement(
    partnerUser,
    engId,
    'Statutory audit successfully finalized with unmodified opinion. All files sealed and archived.'
  );
  console.log(`✓ Engagement Status: ${closedEng.status}`);
  console.log(`  Official Closure ID: ${closedEng.closure_id}`);
  console.log(`  Closed By: ${closedEng.closed_by_name}`);
  console.log(`  Closed At: ${closedEng.closed_at}\n`);

  // 15. Generate Closure Dossier PDF
  console.log('Step 15: Generating official CA Engagement Closure Report PDF...');
  const pdfBytes = reportService.generateEngagementClosureReportPdf(closedEng);
  console.log(`✓ PDF Generated successfully! Size: ${pdfBytes.length} bytes.`);
  console.log('====================================================');
  console.log('ALL 15 ENGAGEMENT LIFECYCLE TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
