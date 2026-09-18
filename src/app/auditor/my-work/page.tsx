'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  FolderOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Engagement, EngagementTask, EngagementApproval, UserProfile, TaskStatus } from '@/types';

export default function AuditorMyWorkPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchWorkData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/engagements');
      const data = await res.json();
      if (res.ok) {
        // Fetch detailed engagement info for the engagements
        const engs: Engagement[] = data.engagements || [];
        const detailedEngs = await Promise.all(
          engs.map(async (e) => {
            try {
              const dRes = await fetch(`/api/engagements/${e.id}`);
              const dData = await dRes.json();
              return dData.engagement || e;
            } catch {
              return e;
            }
          })
        );
        setEngagements(detailedEngs);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkData();
  }, [fetchWorkData]);

  // Aggregate all tasks across engagements
  const allTasks: (EngagementTask & { engagementTitle: string; clientId: string })[] = [];
  const allApprovals: (EngagementApproval & { engagementTitle: string; engagementId: string })[] = [];
  const activeBlockers: (EngagementTask & { engagementTitle: string; engagementId: string })[] = [];

  engagements.forEach((eng) => {
    (eng.tasks || []).forEach((t) => {
      allTasks.push({
        ...t,
        engagementTitle: eng.title,
        clientId: eng.client_id,
      });
      if (t.status === 'BLOCKED') {
        activeBlockers.push({
          ...t,
          engagementTitle: eng.title,
          engagementId: eng.id,
        });
      }
    });

    (eng.approvals || []).forEach((a) => {
      if (a.status === 'PENDING') {
        allApprovals.push({
          ...a,
          engagementTitle: eng.title,
          engagementId: eng.id,
        });
      }
    });
  });

  const handleTaskStatusChange = async (taskId: string, engagementId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          taskId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        showToast(`Task marked as ${newStatus}`);
        await fetchWorkData();
      }
    } catch {
      showToast('Error updating task');
    }
  };

  const filteredTasks = allTasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const urgentTasks = allTasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
  const pendingTasks = allTasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <AppShell>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111110] text-white px-5 py-3 rounded-lg shadow-xl font-mono text-xs border border-[#333330]">
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-8 w-full space-y-6">
        {/* Desk Header */}
        <div className="border-b border-[#E5E5E0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-[#777770] uppercase mb-1">AUDITOR WORK DESK</div>
            <h1 className="text-2xl font-serif font-bold text-[#111110]">
              Today&rsquo;s Audit Queue & Actions
            </h1>
            <p className="text-xs font-mono text-[#777770] mt-1">
              Fieldwork procedures assigned to you, pending maker-checker reviews, and active client blockers.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 bg-white border border-[#E5E5E0] rounded text-[#555550]">
              Auditor: <strong>{currentUser?.name || 'Rahul Sharma, CA'}</strong>
            </span>
          </div>
        </div>

        {/* Workload Summary Bar */}
        <div className="bg-[#111110] text-white rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[#888880] block text-[10px]">OPEN PROCEDURES</span>
              <strong className="text-lg text-white">{pendingTasks.length}</strong>
            </div>
            <div className="h-8 w-px bg-[#333330]" />
            <div>
              <span className="text-[#888880] block text-[10px]">HIGH / URGENT</span>
              <strong className="text-lg text-amber-400">{urgentTasks.length}</strong>
            </div>
            <div className="h-8 w-px bg-[#333330]" />
            <div>
              <span className="text-[#888880] block text-[10px]">MAKER-CHECKER REVIEWS</span>
              <strong className="text-lg text-purple-400">{allApprovals.length}</strong>
            </div>
            <div className="h-8 w-px bg-[#333330]" />
            <div>
              <span className="text-[#888880] block text-[10px]">CLIENT BLOCKERS</span>
              <strong className="text-lg text-rose-400">{activeBlockers.length}</strong>
            </div>
          </div>

          <div className="text-[11px] text-[#A1A19A]">
            TODAY: {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Section 1: Active Client Blockers */}
        {activeBlockers.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>ACTIVE CLIENT RECONCILIATION BLOCKERS ({activeBlockers.length})</span>
            </div>
            <div className="space-y-2">
              {activeBlockers.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-rose-200 rounded p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div>
                    <div className="font-semibold text-rose-950">
                      {b.title} &mdash; <span className="text-[#555550]">{b.engagementTitle}</span>
                    </div>
                    <div className="text-rose-800 text-[11px] mt-0.5">
                      <strong>Blocked by:</strong> {b.blocked_by} &bull; &ldquo;{b.blocker_reason}&rdquo;
                    </div>
                  </div>
                  <Link
                    href={`/engagements/${b.engagementId}?tab=tasks`}
                    className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-mono hover:bg-rose-700 shrink-0 self-start md:self-auto"
                  >
                    RESOLVE IN WORKSPACE &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Pending Maker-Checker Sign-offs */}
        {allApprovals.length > 0 && (
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div className="flex items-center gap-2 text-[#111110] font-mono text-xs font-bold uppercase">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Pending Maker-Checker Sign-offs ({allApprovals.length})</span>
              </div>
            </div>

            <div className="space-y-2">
              {allApprovals.map((app) => (
                <div
                  key={app.id}
                  className="p-3 border border-[#E5E5E0] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono hover:bg-[#FAFAF8]"
                >
                  <div>
                    <div className="font-semibold text-[#111110]">
                      {app.role_gate} Sign-off &mdash; <span className="text-[#555550]">{app.engagementTitle}</span>
                    </div>
                    <div className="text-[#777770] text-[11px] mt-0.5">
                      Requires auditor review and verification before advancement.
                    </div>
                  </div>
                  <Link
                    href={`/engagements/${app.engagementId}?tab=approvals`}
                    className="px-3 py-1 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] shrink-0 self-start md:self-auto"
                  >
                    REVIEW & SIGN &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Priority Fieldwork Procedures */}
        <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F0F0EC] pb-3 gap-3">
            <div>
              <h3 className="text-base font-serif font-bold text-[#111110]">Assigned Fieldwork Procedures</h3>
              <p className="text-xs font-mono text-[#777770]">
                Mark status, update progress, or open engagement rooms.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#777770]">PRIORITY:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-[#E5E5E0] rounded px-2.5 py-1 text-[#111110] bg-white"
              >
                <option value="ALL">ALL</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="w-5 h-5 text-[#111110] animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#777770]">
              No audit procedures match current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === 'COMPLETED';
                const isBlocked = t.status === 'BLOCKED';
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20 opacity-70'
                        : isBlocked
                        ? 'border-rose-300 bg-rose-50/30'
                        : 'border-[#E5E5E0] bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isCompleted ? 'line-through text-[#777770]' : 'text-[#111110]'}`}>
                          {t.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777770] mt-1">
                        Engagement: <strong>{t.engagementTitle}</strong> &bull; Due: {t.due_date || 'Current sprint'}
                      </div>
                      {isBlocked && (
                        <div className="text-[11px] text-rose-700 font-semibold mt-1">
                          Blocker: {t.blocker_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, t.engagement_id, e.target.value as TaskStatus)}
                        className="border border-[#E5E5E0] rounded px-2 py-1 text-xs bg-white text-[#111110]"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>

                      <Link
                        href={`/engagements/${t.engagement_id}`}
                        className="px-2.5 py-1 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
                      >
                        WORKSPACE &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
