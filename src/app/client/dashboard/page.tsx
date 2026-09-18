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
          <span>INITIALIZING WORKSPACE...</span>
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
      <div className="space-y-8">
        {/* 1. Calm Editorial Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E5E0] pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
              CLIENT WORKSPACE · FY 2024-25
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#111110]">
              Good morning.
            </h1>
            <p className="text-xs text-[#666660] font-sans mt-1">
              Here’s what needs your attention for financial year <strong className="text-[#111110]">2024-25</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              title="Refresh document records"
              className="p-2.5 bg-white border border-[#E5E5E0] text-[#666660] hover:text-[#111110] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* 2. Action Required Banner (Priority Muted Red/Orange) */}
        {correctionPendingDocs.length > 0 && (
          <div className="border border-orange-200 bg-orange-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E03E1A]" />
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#C2410C]">
                  ACTION REQUIRED ({correctionPendingDocs.length} REVISION NEEDED)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#9A3412]">
                Statutory audit blocked until revised
              </span>
            </div>

            {correctionPendingDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-orange-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111110] truncate">
                      {doc.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#777770]">
                      · v{doc.current_version}
                    </span>
                  </div>
                  <p className="text-xs text-[#9A3412] font-mono line-clamp-2">
                    {doc.latest_review?.remarks ||
                      doc.latest_correction_reason ||
                      'Auditor requested a revision before audit sign-off.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/client/documents/${doc.id}`}
                    className="px-3 py-1.5 border border-[#E5E5E0] bg-white text-[11px] font-mono uppercase font-bold text-[#111110] hover:bg-[#FAFAF8] transition-colors"
                  >
                    View Feedback
                  </Link>

                  <button
                    onClick={() => setCorrectionDoc(doc)}
                    className="px-3.5 py-1.5 bg-[#E03E1A] hover:bg-[#C2410C] text-white text-[11px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Upload Revision (v{doc.current_version + 1})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Horizontal Information Strip (NOT giant colorful cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E5E5E0] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0] font-mono">
          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              TOTAL DOCUMENTS
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#111110] block mt-1">
              {stats?.total_documents ?? documents.length}
            </span>
            <span className="text-[10px] text-[#777770] block mt-0.5">
              Active engagement cycle
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              AWAITING REVIEW
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#111110] block mt-1">
              {(stats?.pending_reviews ?? 0) + (stats?.under_review ?? 0)}
            </span>
            <span className="text-[10px] text-[#777770] block mt-0.5">
              In auditor queue
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              CORRECTIONS REQUIRED
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#C2410C] block mt-1">
              {stats?.corrections_required ?? correctionPendingDocs.length}
            </span>
            <span className="text-[10px] text-[#C2410C] block mt-0.5">
              Client action pending
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              APPROVED & LOCKED
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800 block mt-1">
              {stats?.approved_total ?? 0}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              Statutory certified
            </span>
          </div>
        </div>

        {/* 4. Dominant Document Table */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#111110] tracking-tight">
                Engagement Documents
              </h2>
              <span className="text-xs text-[#666660] font-mono">
                {filteredDocuments.length} registered file{filteredDocuments.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border border-[#E5E5E0] bg-white p-0.5 font-mono text-[11px]">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'PENDING', label: 'Pending' },
                { key: 'CORRECTION', label: 'Corrections' },
                { key: 'APPROVED', label: 'Approved' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1 cursor-pointer transition-colors uppercase tracking-wider ${
                    activeFilter === tab.key
                      ? 'bg-[#111110] text-white font-bold'
                      : 'text-[#666660] hover:text-[#111110]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Table */}
          {filteredDocuments.length === 0 ? (
            <div className="border border-[#E5E5E0] bg-white p-12 text-center space-y-4">
              <div className="w-10 h-10 border border-[#E5E5E0] bg-[#FAFAF8] mx-auto flex items-center justify-center text-[#777770]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111110]">
                  NO DOCUMENTS YET
                </h3>
                <p className="text-xs text-[#666660] font-sans max-w-sm mx-auto">
                  Upload your first financial statement or register to initiate the audit workflow.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Document</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                    <th className="py-3 px-4 font-bold">Document</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Version</th>
                    <th className="py-3 px-4 font-bold">Current State</th>
                    <th className="py-3 px-4 font-bold">Last Updated</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0] text-xs font-mono">
                  {filteredDocuments.map((doc) => {
                    const formattedDate = new Date(doc.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

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
                          <span className="text-[10px] text-[#777770] font-mono block">
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
                          {formattedDate}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {doc.status === 'CORRECTION_REQUIRED' && (
                              <button
                                onClick={() => setCorrectionDoc(doc)}
                                className="px-2 py-1 bg-[#E03E1A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#C2410C] transition-colors cursor-pointer"
                              >
                                Revise
                              </button>
                            )}

                            <Link
                              href={`/client/documents/${doc.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111110] hover:text-[#E03E1A] transition-colors"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
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
