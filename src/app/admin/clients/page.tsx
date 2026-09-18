'use client';

import React from 'react';
import { Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminClientsPage() {
  const adminUser = {
    id: 'admin-1',
    name: 'Admin (Partner)',
    email: 'admin@demo.com',
    role: 'ADMIN' as const,
    client_id: null,
    created_at: '',
  };

  return (
    <AppShell currentUser={adminUser}>
      <div className="space-y-6">
        <div className="border-b border-[#E5E5E0] pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block mb-1">
            PARTNER DIRECTORY
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
            Client Organizations
          </h1>
          <p className="text-xs text-[#666660]">
            Multi-tenant isolated client entities and their assigned audit teams.
          </p>
        </div>

        <div className="border border-[#E5E5E0] bg-white overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[10px] uppercase tracking-widest text-[#777770]">
                <th className="py-3 px-4 font-bold">Client Entity</th>
                <th className="py-3 px-4 font-bold">GSTIN</th>
                <th className="py-3 px-4 font-bold">Primary Contact</th>
                <th className="py-3 px-4 font-bold">Lead Auditor</th>
                <th className="py-3 px-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              <tr className="hover:bg-[#FAFAF8]">
                <td className="py-3.5 px-4 font-bold text-[#111110]">
                  ABC Traders Pvt Ltd
                </td>
                <td className="py-3.5 px-4 text-[#555550]">
                  27AABCO1234F1Z1
                </td>
                <td className="py-3.5 px-4 text-[#555550]">
                  client@demo.com
                </td>
                <td className="py-3.5 px-4 font-bold text-[#111110]">
                  Rahul Sharma, CA
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-bold">
                    Active Engagement
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
