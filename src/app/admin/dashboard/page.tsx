'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Briefcase,
  Users,
  ArrowUpRight,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Search,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateClientModal } from '@/components/admin/CreateClientModal';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { CreateEngagementModal } from '@/components/engagements/CreateEngagementModal';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { UserProfile, DashboardStats, AuditDocument, DocumentStatus } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [engagementsCount, setEngagementsCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authDenied, setAuthDenied] = useState(false);

  // Filter & Search
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'APPROVED' | 'SENT' | 'CORRECTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);

      const [authRes, docsRes, clientsRes, engsRes, usersRes] = await Promise.all([
        fetch('/api/auth/login'),
        fetch('/api/documents'),
        fetch('/api/clients'),
        fetch('/api/engagements'),
        fetch('/api/users'),
      ]);

      // 1. Authenticate that user is admin@gmail.com
      if (authRes.ok) {
        const authData = await authRes.json();
        if (!authData.user || authData.user.email?.toLowerCase() !== 'admin@gmail.com') {
          setAuthDenied(true);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
        setCurrentUser(authData.user);
        setAuthDenied(false);
      } else {
        setAuthDenied(true);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 2. Load Documents & Requests
      if (docsRes.ok) {
        const d = await docsRes.json();
        setDocuments(d.documents || []);
        setStats(d.stats || null);
      }

      // 3. Load Clients
      if (clientsRes.ok) {
        const c = await clientsRes.json();
        setClientsCount(c.clients?.length || 0);
      }

      // 4. Load Engagements
      if (engsRes.ok) {
        const e = await engsRes.json();
        setEngagementsCount(e.engagements?.length || 0);
      }

      // 5. Load Users
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersCount(u.users?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    // Poll every 6 seconds to capture live requests and approvals from Client/Auditor dashboards
    const timer = setInterval(() => loadData(false), 6000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleAdminQuickLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
  };

  // Filter requests
  const filteredDocuments = documents.filter((doc) => {
    // 1. Status Filter
    if (requestFilter === 'APPROVED') {
      if (doc.status !== 'APPROVED') return false;
    } else if (requestFilter === 'SENT') {
      if (doc.status !== 'SUBMITTED' && doc.status !== 'UNDER_REVIEW') return false;
    } else if (requestFilter === 'CORRECTION') {
      if (doc.status !== 'CORRECTION_REQUIRED') return false;
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = doc.title?.toLowerCase().includes(q);
      const clientMatch = doc.client?.company_name?.toLowerCase().includes(q) || doc.client?.name?.toLowerCase().includes(q);
      const typeMatch = doc.document_type?.toLowerCase().includes(q);
      return titleMatch || clientMatch || typeMatch;
    }

    return true;
  });

  // Calculate live counts
  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;
  const sentCount = documents.filter((d) => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW').length;
  const correctionCount = documents.filter((d) => d.status === 'CORRECTION_REQUIRED').length;

  // Render Access Barrier if user is not authenticated as admin@gmail.com
  if (authDenied) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4 font-sans selection:bg-[#E73520] selection:text-white">
        <div className="max-w-md w-full bg-white border-2 border-[#0A0A0A] p-6 sm:p-8 shadow-[6px_6px_0_#0A0A0A] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E73520] border-2 border-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#0A0A0A]">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E73520] block">
                SECURITY BARRIER · SECTION 143(3)
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                Admin Access Restricted
              </h1>
            </div>
          </div>

          <div className="p-4 bg-[#F7F5EF] border border-[#0A0A0A] space-y-2 text-xs">
            <p className="text-[#0A0A0A] font-semibold">
              This administrative dashboard is strictly restricted to the authorized master administrator:
            </p>
            <div className="p-2.5 bg-white border border-[#0A0A0A] font-mono text-[11px] space-y-1">
              <div><span className="text-[#777770]">Authorized Email:</span> <strong className="text-[#0A0A0A]">admin@gmail.com</strong></div>
              <div><span className="text-[#777770]">Designated Password:</span> <strong className="text-[#0A0A0A]">12345678</strong></div>
            </div>
            <p className="text-[11px] text-[#777770]">
              You are currently signed in as an unauthorized user, or your session has expired.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAdminQuickLogin}
              className="w-full py-3 bg-[#E73520] hover:bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <span>Authenticate as admin@gmail.com</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/login"
              className="w-full py-2.5 bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] border-2 border-[#0A0A0A] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors block text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-2 text-[#4A4A48] font-sans text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">Verifying admin access & synchronizing audit ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <AppShell currentUser={currentUser || undefined}>
      <div className="space-y-8 font-sans">
        {/* Top Header */}
        <div className="border-b-2 border-[#0A0A0A] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#E73520] text-white border border-[#0A0A0A]">
                PRACTICE ADMINISTRATION · MASTER ADMIN
              </span>
              <span className="text-[10px] font-mono text-[#777770]">
                Logged in as <strong>admin@gmail.com</strong>
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Firm Overview & Audit Control Hub
            </h1>
            <p className="text-xs text-[#666660]">
              Central audit practice governance, live cross-dashboard request tracking, client management, and firm oversight.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              title="Refresh ledger"
              className="p-2.5 bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] flex items-center gap-1.5 cursor-pointer text-xs font-bold uppercase transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>
            <button
              onClick={() => setClientModalOpen(true)}
              className="px-3.5 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Client</span>
            </button>
            <button
              onClick={() => setUserModalOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-neutral-100 text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add User</span>
            </button>
            <button
              onClick={() => setEngagementModalOpen(true)}
              className="px-3.5 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Create Engagement</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 border-2 border-[#0A0A0A] bg-white divide-y lg:divide-y-0 lg:divide-x-2 divide-[#0A0A0A] font-mono shadow-[4px_4px_0px_#0A0A0A]">
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              TOTAL REQUESTS
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : documents.length}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Across all client entities
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#15803D] font-bold block">
              APPROVED REQUESTS
            </span>
            <span className="text-3xl font-bold text-[#15803D] block mt-1">
              {loading ? '—' : approvedCount}
            </span>
            <span className="text-[10px] text-[#15803D] font-bold block mt-1">
              ✓ Verified & Signed Off
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#0284C7] font-bold block">
              SENT / UNDER REVIEW
            </span>
            <span className="text-3xl font-bold text-[#0284C7] block mt-1">
              {loading ? '—' : sentCount}
            </span>
            <span className="text-[10px] text-[#0284C7] block mt-1">
              In Auditor Queues
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#C2410C] font-bold block">
              CORRECTIONS OPEN
            </span>
            <span className="text-3xl font-bold text-[#C2410C] block mt-1">
              {loading ? '—' : correctionCount}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Awaiting Client Action
            </span>
          </div>

          <div className="p-5 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              CLIENT ENTITIES
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : clientsCount}
            </span>
            <Link
              href="/admin/clients"
              className="text-[10px] text-[#E73520] hover:underline font-bold block mt-1"
            >
              Manage clients →
            </Link>
          </div>
        </div>

        {/* ── CORE FEATURE: Audit Requests & Reviews from other dashboards ── */}
        <div className="border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0px_#0A0A0A]">
          {/* Section Header */}
          <div className="p-5 border-b-2 border-[#0A0A0A] bg-[#F7F5EF] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7F36B] border border-[#0A0A0A] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A] font-bold">
                  CROSS-DASHBOARD REQUEST FEED
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                Approved & Sent Audit Requests
              </h2>
              <p className="text-xs text-[#666660]">
                Live ledger of submissions from the Client Portal and review decisions from the Auditor Console.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#777770] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests, clients..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#0A0A0A] text-xs font-sans text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#E73520]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b-2 border-[#0A0A0A] bg-white overflow-x-auto">
            <button
              onClick={() => setRequestFilter('ALL')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-[#0A0A0A] transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                requestFilter === 'ALL'
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-white text-[#0A0A0A] hover:bg-[#F7F5EF]'
              }`}
            >
              <span>All Requests</span>
              <span className={`px-1.5 py-0.2 text-[10px] border ${
                requestFilter === 'ALL' ? 'bg-white text-[#0A0A0A] border-white' : 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
              }`}>
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setRequestFilter('APPROVED')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-[#0A0A0A] transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                requestFilter === 'APPROVED'
                  ? 'bg-[#15803D] text-white'
                  : 'bg-white text-[#15803D] hover:bg-[#F7F5EF]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approved Requests</span>
              <span className={`px-1.5 py-0.2 text-[10px] border ${
                requestFilter === 'APPROVED' ? 'bg-white text-[#15803D] border-white' : 'bg-[#15803D] text-white border-[#15803D]'
              }`}>
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setRequestFilter('SENT')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-[#0A0A0A] transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                requestFilter === 'SENT'
                  ? 'bg-[#0284C7] text-white'
                  : 'bg-white text-[#0284C7] hover:bg-[#F7F5EF]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sent / Submitted Requests</span>
              <span className={`px-1.5 py-0.2 text-[10px] border ${
                requestFilter === 'SENT' ? 'bg-white text-[#0284C7] border-white' : 'bg-[#0284C7] text-white border-[#0284C7]'
              }`}>
                {sentCount}
              </span>
            </button>

            <button
              onClick={() => setRequestFilter('CORRECTION')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                requestFilter === 'CORRECTION'
                  ? 'bg-[#E73520] text-white'
                  : 'bg-white text-[#E73520] hover:bg-[#F7F5EF]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Correction Required</span>
              <span className={`px-1.5 py-0.2 text-[10px] border ${
                requestFilter === 'CORRECTION' ? 'bg-white text-[#E73520] border-white' : 'bg-[#E73520] text-white border-[#E73520]'
              }`}>
                {correctionCount}
              </span>
            </button>
          </div>

          {/* Table of Requests */}
          {filteredDocuments.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-[#777770] mx-auto" />
              <h4 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">
                No matching requests found
              </h4>
              <p className="text-xs text-[#777770] max-w-sm mx-auto">
                No audit document submissions match the current status filter or search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F5EF] border-b-2 border-[#0A0A0A] text-[10px] font-mono font-bold uppercase text-[#777770]">
                    <th className="p-3.5">Document & Type</th>
                    <th className="p-3.5">Client Entity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Assigned Reviewer</th>
                    <th className="p-3.5">Date Submitted / Updated</th>
                    <th className="p-3.5 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  {filteredDocuments.map((doc) => {
                    const isApproved = doc.status === 'APPROVED';
                    const isSent = doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW';
                    const isCorrection = doc.status === 'CORRECTION_REQUIRED';

                    return (
                      <tr key={doc.id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 border border-[#0A0A0A] bg-[#F7F5EF] flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-3.5 h-3.5 text-[#0A0A0A]" />
                            </div>
                            <div>
                              <Link
                                href={`/documents/${doc.id}`}
                                className="font-bold text-[#0A0A0A] hover:text-[#E73520] hover:underline block leading-tight"
                              >
                                {doc.title}
                              </Link>
                              <span className="text-[10px] font-mono text-[#777770] uppercase">
                                {doc.document_type?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-[#0A0A0A] block">
                            {doc.client?.company_name || doc.client?.name || 'Client Org'}
                          </span>
                          <span className="text-[10px] text-[#777770]">
                            FY {doc.client?.financial_year || '2024-25'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <DocumentStatusBadge status={doc.status} size="sm" />
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-[#0A0A0A] text-white">
                            v{doc.current_version || 1}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-[#0A0A0A]">
                            {doc.assigned_auditor?.name || 'Unassigned Reviewer'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-[#777770]">
                          {new Date(doc.updated_at || doc.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>

                        <td className="p-3.5 text-right">
                          <Link
                            href={`/documents/${doc.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] border border-[#0A0A0A] font-mono text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[1px_1px_0_#0A0A0A]"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
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

        {/* Workspace Hub Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <Link
            href="/admin/clients"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Client Organizations
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              Add client companies, view GSTIN profiles, and assign lead engagement partners.
            </p>
          </Link>

          <Link
            href="/auditor/engagements"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Audit Engagements
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              View active statutory audits, tax audits, fieldwork progress, and multi-tier approvals.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Team & Users
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              Manage CA practice auditors, partner sign-off permissions, and client portal logins.
            </p>
          </Link>

          <Link
            href="/admin/workflows"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Workflow Templates
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              Configure Companies Act & Income Tax workflow stages and required checklists.
            </p>
          </Link>

          <Link
            href="/admin/documents"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Document Central
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              Browse submitted files across all clients with full version history and Section 143(3) logs.
            </p>
          </Link>

          <Link
            href="/admin/evaluation-tools"
            className="border-2 border-[#0A0A0A] bg-white p-6 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E73520]" />
                <span className="font-bold text-sm text-[#0A0A0A]">
                  Evaluation & State Reset
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#777770] group-hover:text-[#E73520] transition-colors" />
            </div>
            <p className="text-[#666660] font-sans text-xs">
              Reset database to zero state or re-seed sample audit transactions for grading.
            </p>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onClientCreated={() => loadData(false)}
      />

      <CreateUserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onUserCreated={() => loadData(false)}
      />

      <CreateEngagementModal
        isOpen={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        onEngagementCreated={() => loadData(false)}
      />
    </AppShell>
  );
}
