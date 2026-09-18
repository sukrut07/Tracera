'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  History,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  step: string;
  title: string;
  actor: string;
  role: string;
  timestamp: string;
  status: 'CLIENT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION' | 'V2' | 'APPROVED' | 'TRAIL';
  colorBadge: string;
  shortDesc: string;
  details: {
    file?: string;
    version?: string;
    actionNote: string;
    statutoryRef: string;
    statSummary?: string;
  };
}

const NODES: WorkflowNode[] = [
  {
    id: 'node-client',
    step: '01',
    title: 'CLIENT INITIATION',
    actor: 'ABC Traders Pvt Ltd',
    role: 'CLIENT ENTITY',
    timestamp: '18 Sep 2026 · 10:31 AM',
    status: 'CLIENT',
    colorBadge: 'bg-[#0A0A0A] text-white',
    shortDesc: 'Entity accepts statutory engagement & requests submission slot.',
    details: {
      actionNote: 'Statutory audit mandate initiated under Section 143 Companies Act 2013.',
      statutoryRef: 'MANDATE: STAT-AUD-2025-26',
      statSummary: 'GSTIN: 27AABCT8812C1Z0 · PAN: AABCT8812C',
    },
  },
  {
    id: 'node-doc',
    step: '02',
    title: 'DOCUMENT UPLOADED',
    actor: 'ABC Accounts Dept',
    role: 'CLIENT UPLOADER',
    timestamp: '18 Sep 2026 · 10:35 AM',
    status: 'SUBMITTED',
    colorBadge: 'bg-[#5CC8FF] text-[#0A0A0A]',
    shortDesc: 'Initial raw spreadsheet submitted for audit inspection.',
    details: {
      file: 'Purchase_Register_Apr_2024.xlsx',
      version: 'Version 1 · 2.4 MB',
      actionNote: 'Contains 142 purchase transactions totaling ₹84,20,500.',
      statutoryRef: 'LEDGER: PURCHASES-2024-25',
      statSummary: 'SHA-256: 4f8e...912a · Stored in immutable storage',
    },
  },
  {
    id: 'node-review',
    step: '03',
    title: 'AUDIT INSPECTION',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR / CHECKER',
    timestamp: '18 Sep 2026 · 10:42 AM',
    status: 'UNDER_REVIEW',
    colorBadge: 'bg-[#FFD23F] text-[#0A0A0A]',
    shortDesc: 'Auditor cross-references register lines against GSTR-2B portal feed.',
    details: {
      actionNote: '3 of 4 statutory verification checks passed. 1 reconciliation exception flagged.',
      statutoryRef: 'ICAI SA 500: Audit Evidence',
      statSummary: 'GSTR-2B matching rate: 97.4% (₹2,10,400 variance identified)',
    },
  },
  {
    id: 'node-correction',
    step: '04',
    title: 'CORRECTION REQUIRED',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR NOTICE',
    timestamp: '18 Sep 2026 · 11:05 AM',
    status: 'CORRECTION',
    colorBadge: 'bg-[#E73520] text-white',
    shortDesc: 'Official statutory notice issued. Missing invoice INV-204 flagged.',
    details: {
      actionNote: '"Invoice INV-204 (Balaji Enterprises ₹76,700) is omitted from register. Please reconcile and re-upload."',
      statutoryRef: 'EXCEPTION REF: CORR-9042-HIGH',
      statSummary: 'Priority: HIGH · Document locked in CORRECTION_REQUIRED state',
    },
  },
  {
    id: 'node-v2',
    step: '05',
    title: 'VERSION 02 SUBMITTED',
    actor: 'ABC Accounts Dept',
    role: 'CLIENT RE-SUBMISSION',
    timestamp: '18 Sep 2026 · 13:18 PM',
    status: 'V2',
    colorBadge: 'bg-[#5CC8FF] text-[#0A0A0A]',
    shortDesc: 'Corrected document uploaded. Version 1 strictly preserved for audit history.',
    details: {
      file: 'Purchase_Register_Apr_2024_v2.xlsx',
      version: 'Version 2 (Preserved v1)',
      actionNote: 'Invoice INV-204 incorporated. Ledger arithmetic balanced to ₹84,97,200.',
      statutoryRef: 'REVISION: v2-VERIFIED-HASH',
      statSummary: 'Prior version v1 archived with full audit timestamp trail',
    },
  },
  {
    id: 'node-approval',
    step: '06',
    title: 'STATUTORY APPROVAL',
    actor: 'Rahul Sharma, CA',
    role: 'LEAD AUDITOR SIGN-OFF',
    timestamp: '18 Sep 2026 · 14:32 PM',
    status: 'APPROVED',
    colorBadge: 'bg-[#C7F36B] text-[#0A0A0A]',
    shortDesc: 'Reconciliation verified 100%. Formal CA statutory approval issued.',
    details: {
      actionNote: '"Verified invoice INV-204 and reconciled against ICEGATE & GST portal. Statutory test complete."',
      statutoryRef: 'UDIN: 260918-AUD-99120',
      statSummary: 'Status: APPROVED · Stamped with CA digital certification',
    },
  },
  {
    id: 'node-trail',
    step: '07',
    title: 'IMMUTABLE AUDIT TRAIL',
    actor: 'TRACERA Engine',
    role: 'COMPLIANCE LEDGER',
    timestamp: '18 Sep 2026 · 14:32 PM',
    status: 'TRAIL',
    colorBadge: 'bg-[#0A0A0A] text-white',
    shortDesc: '7 immutable events recorded chronologically. Exportable PDF dossier ready.',
    details: {
      actionNote: 'Complete cryptographic timeline sealed for ICAI Peer Review & Section 143(3) compliance.',
      statutoryRef: 'AUDIT CLOSURE: TR-2026-00182',
      statSummary: '7 events · 0 mutable overrides · Full legal admissibility',
    },
  },
];

