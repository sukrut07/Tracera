'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';
import { DocumentType } from '@/types';
import { SYNTHETIC_SAMPLE_DATASETS, SyntheticSampleFile } from '@/lib/data/sample-datasets';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('PURCHASE_REGISTER');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedFixtureKey, setSelectedFixtureKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoadSample = (sampleKey: string) => {
    const sample = SYNTHETIC_SAMPLE_DATASETS.find((s) => s.key === sampleKey);
    if (!sample) return;
    setTitle(sample.title);
    setDocumentType(sample.documentType);
    setNotes(sample.notes);
    const sampleFile = new File([sample.content], sample.fileName, { type: 'text/csv' });
    setFile(sampleFile);
    setSelectedFixtureKey(sampleKey);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter a document title');
      return;
    }

    if (!file) {
      setErrorMessage('Please select or load a document file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('documentType', documentType);
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
      setSelectedFixtureKey(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                Upload Audit Document
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Submit document for CA auditor review and verification
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Synthetic Evaluation Benchmark Dataset Quick-Selector */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                <Database className="w-3.5 h-3.5 text-zinc-700" />
                <span>Load Test Fixture (1-Click Evaluation Data)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200 font-semibold">
                Indian CA Benchmark
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-snug">
              Select an official evaluation fixture to pre-populate title, document type, and synthetic CSV data:
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {SYNTHETIC_SAMPLE_DATASETS.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => handleLoadSample(s.key)}
                  className={`p-2 text-left text-xs rounded-lg border transition-all cursor-pointer ${
                    selectedFixtureKey === s.key
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      selectedFixtureKey === s.key ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {s.badge}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono block mt-0.5 truncate ${
                    selectedFixtureKey === s.key ? 'text-zinc-400' : 'text-zinc-400'
                  }`}>
                    {s.fileName}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
                Document Type *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white"
              >
                <option value="PURCHASE_REGISTER">Purchase Register</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="INVOICE">Tax Invoice</option>
                <option value="GST_DOCUMENT">GST Document / Return</option>
                <option value="TDS_CERTIFICATE">TDS Certificate (Form 16A / 26AS)</option>
                <option value="OTHER">Other Supporting Ledger</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
                Financial Year
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white"
              >
                <option value="2024-25">FY 2024-25 (Current)</option>
                <option value="2023-24">FY 2023-24</option>
                <option value="2022-23">FY 2022-23</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Document Name / Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Purchase Register - April 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:bg-white placeholder:text-zinc-400 font-sans"
              required
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Attach Document File *
            </label>
            <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl p-4 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    setSelectedFixtureKey(null);
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
                      {(file.size / 1024).toFixed(1)} KB • Ready to submit
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">Click or drag file here</span>
                    <span className="block text-[11px] text-zinc-400 mt-0.5 font-mono">
                      PDF, XLSX, CSV, XLS, PNG, JPG (Max 25MB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1">
              Optional Client Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add any specific context or reconciliation notes for the CA auditor..."
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
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Submit Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
