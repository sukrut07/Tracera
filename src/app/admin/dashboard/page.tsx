'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Sliders,
  CheckCircle2,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardStats, UserProfile } from '@/types';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const adminUser: UserProfile = {
    id: 'admin-1',
    name: 'Admin (Partner)',
    email: 'admin@demo.com',
    role: 'ADMIN',
    client_id: null,
    created_at: '',
  };

  return (
    <AppShell currentUser={adminUser}>
      <div className="space-y-8">
        <div className="border-b border-[#E5E5E0] pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
            PARTNER & PRACTICE MANAGEMENT
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#111110]">
            Firm Overview
          </h1>
          <p className="text-xs text-[#666660]">
            Audit practice engagement metrics, client entity status, and compliance governance.
          </p>
        </div>

        {/* Minimal horizontal metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E5E5E0] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0] font-mono">
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              ENGAGEMENT CLIENTS
            </span>
            <span className="text-3xl font-bold text-[#111110] block mt-1">1</span>
            <span className="text-[10px] text-[#777770] block mt-0.5">ABC Traders Pvt Ltd</span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              TOTAL AUDIT FILES
            </span>
            <span className="text-3xl font-bold text-[#111110] block mt-1">
              {stats?.total_documents ?? 0}
            </span>
            <span className="text-[10px] text-[#777770] block mt-0.5">Across all versions</span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              PENDING CORRECTIONS
            </span>
            <span className="text-3xl font-bold text-[#C2410C] block mt-1">
              {stats?.corrections_required ?? 0}
            </span>
            <span className="text-[10px] text-[#C2410C] block mt-0.5">With clients</span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] block">
              APPROVED AUDITS
            </span>
            <span className="text-3xl font-bold text-emerald-800 block mt-1">
              {stats?.approved_total ?? 0}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Statutory certified</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <Link
            href="/admin/evaluation-tools"
            className="border border-[#E5E5E0] bg-white p-6 hover:border-[#111110] transition-colors space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111110] text-sm font-sans">
                Evaluation Tools & Fixtures
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#E03E1A]" />
            </div>
            <p className="text-[#666660] font-sans">
              Inject synthetic bank statements, purchase registers, and test state machine resets.
            </p>
          </Link>

          <Link
            href="/admin/clients"
            className="border border-[#E5E5E0] bg-white p-6 hover:border-[#111110] transition-colors space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111110] text-sm font-sans">
                Client Organizations
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#111110]" />
            </div>
            <p className="text-[#666660] font-sans">
              Inspect multi-tenant entity access and assigned Chartered Accountants.
            </p>
          </Link>

          <Link
            href="/admin/documents"
            className="border border-[#E5E5E0] bg-white p-6 hover:border-[#111110] transition-colors space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111110] text-sm font-sans">
                Firm-Wide Documents
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#111110]" />
            </div>
            <p className="text-[#666660] font-sans">
              Global document search, status filters, and Section 143(3) logs.
            </p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
