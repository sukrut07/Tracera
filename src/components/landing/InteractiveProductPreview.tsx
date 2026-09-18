'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Eye,
  Check,
  Users,
  Building2,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';

type PreviewTab = 'client' | 'auditor' | 'review';

export function InteractiveProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('client');

  return (
    <div className="w-full max-w-6xl mx-auto border border-[#E5E5E0] bg-white text-left font-sans shadow-xs">
      {/* 3-Tab Selector Bar */}
      <div className="border-b border-[#E5E5E0] bg-[#FAFAF8] px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'client'
                ? 'border-b-[#111110] text-[#111110] bg-white border-t border-x border-t-[#E5E5E0] border-x-[#E5E5E0]'
                : 'border-b-transparent text-[#666660] hover:text-[#111110]'
            }`}
          >
            01 / Client Workspace
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'auditor'
                ? 'border-b-[#111110] text-[#111110] bg-white border-t border-x border-t-[#E5E5E0] border-x-[#E5E5E0]'
                : 'border-b-transparent text-[#666660] hover:text-[#111110]'
            }`}
          >
            02 / Auditor Review Queue
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'review'
                ? 'border-b-[#111110] text-[#111110] bg-white border-t border-x border-t-[#E5E5E0] border-x-[#E5E5E0]'
                : 'border-b-transparent text-[#666660] hover:text-[#111110]'
            }`}
          >
            03 / Split Document Review
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pb-2 text-[10px] font-mono text-[#777770]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE INTERACTIVE MOCKUP</span>
        </div>
      </div>

      {/* Tab 1: Client Workspace Preview */}
      {activeTab === 'client' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <span>CLIENT WORKSPACE</span>
                <span>·</span>
                <span>ABC TRADERS PVT LTD</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111110] tracking-tight mt-1">
                Good morning, ABC Traders
              </h3>
            </div>

            <span className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#C2410C] font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E03E1A] animate-ping" />
              <span>1 DOCUMENT NEEDS YOUR ATTENTION</span>
            </span>
          </div>

          {/* Action-Required Card */}
          <div className="border border-[#E03E1A] bg-white p-5 sm:p-6 shadow-xs relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#E03E1A]" />
                <span>ACTION REQUIRED · CORRECTION REQUESTED</span>
              </span>
              <span className="text-[11px] font-mono text-[#777770]">
                Logged today · 11:20 AM by Rahul Sharma, CA
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-[#111110]">
                Purchase Register FY24-25 (v1)
              </h4>
              <p className="text-xs font-mono text-[#555550]">
                Balaji Enterprises invoice INV-204 (₹76,700) is missing from the purchase register ledger. Reconcile with GSTR-2B and re-upload revised register.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-4 py-2 bg-[#111110] text-white text-xs font-mono uppercase tracking-wider font-bold">
                Upload V2 Revision
              </span>
              <span className="px-4 py-2 bg-white border border-[#E5E5E0] text-[#111110] text-xs font-mono uppercase tracking-wider font-bold">
                Review Auditor Remarks
              </span>
            </div>
          </div>

          {/* Inline Summary Strip */}
          <div className="border border-[#E5E5E0] bg-[#FAFAF8] px-4 py-3 font-mono text-xs text-[#555550] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span><strong>11</strong> Total Documents</span>
              <span>·</span>
              <span className="text-[#111110]"><strong>2</strong> Awaiting Review</span>
              <span>·</span>
              <span className="text-[#E03E1A] font-bold">1 Correction Required</span>
              <span>·</span>
              <span className="text-emerald-800 font-bold">8 Approved</span>
            </div>

            <span className="text-[11px] text-[#777770]">Q1 FY26 Statutory Engagement</span>
          </div>

          {/* Client Document Table Preview */}
          <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E5E5E0] text-[10px] uppercase text-[#777770]">
                <tr>
                  <th className="p-3">DOCUMENT</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">VERSION</th>
                  <th className="p-3">SUBMITTED</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                <tr className="bg-orange-50/40">
                  <td className="p-3 font-bold text-[#111110]">Purchase Register Apr 2024</td>
                  <td className="p-3 text-[#555550]">PURCHASE_REGISTER</td>
                  <td className="p-3 font-bold text-[#E03E1A]">v1</td>
                  <td className="p-3 text-[#555550]">Today</td>
                  <td className="p-3"><DocumentStatusBadge status="CORRECTION_REQUIRED" size="sm" /></td>
                  <td className="p-3 text-right">
                    <span className="text-xs font-bold text-[#E03E1A] underline cursor-pointer">
                      Fix & Upload v2 →
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#111110]">HDFC Bank Statement Q1</td>
                  <td className="p-3 text-[#555550]">BANK_STATEMENT</td>
                  <td className="p-3 text-[#555550]">v1</td>
                  <td className="p-3 text-[#555550]">Yesterday</td>
                  <td className="p-3"><DocumentStatusBadge status="SUBMITTED" size="sm" /></td>
                  <td className="p-3 text-right text-[#555550]">Awaiting Review</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#111110]">GSTR-3B Filing Summary</td>
                  <td className="p-3 text-[#555550]">GST_RETURN</td>
                  <td className="p-3 text-[#555550]">v2</td>
                  <td className="p-3 text-[#555550]">14 Sep 2026</td>
                  <td className="p-3"><DocumentStatusBadge status="APPROVED" size="sm" /></td>
                  <td className="p-3 text-right text-emerald-800 font-bold">Verified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Auditor Review Queue Preview */}
      {activeTab === 'auditor' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <span>AUDITOR WORKSPACE</span>
                <span>·</span>
                <span>RAHUL SHARMA & ASSOCIATES</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111110] tracking-tight mt-1">
                Statutory Review Queue
              </h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 bg-[#FAFAF8] border border-[#E5E5E0] text-[#111110] font-bold">
                14 Total Documents
              </span>
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                3 Pending Review
              </span>
            </div>
          </div>

          {/* Quick Filter Strip */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 bg-[#111110] text-white font-bold">All (14)</span>
            <span className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E0] text-[#555550]">Awaiting Review (3)</span>
            <span className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E0] text-[#555550]">Under Review (2)</span>
            <span className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E0] text-[#555550]">Correction Required (2)</span>
            <span className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E0] text-[#555550]">Approved (7)</span>
          </div>

          {/* Dense Auditor Table */}
          <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E5E5E0] text-[10px] uppercase text-[#777770]">
                <tr>
                  <th className="p-3">DOCUMENT</th>
                  <th className="p-3">CLIENT</th>
                  <th className="p-3">VERSION</th>
                  <th className="p-3">SUBMITTED</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">ENGAGEMENT CA</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="p-3 font-bold text-[#111110]">Purchase Register Apr 2024</td>
                  <td className="p-3 text-[#555550]">ABC Traders Pvt Ltd</td>
                  <td className="p-3 font-semibold">v1</td>
                  <td className="p-3 text-[#555550]">10:15 AM</td>
                  <td className="p-3"><DocumentStatusBadge status="SUBMITTED" size="sm" /></td>
                  <td className="p-3 text-[#555550]">Rahul Sharma, CA</td>
                  <td className="p-3 text-right">
                    <span className="px-3 py-1 bg-[#111110] text-white text-[11px] font-bold cursor-pointer">
                      Review →
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="p-3 font-bold text-[#111110]">HDFC Bank Statement Mar 2024</td>
                  <td className="p-3 text-[#555550]">Balaji Steels Corp</td>
                  <td className="p-3 font-semibold">v1</td>
                  <td className="p-3 text-[#555550]">09:30 AM</td>
                  <td className="p-3"><DocumentStatusBadge status="UNDER_REVIEW" size="sm" /></td>
                  <td className="p-3 text-[#555550]">Rahul Sharma, CA</td>
                  <td className="p-3 text-right">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold cursor-pointer">
                      Resume →
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="p-3 font-bold text-[#111110]">Form 26AS Tax Credit Statement</td>
                  <td className="p-3 text-[#555550]">Om Logistics Ltd</td>
                  <td className="p-3 font-semibold text-[#E03E1A]">v1</td>
                  <td className="p-3 text-[#555550]">17 Sep</td>
                  <td className="p-3"><DocumentStatusBadge status="CORRECTION_REQUIRED" size="sm" /></td>
                  <td className="p-3 text-[#555550]">Priya Patel, ACA</td>
                  <td className="p-3 text-right">
                    <span className="text-xs text-[#E03E1A] font-bold">Client Notified</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="p-3 font-bold text-[#111110]">GSTR-3B Reconciled Return</td>
                  <td className="p-3 text-[#555550]">Zenith Electricals</td>
                  <td className="p-3 font-semibold">v2</td>
                  <td className="p-3 text-[#555550]">16 Sep</td>
                  <td className="p-3"><DocumentStatusBadge status="APPROVED" size="sm" /></td>
                  <td className="p-3 text-[#555550]">Rahul Sharma, CA</td>
                  <td className="p-3 text-right">
                    <span className="text-xs text-emerald-800 font-bold">Certified PDF</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Split Document Review Preview */}
      {activeTab === 'review' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <span>AUDITOR WORKSPACE</span>
                <span>·</span>
                <span>SPLIT SCREEN REVIEW</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111110] tracking-tight mt-1 flex items-center gap-3">
                <span>Purchase Register Apr 2024</span>
                <span className="text-xs font-mono text-[#555550]">Version 1</span>
                <DocumentStatusBadge status="UNDER_REVIEW" size="sm" />
              </h3>
            </div>

            <span className="px-3 py-1.5 border border-[#E5E5E0] bg-[#FAFAF8] text-[#111110] font-mono text-xs font-bold">
              Section 143(3) Statutory Review
            </span>
          </div>

          {/* 65% / 35% Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 65% (8 cols) Document Sheet */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-3 font-mono text-xs flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">
                  VERSION CONTROL
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#111110] text-white font-bold">v1 (ACTIVE)</span>
                  <span className="px-2 py-0.5 bg-white border border-[#E5E5E0] text-[#777770]">v2 (NOT UPLOADED)</span>
                </div>
              </div>

              {/* Document Sheet */}
              <div className="border border-[#E5E5E0] bg-white p-5 font-mono text-xs space-y-3">
                <div className="border-b border-[#E5E5E0] pb-2 text-[10px] uppercase text-[#777770] flex justify-between">
                  <span>INVOICE ENTRIES INSPECTION</span>
                  <span>GSTR-2B COMPARISON</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-[#FAFAF8] border border-[#E5E5E0]">
                    <span>INV-201 · Apex Steels Ltd</span>
                    <span className="font-bold text-emerald-800">₹1,28,000 · MATCHED</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#FAFAF8] border border-[#E5E5E0]">
                    <span>INV-202 · Om Logistics Corp</span>
                    <span className="font-bold text-emerald-800">₹45,000 · MATCHED</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#FAFAF8] border border-[#E5E5E0]">
                    <span>INV-203 · Zenith Electricals</span>
                    <span className="font-bold text-emerald-800">₹82,000 · MATCHED</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 border border-orange-200 text-[#C2410C]">
                    <span className="font-bold">INV-204 · Balaji Enterprises</span>
                    <span className="font-bold text-[#E03E1A]">₹76,700 · MISSING</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5E0] flex justify-between text-sm font-bold text-[#111110]">
                  <span>PURCHASE REGISTER TOTAL</span>
                  <span>₹2,55,000</span>
                </div>
              </div>
            </div>

            {/* Right 35% (5 cols) Verification Checklist & Actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-4 space-y-3 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                  4-POINT CA VERIFICATION CHECKLIST
                </span>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-white border border-[#111110]">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-semibold text-[#111110]">Document readable & clear</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white border border-[#111110]">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-semibold text-[#111110]">Required statutory fields present</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#FAFAF8] border border-[#E5E5E0] text-[#777770]">
                    <div className="w-3.5 h-3.5 border border-[#CCCCCC] bg-white" />
                    <span>Supporting information reconciled</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#FAFAF8] border border-[#E5E5E0] text-[#777770]">
                    <div className="w-3.5 h-3.5 border border-[#CCCCCC] bg-white" />
                    <span>Tax & ledger arithmetic verified</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border border-[#E5E5E0] bg-white p-4 font-mono text-xs space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                  STATUTORY DECISION
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <span className="py-2.5 px-3 border border-[#E03E1A] bg-orange-50 text-[#C2410C] font-bold text-center">
                    Request Correction
                  </span>
                  <span className="py-2.5 px-3 bg-[#111110] text-white font-bold text-center">
                    Approve Document
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
