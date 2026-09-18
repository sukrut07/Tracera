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
  Eye,
  FileText,
  AlertCircle,
  Download,
  ShieldCheck,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditDocument, DocumentVersion, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { ReviewChecklist } from '@/components/auditor/ReviewChecklist';
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

  // Review comments
  const [auditorComments, setAuditorComments] = useState('');

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isStartingReview, setIsStartingReview] = useState(false);

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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start review');
      }
      await fetchDocument();
    } catch (err: any) {
      alert(err.message || 'Error starting review');
    } finally {
      setIsStartingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-2 text-[#4A4A48] font-sans text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">Loading document review workspace...</span>
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
            <span>Document Access Error</span>
          </div>
          <p className="text-xs text-[#555550]">{error || 'Document not found or unauthorized'}</p>
          <Link
            href="/auditor/dashboard"
            className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 text-xs font-bold inline-block"
          >
            ← Back to Review Queue
          </Link>
        </div>
      </div>
    );
  }

  // Active version to view
  const activeVersion =
    document.versions?.find((v) => v.version_number === selectedVersionNumber) ||
    document.versions?.[0] || {
      id: 'v1',
      document_id: document.id,
      version_number: 1,
      file_name: document.file_name || `${document.title}.pdf`,
      file_path: `/uploads/${document.file_name || 'document.pdf'}`,
      uploaded_by: document.client_id,
      uploaded_at: document.created_at,
    };

  const isApproved = document.status === 'APPROVED';
  const isCorrection = document.status === 'CORRECTION_REQUIRED';
  const isUnderReview = document.status === 'UNDER_REVIEW';
  const isSubmitted = document.status === 'SUBMITTED';

  return (
    <AppShell currentUser={currentUser}>
      <div className="space-y-6 font-mono">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#0A0A0A] pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/auditor/dashboard"
              title="Return to Review Queue"
              className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#777770] font-bold">
                <span>{document.client?.name || 'Client'}</span>
                <span>·</span>
                <span>{document.document_type.replace(/_/g, ' ')}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A0A0A] flex items-center gap-3 mt-0.5 font-sans">
                <span>{document.title}</span>
                <span className="text-sm font-mono text-[#4A4A48] font-bold">
                  v{document.current_version}
                </span>
                <DocumentStatusBadge status={document.status} size="sm" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href={`/api/documents/${document.id}/report`}
              target="_blank"
              rel="noreferrer"
              className="neo-btn bg-white text-[#0A0A0A] px-3.5 py-2 uppercase tracking-wider font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>AUDIT DOSSIER (PDF)</span>
            </a>

            {isSubmitted && (
              <button
                onClick={handleStartReview}
                disabled={isStartingReview}
                className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 uppercase tracking-wider font-black flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#E73520]" />
                <span>{isStartingReview ? 'STARTING...' : 'BEGIN REVIEW'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 60 / 40 Split Layout: Dominant Document Viewer on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: 60% Document Viewer */}
          <div className="lg:col-span-7 space-y-4">
            {/* Version Selector Bar */}
            <div className="neo-box p-3 text-xs flex flex-wrap items-center justify-between gap-3 bg-white">
              <span className="text-[10px] uppercase tracking-widest text-[#777770] font-black">
                VERSION SELECTOR:
              </span>

              <div className="flex items-center gap-1.5">
                {document.versions?.map((v) => {
                  const isCurrent = v.version_number === document.current_version;
                  const isSelected = v.version_number === selectedVersionNumber;

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersionNumber(v.version_number)}
                      className={`px-3 py-1 font-bold text-xs border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[2px_2px_0_#E73520]'
                          : 'border-[#0A0A0A] bg-[#F7F5EF] text-[#0A0A0A] hover:bg-white'
                      }`}
                    >
                      v{v.version_number}
                      {isCurrent && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider font-bold">
                          [LATEST]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Viewer Frame */}
            <div className="neo-box-lg bg-white overflow-hidden" data-cursor="document">
              <DocumentViewer version={activeVersion} title={document.title} />
            </div>

            {/* Version Metadata Strip */}
            <div className="p-3 border-2 border-[#0A0A0A] bg-[#F7F5EF] text-xs flex flex-wrap items-center justify-between gap-2 text-[#4A4A48]">
              <div>
                <span>FILE: </span>
                <strong className="text-[#0A0A0A]">{activeVersion.file_name}</strong>
              </div>
              <div>
                <span>UPLOADED: </span>
                <strong className="text-[#0A0A0A]">
                  {new Date(activeVersion.uploaded_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </strong>
              </div>
            </div>
          </div>

          {/* RIGHT: 40% Review Console & Statutory Checklist */}
          <div className="lg:col-span-5 space-y-6">
            {/* 4-Point Statutory Verification Checklist */}
            <div className="neo-box bg-white p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E73520]" />
                  <h3 className="text-xs font-black uppercase text-[#0A0A0A]">
                    STATUTORY VERIFICATION CHECKLIST
                  </h3>
                </div>
                <span className="text-[10px] text-[#777770] font-bold">
                  ICAI SA 500
                </span>
              </div>

              <ReviewChecklist />
            </div>

            {/* Decision Actions Block */}
            <div className="neo-box-lg bg-white p-5 space-y-4 shadow-[6px_6px_0_#0A0A0A]">
              <div className="pb-3 border-b-2 border-[#0A0A0A] flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#0A0A0A]">
                  AUDITOR DECISION
                </span>
                <span className="text-[10px] text-[#E73520] font-bold">
                  MUTATION ENGINE
                </span>
              </div>

              {isApproved ? (
                <div className="p-4 bg-[#C7F36B]/20 border-2 border-[#0A0A0A] space-y-2">
                  <div className="flex items-center gap-2 text-[#0A0A0A] font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                    <span>DOCUMENT STATUTORILY APPROVED</span>
                  </div>
                  <p className="text-xs text-[#4A4A48] leading-relaxed">
                    This document has passed all 4 statutory checklist gates and is
                    certified under Section 143(3).
                  </p>
                </div>
              ) : isCorrection ? (
                <div className="p-4 bg-[#FFF2F0] border-2 border-[#0A0A0A] space-y-2">
                  <div className="flex items-center gap-2 text-[#E73520] font-black text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>CORRECTION NOTICE ACTIVE</span>
                  </div>
                  <p className="text-xs text-[#4A4A48] leading-relaxed">
                    Awaiting client to upload corrected Version {document.current_version + 1}.
                    Version {document.current_version} is preserved in immutable audit storage.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comments Input */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-black text-[#0A0A0A] mb-1">
                      AUDITOR WORKING PAPERS / NOTES:
                    </label>
                    <textarea
                      rows={3}
                      value={auditorComments}
                      onChange={(e) => setAuditorComments(e.target.value)}
                      placeholder="Add reconciliation notes, matching variances, or statutory citations..."
                      className="w-full p-2.5 bg-[#F7F5EF] border-2 border-[#0A0A0A] text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setIsCorrectionOpen(true)}
                      className="neo-btn bg-[#FFF2F0] hover:bg-[#E73520] hover:text-white text-[#E73520] py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                      data-cursor="action"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>CORRECTION</span>
                    </button>

                    <button
                      onClick={() => setIsApproveOpen(true)}
                      className="neo-btn bg-[#C7F36B] hover:bg-[#b2e255] text-[#0A0A0A] py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                      data-cursor="action"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>APPROVE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Signature Audit Trail Component */}
            <div className="neo-box bg-[#F7F5EF] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#0A0A0A]" />
                  <h3 className="text-xs font-black uppercase text-[#0A0A0A]">
                    IMMUTABLE AUDIT TRAIL
                  </h3>
                </div>
                <span className="text-[10px] text-[#777770] font-bold">
                  SEC 143(3)
                </span>
              </div>

              <div className="relative pl-5 space-y-4 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-[2px] before:bg-[#0A0A0A]">
                {document.audit_logs?.map((log, idx) => (
                  <div key={log.id || idx} className="relative text-xs">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-[#0A0A0A] bg-[#E73520]" />
                    <div className="p-2.5 border border-[#0A0A0A] bg-white">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#0A0A0A] text-[10px]">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] text-[#777770]">
                          {new Date(log.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#4A4A48]">
                        by <strong className="text-[#0A0A0A]">{log.actor_name}</strong> ({log.actor_role})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ApproveModal
          isOpen={isApproveOpen}
          document={document}
          onClose={() => setIsApproveOpen(false)}
          onSuccess={fetchDocument}
        />

        <RequestCorrectionModal
          isOpen={isCorrectionOpen}
          document={document}
          onClose={() => setIsCorrectionOpen(false)}
          onSuccess={fetchDocument}
        />
      </div>
    </AppShell>
  );
}
