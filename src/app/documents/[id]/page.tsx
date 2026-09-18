'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Eye,
  AlertCircle,
  ScanText,
  CheckCheck,
  History,
  Layers,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign,
  Send,
} from 'lucide-react';
import { AuditDocument, DocumentVersion, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AuditTimeline } from '@/components/shared/AuditTimeline';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { AppShell } from '@/components/layout/AppShell';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { ExtractedFieldResult } from '@/lib/ocr/ocr-service';
import { ValidationSummary } from '@/lib/validation/document-validation';

type TabType = 'overview' | 'preview' | 'ocr' | 'validation' | 'versions' | 'history';

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [document, setDocument] = useState<AuditDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedFieldResult | null>(null);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

  const fetchDocument = useCallback(
    async (version?: number) => {
      try {
        setLoading(true);
        const url = version
          ? `/api/documents/${documentId}?version=${version}`
          : `/api/documents/${documentId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load document');
        }

        setDocument(data.document);
        setCurrentUser(data.currentUser);
        setExtractedData(data.extractedData);
        setValidation(data.validation);
        if (activeVersionNumber === null || version) {
          setActiveVersionNumber(version || data.document.current_version);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching document');
      } finally {
        setLoading(false);
      }
    },
    [documentId, activeVersionNumber]
  );

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleVersionChange = (newVer: number) => {
    setActiveVersionNumber(newVer);
    fetchDocument(newVer);
  };

  const handleExportPdf = async () => {
    if (!document) return;
    setIsExportingPdf(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/report`);
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `TRESERA_Audit_Report_${document.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_v${document.current_version}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF Audit Report. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (loading && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-600">Loading Tracera Audit Workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Document Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'Could not find requested audit record'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAuditor = currentUser?.role === 'AUDITOR' || currentUser?.role === 'ADMIN';
  const isClient = currentUser?.role === 'CLIENT';
  const backHref = isAuditor ? '/auditor/dashboard' : '/client/dashboard';

  const selectedVersion =
    document.versions?.find((v) => v.version_number === activeVersionNumber) ||
    document.versions?.[0] || {
      id: 'v1',
      document_id: document.id,
      version_number: document.current_version,
      file_name: document.title,
      file_path: '#',
      uploaded_by: '',
      uploaded_at: document.created_at,
    };

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: '1',
          name: 'User',
          email: 'user@demo.com',
          role: 'CLIENT',
          client_id: null,
          created_at: '',
        }
      }
    >
      {/* Top Breadcrumb & Actions Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl shadow-xs transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-emerald-700 uppercase tracking-wider">
                {document.client?.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">FY {document.client?.financial_year || '2024-25'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{document.document_type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {document.title}
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                v{document.current_version}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* PDF Audit Report Download */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export Audit Report'}</span>
          </button>

          {/* Client Correction CTA */}
          {isClient && document.status === 'CORRECTION_REQUIRED' && (
            <button
              onClick={() => setCorrectionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Upload Correction (v{document.current_version + 1})</span>
            </button>
          )}

          {/* Auditor Review CTA */}
          {isAuditor && (
            <Link
              href={`/auditor/documents/${document.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open Review Console</span>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Status & Attention Alerts */}
      {document.status === 'CORRECTION_REQUIRED' && (
        <div className="mb-6 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Correction Requested by Auditor
                  </span>
                  <span className="text-xs text-amber-600 font-medium">
                    {document.current_review?.reviewer?.name && `Reviewed by ${document.current_review.reviewer.name}`}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 font-medium bg-white/80 p-2.5 rounded-lg border border-amber-200/60 inline-block max-w-2xl">
                  &ldquo;{document.current_review?.comment || 'Please rectify discrepancies and attach supporting documentation.'}&rdquo;
                </p>
              </div>
            </div>
            {isClient && (
              <button
                onClick={() => setCorrectionModalOpen(true)}
                className="shrink-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Upload Fix Now
              </button>
            )}
          </div>
        </div>
      )}

      {document.status === 'APPROVED' && (
        <div className="mb-6 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Audit Verified & Approved
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Version {document.current_version} has been verified and stamped by {document.assigned_auditor?.name || 'Assigned CA Auditor'}. Document locked for statutory filing.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportPdf}
            className="shrink-0 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Download Certificate (PDF)
          </button>
        </div>
      )}

      {/* Multi-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-zinc-200 mb-6 overflow-x-auto no-scrollbar font-sans">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Document Preview</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 rounded text-zinc-700 border border-zinc-200">v{selectedVersion.version_number}</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'ocr'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <ScanText className="w-3.5 h-3.5" />
          <span>Extracted Data (OCR)</span>
          {extractedData && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-800 rounded font-medium border border-zinc-200">
              {Math.round(extractedData.confidenceScore * 100)}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'validation'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Validation & Anomalies</span>
          {validation && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                validation.errorCount > 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : validation.warningCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {validation.passCount}/{validation.checks.length} Pass
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'versions'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 rounded text-zinc-700 border border-zinc-200">
            {document.versions?.length || 1}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-zinc-950 text-zinc-950 bg-zinc-100/70 font-bold rounded-t-lg'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Trail</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 rounded text-zinc-700 border border-zinc-200">
            {document.audit_logs?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Document Status
              </span>
              <div className="mt-1.5">
                <DocumentStatusBadge status={document.status} size="md" />
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                Current version: <strong className="text-slate-800">v{document.current_version}</strong>
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Reconciled Value (₹)
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {extractedData?.total
                  ? `₹${extractedData.total.toLocaleString('en-IN')}`
                  : '₹3,00,900'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                GST: ₹{extractedData?.gst ? extractedData.gst.toLocaleString('en-IN') : '45,900'} (18%)
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Pre-Audit Readiness
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {validation?.overallStatus === 'READY_FOR_REVIEW' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clean / Ready
                  </span>
                ) : validation?.overallStatus === 'WARNINGS_DETECTED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validation.warningCount} Warning(s)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Critical Error
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                {validation?.passCount || 5} automated checks passed
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Audit Trail Integrity
              </span>
              <div className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{document.audit_logs?.length || 0} Events</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Append-only chronological log
              </span>
            </div>
          </div>

          {/* Master Record Details Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Entity & Engagement Details</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">ID: {document.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              <div>
                <span className="text-xs font-medium text-slate-400 block">Client Organization</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {document.client?.name}
                </span>
                <span className="text-xs text-slate-500 block">
                  {document.client?.company_name || 'Manufacturing & Wholesale'}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block">Assessment Financial Year</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  FY {document.client?.financial_year || '2024-25'}
                </span>
                <span className="text-xs text-slate-500 block">Audit Cycle: Statutory Q1-Q4</span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block">Assigned Auditor</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {document.assigned_auditor?.name || 'Rahul Sharma'}
                </span>
                <span className="text-xs text-slate-500 block">
                  {document.assigned_auditor?.email || 'rahul@ca-firm.com'}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block">Document Classification</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {document.document_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 block">Format: Excel / PDF Reconciliation</span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block">First Submitted</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {new Date(document.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-xs text-slate-500 block">Version 1 created</span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block">Last Active Revision</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {new Date(document.updated_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-xs text-slate-500 block">Version {document.current_version}</span>
              </div>
            </div>
          </div>

          {/* Quick Tab Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('ocr')}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                  <ScanText className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-3">Extracted Data & Line Items</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect structured GSTINs, vendor invoice amounts, and tax breakdown.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('validation')}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-700 group-hover:bg-blue-100 transition-colors">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-3">Automated Validation Signals</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verify math integrity, invoice number detection, and statutory rules.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-700 group-hover:bg-purple-100 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-3">Immutable Audit Trail</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect every status modification, timestamp, and reviewer rationale.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{selectedVersion.file_name}</span>
                <span className="text-[11px] text-slate-500">
                  Uploaded by {selectedVersion.uploader?.name || 'Client'} on{' '}
                  {new Date(selectedVersion.uploaded_at).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Version Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Viewing Version:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {document.versions?.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleVersionChange(v.version_number)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      v.version_number === activeVersionNumber
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    v{v.version_number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <DocumentViewer
              version={selectedVersion}
              title={document.title}
            />
          </div>
        </div>
      )}

      {/* TAB 3: EXTRACTED DATA (OCR) */}
      {activeTab === 'ocr' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <ScanText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Extracted Accounting Metadata</h3>
                  <p className="text-[11px] text-slate-500">
                    Tracera OCR engine extracted structured fields from version v{activeVersionNumber}
                  </p>
                </div>
              </div>
              {extractedData && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">OCR Confidence:</span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                    {Math.round(extractedData.confidenceScore * 100)}% High Accuracy
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Header Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Invoice / Batch No.</span>
                <span className="font-mono font-bold text-slate-900 mt-1 block">
                  {extractedData?.invoiceNumber || 'BATCH-PR-V' + activeVersionNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Invoice Date</span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {extractedData?.invoiceDate || '2024-04-30'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Vendor / Counterparty</span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {extractedData?.vendorName || 'Multiple Registered Vendors'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Entity GSTIN</span>
                <span className="font-mono font-bold text-emerald-800 mt-1 block">
                  {extractedData?.gstin || '27AABCO1234F1Z1'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Parsed Line Items & Vouchers</h4>
              <span className="text-xs text-slate-400">
                {extractedData?.items?.length || 0} line entries detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Description / Ledger Item</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Rate (₹)</th>
                    <th className="py-3 px-4 text-right">Taxable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedData?.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.description}</td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">{item.quantity ?? '-'}</td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {item.rate ? `₹${item.rate.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Totals Card */}
            <div className="p-5 bg-slate-50/70 border-t border-slate-200 flex flex-col items-end gap-2 text-xs">
              <div className="flex items-center justify-between w-64 text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-semibold">
                  ₹{(extractedData?.subtotal || 255000).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between w-64 text-slate-600">
                <span>Applicable GST (18%):</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ₹{(extractedData?.gst || 45900).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between w-64 text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-emerald-800">
                  ₹{(extractedData?.total || 300900).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VALIDATION & ANOMALIES */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Statutory & Audit Validation Summary</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated checks run on document content prior to CA sign-off
                </p>
              </div>

              {validation && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                    {validation.passCount} Passed
                  </span>
                  {validation.warningCount > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold">
                      {validation.warningCount} Warnings
                    </span>
                  )}
                  {validation.errorCount > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold">
                      {validation.errorCount} Errors
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Results */}
            <div className="space-y-3 pt-4">
              {validation?.checks.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    rule.status === 'PASS'
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                      : rule.status === 'WARNING'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {rule.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : rule.status === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold">{rule.title}</h4>
                        <span className="text-[10px] font-mono opacity-70">[{rule.code}]</span>
                      </div>
                      <p className="text-xs mt-0.5 opacity-90">{rule.message}</p>
                      {rule.details && (
                        <p className="text-[11px] mt-1 font-mono opacity-75">{rule.details}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      rule.status === 'PASS'
                        ? 'bg-emerald-200/70 text-emerald-900'
                        : rule.status === 'WARNING'
                        ? 'bg-amber-200/70 text-amber-900'
                        : 'bg-rose-200/70 text-rose-900'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Document Revision Archive</h3>
              </div>
              <span className="text-xs text-slate-500">
                All versions immutable and stored permanently
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {document.versions?.map((ver) => (
                <div
                  key={ver.id}
                  className={`p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                    ver.version_number === document.current_version
                      ? 'bg-emerald-50/30'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                        v{ver.version_number}
                      </span>
                      {ver.version_number === document.current_version && (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase mt-1">Current</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ver.file_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Uploaded by <strong className="text-slate-700">{ver.uploader?.name || 'Client User'}</strong> on{' '}
                        {new Date(ver.uploaded_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {ver.notes && (
                        <div className="mt-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 max-w-xl">
                          <strong className="text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5">
                            Revision Notes:
                          </strong>
                          {ver.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleVersionChange(ver.version_number);
                        setActiveTab('preview');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Preview v{ver.version_number}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Chronological Audit Trail</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Section 143(3) Compliance: Append-only log recording every status change, correction request, and approval.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total {document.audit_logs?.length || 0} events
            </span>
          </div>

          <AuditTimeline logs={document.audit_logs || []} />
        </div>
      )}

      {/* Upload Correction Modal for Client */}
      {isClient && (
        <UploadCorrectionModal
          document={document}
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          onSuccess={() => {
            setCorrectionModalOpen(false);
            fetchDocument();
          }}
        />
      )}
    </AppShell>
  );
}
