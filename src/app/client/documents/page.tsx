'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { UploadDocumentModal } from '@/components/client/UploadDocumentModal';
import { AppShell } from '@/components/layout/AppShell';

export default function ClientDocumentsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.file_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

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
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E5E0] pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
              CLIENT WORKSPACE
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
              All Documents
            </h1>
            <p className="text-xs text-[#666660]">
              Comprehensive repository of engagement audit files and preserved versions.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs font-mono uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777770]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title or file name..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E5E0] text-xs text-[#111110] focus:outline-none focus:border-[#111110]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#777770] uppercase">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E5E5E0] text-xs text-[#111110] focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="PURCHASE_REGISTER">Purchase Register</option>
              <option value="BANK_STATEMENT">Bank Statement</option>
              <option value="TAX_INVOICE">Tax Invoice</option>
              <option value="TAX_RETURN">Tax Return (GST)</option>
              <option value="TDS_CERTIFICATE">TDS Certificate</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#E5E5E0] bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] font-mono uppercase tracking-widest text-[#777770]">
                <th className="py-3 px-4 font-bold">Document</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Version</th>
                <th className="py-3 px-4 font-bold">Current State</th>
                <th className="py-3 px-4 font-bold">Submitted Date</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0] text-xs font-mono">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="font-bold text-[#111110] hover:underline block truncate max-w-sm font-sans"
                    >
                      {doc.title}
                    </Link>
                    <span className="text-[10px] text-[#777770]">
                      {doc.file_name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[#555550]">
                    <span className="px-2 py-0.5 bg-[#F2F2EE] border border-[#E5E5E0] text-[10px] uppercase">
                      {doc.document_type.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#111110]">
                    v{doc.current_version}
                  </td>

                  <td className="py-3.5 px-4">
                    <DocumentStatusBadge status={doc.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-[#555550]">
                    {new Date(doc.created_at).toLocaleDateString('en-GB')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111110] hover:text-[#E03E1A]"
                    >
                      <span>Open document</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isUploadOpen && (
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false);
            fetchDocs();
          }}
        />
      )}
    </AppShell>
  );
}
