'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  History,
  LayoutDashboard,
  Eye,
  ArrowRight,
  RefreshCw,
  Users,
  Shield,
  Sliders,
  X,
  Briefcase,
  Layers,
  Award,
  LogOut,
} from 'lucide-react';
import { AuditDocument } from '@/types';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenUpload }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetch('/api/documents')
        .then((res) => res.json())
        .then((data) => setDocuments(data.documents || []))
        .catch(() => {});
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Static navigation actions
  const staticActions: CommandItem[] = [
    {
      id: 'engagements-hub',
      label: 'Open All Engagements & Audit Rooms',
      category: 'Engagements',
      icon: Briefcase,
      detail: 'Active Practice Engagements',
      action: () => router.push('/auditor/engagements'),
    },
    {
      id: 'partner-desk',
      label: 'Go to Partner Approval Desk',
      category: 'Navigation',
      icon: Award,
      detail: 'Sign-off Queue & Governance',
      action: () => router.push('/partner/dashboard'),
    },
    {
      id: 'auditor-my-work',
      label: 'Go to Auditor Daily Work Desk',
      category: 'Navigation',
      icon: Eye,
      detail: 'Assigned Procedures & Blockers',
      action: () => router.push('/auditor/my-work'),
    },
    {
      id: 'workflow-templates',
      label: 'Inspect Workflow Templates',
      category: 'Admin',
      icon: Layers,
      detail: 'Statutory Audit, Tax Audit, GST, ITR',
      action: () => router.push('/admin/workflows'),
    },
    {
      id: 'auditor-dashboard',
      label: 'Go to Auditor Review Queue',
      category: 'Navigation',
      icon: Eye,
      action: () => router.push('/auditor/dashboard'),
    },
    {
      id: 'client-dashboard',
      label: 'Go to Client Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => router.push('/client/dashboard'),
    },
    {
      id: 'admin-eval',
      label: 'Open Evaluation Tools & Fixtures',
      category: 'Evaluation',
      icon: Sliders,
      action: () => router.push('/admin/evaluation-tools'),
    },
    {
      id: 'upload-doc',
      label: 'Upload New Audit Document',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenUpload) onOpenUpload();
        else router.push('/client/dashboard');
      },
    },
    {
      id: 'switch-client',
      label: 'Switch Persona: Client User',
      category: 'Personas',
      icon: Users,
      action: async () => {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'client@demo.com' }),
        });
        window.location.href = '/client/dashboard';
      },
    },
    {
      id: 'switch-auditor',
      label: 'Switch Persona: Auditor',
      category: 'Personas',
      icon: Users,
      action: async () => {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'auditor@demo.com' }),
        });
        window.location.href = '/auditor/dashboard';
      },
    },
    {
      id: 'switch-partner',
      label: 'Switch Persona: Partner',
      category: 'Personas',
      icon: Users,
      action: async () => {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'partner@demo.com' }),
        });
        window.location.href = '/partner/dashboard';
      },
    },
    {
      id: 'switch-admin',
      label: 'Switch Persona: Admin',
      category: 'Personas',
      icon: Users,
      action: async () => {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@demo.com' }),
        });
        window.location.href = '/admin/dashboard';
      },
    },
    {
      id: 'logout',
      label: 'Sign Out of TRACERA',
      category: 'Session',
      icon: LogOut,
      action: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      },
    },
  ];

  // Document items
  const docActions: CommandItem[] = documents.map((doc) => ({
    id: `doc-${doc.id}`,
    label: doc.title,
    category: 'Documents',
    detail: `${doc.document_type.replace(/_/g, ' ')} · v${doc.current_version} · ${doc.status}`,
    icon: FileText,
    action: () => router.push(`/auditor/documents/${doc.id}`),
  }));

  const allItems = [...staticActions, ...docActions];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.detail && item.detail.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0A0A0A]/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl neo-box-lg bg-white overflow-hidden shadow-[8px_8px_0_#0A0A0A]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b-2 border-[#0A0A0A] bg-[#F7F5EF]">
          <Search className="w-5 h-5 text-[#E73520] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search documents, clients, templates..."
            className="w-full bg-transparent text-sm text-[#0A0A0A] font-bold focus:outline-none placeholder:text-[#888880]"
          />
          <button
            onClick={onClose}
            className="p-1 border border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#E73520] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#0A0A0A]/20">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#777770]">
              No matching commands or audit records found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#0A0A0A] text-white' : 'bg-white hover:bg-[#F7F5EF] text-[#0A0A0A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[#E73520]' : 'text-[#4A4A48]'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {item.label}
                      </div>
                      {item.detail && (
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? 'text-[#A1A19A]' : 'text-[#777770]'
                          }`}
                        >
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                      isSelected
                        ? 'border-white text-white'
                        : 'border-[#0A0A0A] text-[#0A0A0A] bg-[#F7F5EF]'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 border-t-2 border-[#0A0A0A] bg-[#F7F5EF] text-[10px] text-[#4A4A48] flex items-center justify-between font-bold">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#E73520]">TRACERA QUICK ACTION ENGINE</span>
        </div>
      </div>
    </div>
  );
}
