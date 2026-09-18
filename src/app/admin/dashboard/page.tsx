'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateClientModal } from '@/components/admin/CreateClientModal';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { CreateEngagementModal } from '@/components/engagements/CreateEngagementModal';
import { UserProfile, DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [engagementsCount, setEngagementsCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, clientsRes, engsRes, usersRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/clients'),
        fetch('/api/engagements'),
        fetch('/api/users'),
      ]);

      if (docsRes.ok) {
        const d = await docsRes.json();
        setStats(d.stats || null);
        if (d.currentUser) setCurrentUser(d.currentUser);
      }
      if (clientsRes.ok) {
        const c = await clientsRes.json();
        setClientsCount(c.clients?.length || 0);
      }
      if (engsRes.ok) {
        const e = await engsRes.json();
        setEngagementsCount(e.engagements?.length || 0);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersCount(u.users?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell currentUser={currentUser || undefined}>
      <div className="space-y-8">
        {/* Header with Global Create Buttons */}
        <div className="border-b border-[#E5E5E0] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
              PRACTICE ADMINISTRATION
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Firm Overview & Workspace
            </h1>
            <p className="text-xs text-[#666660]">
              Audit practice operations, multi-entity client management, and team governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setClientModalOpen(true)}
              className="px-3.5 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Client</span>
            </button>
            <button
              onClick={() => setUserModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add User</span>
            </button>
            <button
              onClick={() => setEngagementModalOpen(true)}
              className="px-3.5 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] flex items-center gap-1.5 cursor-pointer"
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

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              ENGAGEMENTS
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : engagementsCount}
            </span>
            <Link
              href="/auditor/engagements"
              className="text-[10px] text-[#E73520] hover:underline font-bold block mt-1"
            >
              Audit room →
            </Link>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              AUDIT DOCUMENTS
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : (stats?.total_documents ?? 0)}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Approved: {stats?.approved_total ?? 0}
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              CORRECTIONS OPEN
            </span>
            <span className="text-3xl font-bold text-[#C2410C] block mt-1">
              {loading ? '—' : (stats?.corrections_required ?? 0)}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Under Review: {stats?.under_review ?? 0}
            </span>
          </div>

          <div className="p-5 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              PRACTICE USERS
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : usersCount}
            </span>
            <Link
              href="/admin/users"
              className="text-[10px] text-[#E73520] hover:underline font-bold block mt-1"
            >
              Manage users →
            </Link>
          </div>
        </div>

        {/* Empty State Banner if no clients or engagements yet */}
        {!loading && clientsCount === 0 && (
          <div className="border-2 border-dashed border-[#0A0A0A] bg-white p-8 text-center font-mono">
            <Building2 className="w-8 h-8 text-[#777770] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-wider">
              Workspace Initialized · Zero Records
            </h3>
            <p className="text-xs text-[#666660] mt-1 mb-4 max-w-md mx-auto">
              Your TRACERA practice is ready. Create a client and initiate your first statutory or tax engagement to begin the end-to-end workflow.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setClientModalOpen(true)}
                className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase transition-colors border-2 border-[#0A0A0A] cursor-pointer"
              >
                + Add Client
              </button>
              <button
                onClick={() => setEngagementModalOpen(true)}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-[#0A0A0A] text-xs font-bold uppercase transition-colors border-2 border-[#0A0A0A] cursor-pointer"
              >
                + Create Engagement
              </button>
            </div>
          </div>
        )}

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
        onClientCreated={() => loadData()}
      />

      <CreateUserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onUserCreated={() => loadData()}
      />

      <CreateEngagementModal
        isOpen={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        onEngagementCreated={() => loadData()}
      />
    </AppShell>
  );
}
