'use client';

import React, { useState, useEffect } from 'react';
import { X, Briefcase, Plus, Loader2 } from 'lucide-react';
import { EngagementServiceType, Client, UserProfile } from '@/types';

interface CreateEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEngagementCreated: (engagement: any) => void;
  preselectedClientId?: string;
}

export function CreateEngagementModal({
  isOpen,
  onClose,
  onEngagementCreated,
  preselectedClientId,
}: CreateEngagementModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState<EngagementServiceType>('STATUTORY_AUDIT');
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [dueDate, setDueDate] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [billingAmount, setBillingAmount] = useState('25000');
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default due date to 3 months from now
  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setDueDate(d.toISOString().slice(0, 10));
  }, []);

  // Fetch clients & users when opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadOptions() {
      setFetchingOptions(true);
      try {
        const [clientsRes, usersRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/users'),
        ]);

        if (clientsRes.ok) {
          const cData = await clientsRes.json();
          setClients(cData.clients || []);
          if (!clientId && cData.clients?.length > 0) {
            setClientId(cData.clients[0].id);
          }
        }

        if (usersRes.ok) {
          const uData = await usersRes.json();
          const allUsers = uData.users || [];
          setUsers(allUsers);
          const defaultPartner = allUsers.find((u: UserProfile) => u.role === 'PARTNER');
          const defaultAuditor = allUsers.find((u: UserProfile) => u.role === 'AUDITOR');
          if (defaultPartner) setPartnerId(defaultPartner.id);
          if (defaultAuditor) setManagerId(defaultAuditor.id);
        }
      } catch (e) {
        console.error('Failed to load options:', e);
      } finally {
        setFetchingOptions(false);
      }
    }

    loadOptions();
  }, [isOpen]);

  // Auto-generate title when client or service type changes
  useEffect(() => {
    const selectedClient = clients.find((c) => c.id === clientId);
    const clientName = selectedClient ? (selectedClient.company_name || selectedClient.name) : '';
    const serviceName =
      serviceType === 'STATUTORY_AUDIT'
        ? 'Statutory Audit'
        : serviceType === 'TAX_AUDIT'
        ? 'Tax Audit (Sec 44AB)'
        : serviceType === 'GST_COMPLIANCE'
        ? 'GST Annual Compliance'
        : 'ITR Filing & Direct Tax';

    if (clientName) {
      setTitle(`${clientName} · FY ${financialYear} ${serviceName}`);
    }
  }, [clientId, serviceType, financialYear, clients]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select or create a client first');
      return;
    }
    if (!title.trim() || !dueDate) {
      setError('Title and due date are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          serviceType,
          financialYear,
          dueDate,
          partnerId: partnerId || undefined,
          managerId: managerId || undefined,
          billingAmount: billingAmount ? Number(billingAmount) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create engagement');
      }

      onEngagementCreated(data.engagement);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating engagement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-[#0A0A0A]">
              Create New Audit Engagement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F7F5EF] border border-transparent hover:border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#0A0A0A]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-[#E73520] text-[#E73520] font-bold">
              {error}
            </div>
          )}

          {clients.length === 0 && !fetchingOptions && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              Notice: No clients exist yet in your workspace. Please add a client first from the Clients section.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Select Client Entity *
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                {clients.length === 0 ? (
                  <option value="">No clients available</option>
                ) : (
                  clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || c.name} ({c.financial_year})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Engagement Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Service Type / Template *
              </label>
              <select
                value={serviceType}
                onChange={(e) => {
                  const st = e.target.value as EngagementServiceType;
                  setServiceType(st);
                  if (st === 'STATUTORY_AUDIT') setBillingAmount('25000');
                  else if (st === 'TAX_AUDIT') setBillingAmount('20000');
                  else if (st === 'GST_COMPLIANCE') setBillingAmount('15000');
                  else setBillingAmount('10000');
                }}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="STATUTORY_AUDIT">Statutory Audit (Companies Act 2013)</option>
                <option value="TAX_AUDIT">Tax Audit (Income Tax Sec 44AB)</option>
                <option value="GST_COMPLIANCE">GST Compliance & Reconciliation</option>
                <option value="ITR_FILING">ITR Filing & Direct Tax</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Financial Year *
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="2025-26">FY 2025–26</option>
                <option value="2024-25">FY 2024–25</option>
                <option value="2023-24">FY 2023–24</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Target Completion Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Professional Fee (₹ Base)
              </label>
              <input
                type="number"
                value={billingAmount}
                onChange={(e) => setBillingAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Lead Sign-off Partner
              </label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="">Select Partner...</option>
                {users
                  .filter((u) => u.role === 'PARTNER' || u.role === 'ADMIN')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Engagement Manager / Senior
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="">Select Auditor...</option>
                {users
                  .filter((u) => u.role === 'AUDITOR' || u.role === 'ADMIN')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="bg-[#FAFAF8] p-3 border border-[#E5E5E0] text-[10px] text-[#777770]">
            ⚡ Upon creation, TRACERA will automatically generate workflow stages, required statutory document checklist items, audit tasks, and audit history event.
          </div>

          <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || clients.length === 0}
              className="px-5 py-2 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-[#E73520] hover:border-[#E73520] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Workflow...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Initiate Engagement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
