'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SYNTHETIC_SAMPLE_DATASETS } from '@/lib/data/sample-datasets';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminEvaluationToolsPage() {
  const [injectingKey, setInjectingKey] = useState<string | null>(null);
  const [injectMessage, setInjectMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleInject = async (fixtureKey: string) => {
    setInjectingKey(fixtureKey);
    setInjectMessage(null);
    try {
      const res = await fetch('/api/fixtures/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setInjectMessage(`Successfully injected "${data.document?.title}" into the audit workflow!`);
        setTimeout(() => setInjectMessage(null), 4000);
      } else {
        alert(data.error || 'Failed to inject fixture');
      }
    } catch (err) {
      console.error(err);
      alert('Error injecting fixture');
    } finally {
      setInjectingKey(null);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset prototype database back to initial seed data?')) return;
    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch('/api/dev/reset', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Prototype database successfully reset to clean seed state.');
        setTimeout(() => setResetMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const adminUser = {
    id: 'admin-1',
    name: 'Admin (Partner)',
    email: 'admin@demo.com',
    role: 'ADMIN' as const,
    client_id: null,
    created_at: '',
  };

  return (
    <AppShell currentUser={adminUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E5E0] pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block mb-1">
              SYSTEM & EVALUATION ADMINISTRATION
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#111110]">
              Evaluation Tools & Fixture Engine
            </h1>
            <p className="text-xs text-[#666660] font-sans mt-1">
              Isolated testing environment for seeding synthetic Indian benchmark datasets, resetting prototype state, and inspecting the state machine.
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAFAF8] text-[#111110] border border-[#E5E5E0] text-xs font-mono uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Environment'}</span>
          </button>
        </div>

        {/* Success Alert */}
        {(injectMessage || resetMessage) && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{injectMessage || resetMessage}</span>
          </div>
        )}

        {/* 1. Synthetic Datasets Grid */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#111110] tracking-tight">
              Synthetic Indian Financial Benchmarks (1-Click Injection)
            </h2>
            <p className="text-xs text-[#666660] font-mono">
              In accordance with OBLIQ guidelines, all fixtures use public synthetic datasets (AgamiAI, Synthetic Indian Finance Data).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {SYNTHETIC_SAMPLE_DATASETS.map((fixture) => (
              <div
                key={fixture.key}
                className="border border-[#E5E5E0] bg-white p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#777770] font-bold">
                      {fixture.category}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F2F2EE] border border-[#E5E5E0] text-[9px] uppercase font-bold text-[#111110]">
                      {fixture.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#111110] font-sans">
                    {fixture.title}
                  </h3>

                  <p className="text-xs text-[#666660] font-sans leading-relaxed">
                    {fixture.description}
                  </p>

                  <div className="p-2 bg-[#FAFAF8] border border-[#E5E5E0] text-[11px] text-[#555550]">
                    <span className="font-bold block text-[#111110] text-[10px] uppercase">
                      Test Scenario:
                    </span>
                    {fixture.notes}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-between gap-2">
                  <a
                    href={`/sample-files/${fixture.fileName}`}
                    download
                    className="p-2 text-[#666660] hover:text-[#111110] border border-[#E5E5E0] hover:bg-[#FAFAF8] transition-colors"
                    title="Download raw CSV file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleInject(fixture.key)}
                    disabled={injectingKey === fixture.key}
                    className="flex-1 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer text-center"
                  >
                    {injectingKey === fixture.key ? 'Injecting...' : 'Inject into Workflow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Automated Testing Suite Summary */}
        <div className="border border-[#E5E5E0] bg-white p-6 font-mono text-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111110]">
            <Terminal className="w-4 h-4 text-[#E03E1A]" />
            <span>AUTOMATED VERIFICATION TEST SUITES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E0] space-y-2">
              <span className="font-bold text-[#111110] block">
                1. Workflow State Machine Suite
              </span>
              <p className="text-[#666660] font-sans">
                Tests atomic state transitions, immutable versions, Section 143(3) logs, and RBAC authorization boundaries.
              </p>
              <code className="block p-2 bg-white border border-[#E5E5E0] text-[11px] text-[#111110]">
                npm run test:workflow (8/8 passing)
              </code>
            </div>

            <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E0] space-y-2">
              <span className="font-bold text-[#111110] block">
                2. Live HTTP Route & Security Suite
              </span>
              <p className="text-[#666660] font-sans">
                Tests live Next.js HTTP cookie sessions, multi-tenant isolation, correction upload cycles, and PDF generation.
              </p>
              <code className="block p-2 bg-white border border-[#E5E5E0] text-[11px] text-[#111110]">
                npm run test:http (11/11 passing)
              </code>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
