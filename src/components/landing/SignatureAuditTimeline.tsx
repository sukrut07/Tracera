'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    status: 'APPROVED',
    actor: 'Rahul Sharma, CA',
    role: 'LEAD AUDITOR SIGN-OFF',
    time: '18 Sep 2026 · 14:32 IST',
    version: 'Version 2 Approved',
    action: 'Verified invoice INV-204 and reconciled with ICEGATE & GST portal. Approved under Section 143(3).',
    isCurrent: true,
    dotColor: 'bg-[#E73520]',
  },
  {
    status: 'REVIEW STARTED',
    actor: 'Lead Auditor, CA',
    role: 'AUDITOR',
    time: '18 Sep 2026 · 14:10 IST',
    version: 'Version 2',
    action: 'Started second review pass on corrected Purchase Register incorporating required ledger vouchers.',
    isCurrent: false,
    dotColor: 'bg-[#0A0A0A]',
  },
  {
    status: 'VERSION 2 SUBMITTED',
    actor: 'Client Organization',
    role: 'CLIENT ENTITY',
    time: '18 Sep 2026 · 13:58 IST',
    version: 'Version 2 (Preserved v1)',
    action: 'Client re-uploaded corrected Purchase Register with invoice INV-204 added. Prior version preserved.',
    isCurrent: false,
    dotColor: 'bg-[#0A0A0A]',
  },
  {
    status: 'CORRECTION REQUESTED',
    actor: 'Lead Auditor, CA',
    role: 'AUDITOR',
    time: '17 Sep 2026 · 17:21 IST',
    version: 'Version 1',
    action: '"Invoice INV-204 is missing from purchase register. Please update the register and re-upload."',
    isCurrent: false,
    dotColor: 'bg-[#0A0A0A]',
  },
  {
    status: 'DOCUMENT ASSIGNED',
    actor: 'Client Organization',
    role: 'CLIENT ENTITY',
    time: '17 Sep 2026 · 16:03 IST',
    version: 'Version 1',
    action: 'Assigned to engagement reviewer for preliminary audit verification.',
    isCurrent: false,
    dotColor: 'bg-[#0A0A0A]',
  },
  {
    status: 'VERSION 1 SUBMITTED',
    actor: 'Client Organization',
    role: 'CLIENT ENTITY',
    time: '17 Sep 2026 · 16:02 IST',
    version: 'Version 1 Initial',
    action: 'Initial monthly submission for statutory audit check. SHA-256 registered in immutable log.',
    isCurrent: false,
    dotColor: 'bg-[#0A0A0A]',
  },
];

export function SignatureAuditTimeline() {
  return (
    <section className="py-24 border-t-[3px] border-[#0A0A0A] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Context & Dossier Download */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
                <span>[05] IMMUTABLE LEDGER</span>
                <span>·</span>
                <span>LEGAL EVIDENCE</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#0A0A0A]">
                THE SIGNATURE AUDIT TIMELINE
              </h2>
              <p className="text-sm sm:text-base font-mono text-[#4A4A48] leading-relaxed">
                Every action in TRACERA is recorded chronologically with actor, role,
                timestamp, version, and statutory action note. Zero mutable overrides.
                Legally admissible under Section 143(3) of the Companies Act.
              </p>
            </div>

            <div className="p-6 border-2 border-[#0A0A0A] bg-[#F7F5EF] shadow-[4px_4px_0_#0A0A0A] space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0A0A0A]">
                <ShieldCheck className="w-4 h-4 text-[#E73520]" />
                <span>ICAI PEER REVIEW READY</span>
              </div>
              <p className="text-xs font-mono text-[#4A4A48]">
                At engagement closure, TRACERA compiles all timeline nodes, maker-checker
                sign-offs, and version diffs into an official signed CA Closure Dossier PDF.
              </p>
              <Link
                href="/api/engagements/eng-statutory-abc-2025/report"
                target="_blank"
                className="neo-btn bg-[#0A0A0A] text-white px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 w-full"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD SAMPLE CLOSURE DOSSIER</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Signature Vertical Timeline Nodes */}
          <div className="lg:col-span-7">
            <div className="neo-box p-6 sm:p-8 bg-[#F7F5EF]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#0A0A0A] font-mono text-xs">
                <span className="font-black text-[#0A0A0A] uppercase">
                  RECORD: PURCHASE REGISTER APR 2024
                </span>
                <span className="text-[10px] text-[#E73520] font-bold">
                  6 EVENTS LOGGED
                </span>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-[2px] before:bg-[#0A0A0A]">
                {TIMELINE_EVENTS.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Event Node Dot */}
                    <div
                      className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center ${event.dotColor}`}
                    >
                      {event.isCurrent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      )}
                    </div>

                    {/* Event Content Box */}
                    <div
                      className={`p-4 border-2 border-[#0A0A0A] transition-all ${
                        event.isCurrent
                          ? 'bg-white shadow-[4px_4px_0_#E73520]'
                          : 'bg-white shadow-[2px_2px_0_#0A0A0A]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#0A0A0A]/20 font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 border border-[#0A0A0A] ${
                              event.isCurrent
                                ? 'bg-[#E73520] text-white'
                                : 'bg-[#0A0A0A] text-white'
                            }`}
                          >
                            {event.status}
                          </span>
                          <span className="text-xs font-bold text-[#0A0A0A]">
                            {event.actor}
                          </span>
                          <span className="text-[10px] text-[#777770]">
                            ({event.role})
                          </span>
                        </div>
                        <span className="text-[10px] text-[#777770]">
                          {event.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-bold text-[#E73520]">
                          {event.version}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-[#222220] leading-relaxed">
                        {event.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
