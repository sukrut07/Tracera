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
      <div className="max-w-7xl mx-auto px-8 py-8 w-full space-y-6">
        {/* Header */}
        <div className="border-b border-[#E5E5E0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-[#777770] uppercase mb-1">CLIENT WORKSPACE</div>
            <h1 className="text-2xl font-serif font-bold text-[#111110]">
              My Engagements & Audit Dossiers
            </h1>
            <p className="text-xs font-mono text-[#777770] mt-1">
              Active statutory audits, compliance reviews, and certified closure dossiers for your firm.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 bg-white border border-[#E5E5E0] rounded text-[#555550]">
              Active Engagements: <strong>{engagements.length}</strong>
            </span>
          </div>
        </div>

        {/* Guidance Block */}
        <div className="bg-[#F8F9FA] border border-[#E5E5E0] rounded-lg p-5 flex items-start gap-4">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase text-[#111110]">
              HOW YOUR AUDIT ENGAGEMENT WORKS
            </h4>
            <p className="text-xs text-[#555550] leading-relaxed">
              Your CA firm manages your audit through sequential operational stages. You can monitor progress, upload
              requested evidence checklist items, track fieldwork procedures, and download the official signed CA Engagement
              Closure Certificate upon completion.
            </p>
          </div>
        </div>

        {/* Engagements List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-[#111110] animate-spin" />
            <span className="text-xs font-mono text-[#777770]">LOADING AUDIT DOSSIERS...</span>
          </div>
        ) : engagements.length === 0 ? (
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-12 text-center">
            <FolderCheck className="w-10 h-10 text-[#A1A19A] mx-auto mb-3" />
            <h3 className="font-serif font-bold text-base text-[#111110]">No Active Engagements</h3>
            <p className="text-xs font-mono text-[#777770] mt-1">
              Your CA practice has not initiated any engagements for this financial year yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {engagements.map((eng) => {
              const isClosed = eng.status === 'CLOSED';
              return (
                <div
                  key={eng.id}
                  className="bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] rounded-lg p-6 transition-all shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F0EC] pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[#777770] uppercase">
                          {eng.service_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[#A1A19A]">&bull;</span>
                        <span className="font-mono text-xs text-[#777770]">FY {eng.financial_year}</span>
                      </div>
                      <h2 className="text-lg font-serif font-bold text-[#111110] hover:text-[#333330]">
                        <Link href={`/engagements/${eng.id}`}>{eng.title}</Link>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {eng.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress & Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono text-[#555550] mb-4">
                    <div>
                      <span className="text-[#888880] block">LEAD CA PARTNER:</span>
                      <strong className="text-[#111110]">{eng.assigned_partner_name || 'Rahul Sharma, FCA'}</strong>
                    </div>
                    <div>
                      <span className="text-[#888880] block">AUDIT MANAGER:</span>
                      <strong className="text-[#111110]">{eng.assigned_manager_name || 'Practice Manager'}</strong>
                    </div>
                    <div>
                      <span className="text-[#888880] block">STATUTORY DUE DATE:</span>
                      <strong className="text-rose-700">{eng.due_date}</strong>
                    </div>
                    <div>
                      <span className="text-[#888880] block">FEE SETTLEMENT:</span>
                      <strong className={eng.billing_status === 'PAID' ? 'text-emerald-700' : 'text-amber-800'}>
                        ₹{eng.billing_total.toLocaleString('en-IN')} ({eng.billing_status})
                      </strong>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-2 border-t border-[#F0F0EC]">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#777770]">
                        Stage {eng.current_stage_index + 1} of {eng.total_stages}
                      </span>
                      <span className="font-bold text-[#111110]">{eng.progress_percent}% Complete</span>
                    </div>
                    <div className="w-full bg-[#EEEEEC] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isClosed ? 'bg-emerald-600' : 'bg-[#111110]'}`}
                        style={{ width: `${eng.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-5 pt-4 border-t border-[#F0F0EC] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-mono text-[#777770]">
                      {isClosed ? (
                        <span className="text-emerald-700 font-semibold">
                          Closure ID: {eng.closure_id} &bull; Archive Available
                        </span>
                      ) : (
                        <span>Next Step: Upload pending checklist evidence items</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isClosed && (
                        <a
                          href={`/api/engagements/${eng.id}/report`}
                          download
                          className="px-3.5 py-1.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>CLOSURE DOSSIER PDF</span>
                        </a>
                      )}
                      <Link
                        href={`/engagements/${eng.id}`}
                        className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] transition-colors flex items-center gap-1.5"
                      >
                        <span>OPEN AUDIT ROOM WORKSPACE</span>
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
