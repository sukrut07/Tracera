'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Search,
  AlertTriangle,
  History,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  X,
  CheckCircle2,
  FileText,
  Shield,
  Layers,
} from 'lucide-react';

interface StepDetail {
  num: string;
  stage: string;
  action: string;
  title: string;
  badgeColor: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  summary: string;
  role: string;
  standard: string;
  artifact: string;
  keyActions: string[];
}

const STEPS: StepDetail[] = [
  {
    num: '01',
    stage: 'STAGE 01',
    action: 'COLLECT',
    title: 'DOCUMENT INTAKE',
    badgeColor: 'bg-[#5CC8FF] text-[#0A0A0A]',
    accent: '#0284C7',
    icon: UploadCloud,
    tag: 'EVIDENCE CHECKLIST',
    summary:
      'Structured evidence collection where clients upload statutory trial balances, purchase registers, bank statements, and tax forms directly against the engagement pre-configured checklist.',
    role: 'Client Finance Team & Engagement Coordinator',
    standard: 'ICAI SA 500 (Audit Evidence) & SA 505 (External Confirmations)',
    artifact: 'Verified Document Intake Registry with MIME & size audit stamp',
    keyActions: [
      'Pre-configured statutory checklists tailored by client entity type',
      'Instant MIME-type and size verification on intake',
      'Zero unverified file drops or fragmented WhatsApp attachments',
    ],
  },
  {
    num: '02',
    stage: 'STAGE 02',
    action: 'REVIEW',
    title: 'AUDIT EXAMINATION',
    badgeColor: 'bg-[#FFD23F] text-[#0A0A0A]',
    accent: '#D97706',
    icon: Search,
    tag: 'CROSS-VERIFICATION',
    summary:
      'Reviewing auditors execute 4-point verification checks against source vouchers, GST portal figures (GSTR-2B/3B), and general ledger arithmetic in a split-screen examination viewer.',
    role: 'Reviewing CA Article & Senior Auditor',
    standard: 'ICAI SA 230 (Audit Documentation) & SA 315 (Risk Assessment)',
    artifact: 'Split Inspection Working Paper with 4-Point Verification Stamp',
    keyActions: [
      'Cross-check of GST ITC and bank statement reconciliations',
      'Line-item verification against statutory disclosure thresholds',
      'Systematic recording of auditor observations and working paper notes',
    ],
  },
  {
    num: '03',
    stage: 'STAGE 03',
    action: 'CORRECT',
    title: 'ISSUE & DISCREPANCY',
    badgeColor: 'bg-[#E73520] text-white',
    accent: '#E73520',
    icon: AlertTriangle,
    tag: 'ACTION REQUIRED',
    summary:
      'When vouchers are missing or reconciliations mismatch, the auditor issues a formal discrepancy notice. The document state transitions to CORRECTION_REQUIRED with mandatory reason and priority.',
    role: 'Reviewing Auditor & Client SPOC',
    standard: 'ICAI SA 260 (Communication with Those Charged with Governance)',
    artifact: 'Formal Audit Query Notice with Priority & Reason Log',
    keyActions: [
      'Mandatory issue classification (Omission, Arithmetic, Disclosure)',
      'Instant in-app notification to client with direct re-upload link',
      'Complete elimination of unstructured chat back-and-forth',
    ],
  },
  {
    num: '04',
    stage: 'STAGE 04',
    action: 'RESUBMIT',
    title: 'VERSION CONTROL',
    badgeColor: 'bg-[#A7F3D0] text-[#065F46]',
    accent: '#059669',
    icon: History,
    tag: 'V1 ↔ V2 PRESERVED',
    summary:
      'The client uploads the revised Version 2. The system locks the prior Version 1 as immutable legal evidence, ensuring an auditable comparative trail is permanently preserved.',
    role: 'Client Entity & Auditor',
    standard: 'ICAI SQC 1 (Quality Control for Audit Engagements)',
    artifact: 'Linked Version Tree with Cryptographic Parent Hash',
    keyActions: [
      'Permanent preservation of all prior submitted files and timestamps',
      'Side-by-side delta inspection comparing Version 1 against Version 2',
      'Strict prevention of file deletion or silent cell overrides',
    ],
  },
  {
    num: '05',
    stage: 'STAGE 05',
    action: 'APPROVE',
    title: 'MAKER-CHECKER SIGN-OFF',
    badgeColor: 'bg-[#DDD6FE] text-[#5B21B6]',
    accent: '#7C3AED',
    icon: UserCheck,
    tag: 'PARTNER OVERSIGHT',
    summary:
      'Two-tier statutory review enforcement. Once the reviewing auditor (Maker) verifies that all queries are resolved, the engagement partner (Checker) inspects working papers and issues statutory approval.',
    role: 'Signing Partner (FCA / ACA) & Quality Reviewer',
    standard: 'ICAI SA 220 (Quality Control for an Audit of Financial Statements)',
    artifact: 'Official Statutory Sign-off Certificate with UDIN Allocation',
    keyActions: [
      'Strict maker-checker segregation of duties',
      'Automated check ensuring zero open high-priority issues remain',
      'Formal statutory sign-off recording partner registration and timestamp',
    ],
  },
  {
    num: '06',
    stage: 'STAGE 06',
    action: 'TRACE',
    title: 'IMMUTABLE CLOSURE',
    badgeColor: 'bg-[#0A0A0A] text-white',
    accent: '#0A0A0A',
    icon: ShieldCheck,
    tag: 'SECTION 143(3)',
    summary:
      'Once all sections are approved, the engagement is sealed under Section 143(3). All timestamps, actor logs, review notes, and version diffs are compiled into a peer-review-ready CA Closure Dossier PDF.',
    role: 'Practice Partner & ICAI Peer Review Board',
    standard: 'Companies Act 2013 Section 143(3) & ICAI Peer Review Mandate',
    artifact: 'Signed CA Audit Closure Dossier PDF with Complete Event Ledger',
    keyActions: [
      'Append-only event ledger sealed against post-audit tampering',
      'One-click export of comprehensive Section 143(3) compliance dossier',
      'Permanent archival accessible for statutory inquiries and peer review',
    ],
  },
];