export function HeroWorkflowBoard() {
  const [activeStepIndex, setActiveStepIndex] = useState(3); // Default on Correction
  const [autoProgress, setAutoProgress] = useState(true);

  // Progressive trace progression loop
  useEffect(() => {
    if (!autoProgress) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % NODES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [autoProgress]);

  const activeNode = NODES[activeStepIndex];

  return (
    <div
      className="w-full neo-box-lg bg-white overflow-hidden"
      data-cursor="trace"
      onMouseEnter={() => setAutoProgress(false)}
    >
      {/* 1. Board Header Strip */}
      <div className="bg-[#0A0A0A] text-white px-6 py-3 flex flex-wrap items-center justify-between border-b-3 border-[#0A0A0A] font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-[#E73520] animate-pulse border border-white" />
          <span className="font-black uppercase tracking-wider text-sm">
            TRACERA WORKFLOW // LIVE AUDIT TRACE
          </span>
          <span className="text-[#888880] text-[10px] hidden sm:inline">
            ID: TR-2026-0918
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#A1A19A]">
          <span className="text-[#E73520] font-bold">NODE {activeNode.step} OF 07</span>
          <span>·</span>
          <span>AUTOPLAY: {autoProgress ? 'ON' : 'PAUSED'}</span>
        </div>
      </div>

      {/* 2. Main Board Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-3 divide-[#0A0A0A]">
        {/* Left: 7 Interactive Node Steps */}
        <div className="lg:col-span-5 p-4 sm:p-6 bg-[#F7F5EF] space-y-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black text-[#4A4A48]">
              SEQUENTIAL AUDIT GATES
            </span>
            <span className="text-[10px] font-mono text-[#E73520] font-bold">
              CLICK ANY NODE TO INSPECT
            </span>
          </div>

          {NODES.map((node, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={node.id}
                onClick={() => {
                  setAutoProgress(false);
                  setActiveStepIndex(idx);
                }}
                className={`w-full text-left p-3 border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'border-[#0A0A0A] bg-white shadow-[4px_4px_0_#0A0A0A] translate-x-1'
                    : 'border-[#0A0A0A]/30 bg-[#F7F5EF] hover:border-[#0A0A0A] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 flex items-center justify-center border-2 border-[#0A0A0A] text-xs font-mono font-black ${
                      isActive ? 'bg-[#E73520] text-white' : 'bg-white text-[#0A0A0A]'
                    }`}
                  >
                    {node.step}
                  </span>
                  <div>
                    <span
                      className={`block text-xs font-bold uppercase tracking-wider font-mono ${
                        isActive ? 'text-[#0A0A0A]' : 'text-[#4A4A48]'
                      }`}
                    >
                      {node.title}
                    </span>
                    <span className="block text-[10px] text-[#777770] font-mono">
                      {node.actor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 border border-[#0A0A0A] ${node.colorBadge}`}
                  >
                    {node.status}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#E73520] animate-ping" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Technical Node Inspection Workbench */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-between">
          <div className="space-y-6">
            {/* Step Eyebrow + Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#0A0A0A]">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#E73520] block">
                  GATE // 0{activeNode.step} INSPECTION
                </span>
                <h3 className="text-2xl font-black uppercase text-[#0A0A0A] tracking-tight">
                  {activeNode.title}
                </h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] ${activeNode.colorBadge}`}
              >
                {activeNode.status}
              </span>
            </div>

            {/* Description Quote Block */}
            <div className="p-4 border-2 border-[#0A0A0A] bg-[#F7F5EF] shadow-[3px_3px_0_#0A0A0A]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#4A4A48] block mb-1">
                AUDIT ACTION RECORD:
              </span>
              <p className="text-sm font-mono font-bold text-[#0A0A0A] leading-relaxed">
                {activeNode.details.actionNote}
              </p>
            </div>

            {/* Technical Metadata Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 border-2 border-[#0A0A0A] bg-white">
                <span className="text-[10px] text-[#777770] uppercase block">
                  ACTOR & ROLE:
                </span>
                <span className="font-bold text-[#0A0A0A] block mt-0.5">
                  {activeNode.actor}
                </span>
                <span className="text-[10px] text-[#E73520] font-bold">
                  {activeNode.role}
                </span>
              </div>

              <div className="p-3 border-2 border-[#0A0A0A] bg-white">
                <span className="text-[10px] text-[#777770] uppercase block">
                  TIMESTAMP:
                </span>
                <span className="font-bold text-[#0A0A0A] block mt-0.5">
                  {activeNode.timestamp}
                </span>
                <span className="text-[10px] text-[#4A4A48]">
                  UTC+05:30 IST Verified
                </span>
              </div>

              {activeNode.details.file && (
                <div className="p-3 border-2 border-[#0A0A0A] bg-white sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#E73520]" />
                    <span className="font-bold text-[#0A0A0A]">
                      {activeNode.details.file}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#F7F5EF] px-2 py-0.5 border border-[#0A0A0A]">
                    {activeNode.details.version}
                  </span>
                </div>
              )}

              <div className="p-3 border-2 border-[#0A0A0A] bg-white sm:col-span-2">
                <span className="text-[10px] text-[#777770] uppercase block">
                  STATUTORY LEDGER REFERENCE:
                </span>
                <span className="font-bold text-[#0A0A0A] block mt-0.5">
                  {activeNode.details.statutoryRef}
                </span>
                {activeNode.details.statSummary && (
                  <span className="text-[11px] text-[#4A4A48] block mt-1">
                    {activeNode.details.statSummary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Interactive Navigation Strip */}
          <div className="pt-6 mt-6 border-t-2 border-[#0A0A0A] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : NODES.length - 1))
                }
                className="neo-btn bg-white px-3 py-1.5 text-xs font-mono font-bold"
              >
                ← PREV GATE
              </button>
              <button
                onClick={() =>
                  setActiveStepIndex((prev) => (prev + 1) % NODES.length)
                }
                className="neo-btn bg-[#0A0A0A] text-white px-3 py-1.5 text-xs font-mono font-bold"
              >
                NEXT GATE →
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#4A4A48]">
              STEP {activeStepIndex + 1} OF 7 · COMPLETE REVERSION AUDIT TRAIL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
