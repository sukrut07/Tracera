'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        if (res.ok) {
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
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
      <div className="space-y-6">
        <div className="border-b border-[#E5E5E0] pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
            FIRM COMPLIANCE REPOSITORY
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
            Firm-Wide Documents
          </h1>
          <p className="text-xs text-[#666660]">
            Master document index across all engagements, versions, and review states.
          </p>
        </div>

        <div className="border border-[#E5E5E0] bg-white overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                <th className="py-3 px-4 font-bold">Client</th>
                <th className="py-3 px-4 font-bold">Document</th>
                <th className="py-3 px-4 font-bold">Version</th>
                <th className="py-3 px-4 font-bold">Current State</th>
                <th className="py-3 px-4 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FAFAF8]">
                  <td className="py-3.5 px-4 font-bold text-[#111110]">
                    {doc.client?.name || 'ABC Traders Pvt Ltd'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#111110] block font-sans">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-[#777770]">{doc.file_name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    v{doc.current_version}
                  </td>
                  <td className="py-3.5 px-4">
                    <DocumentStatusBadge status={doc.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/auditor/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#111110] hover:text-[#E03E1A]"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
