import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function testHttpWorkflow() {
  console.log('🌐 Running HTTP End-to-End Workflow Test against live Next.js server...');

  // STEP 1: Login as client@demo.com
  console.log('\n1. POST /api/auth/login as client@demo.com');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@demo.com' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok, 'Login must succeed');
  assert.strictEqual(loginData.user.role, 'CLIENT');
  const clientCookie = loginRes.headers.get('set-cookie');
  console.log('✓ Client logged in:', loginData.user.name, 'Role:', loginData.user.role);

  // STEP 2: Client queries documents
  console.log('\n2. GET /api/documents as Client');
  const docsRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Cookie: clientCookie || '' },
  });
  const docsData = await docsRes.json();
  assert(docsRes.ok);
  assert(Array.isArray(docsData.documents));
  console.log(`✓ Retrieved ${docsData.documents.length} client documents. Stats:`, docsData.stats);

  // STEP 3: Client uploads a new document
  console.log('\n3. POST /api/documents/upload as Client');
  const formData = new FormData();
  formData.append('title', 'E2E Demo Purchase Register 2024');
  formData.append('documentType', 'PURCHASE_REGISTER');
  formData.append('clientId', loginData.user.client_id);
  formData.append('notes', 'Monthly register uploaded for quarterly audit verification');
  const fileContent = 'Invoice,Date,Amount\nINV-01,2024-04-01,10000\nINV-02,2024-04-02,25000';
  const blob = new Blob([fileContent], { type: 'text/csv' });
  formData.append('file', blob, 'purchase_register_v1.csv');

  const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Cookie: clientCookie || '' },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.ok, `Upload must succeed: ${JSON.stringify(uploadData)}`);
  const newDocId = uploadData.document.id;
  assert.strictEqual(uploadData.document.status, 'SUBMITTED');
  assert.strictEqual(uploadData.document.current_version, 1);
  console.log('✓ Document uploaded successfully! ID:', newDocId, 'Status:', uploadData.document.status);

  // STEP 4: Login as auditor@demo.com
  console.log('\n4. POST /api/auth/login as auditor@demo.com');
  const auditorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'auditor@demo.com' }),
  });
  const auditorLoginData = await auditorLoginRes.json();
  const auditorCookie = auditorLoginRes.headers.get('set-cookie');
  assert.strictEqual(auditorLoginData.user.role, 'AUDITOR');
  console.log('✓ Auditor logged in:', auditorLoginData.user.name, 'Role:', auditorLoginData.user.role);

  // STEP 5: Auditor sees new document in review queue
  console.log('\n5. GET /api/documents as Auditor');
  const auditorDocsRes = await fetch(`${BASE_URL}/api/documents`, {
    headers: { Cookie: auditorCookie || '' },
  });
  const auditorDocsData = await auditorDocsRes.json();
  const targetInQueue = auditorDocsData.documents.find((d: any) => d.id === newDocId);
  assert(targetInQueue, 'New document must appear in auditor queue');
  assert.strictEqual(targetInQueue.status, 'SUBMITTED');
  console.log('✓ Document found in auditor queue. Status:', targetInQueue.status);

  // STEP 6: Auditor requests correction
  console.log('\n6. POST /api/workflow/action (REQUEST_CORRECTION) as Auditor');
  const correctionReason = 'Invoice INV-204 is missing from the purchase register. Please update the register and re-upload the corrected version.';
  const reqCorrectionRes = await fetch(`${BASE_URL}/api/workflow/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: auditorCookie || '',
    },
    body: JSON.stringify({
      action: 'REQUEST_CORRECTION',
      documentId: newDocId,
      reason: correctionReason,
      priority: 'HIGH',
    }),
  });
  const reqCorrectionData = await reqCorrectionRes.json();
  assert(reqCorrectionRes.ok);
  assert.strictEqual(reqCorrectionData.document.status, 'CORRECTION_REQUIRED');
  console.log('✓ Correction requested. Status:', reqCorrectionData.document.status);

  // STEP 7: Switch back to client - verify document is CORRECTION_REQUIRED
  console.log('\n7. GET /api/documents/[id] as Client');
  const clientCheckRes = await fetch(`${BASE_URL}/api/documents/${newDocId}`, {
    headers: { Cookie: clientCookie || '' },
  });
  const clientCheckData = await clientCheckRes.json();
  assert.strictEqual(clientCheckData.document.status, 'CORRECTION_REQUIRED');
  assert.strictEqual(clientCheckData.document.current_review.comment, correctionReason);
  console.log('✓ Client sees status: CORRECTION_REQUIRED. Reason verified:', clientCheckData.document.current_review.comment);

  // STEP 8: Client uploads corrected version 2
  console.log('\n8. POST /api/documents/[id]/correction as Client');
  const v2FormData = new FormData();
  const v2Content = 'Invoice,Date,Amount\nINV-01,2024-04-01,10000\nINV-02,2024-04-02,25000\nINV-204,2024-04-25,65000';
  const v2Blob = new Blob([v2Content], { type: 'text/csv' });
  v2FormData.append('file', v2Blob, 'purchase_register_v2.csv');
  v2FormData.append('notes', 'Added missing invoice INV-204');

  const uploadV2Res = await fetch(`${BASE_URL}/api/documents/${newDocId}/correction`, {
    method: 'POST',
    headers: { Cookie: clientCookie || '' },
    body: v2FormData,
  });
  const uploadV2Data = await uploadV2Res.json();
  assert(uploadV2Res.ok);
  assert.strictEqual(uploadV2Data.document.status, 'SUBMITTED');
  assert.strictEqual(uploadV2Data.document.current_version, 2);
  console.log('✓ Version 2 uploaded! Status:', uploadV2Data.document.status, 'Version:', uploadV2Data.document.current_version);

  // STEP 9: Auditor reviews and approves Version 2
  console.log('\n9. POST /api/workflow/action (APPROVE) as Auditor');
  const approveRes = await fetch(`${BASE_URL}/api/workflow/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: auditorCookie || '',
    },
    body: JSON.stringify({
      action: 'APPROVE',
      documentId: newDocId,
      comment: 'Reconciled with GSTR-2B. All invoice amounts verified. Approved.',
    }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.ok);
  assert.strictEqual(approveData.document.status, 'APPROVED');
  console.log('✓ Auditor approved document. Status:', approveData.document.status);

  // STEP 10: Client verifies final APPROVED status
  console.log('\n10. GET /api/documents/[id] as Client');
  const finalClientCheck = await fetch(`${BASE_URL}/api/documents/${newDocId}`, {
    headers: { Cookie: clientCookie || '' },
  });
  const finalData = await finalClientCheck.json();
  assert.strictEqual(finalData.document.status, 'APPROVED');
  assert.strictEqual(finalData.document.versions.length, 2);
  console.log('✓ Client confirms final status: APPROVED across 2 preserved versions');

  // STEP 11: Audit History Timeline Verification
  console.log('\n11. Inspecting Audit History Logs:');
  finalData.document.audit_logs.forEach((log: any, idx: number) => {
    console.log(`  ${idx + 1}. [${log.action}] by ${log.actor_name} (${log.actor_role})`);
  });

  const actions = finalData.document.audit_logs.map((l: any) => l.action);
  assert(actions.includes('DOCUMENT_UPLOADED'));
  assert(actions.includes('DOCUMENT_ASSIGNED'));
  assert(actions.includes('CORRECTION_REQUESTED'));
  assert(actions.includes('CORRECTION_UPLOADED'));
  assert(actions.includes('DOCUMENT_APPROVED'));

  console.log('\n🎉 FULL 11-STEP HTTP WORKFLOW TEST PASSED WITH 100% SUCCESS!');
}

testHttpWorkflow().catch((err) => {
  console.error('HTTP Test failed:', err);
  process.exit(1);
});
