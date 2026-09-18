'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
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
    <AppShell currentUser={currentUser || undefined}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#0A0A0A] pb-6">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest block mb-1">
              Client workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              All documents
            </h1>
            <p className="text-xs text-[#666660] mt-1">
              Comprehensive repository of engagement audit files and preserved versions.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload document</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777770]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or file name..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#0A0A0A] text-xs text-[#0A0A0A] placeholder-[#999990] focus:outline-none focus:border-[#E73520] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#777770]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border-2 border-[#0A0A0A] px-3 py-2.5 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none"
            >
              <option value="ALL">All types</option>
              <option value="PURCHASE_REGISTER">Purchase register</option>
              <option value="BANK_STATEMENT">Bank statement</option>
              <option value="TAX_INVOICE">Tax invoice</option>
              <option value="TAX_RETURN">Tax return (GST)</option>
              <option value="TDS_CERTIFICATE">TDS certificate</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border-2 border-[#0A0A0A] bg-white overflow-x-auto shadow-[4px_4px_0px_#0A0A0A]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#0A0A0A] bg-[#F7F5EF] text-[10px] uppercase tracking-widest text-[#777770]">
                <th className="py-3 px-4 font-bold">Document</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Version</th>
                <th className="py-3 px-4 font-bold">Current state</th>
                <th className="py-3 px-4 font-bold">Submitted</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0A0A0A] mx-auto" />
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileText className="w-8 h-8 text-[#777770] mx-auto mb-3" />
                    <p className="text-sm font-bold text-[#0A0A0A]">
                      {searchQuery || typeFilter !== 'ALL' ? 'No documents match your filters' : 'No documents uploaded yet'}
                    </p>
                    <p className="text-xs text-[#777770] mt-1">
                      {searchQuery || typeFilter !== 'ALL'
                        ? 'Try adjusting your search or filter.'
                        : 'Upload your first document to get started.'}
                    </p>
                    {!searchQuery && typeFilter === 'ALL' && (
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Upload document
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/client/documents/${doc.id}`}
                        className="font-bold text-[#0A0A0A] hover:text-[#E73520] block truncate max-w-sm transition-colors"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-[#777770] block mt-0.5">
                        {doc.file_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#E5E5E0] text-[10px] uppercase font-bold tracking-wider text-[#4A4A48]">
                        {doc.document_type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#0A0A0A]">
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
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A0A0A] hover:text-[#E73520] transition-colors"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
