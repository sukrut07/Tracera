'use client';

import React from 'react';
import { ShieldCheck, Lock, History, EyeOff, CheckCircle2 } from 'lucide-react';

const SECURITY_PILLARS = [
  {
    title: 'ROLE-BASED ACCESS (RBAC)',
    icon: Lock,
    desc: 'Strict barrier separation: Clients cannot approve documents or advance audit stages; auditors cannot modify client source files.',
    badge: '403 FORBIDDEN ENFORCED',
  },
  {
    num: '02',
    title: 'IMMUTABLE VERSION CONTROL',
    icon: History,
    desc: 'Version 1 is permanently sealed when a correction is requested. Resubmissions create version 2 without overwriting historical records.',
    badge: 'APPEND-ONLY LEDGER',
  },
  {
    num: '03',
    title: 'CRYPTOGRAPHIC AUDIT TRAIL',
    icon: ShieldCheck,
    desc: 'Every click, review note, and sign-off records actor, role, timestamp, and metadata. Fully compliant with Section 143(3).',
    badge: 'TAMPER-EVIDENT',
  },
  {
    num: '04',
    title: 'ISOLATED TENANT ACCESS',
    icon: EyeOff,
    desc: 'Each client entity can strictly view only their assigned engagements and documents. Zero cross-tenant data bleeding.',
    badge: 'CLIENT ISOLATION',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-24 border-t-[3px] border-[#0A0A0A] bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E73520] uppercase tracking-widest">
            <span>[06] PRACTICE GOVERNANCE</span>
            <span>·</span>
            <span>ZERO COMPROMISE SECURITY</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0A0A0A]">
            SECURITY & COMPLIANCE
          </h2>
          <p className="text-base sm:text-lg font-medium text-[#4A4A48] max-w-2xl">
            Built from first principles for Indian Chartered Accountancy practices.
            Engineered to withstand ICAI peer reviews and statutory scrutiny.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECURITY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="neo-box p-6 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#0A0A0A] bg-[#F7F5EF] flex items-center justify-center mb-4 shadow-[2px_2px_0_#0A0A0A]">
                    <Icon className="w-5 h-5 text-[#E73520]" />
                  </div>

                  <span className="text-[9px] font-mono font-bold bg-[#0A0A0A] text-white px-2 py-0.5 inline-block mb-3">
                    {pillar.badge}
                  </span>

                  <h3 className="text-base font-black font-mono uppercase text-[#0A0A0A] tracking-tight mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-mono text-[#4A4A48] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#0A0A0A]/20 flex items-center gap-1 text-[10px] font-mono font-bold text-[#C7F36B] bg-[#0A0A0A] p-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span className="text-white">VERIFIED IN TEST SUITE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
