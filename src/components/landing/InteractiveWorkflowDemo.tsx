'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  History,
  ArrowRight,
  ShieldCheck,
  Download,
  Eye,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';

interface WorkflowStageData {
  id: number;
  stageNumber: string;
  stageLabel: string;
  stageTitle: string;
  stageSubtitle: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED';
  version: string;
  actor: string;
  actorRole: 'CLIENT' | 'AUDITOR' | 'SYSTEM';
  timestamp: string;
  explanation: string;
  documentData: {
    fileName: string;
    fileSize: string;
    totalAmount: string;
    rows: Array<{
      inv: string;
      vendor: string;
      amount: string;
      status: 'MATCHED' | 'MISSING' | 'ADDED' | 'PENDING';
    }>;
  };
  auditLogs: Array<{
    action: string;
    actor: string;
    role: string;
    version: string;
    time: string;
    note: string;
  }>;
  checklist: Array<{ label: string; checked: boolean }>;
}

const STAGES: WorkflowStageData[] = [
  {
    id: 1,
    stageNumber: '01',
    stageLabel: 'UPLOAD',
    stageTitle: 'Client Submits Initial Document',
    stageSubtitle: 'Raw client records registered immutably as Version 1',
    status: 'SUBMITTED',
    version: 'v1',
    actor: 'ABC Traders (Client)',
    actorRole: 'CLIENT',
    timestamp: '18 Sep 2026 · 10:15 AM',
    explanation:
      'The client uploads their monthly Purchase Register. TRACERA generates a unique document ID, locks Version 1, and marks the status as SUBMITTED. The engagement auditor is alerted immediately.',
    documentData: {
      fileName: 'Purchase_Register_Apr2024_v1.xlsx',
      fileSize: '142 KB',
      totalAmount: '₹2,55,000',
      rows: [
        { inv: 'INV-201', vendor: 'Apex Steels Ltd', amount: '₹1,28,000', status: 'PENDING' },
        { inv: 'INV-202', vendor: 'Om Logistics Corp', amount: '₹45,000', status: 'PENDING' },
        { inv: 'INV-203', vendor: 'Zenith Electricals', amount: '₹82,000', status: 'PENDING' },
      ],
    },
    auditLogs: [
      {
        action: 'DOCUMENT_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v1',
        time: '10:15 AM',
        note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
      },
    ],
    checklist: [
      { label: 'Document readable & uncorrupted', checked: false },
      { label: 'Mandatory GST & vendor fields present', checked: false },
      { label: 'ITC reconciled with GSTR-2B portal', checked: false },
      { label: 'Ledger mathematics verified', checked: false },
    ],
  },
  {
    id: 2,
    stageNumber: '02',
    stageLabel: 'REVIEW',
    stageTitle: 'Auditor Opens Review Workspace',
    stageSubtitle: 'Split-screen verification with 4-point CA checklist',
    status: 'UNDER_REVIEW',
    version: 'v1',
    actor: 'Rahul Sharma, CA',
    actorRole: 'AUDITOR',
    timestamp: '18 Sep 2026 · 10:45 AM',
    explanation:
      'The auditor takes ownership of the document. Status transitions to UNDER_REVIEW. The auditor cross-references invoice numbers and tax breakdowns against GSTR-2B portal data.',
    documentData: {
      fileName: 'Purchase_Register_Apr2024_v1.xlsx',
      fileSize: '142 KB',
      totalAmount: '₹2,55,000',
      rows: [
        { inv: 'INV-201', vendor: 'Apex Steels Ltd', amount: '₹1,28,000', status: 'MATCHED' },
        { inv: 'INV-202', vendor: 'Om Logistics Corp', amount: '₹45,000', status: 'MATCHED' },
        { inv: 'INV-203', vendor: 'Zenith Electricals', amount: '₹82,000', status: 'MATCHED' },
      ],
    },
    auditLogs: [
      {
        action: 'REVIEW_STARTED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v1',
        time: '10:45 AM',
        note: 'Auditor opened review console and initiated verification against GSTR-2B.',
      },
      {
        action: 'DOCUMENT_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v1',
        time: '10:15 AM',
        note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
      },
    ],
    checklist: [
      { label: 'Document readable & uncorrupted', checked: true },
      { label: 'Mandatory GST & vendor fields present', checked: true },
      { label: 'ITC reconciled with GSTR-2B portal', checked: false },
      { label: 'Ledger mathematics verified', checked: false },
    ],
  },
  {
    id: 3,
    stageNumber: '03',
    stageLabel: 'CORRECT',
    stageTitle: 'Auditor Flags Discrepancy',
    stageSubtitle: 'Mandatory correction note logged with specific invoice details',
    status: 'CORRECTION_REQUIRED',
    version: 'v1',
    actor: 'Rahul Sharma, CA',
    actorRole: 'AUDITOR',
    timestamp: '18 Sep 2026 · 11:20 AM',
    explanation:
      'Auditor detects that Balaji Enterprises (INV-204 for ₹76,700) appears in GSTR-2B but was omitted from the client purchase register. Auditor issues a correction request with mandatory audit reasoning.',
    documentData: {
      fileName: 'Purchase_Register_Apr2024_v1.xlsx',
      fileSize: '142 KB',
      totalAmount: '₹2,55,000 (Deficient)',
      rows: [
        { inv: 'INV-201', vendor: 'Apex Steels Ltd', amount: '₹1,28,000', status: 'MATCHED' },
        { inv: 'INV-202', vendor: 'Om Logistics Corp', amount: '₹45,000', status: 'MATCHED' },
        { inv: 'INV-203', vendor: 'Zenith Electricals', amount: '₹82,000', status: 'MATCHED' },
        { inv: 'INV-204', vendor: 'Balaji Enterprises (Missing)', amount: '₹76,700', status: 'MISSING' },
      ],
    },
    auditLogs: [
      {
        action: 'CORRECTION_REQUESTED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v1',
        time: '11:20 AM',
        note: 'Invoice INV-204 (Balaji Enterprises ₹76,700) missing from ledger. Reconcile with GSTR-2B and re-upload.',
      },
      {
        action: 'REVIEW_STARTED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v1',
        time: '10:45 AM',
        note: 'Auditor opened review console and initiated verification against GSTR-2B.',
      },
      {
        action: 'DOCUMENT_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v1',
        time: '10:15 AM',
        note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
      },
    ],
    checklist: [
      { label: 'Document readable & uncorrupted', checked: true },
      { label: 'Mandatory GST & vendor fields present', checked: true },
      { label: 'ITC reconciled with GSTR-2B portal (FAILED: Omission)', checked: false },
      { label: 'Ledger mathematics verified', checked: false },
    ],
  },
  {
    id: 4,
    stageNumber: '04',
    stageLabel: 'APPROVE',
    stageTitle: 'Reconciled v2 Approved & Certified',
    stageSubtitle: 'Version 2 verified with all 4 checklist points passing',
    status: 'APPROVED',
    version: 'v2',
    actor: 'Rahul Sharma, CA',
    actorRole: 'AUDITOR',
    timestamp: '18 Sep 2026 · 03:00 PM',
    explanation:
      'Client re-uploaded Version 2 with INV-204 included (v1 is preserved intact). Auditor confirms arithmetic match (₹3,31,700), marks all 4 checks complete, and signs off. Status becomes APPROVED and immutable.',
    documentData: {
      fileName: 'Purchase_Register_Apr2024_v2_Reconciled.xlsx',
      fileSize: '148 KB',
      totalAmount: '₹3,31,700 (Reconciled)',
      rows: [
        { inv: 'INV-201', vendor: 'Apex Steels Ltd', amount: '₹1,28,000', status: 'MATCHED' },
        { inv: 'INV-202', vendor: 'Om Logistics Corp', amount: '₹45,000', status: 'MATCHED' },
        { inv: 'INV-203', vendor: 'Zenith Electricals', amount: '₹82,000', status: 'MATCHED' },
        { inv: 'INV-204', vendor: 'Balaji Enterprises', amount: '₹76,700', status: 'ADDED' },
      ],
    },
    auditLogs: [
      {
        action: 'DOCUMENT_APPROVED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v2',
        time: '03:00 PM',
        note: 'Reconciled with GSTR-2B. All 4 statutory checks passed. Approved for audit sign-off.',
      },
      {
        action: 'CORRECTION_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v2',
        time: '02:10 PM',
        note: 'Re-uploaded revised purchase register with INV-204 added.',
      },
      {
        action: 'CORRECTION_REQUESTED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v1',
        time: '11:20 AM',
        note: 'Invoice INV-204 (Balaji Enterprises ₹76,700) missing from ledger. Reconcile with GSTR-2B and re-upload.',
      },
      {
        action: 'DOCUMENT_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v1',
        time: '10:15 AM',
        note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
      },
    ],
    checklist: [
      { label: 'Document readable & uncorrupted', checked: true },
      { label: 'Mandatory GST & vendor fields present', checked: true },
      { label: 'ITC reconciled with GSTR-2B portal', checked: true },
      { label: 'Ledger mathematics verified', checked: true },
    ],
  },
  {
    id: 5,
    stageNumber: '05',
    stageLabel: 'TRACE',
    stageTitle: 'Full Immutable Audit History',
    stageSubtitle: 'Section 143(3) compliant audit trail with one-click PDF export',
    status: 'APPROVED',
    version: 'v2',
    actor: 'System / Statutory Log',
    actorRole: 'SYSTEM',
    timestamp: '18 Sep 2026 · 03:05 PM',
    explanation:
      'Every action, remark, timestamp, actor ID, and file checksum is recorded in an append-only timeline. The firm can export the formal CA Audit Verification Report as a court-ready, certified PDF.',
    documentData: {
      fileName: 'Purchase_Register_Apr2024_v2_Reconciled.xlsx',
      fileSize: '148 KB',
      totalAmount: '₹3,31,700',
      rows: [
        { inv: 'INV-201', vendor: 'Apex Steels Ltd', amount: '₹1,28,000', status: 'MATCHED' },
        { inv: 'INV-202', vendor: 'Om Logistics Corp', amount: '₹45,000', status: 'MATCHED' },
        { inv: 'INV-203', vendor: 'Zenith Electricals', amount: '₹82,000', status: 'MATCHED' },
        { inv: 'INV-204', vendor: 'Balaji Enterprises', amount: '₹76,700', status: 'ADDED' },
      ],
    },
    auditLogs: [
      {
        action: 'AUDIT_REPORT_GENERATED',
        actor: 'System',
        role: 'SYSTEM',
        version: 'v2',
        time: '03:05 PM',
        note: 'Official CA Verification Report PDF generated and locked with SHA-256 stamp.',
      },
      {
        action: 'DOCUMENT_APPROVED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v2',
        time: '03:00 PM',
        note: 'Reconciled with GSTR-2B. All 4 statutory checks passed. Approved for audit sign-off.',
      },
      {
        action: 'CORRECTION_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v2',
        time: '02:10 PM',
        note: 'Re-uploaded revised purchase register with INV-204 added.',
      },
      {
        action: 'CORRECTION_REQUESTED',
        actor: 'Rahul Sharma, CA',
        role: 'AUDITOR',
        version: 'v1',
        time: '11:20 AM',
        note: 'Invoice INV-204 (Balaji Enterprises ₹76,700) missing from ledger. Reconcile with GSTR-2B and re-upload.',
      },
      {
        action: 'DOCUMENT_UPLOADED',
        actor: 'ABC Traders',
        role: 'CLIENT',
        version: 'v1',
        time: '10:15 AM',
        note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
      },
    ],
    checklist: [
      { label: 'Document readable & uncorrupted', checked: true },
      { label: 'Mandatory GST & vendor fields present', checked: true },
      { label: 'ITC reconciled with GSTR-2B portal', checked: true },
      { label: 'Ledger mathematics verified', checked: true },
    ],
  },
];

