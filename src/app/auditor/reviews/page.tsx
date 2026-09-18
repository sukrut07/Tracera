'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Eye, ArrowRight, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorReviewsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch('/api/documents');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (res.ok) {
        const reviewList = (data.documents || []).filter(
          (d: AuditDocument) => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW'
        );
        setDocuments(reviewList);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const timer = setInterval(() => loadData(false), 5000);
    const onFocus = () => loadData(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadData]);

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-2 text-[#4A4A48] font-sans text-xs">
          <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin" />
          <span className="font-bold">Loading review queue...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <AppShell currentUser={currentUser}>
      <div className="space-y-6 font-sans">
        <div className="border-b-[3px] border-[#0A0A0A] pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#E73520] font-black block mb-1">
              AUDITOR OPERATIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] font-sans">
              Active Review Queue
            </h1>
            <p className="text-xs text-[#555555] mt-1 font-medium">
              Submissions currently waiting for auditor examination and statutory verification.
            </p>
          </div>

          <button
            onClick={() => loadData(false)}
            title="Refresh review queue"
            className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="neo-box-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b-2 border-[#0A0A0A] bg-[#F7F5EF] text-[11px] uppercase font-semibold tracking-[0.04em] text-[#111111]">
                  <th className="py-3 px-4">CLIENT</th>
                  <th className="py-3 px-4">DOCUMENT</th>
                  <th className="py-3 px-4">VERSION</th>
                  <th className="py-3 px-4">CURRENT STATE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#0A0A0A]">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#555555]">
                      Review queue is clear. No documents pending review.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F7F5EF] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0A0A0A]">
                        {doc.client?.company_name || doc.client?.name || 'Client'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/auditor/documents/${doc.id}`}
                          className="font-bold text-[#0A0A0A] hover:text-[#E73520] hover:underline block truncate max-w-xs"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-[10px] text-[#555555]">{doc.file_name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0A0A0A]">
                        v{doc.current_version}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/auditor/documents/${doc.id}`}
                          className="neo-btn bg-[#0A0A0A] text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5"
                        >
                          <span>REVIEW</span>
                          <ArrowRight className="w-3 h-3 text-[#E73520]" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
