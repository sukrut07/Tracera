'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Eye, ArrowUpRight } from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AppShell } from '@/components/layout/AppShell';

export default function AuditorReviewsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        if (res.ok) {
          // Filter to items needing auditor action (SUBMITTED or UNDER_REVIEW)
          const reviewList = (data.documents || []).filter(
            (d: AuditDocument) => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW'
          );
          setDocuments(reviewList);
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
          id: '2',
          name: 'Rahul Sharma',
          email: 'auditor@demo.com',
          role: 'AUDITOR',
          client_id: null,
          created_at: '',
        }
      }
    >
      <div className="space-y-6">
        <div className="border-b border-[#E5E5E0] pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
            AUDITOR OPERATIONS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
            Active Review Queue
          </h1>
          <p className="text-xs text-[#666660]">
            Submissions currently waiting for auditor examination and statutory verification.
          </p>
        </div>

        <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                <th className="py-3 px-4 font-bold">Client</th>
                <th className="py-3 px-4 font-bold">Document</th>
                <th className="py-3 px-4 font-bold">Version</th>
                <th className="py-3 px-4 font-bold">Current State</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#777770]">
                    Review queue is clear. No documents pending review.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111110]">
                      {doc.client?.name || 'ABC Traders Pvt Ltd'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/auditor/documents/${doc.id}`}
                        className="font-bold text-[#111110] hover:underline block truncate max-w-xs font-sans"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-[#777770]">{doc.file_name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#111110]">
                      v{doc.current_version}
                    </td>
                    <td className="py-3.5 px-4">
                      <DocumentStatusBadge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/auditor/documents/${doc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] text-white hover:bg-[#2A2A28] text-xs uppercase font-bold"
                      >
                        <span>Open Review</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
