'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  Award,
} from 'lucide-react';

export function ProductPreviewTabs() {
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'AUDITOR' | 'PARTNER'>('AUDITOR');

  return (
    <section id="preview" className="py-24 border-t-[3px] border-[#0A0A0A] bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
              <span>[04] LIVE PRODUCT PREVIEW</span>
              <span>·</span>
              <span>THREE UNIFIED PERSPECTIVES</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0A0A0A]">
              THE 3-ROLE AUDIT INTERFACE
            </h2>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 p-1 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A] max-w-full overflow-x-auto">
            {(['CLIENT', 'AUDITOR', 'PARTNER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#E73520] text-white shadow-[2px_2px_0_#0A0A0A]'
                    : 'bg-transparent text-[#0A0A0A] hover:bg-[#F7F5EF]'
                }`}
              >
                {tab === 'CLIENT'
                  ? 'CLIENT WORKSPACE'
                  : tab === 'AUDITOR'
                  ? 'AUDITOR QUEUE'
                  : 'PARTNER DESK'}
              </button>
            ))}
          </div>
        </div>

        {/* The Live Interactive Component Preview Shell */}
        <div className="neo-box-lg bg-white overflow-hidden" data-cursor="action">
          {/* Top Mock Window Bar */}
          <div className="bg-[#0A0A0A] text-white px-5 py-2.5 flex items-center justify-between border-b-2 border-[#0A0A0A] font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E73520]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD23F]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7F36B]" />
              <span className="ml-3 font-bold text-[#A1A19A] text-[11px]">
                https://tracera.internal/{activeTab.toLowerCase()}
              </span>
            </div>
            <span className="text-[10px] text-[#E73520] font-bold">
              ROLE: {activeTab}
            </span>
          </div>

          {/* TAB 1: CLIENT WORKSPACE */}
          {activeTab === 'CLIENT' && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#0A0A0A]">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#E73520] uppercase tracking-widest">
                    CLIENT OVERVIEW
                  </span>
                  <h3 className="text-2xl font-black uppercase text-[#0A0A0A] tracking-tight">
                    CLIENT ENGAGEMENT WORKSPACE
                  </h3>
                </div>
                <Link
                  href="/login"
                  className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
                >
                  <span>+ UPLOAD DOCUMENT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Action Required Card */}
              <div className="p-5 border-2 border-[#0A0A0A] bg-[#FFF2F0] shadow-[4px_4px_0_#0A0A0A] flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E73520] text-white text-[9px] font-mono font-black px-2 py-0.5">
                      1 ACTION REQUIRED
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                      Purchase Register (Version 1)
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#0A0A0A]">
                    Auditor Rahul Sharma, CA: "Invoice INV-204 is missing from purchase
                    register. Please reconcile and re-upload Version 2."
                  </p>
                </div>
                <Link
                  href="/login"
                  className="neo-btn bg-[#E73520] text-white px-4 py-2 text-xs font-mono uppercase tracking-wider"
                >
                  UPLOAD V2 →
                </Link>
              </div>

              {/* Compact Inline Status Strip */}
              <div className="p-3 border-2 border-[#0A0A0A] bg-[#F7F5EF] flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold">
                <span>11 DOCUMENTS TOTAL</span>
                <span className="text-[#5CC8FF]">2 AWAITING REVIEW</span>
                <span className="text-[#E73520]">1 CORRECTION REQUIRED</span>
                <span className="text-[#0A0A0A]">8 STATUTORY APPROVED</span>
              </div>

              {/* Document List */}
              <div className="overflow-x-auto">
                <div className="min-w-[500px] border-2 border-[#0A0A0A] divide-y-2 divide-[#0A0A0A] font-mono text-xs">
                  <div className="p-3 bg-[#F7F5EF] flex items-center justify-between font-bold text-[10px] text-[#4A4A48] uppercase">
                    <span>DOCUMENT</span>
                    <span>VERSION</span>
                    <span>STATUS</span>
                    <span>ACTION</span>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-white hover:bg-[#F7F5EF]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#E73520]" />
                      <span className="font-bold text-[#0A0A0A]">Purchase Register Apr 2024.xlsx</span>
                    </div>
                    <span>V1 (v2 requested)</span>
                    <span className="bg-[#E73520] text-white px-2 py-0.5 text-[9px] font-bold">
                      CORRECTION REQUIRED
                    </span>
                    <span className="text-[#E73520] font-bold underline cursor-pointer">
                      Upload v2
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-white hover:bg-[#F7F5EF]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#0A0A0A]" />
                      <span className="font-bold text-[#0A0A0A]">Bank Statement HDFC Q1.pdf</span>
                    </div>
                    <span>V1</span>
                    <span className="bg-[#C7F36B] text-[#0A0A0A] px-2 py-0.5 text-[9px] font-bold">
                      APPROVED
                    </span>
                    <span className="text-[#4A4A48] font-bold">View Sign-off</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDITOR REVIEW QUEUE */}
          {activeTab === 'AUDITOR' && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#0A0A0A]">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#E73520] uppercase tracking-widest">
                    AUDITOR WORKBENCH
                  </span>
                  <h3 className="text-2xl font-black uppercase text-[#0A0A0A] tracking-tight">
                    REVIEW QUEUE · 03 PENDING CHECKS
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-[#0A0A0A] text-white px-2.5 py-1 font-bold">
                    ACTIVE CA: RAHUL SHARMA
                  </span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                <span className="px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
                  ALL (11)
                </span>
                <span className="px-3 py-1 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A]">
                  PENDING (3)
                </span>
                <span className="px-3 py-1 bg-[#FFD23F] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                  UNDER REVIEW (1)
                </span>
                <span className="px-3 py-1 bg-[#E73520] text-white border-2 border-[#0A0A0A]">
                  CORRECTIONS (1)
                </span>
                <span className="px-3 py-1 bg-[#C7F36B] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                  APPROVED (6)
                </span>
              </div>

              {/* Dense Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px] border-2 border-[#0A0A0A] divide-y-2 divide-[#0A0A0A] font-mono text-xs">
                  <div className="p-3 bg-[#F7F5EF] grid grid-cols-12 font-bold text-[10px] text-[#4A4A48] uppercase">
                    <span className="col-span-4">DOCUMENT</span>
                    <span className="col-span-3">CLIENT</span>
                    <span className="col-span-2">VERSION</span>
                    <span className="col-span-2">STATUS</span>
                    <span className="col-span-1 text-right">ACTION</span>
                  </div>

                  <div className="p-3 grid grid-cols-12 items-center bg-white hover:bg-[#F7F5EF]">
                    <span className="col-span-4 font-bold text-[#0A0A0A]">
                      Purchase Register Apr 2024.xlsx
                    </span>
                    <span className="col-span-3 text-[#4A4A48]">Client Entity Pvt Ltd</span>
                    <span className="col-span-2">V2 (Resubmitted)</span>
                    <span className="col-span-2">
                      <span className="bg-[#5CC8FF] text-[#0A0A0A] px-2 py-0.5 text-[9px] font-bold border border-[#0A0A0A]">
                        SUBMITTED
                      </span>
                    </span>
                    <span className="col-span-1 text-right">
                      <Link
                        href="/login"
                        className="text-[#E73520] font-black underline hover:text-[#0A0A0A]"
                      >
                        REVIEW →
                      </Link>
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-12 items-center bg-white hover:bg-[#F7F5EF]">
                    <span className="col-span-4 font-bold text-[#0A0A0A]">
                      GSTR-2B ITC Matching Report.xlsx
                    </span>
                    <span className="col-span-3 text-[#4A4A48]">Practice Client Entity</span>
                    <span className="col-span-2">V1</span>
                    <span className="col-span-2">
                      <span className="bg-[#FFD23F] text-[#0A0A0A] px-2 py-0.5 text-[9px] font-bold border border-[#0A0A0A]">
                        UNDER REVIEW
                      </span>
                    </span>
                    <span className="col-span-1 text-right">
                      <Link
                        href="/login"
                        className="text-[#E73520] font-black underline hover:text-[#0A0A0A]"
                      >
                        RESUME →
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARTNER APPROVAL DESK */}
          {activeTab === 'PARTNER' && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#0A0A0A]">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#E73520] uppercase tracking-widest">
                    PARTNER OVERSIGHT & SIGN-OFF
                  </span>
                  <h3 className="text-2xl font-black uppercase text-[#0A0A0A] tracking-tight">
                    ENGAGEMENTS REQUIRING APPROVAL
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-[#0A0A0A] text-white px-2.5 py-1 font-bold">
                    LEAD PARTNER REVIEW DESK
                  </span>
                </div>
              </div>

              {/* Engagement Approval Block */}
              <div className="p-6 border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0_#0A0A0A] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0A0A0A]">
                  <div>
                    <h4 className="text-lg font-black uppercase text-[#0A0A0A] font-mono">
                      Client Entity Pvt Ltd · FY 2025–26 Statutory Audit
                    </h4>
                    <span className="text-xs font-mono text-[#777770]">
                      ICAI Mandate · Companies Act Section 143 · Target: 30 Sep 2026
                    </span>
                  </div>
                  <span className="bg-[#FFD23F] text-[#0A0A0A] px-3 py-1 text-xs font-mono font-bold border-2 border-[#0A0A0A]">
                    PARTNER SIGN-OFF PENDING
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 border border-[#0A0A0A] bg-[#F7F5EF]">
                    <span className="text-[10px] text-[#777770] uppercase block">
                      STAGE PROGRESS
                    </span>
                    <span className="font-black text-[#0A0A0A] text-sm">
                      09 / 10 (80%)
                    </span>
                  </div>
                  <div className="p-2.5 border border-[#0A0A0A] bg-[#F7F5EF]">
                    <span className="text-[10px] text-[#777770] uppercase block">
                      EVIDENCE CHECKLIST
                    </span>
                    <span className="font-black text-[#0A0A0A] text-sm">
                      12 / 12 APPROVED
                    </span>
                  </div>
                  <div className="p-2.5 border border-[#0A0A0A] bg-[#F7F5EF]">
                    <span className="text-[10px] text-[#777770] uppercase block">
                      OPEN ISSUES
                    </span>
                    <span className="font-black text-[#C7F36B] text-sm">
                      0 BLOCKERS
                    </span>
                  </div>
                  <div className="p-2.5 border border-[#0A0A0A] bg-[#F7F5EF]">
                    <span className="text-[10px] text-[#777770] uppercase block">
                      MAKER-CHECKER
                    </span>
                    <span className="font-black text-[#0A0A0A] text-sm">
                      MANAGER VERIFIED ✓
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs font-mono">
                    <span className="text-[#777770]">Professional Fee Settled: </span>
                    <strong className="text-[#0A0A0A]">₹29,500 (Ref: NEFT-HDFC-99120)</strong>
                  </div>
                  <Link
                    href="/engagements/eng-statutory-abc-2025"
                    className="neo-btn bg-[#E73520] text-white px-5 py-2 text-xs font-mono uppercase tracking-wider"
                  >
                    SIGN OFF & ISSUE UDIN →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
