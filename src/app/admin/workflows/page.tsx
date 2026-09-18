import React from 'react';
import Link from 'next/link';
import {
  FileCode,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Award,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

const TEMPLATES = [
  {
    id: 'STATUTORY_AUDIT',
    title: 'STATUTORY AUDIT',
    statute: 'Companies Act 2013 · Section 143',
    stagesCount: 10,
    checklistsCount: 12,
    tasksCount: 5,
    gatesCount: 3,
    stages: [
      '01 Scope & Engagement Letter',
      '02 Independence & Risk Assessment',
      '03 Document Collection & Ingestion',
      '04 Preliminary Review & Sampling',
      '05 Fieldwork & Procedure Execution',
      '06 Substantive Testing & Reconciliations',
      '07 Analytical Review & Ledger Audit',
      '08 Partner Review & Audit Queries',
      '09 Finalisation & Reporting',
      '10 Signed Report, UDIN & Archival',
    ],
    mandatoryDocuments: [
      'Signed Engagement Letter & Board Minutes',
      'Trial Balance (Final Post-Closing)',
      'Bank Statements (All accounts, full FY)',
      'Bank Confirmations / Balance Certificates',
      'Fixed Asset Register & Physical Verification',
      'Depreciation Schedule (Companies Act + IT Act)',
      'Purchase Register with GSTINs & HSN',
      'Sales Register & Revenue Ledgers',
      'GSTR-3B vs GSTR-1 vs Ledger Summary',
      'Form 26AS & AIS / TIS Tax Credits',
      'Inventory Valuation Certificate',
      'Actuarial Valuation for Gratuity & Leave',
    ],
    gates: ['Staff Performer Certification', 'Manager Verification Gate', 'Partner UDIN Sign-off Gate'],
  },
  {
    id: 'TAX_AUDIT',
    title: 'TAX AUDIT',
    statute: 'Income Tax Act 1961 · Section 44AB',
    stagesCount: 8,
    checklistsCount: 10,
    tasksCount: 4,
    gatesCount: 3,
    stages: [
      '01 Scope & Appointment Resolution',
      '02 Accounting Method & Books Verification',
      '03 Document Collection & Schedules',
      '04 Form 3CA/3CD Clause-by-Clause Audit',
      '05 40A(2)(b) & 40(a)(ia) TDS Scrutiny',
      '06 Depreciation & Ratio Analysis',
      '07 Partner Final Review',
      '08 Filing Form 3CA/3CD on e-Filing Portal',
    ],
    mandatoryDocuments: [
      'Form 3CA / 3CD Appointment Letter',
      'Audited Financial Statements with Notes',
      'Depreciation Schedule as per IT Rules (App. I)',
      'TDS / TCS Computation & Quarterly Returns',
      'Section 40A(2)(b) Related Party Register',
      'Section 43B Statutory Dues Payment Challans',
      'Quantitative Inventory Statement (Clause 35)',
      'Foreign Remittance Form 15CA / 15CB Logs',
      'Prior Year Assessment Orders & Appeals',
      'Cash Payment / Receipt Records (Sec 269SS/T)',
    ],
    gates: ['Staff Working Paper Verification', 'Manager Clause Checklist Verification', 'Lead CA Sign-off'],
  },
  {
    id: 'GST_COMPLIANCE',
    title: 'GST AUDIT & RECONCILIATION',
    statute: 'CGST Act 2017 · Section 35(5) / Form GSTR-9 & 9C',
    stagesCount: 6,
    checklistsCount: 8,
    tasksCount: 3,
    gatesCount: 2,
    stages: [
      '01 GSTIN Intake & Engagement Scope',
      '02 Portal Data Download (GSTR-1, 3B, 2B)',
      '03 Reconciliation: Books vs 3B vs 1 vs 2B',
      '04 Ineligible ITC & Reversals Review',
      '05 Drafting Form GSTR-9 & 9C Tables',
      '06 Client Sign-off & Portal Submission',
    ],
    mandatoryDocuments: [
      'Monthly GSTR-1 Summaries (12 Months)',
      'Monthly GSTR-3B Filed Returns & Challans',
      'Consolidated GSTR-2B ITC Matching Matrix',
      'Sales Register with Tax Breakdowns (CGST/SGST/IGST)',
      'Purchase Register with ITC Eligibility Flags',
      'E-Way Bill & E-Invoice Reconciliation Register',
      'Audited Financial Statements (P&L, Balance Sheet)',
      'Input Tax Credit Reversal Schedule (Rule 42/43)',
    ],
    gates: ['GST Practitioner Audit Review', 'Partner Certification & Sign-off'],
  },
  {
    id: 'ITR_FILING',
    title: 'INCOME TAX RETURN FILING (ITR-6 / ITR-5)',
    statute: 'Income Tax Act 1961 · Section 139',
    stagesCount: 5,
    checklistsCount: 6,
    tasksCount: 2,
    gatesCount: 2,
    stages: [
      '01 Client Data Intake & AIS Verification',
      '02 Tax Computation & Chapter VI-A Deductions',
      '03 Advance Tax & MAT (Sec 115JB) Calculation',
      '04 Partner Review & Client Approval',
      '05 E-Verification & Acknowledgement Generation',
    ],
    mandatoryDocuments: [
      'Audited P&L, Balance Sheet and Depreciation Matrix',
      'Form 26AS, AIS, and TIS Statements',
      'Advance Tax & Self-Assessment Tax Challans',
      'Foreign Asset & Income Reporting Schedule (FA)',
      'Brought Forward Loss Register & MAT Credit Ledger',
      'Prior Year ITR-V & Intimation u/s 143(1)',
    ],
    gates: ['Tax Associate Preparation Review', 'Partner e-Verification Sign-off'],
  },
  {
    id: 'INTERNAL_AUDIT',
    title: 'INTERNAL AUDIT & PROCESS TESTING',
    statute: 'Companies Act 2013 · Section 138',
    stagesCount: 7,
    checklistsCount: 9,
    tasksCount: 4,
    gatesCount: 3,
    stages: [
      '01 Audit Charter & Process Scoping',
      '02 Risk & Control Matrix (RCM) Walkthrough',
      '03 Sample Testing of Internal Financial Controls',
      '04 Substantive Walkthroughs & Exception Logging',
      '05 Management Letter of Weaknesses Drafting',
      '06 Management Discussion & Action Plan',
      '07 Final Internal Audit Report to Audit Committee',
    ],
    mandatoryDocuments: [
      'Internal Audit Charter & Terms of Reference',
      'Standard Operating Procedures (SOPs) by Dept',
      'Procure-to-Pay (P2P) Sample Transactions & POs',
      'Order-to-Cash (O2C) Invoice & Dispatch Slips',
      'Payroll Register & Statutory Compliance Deductions',
      'Delegation of Financial Powers (DOFP) Matrix',
      'Fixed Asset Physical Tagging & Ledger Registers',
      'IT General Controls (ITGC) Access & Backup Logs',
      'Prior Quarter Audit Committee Action Taken Report',
    ],
    gates: ['Fieldwork Auditor Sign-off', 'Internal Audit Manager Review', 'Partner Committee Sign-off'],
  },
];

export default async function AdminWorkflowsPage() {
  return (
    <AppShell>
      <div className="space-y-8 font-mono">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-[3px] border-[#0A0A0A]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E73520] uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E73520] animate-pulse" />
              <span>PRACTICE STANDARDS // CA WORKFLOW TEMPLATES</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#0A0A0A] tracking-tight font-sans">
              WORKFLOW TEMPLATES
            </h1>
            <p className="text-xs text-[#4A4A48] mt-1 font-bold">
              5 Pre-configured ICAI Statutory Engagement Blueprints · Stages, Evidence & Gates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auditor/engagements"
              className="neo-btn bg-[#E73520] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span>+ INITIATE ENGAGEMENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="space-y-8">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="neo-box-lg bg-white p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-[#0A0A0A]">
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#E73520] block">
                    TEMPLATE // {tpl.id}
                  </span>
                  <h2 className="text-2xl font-black uppercase text-[#0A0A0A] tracking-tight font-sans">
                    {tpl.title}
                  </h2>
                  <span className="text-xs text-[#777770] font-bold block mt-0.5">
                    Statutory Authority: {tpl.statute}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[#0A0A0A] text-white px-3 py-1 font-bold border border-[#0A0A0A]">
                    {tpl.stagesCount} STAGES
                  </span>
                  <span className="bg-[#5CC8FF] text-[#0A0A0A] px-3 py-1 font-bold border border-[#0A0A0A]">
                    {tpl.checklistsCount} EVIDENCE ITEMS
                  </span>
                  <span className="bg-[#FFD23F] text-[#0A0A0A] px-3 py-1 font-bold border border-[#0A0A0A]">
                    {tpl.gatesCount} MAKER-CHECKER GATES
                  </span>
                </div>
              </div>

              {/* Sequential Stages List */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A] block">
                  1. OPERATIONAL STAGE PROGRESSION ({tpl.stagesCount} SEQUENTIAL GATES):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {tpl.stages.map((stg, i) => (
                    <div
                      key={i}
                      className="p-2 border border-[#0A0A0A] bg-[#F7F5EF] flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-none bg-[#0A0A0A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-bold text-[#0A0A0A] truncate">{stg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Checklist Documents */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A] block">
                  2. MANDATORY EVIDENCE CHECKLIST ({tpl.checklistsCount} ITEMS):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {tpl.mandatoryDocuments.map((doc, i) => (
                    <div
                      key={i}
                      className="p-2 border border-[#0A0A0A] bg-white flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E73520] shrink-0" />
                      <span className="font-medium text-[#222220] truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maker-Checker Gates */}
              <div className="pt-2 border-t-2 border-[#0A0A0A] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-[#0A0A0A]">GATES:</span>
                  {tpl.gates.map((g, i) => (
                    <span
                      key={i}
                      className="bg-[#F7F5EF] border border-[#0A0A0A] px-2 py-0.5 font-bold"
                    >
                      ✓ {g}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/auditor/engagements?template=${tpl.id}`}
                  className="neo-btn bg-[#0A0A0A] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                >
                  USE TEMPLATE →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
