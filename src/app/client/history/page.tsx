'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, RefreshCw, FileText, Check, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { UserProfile } from '@/types';

interface AuditEvent {
  id: string;
  action: string;
  label: string;
  actor: { id: string; name: string; role: string };
  document: { id: string; title: string; status: string; version: number } | null;
  engagementId: string | null;
  metadata: Record<string, any>;
  timestamp: string;
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DOCUMENT_SUBMITTED: FileText,
  CORRECTION_SUBMITTED: FileText,
  DOCUMENT_APPROVED: Check,
  REVIEW_COMPLETED: Check,
  PARTNER_APPROVED: Check,
  CORRECTION_REQUESTED: AlertCircle,
  DOCUMENT_REJECTED: AlertCircle,
  ISSUE_CREATED: AlertCircle,
};

const ACTION_COLORS: Record<string, string> = {
  DOCUMENT_APPROVED: 'bg-green-100 border-green-600 text-green-800',
  REVIEW_COMPLETED: 'bg-green-100 border-green-600 text-green-800',
  PARTNER_APPROVED: 'bg-green-100 border-green-600 text-green-800',
  CORRECTION_REQUESTED: 'bg-[#FFF2F0] border-[#E73520] text-[#E73520]',
  DOCUMENT_REJECTED: 'bg-[#FFF2F0] border-[#E73520] text-[#E73520]',
  ISSUE_CREATED: 'bg-amber-50 border-amber-500 text-amber-800',
};

function EventIcon({ action }: { action: string }) {
  const Icon = ACTION_ICONS[action] || Clock;
  const colorClass = ACTION_COLORS[action] || 'bg-[#F7F5EF] border-[#0A0A0A] text-[#0A0A0A]';
  return (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
}

export default function ClientHistoryPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, eventsRes] = await Promise.all([
        fetch('/api/auth/login'),
        fetch('/api/audit-logs?limit=100'),
      ]);

      const userData = await userRes.json();
      if (userData.user) setCurrentUser(userData.user);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      } else {
        setError('Unable to load audit history.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const formatTs = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        {/* Page Header */}
        <div className="border-b-[3px] border-[#0A0A0A] pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E73520] block mb-1">
              Client workspace · Audit trail
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              History
            </h1>
            <p className="text-xs text-[#555550] mt-1">
              Every action on your documents — chronological, uneditable.
            </p>
          </div>
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] shadow-[2px_2px_0_#0A0A0A] cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 flex flex-col items-center gap-3 text-xs font-bold text-[#555550]">
            <div className="w-6 h-6 border-2 border-[#0A0A0A] border-t-[#E73520] animate-spin rounded-full" />
            <span>Loading history…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 border-2 border-[#E73520] bg-[#FFF2F0] text-xs text-[#0A0A0A] flex items-center gap-2 shadow-[2px_2px_0_#E73520]">
            <AlertCircle className="w-4 h-4 text-[#E73520] shrink-0" />
            <span>{error}</span>
            <button onClick={loadData} className="ml-auto font-bold underline hover:text-[#E73520]">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="bg-white border-2 border-[#0A0A0A] p-12 text-center space-y-3 shadow-[4px_4px_0_#0A0A0A]">
            <div className="w-12 h-12 bg-[#F7F5EF] border-2 border-[#0A0A0A] flex items-center justify-center mx-auto shadow-[2px_2px_0_#0A0A0A]">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0A0A0A]">No events recorded yet</h3>
            <p className="text-xs text-[#666660] max-w-xs mx-auto leading-relaxed">
              Upload a document to start your audit trail. Every submission, review, and approval will appear here.
            </p>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && events.length > 0 && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A]">
            <div className="border-b-2 border-[#0A0A0A] px-5 py-3 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-[#E73520]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y-2 divide-[#0A0A0A]/10">
              {events.map((event, i) => (
                <div key={event.id} className="px-5 py-4 flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <EventIcon action={event.action} />
                    {i < events.length - 1 && (
                      <div className="flex-1 w-px bg-[#0A0A0A]/10 min-h-[16px]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#0A0A0A] capitalize">
                        {event.label}
                      </span>
                      {event.document && (
                        <span className="text-[10px] text-[#555550]">
                          · v{event.document.version}
                        </span>
                      )}
                    </div>

                    {event.document && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#777770] shrink-0" />
                        <Link
                          href={`/client/documents/${event.document.id}`}
                          className="text-[11px] text-[#0A0A0A] font-bold hover:text-[#E73520] hover:underline flex items-center gap-0.5"
                        >
                          {event.document.title}
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    )}

                    {event.metadata?.reason && (
                      <p className="text-[11px] text-[#555550] italic">
                        "{event.metadata.reason}"
                      </p>
                    )}
                    {event.metadata?.remarks && (
                      <p className="text-[11px] text-[#555550] italic">
                        "{event.metadata.remarks}"
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-[10px] text-[#777770]">
                      <span>
                        <strong className="text-[#555550]">{event.actor.name}</strong>
                        {event.actor.role && event.actor.role !== 'SYSTEM' && (
                          <span className="ml-1 uppercase">({event.actor.role})</span>
                        )}
                      </span>
                      <span>·</span>
                      <span>{formatTs(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
