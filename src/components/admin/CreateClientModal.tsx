'use client';

import React, { useState } from 'react';
import { X, Building2, Plus, Loader2 } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: any) => void;
}

export function CreateClientModal({ isOpen, onClose, onClientCreated }: CreateClientModalProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [industry, setIndustry] = useState('Manufacturing & Trading');
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) {
      setError('Contact person name and legal company name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          companyName: companyName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          gstin: gstin.trim() || undefined,
          pan: pan.trim() || undefined,
          industry,
          financialYear,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      onClientCreated(data.client);
      onClose();
      // Reset form
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setGstin('');
      setPan('');
    } catch (err: any) {
      setError(err.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-[#0A0A0A]">
              Add Client Entity
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Company / Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Industrial Solutions Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="accounts@apex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                GSTIN
              </label>
              <input
                type="text"
                placeholder="27AAACA1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                PAN
              </label>
              <input
                type="text"
                placeholder="AAACA1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Financial Year
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
                Industry
              </label>
              <input
                type="text"
                placeholder="e.g. IT Services, Retail"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Phone / Mobile
              </label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Registered Office Address
              </label>
              <textarea
                rows={2}
                placeholder="Nariman Point, Mumbai 400021"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>
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
              disabled={loading}
              className="px-5 py-2 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-[#E73520] hover:border-[#E73520] transition-colors cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Client...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
