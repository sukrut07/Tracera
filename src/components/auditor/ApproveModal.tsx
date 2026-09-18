'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuditDocument } from '@/types';

interface ApproveModalProps {
  document: AuditDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveModal({
  document,
  isOpen,
  onClose,
  onSuccess,
}: ApproveModalProps) {
  const [comment, setComment] = useState('Verified and approved for statutory audit records');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/workflow/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          documentId: document.id,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve document');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error approving document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                Approve Audit Document
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Statutory audit sign-off under Section 143(3)
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

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Client:</span>
              <span className="font-semibold text-zinc-900">{document.client?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Document:</span>
              <span className="font-semibold text-zinc-900">{document.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Version Signed:</span>
              <span className="font-mono font-bold text-zinc-900">v{document.current_version}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Auditor Sign-off Comment
            </label>
            <textarea
              rows={3}
              placeholder="e.g. All vouchers verified against bank ledger and tax portal..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white placeholder:text-zinc-400"
            />
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
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirm Sign-off</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
