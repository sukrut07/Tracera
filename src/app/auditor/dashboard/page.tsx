'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Building2,
  FileText,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Inbox,
} from 'lucide-react';
import { AuditDocument, DashboardStats, DocumentStatus, DocumentType, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { FixtureBanner } from '@/components/shared/FixtureBanner';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

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
      console.error('Failed to load auditor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-3 text-zinc-500 text-xs">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[11px] uppercase tracking-wider">Loading Review Workspace...</span>
        </div>
      </div>
    );
  }

  // Filter queue
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && doc.document_type !== typeFilter) return false;
    if (clientFilter !== 'ALL' && doc.client?.name !== clientFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchClient = doc.client?.name.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchClient) return false;
    }

    return true;
  });

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
      <div className="space-y-8">
        {/* Workspace Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400">
                AUDIT OPERATIONS // REVIEW QUEUE
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200">
                Senior CA Reviewer
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight">
              Review Workspace
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl">
              Inspect submitted financial records, execute 5-point verification checks, request granular corrections, and record immutable audit approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              title="Refresh audit queue"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Compact Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => setStatusFilter(statusFilter === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'SUBMITTED'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                statusFilter === 'SUBMITTED' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Pending Reviews
              </span>
              <Clock className={`w-4 h-4 ${statusFilter === 'SUBMITTED' ? 'text-sky-400' : 'text-sky-600'}`} />
            </div>
            <div className="text-2xl font-black tracking-tight">
              {stats?.pending_reviews ?? 0}
            </div>
            <span className={`text-[11px] font-medium mt-1 block ${
              statusFilter === 'SUBMITTED' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Awaiting initial audit check
            </span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                statusFilter === 'UNDER_REVIEW' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Under Review
              </span>
              <Eye className={`w-4 h-4 ${statusFilter === 'UNDER_REVIEW' ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div className="text-2xl font-black tracking-tight">
              {stats?.under_review ?? 0}
            </div>
            <span className={`text-[11px] font-medium mt-1 block ${
              statusFilter === 'UNDER_REVIEW' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Verification in progress
            </span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'CORRECTION_REQUIRED' ? 'ALL' : 'CORRECTION_REQUIRED')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'CORRECTION_REQUIRED'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                statusFilter === 'CORRECTION_REQUIRED' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Corrections Awaiting
              </span>
              <AlertTriangle className={`w-4 h-4 ${statusFilter === 'CORRECTION_REQUIRED' ? 'text-rose-400' : 'text-rose-600'}`} />
            </div>
            <div className="text-2xl font-black tracking-tight">
              {stats?.corrections_required ?? 0}
            </div>
            <span className={`text-[11px] font-medium mt-1 block ${
              statusFilter === 'CORRECTION_REQUIRED' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Awaiting client re-upload
            </span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                statusFilter === 'APPROVED' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Approved
              </span>
              <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'APPROVED' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="text-2xl font-black tracking-tight">
              {stats?.approved_total ?? 0}
            </div>
            <span className={`text-[11px] font-medium mt-1 block ${
              statusFilter === 'APPROVED' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Audit sign-off completed
            </span>
          </button>
        </div>

        {/* Evaluation Test Fixtures Banner */}
        <FixtureBanner onRefresh={fetchDashboardData} />

        {/* Review Queue Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by client or document title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Pending (Submitted)</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="CORRECTION_REQUIRED">Correction Required</option>
                <option value="APPROVED">Approved</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
              >
                <option value="ALL">All Document Types</option>
                <option value="PURCHASE_REGISTER">Purchase Register</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="INVOICE">Tax Invoice</option>
                <option value="GST_DOCUMENT">GST Document</option>
                <option value="TDS_CERTIFICATE">TDS Certificate</option>
                <option value="OTHER">Other Ledger</option>
              </select>

              {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || clientFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setTypeFilter('ALL');
                    setClientFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-950 font-medium px-2 py-1 underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Queue Content */}
          {filteredDocuments.length === 0 ? (
            <div className="py-16 px-4">
              <EmptyState
                icon={Inbox}
                title="Your review queue is clear"
                description={
                  documents.length === 0
                    ? 'No client documents have been submitted yet. When clients upload files or when demo data is seeded, they will appear here.'
                    : 'No documents match the active filter criteria. Try resetting your filters to see all queue items.'
                }
                action={
                  documents.length === 0 ? (
                    <button
                      onClick={async () => {
                        await fetch('/api/dev/reset', { method: 'POST' });
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Load Evaluation Demo Data
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50/80 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Document</th>
                    <th className="px-5 py-3">Version</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Submitted / Updated</th>
                    <th className="px-5 py-3">Assigned CA</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredDocuments.map((doc) => {
                    const dateFormatted = new Date(doc.updated_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    const isActionNeeded = doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW';

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-zinc-50/80 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-bold text-zinc-900">
                              {doc.client?.name || 'Client'}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block pl-5.5 font-normal">
                            {doc.client?.company_name}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/auditor/documents/${doc.id}`}
                            className="font-bold text-zinc-900 hover:text-zinc-700 block leading-tight"
                          >
                            {doc.title}
                          </Link>
                          <span className="text-[10px] font-mono uppercase text-zinc-500 font-medium">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px] border border-zinc-200">
                            v{doc.current_version}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <DocumentStatusBadge status={doc.status} />
                        </td>

                        <td className="px-5 py-4 text-zinc-500 font-mono text-[11px]">
                          {dateFormatted}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{doc.assigned_auditor?.name || 'Rahul Sharma'}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/auditor/documents/${doc.id}`}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-lg text-xs transition-all shadow-2xs ${
                              isActionNeeded
                                ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{doc.status === 'SUBMITTED' ? 'Start Review' : 'Review'}</span>
                          </Link>
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
    </AppShell>
  );
}
