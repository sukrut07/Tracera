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
  FileSpreadsheet,
  FileText,
  Building,
  Download,
} from 'lucide-react';
import { AuditDocument, DashboardStats, UserProfile } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
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
    fetchDashboardData(true);
    // Poll every 5s so client submissions appear immediately
    const timer = setInterval(() => fetchDashboardData(false), 5000);
    const onFocus = () => fetchDashboardData(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchDashboardData]);

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-2 text-[#4A4A48] font-mono text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">LOADING AUDITOR REVIEW QUEUE...</span>
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
      <div className="space-y-6 font-sans">
        {/* Fast Work-Focused Review Queue Header */}
        <div className="border-b-[3px] border-[#0A0A0A] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-black uppercase text-[#0A0A0A] tracking-tight font-sans">
                REVIEW QUEUE
              </span>
              <span className="text-xs font-bold text-[#E73520] uppercase bg-[#0A0A0A] text-white px-2.5 py-1">
                {formattedPending} DOCUMENTS WAITING
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardData(false)}
                title="Refresh queue"
                className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/auditor/my-work"
                className="neo-btn bg-[#0A0A0A] text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2"
              >
                <span>MY WORK DESK</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E73520]" />
              </Link>
            </div>
          </div>
        </div>

        {/* MY WORK Top Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neo-box p-4 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E73520] block mb-1">
              DOCUMENTS TO REVIEW
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0A0A0A]">{pendingCount}</span>
              <span className="text-[10px] font-bold text-[#555555]">Awaiting verification</span>
            </div>
          </div>

          <div className="neo-box p-4 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0A0A0A] block mb-1">
              WAITING ON CLIENT
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0A0A0A]">{stats?.corrections_required ?? 0}</span>
              <span className="text-[10px] font-bold text-[#555555]">Correction requested</span>
            </div>
          </div>

          <div className="neo-box p-4 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0A0A0A] block mb-1">
              APPROVED
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0A0A0A]">{stats?.approved_total ?? 0}</span>
              <span className="text-[10px] font-bold text-[#555555]">Completed audits</span>
            </div>
          </div>
        </div>

        {/* Compact Search & Status Filter Strip */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E73520]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document title, client, type..."
              className="w-full pl-9 pr-4 py-2 bg-white border-2 border-[#0A0A0A] text-xs font-mono font-bold text-[#0A0A0A] placeholder:text-[#888880] focus:outline-none shadow-[2px_2px_0_#0A0A0A]"
            />
          </div>

          {/* Filter Pills & CSV Export */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {[
              { label: 'ALL', value: 'ALL' },
              { label: 'PENDING', value: 'SUBMITTED' },
              { label: 'IN REVIEW', value: 'UNDER_REVIEW' },
              { label: 'CORRECTIONS', value: 'CORRECTION_REQUIRED' },
              { label: 'APPROVED', value: 'APPROVED' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
                  statusFilter === f.value
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[2px_2px_0_#E73520]'
                    : 'border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#F7F5EF]'
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={() => {
                const headers = ['Document,Client,Type,Version,Status,Submitted Date'];
                const rows = filteredDocuments.map(
                  (d) =>
                    `"${d.title}","${d.client?.name || ''}","${d.document_type}","v${d.current_version}","${d.status}","${d.created_at}"`
                );
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  [headers, ...rows].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute(
                  'download',
                  `tracera_review_queue_${new Date().toISOString().slice(0, 10)}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-2.5 py-1.5 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] flex items-center gap-1 cursor-pointer font-bold"
              title="Export Review Queue as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#E73520]" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Dense Neo-Brutalist Review Table */}
        <div className="neo-box-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b-2 border-[#0A0A0A] bg-[#F7F5EF] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#111111]">
                  <th className="py-3 px-4">DOCUMENT</th>
                  <th className="py-3 px-4">CLIENT</th>
                  <th className="py-3 px-4">VERSION</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#0A0A0A]">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#555555]">
                      No audit documents match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const formattedDate = new Date(doc.created_at).toLocaleDateString(
                      'en-IN',
                      { day: '2-digit', month: 'short', year: 'numeric' }
                    );

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => router.push(`/auditor/documents/${doc.id}`)}
                        className="hover:bg-[#F7F5EF] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-[#0A0A0A] shrink-0" />
                            <div>
                              <span className="font-bold text-[#0A0A0A] group-hover:text-[#E73520] group-hover:underline">
                                {doc.title}
                              </span>
                              <span className="block text-[10px] text-[#555555]">
                                {doc.document_type.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-[#0A0A0A]">
                          {doc.client?.name || 'Client'}
                        </td>

                        <td className="py-3 px-4 font-bold text-[#0A0A0A]">
                          v{doc.current_version}
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={doc.status} />
                        </td>

                        <td className="py-3 px-4 text-[#555555]">
                          {formattedDate}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[#E73520] font-black group-hover:underline">
                            <span>REVIEW</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
