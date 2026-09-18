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
  const staticActions = [
    {
      id: 'client-dashboard',
      label: 'Go to Client Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => router.push('/client/dashboard'),
    },
    {
      id: 'auditor-dashboard',
      label: 'Go to Auditor Review Queue',
      category: 'Navigation',
      icon: Eye,
      action: () => router.push('/auditor/dashboard'),
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
      label: 'Switch Persona: Client (ABC Traders)',
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
      label: 'Switch Persona: Auditor (Rahul Sharma, CA)',
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
  ];

  // Dynamic document results
  const documentResults = documents
    .filter(
      (d) =>
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        (d.file_name || '').toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map((doc) => ({
      id: `doc-${doc.id}`,
      label: `${doc.title} (v${doc.current_version})`,
      category: 'Documents',
      icon: FileText,
      detail: doc.status,
      action: () => router.push(`/client/documents/${doc.id}`),
    }));

  const filteredActions: CommandItem[] = [
    ...documentResults,
    ...staticActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
    ),
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-2xs font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#111110] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E5E0] bg-[#FAFAF8]">
          <Search className="w-4 h-4 text-[#777770] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search documents, commands, or switch personas..."
            className="w-full bg-transparent text-xs text-[#111110] placeholder-[#888880] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-wider text-[#777770] hover:text-[#111110] px-1.5 py-0.5 border border-[#E5E5E0] bg-white cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Action / Result List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#F2F2EE] text-xs">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-[#777770]">
              <span className="text-xs uppercase font-bold block text-[#111110]">NO MATCHES FOUND</span>
              <span className="text-[11px] font-sans">Try searching for documents, clients, or navigation actions.</span>
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#111110] text-white' : 'hover:bg-[#FAFAF8] text-[#111110]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#777770]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.detail ? (
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                          isSelected
                            ? 'bg-[#222220] border-[#333330] text-white'
                            : 'bg-[#F2F2EE] border-[#E5E5E0] text-[#777770]'
                        }`}
                      >
                        {item.detail}
                      </span>
                    ) : null}
                    <span
                      className={`text-[9px] uppercase tracking-wider ${
                        isSelected ? 'text-[#999990]' : 'text-[#999990]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAFAF8] border-t border-[#E5E5E0] flex items-center justify-between text-[10px] text-[#777770]">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="font-bold text-[#111110]">TRACERA COMMAND</span>
        </div>
      </div>
    </div>
  );
}
