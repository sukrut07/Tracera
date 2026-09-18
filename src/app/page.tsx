import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { Logo } from '@/components/shared/Logo';
import { HeroWorkflowMotion } from '@/components/landing/HeroWorkflowMotion';
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
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E5E5E0]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#666660]">
            <a href="#problem" className="hover:text-[#111110] transition-colors">
              The Problem
            </a>
            <a href="#workflow" className="hover:text-[#111110] transition-colors">
              Workflow
            </a>
            <a href="#capabilities" className="hover:text-[#111110] transition-colors">
              Capabilities
            </a>
            <a href="#traceability" className="hover:text-[#111110] transition-colors">
              Traceability
            </a>
            <a href="#security" className="hover:text-[#111110] transition-colors">
              Security
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
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
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
      <section className="relative pt-20 pb-20 border-b border-[#E5E5E0] bg-subtle-grid">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E0] text-[10px] font-mono font-bold uppercase tracking-widest text-[#111110] mb-6">
            <span className="w-1.5 h-1.5 bg-[#E03E1A]" />
            <span>AUDIT WORKFLOW, REIMAGINED</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#111110] tracking-tight leading-[1.08] mb-6">
            Every document. <br />
            Every review. <br />
            <span className="text-[#E03E1A]">Clearly traced.</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#555550] leading-relaxed mb-8">
            TRACERA helps CA firms manage client documents, reviews, corrections,
            approvals, and immutable audit history in one structured workspace.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#workflow"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#FAFAF8] text-[#111110] text-xs font-mono uppercase tracking-widest font-bold border border-[#E5E5E0] transition-colors"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Hero Visual: Interactive Product Motion Loop */}
          <HeroWorkflowMotion />
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problem" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-2">
              THE FRAGMENTATION PROBLEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Audit work shouldn’t live across five different tools.
            </h2>
            <p className="text-sm text-[#666660] mt-3 leading-relaxed">
              When client files, reviewer revisions, and statutory sign-offs are scattered, CA firms face untracked versions, missing invoices, and non-compliance risk.
            </p>
          </div>

          {/* 5 Broken Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-[#E5E5E0] divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0]">
            {[
              {
                tool: 'WhatsApp',
                issue: 'Lost attachments & unindexed threads',
                detail: 'Crucial invoices sent as compressed photos with zero context or version tracking.',
                icon: Smartphone,
              },
              {
                tool: 'Excel',
                issue: 'Formula errors & version chaos',
                detail: 'Conflicting "Final_v2_edit.xlsx" files passed around with untracked manual overwrites.',
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
                tool: 'Follow-ups',
                issue: 'Missed filing statutory deadlines',
                detail: 'Manual WhatsApp and phone reminders that fail to create an audit-compliant paper trail.',
                icon: Clock,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.tool} className="p-6 bg-[#FAFAF8] space-y-3">
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

          {/* Transition to TRACERA banner */}
          <div className="mt-8 border border-[#111110] bg-[#111110] text-[#FAFAF8] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
                THE SOLUTION
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                One unified, traceable audit system.
              </h3>
              <p className="text-xs text-[#A1A19A] mt-1">
                Every document submitted, reviewed, corrected, and approved in a single state machine.
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

      {/* 4. Editorial Workflow Section */}
      <section id="workflow" className="py-24 border-b border-[#E5E5E0] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-2">
              THE 5-STEP LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              How TRACERA Works
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              An editorial progression designed around the genuine statutory review cycle of Chartered Accountants.
            </p>
          </div>

          {/* Editorial Numbered Timeline */}
          <div className="border border-[#E5E5E0] bg-white divide-y divide-[#E5E5E0]">
            {[
              {
                num: '01',
                title: 'UPLOAD',
                subtitle: 'Client submits the source document',
                desc: 'Client uploads Bank Statements, Purchase Registers, GST Returns, or Tax Invoices. Document is immutably registered as Version 1 in SUBMITTED status.',
                meta: 'Preserves original raw file · Generates OCR preview · Auto-assigns engagement auditor',
              },
              {
                num: '02',
                title: 'REVIEW',
                subtitle: 'Auditor examines the exact version',
                desc: 'Auditor opens the split-screen Review Workspace. Verifies line-by-line totals against ICEGATE/GST portal with the 4-point CA statutory verification checklist.',
                meta: 'State transitions to UNDER_REVIEW · Logs reviewer name & start timestamp',
              },
              {
                num: '03',
                title: 'CORRECT',
                subtitle: 'Auditor requests revision with mandatory reason',
                desc: 'If line discrepancies or missing invoices exist, auditor issues a formal correction request. Client receives an instant Action Required alert on their dashboard.',
                meta: 'State transitions to CORRECTION_REQUIRED · Mandatory reason logged to audit history',
              },
              {
                num: '04',
                title: 'APPROVE',
                subtitle: 'Auditor approves the final reconciled version',
                desc: 'Client uploads Version 2 (previous version is safely preserved). Auditor confirms the reconciliation and issues official statutory sign-off.',
                meta: 'State transitions to APPROVED · Document is permanently locked against changes',
              },
              {
                num: '05',
                title: 'TRACE',
                subtitle: 'Every action remains recorded forever',
                desc: 'Complete chronological history generated in compliance with Section 143(3). One click exports the official CA Audit Verification Report as a signed PDF.',
                meta: 'Tamper-evident chronological log · Actor, role, version & timestamp preserved',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start hover:bg-[#FAFAF8]/60 transition-colors"
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
                    STATE MACHINE & AUDIT COMMIT:
                  </span>
                  <p>{step.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Asymmetric Capabilities Grid */}
      <section id="capabilities" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-2">
              BUILT FOR CA AUDITORS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Engineered for document control.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Essential capabilities without feature bloat. Focused entirely on document lifecycle integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Big feature card 1 */}
            <div className="md:col-span-2 border border-[#E5E5E0] bg-[#FAFAF8] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                CORE CAPABILITY
              </span>
              <h3 className="text-2xl font-bold text-[#111110]">
                Strict Document Version Control (v1, v2, v3…)
              </h3>
              <p className="text-sm text-[#555550] leading-relaxed font-sans">
                Never worry about overwritten files again. When a client uploads a revision, TRACERA automatically preserves all prior versions with their respective reviewer remarks, original timestamps, and extraction records.
              </p>
              <div className="pt-4 border-t border-[#E5E5E0] flex flex-wrap gap-4 text-xs font-mono text-[#555550]">
                <span className="flex items-center gap-1.5 font-semibold text-[#111110]">
                  <Check className="w-3.5 h-3.5 text-[#E03E1A]" /> Immutable Storage
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#111110]">
                  <Check className="w-3.5 h-3.5 text-[#E03E1A]" /> Instant Version Comparison
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#111110]">
                  <Check className="w-3.5 h-3.5 text-[#E03E1A]" /> Decision Audit Trail
                </span>
              </div>
            </div>

            {/* Feature card 2 */}
            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                STATUTORY COMPLIANCE
              </span>
              <h3 className="text-xl font-bold text-[#111110]">
                Section 143(3) Audit Trail
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Append-only chronological event logs documenting every upload, state shift, and partner sign-off.
              </p>
              <div className="pt-2 font-mono text-[11px] text-[#111110] font-bold">
                Exportable Official CA PDF Report →
              </div>
            </div>

            {/* Feature card 3 */}
            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                AUDITOR WORKSPACE
              </span>
              <h3 className="text-xl font-bold text-[#111110]">
                Split-Screen Review Console
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Inspect 60% document preview side-by-side with 4-point verification checklists and comment threads.
              </p>
            </div>

            {/* Feature card 4 */}
            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                CLIENT EXPERIENCE
              </span>
              <h3 className="text-xl font-bold text-[#111110]">
                Action-Required Correction Alerts
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Clients see high-priority revision requests prominently on login, reducing turnaround lag by 70%.
              </p>
            </div>

            {/* Feature card 5 */}
            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold">
                SECURITY & ISOLATION
              </span>
              <h3 className="text-xl font-bold text-[#111110]">
                Multi-Tenant Client Isolation
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Server-enforced role-based access guarantees clients can never see cross-firm files or audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Signature Traceability Section */}
      <section id="traceability" className="py-24 border-b border-[#E5E5E0] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-2">
              IMMUTABLE AUDIT TRAIL
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Nothing disappears into the inbox.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Every transition in TRACERA is an immutable audit record containing actor identity, role, target version, and timestamp.
            </p>
          </div>

          {/* Visual Audit Trail Mockup */}
          <div className="max-w-4xl mx-auto border border-[#E5E5E0] bg-white p-6 sm:p-10 font-mono">
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
                  state: 'DOCUMENT_APPROVED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v2',
                  time: '18 Sep 2026 · 03:00 PM',
                  desc: 'Verified invoice INV-204 and reconciled with ICEGATE and GST portal. Approved.',
                },
                {
                  state: 'REVIEW_STARTED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v2',
                  time: '18 Sep 2026 · 02:25 PM',
                  desc: 'Re-opened review queue for version 2.',
                },
                {
                  state: 'CORRECTION_UPLOADED',
                  actor: 'ABC Traders (Client)',
                  role: 'CLIENT',
                  version: 'v2',
                  time: '18 Sep 2026 · 02:10 PM',
                  desc: 'Re-uploaded with missing invoice INV-204 added.',
                },
                {
                  state: 'CORRECTION_REQUESTED',
                  actor: 'Rahul Sharma, CA',
                  role: 'AUDITOR',
                  version: 'v1',
                  time: '18 Sep 2026 · 11:20 AM',
                  desc: 'Invoice INV-204 is missing from the purchase register. Please correct and re-upload.',
                },
                {
                  state: 'DOCUMENT_UPLOADED',
                  actor: 'ABC Traders (Client)',
                  role: 'CLIENT',
                  version: 'v1',
                  time: '18 Sep 2026 · 10:15 AM',
                  desc: 'Initial monthly submission for audit check.',
                },
              ].map((log, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-[#111110] space-y-1 text-xs">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 bg-[#111110]" />
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#777770]">
                    <span className="font-bold text-[#111110]">
                      {log.state} ({log.version})
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

      {/* 7. Security Section */}
      <section id="security" className="py-24 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-2">
              TRUST & GOVERNANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111110]">
              Built around controlled access.
            </h2>
            <p className="text-sm text-[#666660] mt-3">
              Confidential financial records demand verifiable, role-restricted boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                01 / Role-Based Access Control (RBAC)
              </span>
              <p className="text-[#666660] font-sans">
                Clients strictly view their own organizational files. Auditors are isolated to assigned engagements.
              </p>
            </div>

            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                02 / Firebase Storage Isolation
              </span>
              <p className="text-[#666660] font-sans">
                Files are segregated per document ID and version number. Files are never overwritten or deleted.
              </p>
            </div>

            <div className="border border-[#E5E5E0] bg-[#FAFAF8] p-6 space-y-2">
              <span className="text-xs font-bold text-[#111110] block">
                03 / Strict State Machine Enforcement
              </span>
              <p className="text-[#666660] font-sans">
                Unauthorized transitions (e.g. approving without review or client self-approvals) are blocked server-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-24 bg-[#111110] text-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block">
            READY TO AUDIT
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Make every audit step traceable.
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[#A1A19A] leading-relaxed">
            Bring documents, reviews, corrections and approvals into one structured workflow.
          </p>

          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FAFAF8] hover:bg-white text-[#111110] text-xs font-mono uppercase tracking-widest font-bold transition-colors shadow-xs"
            >
              <span>Get started with TRACERA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Minimal Editorial Footer */}
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
            <a href="#capabilities" className="hover:text-[#111110]">Capabilities</a>
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
