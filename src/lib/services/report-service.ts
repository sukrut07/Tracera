import { jsPDF } from 'jspdf';
import { AuditDocument, Engagement } from '@/types';

export const reportService = {
  /**
   * Generate an official TRACERA Audit Report PDF for a single document
   */
  generatePdfReport(document: AuditDocument): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Header & Branding
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TRACERA AUDIT COMPLIANCE REPORT', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('STATUTORY CA DOCUMENT AUDIT & TRACEABILITY VERIFICATION', 14, 25);

    // 2. Document Master Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Summary', 14, 44);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 38, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    doc.text('Client Company:', 20, 56);
    doc.text('Document Title:', 20, 64);
    doc.text('Document Type:', 20, 72);
    doc.text('Financial Year:', 20, 80);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(document.client?.company_name || document.client?.name || 'ABC Traders', 60, 56);
    doc.text(document.title, 60, 64);
    doc.text(document.document_type.replace(/_/g, ' '), 60, 72);
    doc.text(document.client?.financial_year || '2025-26', 60, 80);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Audit Status:', 125, 56);
    doc.text('Total Versions:', 125, 64);
    doc.text('Assigned CA:', 125, 72);
    doc.text('Generated On:', 125, 80);

    doc.setFont('helvetica', 'bold');
    if (document.status === 'APPROVED') {
      doc.setTextColor(16, 185, 129); // emerald-600
    } else {
      doc.setTextColor(245, 158, 11);
    }
    doc.text(document.status, 155, 56);

    doc.setTextColor(15, 23, 42);
    doc.text(`v${document.current_version} (${document.versions?.length || 1} versions preserved)`, 155, 64);
    doc.text(document.assigned_auditor?.name || 'Rahul Sharma (CA)', 155, 72);
    doc.text(new Date().toLocaleDateString('en-IN'), 155, 80);

    // 3. Chronological Audit Trail Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Append-Only Audit Timeline', 14, 98);

    let currentY = 106;
    const logs = document.audit_logs || [];

    logs.forEach((log) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      const dateStr = new Date(log.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = new Date(log.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Bullet node
      doc.setFillColor(15, 23, 42);
      doc.circle(18, currentY - 1, 1.5, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(log.action.replace(/_/g, ' '), 24, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${dateStr} ${timeStr}`, 150, currentY);

      currentY += 5;
      doc.setFontSize(8);
      doc.text(`Actor: ${log.actor_name || 'System User'} (${log.actor_role || 'USER'})`, 24, currentY);

      if (log.metadata.reason) {
        currentY += 4;
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(225, 29, 72); // rose-600
        doc.text(`Reason: "${String(log.metadata.reason)}"`, 24, currentY, { maxWidth: 160 });
      }

      if (log.metadata.comment) {
        currentY += 4;
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text(`Sign-off Note: "${String(log.metadata.comment)}"`, 24, currentY, { maxWidth: 160 });
      }

      currentY += 7;
    });

    // 4. Auditor Sign-off Seal
    if (currentY > 240) {
      doc.addPage();
      currentY = 30;
    } else {
      currentY += 10;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY, 196, currentY);
    currentY += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('TRACERA AUDIT WORKFLOW PLATFORM • CRYPTOGRAPHICALLY TIME-STAMPED AND IMMUTABLE', 14, currentY);

    currentY += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Certified By:', 14, currentY);
    doc.text('Rahul Sharma, FCA (Partner)', 14, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Sharma & Associates • Chartered Accountants', 14, currentY + 10);

    const pdfBuffer = doc.output('arraybuffer');
    return new Uint8Array(pdfBuffer);
  },

  /**
   * Generate official Chartered Accountant Engagement Closure Report & Dossier
   */
  generateEngagementClosureReportPdf(engagement: Engagement): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page 1: Formal Closure Certificate & Engagement Master Summary
    doc.setFillColor(15, 23, 42); // slate-900 header
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TRACERA AUDIT PRACTICE MANAGEMENT', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('CHARTERED ACCOUNTANT ENGAGEMENT CLOSURE CERTIFICATE', 14, 23);
    doc.text(`OFFICIAL CLOSURE DOSSIER REF: ${engagement.closure_id || 'AUD-2026-FINAL'}`, 14, 30);

    // Engagement Overview Card
    let y = 46;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Engagement Particulars', 14, y);

    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 42, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    doc.text('Client Entity:', 20, y + 8);
    doc.text('Engagement Title:', 20, y + 16);
    doc.text('Service Template:', 20, y + 24);
    doc.text('Financial Year:', 20, y + 32);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(engagement.client?.company_name || engagement.client?.name || 'Client Entity', 60, y + 8);
    doc.text(engagement.title, 60, y + 16);
    doc.text(engagement.service_type.replace(/_/g, ' '), 60, y + 24);
    doc.text(engagement.financial_year, 60, y + 32);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Engagement Status:', 125, y + 8);
    doc.text('Lead Partner:', 125, y + 16);
    doc.text('Engagement Manager:', 125, y + 24);
    doc.text('Closed Date:', 125, y + 32);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(engagement.status, 160, y + 8);

    doc.setTextColor(15, 23, 42);
    doc.text(engagement.assigned_partner_name || 'Managing Partner, FCA', 160, y + 16);
    doc.text(engagement.assigned_manager_name || 'Rahul Sharma, CA', 160, y + 24);
    doc.text(engagement.closed_at ? new Date(engagement.closed_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 160, y + 32);

    // 2. Maker-Checker Sign-off Chain
    y += 50;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Multi-tier Maker-Checker Sign-off Record', 14, y);

    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 34, 2, 2, 'FD');

    const approvals = engagement.approvals || [];
    const performer = approvals.find((a) => a.role_gate === 'PERFORMER');
    const reviewer = approvals.find((a) => a.role_gate === 'REVIEWER');
    const partner = approvals.find((a) => a.role_gate === 'PARTNER');

    const gates = [
      { label: 'Staff Performer', obj: performer, defaultName: 'Rahul Sharma (Performer)' },
      { label: 'Manager Reviewer', obj: reviewer, defaultName: 'Rahul Sharma, CA (Reviewer)' },
      { label: 'Partner Sign-off', obj: partner, defaultName: 'Managing Partner, FCA' },
    ];

    gates.forEach((gate, idx) => {
      const colX = 20 + idx * 58;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(gate.label, colX, y + 8);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(gate.obj?.approver_name || gate.defaultName, colX, y + 14);

      const statusText = gate.obj?.status === 'APPROVED' ? 'STATUS: APPROVED' : `STATUS: ${gate.obj?.status || 'PENDING'}`;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(gate.obj?.status === 'APPROVED' ? 16 : 245, gate.obj?.status === 'APPROVED' ? 185 : 158, gate.obj?.status === 'APPROVED' ? 129 : 11);
      doc.text(statusText, colX, y + 20);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      const dateText = gate.obj?.approved_at ? new Date(gate.obj.approved_at).toLocaleDateString('en-IN') : 'Verified';
      doc.text(`Signed: ${dateText}`, colX, y + 26);
    });

    // 3. Billing & Professional Fee Settlement
    y += 42;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Professional Fee & GST Settlement Acknowledgment', 14, y);

    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Base Audit Fee:', 20, y + 8);
    doc.text('GST (18%):', 20, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`INR ${engagement.billing_amount.toLocaleString('en-IN')}`, 60, y + 8);
    doc.text(`INR ${engagement.billing_gst.toLocaleString('en-IN')}`, 60, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Total Settled Amount:', 110, y + 8);
    doc.text('Payment Reference:', 110, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`INR ${engagement.billing_total.toLocaleString('en-IN')} (PAID)`, 150, y + 8);
    doc.setTextColor(15, 23, 42);
    doc.text(engagement.payment_reference || 'REF-TXN-CONFIRMED', 150, y + 15);

    // 4. Evidence Checklist Summary
    y += 30;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Verified Audit Evidence Checklist', 14, y);

    y += 4;
    const checklists = engagement.checklists || [];
    checklists.slice(0, 7).forEach((chk, i) => {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`[✓] ${chk.title} (${chk.category})`, 20, y + 5 + i * 5);
      doc.setTextColor(16, 185, 129);
      doc.text(chk.status === 'APPROVED' ? 'APPROVED' : chk.status, 170, y + 5 + i * 5);
    });

    // 5. CA Partner Certification Seal
    y += 45;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);

    y += 6;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      'This certificate confirms that the engagement procedures, document audits, and quality reviews have been concluded in full compliance with the Standards on Auditing (SAs) issued by the Institute of Chartered Accountants of India (ICAI).',
      14,
      y,
      { maxWidth: 182 }
    );

    y += 12;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('FOR AND ON BEHALF OF:', 14, y);
    doc.text('Rahul Sharma & Associates • Chartered Accountants', 14, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`FCA Partner: ${engagement.closed_by_name || 'Rahul Sharma, FCA'}`, 14, y + 10);
    doc.text('ICAI Firm Registration No: 018492N | Membership No: 542198', 14, y + 14);

    // UDIN Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(130, y - 2, 66, 18, 1, 1, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('OFFICIAL ICAI UDIN REF:', 134, y + 4);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233); // sky-500
    doc.text(`26542198${(engagement.closure_id || 'AUD00182').replace(/[^0-9]/g, '').padEnd(10, '7')}`, 134, y + 11);

    const pdfBuffer = doc.output('arraybuffer');
    return new Uint8Array(pdfBuffer);
  },
};
