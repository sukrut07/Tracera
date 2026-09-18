'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, FileCheck, FileText, AlertCircle, Sparkles, Database } from 'lucide-react';
import { AuditDocument } from '@/types';
import { SYNTHETIC_SAMPLE_DATASETS } from '@/lib/data/sample-datasets';

interface UploadCorrectionModalProps {
  document: AuditDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadCorrectionModal({
  document,
  isOpen,
  onClose,
  onSuccess,
}: UploadCorrectionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoadReconciledSample = () => {
    const sample = SYNTHETIC_SAMPLE_DATASETS.find((s) => s.key === 'purchase_register_v2');
    if (!sample) return;
    setNotes(sample.notes);
    const sampleFile = new File([sample.content], sample.fileName, { type: 'text/csv' });
    setFile(sampleFile);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  const currentReview = document.current_review;
  const nextVersionNumber = document.current_version + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage('Please attach the corrected file version');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes.trim() || `Correction upload addressing: ${currentReview?.comment || 'auditor comments'}`);

      const res = await fetch(`/api/documents/${document.id}/correction`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload correction');
      }

      setFile(null);
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-2xs">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                Upload Corrected Document (v{nextVersionNumber})
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {document.title} • Version {document.current_version} will be preserved
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

        {/* Correction Feedback Banner */}
        <div className="mx-6 mt-4 p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Auditor Correction Notice</span>
          </div>
          <p className="text-xs text-rose-950 font-medium leading-relaxed bg-white/90 p-2.5 rounded-lg border border-rose-200/60 font-sans">
            &ldquo;{currentReview?.comment || 'Please update the document based on audit review and re-upload.'}&rdquo;
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-rose-800 font-mono">
            <span>Reviewer: {currentReview?.reviewer?.name || document.assigned_auditor?.name || 'Rahul Sharma, CA'}</span>
            <span>Current: Version {document.current_version}</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Load Reconciled Synthetic Test Data */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                <Database className="w-3.5 h-3.5 text-zinc-700" />
                <span>Evaluation Quick Test: Load Reconciled Fixture</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200 font-semibold">
                v{nextVersionNumber} Fixture
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-snug">
              1-click test: loads the reconciled synthetic purchase register with missing invoice INV-204 added and matching GSTR-2B totals.
            </p>
            <button
              type="button"
              onClick={handleLoadReconciledSample}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-200" />
              <span>Load Reconciled File & Notes (v{nextVersionNumber})</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Select Corrected File (Creates Version {nextVersionNumber}) *
            </label>
            <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl p-4 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <FileText className="w-7 h-7 text-zinc-400 mb-1" />
                {file ? (
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-950 block">{file.name}</span>
                    <span className="text-zinc-500 font-mono text-[11px] block mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Will register as Version {nextVersionNumber}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">Click or drag corrected file here</span>
                    <span className="block text-[11px] text-zinc-400 mt-0.5 font-mono">
                      Supported: PDF, XLSX, CSV, XLS, PNG, JPG
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Correction Notes / Summary of Changes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Added missing invoice INV-204 and reconciled against GSTR-2B..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white placeholder:text-zinc-400 font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-2xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting v{nextVersionNumber}...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Upload Version {nextVersionNumber}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
