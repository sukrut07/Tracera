'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FolderCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Engagement, UserProfile } from '@/types';

export default function ClientEngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/engagements');
      const data = await res.json();
      if (res.ok) {
        setEngagements(data.engagements || []);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error('Failed to load client engagements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, []);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-6 font-sans">
        {/* Header */}
        <div className="border-b-[3px] border-[#0A0A0A] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E73520] block mb-1">
              CLIENT WORKSPACE · ENGAGEMENTS
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] font-sans">
              My Engagements & Audit Dossiers
            </h1>
            <p className="text-xs text-[#555550] mt-1">
              Active statutory audits, compliance reviews, and certified closure dossiers for your firm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEngagements}
              title="Refresh engagements"
              className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="neo-box px-3.5 py-1.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] flex items-center gap-2 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E73520]" />
              <span>Active Engagements: {engagements.length}</span>
            </div>
          </div>
        </div>

        {/* Guidance Block */}
        <div className="neo-box p-5 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] flex items-start gap-4">
          <div className="w-9 h-9 bg-[#F7F5EF] border-2 border-[#0A0A0A] text-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#E73520] shrink-0">
            <Sparkles className="w-4 h-4 text-[#E73520]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              How Audit Engagements Work
            </h4>
            <p className="text-xs text-[#555550] leading-relaxed">
              Your CA firm manages your audit through sequential operational stages. You can monitor progress, upload
              requested evidence checklist items, track fieldwork procedures, and download the official signed CA Engagement
              Closure Certificate upon completion.
            </p>
          </div>
        </div>

        {/* Engagements List / Empty State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs font-bold text-[#555550]">
            <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
            <span>Loading audit dossiers...</span>
          </div>
        ) : engagements.length === 0 ? (
          <div className="neo-box-lg bg-white border-2 border-[#0A0A0A] p-12 text-center shadow-[6px_6px_0_#0A0A0A] space-y-3">
            <div className="w-12 h-12 bg-[#F7F5EF] border-2 border-[#0A0A0A] flex items-center justify-center mx-auto shadow-[2px_2px_0_#0A0A0A]">
              <FolderCheck className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A] font-sans">
              No Active Engagements
            </h3>
            <p className="text-xs text-[#666660] max-w-md mx-auto leading-relaxed">
              Your CA practice has not initiated any engagements for this financial year yet. When launched by your firm, active milestones and document requests will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {engagements.map((eng) => {
              const isClosed = eng.status === 'CLOSED';
              return (
                <div
                  key={eng.id}
                  className="neo-box bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] p-6 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#0A0A0A] pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-[#E73520] uppercase tracking-wider">
                          {eng.service_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[#0A0A0A]">•</span>
                        <span className="text-[11px] font-bold text-[#555550]">FY {eng.financial_year}</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#0A0A0A] hover:text-[#E73520] transition-colors">
                        <Link href={`/engagements/${eng.id}`}>{eng.title}</Link>
                      </h2>
                    </div>

                    <div>
                      <StatusBadge status={eng.status} />
                    </div>
                  </div>

                  {/* Progress & Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#555550] mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#777770] block">
                        LEAD CA PARTNER:
                      </span>
                      <strong className="text-[#0A0A0A] text-xs font-bold block mt-0.5">
                        {eng.assigned_partner_name || 'Assigned Partner'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#777770] block">
                        AUDIT MANAGER:
                      </span>
                      <strong className="text-[#0A0A0A] text-xs font-bold block mt-0.5">
                        {eng.assigned_manager_name || 'Practice Manager'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#777770] block">
                        STATUTORY DUE DATE:
                      </span>
                      <strong className="text-[#E73520] text-xs font-bold block mt-0.5">
                        {eng.due_date}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#777770] block">
                        FEE SETTLEMENT:
                      </span>
                      <strong
                        className={`text-xs font-bold block mt-0.5 ${
                          eng.billing_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        ₹{eng.billing_total.toLocaleString('en-IN')} ({eng.billing_status})
                      </strong>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-3 border-t-2 border-[#0A0A0A]/10">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#555550]">
                        Stage {eng.current_stage_index + 1} of {eng.total_stages}
                      </span>
                      <span className="text-[#0A0A0A]">{eng.progress_percent}% Complete</span>
                    </div>
                    <div className="w-full bg-[#F7F5EF] border-2 border-[#0A0A0A] h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${isClosed ? 'bg-[#C7F36B]' : 'bg-[#0A0A0A]'}`}
                        style={{ width: `${eng.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-5 pt-4 border-t-2 border-[#0A0A0A]/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#555550]">
                      {isClosed ? (
                        <span className="text-emerald-800 font-bold">
                          Closure ID: {eng.closure_id} • Signed Certificate Available
                        </span>
                      ) : (
                        <span>Next Step: Submit pending document requests</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isClosed && (
                        <a
                          href={`/api/engagements/${eng.id}/report`}
                          download
                          className="neo-btn bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>CLOSURE DOSSIER PDF</span>
                        </a>
                      )}
                      <Link
                        href={`/engagements/${eng.id}`}
                        className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                      >
                        <span>OPEN AUDIT ROOM</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
