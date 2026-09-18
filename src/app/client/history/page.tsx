'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, History, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AuditDocument, UserProfile } from '@/types';

export default function ClientHistoryPage() {
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
        setCurrentUser(data.currentUser || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: 'usr-client-001',
          name: 'Client User',
          email: 'client@demo.com',
          role: 'CLIENT',
          client_id: null,
          created_at: '',
        }
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        <div className="border-b-[3px] border-[#0A0A0A] pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E73520] block mb-1">
              CLIENT WORKSPACE · AUDIT TRAIL
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Audit History
            </h1>
            <p className="text-xs text-[#555550] mt-1">
              Chronological audit trail and historical status progression across all submitted engagement files.
            </p>
          </div>

          <button
            onClick={loadData}
            title="Refresh history"
            className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs font-bold text-[#555550]">
            <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
            <span>Loading audit history...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="neo-box-lg bg-white border-2 border-[#0A0A0A] p-12 text-center space-y-3 shadow-[6px_6px_0_#0A0A0A]">
            <div className="w-12 h-12 bg-[#F7F5EF] border-2 border-[#0A0A0A] text-[#0A0A0A] flex items-center justify-center mx-auto shadow-[2px_2px_0_#0A0A0A]">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0A0A0A]">
              No Audit Events Recorded Yet
            </h3>
            <p className="text-xs text-[#666660] max-w-sm mx-auto leading-relaxed">
              When documents are uploaded and reviewed by your Chartered Accountant, chronological audit logs and version history will appear here.
            </p>
          </div>
        ) : (
          <div className="neo-box bg-white border-2 border-[#0A0A0A] p-6 sm:p-7 shadow-[4px_4px_0_#0A0A0A]">
            <div className="space-y-6">
              {documents.map((doc) => (
                <div key={doc.id} className="border-b-2 border-[#0A0A0A]/10 pb-6 last:border-b-0 last:pb-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#0A0A0A]">
                        {doc.title}
                      </span>
                      <span className="text-xs text-[#777770]">
                        ({doc.file_name} • v{doc.current_version})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={doc.status} size="sm" />
                      <Link
                        href={`/client/documents/${doc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0A0A0A] hover:text-[#E73520] hover:underline"
                      >
                        <span>Full Trail</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="bg-[#F7F5EF] border-2 border-[#0A0A0A] p-3.5 text-xs space-y-1.5 shadow-[2px_2px_0_#0A0A0A]">
                    <div className="flex flex-wrap justify-between text-[#555550] text-[11px] font-medium">
                      <span>STATUS: <strong className="text-[#0A0A0A]">{doc.status.replace(/_/g, ' ')}</strong></span>
                      <span>LAST RECORDED: {new Date(doc.updated_at).toLocaleString('en-GB')}</span>
                    </div>
                    {doc.latest_review?.remarks && (
                      <p className="text-[#0A0A0A] font-medium bg-white p-2 border border-[#0A0A0A]/20 mt-1">
                        Auditor Remarks: "{doc.latest_review.remarks}"
                      </p>
                    )}
                    {doc.latest_correction_reason && (
                      <p className="text-[#E73520] font-semibold bg-[#FFF2F0] p-2 border border-[#E73520] mt-1">
                        Correction Required: "{doc.latest_correction_reason}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
