'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Loader2, Users, FileText, Briefcase } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateClientModal } from '@/components/admin/CreateClientModal';
import { Client, UserProfile } from '@/types';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
        if (data.currentUser) setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <AppShell currentUser={currentUser || undefined}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b-2 border-[#0A0A0A] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest block mb-1">
              Practice directory
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Client organizations
            </h1>
            <p className="text-xs text-[#666660]">
              Audited entities, compliance profiles, and assigned engagement teams.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add client</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="border border-[#E5E5E0] bg-white p-12 text-center font-mono text-xs text-[#777770] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
            <span>Loading client directory...</span>
          </div>
        ) : clients.length === 0 ? (
          /* Empty State */
          <div className="border-2 border-dashed border-[#0A0A0A] bg-white p-12 text-center font-mono">
            <Building2 className="w-10 h-10 text-[#777770] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-wider">
              No clients yet
            </h3>
            <p className="text-xs text-[#666660] mt-1 mb-6 max-w-sm mx-auto">
              Create your first client organization to initiate audit workflows, document requests, and statutory engagements.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] inline-flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0A0A0A]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Client</span>
            </button>
          </div>
        ) : (
          /* Table of real clients */
          <div className="border-2 border-[#0A0A0A] bg-white overflow-x-auto font-mono text-xs shadow-[4px_4px_0px_#0A0A0A]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0A0A0A] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                  <th className="py-3 px-4 font-bold">Client Entity</th>
                  <th className="py-3 px-4 font-bold">Contact Person</th>
                  <th className="py-3 px-4 font-bold">GSTIN / PAN</th>
                  <th className="py-3 px-4 font-bold">Financial Year</th>
                  <th className="py-3 px-4 font-bold text-center">Engagements</th>
                  <th className="py-3 px-4 font-bold text-center">Documents</th>
                  <th className="py-3 px-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0A0A0A]">{c.company_name || c.name}</div>
                      {c.industry && (
                        <span className="text-[10px] text-[#777770] block">{c.industry}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      <div>{c.name}</div>
                      {c.email && (
                        <div className="text-[10px] text-[#777770]">{c.email}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      <div>{c.gstin || '—'}</div>
                      {c.pan && <div className="text-[10px] text-[#777770]">{c.pan}</div>}
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      FY {c.financial_year}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A0A0A]">
                      {c.engagement_count ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A0A0A]">
                      {c.document_count ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] uppercase font-bold">
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientCreated={() => fetchClients()}
      />
    </AppShell>
  );
}
