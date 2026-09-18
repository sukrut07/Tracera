import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { Logo } from '@/components/shared/Logo';
import {
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  UserCheck,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Eye,
  Send,
  MessageSquare,
  FileText,
  Mail,
  Smartphone,
  HardDrive,
} from 'lucide-react';

export default async function LandingPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#problem" className="hover:text-zinc-950 transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-zinc-950 transition-colors">
              Capabilities
            </a>
            <a href="#traceability" className="hover:text-zinc-950 transition-colors">
              Traceability
            </a>
            <a href="#roles" className="hover:text-zinc-950 transition-colors">
              Portals
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href={currentUser.role === 'CLIENT' ? '/client/dashboard' : '/auditor/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-zinc-200/80 bg-white bg-dot-pattern">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/90 text-[11px] font-bold text-zinc-800 mb-6 tracking-wide shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span>AUDIT WORKFLOW, REIMAGINED</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1] mb-6">
            Every document. <br className="hidden sm:inline" />
            Every review. <br className="hidden sm:inline" />
            Every decision. <br className="hidden sm:inline" />
            <span className="text-emerald-700">Clearly traced.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 leading-relaxed mb-10 font-normal">
            Trecera brings client documents, reviews, corrections, approvals and audit history into one structured workflow for modern Chartered Accountant firms.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:translate-y-[-1px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-colors"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Hero Visual: Sophisticated Abstract Audit Workflow Visualization */}
          <div className="bg-zinc-50/80 border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200/80 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="text-xs font-mono text-zinc-400 ml-2">trecera-workflow-engine.ts</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 font-semibold">
                Section 143(3) Compliant
              </span>
            </div>

            {/* Workflow Diagram Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Node 1: Client Upload */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Step 01</span>
                <h4 className="text-xs font-bold text-zinc-900 mt-0.5">Client Upload</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Purchase Register (v1)</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md font-mono font-bold">
                  SUBMITTED
                </span>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center text-zinc-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 2: Auditor Review */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 mb-2">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Step 02</span>
                <h4 className="text-xs font-bold text-zinc-900 mt-0.5">Auditor Review</h4>
                <p className="text-[11px] text-zinc-500 mt-1">5-Point Checklist</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-mono font-bold">
                  UNDER REVIEW
                </span>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center text-zinc-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 3: Decision Branch (Correction / Approval) */}
              <div className="space-y-2.5">
                <div className="bg-white border border-rose-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800">CORRECTION</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Mandatory reason $\rightarrow$ v2</p>
                </div>

                <div className="bg-white border border-emerald-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800">APPROVED</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Locked & Certified</p>
                </div>
              </div>
            </div>

            {/* Bottom Audit Log Strip */}
            <div className="mt-8 pt-5 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Append-Only Audit History</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500 text-[11px]">Every upload, review note & status permanently logged</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">SHA-256 Verified Trail</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 1: The Problem */}
      <section id="problem" className="py-24 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              The Fragmentation Problem
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Audit shouldn&apos;t live across five different apps.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-3 leading-relaxed">
              When CA teams exchange statutory records over loose channels, invoices go missing, versions collide, and accountability vanishes.
            </p>
          </div>

          {/* Visual: Fragmented Channels vs Trecera Unified Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="bg-white border border-rose-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>The Fragmented Reality</span>
              </div>

              <div className="space-y-4 pt-6 text-xs">
                <div className="flex items-start gap-3 text-zinc-600">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block font-semibold">WhatsApp Messages</strong>
                    <span>Photos of bills, forgotten follow-up texts, zero audit trail.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-zinc-600">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block font-semibold">Multiple Excel Revisions</strong>
                    <span>&ldquo;Purchase_Reg_Final_v2_edit.xlsx&rdquo; — nobody knows which version was approved.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-zinc-600">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block font-semibold">Scattered Email Threads</strong>
                    <span>Missing attachments, delayed client responses, untracked remarks.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-zinc-600">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block font-semibold">Uncontrolled Google Drive Folders</strong>
                    <span>Accidental file overwrites, unverified permissions, lack of statutory sign-off.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Trecera Way */}
            <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>The Trecera Solution: One Workflow</span>
                </div>

                <div className="space-y-4 pt-6 text-xs text-zinc-600">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-zinc-900 block font-semibold">Strict Version Preservation</strong>
                      <span>Version 1 is never deleted. Revisions create v2, v3 with full historical file retention.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-zinc-900 block font-semibold">Append-Only Audit History</strong>
                      <span>Immutable chronological record of every status transition, uploader, reviewer, and rationale.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <strong className="text-zinc-900 block font-semibold">Enforced State Transitions</strong>
                      <span>No invalid jumps. Clients cannot approve; auditors cannot approve unreviewed files.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100">
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Experience the Clean Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 2: How Trecera Works (5 Steps) */}
      <section id="how-it-works" className="py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Structured Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              How Trecera Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Five clear steps from initial client submission to locked audit sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-zinc-400">01</span>
                <h3 className="text-sm font-bold text-zinc-900 mt-2">Upload</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Client uploads bank statements, purchase registers, or invoices with automated file typing.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-4 block font-medium">Status: SUBMITTED</span>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-zinc-400">02</span>
                <h3 className="text-sm font-bold text-zinc-900 mt-2">Review</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Auditor opens the split-view console, checks the 5-point verification checklist, and reviews data.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-4 block font-medium">Status: UNDER REVIEW</span>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-rose-600">03</span>
                <h3 className="text-sm font-bold text-zinc-900 mt-2">Correct</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Discrepancies trigger a formal correction request with mandatory reason. Client uploads v2.
                </p>
              </div>
              <span className="text-[10px] font-mono text-rose-600 mt-4 block font-medium">Status: CORRECTION</span>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600">04</span>
                <h3 className="text-sm font-bold text-zinc-900 mt-2">Approve</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Auditor approves the verified version. Document state locks against further edits.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 mt-4 block font-medium">Status: APPROVED</span>
            </div>

            {/* Step 5 */}
            <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-zinc-900">05</span>
                <h3 className="text-sm font-bold text-zinc-900 mt-2">Trace</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Complete append-only timeline generated with timestamps, versions, and reviewer notes.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 mt-4 block font-medium">Section 143(3)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 3: Core Capabilities */}
      <section id="capabilities" className="py-24 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Enterprise Features
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Built for CA Rigor & Precision
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Every feature designed to remove ambiguity and guarantee compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Document Management</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Centralize Bank Statements, Purchase Registers, Tax Invoices, and TDS forms by FY and client.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <Layers className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Version Control</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Prior versions are permanently archived. Never overwrite historical submissions or working papers.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Structured Review</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                5-point verification checklist ensures legible data, valid GSTINs, and consistent tax totals.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Correction Workflow</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Auditors specify exact missing records. Clients receive instant alerts to upload reconciled fixes.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <Clock className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Audit History</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Chronological event trail capturing exact actors, timestamps, versions, and rationale.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <Lock className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Role-Based Access</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Strict multi-tenant boundaries. Clients can only see their files; only auditors can approve.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <Sparkles className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">Automated Extraction</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Extracts invoice numbers, dates, vendor GSTIN, and taxable amounts with confidence scores.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-zinc-900 mb-3" />
              <h4 className="text-xs font-bold text-zinc-900">PDF Report Export</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Export an official CA verification certificate with document metadata and full audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 4: Traceability Showcase */}
      <section id="traceability" className="py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              The Primary Differentiator
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Unbroken Traceability
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Every status change is permanently committed. Nothing is hidden, modified, or erased.
            </p>
          </div>

          {/* Vertical Timeline Card */}
          <div className="bg-zinc-50/70 border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="space-y-6">
              {/* Event 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 pb-6 border-b border-zinc-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900">Document Approved</span>
                    <span className="text-[10px] font-mono text-zinc-400">18 Sep 2026, 11:30 AM</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Auditor <strong>Rahul Sharma</strong> signed off on Version 2. &ldquo;Reconciled with GSTR-2B. Math verified.&rdquo;
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-semibold">
                    Version 2
                  </span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-4 h-4" />
                </div>
                <div className="flex-1 pb-6 border-b border-zinc-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900">Correction Uploaded (v2)</span>
                    <span className="text-[10px] font-mono text-zinc-400">18 Sep 2026, 10:45 AM</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Client <strong>ABC Traders</strong> uploaded corrected file. Version 1 preserved.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-200 font-semibold">
                    Version 2 Created
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 pb-6 border-b border-zinc-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900">Correction Requested</span>
                    <span className="text-[10px] font-mono text-zinc-400">17 Sep 2026, 04:30 PM</span>
                  </div>
                  <p className="text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60 mt-1">
                    &ldquo;Invoice INV-204 is missing from the purchase register. Please correct and re-upload.&rdquo;
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200 font-semibold">
                    Version 1
                  </span>
                </div>
              </div>

              {/* Event 4 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900">Document Uploaded</span>
                    <span className="text-[10px] font-mono text-zinc-400">17 Sep 2026, 02:15 PM</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Initial client submission: <code>purchase_register_apr.xlsx</code>
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded border border-zinc-200 font-semibold">
                    Version 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section 5: Role-Based Portals */}
      <section id="roles" className="py-24 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Tailored Portals
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Clear Context for Every Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Portal Card */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 uppercase">
                  Client Workspace
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-3">
                  &ldquo;Know exactly what needs attention.&rdquo;
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Clients get complete visibility into which documents are waiting for review, which need correction, and which are approved. No frantic phone calls before tax deadlines.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant notification when auditor requests correction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Upload revised files without overwriting previous versions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Download certified audit reports and verification certificates</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:text-emerald-700 transition-colors"
                >
                  <span>Explore Client Experience</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Auditor Portal Card */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 uppercase">
                  Auditor Console
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-3">
                  &ldquo;Review documents with complete context.&rdquo;
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Auditors work from a unified, urgency-ranked review queue. Side-by-side document preview, standardized checklist verification, and 1-click correction requests.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Split-screen preview with inline spreadsheet and PDF viewer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>5-point audit verification checklist before sign-off</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Multi-filter search across clients, FY, and document categories</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:text-emerald-700 transition-colors"
                >
                  <span>Explore Auditor Experience</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section 6: Final CTA */}
      <section className="py-24 bg-zinc-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            Evaluation Ready
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Bring your audit workflow into one traceable system.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
            Test the full lifecycle from document upload through revision, auditor checklist review, approval, and cryptographic audit log.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <span>Start with Trecera</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Minimalist Footer */}
      <footer className="py-12 bg-white border-t border-zinc-200 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-4 text-[11px]">
            <span>Section 143(3) Audit Compliance</span>
            <span>•</span>
            <span>MongoDB Atlas & Firebase Persistent</span>
            <span>•</span>
            <span>© 2026 Trecera</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
