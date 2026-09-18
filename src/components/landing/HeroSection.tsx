'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { WorkflowFlashcardQueue } from '@/components/landing/WorkflowFlashcardQueue';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-80px)] flex flex-col justify-center py-6 sm:py-10 overflow-hidden bg-exposed-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        {/* Technical Eyebrow Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-4 sm:pb-5 border-b-2 border-[#0A0A0A] font-mono text-xs mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-[#0A0A0A] text-white px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
              CA AUDIT WORKFLOW SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#4A4A48] text-[10px] sm:text-[11px] font-bold">
            <span>CLIENT &rarr; AUDITOR &rarr; PARTNER &rarr; ADMIN</span>
          </div>
        </div>

        {/* Editorial Headline & Interactive Flashcard Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-6 sm:mb-8">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-[6.2rem] font-black tracking-tighter leading-[0.92] uppercase font-sans text-[#0A0A0A]">
              AUDIT WORKFLOW,
              <br />
              <span className="text-[#E73520]">REIMAGINED.</span>
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className="neo-btn bg-[#E73520] text-white px-7 py-3.5 sm:py-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 font-bold shadow-[4px_4px_0_#0A0A0A]"
                data-cursor="action"
              >
                <span>ENTER WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#workflow"
                className="neo-btn bg-white text-[#0A0A0A] px-6 py-3.5 sm:py-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 font-bold shadow-[4px_4px_0_#0A0A0A]"
              >
                <span>SEE WORKFLOW</span>
                <ChevronDown className="w-4 h-4 text-[#E73520]" />
              </a>
            </div>
          </div>

          {/* Flashcard Queue - Hidden on phones (<lg), shown on desktop/large displays */}
          <div className="hidden lg:block lg:col-span-5">
            <WorkflowFlashcardQueue />
          </div>
        </div>

        {/* Feature badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-5 sm:pt-6 border-t-2 border-[#0A0A0A] font-mono text-xs">
          <div className="p-2.5 sm:p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
            <span className="text-[#777770] block text-[9px] sm:text-[10px] uppercase font-bold">STEP 01</span>
            <span className="font-bold text-[#0A0A0A] text-xs sm:text-sm block leading-tight">Client Setup</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
            <span className="text-[#777770] block text-[9px] sm:text-[10px] uppercase font-bold">STEP 02</span>
            <span className="font-bold text-[#0A0A0A] text-xs sm:text-sm block leading-tight">Review Queue</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
            <span className="text-[#777770] block text-[9px] sm:text-[10px] uppercase font-bold">STEP 03</span>
            <span className="font-bold text-[#0A0A0A] text-xs sm:text-sm block leading-tight">Correction V2</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
            <span className="text-[#777770] block text-[9px] sm:text-[10px] uppercase font-bold">STEP 04</span>
            <span className="font-bold text-[#0A0A0A] text-xs sm:text-sm block leading-tight">Partner Sign-Off</span>
          </div>
        </div>
      </div>
    </section>
  );
}
