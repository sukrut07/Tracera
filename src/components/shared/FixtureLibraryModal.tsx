'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { SYNTHETIC_SAMPLE_DATASETS, SyntheticSampleFile } from '@/lib/data/sample-datasets';

interface FixtureLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string;
}

export function FixtureLibraryModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}: FixtureLibraryModalProps) {
  const [injectingKey, setInjectingKey] = useState<string | null>(null);
  const [previewFixture, setPreviewFixture] = useState<SyntheticSampleFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInject = async (fixture: SyntheticSampleFile) => {
    setInjectingKey(fixture.key);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/fixtures/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureKey: fixture.key,
          clientId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inject fixture');
      }

      setSuccessMessage(`Injected '${fixture.title}' into the workflow successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error injecting test fixture');
    } finally {
      setInjectingKey(null);
    }
  };

  const handleDownload = (fixture: SyntheticSampleFile) => {
    const blob = new Blob([fixture.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fixture.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-2xs">
              <Database className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                  Audit Test Fixtures & Synthetic Datasets
                </h3>
                <span className="text-[10px] font-mono uppercase bg-zinc-200/80 text-zinc-800 px-1.5 py-0.2 rounded font-semibold">
                  Safe Data
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                Grounded in HuggingFace Indian Bank Statements & Synthetic GST/Ledger datasets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Fixtures List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {SYNTHETIC_SAMPLE_DATASETS.map((fixture) => {
            const isInjecting = injectingKey === fixture.key;

            return (
              <div
                key={fixture.key}
                className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-2xs transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-950">
                        {fixture.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-700 rounded border border-zinc-200 font-medium">
                        {fixture.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-sans leading-snug">
                      {fixture.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownload(fixture)}
                      title="Download raw CSV test file"
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">CSV</span>
                    </button>

                    <button
                      onClick={() => handleInject(fixture)}
                      disabled={isInjecting}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isInjecting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Injecting...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Inject Fixture</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Fixture Metadata Snippet */}
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 font-mono gap-2">
                  <span>File: {fixture.fileName}</span>
                  <span className="text-zinc-500 italic font-sans">{fixture.notes}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>6 Evaluation Fixtures Ready</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
