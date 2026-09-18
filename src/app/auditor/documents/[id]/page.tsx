'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  History,
  Building2,
  User,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AuditDocument, DocumentVersion, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { ReviewChecklist } from '@/components/auditor/ReviewChecklist';
import { AIReviewAssistant } from '@/components/auditor/AIReviewAssistant';
import { ApproveModal } from '@/components/auditor/ApproveModal';
import { RequestCorrectionModal } from '@/components/auditor/RequestCorrectionModal';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorDocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;
  const router = useRouter();

  const [document, setDocument] = useState<AuditDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active version selector
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isStartingReview, setIsStartingReview] = useState(false);

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load document');
      }
      setDocument(data.document);
      setCurrentUser(data.currentUser);
      setSelectedVersionNumber(data.document.current_version);
    } catch (err: any) {
      setError(err.message || 'Error fetching document');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Start review if in SUBMITTED state
  const handleStartReview = async () => {
    setIsStartingReview(true);
    try {
      const res = await fetch('/api/workflow/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'START_REVIEW',
          documentId,
        }),
      });
      if (res.ok) {
        fetchDocument();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStartingReview(false);
    }
  };

  if (loading && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-3 text-zinc-500 text-xs">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[11px] uppercase tracking-wider">Opening Review Workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center font-sans">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-zinc-900">Document Unavailable</h3>
        <p className="text-xs text-zinc-500 mt-1">{error || 'Could not find requested document'}</p>
        <Link
          href="/auditor/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-zinc-800 transition-colors"
        >
          Back to Review Workspace
        </Link>
      </div>
    );
  }

  // Active version to view
  const activeVersion =
    document.versions?.find((v) => v.version_number === selectedVersionNumber) ||
    document.versions?.[0] || {
      id: 'v1',
      document_id: document.id,
      version_number: document.current_version,
      file_name: document.title,
      file_path: '#',
      uploaded_by: '',
      uploaded_at: document.created_at,
    };

  const isApproved = document.status === 'APPROVED';
  const isCorrection = document.status === 'CORRECTION_REQUIRED';
  const isUnderReview = document.status === 'UNDER_REVIEW';
  const isSubmitted = document.status === 'SUBMITTED';

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: '2',
          name: 'Rahul Sharma',
          email: 'auditor@demo.com',
          role: 'AUDITOR',
          client_id: null,
          created_at: '',
        }
      }
    >
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <Link
              href="/auditor/dashboard"
              title="Return to Review Queue"
              className="p-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
                <Link href="/auditor/dashboard" className="hover:text-zinc-900 font-mono text-[11px] uppercase tracking-wider">
                  Review Queue
                </Link>
                <ChevronRight className="w-3 h-3 text-zinc-300" />
                <span className="font-bold text-zinc-800">
                  {document.client?.name}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500 font-normal">
                  {document.client?.company_name}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                <span>{document.title}</span>
                <DocumentStatusBadge status={document.status} />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/documents/${document.id}/history`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span>Audit History</span>
            </Link>

            {isSubmitted && (
              <button
                onClick={handleStartReview}
                disabled={isStartingReview}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isStartingReview ? 'Starting...' : 'Start Review'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Split-View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: Document Preview & File Information (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Version Selector Bar if multiple versions */}
            {document.versions && document.versions.length > 1 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Document Version History:
                </span>
                <div className="flex items-center gap-1.5">
                  {document.versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersionNumber(v.version_number)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        selectedVersionNumber === v.version_number
                          ? 'bg-zinc-950 text-white shadow-2xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      v{v.version_number}{' '}
                      {v.version_number === document.current_version ? '(Current)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active File Canvas */}
            <DocumentViewer
              version={activeVersion}
              title={document.title}
            />
          </div>

          {/* RIGHT SIDE: Review Console (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Decision Panel Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">
                  Review Decision Console
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Section 143(3) Verified
                </span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl space-y-2 text-xs border border-zinc-100 font-sans">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Client:</span>
                  <span className="font-semibold text-zinc-900">{document.client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Document Type:</span>
                  <span className="font-mono text-zinc-800 text-[11px]">
                    {document.document_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Active Version:</span>
                  <span className="font-mono font-bold text-zinc-900">
                    v{document.current_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Assigned Reviewer:</span>
                  <span className="font-medium text-zinc-800">
                    {document.assigned_auditor?.name || 'Rahul Sharma, CA'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Uploaded At:</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {new Date(activeVersion.uploaded_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-zinc-100 space-y-2.5">
                {isApproved ? (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block font-bold">Document Approved</span>
                      <span className="text-[11px] text-emerald-700 font-normal">Audit sign-off logged and locked in compliance ledger.</span>
                    </div>
                  </div>
                ) : isCorrection ? (
                  <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-950">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Correction Notice Sent to Client</span>
                    </div>
                    <p className="font-medium bg-white/90 p-2.5 rounded-lg border border-rose-200/80 leading-relaxed text-zinc-800 text-[11px]">
                      &ldquo;{document.current_review?.comment || 'Client has been notified to correct and re-upload.'}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setIsCorrectionOpen(true)}
                      className="w-full py-2.5 px-3 bg-white hover:bg-rose-50/60 text-rose-700 border border-rose-200 hover:border-rose-300 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Request Correction</span>
                    </button>

                    <button
                      onClick={() => setIsApproveOpen(true)}
                      className="w-full py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approve Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Prototype Review Checklist */}
            <ReviewChecklist />

            {/* AI Review Assistant */}
            <AIReviewAssistant document={document} />
          </div>
        </div>

        {/* Modals */}
        {document && (
          <>
            <ApproveModal
              document={document}
              isOpen={isApproveOpen}
              onClose={() => setIsApproveOpen(false)}
              onSuccess={() => {
                fetchDocument();
              }}
            />

            <RequestCorrectionModal
              document={document}
              isOpen={isCorrectionOpen}
              onClose={() => setIsCorrectionOpen(false)}
              onSuccess={() => {
                fetchDocument();
              }}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
