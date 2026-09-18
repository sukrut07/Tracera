'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { UploadDocumentModal } from '@/components/client/UploadDocumentModal';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { AppShell } from '@/components/layout/AppShell';

export default function ClientDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [correctionDoc, setCorrectionDoc] = useState<AuditDocument | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
        setStats(data.stats || null);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error('Failed to load client dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-2 text-[#777770] font-mono text-xs">
          <div className="w-5 h-5 border-2 border-[#111110] border-t-transparent animate-spin" />
          <span>LOADING CLIENT WORKSPACE...</span>
        </div>
      </div>
    );
  }

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (activeFilter === 'PENDING') return doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW';
    if (activeFilter === 'CORRECTION') return doc.status === 'CORRECTION_REQUIRED';
    if (activeFilter === 'APPROVED') return doc.status === 'APPROVED';
    return true;
  });

  const correctionPendingDocs = documents.filter((d) => d.status === 'CORRECTION_REQUIRED');
  const awaitingReviewCount = (stats?.pending_reviews ?? 0) + (stats?.under_review ?? 0);

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: '1',
          name: 'ABC Traders',
          email: 'client@demo.com',
          role: 'CLIENT',
          client_id: 'c1',
          created_at: '',
        }
      }
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* 1. Header: Greeting & Direct Action Focus */}
        <div className="border-b border-[#E5E5E0] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
                OVERVIEW · FINANCIAL YEAR 2024-25
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111110] uppercase font-mono">
                GOOD MORNING, {currentUser?.name || 'ABC TRADERS'}.
              </h1>

              {/* Singular Attention Message */}
              <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                {correctionPendingDocs.length > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#E03E1A] animate-pulse" />
                    <span className="font-bold text-[#C2410C] uppercase tracking-wider">
                      {correctionPendingDocs.length} DOCUMENT NEEDS YOUR ATTENTION
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-emerald-800 font-bold uppercase tracking-wider">
                      ALL AUDIT SUBMISSIONS UP TO DATE
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                title="Refresh workspace"
                className="p-2 border border-[#E5E5E0] bg-white hover:bg-[#FAFAF8] text-[#111110] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Primary Focal Block: Action Required Card (If corrections exist) */}
        {correctionPendingDocs.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C2410C] font-bold block">
              IMMEDIATE AUDIT ACTION REQUIRED:
            </span>

            {correctionPendingDocs.map((doc) => {
              const reasonText =
                doc.latest_review?.remarks ||
                doc.latest_correction_reason ||
                doc.current_review?.comment ||
                'Invoice INV-204 from Balaji Enterprises is missing. Reconcile with GSTR-2B and re-upload.';

              return (
                <div
                  key={doc.id}
                  className="border-2 border-[#E03E1A] bg-white p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-[#111110] uppercase">
                        {doc.title}
                      </span>
                      <DocumentStatusBadge status={doc.status} size="sm" />
                    </div>

                    <span className="text-xs font-mono text-[#777770]">
                      Version {doc.current_version} · Submitted {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  {/* Auditor Reason Callout */}
                  <div className="space-y-1 font-mono text-xs">
                    <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                      AUDITOR REMARKS (RAHUL SHARMA, CA):
                    </span>
                    <p className="text-sm font-sans text-[#111110] bg-orange-50/80 p-3.5 border-l-2 border-[#E03E1A] leading-relaxed">
                      "{reasonText}"
                    </p>
                  </div>

                  {/* Immediate Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="px-4 py-2 border border-[#111110] bg-white hover:bg-[#FAFAF8] text-[#111110] uppercase tracking-wider font-bold transition-colors"
                    >
                      Review Feedback
                    </Link>

                    <button
                      onClick={() => setCorrectionDoc(doc)}
                      className="px-5 py-2 bg-[#E03E1A] hover:bg-[#C2410C] text-white uppercase tracking-wider font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Upload Version {doc.current_version + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Compact Inline Metric Summary (Replaces giant 4-box cards) */}
        <div className="border-t border-b border-[#E5E5E0] py-3.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[#555550]">
            <span className="font-bold text-[#111110]">
              {stats?.total_documents ?? documents.length} DOCUMENTS TOTAL
            </span>
            <span>·</span>
            <span>{awaitingReviewCount} AWAITING REVIEW</span>
            <span>·</span>
            <span className={correctionPendingDocs.length > 0 ? 'text-[#C2410C] font-bold' : ''}>
              {stats?.corrections_required ?? correctionPendingDocs.length} CORRECTION{correctionPendingDocs.length === 1 ? '' : 'S'}
            </span>
            <span>·</span>
            <span className="text-emerald-800 font-bold">
              {stats?.approved_total ?? 0} APPROVED
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'CORRECTION', label: 'Corrections' },
              { key: 'APPROVED', label: 'Approved' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                  activeFilter === tab.key
                    ? 'bg-[#111110] text-white font-bold'
                    : 'text-[#777770] hover:text-[#111110]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Dominant, Clean Document Table with Thin Separators */}
        <div className="space-y-2">
          {filteredDocuments.length === 0 ? (
            <div className="border border-[#E5E5E0] bg-white p-12 text-center space-y-3 font-mono">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111110]">
                NO DOCUMENTS FOUND
              </span>
              <p className="text-xs text-[#666660] font-sans max-w-sm mx-auto">
                No active audit files matching the current filter.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] text-white text-xs uppercase font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                    <th className="py-3 px-4 font-bold">Document</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Version</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Updated</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  {filteredDocuments.map((doc) => {
                    const isCorrection = doc.status === 'CORRECTION_REQUIRED';

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-[#FAFAF8] transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/client/documents/${doc.id}`}
                            className="font-bold text-[#111110] hover:underline block truncate max-w-xs font-sans text-xs"
                          >
                            {doc.title}
                          </Link>
                          <span className="text-[10px] text-[#777770] font-mono">
                            {doc.file_name}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#555550]">
                          <span className="px-2 py-0.5 bg-[#F2F2EE] border border-[#E5E5E0] text-[10px] uppercase tracking-wider">
                            {doc.document_type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#111110]">
                          v{doc.current_version}
                        </td>

                        <td className="py-3.5 px-4">
                          <DocumentStatusBadge status={doc.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-[#555550]">
                          {new Date(doc.updated_at).toLocaleDateString('en-GB')}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {isCorrection && (
                              <button
                                onClick={() => setCorrectionDoc(doc)}
                                className="px-2.5 py-1 bg-[#E03E1A] hover:bg-[#C2410C] text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Revise
                              </button>
                            )}

                            <Link
                              href={`/client/documents/${doc.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111110] hover:text-[#E03E1A] transition-colors"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Upload Correction Modal */}
      {correctionDoc && (
        <UploadCorrectionModal
          isOpen={!!correctionDoc}
          document={correctionDoc}
          onClose={() => setCorrectionDoc(null)}
          onSuccess={() => {
            setCorrectionDoc(null);
            fetchDashboardData();
          }}
        />
      )}
    </AppShell>
  );
}
