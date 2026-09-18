'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, ArrowUpRight, Clock, FileText } from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';

export default function ClientHistoryPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        if (res.ok) {
          setDocuments(data.documents || []);
          setCurrentUser(data.currentUser || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: '1',
          name: 'ABC Traders',
          email: 'client@demo.com',
          role: 'CLIENT',
          client_id: 'c1',
          created_at: '',
        }
      }
    >
      <div className="space-y-6">
        <div className="border-b border-[#E5E5E0] pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
            CLIENT WORKSPACE
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
            Audit History
          </h1>
          <p className="text-xs text-[#666660]">
            Chronological audit trail and historical status progression across all submitted engagement files.
          </p>
        </div>

        <div className="border border-[#E5E5E0] bg-white p-6 font-mono text-xs">
          <div className="space-y-8">
            {documents.map((doc) => (
              <div key={doc.id} className="border-b border-[#E5E5E0] pb-6 last:border-b-0 last:pb-0 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#111110]">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-[#777770]">
                      ({doc.file_name} · v{doc.current_version})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <DocumentStatusBadge status={doc.status} size="sm" />
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#111110] hover:text-[#E03E1A]"
                    >
                      <span>Full Trail</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-[#FAFAF8] border border-[#E5E5E0] p-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-[#777770]">
                    <span>STATUS: {doc.status}</span>
                    <span>LAST RECORDED: {new Date(doc.updated_at).toLocaleString('en-GB')}</span>
                  </div>
                  {doc.latest_review?.remarks && (
                    <p className="text-[#111110] font-sans">
                      Auditor Remarks: "{doc.latest_review.remarks}"
                    </p>
                  )}
                  {doc.latest_correction_reason && (
                    <p className="text-[#C2410C]">
                      Correction Required: "{doc.latest_correction_reason}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
