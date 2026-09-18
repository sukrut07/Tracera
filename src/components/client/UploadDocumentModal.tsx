'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { DocumentType } from '@/types';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { Button } from '@/components/ui/Button';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId = 'c1',
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('PURCHASE_REGISTER');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter a document name or title');
      return;
    }

    if (!file) {
      setErrorMessage('Please attach a document file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('documentType', documentType);
      formData.append('financialYear', financialYear);
      formData.append('clientId', clientId);
      formData.append('notes', notes.trim());
      formData.append('file', file);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      // Reset form
      setTitle('');
      setNotes('');
      setFile(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
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
            <div className="w-9 h-9 bg-[#0A0A0A] border-2 border-[#0A0A0A] text-white flex items-center justify-center shadow-[2px_2px_0_#E73520] shrink-0">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A0A0A] leading-tight">
                Upload Audit Document
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Submit document for CA auditor review and verification
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#FFF2F0] border-2 border-[#E73520] flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] shadow-[2px_2px_0_#E73520]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E73520]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Document Type & Financial Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required>Document Type</FormLabel>
              <FormSelect
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              >
                <option value="PURCHASE_REGISTER">Purchase Register</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="INVOICE">Tax Invoice</option>
                <option value="GST_DOCUMENT">GST Document / Return</option>
                <option value="TDS_CERTIFICATE">TDS Certificate (Form 16A / 26AS)</option>
                <option value="OTHER">Other Supporting Ledger</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel>Financial Year</FormLabel>
              <FormSelect
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
              >
                <option value="2025-26">FY 2025–26 (Upcoming)</option>
                <option value="2024-25">FY 2024–25 (Current)</option>
                <option value="2023-24">FY 2023–24</option>
                <option value="2022-23">FY 2022–23</option>
              </FormSelect>
            </div>
          </div>

          {/* Row 2: Document Name / Title */}
          <div>
            <FormLabel required>Document Name / Title</FormLabel>
            <FormInput
              type="text"
              placeholder="e.g. Purchase Register - April 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Row 3: File Upload Area */}
          <div>
            <FormLabel required>Document File</FormLabel>
            {file ? (
              /* Selected File Active State */
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
                      {formatFileSize(file.size)} • Ready for upload
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-2.5 py-1.5 border-2 border-[#0A0A0A] bg-white hover:bg-[#FFF2F0] text-xs font-semibold text-[#E73520] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              /* Idle Drag & Drop Area */
              <div className="relative border-2 border-dashed border-[#0A0A0A]/40 hover:border-[#0A0A0A] p-6 text-center bg-[#F7F5EF]/40 hover:bg-[#F7F5EF] transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-10 h-10 bg-white border-2 border-[#0A0A0A] flex items-center justify-center mb-2 shadow-[2px_2px_0_#0A0A0A] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
                    <FileText className="w-5 h-5 text-[#0A0A0A]" />
                  </div>
                  <span className="font-semibold text-sm text-[#0A0A0A]">
                    Click or drag file here
                  </span>
                  <span className="text-xs text-[#666666] mt-1">
                    PDF, XLSX, CSV, XLS, PNG, JPG · Max 25 MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Optional Client Notes */}
          <div>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormTextarea
              rows={3}
              placeholder="Add any specific context or reconciliation notes for the CA auditor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Row 5: Action Buttons */}
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
              Upload Document →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
