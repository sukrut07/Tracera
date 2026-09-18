'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  Send,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { UploadDocumentModal } from '@/components/client/UploadDocumentModal';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { FixtureBanner } from '@/components/shared/FixtureBanner';
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50/70">
        <div className="flex flex-col items-center gap-2 text-zinc-500 text-xs">
          <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Loading workspace...</span>
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
      {/* Calm Header Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
            Good morning.
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Here&apos;s what needs your attention for financial year{' '}
            <strong className="text-zinc-800 font-semibold">2024-25</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            title="Refresh documents"
            className="p-2.5 bg-white border border-zinc-200/90 text-zinc-600 hover:text-zinc-950 rounded-xl hover:bg-zinc-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Prominent Correction Required Banner */}
      {correctionPendingDocs.length > 0 && (
        <div className="mb-8 bg-rose-50/80 border border-rose-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Correction Requested by Auditor
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-rose-200/70 text-rose-900 px-2 py-0.5 rounded">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-rose-900 font-medium mt-1">
                  <strong>{correctionPendingDocs[0].title}</strong> requires your revision before the audit can proceed.
                </p>
                {correctionPendingDocs[0].current_review?.comment && (
                  <p className="text-xs text-rose-800/90 bg-white/80 p-2.5 rounded-lg border border-rose-200/60 mt-2 font-medium max-w-2xl">
                    &ldquo;{correctionPendingDocs[0].current_review.comment}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setCorrectionDoc(correctionPendingDocs[0])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Upload Revision (v{correctionPendingDocs[0].current_version + 1})</span>
            </button>
          </div>
        </div>
      )}

      {/* Restrained Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Documents
          </span>
          <div className="text-2xl font-black text-zinc-950 mt-1">
            {stats?.total_documents || documents.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            In active audit cycle
          </span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Awaiting Review
          </span>
          <div className="text-2xl font-black text-sky-700 mt-1">
            {stats?.pending_reviews || 0}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            In auditor queue
          </span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Corrections Required
          </span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {stats?.corrections_required || 0}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Needs client revision
          </span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Approved
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats?.approved_total || 0}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Locked & certified
          </span>
        </div>
      </div>

      {/* Evaluation Fixture Library Banner */}
      <div className="mb-8">
        <FixtureBanner onRefresh={fetchDashboardData} clientId={currentUser?.client_id || 'c1'} />
      </div>

      {/* Main Documents Table Section */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Filter Tabs Bar */}
        <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-950">Audit Documents</h2>
            <span className="text-xs font-mono text-zinc-400">({filteredDocuments.length})</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('PENDING')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'PENDING'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter('CORRECTION')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'CORRECTION'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Corrections
            </button>
            <button
              onClick={() => setActiveFilter('APPROVED')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'APPROVED'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        {/* Empty State or Table */}
        {filteredDocuments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={FileText}
              title="No documents yet."
              description="Upload your first document to begin your audit workflow."
              action={
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-50/70 transition-colors group">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-bold text-zinc-900 hover:text-emerald-700 transition-colors block"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {doc.versions?.[0]?.file_name || doc.title}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 font-medium">
                      {doc.document_type.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                        v{doc.current_version}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <DocumentStatusBadge status={doc.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {new Date(doc.updated_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === 'CORRECTION_REQUIRED' && (
                          <button
                            onClick={() => setCorrectionDoc(doc)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Upload Fix
                          </button>
                        )}
                        <Link
                          href={`/documents/${doc.id}`}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors inline-flex items-center"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDashboardData}
        clientId={currentUser?.client_id || 'c1111111-1111-1111-1111-111111111111'}
      />

      {/* Upload Correction Modal */}
      {correctionDoc && (
        <UploadCorrectionModal
          document={correctionDoc}
          isOpen={Boolean(correctionDoc)}
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
