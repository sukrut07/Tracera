'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  RefreshCw,
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

  const allTasks: (EngagementTask & { engagementTitle: string; clientId: string })[] = [];
  const allApprovals: (EngagementApproval & { engagementTitle: string; engagementId: string })[] = [];
  const activeBlockers: (EngagementTask & { engagementTitle: string; engagementId: string })[] = [];

  engagements.forEach((eng) => {
    (eng.tasks || []).forEach((t) => {
      allTasks.push({ ...t, engagementTitle: eng.title, clientId: eng.client_id });
      if (t.status === 'BLOCKED') {
        activeBlockers.push({ ...t, engagementTitle: eng.title, engagementId: eng.id });
      }
    });
    (eng.approvals || []).forEach((a) => {
      if (a.status === 'PENDING') {
        allApprovals.push({ ...a, engagementTitle: eng.title, engagementId: eng.id });
      }
    });
  });

  const handleTaskStatusChange = async (taskId: string, engagementId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', taskId, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Task marked as ${newStatus}`);
        await fetchWorkData();
      }
    } catch {
      showToast('Error updating task');
    }
  };

  const filteredTasks = allTasks.filter((t) =>
    filterPriority === 'ALL' ? true : t.priority === filterPriority
  );

  const urgentTasks = allTasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
  const pendingTasks = allTasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <AppShell>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white px-5 py-3 shadow-[4px_4px_0px_#E73520] text-xs font-bold border-2 border-[#0A0A0A]">
          {toastMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-2 border-[#0A0A0A]">
          <div>
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest mb-1">
              Auditor work desk
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              My work queue
            </h1>
            <p className="text-xs text-[#666660] mt-1">
              Assigned fieldwork procedures, pending reviews, and active client blockers.
            </p>
          </div>
          {currentUser && (
            <span className="px-4 py-2 border-2 border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] bg-white">
              {currentUser.name}
            </span>
          )}
        </div>

        {/* Workload Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-2 border-[#0A0A0A] bg-white divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              Open procedures
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : pendingTasks.length}
            </span>
          </div>
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              High / Urgent
            </span>
            <span className="text-3xl font-bold text-[#E73520] block mt-1">
              {loading ? '—' : urgentTasks.length}
            </span>
          </div>
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              Maker-checker reviews
            </span>
            <span className="text-3xl font-bold text-[#0A0A0A] block mt-1">
              {loading ? '—' : allApprovals.length}
            </span>
          </div>
          <div className="p-5">
            <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
              Client blockers
            </span>
            <span className="text-3xl font-bold text-[#E73520] block mt-1">
              {loading ? '—' : activeBlockers.length}
            </span>
          </div>
        </div>

        {/* Active Blockers */}
        {!loading && activeBlockers.length > 0 && (
          <div className="border-2 border-[#E73520] bg-[#FFF2F0] p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E73520] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active client blockers ({activeBlockers.length})
            </h2>
            <div className="space-y-2">
              {activeBlockers.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border-2 border-[#0A0A0A] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-[#0A0A0A]">
                      {b.title} — <span className="text-[#777770] font-normal">{b.engagementTitle}</span>
                    </p>
                    <p className="text-xs text-[#E73520] mt-0.5">
                      Blocked by: {b.blocked_by} · &ldquo;{b.blocker_reason}&rdquo;
                    </p>
                  </div>
                  <Link
                    href={`/engagements/${b.engagementId}?tab=tasks`}
                    className="px-4 py-2 bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#E73520] shrink-0 hover:bg-[#C62C1A] transition-colors"
                  >
                    Resolve
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Sign-offs */}
        {!loading && allApprovals.length > 0 && (
          <div className="border-2 border-[#0A0A0A] bg-white p-5 space-y-3 shadow-[4px_4px_0px_#0A0A0A]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-2 pb-3 border-b border-[#E5E5E0]">
              <Shield className="w-4 h-4" />
              Pending maker-checker sign-offs ({allApprovals.length})
            </h2>
            <div className="space-y-2">
              {allApprovals.map((app) => (
                <div
                  key={app.id}
                  className="border border-[#E5E5E0] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F7F5EF] transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-[#0A0A0A]">
                      {app.role_gate} sign-off — <span className="text-[#777770] font-normal">{app.engagementTitle}</span>
                    </p>
                    <p className="text-xs text-[#777770] mt-0.5">
                      Requires review and verification before advancement.
                    </p>
                  </div>
                  <Link
                    href={`/engagements/${app.engagementId}?tab=approvals`}
                    className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#0A0A0A] shrink-0 transition-colors"
                  >
                    Review & sign
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fieldwork Procedures */}
        <div className="border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0px_#0A0A0A]">
          <div className="p-5 border-b-2 border-[#0A0A0A] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">
                Assigned fieldwork procedures
              </h2>
              <p className="text-xs text-[#666660] mt-0.5">
                Update progress or open the engagement workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border-2 border-[#0A0A0A] px-3 py-1.5 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none"
              >
                <option value="ALL">All</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="w-5 h-5 text-[#0A0A0A] animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="w-8 h-8 text-[#777770] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#0A0A0A]">No procedures match filter</p>
              <p className="text-xs text-[#777770] mt-1">Try changing the priority filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E0]">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === 'COMPLETED';
                const isBlocked = t.status === 'BLOCKED';
                const priorityColors: Record<string, string> = {
                  URGENT: 'bg-[#FFF2F0] text-[#E73520] border border-[#E73520]',
                  HIGH: 'bg-amber-50 text-amber-700 border border-amber-300',
                  MEDIUM: 'bg-[#F7F5EF] text-[#4A4A48] border border-[#E5E5E0]',
                  LOW: 'bg-white text-[#777770] border border-[#E5E5E0]',
                };
                return (
                  <div
                    key={t.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCompleted ? 'opacity-50 bg-[#F7F5EF]' : 'bg-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${isCompleted ? 'line-through text-[#777770]' : 'text-[#0A0A0A]'}`}>
                          {t.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase ${priorityColors[t.priority] || priorityColors.LOW}`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-[#777770] mt-1">
                        {t.engagementTitle} · Due: {t.due_date || 'Current sprint'}
                      </p>
                      {isBlocked && (
                        <p className="text-xs text-[#E73520] font-bold mt-1">
                          Blocker: {t.blocker_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, t.engagement_id, e.target.value as TaskStatus)}
                        className="border-2 border-[#0A0A0A] px-2 py-1.5 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none"
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <Link
                        href={`/engagements/${t.engagement_id}`}
                        className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-colors flex items-center gap-1"
                      >
                        Open
                        <ArrowRight className="w-3 h-3" />
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
