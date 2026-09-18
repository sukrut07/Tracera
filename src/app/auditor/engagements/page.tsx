'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  RefreshCw,
  FolderPlus,
  Briefcase,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Engagement, EngagementServiceType, EngagementStatus, UserProfile, Client } from '@/types';

export default function AuditorEngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for creating engagement
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newServiceType, setNewServiceType] = useState<EngagementServiceType>('STATUTORY_AUDIT');
  const [newFinancialYear, setNewFinancialYear] = useState('2025-26');
  const [newDueDate, setNewDueDate] = useState('2026-09-30');
  const [newBillingAmount, setNewBillingAmount] = useState('25000');
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchEngagements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/engagements');
      const data = await res.json();
      if (res.ok) {
        setEngagements(data.engagements || []);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (res.ok) {
        setClients(data.clients || []);
        if (data.clients?.length > 0) {
          setNewClientId(data.clients[0].id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchEngagements();
    fetchClients();
  }, [fetchEngagements]);

  const handleCreateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newTitle.trim()) {
      showToast('Client and title are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: newClientId,
          title: newTitle.trim(),
          serviceType: newServiceType,
          financialYear: newFinancialYear,
          dueDate: newDueDate,
          billingAmount: Number(newBillingAmount) || 25000,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Engagement initiated with service template!');
        setCreateModalOpen(false);
        setNewTitle('');
        await fetchEngagements();
      } else {
        showToast(data.error || 'Failed to create engagement');
      }
    } catch {
      showToast('Network error');
    } finally {
      setCreating(false);
    }
  };

  const filteredEngagements = engagements.filter((eng) => {
    if (statusFilter !== 'ALL' && eng.status !== statusFilter) return false;
    if (serviceFilter !== 'ALL' && eng.service_type !== serviceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = eng.title.toLowerCase().includes(q);
      const matchClient = eng.client?.name?.toLowerCase().includes(q) || eng.client?.company_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }
    return true;
  });

  const totalCount = engagements.length;
  const activeCount = engagements.filter((e) => e.status !== 'CLOSED').length;
  const closedCount = engagements.filter((e) => e.status === 'CLOSED').length;
  const readyCount = engagements.filter((e) => e.status === 'READY_TO_CLOSE').length;

  return (
    <AppShell>
      {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white px-5 py-3 shadow-[4px_4px_0px_#E73520] text-xs font-bold border-2 border-[#0A0A0A]">
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-[#0A0A0A] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest mb-1">Practice management</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Audit engagements
            </h1>
            <p className="text-xs text-[#666660] mt-1">
              Client audits, statutory progress gates, maker-checker sign-offs, and fee settlements.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] flex items-center gap-2 self-start md:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>INITIATE ENGAGEMENT</span>
          </button>
        </div>

        {/* Practice Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-4">
            <span className="text-[11px] font-mono text-[#777770] uppercase">TOTAL PORTFOLIO</span>
            <div className="text-2xl font-serif font-bold text-[#111110] mt-1">{totalCount}</div>
          </div>
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-4">
            <span className="text-[11px] font-mono text-[#777770] uppercase">ACTIVE FIELDWORK</span>
            <div className="text-2xl font-serif font-bold text-blue-700 mt-1">{activeCount}</div>
          </div>
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-4">
            <span className="text-[11px] font-mono text-[#777770] uppercase">READY TO CLOSE</span>
            <div className="text-2xl font-serif font-bold text-purple-700 mt-1">{readyCount}</div>
          </div>
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-4">
            <span className="text-[11px] font-mono text-[#777770] uppercase">FORMALLY SEALED</span>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">{closedCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E5E5E0] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A1A19A]" />
              <input
                type="text"
                placeholder="Search engagements or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[#E5E5E0] rounded text-xs text-[#111110] w-60 focus:outline-none focus:border-[#111110]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#E5E5E0] rounded px-2.5 py-1.5 text-[#111110] bg-white"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="PLANNING">PLANNING</option>
              <option value="DOCUMENT_COLLECTION">DOCUMENT COLLECTION</option>
              <option value="FIELDWORK">FIELDWORK</option>
              <option value="READY_TO_CLOSE">READY TO CLOSE</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="border border-[#E5E5E0] rounded px-2.5 py-1.5 text-[#111110] bg-white"
            >
              <option value="ALL">ALL TEMPLATES</option>
              <option value="STATUTORY_AUDIT">STATUTORY AUDIT</option>
              <option value="TAX_AUDIT">TAX AUDIT (SEC 44AB)</option>
              <option value="GST_COMPLIANCE">GST COMPLIANCE</option>
              <option value="ITR_FILING">ITR FILING</option>
            </select>
          </div>

          <div className="text-[#777770]">
            Showing {filteredEngagements.length} of {engagements.length} engagements
          </div>
        </div>

        {/* Engagements List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-[#111110] animate-spin" />
            <span className="text-xs font-mono text-[#777770]">LOADING PRACTICE ENGAGEMENTS...</span>
          </div>
        ) : filteredEngagements.length === 0 ? (
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-12 text-center">
            <Briefcase className="w-10 h-10 text-[#A1A19A] mx-auto mb-3" />
            <h3 className="font-serif font-bold text-base text-[#111110]">No Engagements Match Filter</h3>
            <p className="text-xs font-mono text-[#777770] mt-1">
              Adjust your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEngagements.map((eng) => {
              const isClosed = eng.status === 'CLOSED';
              return (
                <div
                  key={eng.id}
                  className="bg-white border border-[#E5E5E0] hover:border-[#BBBBB5] rounded-lg p-6 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 bg-[#F0F0EC] text-[#555550] rounded uppercase">
                        {eng.service_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[#A1A19A]">&bull;</span>
                      <span className="text-[#777770]">FY {eng.financial_year}</span>
                      <span className="text-[#A1A19A]">&bull;</span>
                      <span className="text-[#777770]">Client: {eng.client?.company_name || eng.client?.name}</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#111110] hover:text-[#333330]">
                      <Link href={`/engagements/${eng.id}`}>{eng.title}</Link>
                    </h3>

                    {/* Progress Bar & Stage Indicator */}
                    <div className="pt-2 max-w-lg space-y-1">
                      <div className="flex justify-between text-xs font-mono text-[#777770]">
                        <span>
                          Stage {eng.current_stage_index + 1} of {eng.total_stages}
                        </span>
                        <span className="font-semibold text-[#111110]">{eng.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-[#EEEEEC] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isClosed ? 'bg-emerald-600' : 'bg-[#111110]'}`}
                          style={{ width: `${eng.progress_percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#777770] pt-1">
                      <span>Lead: {eng.assigned_partner_name || 'Managing Partner'}</span>
                      <span>Due: {eng.due_date}</span>
                      <span>
                        Fee: ₹{eng.billing_total.toLocaleString('en-IN')} (
                        <strong className={eng.billing_status === 'PAID' ? 'text-emerald-700' : 'text-amber-800'}>
                          {eng.billing_status}
                        </strong>
                        )
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                        isClosed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : eng.status === 'READY_TO_CLOSE'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {eng.status.replace(/_/g, ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      {isClosed && (
                        <a
                          href={`/api/engagements/${eng.id}/report`}
                          download
                          className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800 flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>DOSSIER</span>
                        </a>
                      )}
                      <Link
                        href={`/engagements/${eng.id}`}
                        className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] flex items-center gap-1.5"
                      >
                        <span>AUDIT ROOM</span>
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

      {/* Modal: Initiate Engagement */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">
              Initiate New CA Audit Engagement
            </h3>
            <p className="text-xs text-[#777770] font-mono">
              Creates an engagement loaded with ICAI standard operational stages and evidence checklist.
            </p>

            <form onSubmit={handleCreateEngagement} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">CLIENT ENTITY:</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} &mdash; {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#777770] mb-1">ENGAGEMENT TITLE:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g. Statutory Audit · FY 2025–26"
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777770] mb-1">SERVICE TEMPLATE:</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as EngagementServiceType)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                  >
                    <option value="STATUTORY_AUDIT">Statutory Audit (10 Stages)</option>
                    <option value="TAX_AUDIT">Tax Audit Sec 44AB (8 Stages)</option>
                    <option value="GST_COMPLIANCE">GST Compliance & 9C (6 Stages)</option>
                    <option value="ITR_FILING">ITR Filing & Recon (5 Stages)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#777770] mb-1">FINANCIAL YEAR:</label>
                  <input
                    type="text"
                    value={newFinancialYear}
                    onChange={(e) => setNewFinancialYear(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777770] mb-1">STATUTORY DUE DATE:</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#777770] mb-1">BASE AUDIT FEE (₹):</label>
                  <input
                    type="number"
                    value={newBillingAmount}
                    onChange={(e) => setNewBillingAmount(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
                >
                  {creating ? 'INITIATING...' : 'INITIATE ENGAGEMENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
