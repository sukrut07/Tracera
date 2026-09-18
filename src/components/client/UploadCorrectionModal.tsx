'use client';

import React, { useState } from 'react';
import { X, FileCheck, FileText, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { AuditDocument } from '@/types';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { Button } from '@/components/ui/Button';

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

  if (!isOpen) return null;

  const currentReview = document.current_review;
  const nextVersionNumber = document.current_version + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage('Please attach the corrected document file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'notes',
        notes.trim() || `Correction upload addressing: ${currentReview?.comment || 'auditor review'}`
      );

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0_#0A0A0A] w-full max-w-[640px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#0A0A0A] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E73520] border-2 border-[#0A0A0A] text-white flex items-center justify-center shadow-[2px_2px_0_#0A0A0A] shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A0A0A] leading-tight">
                Upload Corrected Document (v{nextVersionNumber})
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                {document.title} • Version {document.current_version} will be preserved in audit history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-[#0A0A0A] bg-white hover:bg-[#FFF2F0] hover:text-[#E73520] text-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Correction Feedback Banner */}
        <div className="mx-6 mt-4 p-4 bg-[#FFF2F0] border-2 border-[#E73520] shadow-[2px_2px_0_#E73520] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E73520] uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-[#E73520]" />
            <span>Auditor Correction Notice</span>
          </div>
          <p className="text-xs text-[#0A0A0A] font-semibold leading-relaxed bg-white p-3 border-2 border-[#0A0A0A]">
            &ldquo;{currentReview?.comment || document.latest_review?.remarks || 'Please update the document based on auditor discrepancy analysis and re-upload.'}&rdquo;
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#555550] pt-1">
            <span>Reviewer: {currentReview?.reviewer?.name || document.assigned_auditor?.name || 'Assigned CA Auditor'}</span>
            <span>Current: Version {document.current_version}</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#FFF2F0] border-2 border-[#E73520] flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] shadow-[2px_2px_0_#E73520]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E73520]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* File Picker */}
          <div>
            <FormLabel required>Corrected Document File (Creates Version {nextVersionNumber})</FormLabel>
            {file ? (
              <div className="border-2 border-[#0A0A0A] p-4 bg-[#F7F5EF] flex items-center justify-between gap-3 shadow-[2px_2px_0_#0A0A0A]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-white border-2 border-[#0A0A0A] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#E73520]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-[#0A0A0A] truncate block">
                      {file.name}
                    </span>
                    <span className="text-xs text-[#666666] block">
                      {formatFileSize(file.size)} • Registers as Version {nextVersionNumber}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-2.5 py-1.5 border-2 border-[#0A0A0A] bg-white hover:bg-[#FFF2F0] text-xs font-semibold text-[#E73520] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-[#0A0A0A]/40 hover:border-[#0A0A0A] p-6 text-center bg-[#F7F5EF]/40 hover:bg-[#F7F5EF] transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setErrorMessage(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-10 h-10 bg-white border-2 border-[#0A0A0A] flex items-center justify-center mb-2 shadow-[2px_2px_0_#0A0A0A] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
                    <FileText className="w-5 h-5 text-[#0A0A0A]" />
                  </div>
                  <span className="font-semibold text-sm text-[#0A0A0A]">
                    Click or drag corrected file here
                  </span>
                  <span className="text-xs text-[#666666] mt-1">
                    PDF, XLSX, CSV, XLS, PNG, JPG · Max 25 MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <FormLabel>Correction Notes / Summary of Changes</FormLabel>
            <FormTextarea
              rows={3}
              placeholder="e.g. Added missing invoice INV-204 and reconciled against GSTR-2B..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-[#0A0A0A]/10">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Upload Version {nextVersionNumber} →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
