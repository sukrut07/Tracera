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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] font-mono text-xs text-[#777770]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#111110] border-t-transparent animate-spin" />
          <span>OPENING REVIEW WORKSPACE...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center font-mono text-xs">
        <AlertCircle className="w-8 h-8 text-[#E03E1A] mx-auto mb-2" />
        <h3 className="font-bold text-[#111110]">DOCUMENT UNAVAILABLE</h3>
        <p className="text-[#666660] mt-1">{error || 'Could not locate requested audit record'}</p>
        <Link
          href="/auditor/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-[#111110] text-white uppercase tracking-wider font-bold"
        >
          ← Return to Review Queue
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
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/auditor/dashboard"
              title="Return to Review Queue"
              className="p-2 border border-[#E5E5E0] bg-white hover:bg-[#FAFAF8] text-[#111110] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <span>{document.client?.name || 'Client'}</span>
                <span>·</span>
                <span>{document.document_type.replace(/_/g, ' ')}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111110] flex items-center gap-3 mt-0.5">
                <span>{document.title}</span>
                <span className="text-sm font-mono text-[#555550]">
                  Version {document.current_version}
                </span>
                <DocumentStatusBadge status={document.status} size="sm" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <a
              href={`/api/documents/${document.id}/report`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E0] bg-white text-[#111110] hover:bg-[#FAFAF8] uppercase tracking-wider font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Audit Report (PDF)</span>
            </a>

            {isSubmitted && (
              <button
                onClick={handleStartReview}
                disabled={isStartingReview}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isStartingReview ? 'Starting...' : 'Begin Review'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 60 / 40 Split Layout: Dominant Document Viewer on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: 60% (7 cols on 12-grid) Document Viewer */}
          <div className="lg:col-span-7 space-y-4">
            {/* Version Selector Bar */}
            <div className="border border-[#E5E5E0] bg-white p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">
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
                      className={`px-3 py-1 text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-[#111110] text-white border-[#111110]'
                          : 'bg-[#FAFAF8] text-[#555550] border-[#E5E5E0] hover:bg-white'
                      }`}
                    >
                      v{v.version_number} {isCurrent ? '(CURRENT)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Viewer Canvas */}
            <DocumentViewer
              version={activeVersion}
              title={document.title}
            />

            {/* Version Metadata Summary */}
            <div className="border border-[#E5E5E0] bg-white p-4 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-[#555550]">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777770] block">
                  VERSION NUMBER
                </span>
                <span className="font-bold text-[#111110] block mt-0.5">
                  v{activeVersion.version_number}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777770] block">
                  FILE NAME
                </span>
                <span className="font-bold text-[#111110] block mt-0.5 truncate" title={activeVersion.file_name}>
                  {activeVersion.file_name}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777770] block">
                  UPLOADED AT
                </span>
                <span className="font-bold text-[#111110] block mt-0.5">
                  {new Date(activeVersion.uploaded_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777770] block">
                  STORAGE
                </span>
                <span className="font-bold text-emerald-800 block mt-0.5">
                  Immutable
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: 40% (5 cols on 12-grid) Review Console */}
          <div className="lg:col-span-5 space-y-4">
            {/* 4-Point CA Statutory Checklist */}
            <ReviewChecklist />

            {/* Auditor Comments Area */}
            <div className="border border-[#E5E5E0] bg-white p-4 font-mono text-xs space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#777770] font-bold">
                AUDITOR VERIFICATION REMARKS
              </label>
              <textarea
                rows={3}
                value={auditorComments}
                onChange={(e) => setAuditorComments(e.target.value)}
                placeholder="Enter statutory review notes, line item verification remarks, or instructions..."
                className="w-full p-2.5 bg-[#FAFAF8] border border-[#E5E5E0] text-xs text-[#111110] focus:outline-none focus:border-[#111110] font-sans"
              />
            </div>

            {/* Review Decision Block */}
            <div className="border border-[#E5E5E0] bg-white p-5 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">
                  REVIEW DECISION
                </span>
                <span className="text-[10px] text-[#777770]">
                  Section 143(3) Verified
                </span>
              </div>

              {isApproved ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>DOCUMENT APPROVED & CERTIFIED</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-sans">
                    Audit sign-off logged to immutable history. Document locked against modifications.
                  </p>
                </div>
              ) : isCorrection ? (
                <div className="p-4 bg-orange-50 border border-orange-200 text-[#9A3412] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#C2410C]">
                    <AlertTriangle className="w-4 h-4 text-[#E03E1A]" />
                    <span>CORRECTION NOTICE ISSUED</span>
                  </div>
                  <p className="text-xs font-sans text-[#111110] bg-white p-2.5 border border-orange-200">
                    "{document.current_review?.comment || document.latest_correction_reason || 'Client revision requested.'}"
                  </p>
                </div>
              ) : isSubmitted ? (
                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <span className="font-bold block text-xs">AWAITING AUDIT REVIEW</span>
                  <p className="text-xs font-sans text-blue-800">
                    Click "Begin Review" above to take ownership and verify line items.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-sans text-[#555550]">
                    Verify all 4 checklist points before issuing approval or requesting a client correction.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setIsCorrectionOpen(true)}
                      className="py-2.5 px-3 border border-[#E03E1A] bg-white text-[#C2410C] hover:bg-orange-50 text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E03E1A]" />
                      <span>Request Correction</span>
                    </button>

                    <button
                      onClick={() => setIsApproveOpen(true)}
                      className="py-2.5 px-3 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approve Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Audit Trail Summary */}
            <div className="border border-[#E5E5E0] bg-white p-4 font-mono text-xs space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                AUDIT TRAIL PROGRESSION
              </span>

              <div className="space-y-3 pt-1">
                {document.audit_logs?.slice(0, 4).map((log, idx) => (
                  <div key={idx} className="border-l-2 border-[#111110] pl-3 space-y-0.5 text-[11px]">
                    <div className="flex justify-between text-[#777770] text-[10px]">
                      <span className="font-bold text-[#111110]">{log.action}</span>
                      <span>{new Date(log.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="text-[#555550]">
                      By {log.performed_by_name} ({log.performed_by_role})
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