export function WorkflowLifecycle() {
  const [selectedStep, setSelectedStep] = useState<StepDetail | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStep(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="workflow" className="py-20 sm:py-24 border-t-[3px] border-[#0A0A0A] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
            <span>[03] THE 6-STAGE ENGINE</span>
            <span>·</span>
            <span>STRUCTURED PRACTICE DISCIPLINE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0A0A0A]">
            HOW TRACERA WORKS
          </h2>
          <p className="text-base sm:text-lg font-medium text-[#4A4A48] max-w-2xl">
            A linear, accountable progression from raw client document intake to final statutory closure.
            Click any stage below to inspect its audit controls and working papers.
          </p>
        </div>

        {/* 6 Grid Steps - Title Focused & Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                onClick={() => setSelectedStep(step)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedStep(step);
                  }
                }}
                className="neo-box p-6 bg-white hover:bg-[#F7F5EF] flex flex-col justify-between transition-all duration-150 cursor-pointer relative group hover:-translate-y-1 hover:shadow-[6px_6px_0_#0A0A0A] select-none text-left"
                data-cursor="action"
                title={`Click to view ${step.stage} details`}
              >
                <div>
                  {/* Top Row: Huge Number & Stage Badge */}
                  <div className="flex items-center justify-between pb-4 border-b-2 border-[#0A0A0A] mb-5">
                    <span className="text-5xl font-black font-mono text-[#0A0A0A] tracking-tighter leading-none">
                      {step.num}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 border border-[#0A0A0A] shadow-[1px_1px_0_#0A0A0A] ${step.badgeColor}`}
                      >
                        {step.stage}
                      </span>
                      <div
                        className="w-7 h-7 border-2 border-[#0A0A0A] flex items-center justify-center shadow-[1px_1px_0_#0A0A0A]"
                        style={{ backgroundColor: step.accent }}
                      >
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Action Label */}
                  <span className="block text-[11px] font-mono font-black text-[#E73520] uppercase tracking-wider mb-1.5">
                    {step.action}
                  </span>

                  {/* Primary Bold Title */}
                  <h3 className="text-2xl font-black uppercase text-[#0A0A0A] font-sans tracking-tight leading-tight">
                    {step.title}
                  </h3>
                </div>

                {/* Bottom Interactive Tag */}
                <div className="pt-4 mt-6 border-t border-[#0A0A0A]/20 flex items-center justify-between text-[10px] font-mono font-bold text-[#4A4A48]">
                  <span>{step.tag}</span>
                  <div className="flex items-center gap-1 text-[#E73520] group-hover:translate-x-1 transition-transform">
                    <span className="uppercase text-[9px] font-black">DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Detail Modal Drawer */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStep(null)}
              className="fixed inset-0 bg-[#0A0A0A]/75 backdrop-blur-[2px]"
            />

            {/* Neo-brutalist Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#F7F5EF] border-[3px] border-[#0A0A0A] shadow-[8px_8px_0_#0A0A0A] p-6 sm:p-8 font-mono z-10 my-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-step-title"
            >
              {/* Top Window Strip */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#0A0A0A] mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black font-mono text-[#0A0A0A]">
                    {selectedStep.num}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 border border-[#0A0A0A] shadow-[1px_1px_0_#0A0A0A] ${selectedStep.badgeColor}`}
                  >
                    {selectedStep.stage}
                  </span>
                  <span className="text-xs font-bold text-[#E73520] uppercase">
                    {selectedStep.action}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStep(null)}
                  className="p-1.5 bg-white hover:bg-[#E73520] hover:text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-colors cursor-pointer"
                  title="Close (ESC)"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Headline */}
              <div className="mb-6">
                <h3
                  id="modal-step-title"
                  className="text-2xl sm:text-3xl font-black uppercase font-sans text-[#0A0A0A] tracking-tight mb-2"
                >
                  {selectedStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4A48] font-sans font-medium leading-relaxed">
                  {selectedStep.summary}
                </p>
              </div>

              {/* Technical Audit Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
                <div className="p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
                  <span className="text-[10px] text-[#777770] font-bold block uppercase mb-1">
                    PRIMARY ROLES
                  </span>
                  <span className="font-bold text-[#0A0A0A] block leading-snug">
                    {selectedStep.role}
                  </span>
                </div>

                <div className="p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
                  <span className="text-[10px] text-[#777770] font-bold block uppercase mb-1">
                    STATUTORY CRITERIA
                  </span>
                  <span className="font-bold text-[#0A0A0A] block leading-snug">
                    {selectedStep.standard}
                  </span>
                </div>
              </div>

              {/* Key Verification Rules */}
              <div className="mb-6 p-4 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A]">
                <span className="text-[10px] text-[#777770] font-bold block uppercase mb-2">
                  VERIFICATION CRITERIA & CONTROLS
                </span>
                <div className="space-y-2 text-xs">
                  {selectedStep.keyActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-[#0A0A0A]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Artifact */}
              <div className="p-3 bg-[#1A1A18] text-white border-2 border-[#0A0A0A] mb-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FFD23F] shrink-0" />
                  <div>
                    <span className="text-[9px] text-[#A1A19A] block uppercase font-bold">
                      OUTPUT AUDIT ARTIFACT
                    </span>
                    <span className="font-bold text-[#C7F36B] block">
                      {selectedStep.artifact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#0A0A0A]">
                <button
                  onClick={() => setSelectedStep(null)}
                  className="px-4 py-2 text-xs font-bold border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
                >
                  CLOSE [ESC]
                </button>

                <Link
                  href="/login"
                  className="neo-btn bg-[#E73520] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0_#0A0A0A]"
                >
                  <span>TEST IN WORKSPACE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
