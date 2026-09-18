'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sliders, ShieldCheck } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="py-24 border-t-[3px] border-[#0A0A0A] bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="neo-box-lg border-white bg-[#E73520] text-white p-8 sm:p-16 text-center space-y-8 shadow-[8px_8px_0_#FFFFFF]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A0A0A] border border-white text-xs font-mono font-bold uppercase tracking-widest text-white">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse" />
            <span>OPERATIONAL AUDIT SUITE // EVALUATION READY</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight font-sans leading-none">
            EVERY DOCUMENT. EVERY REVIEW.
            <br />
            CLEARLY TRACED.
          </h2>

          <p className="text-base sm:text-lg font-mono font-medium max-w-2xl mx-auto text-white/90">
            Say goodbye to lost WhatsApp files, unversioned spreadsheets, and manual review chaos.
            Switch to the verifiable CA engagement workflow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="neo-btn bg-[#0A0A0A] text-white px-8 py-4 text-sm font-mono uppercase tracking-wider flex items-center gap-2 border-white shadow-[4px_4px_0_#FFFFFF]"
              data-cursor="action"
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-[#E73520]" />
            </Link>

            <Link
              href="/admin/evaluation-tools"
              className="neo-btn bg-white text-[#0A0A0A] px-6 py-4 text-sm font-mono uppercase tracking-wider flex items-center gap-2 border-white shadow-[4px_4px_0_#0A0A0A]"
            >
              <Sliders className="w-4 h-4 text-[#E73520]" />
              <span>EVALUATION SUITE</span>
            </Link>
          </div>
        </div>

        {/* Brutalist Footer Strip */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#A1A19A]">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-sm">TRACERA</span>
            <span>// CA ENGAGEMENT OPERATING SYSTEM</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Client Portal
            </Link>
            <Link href="/auditor/dashboard" className="hover:text-white transition-colors">
              Auditor Queue
            </Link>
            <Link href="/partner/dashboard" className="hover:text-white transition-colors">
              Partner Desk
            </Link>
            <Link href="/admin/evaluation-tools" className="text-[#E73520] hover:underline font-bold">
              Evaluation Tools
            </Link>
          </div>

          <div>
            <span>Section 143(3) Compliance Architecture · 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
