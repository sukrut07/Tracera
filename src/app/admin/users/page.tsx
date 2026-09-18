'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Plus, Loader2, Shield, User, Building2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { UserProfile } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, clientsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/clients'),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        if (uData.currentUser) setCurrentUser(uData.currentUser);
      }
      if (clientsRes.ok) {
        const cData = await clientsRes.json();
        setClients(cData.clients || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'PARTNER':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'AUDITOR':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'CLIENT':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-neutral-50 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <AppShell currentUser={currentUser || undefined}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b-2 border-[#0A0A0A] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest block mb-1">
              Workspace directory
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Practice users &amp; permissions
            </h1>
            <p className="text-xs text-[#666660]">
              Chartered Accountants, engagement partners, staff auditors, and client portal users.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="border border-[#E5E5E0] bg-white p-12 text-center font-mono text-xs text-[#777770] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
            <span>Loading user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="border-2 border-dashed border-[#0A0A0A] bg-white p-12 text-center font-mono">
            <User className="w-10 h-10 text-[#777770] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-wider">
              No users found
            </h3>
            <p className="text-xs text-[#666660] mt-1 mb-6 max-w-sm mx-auto">
              Add users to your TRACERA workspace to assign audit engagements and client portals.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] hover:border-[#E73520] inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add User</span>
            </button>
          </div>
        ) : (
          <div className="border-2 border-[#0A0A0A] bg-white overflow-x-auto font-mono text-xs shadow-[4px_4px_0px_#0A0A0A]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0A0A0A] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                  <th className="py-3 px-4 font-bold">User Name</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Organization</th>
                  <th className="py-3 px-4 font-bold">Phone</th>
                  <th className="py-3 px-4 font-bold text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0A0A0A]">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      {u.organization || (u.role === 'CLIENT' ? 'Client Workspace' : 'TRACERA Firm')}
                    </td>
                    <td className="py-3 px-4 text-[#555550]">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#777770] text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={() => fetchUsers()}
        clients={clients}
      />
    </AppShell>
  );
}
