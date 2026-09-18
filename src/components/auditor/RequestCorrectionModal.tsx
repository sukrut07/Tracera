'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { AuditDocument } from '@/types';

interface RequestCorrectionModalProps {
  document: AuditDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestCorrectionModal({
  document,
  isOpen,
  onClose,
  onSuccess,
}: RequestCorrectionModalProps) {
  const [reason, setReason] = useState(
    'Invoice INV-204 is missing from the purchase register. Please update the register and re-upload the corrected version.'
  );
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Please provide a specific correction reason for the client');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/workflow/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_CORRECTION',
          documentId: document.id,
          reason: reason.trim(),
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request correction');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting correction request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                Request Document Correction
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Notifies client to revise and submit Version {document.current_version + 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Document Target:</span>
              <span className="font-semibold text-zinc-900">{document.title} (v{document.current_version})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Client Organization:</span>
              <span className="font-semibold text-zinc-900">{document.client?.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    priority === p
                      ? p === 'HIGH'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                        : 'bg-zinc-950 border-zinc-950 text-white font-bold'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Reason for Correction *
            </label>
            <textarea
              rows={4}
              placeholder="State clearly what is missing or needs correction (e.g. missing invoice, date discrepancy, tax rate mismatch)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white placeholder:text-zinc-400 leading-relaxed font-sans"
              required
            />
            <p className="text-[10px] font-mono text-zinc-400 mt-1">
              This message will be highlighted directly on the client&apos;s dashboard and permanently logged in audit history.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Send Correction Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
