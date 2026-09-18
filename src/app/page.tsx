import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { Logo } from '@/components/shared/Logo';
import { ArchitecturalTraceBackground } from '@/components/landing/ArchitecturalTraceBackground';
import { HeroWorkflowNodes } from '@/components/landing/HeroWorkflowNodes';
import { InteractiveWorkflowDemo } from '@/components/landing/InteractiveWorkflowDemo';
import { InteractiveProductPreview } from '@/components/landing/InteractiveProductPreview';
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  History,
  AlertTriangle,
  FileCheck,
  Building2,
  ShieldCheck,
  Layers,
  Lock,
  MessageSquare,
  FileText,
  Mail,
  Smartphone,
  HardDrive,
  Users,
  Eye,
  Check,
} from 'lucide-react';

export default async function LandingPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111110] selection:bg-[#111110] selection:text-white font-sans antialiased">
      {/* 1. Clean Editorial Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E5E5E0]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#666660]">
            <a href="#workflow" className="hover:text-[#111110] transition-colors">
              Product
            </a>
            <a href="#lifecycle" className="hover:text-[#111110] transition-colors">
              Workflow
            </a>
            <a href="#preview" className="hover:text-[#111110] transition-colors">
              Preview
            </a>
            <a href="#security" className="hover:text-[#111110] transition-colors">
              Security
            </a>
            <a href="#problem" className="hover:text-[#111110] transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href={currentUser.role === 'CLIENT' ? '/client/dashboard' : '/auditor/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#666660] hover:text-[#111110] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Architectural Trace Background & Hoverable Workflow Nodes */}
      <section className="relative pt-24 pb-24 border-b border-[#E5E5E0] overflow-hidden">
        <ArchitecturalTraceBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E0] text-[10px] font-mono font-bold uppercase tracking-widest text-[#111110] mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 bg-[#E03E1A]" />
            <span>AUDIT WORKFLOW, REIMAGINED</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#111110] tracking-tight leading-[1.06] mb-6 font-mono uppercase">
            AUDIT WORKFLOW, <br />
            <span className="text-[#E03E1A]">REIMAGINED.</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#555550] leading-relaxed mb-8 font-sans">
            Collect documents, review them, request corrections, approve final versions and preserve every action — in one traceable workspace.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold transition-colors shadow-xs"
            >
              <span>Get started →</span>
            </Link>

            <a
              href="#workflow"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#FAFAF8] text-[#111110] text-xs font-mono uppercase tracking-widest font-bold border border-[#E5E5E0] transition-colors"
            >
              <span>See how it works</span>
            </a>
          </div>

          {/* Interactive TRACERA Workflow Node Progression */}
          <HeroWorkflowNodes />
        </div>
      </section>

      {/* 3. Interactive Product Demonstration (01 Upload -> 02 Review -> 03 Correct -> 04 Approve -> 05 Trace) */}
      <section id="workflow" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              LIVE INTERACTIVE DEMONSTRATOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              See the workflow in action.
            </h2>
            <p className="text-sm text-[#666660] mt-2">
              Step through the exact audit lifecycle from initial client submission to official CA sign-off.
            </p>
          </div>

          <InteractiveWorkflowDemo />
        </div>
      </section>

      {/* 4. The Fragmentation Problem Section */}
      <section id="problem" className="py-24 border-b border-[#E5E5E0] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              THE FRAGMENTATION PROBLEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Audit work shouldn't live across five different tools.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              When client files and reviewer feedback are scattered across inboxes and spreadsheets, critical invoices get missed and deadlines slip.
            </p>
          </div>

          {/* 5 Broken Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-[#E5E5E0] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0]">
            {[
              {
                tool: 'WhatsApp',
                issue: 'Lost attachments & unindexed threads',
                detail: 'Crucial invoices sent as photos with zero context or version tracking.',
                icon: Smartphone,
              },
              {
                tool: 'Excel',
                issue: 'Formula errors & version chaos',
                detail: 'Conflicting "Final_v2_edit.xlsx" files passed around with untracked overwrites.',
                icon: FileSpreadsheet,
              },
              {
                tool: 'Email',
                issue: 'Buried threads & missing replies',
                detail: 'Correction requests lost beneath hundreds of daily client correspondences.',
                icon: Mail,
              },
              {
                tool: 'Google Drive',
                issue: 'Orphaned folders & overwrites',
                detail: 'Clients upload unorganized scans into random directories without reviewer alerts.',
                icon: HardDrive,
              },
              {
                tool: 'Manual follow-ups',
                issue: 'Missed filing statutory deadlines',
                detail: 'Manual phone reminders that fail to create an audit-compliant paper trail.',
                icon: Clock,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.tool} className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#777770]" />
                    <span className="font-mono text-xs uppercase font-bold text-[#111110]">
                      {item.tool}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#111110] leading-snug">
                    {item.issue}
                  </h4>
                  <p className="text-xs text-[#666660] leading-relaxed font-sans">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Editorial Transition Banner */}
          <div className="mt-8 border border-[#111110] bg-[#111110] text-[#FAFAF8] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block">
                ONE UNIFIED WORKFLOW
              </span>
              <h3 className="text-xl font-bold tracking-tight">
                One workflow. One document history. One source of truth.
              </h3>
              <p className="text-xs text-[#A1A19A]">
                Every document submitted, reviewed, corrected, and certified in an append-only state machine.
              </p>
            </div>

            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#FAFAF8] hover:bg-white text-[#111110] text-xs font-mono uppercase tracking-widest font-bold shrink-0 transition-colors"
            >
              Experience TRACERA →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Editorial 6-Step Audit Lifecycle Section */}
      <section id="lifecycle" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              THE 6-STEP STATUTORY LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              How TRACERA Works
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              An editorial progression designed around the statutory review cycle of Chartered Accountants.
            </p>
          </div>

          {/* Numbered Editorial Timeline */}
          <div className="border border-[#E5E5E0] divide-y divide-[#E5E5E0]">
            {[
              {
                num: '01',
                title: 'COLLECT',
                subtitle: 'Clients upload documents into the correct workspace.',
                desc: 'Client uploads Bank Statements, Purchase Registers, GST Returns, or Tax Invoices. Document is immutably registered as Version 1 in SUBMITTED status.',
                meta: 'Original raw file preserved · Secure storage · Auto-notifies engagement auditor',
              },
              {
                num: '02',
                title: 'REVIEW',
                subtitle: 'Auditors review the exact submitted version.',
                desc: 'Auditor opens the split-screen Review Workspace. Verifies line-by-line totals against ICEGATE/GST portal with the 4-point CA statutory verification checklist.',
                meta: 'State transitions to UNDER_REVIEW · Logs reviewer name & start timestamp',
              },
              {
                num: '03',
                title: 'CORRECT',
                subtitle: 'Corrections are requested with clear reasons.',
                desc: 'If line discrepancies or missing invoices exist, auditor issues a formal correction request. Client receives an instant Action Required alert on their dashboard.',
                meta: 'State transitions to CORRECTION_REQUIRED · Mandatory reason logged to audit history',
              },
              {
                num: '04',
                title: 'RESUBMIT',
                subtitle: 'Clients upload a new version without destroying the old one.',
                desc: 'Client uploads Version 2 (previous version is safely preserved). Auditor confirms the reconciliation and issues official statutory sign-off.',
                meta: 'Version 2 created · Version 1 archived immutably · State transitions back to SUBMITTED',
              },
              {
                num: '05',
                title: 'APPROVE',
                subtitle: 'Auditors approve only the version they reviewed.',
                desc: 'Auditor re-verifies the amended ledger against portal totals, marks all 4 checklist points complete, and issues statutory certification sign-off.',
                meta: 'State transitions to APPROVED · Document is permanently locked against modifications',
              },
              {
                num: '06',
                title: 'TRACE',
                subtitle: 'Every action remains visible in the audit history.',
                desc: 'Complete chronological history generated in compliance with Section 143(3). One click exports the official CA Audit Verification Report as a certified PDF.',
                meta: 'Tamper-evident chronological log · Actor, role, version & timestamp preserved',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start hover:bg-[#FAFAF8]/60 transition-colors group"
              >
                <div className="md:col-span-2">
                  <span className="text-4xl sm:text-5xl font-mono font-black text-[#111110] tracking-tighter">
                    {step.num}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mt-1">
                    {step.title}
                  </span>
                </div>

                <div className="md:col-span-6 space-y-2">
                  <h3 className="text-lg font-bold text-[#111110]">
                    {step.subtitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555550] leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="md:col-span-4 bg-[#FAFAF8] border border-[#E5E5E0] p-4 text-[11px] font-mono text-[#666660] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#111110] block">
                    STATE MACHINE COMMIT:
                  </span>
                  <p>{step.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Live Interactive Product Preview (3 Tabs: Client, Auditor, Document) */}
      <section id="preview" className="py-24 border-b border-[#E5E5E0] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              LIVE PRODUCT PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Built for precision. Tailored for practice.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Switch between the live interfaces built specifically for client submissions, auditor review queues, and statutory verification.
            </p>
          </div>

          <InteractiveProductPreview />
        </div>
      </section>

      {/* 7. Signature Traceability Section */}
      <section id="traceability" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              IMMUTABLE AUDIT TRAIL
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Nothing disappears into the inbox.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Every transition in TRACERA is an immutable audit record containing actor identity, role, target version, and timestamp.
            </p>
          </div>

          {/* Signature Vertical Timeline */}
          <div className="max-w-4xl mx-auto border border-[#E5E5E0] bg-[#FAFAF8] p-6 sm:p-10 font-mono">
            <div className="border-b border-[#E5E5E0] pb-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-[#777770] tracking-widest block">
                  ENGAGEMENT AUDIT TRAIL
                </span>
                <span className="text-sm font-bold text-[#111110]">
                  DOC-2024-0421 · ABC Traders Pvt Ltd
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                LOCKED & CERTIFIED
              </span>
            </div>

            <div className="space-y-6">
              {[
                {
                  state: 'APPROVED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v2',
                  time: '18 Sep 2026 · 14:32',
                  desc: 'Version 2 approved. Reconciled invoice INV-204 with ICEGATE and GST portal.',
                },
                {
                  state: 'REVIEW STARTED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v2',
                  time: '18 Sep 2026 · 14:10',
                  desc: 'Re-opened review queue for version 2.',
                },
                {
                  state: 'VERSION 2 SUBMITTED',
                  actor: 'ABC Traders (Client)',
                  role: 'CLIENT',
                  version: 'v2',
                  time: '18 Sep 2026 · 13:58',
                  desc: 'Re-uploaded with missing invoice INV-204 added.',
                },
                {
                  state: 'CORRECTION REQUESTED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v1',
                  time: '17 Sep 2026 · 17:21',
                  desc: 'Invoice INV-204 is missing from the purchase register.',
                },
                {
                  state: 'VERSION 1 SUBMITTED',
                  actor: 'ABC Traders (Client)',
                  role: 'CLIENT',
                  version: 'v1',
                  time: '17 Sep 2026 · 16:02',
                  desc: 'Initial monthly submission for audit check.',
                },
              ].map((log, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-[#111110] space-y-1 text-xs">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 bg-[#111110]" />
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#777770]">
                    <span className="font-bold text-[#111110]">
                      ● {log.state} ({log.version})
                    </span>
                    <span>{log.time}</span>
                  </div>
                  <div className="text-[#333330]">
                    By <strong className="text-[#111110]">{log.actor}</strong> ({log.role})
                  </div>
                  <p className="text-[#666660] font-sans text-xs pt-0.5">
                    "{log.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Security UX Section */}
      <section id="security" className="py-24 border-b border-[#E5E5E0] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              SECURITY & GOVERNANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Built around controlled access.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Confidential financial records demand verifiable, role-restricted boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="border border-[#E5E5E0] bg-white p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                01 / Secure Client Workspace
              </span>
              <p className="text-[#666660] font-sans">
                Clients strictly view their own organizational files. Auditors are isolated to assigned engagements.
              </p>
            </div>

            <div className="border border-[#E5E5E0] bg-white p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                02 / Role-Based Access Control (RBAC)
              </span>
              <p className="text-[#666660] font-sans">
                Server-enforced role checks ensure clients cannot approve documents or view cross-firm engagements.
              </p>
            </div>

            <div className="border border-[#E5E5E0] bg-white p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                03 / Document History Preserved
              </span>
              <p className="text-[#666660] font-sans">
                Files are versioned and immutably preserved. Unauthorized state transitions are rejected server-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="py-24 bg-[#111110] text-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block">
            READY TO AUDIT
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Every document. Every review. Clearly traced.
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[#A1A19A] leading-relaxed">
            Bring documents, reviews, corrections and approvals into one structured workflow.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FAFAF8] hover:bg-white text-[#111110] text-xs font-mono uppercase tracking-widest font-bold transition-colors shadow-xs"
            >
              <span>Get started →</span>
            </Link>

            <Link
              href="/admin/evaluation-tools"
              className="inline-flex items-center gap-2 px-6 py-4 bg-transparent hover:bg-white/10 text-white border border-white/20 text-xs font-mono uppercase tracking-widest font-bold transition-colors"
            >
              <span>Evaluation Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Minimal Editorial Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Logo size="md" href="/" />
            <p className="text-xs text-[#666660] font-mono">
              Audit workflow, clearly traced.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-mono text-[#666660]">
            <a href="#problem" className="hover:text-[#111110]">Problem</a>
            <a href="#workflow" className="hover:text-[#111110]">Workflow</a>
            <a href="#preview" className="hover:text-[#111110]">Preview</a>
            <a href="#security" className="hover:text-[#111110]">Security</a>
            <Link href="/login" className="hover:text-[#111110]">Sign In</Link>
            <Link href="/admin/evaluation-tools" className="text-[#E03E1A] hover:underline font-bold">Evaluation Workspace</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#888880] gap-4">
          <span>© 2026 TRACERA Inc. All rights reserved.</span>
          <span>Designed for Chartered Accountant practice management.</span>
        </div>
      </footer>
    </div>
  );
}