export function InteractiveWorkflowDemo() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const currentStage = STAGES[activeStageIndex];

  return (
    <div className="w-full border border-[#E5E5E0] bg-white text-left font-sans shadow-xs">
      {/* Top Banner & Auto-play bar */}
      <div className="px-6 py-3 bg-[#FAFAF8] border-b border-[#E5E5E0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 bg-[#E03E1A]" />
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#111110]">
            INTERACTIVE AUDIT WORKFLOW DEMONSTRATOR
          </span>
          <span className="text-[10px] font-mono text-[#777770]">
            · Click any stage to test state transition
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E5E5E0] bg-white text-[11px] font-mono text-[#111110] hover:text-[#E03E1A] transition-colors cursor-pointer"
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoPlay ? 'Pause Auto-Cycle' : 'Play Auto-Cycle'}</span>
          </button>

          <button
            onClick={() => {
              setActiveStageIndex(0);
              setIsAutoPlay(false);
            }}
            className="p-1 border border-[#E5E5E0] bg-white text-[#777770] hover:text-[#111110] cursor-pointer"
            title="Reset to 01 Upload"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Stage Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#E5E5E0] divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E0] bg-[#FAFAF8]">
        {STAGES.map((s, idx) => {
          const isActive = idx === activeStageIndex;
          const isDone = idx < activeStageIndex;

          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveStageIndex(idx);
                setIsAutoPlay(false);
              }}
              className={`p-3.5 text-left transition-all cursor-pointer font-mono ${
                isActive
                  ? 'bg-white border-b-2 border-b-[#111110] text-[#111110]'
                  : isDone
                  ? 'text-[#555550] hover:bg-white'
                  : 'text-[#888880] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] tracking-widest uppercase">
                <span className="font-bold">{s.stageNumber} {s.stageLabel}</span>
                {isDone && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="text-xs font-sans font-bold truncate mt-1 text-[#111110]">
                {s.stageTitle.split(' ')[0]} {s.stageTitle.split(' ')[1] || ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E0]">
        {/* Left 7 Columns: Active Screen / Sheet */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <span>STAGE {currentStage.stageNumber} OF 05</span>
                <span>·</span>
                <span>{currentStage.stageLabel}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#111110] mt-1">
                {currentStage.stageTitle}
              </h3>
              <p className="text-xs text-[#666660] font-sans mt-0.5">
                {currentStage.stageSubtitle}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <DocumentStatusBadge status={currentStage.status} size="md" />
              <span className="text-[11px] font-mono text-[#555550] bg-[#FAFAF8] px-2 py-0.5 border border-[#E5E5E0]">
                Version: <strong className="text-[#111110]">{currentStage.version}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Document Mockup */}
          <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#111110] font-bold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>{currentStage.documentData.fileName}</span>
              </div>
              <span className="text-[#777770] text-[11px]">{currentStage.documentData.fileSize}</span>
            </div>

            {/* Document Entries Table */}
            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-[#777770] px-2 pb-1 border-b border-[#E5E5E0]">
                <span className="col-span-3">INVOICE NO.</span>
                <span className="col-span-5">VENDOR</span>
                <span className="col-span-2 text-right">AMOUNT</span>
                <span className="col-span-2 text-right">STATUS</span>
              </div>

              {currentStage.documentData.rows.map((row) => (
                <div
                  key={row.inv}
                  className={`grid grid-cols-12 items-center px-2 py-1.5 border ${
                    row.status === 'MISSING'
                      ? 'bg-orange-50/80 border-orange-200 text-[#C2410C]'
                      : row.status === 'ADDED'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-white border-[#E5E5E0] text-[#111110]'
                  }`}
                >
                  <span className="col-span-3 font-bold">{row.inv}</span>
                  <span className="col-span-5 truncate">{row.vendor}</span>
                  <span className="col-span-2 text-right font-semibold">{row.amount}</span>
                  <span className="col-span-2 text-right">
                    {row.status === 'MISSING' && (
                      <span className="text-[10px] font-bold text-[#E03E1A]">OMITTED</span>
                    )}
                    {row.status === 'ADDED' && (
                      <span className="text-[10px] font-bold text-emerald-700">ADDED v2</span>
                    )}
                    {row.status === 'MATCHED' && (
                      <span className="text-[10px] text-emerald-700">GSTR-2B OK</span>
                    )}
                    {row.status === 'PENDING' && (
                      <span className="text-[10px] text-[#777770]">UNCHECKED</span>
                    )}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between font-bold text-[#111110] px-2">
                <span>TOTAL AUDIT ITC RECONCILED</span>
                <span className="text-sm font-mono text-[#E03E1A]">
                  {currentStage.documentData.totalAmount}
                </span>
              </div>
            </div>

            {/* Special Action Callout for Stage 3 (Correction) */}
            {currentStage.id === 3 && (
              <div className="p-3 bg-orange-50 border border-orange-200 text-xs font-mono space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#C2410C]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E03E1A]" />
                  <span>AUDITOR CORRECTION NOTICE</span>
                </div>
                <p className="text-[11px] font-sans text-[#111110]">
                  "Balaji Enterprises invoice INV-204 (₹76,700) missing from ledger. Reconcile with GSTR-2B and re-upload."
                </p>
              </div>
            )}

            {/* Special Action Callout for Stage 4 & 5 (Approval/Trace) */}
            {currentStage.id >= 4 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CA STATUTORY APPROVAL STAMP</span>
                </div>
                <p className="text-[11px] font-sans text-emerald-900">
                  Signed & verified by Rahul Sharma (FCA #482910) under Section 143(3). Record permanently locked.
                </p>
              </div>
            )}
          </div>

          {/* Editorial Explanation Callout */}
          <div className="border-l-2 border-[#111110] pl-4 py-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
              SYSTEM BEHAVIOR AT THIS STEP:
            </span>
            <p className="text-xs text-[#444440] font-sans leading-relaxed">
              {currentStage.explanation}
            </p>
          </div>
        </div>

        {/* Right 5 Columns: 4-Point Checklist & Immutable Audit Trail Log */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FAFAF8] space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] block">
              CA VERIFICATION MATRIX
            </span>
            <h4 className="text-sm font-bold text-[#111110] mt-0.5">
              4-Point Statutory Audit Checklist
            </h4>
          </div>

          {/* Checklist items */}
          <div className="space-y-2 font-mono text-xs">
            {currentStage.checklist.map((item) => (
              <div
                key={item.label}
                className={`flex items-start gap-2.5 p-2.5 border transition-all ${
                  item.checked
                    ? 'bg-white border-[#111110] text-[#111110]'
                    : 'bg-[#FAFAF8] border-[#E5E5E0] text-[#777770]'
                }`}
              >
                <div
                  className={`w-4 h-4 shrink-0 flex items-center justify-center border mt-0.5 ${
                    item.checked
                      ? 'bg-[#111110] border-[#111110] text-white'
                      : 'border-[#CCCCCC] bg-white'
                  }`}
                >
                  {item.checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs ${item.checked ? 'font-semibold text-[#111110]' : ''}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Audit Trail Timeline */}
          <div className="border-t border-[#E5E5E0] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                AUDIT TRAIL ({currentStage.auditLogs.length} EVENTS)
              </span>
              {currentStage.id === 5 && (
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  LOCKED & CERTIFIED
                </span>
              )}
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {currentStage.auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E5E0] p-2.5 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#777770]">
                    <span className="font-bold text-[#111110]">
                      {log.action} ({log.version})
                    </span>
                    <span>{log.time}</span>
                  </div>
                  <div className="text-[#555550]">
                    By {log.actor} ({log.role})
                  </div>
                  <p className="text-[#333330] font-sans text-xs pt-1 line-clamp-2">
                    "{log.note}"
                  </p>
                </div>
              ))}
            </div>

            {/* Next stage button */}
            <div className="pt-2">
              {activeStageIndex < STAGES.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveStageIndex(activeStageIndex + 1);
                    setIsAutoPlay(false);
                  }}
                  className="w-full py-2.5 px-4 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Advance to Step 0{activeStageIndex + 2}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <a
                  href="/login"
                  className="w-full py-2.5 px-4 bg-[#E03E1A] hover:bg-[#C23314] text-white text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Experience Live in TRACERA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
