import { workflowService } from '../src/lib/workflow/service';
import { getUserByEmail, getDocumentById, getDb } from '../src/lib/db';
import assert from 'assert';

async function runAcceptanceTest() {
  console.log('🚀 Starting OBLIQ Audit Workflow Acceptance Test...');

  const clientUser = getUserByEmail('client@demo.com');
  const auditorUser = getUserByEmail('auditor@demo.com');

  assert(clientUser, 'Client user must exist');
  assert(auditorUser, 'Auditor user must exist');
  console.log('✓ Users authenticated:', clientUser.name, '&', auditorUser.name);

  // STEP 1 & 2 & 3: Client uploads Purchase Register
  console.log('\n--- Test 1: Client submits Purchase Register ---');
  const initialDoc = await workflowService.submitDocument(clientUser, {
    clientId: clientUser.client_id!,
    uploaderId: clientUser.id,
    title: 'Automated Test Purchase Register 2024',
    documentType: 'PURCHASE_REGISTER',
    fileName: 'test_purchase_register_v1.xlsx',
    filePath: '/sample-files/purchase_register_demo.csv',
    fileSize: 45000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    notes: 'Initial monthly submission for audit check',
  });

  assert.strictEqual(initialDoc.status, 'SUBMITTED', 'Status must be SUBMITTED');
  assert.strictEqual(initialDoc.current_version, 1, 'Current version must be 1');
  assert.strictEqual(initialDoc.versions?.length, 1, 'Must have exactly 1 version');
  console.log('✓ Document created in state:', initialDoc.status, 'Version:', initialDoc.current_version);

  // STEP 4: Auditor starts review
  console.log('\n--- Test 2: Auditor starts review ---');
  const underReviewDoc = await workflowService.startReview(auditorUser, initialDoc.id);
  assert.strictEqual(underReviewDoc.status, 'UNDER_REVIEW', 'Status must transition to UNDER_REVIEW');
  console.log('✓ Status transitioned to:', underReviewDoc.status);

  // STEP 5: Security test - Client cannot approve
  console.log('\n--- Test 3: Security check - Client cannot approve document ---');
  let clientApproveFailed = false;
  try {
    await workflowService.approveDocument(clientUser, {
      documentId: initialDoc.id,
      auditorId: clientUser.id,
    });
  } catch (err: any) {
    clientApproveFailed = true;
    assert.strictEqual(err.statusCode, 403, 'Must return 403 Forbidden for client approval');
  }
  assert(clientApproveFailed, 'Client approval attempt must fail');
  console.log('✓ Security verified: Client unauthorized to approve (403 Forbidden)');

  // STEP 6: Auditor requests correction
  console.log('\n--- Test 4: Auditor requests correction ---');
  const correctionReason = 'Invoice INV-204 is missing from the purchase register. Please correct and re-upload.';
  const correctionDoc = await workflowService.requestCorrection(auditorUser, {
    documentId: initialDoc.id,
    auditorId: auditorUser.id,
    reason: correctionReason,
    priority: 'HIGH',
  });
  assert.strictEqual(correctionDoc.status, 'CORRECTION_REQUIRED', 'Status must be CORRECTION_REQUIRED');
  assert.strictEqual(correctionDoc.current_review?.comment, correctionReason, 'Review comment must match reason');
  console.log('✓ Status transitioned to:', correctionDoc.status, 'with reason:', correctionReason);

  // STEP 7: Security check - Auditor cannot upload client correction
  console.log('\n--- Test 5: Security check - Auditor cannot upload correction ---');
  let auditorUploadFailed = false;
  try {
    await workflowService.uploadCorrection(auditorUser, {
      documentId: initialDoc.id,
      clientId: clientUser.client_id!,
      uploaderId: auditorUser.id,
      fileName: 'invalid.xlsx',
      filePath: '/invalid',
    });
  } catch (err: any) {
    auditorUploadFailed = true;
    assert.strictEqual(err.statusCode, 403);
  }
  assert(auditorUploadFailed, 'Auditor uploading correction must fail');
  console.log('✓ Security verified: Auditor unauthorized to upload client correction');

  // STEP 8: Client uploads Version 2
  console.log('\n--- Test 6: Client uploads Version 2 ---');
  const v2Doc = await workflowService.uploadCorrection(clientUser, {
    documentId: initialDoc.id,
    clientId: clientUser.client_id!,
    uploaderId: clientUser.id,
    fileName: 'test_purchase_register_v2.xlsx',
    filePath: '/sample-files/purchase_register_demo.csv',
    fileSize: 52000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    notes: 'Re-uploaded with missing invoice INV-204 added.',
  });
  assert.strictEqual(v2Doc.status, 'SUBMITTED', 'Status must return to SUBMITTED');
  assert.strictEqual(v2Doc.current_version, 2, 'Current version must be 2');
  assert.strictEqual(v2Doc.versions?.length, 2, 'Both v1 and v2 must be preserved');
  console.log('✓ Version 2 created. Current version:', v2Doc.current_version, 'Status:', v2Doc.status);
  console.log('✓ Version 1 preserved:', v2Doc.versions?.find((v) => v.version_number === 1)?.file_name);
  console.log('✓ Version 2 registered:', v2Doc.versions?.find((v) => v.version_number === 2)?.file_name);

  // STEP 9: Auditor reviews and approves Version 2
  console.log('\n--- Test 7: Auditor reviews and approves Version 2 ---');
  await workflowService.startReview(auditorUser, v2Doc.id);
  const approvedDoc = await workflowService.approveDocument(auditorUser, {
    documentId: v2Doc.id,
    auditorId: auditorUser.id,
    comment: 'Verified invoice INV-204 and reconciled with ICEGATE and GST portal. Approved.',
  });
  assert.strictEqual(approvedDoc.status, 'APPROVED', 'Status must be APPROVED');
  console.log('✓ Document successfully approved! Status:', approvedDoc.status);

  // STEP 10: Verify complete tamper-evident audit history
  console.log('\n--- Test 8: Complete Audit Log History Verification ---');
  const finalDoc = getDocumentById(initialDoc.id);
  assert(finalDoc, 'Final document must exist');
  assert(finalDoc.audit_logs && finalDoc.audit_logs.length >= 6, 'Audit logs must contain all actions');

  console.log('Chronological Audit Trail:');
  finalDoc.audit_logs.forEach((log, index) => {
    console.log(`  ${index + 1}. [${log.action}] by ${log.actor_name} (${log.actor_role}) - Meta:`, JSON.stringify(log.metadata));
  });

  const actions = finalDoc.audit_logs.map((l) => l.action);
  assert(actions.includes('DOCUMENT_UPLOADED'), 'Must include DOCUMENT_UPLOADED');
  assert(actions.includes('DOCUMENT_ASSIGNED'), 'Must include DOCUMENT_ASSIGNED');
  assert(actions.includes('REVIEW_STARTED'), 'Must include REVIEW_STARTED');
  assert(actions.includes('CORRECTION_REQUESTED'), 'Must include CORRECTION_REQUESTED');
  assert(actions.includes('CORRECTION_UPLOADED'), 'Must include CORRECTION_UPLOADED');
  assert(actions.includes('DOCUMENT_APPROVED'), 'Must include DOCUMENT_APPROVED');

  console.log('\n🎉 ALL 8 BACKEND ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
}

runAcceptanceTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
