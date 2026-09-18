/**
 * Synthetic Indian Business Datasets for Audit Testing
 * Grounded in publicly available synthetic formats:
 * - HuggingFace Indian Bank Statements (UPI, NEFT, IMPS, RTGS)
 * - Synthetic Indian Finance Data (GST, Purchase Registers, GSTR-2B)
 * - Invoice Sandbox Benchmark (Tax Invoices, Itemized Ledger)
 * - Central Board of Direct Taxes Form 26AS TDS format
 * 
 * Safe test data only — zero real client or banking information.
 */

export interface SyntheticSampleFile {
  key: string;
  title: string;
  documentType: 'BANK_STATEMENT' | 'PURCHASE_REGISTER' | 'INVOICE' | 'GST_DOCUMENT' | 'TDS_CERTIFICATE';
  category: 'Banking' | 'Ledgers' | 'GST & Taxes' | 'Invoices' | 'Direct Tax';
  fileName: string;
  description: string;
  notes: string;
  badge: string;
  content: string;
}

export const SYNTHETIC_SAMPLE_DATASETS: SyntheticSampleFile[] = [
  {
    key: 'bank_statement',
    title: 'HDFC Current Account Statement Q1 2024-25',
    documentType: 'BANK_STATEMENT',
    category: 'Banking',
    fileName: 'HDFC_Current_Account_Q1_2024-25.csv',
    description: 'Synthetic Indian Bank Statement with UPI, NEFT, IMPS & RTGS transactions (AgamiAI format)',
    notes: 'Q1 Current account transactions reconciled with general ledger and statutory challans.',
    badge: 'HuggingFace / AgamiAI',
    content: `Txn Date,Value Date,Description,Ref / Cheque No,Debit (INR),Credit (INR),Balance (INR)
01/04/2024,01/04/2024,OPENING BALANCE,NA,0.00,0.00,1245210.00
02/04/2024,02/04/2024,RTGS CR-HDFCR520240402001-APEX ENTERPRISES,RTGS94827104,0.00,450000.00,1695210.00
05/04/2024,05/04/2024,NEFT DR-OM LOGISTICS FREIGHT INV 101,N09524018274,53100.00,0.00,1642110.00
10/04/2024,10/04/2024,UPI/410123847291/SUPPLIES/ICICI/RAW MATERIAL,UPI4101238472,15000.00,0.00,1627110.00
12/04/2024,12/04/2024,RTGS DR-APEX STEEL FABRICATION INV 102,RTGS84910284,151040.00,0.00,1476070.00
18/04/2024,18/04/2024,IMPS DR-410827392182-ZENITH ELECTRICALS,IMPS410827392,96760.00,0.00,1379310.00
25/04/2024,25/04/2024,NEFT DR-BALAJI ENTERPRISES INV 204,N09524098231,76700.00,0.00,1302610.00
30/04/2024,30/04/2024,GST E-PAYMENT CHALAN-CBIC TAX REVENUE,CHALAN849102,45900.00,0.00,1256710.00`,
  },
  {
    key: 'purchase_register_v1',
    title: 'Purchase Register Q1 FY 2024-25 (v1 Discrepancy)',
    documentType: 'PURCHASE_REGISTER',
    category: 'Ledgers',
    fileName: 'Purchase_Register_FY24-25_v1.csv',
    description: 'Purchase Register with missing invoice INV-204 (triggers correction request)',
    notes: 'Initial monthly submission. Missing invoice INV-204 from Balaji Enterprises.',
    badge: 'Discrepancy Fixture',
    content: `Date,Invoice Number,Supplier Name,GSTIN,Taxable Value,CGST,SGST,IGST,Total Amount
2024-04-05,INV-101,Om Logistics Ltd,27AABCO1234F1Z1,45000,4050,4050,0,53100
2024-04-12,INV-102,Apex Steel Fabrication,27AAXPS5678G1Z2,128000,11520,11520,0,151040
2024-04-18,INV-103,Zenith Electricals,07ZZZEN9012H1Z5,82000,0,0,14760,96760`,
  },
  {
    key: 'purchase_register_v2',
    title: 'Purchase Register Q1 FY 2024-25 (v2 Reconciled)',
    documentType: 'PURCHASE_REGISTER',
    category: 'Ledgers',
    fileName: 'Purchase_Register_FY24-25_v2_Reconciled.csv',
    description: 'Reconciled Purchase Register with missing invoice INV-204 added',
    notes: 'Re-uploaded with missing invoice INV-204 from Balaji Enterprises added. Reconciled with GSTR-2B.',
    badge: 'Reconciled Fixture',
    content: `Date,Invoice Number,Supplier Name,GSTIN,Taxable Value,CGST,SGST,IGST,Total Amount
2024-04-05,INV-101,Om Logistics Ltd,27AABCO1234F1Z1,45000,4050,4050,0,53100
2024-04-12,INV-102,Apex Steel Fabrication,27AAXPS5678G1Z2,128000,11520,11520,0,151040
2024-04-18,INV-103,Zenith Electricals,07ZZZEN9012H1Z5,82000,0,0,14760,96760
2024-04-25,INV-204,Balaji Enterprises,27AABTB3456J1Z9,65000,5850,5850,0,76700`,
  },
  {
    key: 'gstr2b',
    title: 'GSTR-2B Auto-Drafted ITC Statement Q1 2024-25',
    documentType: 'GST_DOCUMENT',
    category: 'GST & Taxes',
    fileName: 'GSTR2B_AutoDrafted_ITC_Q1_2024-25.csv',
    description: 'Synthetic GSTR-2B ITC statement from GST Portal',
    notes: 'Portal auto-drafted ITC statement confirming supplier filings and eligibility.',
    badge: 'GST Portal ITC',
    content: `GSTIN of Supplier,Trade Name,Invoice Number,Invoice Date,Invoice Value,Taxable Value,Integrated Tax,Central Tax,State Tax,GSTR-1 Filing Date
27AABCO1234F1Z1,Om Logistics Ltd,INV-101,2024-04-05,53100.00,45000.00,0.00,4050.00,4050.00,11-05-2024
27AAXPS5678G1Z2,Apex Steel Fabrication,INV-102,2024-04-12,151040.00,128000.00,0.00,11520.00,11520.00,10-05-2024
07ZZZEN9012H1Z5,Zenith Electricals,INV-103,2024-04-18,96760.00,82000.00,14760.00,0.00,0.00,11-05-2024
27AABTB3456J1Z9,Balaji Enterprises,INV-204,2024-04-25,76700.00,65000.00,0.00,5850.00,5850.00,11-05-2024`,
  },
  {
    key: 'tax_invoice_inv204',
    title: 'Balaji Enterprises Raw Steel Tax Invoice INV-204',
    documentType: 'INVOICE',
    category: 'Invoices',
    fileName: 'Tax_Invoice_INV204_Balaji_Enterprises.csv',
    description: 'Individual Tax Invoice INV-204 supporting the discrepancy resolution',
    notes: 'Supporting statutory tax invoice from registered supplier Balaji Enterprises.',
    badge: 'Tax Invoice',
    content: `Field,Value
Invoice Number,INV-204
Invoice Date,2024-04-25
Seller Name,Balaji Enterprises Private Limited
Seller GSTIN,27AABTB3456J1Z9
Buyer Name,ABC Traders Private Limited
Buyer GSTIN,27AABCO1234F1Z1
HSN/SAC Code,7208 (Flat-rolled products of iron or non-alloy steel)
Item Description,Hot Rolled Steel Sheets 2.5mm
Quantity,1 Metric Ton
Rate (INR),65000.00
Taxable Value,65000.00
CGST Rate,9.0%
CGST Amount,5850.00
SGST Rate,9.0%
SGST Amount,5850.00
Total Invoice Value,76700.00
E-Way Bill No,241098234190`,
  },
  {
    key: 'tds_form26as',
    title: 'Form 26AS Tax Deducted at Source (TDS) Statement',
    documentType: 'TDS_CERTIFICATE',
    category: 'Direct Tax',
    fileName: 'Form26AS_TDS_Summary_Q1_2024-25.csv',
    description: 'Income Tax Department Form 26AS TDS credits under Section 194C & 194J',
    notes: 'Income Tax e-filing statement for verification of tax deducted by enterprise clients.',
    badge: 'CBDT Form 26AS',
    content: `Deductor TAN,Deductor Name,Section,Transaction Date,Booking Date,Amount Paid / Credited (INR),Tax Deducted (INR),Tax Deposited (INR)
MUMB12345C,Om Logistics Ltd,194C (Contractor),2024-04-05,2024-05-07,45000.00,900.00,900.00
PUNB67890D,Apex Steel Fab Pvt Ltd,194C (Contractor),2024-04-12,2024-05-07,128000.00,2560.00,2560.00
DELZ90123E,Zenith Electricals Ltd,194J (Professional),2024-04-18,2024-05-07,82000.00,8200.00,8200.00
MUMB34567F,Balaji Enterprises Pvt Ltd,194C (Contractor),2024-04-25,2024-05-07,65000.00,1300.00,1300.00`,
  },
];
