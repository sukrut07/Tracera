'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowDown,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  step: string;
  title: string;
  version: string;
  status: 'CLIENT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED' | 'AUDIT_TRAIL';
  actor: string;
  role: string;
  timestamp: string;
  quote?: string;
  note: string;
}

const NODES: WorkflowNode[] = [
  {
    id: 'client-submit',
    step: '01 CLIENT SUBMISSION',
    title: 'Purchase Register FY24-25',
    version: 'v1',
    status: 'SUBMITTED',
    actor: 'ABC Traders (Client)',
    role: 'CLIENT',
    timestamp: '18 Sep 2026 · 10:15 AM',
    note: 'Initial raw monthly purchase ledger submitted for statutory verification.',
  },
  {
    id: 'under-review',
    step: '02 AUDIT INSPECTION',
    title: 'UNDER REVIEW',
    version: 'v1',
    status: 'UNDER_REVIEW',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 10:45 AM',
    quote: 'Comparing invoice numbers and tax breakdowns against GSTR-2B statement.',
    note: 'Active verification in split-screen review workspace.',
  },
  {
    id: 'correction-req',
    step: '03 DISCREPANCY FLAGGED',
    title: 'CORRECTION REQUIRED',
    version: 'v1',
    status: 'CORRECTION_REQUIRED',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 11:42 AM',
    quote: 'Invoice INV-204 (Balaji Enterprises ₹76,700) is missing from purchase register.',
    note: 'Mandatory revision notice dispatched to client with reason locked in audit log.',
  },
  {
    id: 'version-2',
    step: '04 RE-SUBMISSION',
    title: 'Purchase Register (Reconciled)',
    version: 'v2',
    status: 'SUBMITTED',
    actor: 'ABC Traders (Client)',
    role: 'CLIENT',
    timestamp: '18 Sep 2026 · 02:10 PM',
    quote: 'INV-204 added, total reconciled to ₹3,31,700.',
    note: 'Version 2 created. Version 1 archived immutably without overwrites.',
  },
  {
    id: 'approved',
    step: '05 STATUTORY SIGN-OFF',
    title: 'APPROVED & CERTIFIED',
    version: 'v2',
    status: 'APPROVED',
    actor: 'Rahul Sharma, CA',
    role: 'AUDITOR',
    timestamp: '18 Sep 2026 · 03:00 PM',
    quote: 'All 4 statutory checklist items passed. Reconciled with GST portal.',
    note: 'Document permanently locked against further edits under Section 143(3).',
  },
  {
    id: 'audit-trail',
    step: '06 IMMUTABLE LOG',
    title: 'AUDIT TRAIL PRESERVED',
    version: 'v2',
    status: 'AUDIT_TRAIL',
    actor: 'System / Ledger',
    role: 'SYSTEM',
    timestamp: '18 Sep 2026 · 03:05 PM',
    note: 'Court-admissible tamper-evident timeline generated with SHA-256 seal.',
  },
];

export function HeroWorkflowNodes() {
  const [activeNodeId, setActiveNodeId] = useState<string>('correction-req');

  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[2];

  return (
    <div className="w-full max-w-4xl mx-auto border border-[#E5E5E0] bg-white text-left font-mono shadow-xs mt-12">
      {/* Header bar */}
      <div className="px-5 py-3 bg-[#FAFAF8] border-b border-[#E5E5E0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E03E1A]" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#111110]">
            SIGNATURE AUDIT NODE PROGRESSION
          </span>
        </div>
        <span className="text-[10px] text-[#777770]">
          Hover or tap any node to inspect audit commit details
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0]">
        {/* Left 6 cols: Vertical Node Trail */}
        <div className="md:col-span-6 p-6 space-y-3">
          <div className="space-y-1">
            {NODES.map((node, index) => {
              const isSelected = node.id === activeNodeId;
              const isLast = index === NODES.length - 1;

              return (
                <div key={node.id} className="relative">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div className="absolute left-3.5 top-6 w-0.5 h-6 bg-[#E5E5E0] z-0" />
                  )}

                  <button
                    onMouseEnter={() => setActiveNodeId(node.id)}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left flex items-start gap-3 p-2 border transition-all cursor-pointer z-10 relative ${
                      isSelected
                        ? 'bg-[#111110] text-white border-[#111110] shadow-xs'
                        : 'bg-white hover:bg-[#FAFAF8] border-transparent text-[#111110]'
                    }`}
                  >
                    {/* Node Dot Indicator */}
                    <div
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#E03E1A] border-[#E03E1A] text-white'
                          : node.status === 'CORRECTION_REQUIRED'
                          ? 'bg-orange-100 border-orange-400'
                          : node.status === 'APPROVED'
                          ? 'bg-emerald-100 border-emerald-400'
                          : 'bg-[#F2F2EE] border-[#CCCCCC]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
                        <span className={isSelected ? 'text-[#A1A19A]' : 'text-[#777770]'}>
                          {node.step}
                        </span>
                        <span className={isSelected ? 'text-white' : 'text-[#111110]'}>
                          {node.version}
                        </span>
                      </div>
                      <div className="text-xs font-bold truncate mt-0.5 font-sans">
                        {node.title}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 cols: Active Node Detail Inspection */}
        <div className="md:col-span-6 p-6 sm:p-7 bg-[#FAFAF8] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">
                AUDIT COMMIT RECORD
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  activeNode.status === 'CORRECTION_REQUIRED'
                    ? 'bg-orange-50 text-[#C2410C] border-orange-200'
                    : activeNode.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white text-[#111110] border-[#E5E5E0]'
                }`}
              >
                {activeNode.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#777770] uppercase tracking-wider block">
                {activeNode.step}
              </span>
              <h4 className="text-base font-bold text-[#111110] mt-0.5">
                {activeNode.title} ({activeNode.version})
              </h4>
            </div>

            {/* Actor & Timestamp */}
            <div className="bg-white border border-[#E5E5E0] p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#777770]">
                <span>ACTOR IDENTITY</span>
                <span className="text-[#111110] font-bold">{activeNode.actor}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#777770]">
                <span>ROLE</span>
                <span className="text-[#111110] font-bold">{activeNode.role}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#777770]">
                <span>TIMESTAMP</span>
                <span className="text-[#111110]">{activeNode.timestamp}</span>
              </div>
            </div>

            {/* Quote / Reason if present */}
            {activeNode.quote && (
              <div className="p-3 bg-white border-l-2 border-[#111110] text-xs font-sans text-[#111110] space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#777770] font-mono block">
                  ACTION REMARK:
                </span>
                <p className="italic">"{activeNode.quote}"</p>
              </div>
            )}

            <p className="text-xs text-[#555550] font-sans leading-relaxed">
              {activeNode.note}
            </p>
          </div>

          <div className="pt-3 border-t border-[#E5E5E0] text-[10px] text-[#777770] flex items-center justify-between">
            <span>APPEND-ONLY COMMIT</span>
            <span>SEC. 143(3) COMPLIANT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
