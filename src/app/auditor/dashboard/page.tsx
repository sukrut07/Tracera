'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-2 text-[#777770] font-mono text-xs">
          <div className="w-5 h-5 border-2 border-[#111110] border-t-transparent animate-spin" />
          <span>LOADING AUDIT WORKSPACE...</span>
        </div>
      </div>
    );
  }

  // Filter queue
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchClient = doc.client?.name.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchClient) return false;
    }

    return true;
  });

  const attentionCount =
    (stats?.pending_reviews ?? 0) +
    (stats?.under_review ?? 0) +
    (stats?.corrections_required ?? 0);

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
        {/* 1. Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E5E0] pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
              STATUTORY ENGAGEMENT QUEUE
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#111110]">
              Review Workspace
            </h1>
            <p className="text-xs text-[#666660] font-sans mt-1">
              <strong className="text-[#111110] font-mono">{attentionCount} document{attentionCount === 1 ? '' : 's'}</strong> require your professional review or verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              title="Refresh queue"
              className="p-2.5 bg-white border border-[#E5E5E0] text-[#666660] hover:text-[#111110] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Minimal Horizontal Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E5E5E0] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0] font-mono">
          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              PENDING REVIEW
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-700 block mt-1">
              {stats?.pending_reviews ?? 0}
            </span>
            <span className="text-[10px] text-[#777770] block mt-0.5">
              Awaiting inspection
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              UNDER REVIEW
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 block mt-1">
              {stats?.under_review ?? 0}
            </span>
            <span className="text-[10px] text-[#777770] block mt-0.5">
              Active verification
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              CORRECTIONS
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#C2410C] block mt-1">
              {stats?.corrections_required ?? 0}
            </span>
            <span className="text-[10px] text-[#C2410C] block mt-0.5">
              Client revision pending
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              APPROVED
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800 block mt-1">
              {stats?.approved_total ?? 0}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              Statutory certified
            </span>
          </div>
        </div>

        {/* 3. Review Queue Table (Dominates the Workspace) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#111110] tracking-tight">
                Review Queue
              </h2>
              <span className="text-xs text-[#666660] font-mono">
                {filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'} in current view
              </span>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center border border-[#E5E5E0] bg-white p-0.5 font-mono text-[11px]">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'SUBMITTED', label: 'Pending' },
                  { key: 'UNDER_REVIEW', label: 'Under Review' },
                  { key: 'CORRECTION_REQUIRED', label: 'Corrections' },
                  { key: 'APPROVED', label: 'Approved' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1 cursor-pointer transition-colors uppercase tracking-wider ${
                      statusFilter === tab.key
                        ? 'bg-[#111110] text-white font-bold'
                        : 'text-[#666660] hover:text-[#111110]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative font-mono text-xs max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777770]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client or document title..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E5E0] text-xs text-[#111110] focus:outline-none focus:border-[#111110]"
            />
          </div>

          {/* Table */}
          {filteredDocuments.length === 0 ? (
            <div className="border border-[#E5E5E0] bg-white p-12 text-center space-y-2 font-mono">
              <span className="text-xs font-bold uppercase text-[#111110]">
                NO DOCUMENTS FOUND IN QUEUE
              </span>
              <p className="text-xs text-[#666660] font-sans">
                All client submissions in this filter category have been processed.
              </p>
            </div>
          ) : (
            <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                    <th className="py-3 px-4 font-bold">Client</th>
                    <th className="py-3 px-4 font-bold">Document</th>
                    <th className="py-3 px-4 font-bold">Version</th>
                    <th className="py-3 px-4 font-bold">Submitted Date</th>
                    <th className="py-3 px-4 font-bold">Current State</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0] text-xs font-mono">
                  {filteredDocuments.map((doc) => {
                    const isReviewable = doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW';

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-[#FAFAF8] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-[#111110]">
                          {doc.client?.name || 'ABC Traders Pvt Ltd'}
                        </td>

                        <td className="py-3.5 px-4">
                          <Link
                            href={`/auditor/documents/${doc.id}`}
                            className="font-bold text-[#111110] hover:underline block truncate max-w-xs font-sans"
                          >
                            {doc.title}
                          </Link>
                          <span className="text-[10px] text-[#777770]">
                            {doc.document_type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#111110]">
                          v{doc.current_version}
                        </td>

                        <td className="py-3.5 px-4 text-[#555550]">
                          {new Date(doc.created_at).toLocaleDateString('en-GB')}
                        </td>

                        <td className="py-3.5 px-4">
                          <DocumentStatusBadge status={doc.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/auditor/documents/${doc.id}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-colors ${
                              isReviewable
                                ? 'bg-[#111110] text-white hover:bg-[#2A2A28]'
                                : 'bg-[#F2F2EE] text-[#111110] hover:bg-[#E5E5E0]'
                            }`}
                          >
                            <span>{isReviewable ? 'Review' : 'Open'}</span>
                            <ArrowUpRight className="w-3 h-3" />
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
