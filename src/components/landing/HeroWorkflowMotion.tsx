'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  History,
  ArrowRight,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';

interface WorkflowStep {
  id: number;
  label: string;
  stage: string;
  version: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED';
  actor: string;
  role: 'CLIENT' | 'AUDITOR' | 'SYSTEM';
  timestamp: string;
  detail: string;
  note: string;
  checklistState: boolean[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    label: '01 UPLOAD',
    stage: 'Client Submits Initial Document',
    version: 'v1',
    status: 'SUBMITTED',
    actor: 'ABC Traders (Client)',
    role: 'CLIENT',
    timestamp: '18 Sep 2026 · 10:15 AM',
    detail: 'Purchase_Register_Apr2024_v1.xlsx · 142 KB',
    note: 'Initial monthly purchase register submitted for Q1 statutory audit.',
    checklistState: [false, false, false, false],
  },
  {
    id: 2,
    label: '02 REVIEW',
    stage: 'Auditor Opens Review Queue',
    version: 'v1',
    status: 'UNDER_REVIEW',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 10:45 AM',
    detail: 'Comparing line items against GSTR-2B ITC statement',
    note: 'Cross-verifying vendor GSTINs and invoice totals with ICEGATE & GST Portal.',
    checklistState: [true, true, false, false],
  },
  {
    id: 3,
    label: '03 CORRECT',
    stage: 'Correction Requested with Reason',
    version: 'v1',
    status: 'CORRECTION_REQUIRED',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 11:20 AM',
    detail: 'Mandatory Reason Logged to Audit Trail',
    note: 'Invoice INV-204 (Balaji Enterprises ₹76,700) is missing. Please reconcile and re-upload.',
    checklistState: [true, true, false, false],
  },
  {
    id: 4,
    label: '04 RE-UPLOAD',
    stage: 'Version 2 Created (v1 Preserved)',
    version: 'v2',
    status: 'SUBMITTED',
    actor: 'ABC Traders (Client)',
    role: 'CLIENT',
    timestamp: '18 Sep 2026 · 02:10 PM',
    detail: 'Purchase_Register_Apr2024_v2_Reconciled.xlsx',
    note: 'Invoice INV-204 added and math reconciled. Version 1 archived immutably.',
    checklistState: [true, true, true, false],
  },
  {
    id: 5,
    label: '05 APPROVE',
    stage: 'Statutory Verification & Sign-off',
    version: 'v2',
    status: 'APPROVED',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 03:00 PM',
    detail: 'Section 143(3) CA Verification Certified',
    note: 'All 4 audit checks passed. Audit trail locked. Official PDF report generated.',
    checklistState: [true, true, true, true],
  },
];

