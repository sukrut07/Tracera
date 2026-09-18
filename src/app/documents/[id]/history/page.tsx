'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  History,
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
  ChevronRight,
} from 'lucide-react';
import { AuditDocument, DocumentVersion, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AuditTimeline } from '@/components/shared/AuditTimeline';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { AppShell } from '@/components/layout/AppShell';

export default function DocumentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [document, setDocument] = useState<AuditDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number | null>(null);

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${documentId}`);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load document');
      }
      setDocument(data.document);
      setCurrentUser(data.currentUser);
      setActiveVersionNumber(data.document.current_version);
    } catch (err: any) {
      setError(err.message || 'Error fetching document');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] font-sans">
        <div className="flex flex-col items-center gap-3 text-[#4A4A48] text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">Loading Audit Trail & History...</span>
        </div>
      </div>
    );
  }

  if (error || !document || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] p-4">
        <div className="max-w-md w-full p-6 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] space-y-4">
          <div className="flex items-center gap-2 text-[#E73520] font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>Document Access Restricted</span>
          </div>
          <p className="text-xs text-[#555550]">{error || 'Document not found or unauthorized'}</p>
          <Link
            href="/client/dashboard"
            className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 text-xs font-bold inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAuditor = currentUser.role === 'AUDITOR' || currentUser.role === 'ADMIN' || currentUser.role === 'PARTNER';
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
    <AppShell currentUser={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              title="Return to Dashboard"
              className="p-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
                <Link href={backHref} className="hover:text-zinc-900 font-mono text-[11px] uppercase tracking-wider">
                  {isAuditor ? 'Review Queue' : 'Dashboard'}
                </Link>
                <ChevronRight className="w-3 h-3 text-zinc-300" />
                <span className="font-bold text-zinc-800">
                  {document.client?.name}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500 font-normal">
                  Audit Lifecycle
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                <span>{document.title}</span>
                <DocumentStatusBadge status={document.status} />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuditor && (
              <Link
                href={`/auditor/documents/${document.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Review Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Document Master Record Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">
                Document Master Record
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-base font-bold text-zinc-900">{document.title}</h2>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
                  v{document.current_version}
                </span>
              </div>
            </div>
            <DocumentStatusBadge status={document.status} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-sans">
            <div>
              <span className="text-zinc-400 font-mono text-[11px] block">Document Type</span>
              <span className="font-semibold text-zinc-800 mt-0.5 block font-mono">
                {document.document_type.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 font-mono text-[11px] block">Client Organization</span>
              <span className="font-semibold text-zinc-800 mt-0.5 block">
                {document.client?.name}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 font-mono text-[11px] block">Assigned Auditor</span>
              <span className="font-semibold text-zinc-800 mt-0.5 block">
                {document.assigned_auditor?.name || 'Rahul Sharma, CA'}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 font-mono text-[11px] block">Submitted Date</span>
              <span className="font-semibold text-zinc-800 mt-0.5 block font-mono">
                {new Date(document.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Version History & File Preview (Left) + Audit Trail (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Version History & Active File (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Version History List */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    Version Ledger
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Immutable revision history. Prior versions remain accessible for verification.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-200">
                  {document.versions?.length || 1} Version{document.versions && document.versions.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2.5">
                {document.versions?.map((v) => {
                  const isSelected = activeVersionNumber === v.version_number;
                  const isLatest = v.version_number === document.current_version;

                  return (
                    <div
                      key={v.id}
                      onClick={() => setActiveVersionNumber(v.version_number)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-50 shadow-2xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            v{v.version_number}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-zinc-900">
                                {v.file_name}
                              </span>
                              {isLatest && (
                                <span className="text-[10px] font-mono font-bold bg-zinc-950 text-white px-1.5 py-0.2 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500">
                              Uploaded on{' '}
                              {new Date(v.uploaded_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={v.file_path}
                            download={v.file_name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Download this version"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {v.notes && (
                        <p className="mt-2 text-xs text-zinc-600 bg-white p-2 rounded-lg border border-zinc-200/60 italic font-mono text-[11px]">
                          &ldquo;{v.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Viewer for Selected Version */}
            <DocumentViewer version={selectedVersion} title={document.title} />
          </div>

          {/* Right Column: Append-Only Chronological Audit Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 leading-tight">
                      Tamper-Evident Audit History
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Append-only chronological log of all workflow actions
                    </p>
                  </div>
                </div>
              </div>

              <AuditTimeline logs={document.audit_logs || []} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
