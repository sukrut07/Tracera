'use client';

import React, { useState } from 'react';
import { Database, Plus, Sparkles, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';
import { SYNTHETIC_SAMPLE_DATASETS, SyntheticSampleFile } from '@/lib/data/sample-datasets';
import { FixtureLibraryModal } from '@/components/shared/FixtureLibraryModal';

interface FixtureBannerProps {
  onRefresh: () => void;
  clientId?: string;
}

export function FixtureBanner({ onRefresh, clientId }: FixtureBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [injectingKey, setInjectingKey] = useState<string | null>(null);
  const [justInjected, setJustInjected] = useState<string | null>(null);

  const handleQuickInject = async (fixture: SyntheticSampleFile) => {
    setInjectingKey(fixture.key);
    try {
      const res = await fetch('/api/fixtures/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureKey: fixture.key,
          clientId,
        }),
      });
      if (res.ok) {
        setJustInjected(fixture.title);
        setTimeout(() => setJustInjected(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to inject fixture:', err);
    } finally {
      setInjectingKey(null);
    }
  };

  const quickPills = SYNTHETIC_SAMPLE_DATASETS.slice(0, 4);

  return (
    <>
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-950 uppercase font-mono tracking-wider">
                  Evaluation Fixture Library
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                  4 Synthetic Datasets
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Browse All Fixtures</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-3 font-sans leading-relaxed">
          Inject verified synthetic Indian business records into the active review workflow with one click (no manual file upload required):
        </p>

        {justInjected && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Injected &ldquo;{justInjected}&rdquo; into audit workflow!</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {quickPills.map((fixture) => {
            const isInjecting = injectingKey === fixture.key;

            return (
              <button
                key={fixture.key}
                onClick={() => handleQuickInject(fixture)}
                disabled={isInjecting}
                title={`Inject ${fixture.title}`}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs text-zinc-800 font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {isInjecting ? (
                  <div className="w-3 h-3 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 text-zinc-500" />
                )}
                <span>{fixture.title.split(' ')[0]} {fixture.title.split(' ')[1]}</span>
                <span className="text-[10px] font-mono text-zinc-400">({fixture.badge})</span>
              </button>
            );
          })}
        </div>
      </div>

      <FixtureLibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        clientId={clientId}
      />
    </>
  );
}
