import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#0A0A0A] font-sans py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#E73520] hover:text-white transition-all mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="border-4 border-[#0A0A0A] bg-white p-6 sm:p-10 shadow-[8px_8px_0px_#0A0A0A] space-y-8">
          <div className="border-b-2 border-[#0A0A0A] pb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0A0A0A] text-white text-[11px] font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E73520]" />
              TRACERA Legal & Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Terms of Service & Privacy Notice
            </h1>
            <p className="text-xs font-mono font-bold text-[#555555] mt-1">
              Effective Date: FY 2024–2026 · Section 143(3) Compliance Framework
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2 text-[#0A0A0A]">
              <FileText className="w-5 h-5 text-[#E73520]" /> 1. CA Audit Review Platform Terms
            </h2>
            <p className="text-sm font-medium text-[#333333] leading-relaxed">
              TRACERA is an audit documentation management and review system engineered specifically for Chartered Accountant (CA) firms and their clients. By accessing the platform, users agree to uphold statutory audit evidentiary standards and maintain data integrity throughout all workflow stages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2 text-[#0A0A0A]">
              <Lock className="w-5 h-5 text-[#E73520]" /> 2. Multi-Firm Tenant Data Privacy
            </h2>
            <p className="text-sm font-medium text-[#333333] leading-relaxed">
              Every CA firm operates within an isolated tenant partition. Client data, financial statements, purchase and sales registers, and review findings belonging to one firm are strictly inaccessible to any other firm. All document downloads require server-side organizational authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2 text-[#0A0A0A]">
              <ShieldCheck className="w-5 h-5 text-[#E73520]" /> 3. Immutable Audit Trail
            </h2>
            <p className="text-sm font-medium text-[#333333] leading-relaxed">
              All document submissions, reviewer assignments, status transitions, correction requests, and formal sign-offs generate immutable chronological audit log entries under Section 143(3) of the Indian Companies Act, 2013. These records cannot be erased or modified by normal users.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
