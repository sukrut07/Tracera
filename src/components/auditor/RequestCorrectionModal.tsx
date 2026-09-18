'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
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
    'Invoice INV-204 (Balaji Enterprises ₹76,700) is missing from the purchase register. Reconcile with GSTR-2B and re-upload revised register.'
  );
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [optionalNote, setOptionalNote] = useState('');
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
      const fullReason = optionalNote.trim()
        ? `${reason.trim()} [Note: ${optionalNote.trim()}]`
        : reason.trim();

      const res = await fetch('/api/workflow/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_CORRECTION',
          documentId: document.id,
          reason: fullReason,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-100 font-mono">
      <div className="bg-white border-2 border-[#111110] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E0] bg-[#FAFAF8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#E03E1A]" />
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#111110]">
                REQUEST DOCUMENT CORRECTION
              </h3>
              <p className="text-[10px] text-[#777770]">
                Client will be notified to revise and upload Version {document.current_version + 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#777770] hover:text-[#111110] p-1 border border-[#E5E5E0] bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-orange-50 border border-orange-200 flex items-center gap-2 text-xs text-[#C2410C]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E03E1A]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Metadata Summary */}
          <div className="p-3 bg-[#FAFAF8] border border-[#E5E5E0] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#777770]">TARGET RECORD:</span>
              <span className="font-bold text-[#111110]">{document.title} (v{document.current_version})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777770]">CLIENT WORKSPACE:</span>
              <span className="font-bold text-[#111110]">{document.client?.name || 'ABC Traders Pvt Ltd'}</span>
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#777770] font-bold mb-1.5">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-3 text-xs uppercase tracking-wider font-bold border transition-all cursor-pointer ${
                    priority === p
                      ? p === 'HIGH'
                        ? 'bg-orange-50 border-[#E03E1A] text-[#C2410C]'
                        : 'bg-[#111110] border-[#111110] text-white'
                      : 'bg-[#FAFAF8] border-[#E5E5E0] text-[#777770] hover:bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Correction */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#777770] font-bold mb-1.5">
              REASON FOR CORRECTION *
            </label>
            <textarea
              rows={3}
              placeholder="State clearly what is missing or requires ledger reconciliation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs bg-[#FAFAF8] border border-[#E5E5E0] p-3 text-[#111110] focus:outline-none focus:border-[#111110] font-sans leading-relaxed"
              required
            />
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#777770] font-bold mb-1.5">
              OPTIONAL STATUTORY NOTE
            </label>
            <input
              type="text"
              placeholder="e.g., Cross-checked against GSTR-2B ITC statement as of 18 Sep"
              value={optionalNote}
              onChange={(e) => setOptionalNote(e.target.value)}
              className="w-full text-xs bg-[#FAFAF8] border border-[#E5E5E0] p-2 text-[#111110] focus:outline-none focus:border-[#111110] font-sans"
            />
            <p className="text-[10px] text-[#777770] mt-1">
              Logged immutably to audit history and displayed as high-priority alert on client login.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E5E0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#777770] hover:text-[#111110] border border-[#E5E5E0] bg-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs uppercase tracking-wider font-bold text-white bg-[#E03E1A] hover:bg-[#C23314] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <span>Dispatching Notice...</span>
              ) : (
                <>
                  <span>Request Correction →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
