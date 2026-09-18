'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

interface Engagement {
  id: string;
  title: string;
  status: string;
  service_type: string;
  due_date?: string;
  billing_total?: number;
  billing_status?: string;
  client?: { company_name?: string; name?: string };
  approvals?: { role_gate: string; status: string }[];
}

export default function PartnerDashboardPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/engagements');
        if (res.ok) {
          const data = await res.json();
          setEngagements(data.engagements || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingApprovals = engagements.filter(
    (e) =>
      e.status === 'READY_TO_CLOSE' ||
      e.status === 'PARTNER_REVIEW' ||
      e.approvals?.some((a) => a.role_gate === 'PARTNER' && a.status === 'PENDING')
  );

  const totalEngagements = engagements.length;
  const inFieldwork = engagements.filter(
    (e) => e.status === 'FIELDWORK' || e.status === 'IN_REVIEW' || e.status === 'DOCUMENT_COLLECTION'
  ).length;
  const totalSettledBilling = engagements
    .filter((e) => e.billing_status === 'PAID')
    .reduce((sum, e) => sum + (e.billing_total || 0), 0);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-2 border-[#0A0A0A]">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest mb-1">
              Partner Oversight
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Approval desk
            </h1>
            <p className="text-xs text-[#666660] mt-1">
              Statutory audit sign-off · Maker-checker gate 3 · Practice governance
            </p>
          </div>
          <Link
            href="/auditor/engagements"
            className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] flex items-center gap-2"
          >
            All engagements
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-2 border-[#0A0A0A] bg-white divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              Total engagements
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : totalEngagements}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Practice portfolio
            </span>
          </div>

          <div className="p-5 bg-[#FFF2F0]">
            <span className="text-[10px] uppercase tracking-widest text-[#E73520] font-bold block">
              Sign-off pending
            </span>
            <span className="text-3xl font-bold text-[#E73520] block mt-1">
              {loading ? '—' : pendingApprovals.length}
            </span>
            <span className="text-[10px] text-[#0A0A0A] block mt-1">
              Awaiting approval
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              In fieldwork
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : inFieldwork}
            </span>
            <span className="text-[10px] text-[#777770] block mt-1">
              Active engagements
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              Settled billing
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              ₹{loading ? '—' : totalSettledBilling.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-1">
              Receipts confirmed
            </span>
          </div>
        </div>

        {/* Approvals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E73520] border border-[#0A0A0A] inline-block" />
              Engagements requiring approval
            </h2>
            <span className="text-[10px] text-[#777770] font-bold uppercase">
              Gate 3 · Partner sign-off
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-[#777770]" />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="border-2 border-dashed border-[#0A0A0A] bg-white p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-[#777770] mx-auto mb-3" />
              <h3 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-wider">
                No pending sign-offs
              </h3>
              <p className="text-xs text-[#666660] mt-1 mb-6 max-w-sm mx-auto">
                All engagements are in fieldwork, planning, or already signed off.
              </p>
              <Link
                href="/auditor/engagements"
                className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] inline-flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                View all engagements
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((eng) => (
                <div
                  key={eng.id}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E5E5E0]">
                    <div>
                      <span className="text-[10px] font-bold bg-[#0A0A0A] text-white px-2 py-0.5 inline-block mb-1 uppercase tracking-wider">
                        {eng.service_type.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-xl font-bold text-[#0A0A0A] mt-1">
                        {eng.title}
                      </h3>
                      <p className="text-xs text-[#777770] mt-0.5">
                        Due: {eng.due_date || '—'} · Client:{' '}
                        {eng.client?.company_name || eng.client?.name || '—'}
                      </p>
                    </div>
                    <span className="bg-[#FFD23F] text-[#0A0A0A] px-3 py-1 text-xs font-bold border-2 border-[#0A0A0A]">
                      {eng.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                    <p className="text-xs text-[#4A4A48]">
                      Fee: ₹{eng.billing_total?.toLocaleString('en-IN') || '0'} · Billing:{' '}
                      {eng.billing_status || '—'}
                    </p>
                    <Link
                      href={`/engagements/${eng.id}`}
                      className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#0A0A0A] transition-colors"
                    >
                      Open audit room & sign off
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
