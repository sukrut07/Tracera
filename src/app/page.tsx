import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { WorkflowLifecycle } from '@/components/landing/WorkflowLifecycle';
import { ProductPreviewTabs } from '@/components/landing/ProductPreviewTabs';
import { SignatureAuditTimeline } from '@/components/landing/SignatureAuditTimeline';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { FinalCta } from '@/components/landing/FinalCta';
// Client-component wrapper: ssr:false lives there, not here
import { TopographicTraceField } from '@/components/canvas/TopographicTraceFieldClient';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#0A0A0A] font-sans selection:bg-[#E73520] selection:text-white flex flex-col relative overflow-x-hidden">
      {/* 06 — THREE.JS TOPOGRAPHIC CONTOUR TRACE FIELD BACKGROUND */}
      <TopographicTraceField />

      {/* 09 — NEO-BRUTALIST STICKY NAVBAR */}
      <LandingNavbar />

      {/* MAIN EDITORIAL BODY */}
      <main className="flex-1 relative z-10">
        {/* 10, 11, 12, 13, 14 — HERO SECTION & INTERACTIVE WORKFLOW BOARD */}
        <HeroSection />

        {/* 16 — THE 5-TOOL FRAGMENTATION PROBLEM */}
        <ProblemSection />

        {/* 17 — HOW TRACERA WORKS (01 TO 06) */}
        <WorkflowLifecycle />

        {/* 18 — 3-TAB PRODUCT PREVIEW (CLIENT / AUDITOR / PARTNER) */}
        <ProductPreviewTabs />

        {/* 24 — SIGNATURE IMMUTABLE AUDIT TIMELINE */}
        <SignatureAuditTimeline />

        {/* SECURITY & COMPLIANCE PILLARS */}
        <SecuritySection />

        {/* 43 — FINAL CTA & BRUTALIST FOOTER */}
        <FinalCta />
      </main>
    </div>
  );
}
