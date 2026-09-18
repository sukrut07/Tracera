'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  ArrowRight,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorDashboardPage() {
  const router = useRouter();
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
      console.error('Failed to load auditor queue:', err);
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
          <span>LOADING AUDITOR REVIEW QUEUE...</span>
        </div>
      </div>
    );
  }

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchClient = doc.client?.name.toLowerCase().includes(q) || false;
      const matchType = doc.document_type.toLowerCase().includes(q);
      if (!matchTitle && !matchClient && !matchType) return false;
    }

    return true;
  });

  const pendingCount =
    (stats?.pending_reviews ?? 0) + (stats?.under_review ?? 0);
  const formattedPending = String(pendingCount).padStart(2, '0');

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
        {/* Fast Work-Focused Review Queue Header */}
        <div className="border-b border-[#E5E5E0] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111110] font-mono uppercase">
                REVIEW QUEUE
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 font-mono text-xs font-bold tracking-wider">
                {formattedPending} PENDING
              </span>
            </div>

            {/* Right Controls: Search, Quick Filters & Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative font-mono text-xs w-64 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777770]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, clients..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E0] text-xs text-[#111110] placeholder-[#888880] focus:outline-none focus:border-[#111110]"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center border border-[#E5E5E0] bg-white p-0.5 font-mono text-xs">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'SUBMITTED', label: 'Pending' },
                  { key: 'UNDER_REVIEW', label: 'In Review' },
                  { key: 'CORRECTION_REQUIRED', label: 'Corrections' },
                  { key: 'APPROVED', label: 'Approved' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-[#111110] text-white font-bold'
                        : 'text-[#666660] hover:text-[#111110]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchDashboardData}
                title="Refresh review queue"
                className="p-1.5 border border-[#E5E5E0] bg-white hover:bg-[#FAFAF8] text-[#111110] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Dense, Fast Table (Clicking any row navigates directly to document review) */}
        {filteredDocuments.length === 0 ? (
          <div className="border border-[#E5E5E0] bg-white p-16 text-center space-y-2 font-mono">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111110] block">
              REVIEW QUEUE IS EMPTY
            </span>
            <p className="text-xs text-[#666660] font-sans">
              No documents require review under the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                  <th className="py-3 px-4 font-bold">DOCUMENT</th>
                  <th className="py-3 px-4 font-bold">CLIENT</th>
                  <th className="py-3 px-4 font-bold">VERSION</th>
                  <th className="py-3 px-4 font-bold">SUBMITTED</th>
                  <th className="py-3 px-4 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold">ASSIGNEE</th>
                  <th className="py-3 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filteredDocuments.map((doc) => {
                  const isSubmitted = doc.status === 'SUBMITTED';
                  const isUnderReview = doc.status === 'UNDER_REVIEW';
                  const isCorrection = doc.status === 'CORRECTION_REQUIRED';
                  const isApproved = doc.status === 'APPROVED';

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => router.push(`/auditor/documents/${doc.id}`)}
                      className="hover:bg-[#FAFAF8] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-xs text-[#111110] group-hover:underline flex items-center gap-2">
                          <span>{doc.title}</span>
                        </div>
                        <span className="text-[10px] text-[#777770] font-mono block mt-0.5">
                          {doc.file_name || doc.document_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#111110]">
                        {doc.client?.name || 'ABC Traders Pvt Ltd'}
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

                      <td className="py-3.5 px-4 text-[#555550]">
                        {doc.assigned_auditor?.name || 'Rahul Sharma, CA'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            isSubmitted
                              ? 'bg-[#111110] text-white group-hover:bg-[#2A2A28]'
                              : isUnderReview
                              ? 'bg-amber-600 text-white'
                              : isCorrection
                              ? 'text-[#E03E1A] bg-orange-50 border border-orange-200'
                              : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          <span>
                            {isSubmitted
                              ? 'Review →'
                              : isUnderReview
                              ? 'Resume →'
                              : isCorrection
                              ? 'Pending Client'
                              : 'Certified'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer: Summary & Keyboard Guide */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#777770] pt-1">
          <span>
            Showing <strong>{filteredDocuments.length}</strong> of <strong>{documents.length}</strong> audit records
          </span>
          <div className="flex items-center gap-4">
            <span>Click any row to open review console</span>
            <span>·</span>
            <span>Press <kbd className="px-1 py-0.5 border border-[#E5E5E0] bg-white text-[#111110]">⌘K</kbd> to search</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