export function HeroWorkflowMotion() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance loop every 3.5 seconds
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = WORKFLOW_STEPS[currentStepIndex];

  return (
    <div className="w-full max-w-5xl mx-auto border border-[#E5E5E0] bg-white shadow-xs text-left">
      {/* 1. Motion Header & Step Tracker */}
      <div className="border-b border-[#E5E5E0] bg-[#FAFAF8] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-none bg-[#E03E1A]" />
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#111110]">
            TRACERA WORKFLOW MOTION PROOF
          </span>
          <span className="text-[10px] font-mono text-[#777770]">
            · Step {current.id} of 5
          </span>
        </div>

        {/* Play / Pause & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 text-[11px] font-mono text-[#111110] hover:text-[#E03E1A] px-2 py-1 border border-[#E5E5E0] bg-white cursor-pointer transition-colors"
            title={isPlaying ? 'Pause auto-play' : 'Play motion loop'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setCurrentStepIndex(0)}
            className="text-[11px] font-mono text-[#777770] hover:text-[#111110] p-1 border border-[#E5E5E0] bg-white cursor-pointer"
            title="Restart from step 1"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Step Selector Pills */}
      <div className="grid grid-cols-5 border-b border-[#E5E5E0] divide-x divide-[#E5E5E0] text-center font-mono">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                setIsPlaying(false);
              }}
              className={`px-3 py-3 text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white border-b-2 border-b-[#111110] text-[#111110] font-bold'
                  : isPast
                  ? 'bg-[#FAFAF8] text-[#555550] hover:bg-white'
                  : 'bg-[#FAFAF8] text-[#999990] hover:bg-white'
              }`}
            >
              <div className="text-[10px] tracking-widest block uppercase">
                {step.label}
              </div>
              <div className="text-xs font-sans font-bold truncate mt-0.5">
                {step.stage.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Interactive Split Stage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E0]">
        {/* Left Column (7 cols): Active Document Representation */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] block">
                AUDIT DOCUMENT · APRIL 2024
              </span>
              <h3 className="text-xl font-bold text-[#111110] mt-1">
                Purchase Register FY24-25
              </h3>
              <p className="text-xs text-[#555550] font-mono mt-0.5">
                {current.detail}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <DocumentStatusBadge status={current.status} size="md" />
              <span className="text-[11px] font-mono text-[#555550] bg-[#F2F2EE] px-2 py-0.5 border border-[#E5E5E0]">
                Version: <strong className="text-[#111110]">{current.version}</strong>
              </span>
            </div>
          </div>

          {/* Abstract Structured Document Data Sheet */}
          <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-[11px] text-[#777770]">
              <span>SAMPLE INVOICE ENTRIES</span>
              <span>ITC ELIGIBLE (GSTR-2B)</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#111110]">
                <span>INV-201 · Apex Steels</span>
                <span className="font-semibold">₹1,28,000</span>
              </div>
              <div className="flex items-center justify-between text-[#111110]">
                <span>INV-202 · Om Logistics</span>
                <span className="font-semibold">₹45,000</span>
              </div>
              <div className="flex items-center justify-between text-[#111110]">
                <span>INV-203 · Zenith Electricals</span>
                <span className="font-semibold">₹82,000</span>
              </div>

              {/* Dynamic row that changes with correction/version */}
              {current.id >= 4 ? (
                <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/80 p-1.5 border border-emerald-200">
                  <span className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    INV-204 · Balaji Enterprises (Added in v2)
                  </span>
                  <span className="font-bold">₹76,700</span>
                </div>
              ) : current.id === 3 ? (
                <div className="flex items-center justify-between text-[#C2410C] bg-orange-50 p-1.5 border border-orange-200">
                  <span className="flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E03E1A]" />
                    INV-204 · Balaji Enterprises (Missing in v1)
                  </span>
                  <span className="font-bold">₹76,700 Missing</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[#777770] italic">
                  <span>[Balaji Enterprises INV-204 omitted]</span>
                  <span>Not listed</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between font-bold text-[#111110]">
              <span>RECONCILED TOTAL</span>
              <span>{current.id >= 4 ? '₹3,31,700' : '₹2,55,000'}</span>
            </div>
          </div>

          {/* Current Stage Explanation Note */}
          <div className="bg-white border-l-2 border-[#111110] pl-4 py-1 text-xs text-[#444440] font-sans">
            <span className="font-bold text-[#111110] block mb-0.5 font-mono uppercase text-[10px] tracking-wider">
              STAGE EXPLANATION:
            </span>
            {current.note}
          </div>
        </div>

        {/* Right Column (5 cols): Auditor Checklist & Audit Trail Node */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FAFAF8] space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] block">
              CA STATUTORY VERIFICATION
            </span>
            <h4 className="text-sm font-bold text-[#111110] mt-0.5">
              4-Point Audit Checklist
            </h4>
          </div>

          {/* 4 Checklist Items */}
          <div className="space-y-2.5 font-mono text-xs">
            {[
              'Document readable & clear',
              'Required statutory fields present',
              'Supporting information reconciled',
              'Tax & ledger arithmetic verified',
            ].map((item, index) => {
              const isChecked = current.checklistState[index];
              return (
                <div
                  key={item}
                  className={`flex items-center gap-2.5 p-2 border transition-all ${
                    isChecked
                      ? 'bg-white border-[#111110] text-[#111110]'
                      : 'bg-[#FAFAF8] border-[#E5E5E0] text-[#777770]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 flex items-center justify-center border ${
                      isChecked
                        ? 'bg-[#111110] border-[#111110] text-white'
                        : 'border-[#CCCCCC] bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={isChecked ? 'font-semibold' : ''}>{item}</span>
                </div>
              );
            })}
          </div>

          {/* Immutable Audit Log Entry for this Step */}
          <div className="border-t border-[#E5E5E0] pt-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] block mb-2">
              APPEND-ONLY AUDIT LOG ENTRY
            </span>
            <div className="bg-white border border-[#E5E5E0] p-3 text-xs space-y-1 font-mono">
              <div className="flex items-center justify-between text-[10px] text-[#777770]">
                <span>{current.actor}</span>
                <span>{current.timestamp}</span>
              </div>
              <div className="font-bold text-[#111110] text-[11px]">
                EVENT: {current.status} ({current.version})
              </div>
              <p className="text-[11px] text-[#555550] line-clamp-2">
                {current.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
