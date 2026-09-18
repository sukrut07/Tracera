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
  Shield,
  Layers,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile, Engagement } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { UploadDocumentModal } from '@/components/client/UploadDocumentModal';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { AppShell } from '@/components/layout/AppShell';

export default function ClientDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeEngagements, setActiveEngagements] = useState<Engagement[]>([]);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [correctionDoc, setCorrectionDoc] = useState<AuditDocument | null>(null);

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [resDocs, resEngs] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/engagements'),
      ]);
      if (resDocs.status === 401 || resEngs.status === 401 || resDocs.status === 403 || resEngs.status === 403) {
        window.location.href = '/login';
        return;
      }
      const dataDocs = await resDocs.json();
      const dataEngs = await resEngs.json();

      if (resDocs.ok) {
        setDocuments(dataDocs.documents || []);
        setStats(dataDocs.stats || null);
        setCurrentUser(dataDocs.currentUser || null);
      }
      if (resEngs.ok) {
        setActiveEngagements(dataEngs.engagements || []);
      }
    } catch (err) {
      console.error('Failed to load client dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    // Poll every 5s so auditor reviews/corrections sync immediately
    const timer = setInterval(() => fetchDashboardData(false), 5000);
    const onFocus = () => fetchDashboardData(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchDashboardData]);

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-2 text-[#4A4A48] font-sans text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">Loading client workspace...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (activeFilter === 'PENDING' || activeFilter === 'UNDER_REVIEW') return doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW';
    if (activeFilter === 'CORRECTION' || activeFilter === 'ACTION_REQUIRED') return doc.status === 'CORRECTION_REQUIRED';
    if (activeFilter === 'APPROVED') return doc.status === 'APPROVED';
    return true;
  });

  const correctionPendingDocs = documents.filter((d) => d.status === 'CORRECTION_REQUIRED');
  const awaitingReviewCount = (stats?.pending_reviews ?? 0) + (stats?.under_review ?? 0);

  return (
    <AppShell currentUser={currentUser}>
      <div className="space-y-8 max-w-5xl mx-auto font-sans">
        {/* 1. Header: Greeting & Direct Action Focus */}
        <div className="border-b-[3px] border-[#0A0A0A] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E73520] block mb-1">
                OVERVIEW · FINANCIAL YEAR 2024–25
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] font-sans">
                Good morning, {currentUser?.name?.split(' ')[0] || 'Client'}.
              </h1>

              {/* Singular Attention Message */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                {correctionPendingDocs.length > 0 ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E73520] animate-pulse border border-[#0A0A0A]" />
                    <span className="font-black text-[#E73520] uppercase tracking-wider">
                      {correctionPendingDocs.length} DOCUMENT NEEDS YOUR ATTENTION
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C7F36B] border border-[#0A0A0A]" />
                    <span className="text-[#0A0A0A] font-bold uppercase tracking-wider">
                      ALL AUDIT SUBMISSIONS UP TO DATE
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardData(false)}
                title="Refresh workspace"
                className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="neo-btn bg-[#E73520] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                data-cursor="action"
              >
                <Plus className="w-4 h-4" />
                <span>UPLOAD DOCUMENT</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Primary Focal Block: Action Required Card (If corrections exist) */}
        {correctionPendingDocs.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E73520] block">
              1 ACTION REQUIRED:
            </span>

            {correctionPendingDocs.map((doc) => {
              const reasonText =
                doc.latest_review?.remarks ||
                doc.latest_correction_reason ||
                doc.current_review?.comment ||
                'Discrepancy identified during auditor cross-verification. Please reconcile and upload Version 2.';

              return (
                <div
                  key={doc.id}
                  className="neo-box-lg border-[#0A0A0A] bg-[#FFF2F0] p-6 space-y-4 shadow-[6px_6px_0_#0A0A0A]"
                  data-cursor="document"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0A0A0A]">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#E73520] text-white text-[9px] font-black px-2 py-0.5 border border-[#0A0A0A]">
                        CORRECTION REQUIRED
                      </span>
                      <h3 className="font-bold text-sm text-[#0A0A0A]">
                        {doc.title} (Version {doc.current_version})
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#4A4A48] font-bold">
                      Reviewer: {doc.assigned_auditor?.name || 'Assigned CA Auditor'}
                    </span>
                  </div>

                  {/* Auditor Reason Callout */}
                  <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]">
                    <span className="text-[10px] text-[#777770] uppercase font-black block mb-1">
                      AUDITOR INSTRUCTION:
                    </span>
                    <p className="text-sm font-bold text-[#0A0A0A] leading-relaxed">
                      "{reasonText}"
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-[#4A4A48]">
                      Version {doc.current_version} preserved in audit trail &bull; Uploading creates Version {doc.current_version + 1}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/client/documents/${doc.id}`}
                        className="neo-btn bg-white text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider"
                      >
                        REVIEW FEEDBACK
                      </Link>
                      <button
                        onClick={() => setCorrectionDoc(doc)}
                        className="neo-btn bg-[#E73520] text-white px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                        data-cursor="action"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>UPLOAD V{doc.current_version + 1} →</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Compact Inline Status Strip (NO 4 GIANT CARDS!) */}
        <div className="p-4 neo-box bg-white flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-[#0A0A0A] font-black">{stats?.total_documents ?? documents.length} DOCUMENTS TOTAL</span>
          </div>
          <span className="text-[#0A0A0A]/30 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5CC8FF] border border-[#0A0A0A]" />
            <span className="text-[#0A0A0A]">{awaitingReviewCount} AWAITING REVIEW</span>
          </div>
          <span className="text-[#0A0A0A]/30 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E73520] border border-[#0A0A0A]" />
            <span className="text-[#E73520] font-black">{stats?.corrections_required ?? correctionPendingDocs.length} CORRECTION</span>
          </div>
          <span className="text-[#0A0A0A]/30 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B] border border-[#0A0A0A]" />
            <span className="text-[#0A0A0A]">{stats?.approved_total ?? 0} APPROVED</span>
          </div>
        </div>

        {/* 4. Active Engagement Summary Strip */}
        {activeEngagements.length > 0 && (
          <div className="neo-box bg-[#F7F5EF] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0A0A0A]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E73520]" />
                <span className="text-xs font-black uppercase text-[#0A0A0A]">
                  ENGAGEMENT: {activeEngagements[0].service_type.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#0A0A0A]">
                STAGE 0{activeEngagements[0].current_stage_index + 1} / {activeEngagements[0].total_stages} ({activeEngagements[0].progress_percent}%)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black uppercase text-[#0A0A0A] font-sans">
                  {activeEngagements[0].title}
                </h3>
                <span className="text-xs text-[#555555] block mt-0.5">
                  Lead Partner: {activeEngagements[0].assigned_partner_name || 'Sukrut Dusane, FCA'} &bull; Due: {activeEngagements[0].due_date}
                </span>
              </div>

              <Link
                href={`/engagements/${activeEngagements[0].id}`}
                className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
              >
                <span>OPEN ENGAGEMENT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 5. Document List Header with Filter Pills */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b-2 border-[#0A0A0A]">
            <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
              ALL CLIENT DOCUMENTS ({filteredDocuments.length})
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {(['ALL', 'PENDING', 'CORRECTION', 'APPROVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 font-bold border-2 transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[2px_2px_0_#E73520]'
                      : 'border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#F7F5EF]'
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button
                onClick={() => {
                  const headers = ['Document,Type,Version,Status,Created At'];
                  const rows = filteredDocuments.map(
                    (d) =>
                      `"${d.title}","${d.document_type}","v${d.current_version}","${d.status}","${d.created_at}"`
                  );
                  const csvContent =
                    'data:text/csv;charset=utf-8,' +
                    [headers, ...rows].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute(
                    'download',
                    `tracera_client_documents_${new Date().toISOString().slice(0, 10)}.csv`
                  );
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-2.5 py-1 text-xs font-bold border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#F7F5EF] flex items-center gap-1 cursor-pointer"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#E73520]" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Hard-Bordered Document Table */}
          <div className="border-2 border-[#0A0A0A] divide-y-2 divide-[#0A0A0A] bg-white">
            <div className="p-3 bg-[#F7F5EF] grid grid-cols-12 font-semibold text-[11px] text-[#4A4A48] uppercase tracking-[0.04em]">
              <span className="col-span-5">DOCUMENT</span>
              <span className="col-span-2">VERSION</span>
              <span className="col-span-3">STATUS</span>
              <span className="col-span-2 text-right">ACTION</span>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777770]">
                No documents matching the active filter.
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 grid grid-cols-12 items-center hover:bg-[#F7F5EF] transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#0A0A0A] shrink-0" />
                    <div>
                      <Link
                        href={`/client/documents/${doc.id}`}
                        className="font-bold text-xs text-[#0A0A0A] hover:text-[#E73520] hover:underline truncate block"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-[#777770] block">
                        {doc.document_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <span className="col-span-2 text-xs font-bold text-[#0A0A0A]">
                    v{doc.current_version}
                  </span>

                  <div className="col-span-3">
                    <DocumentStatusBadge status={doc.status} />
                  </div>

                  <div className="col-span-2 text-right">
                    {doc.status === 'CORRECTION_REQUIRED' ? (
                      <button
                        onClick={() => setCorrectionDoc(doc)}
                        className="text-[11px] font-black text-[#E73520] underline hover:text-[#0A0A0A] cursor-pointer"
                      >
                        UPLOAD V{doc.current_version + 1} →
                      </button>
                    ) : (
                      <Link
                        href={`/client/documents/${doc.id}`}
                        className="text-[11px] font-bold text-[#0A0A0A] hover:text-[#E73520] hover:underline"
                      >
                        DETAILS →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upload Modal */}
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={fetchDashboardData}
        />

        {/* Correction Modal */}
        {correctionDoc && (
          <UploadCorrectionModal
            isOpen={!!correctionDoc}
            document={correctionDoc}
            onClose={() => setCorrectionDoc(null)}
            onSuccess={fetchDashboardData}
          />
        )}
      </div>
    </AppShell>
  );
}
