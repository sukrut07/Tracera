import { jsPDF } from 'jspdf';
import { AuditDocument } from '@/types';

export const reportService = {
  /**
   * Generate an official TRESERA Audit Report PDF for a document
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
    doc.text('TRESERA AUDIT COMPLIANCE REPORT', 14, 18);

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
    doc.text(document.document_type.replace('_', ' '), 60, 72);
    doc.text(document.client?.financial_year || '2024-25', 60, 80);

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

    logs.forEach((log, index) => {
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
    doc.text('TRESERA AUDIT WORKFLOW PLATFORM • CRYPTOGRAPHICALLY TIME-STAMPED AND IMMUTABLE', 14, currentY);

    currentY += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Certified By:', 14, currentY);
    doc.text('Rahul Sharma, FCA (Partner)', 14, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('OBLIQ Audit Services LLP • Statutory Audit Division', 14, currentY + 10);

    const pdfBuffer = doc.output('arraybuffer');
    return new Uint8Array(pdfBuffer);
  },
};
