'use client';

import React from 'react';
import {
  MessageSquare,
  FileSpreadsheet,
  Mail,
  HardDrive,
  PhoneCall,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

const FRAGMENTED_TOOLS = [
  {
    name: 'WHATSAPP',
    icon: MessageSquare,
    problem: 'Lost correction notes, unverified PDF versions, missing formal approvals.',
    badge: 'UNSTRUCTURED',
  },
  {
    name: 'EXCEL',
    icon: FileSpreadsheet,
    problem: 'Manual status checklists, broken VLOOKUPs, unverified cell overrides.',
    badge: 'UNVERIFIED',
  },
  {
    name: 'EMAIL',
    icon: Mail,
    problem: 'Scattered file attachments (v1_final_final2.xlsx), buried inbox threads.',
    badge: 'UNTRACKED',
  },
  {
    name: 'GOOGLE DRIVE',
    icon: HardDrive,
    problem: 'Static folder graveyards with no review gates, missing stage deadlines.',
    badge: 'DISCONNECTED',
  },
  {
    name: 'MANUAL CALLS',
    icon: PhoneCall,
    problem: 'Endless daily calls asking "Did you send the June bank statement?"',
    badge: 'INEFFICIENT',
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-24 border-t-[3px] border-[#0A0A0A] bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
            <span>[02] THE 5-TOOL PROBLEM</span>
            <span>·</span>
            <span>WHY PRACTICE MANAGEMENT FAILS</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0A0A0A]">
            AUDIT WORK SHOULDN'T LIVE IN FIVE TABS.
          </h2>
          <p className="text-base sm:text-lg font-medium text-[#4A4A48] max-w-2xl">
            When CA firms scatter client collections, review iterations, and partner
            sign-offs across 5 disjointed tools, audit quality suffers and deadlines slip.
          </p>
        </div>

        {/* 5 Fragmented Physical Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative mb-12">
          {FRAGMENTED_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="neo-box p-5 bg-white flex flex-col justify-between relative group hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0A] mb-3">
                    <span className="text-xs font-mono font-black text-[#0A0A0A]">
                      0{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[#E73520]/10 text-[#E73520] border border-[#E73520] px-1.5 py-0.5">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-[#0A0A0A]" />
                    <h3 className="font-black font-mono text-base text-[#0A0A0A]">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="text-xs font-mono text-[#4A4A48] leading-relaxed">
                    {tool.problem}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#0A0A0A]/20 flex items-center justify-between text-[10px] font-mono text-[#777770]">
                  <span>FRAGMENT #0{idx + 1}</span>
                  <span className="text-[#E73520] font-bold">DISCONNECTED</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Downward Transition Banner */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="w-1 h-12 bg-[#E73520]" />
          <div className="w-8 h-8 rounded-full bg-[#E73520] text-white flex items-center justify-center border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
            <ArrowDown className="w-4 h-4" />
          </div>
          <div className="w-1 h-12 bg-[#E73520]" />
        </div>

        {/* TRACERA Unified Solution Block */}
        <div className="neo-box-lg bg-[#0A0A0A] text-white p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#E73520] border border-white" />
                <span className="text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
                  THE TRACERA STANDARD
                </span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-sans">
                ONE WORKFLOW. ONE RECORD. ONE TRACE.
              </h3>
              <p className="text-sm sm:text-base font-mono text-[#A1A19A] max-w-2xl leading-relaxed">
                TRACERA connects client document intake, statutory review checklists,
                multi-round corrections, maker-checker sign-offs, and Section 143(3) immutable
                closure into a single verified audit room.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 font-mono text-xs font-bold">
              <div className="p-3 bg-[#1A1A18] border-2 border-[#333330] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C7F36B] shrink-0" />
                <span>Zero WhatsApp document hunting</span>
              </div>
              <div className="p-3 bg-[#1A1A18] border-2 border-[#333330] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C7F36B] shrink-0" />
                <span>Preserved v1 ↔ v2 audit versions</span>
              </div>
              <div className="p-3 bg-[#1A1A18] border-2 border-[#333330] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C7F36B] shrink-0" />
                <span>Downloadable CA Closure Dossier PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
