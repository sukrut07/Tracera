'use client';

import React, { useState } from 'react';
import { X, UserPlus, Plus, Loader2 } from 'lucide-react';
import { Role } from '@/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: any) => void;
  clients?: { id: string; name: string; company_name: string }[];
}

export function CreateUserModal({ isOpen, onClose, onUserCreated, clients = [] }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('AUDITOR');
  const [organization, setOrganization] = useState('TRACERA Firm');
  const [phone, setPhone] = useState('');
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          organization: organization.trim() || undefined,
          phone: phone.trim() || undefined,
          clientId: role === 'CLIENT' && clientId ? clientId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      onUserCreated(data.user);
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setClientId('');
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-[#0A0A0A]">
              Add Practice User
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

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Singhania"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Work Email *
            </label>
            <input
              type="email"
              required
              placeholder="vikram@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Practice Role *
            </label>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as Role;
                setRole(r);
                if (r === 'CLIENT') {
                  setOrganization('Client Workspace');
                } else {
                  setOrganization('TRACERA Firm');
                }
              }}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            >
              <option value="AUDITOR">AUDITOR (Audit Senior / Manager)</option>
              <option value="PARTNER">PARTNER (Engagement Sign-off / Review)</option>
              <option value="CLIENT">CLIENT (External Client Portal User)</option>
              <option value="ADMIN">ADMIN (Practice Administrator)</option>
            </select>
          </div>

          {role === 'CLIENT' && clients.length > 0 && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Associated Client Organization
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Organization / Department
            </label>
            <input
              type="text"
              placeholder="TRACERA Firm"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98200 99999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            />
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
                  <span>Saving User...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
