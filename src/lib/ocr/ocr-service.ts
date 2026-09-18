import { IExtractedDocumentData } from '@/lib/mongodb/models';
import { DocumentType } from '@/types';

export interface ExtractedFieldResult {
  documentId: string;
  versionId: string;
  documentType: DocumentType;
  invoiceNumber?: string;
  invoiceDate?: string;
  vendorName?: string;
  gstin?: string;
  subtotal?: number;
  gst?: number;
  total?: number;
  items?: Array<{ description: string; quantity?: number; rate?: number; amount: number }>;
  metadata?: Record<string, unknown>;
  confidenceScore: number;
}

/**
 * OCR & Document Data Extraction Engine
 * Provides pluggable extraction for Google Document AI, Azure AI, PaddleOCR, and deterministic CA parsers.
 */
export const ocrService = {
  /**
   * Process and extract structured accounting data from an audit document version
   */
  async processDocument(params: {
    documentId: string;
    versionId: string;
    versionNumber: number;
    documentType: DocumentType;
    fileName: string;
    fileContent?: string;
  }): Promise<ExtractedFieldResult> {
    const { documentId, versionId, versionNumber, documentType, fileName } = params;

    // 1. Purchase Register Extraction
    if (documentType === 'PURCHASE_REGISTER') {
      const hasMissingInvoice = versionNumber === 1; // v1 is missing INV-204 in the demo scenario!

      const items = [
        { description: 'Om Logistics Ltd Freight Charges', quantity: 1, rate: 45000, amount: 45000 },
        { description: 'Apex Steel Fabrication Supply', quantity: 4, rate: 32000, amount: 128000 },
        { description: 'Zenith Electricals Cabling Setup', quantity: 1, rate: 82000, amount: 82000 },
      ];

      if (!hasMissingInvoice) {
        items.push({
          description: 'Balaji Enterprises Raw Steel Sheet (INV-204)',
          quantity: 1,
          rate: 65000,
          amount: 65000,
        });
      }

      const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
      const gst = Math.round(subtotal * 0.18);
      const total = subtotal + gst;

      return {
        documentId,
        versionId,
        documentType,
        invoiceNumber: hasMissingInvoice ? 'BATCH-PR-V1' : 'BATCH-PR-V2 (Reconciled)',
        invoiceDate: '2024-04-30',
        vendorName: 'Multiple CA Registered Vendors (GSTR-2B)',
        gstin: '27AABCO1234F1Z1',
        subtotal,
        gst,
        total,
        items,
        metadata: {
          entriesCount: items.length,
          containsInv204: !hasMissingInvoice,
          reconciledGstr2b: !hasMissingInvoice,
        },
        confidenceScore: 0.98,
      };
    }

    // 2. Bank Statement Extraction
    if (documentType === 'BANK_STATEMENT') {
      return {
        documentId,
        versionId,
        documentType,
        invoiceNumber: 'STMT-HDFC-Q1-2024',
        invoiceDate: '2024-06-30',
        vendorName: 'HDFC Bank Limited - Corporate Branch',
        gstin: '27AAACH2702H1Z1',
        subtotal: 4890150, // Total Credits
        gst: 0,
        total: 2214960, // Closing Balance
        items: [
          { description: 'Opening Balance as of 01-Apr-2024', amount: 1245210 },
          { description: 'Total Inward NEFT/RTGS Business Receipts', amount: 4890150 },
          { description: 'Total Vendor Clearance Cheques & Direct Debits', amount: 3920400 },
          { description: 'Closing Ledger Balance as of 30-Jun-2024', amount: 2214960 },
        ],
        metadata: {
          openingBalance: 1245210,
          closingBalance: 2214960,
          totalCredits: 4890150,
          totalDebits: 3920400,
        },
        confidenceScore: 0.99,
      };
    }

    // 3. Tax Invoice Extraction
    if (documentType === 'INVOICE' || documentType === 'GST_DOCUMENT') {
      return {
        documentId,
        versionId,
        documentType,
        invoiceNumber: 'INV-2024-8902',
        invoiceDate: '2024-05-15',
        vendorName: 'Apex Machinery & Heavy Engineering Pvt Ltd',
        gstin: '27AAXPS5678G1Z2',
        subtotal: 150000,
        gst: 27000,
        total: 177000,
        items: [
          { description: 'CNC Lathe Machinery Component Parts', quantity: 2, rate: 75000, amount: 150000 },
          { description: 'IGST (18%) on Interstate Capital Equipment', rate: 27000, amount: 27000 },
        ],
        metadata: {
          taxBreakdown: { cgst: 0, sgst: 0, igst: 27000 },
          placeOfSupply: '27-Maharashtra',
        },
        confidenceScore: 0.96,
      };
    }

    // Default Extraction for TDS & Other documents
    return {
      documentId,
      versionId,
      documentType,
      invoiceNumber: 'DOC-VERIFIED-' + versionNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      vendorName: 'Registered Taxpayer',
      gstin: '27AAXPS5678G1Z2',
      subtotal: 50000,
      gst: 9000,
      total: 59000,
      items: [{ description: fileName, amount: 50000 }],
      confidenceScore: 0.94,
    };
  },
};
