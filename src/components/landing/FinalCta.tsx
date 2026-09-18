'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="py-24 border-t-[3px] border-[#0A0A0A] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="border-[3px] border-[#0A0A0A] bg-white !text-[#0A0A0A] p-8 sm:p-16 text-center space-y-8 shadow-[8px_8px_0_#E73520]"
          style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0A0A0A] border-2 border-[#0A0A0A] text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_#C7F36B]">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse" />
            <span>OPERATIONAL AUDIT SUITE // EVALUATION READY</span>
          </div>

          <h2
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight !text-[#0A0A0A] leading-none"
            style={{ color: '#0A0A0A' }}
          >
            EVERY DOCUMENT. EVERY REVIEW.
            <br />
            CLEARLY TRACED.
          </h2>

          <p
            className="text-base sm:text-lg font-medium max-w-2xl mx-auto !text-[#0A0A0A]"
            style={{ color: '#0A0A0A' }}
          >
            Say goodbye to lost WhatsApp files, unversioned spreadsheets, and manual review chaos.
            Switch to the verifiable CA engagement workflow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] !text-white px-8 py-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] transition-all"
              style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
              data-cursor="action"
            >
              <span style={{ color: '#FFFFFF' }}>ENTER WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-[#E73520] group-hover:text-white" />
            </Link>
          </div>
        </div>

        {/* Brutalist Footer Strip */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs text-[#A1A19A]">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-sm">TRACERA</span>
            <span className="font-bold text-white/60">// CA ENGAGEMENT OPERATING SYSTEM</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-white transition-colors">
              Client Portal
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Auditor Console
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Partner Suite
            </Link>
          </div>

          <div>
            <span className="font-medium text-white/60">Section 143(3) Compliance Architecture · 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
