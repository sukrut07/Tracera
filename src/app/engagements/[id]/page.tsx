'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  User,
  Users,
  CreditCard,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Lock,
  Calendar,
  AlertCircle,
  Sparkles,
  DollarSign,
  Send,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Engagement,
  EngagementStage,
  EngagementChecklistItem,
  EngagementTask,
  EngagementApproval,
  UserProfile,
  TaskStatus,
  TaskPriority,
} from '@/types';
import { CreateIssueModal } from '@/components/engagements/CreateIssueModal';
import { RequestDocumentModal } from '@/components/auditor/RequestDocumentModal';

type TabType =
  | 'overview'
  | 'stages'
  | 'checklist'
  | 'tasks'
  | 'issues'
  | 'approvals'
  | 'billing'
  | 'timeline'
  | 'closure';

export default function EngagementAuditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = params?.id as string;

  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [closurePrereqs, setClosurePrereqs] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [advanceStageModalOpen, setAdvanceStageModalOpen] = useState(false);
  const [targetStageNumber, setTargetStageNumber] = useState<number>(1);
  const [stageNotes, setStageNotes] = useState('');

  const [requestDocModalOpen, setRequestDocModalOpen] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<EngagementChecklistItem | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestDueDate, setRequestDueDate] = useState('');

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskStage, setNewTaskStage] = useState<number>(3);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EngagementTask | null>(null);
  const [blockerReason, setBlockerReason] = useState('');
  const [blockedBy, setBlockedBy] = useState('Client - Missing Evidence');

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedRoleGate, setSelectedRoleGate] = useState<'PERFORMER' | 'REVIEWER' | 'PARTNER'>('PERFORMER');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closureSummary, setClosureSummary] = useState('');

  const [createIssueModalOpen, setCreateIssueModalOpen] = useState(false);
  const [requestMultiChannelModalOpen, setRequestMultiChannelModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleIssue = async (issueId: string, currentStatus: string) => {
    if (!engagement) return;
    const newStatus = currentStatus === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/issues`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Issue status updated to ${newStatus}`);
        await fetchEngagementData();
      } else {
        showToast('Failed to update issue');
      }
    } catch {
      showToast('Error updating issue');
    }
  };

  const fetchEngagementData = useCallback(async () => {
    if (!engagementId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/engagements/${engagementId}`);
      const data = await res.json();
      if (res.ok && data.engagement) {
        setEngagement(data.engagement);
        setClosurePrereqs(data.closurePrereqs);
        setCurrentUser(data.currentUser);
      } else {
        showToast(data.error || 'Failed to load engagement');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [engagementId]);

  useEffect(() => {
    fetchEngagementData();
  }, [fetchEngagementData]);

  // Stage advancement
  const handleAdvanceStage = async () => {
    if (!engagement) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStageNumber,
          notes: stageNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Advanced to stage ${targetStageNumber} successfully!`);
        setAdvanceStageModalOpen(false);
        setStageNotes('');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Failed to advance stage');
      }
    } catch (err) {
      showToast('Request error');
    } finally {
      setActionLoading(false);
    }
  };

  // Document Request
  const handleRequestDocument = async () => {
    if (!engagement || !selectedChecklistItem) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          checklistItemId: selectedChecklistItem.id,
          message: requestMessage.trim() || undefined,
          dueDate: requestDueDate || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Document requested for "${selectedChecklistItem.title}"`);
        setRequestDocModalOpen(false);
        setRequestMessage('');
        setRequestDueDate('');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Failed to request document');
      }
    } catch (err) {
      showToast('Request error');
    } finally {
      setActionLoading(false);
    }
  };

  // Task creation
  const handleCreateTask = async () => {
    if (!engagement || !newTaskTitle.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: newTaskTitle.trim(),
          stageNumber: newTaskStage,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Audit task created successfully');
        setAddTaskModalOpen(false);
        setNewTaskTitle('');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Failed to create task');
      }
    } catch (err) {
      showToast('Request error');
    } finally {
      setActionLoading(false);
    }
  };

  // Task status update
  const handleUpdateTaskStatus = async (task: EngagementTask, newStatus: TaskStatus) => {
    if (!engagement) return;
    if (newStatus === 'BLOCKED') {
      setSelectedTask(task);
      setBlockerModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/engagements/${engagement.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          taskId: task.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        showToast(`Task marked as ${newStatus}`);
        await fetchEngagementData();
      }
    } catch {
      showToast('Failed to update task');
    }
  };

  // Task Blocker submit
  const handleSetBlocker = async () => {
    if (!engagement || !selectedTask) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          taskId: selectedTask.id,
          status: 'BLOCKED',
          blocked_by: blockedBy,
          blocker_reason: blockerReason.trim() || 'Pending verification by client',
        }),
      });
      if (res.ok) {
        showToast('Task marked as BLOCKED');
        setBlockerModalOpen(false);
        setBlockerReason('');
        await fetchEngagementData();
      }
    } catch {
      showToast('Failed to block task');
    } finally {
      setActionLoading(false);
    }
  };

  // Maker-Checker Sign-off
  const handleSubmitApproval = async (gate: 'PERFORMER' | 'REVIEWER' | 'PARTNER', status: 'APPROVED' | 'REJECTED') => {
    if (!engagement) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleGate: gate,
          status,
          remarks: approvalRemarks.trim() || `${gate} Sign-off completed`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${gate} sign-off recorded as ${status}`);
        setApprovalModalOpen(false);
        setApprovalRemarks('');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Failed to submit approval');
      }
    } catch {
      showToast('Failed to submit approval');
    } finally {
      setActionLoading(false);
    }
  };

  // Record Fee Payment
  const handleRecordPayment = async () => {
    if (!engagement || !paymentRef.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentReference: paymentRef.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Payment confirmed and professional fee settled!');
        setPaymentModalOpen(false);
        setPaymentRef('');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Failed to record payment');
      }
    } catch {
      showToast('Payment record error');
    } finally {
      setActionLoading(false);
    }
  };

  // Formal Engagement Closure
  const handleCloseEngagement = async () => {
    if (!engagement) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/closure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closureSummary: closureSummary.trim() || 'Engagement concluded in accordance with ICAI Standards on Auditing.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Engagement successfully closed! Closure ID: ${data.closureId}`);
        setCloseModalOpen(false);
        setActiveTab('closure');
        await fetchEngagementData();
      } else {
        showToast(data.error || 'Cannot close engagement yet');
      }
    } catch {
      showToast('Closure execution error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !engagement) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#111110] animate-spin" />
            <p className="font-mono text-xs text-[#777770]">LOADING CA AUDIT WORKSPACE...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const isAuditorOrAdmin = currentUser?.role === 'AUDITOR' || currentUser?.role === 'ADMIN' || currentUser?.role === 'PARTNER';
  const stages = engagement.stages || [];
  const checklists = engagement.checklists || [];
  const tasks = engagement.tasks || [];
  const issues = engagement.issues || [];
  const openIssues = issues.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
  const approvals = engagement.approvals || [];
  const documents = engagement.documents || [];
  const auditLogs = engagement.audit_logs || [];

  const completedStagesCount = stages.filter((s) => s.status === 'COMPLETED').length;
  const approvedDocsCount = checklists.filter((c) => c.status === 'APPROVED').length;
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');

  return (
    <AppShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111110] text-white px-5 py-3 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3 border border-[#333330] animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Audit Room Header */}
      <div className="border-b border-[#E5E5E0] bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#777770]">
              <Link
                href={isAuditorOrAdmin ? '/auditor/engagements' : '/client/engagements'}
                className="hover:text-[#111110] transition-colors flex items-center gap-1"
              >
                <span>ENGAGEMENTS</span>
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#111110] uppercase">{engagement.client?.name || 'CLIENT'}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-[#111110]">{engagement.id}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-[#111110] tracking-tight">
                {engagement.title}
              </h1>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                  engagement.status === 'CLOSED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : engagement.status === 'READY_TO_CLOSE'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    engagement.status === 'CLOSED'
                      ? 'bg-emerald-500'
                      : engagement.status === 'READY_TO_CLOSE'
                      ? 'bg-purple-500'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                />
                {engagement.status.replace(/_/g, ' ')}
              </span>

              <span className="bg-[#F0F0EC] text-[#555550] px-2.5 py-0.5 rounded text-xs font-mono">
                FY {engagement.financial_year}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isAuditorOrAdmin && engagement.status !== 'CLOSED' && (
              <button
                onClick={() => {
                  setTargetStageNumber(Math.min(engagement.total_stages, engagement.current_stage_index + 2));
                  setAdvanceStageModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] transition-colors flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ADVANCE STAGE</span>
              </button>
            )}

            {engagement.billing_status !== 'PAID' && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-3.5 py-2 bg-white border border-[#E5E5E0] text-[#111110] rounded text-xs font-mono hover:bg-[#F5F5F0] transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>RECORD PAYMENT (₹{engagement.billing_total.toLocaleString('en-IN')})</span>
              </button>
            )}

            {engagement.status === 'CLOSED' ? (
              <a
                href={`/api/engagements/${engagement.id}/report`}
                download
                className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD CA CLOSURE DOSSIER PDF</span>
              </a>
            ) : (
              isAuditorOrAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('closure');
                    setCloseModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-white border border-[#E5E5E0] text-[#111110] rounded text-xs font-mono hover:bg-[#F5F5F0] transition-colors flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>CLOSE ENGAGEMENT</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* 10-Stage Horizontal Gate Bar */}
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[#F0F0EC]">
          <div className="flex items-center justify-between text-xs font-mono text-[#777770] mb-2">
            <span className="uppercase font-semibold text-[#111110]">
              STAGE GATE PROGRESSION ({completedStagesCount}/{stages.length} COMPLETED · {engagement.progress_percent}%)
            </span>
            <span>Target Due: {engagement.due_date}</span>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
            {stages.map((st) => {
              const isCompleted = st.status === 'COMPLETED';
              const isInProgress = st.status === 'IN_PROGRESS';
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    if (isAuditorOrAdmin && engagement.status !== 'CLOSED') {
                      setTargetStageNumber(st.stage_number);
                      setAdvanceStageModalOpen(true);
                    }
                  }}
                  title={`${st.name} - ${st.status}`}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isInProgress
                      ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300 ring-offset-1 font-semibold'
                      : 'bg-[#F9F9F7] border-[#E5E5E0] text-[#888880] hover:border-[#CCCCCC]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono">#{st.stage_number}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : isInProgress ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="text-[11px] truncate leading-tight font-medium" title={st.name}>
                    {st.name.replace(/^[0-9]+\s*/, '')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8 Navigation Sub-Tabs */}
      <div className="border-b border-[#E5E5E0] bg-white sticky top-0 z-20 px-8">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1">
          {[
            { key: 'overview', label: 'Overview', icon: Layers },
            { key: 'stages', label: `Stages (${stages.length})`, icon: Clock },
            { key: 'checklist', label: `Evidence Checklist (${approvedDocsCount}/${checklists.length})`, icon: FileText },
            { key: 'tasks', label: `Procedures & Tasks (${tasks.length})`, icon: CheckCircle2, badge: blockedTasks.length > 0 ? `${blockedTasks.length} BLOCKED` : undefined },
            { key: 'issues', label: `Issues & Blockers (${issues.length})`, icon: AlertTriangle, badge: openIssues.length > 0 ? `${openIssues.length} OPEN` : undefined },
            { key: 'approvals', label: 'Maker-Checker Sign-off', icon: Shield },
            { key: 'billing', label: `Billing & Fees (${engagement.billing_status})`, icon: DollarSign },
            { key: 'timeline', label: `Unified Timeline (${auditLogs.length})`, icon: Clock },
            { key: 'closure', label: 'Engagement Closure', icon: Lock, highlight: engagement.status === 'READY_TO_CLOSE' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-3.5 px-4 font-mono text-xs border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#111110] text-[#111110]'
                    : 'border-transparent text-[#777770] hover:text-[#111110]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#111110]' : 'text-[#999990]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Blocker Alert Banner if any task blocked */}
            {blockedTasks.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-900 font-mono">
                    ACTIVE ENGAGEMENT BLOCKER ({blockedTasks.length})
                  </h4>
                  {blockedTasks.map((bt) => (
                    <div key={bt.id} className="mt-1 text-xs text-rose-800">
                      <strong>{bt.title}:</strong> Blocked by {bt.blocked_by} &mdash; &ldquo;{bt.blocker_reason}&rdquo;
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-mono hover:bg-rose-700 shrink-0"
                >
                  VIEW BLOCKERS
                </button>
              </div>
            )}

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E5E5E0] rounded-lg p-5">
                <span className="font-mono text-xs text-[#777770] uppercase">CURRENT STAGE</span>
                <div className="text-lg font-serif font-bold text-[#111110] mt-1">
                  Stage {engagement.current_stage_index + 1}: {stages[engagement.current_stage_index]?.name || 'Active'}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-mono text-[#555550]">
                  <span>Progress: {engagement.progress_percent}%</span>
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E0] rounded-lg p-5">
                <span className="font-mono text-xs text-[#777770] uppercase">AUDIT EVIDENCE CHECKLIST</span>
                <div className="text-lg font-serif font-bold text-[#111110] mt-1">
                  {approvedDocsCount} of {checklists.length} Verified
                </div>
                <div className="mt-2 text-xs font-mono text-[#555550]">
                  {checklists.filter((c) => c.status === 'REQUESTED').length} currently requested
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E0] rounded-lg p-5">
                <span className="font-mono text-xs text-[#777770] uppercase">MAKER-CHECKER STATUS</span>
                <div className="text-lg font-serif font-bold text-[#111110] mt-1">
                  {approvals.filter((a) => a.status === 'APPROVED').length} of 3 Gates Signed
                </div>
                <div className="mt-2 text-xs font-mono text-[#555550]">
                  Performer &rarr; Reviewer &rarr; Partner
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E0] rounded-lg p-5">
                <span className="font-mono text-xs text-[#777770] uppercase">PROFESSIONAL FEE</span>
                <div className="text-lg font-serif font-bold text-[#111110] mt-1">
                  ₹{engagement.billing_total.toLocaleString('en-IN')}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      engagement.billing_status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className={engagement.billing_status === 'PAID' ? 'text-emerald-700 font-semibold' : 'text-amber-800'}>
                    STATUS: {engagement.billing_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Practice Roles and Entity Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E5E5E0] rounded-lg p-6">
                <h3 className="text-sm font-mono font-bold uppercase text-[#111110] border-b border-[#F0F0EC] pb-3 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#777770]" />
                  <span>Audit Team Ownership</span>
                </h3>
                <dl className="grid grid-cols-2 gap-y-4 text-xs font-mono">
                  <div>
                    <dt className="text-[#777770]">Signing Partner:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.assigned_partner_name || 'Managing Partner, FCA'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Audit Manager:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.assigned_manager_name || 'Rahul Sharma, CA'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Staff Auditor:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.assigned_staff_name || 'Assigned Staff Auditor'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Statutory Due Date:</dt>
                    <dd className="font-semibold text-rose-700 mt-0.5">{engagement.due_date}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white border border-[#E5E5E0] rounded-lg p-6">
                <h3 className="text-sm font-mono font-bold uppercase text-[#111110] border-b border-[#F0F0EC] pb-3 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#777770]" />
                  <span>Client & Engagement Particulars</span>
                </h3>
                <dl className="grid grid-cols-2 gap-y-4 text-xs font-mono">
                  <div>
                    <dt className="text-[#777770]">Entity Name:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.client?.company_name || engagement.client?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Financial Year:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.financial_year}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Service Template:</dt>
                    <dd className="font-semibold text-[#111110] mt-0.5">{engagement.service_type.replace(/_/g, ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777770]">Closure ID:</dt>
                    <dd className="font-semibold text-emerald-700 mt-0.5">{engagement.closure_id || 'PENDING CLOSURE'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* "What happens next?" Guidance Card */}
            <div className="bg-[#F8F9FA] border border-[#E5E5E0] rounded-lg p-6">
              <h4 className="text-xs font-mono font-bold uppercase text-[#111110] tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>WHAT HAPPENS NEXT IN THIS ENGAGEMENT?</span>
              </h4>
              <p className="text-xs text-[#555550] leading-relaxed">
                {engagement.status === 'DOCUMENT_COLLECTION'
                  ? 'Client must upload pending checklist items (such as TDS return acknowledgment and debtor ageing). Auditor will run GSTR-2B reconciliation and resolve open blockers.'
                  : engagement.status === 'FIELDWORK'
                  ? 'Audit staff is conducting substantive testing and sample verification. Manager review will initiate once all sample registers are reconciled.'
                  : engagement.status === 'READY_TO_CLOSE'
                  ? 'All maker-checker tiers and checklist items have been signed. The lead CA partner can now finalize and seal the official Engagement Closure Dossier.'
                  : engagement.status === 'CLOSED'
                  ? `This engagement was sealed with Closure ID ${engagement.closure_id}. The official ICAI compliance report and audit dossier can be downloaded below.`
                  : 'Stage advancement is pending. Review operational tasks and checklist items.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFLOW STAGES */}
        {activeTab === 'stages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#111110]">Operational Workflow Stages</h3>
                <p className="text-xs font-mono text-[#777770]">
                  Standard ICAI 10-stage sequential lifecycle from acceptance to formal archive.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {stages.map((st) => (
                <div
                  key={st.id}
                  className={`p-4 rounded-lg border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    st.status === 'COMPLETED'
                      ? 'border-emerald-200'
                      : st.status === 'IN_PROGRESS'
                      ? 'border-blue-400 ring-1 ring-blue-200'
                      : 'border-[#E5E5E0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        st.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : st.status === 'IN_PROGRESS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#EEEEEC] text-[#777770]'
                      }`}
                    >
                      {st.stage_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#111110]">{st.name}</h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            st.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#777770] mt-1 font-mono">
                        Owner: {st.owner_name || 'CA Rahul Sharma'} · Target: {st.due_date || engagement.due_date}
                        {st.completed_at && ` · Completed: ${new Date(st.completed_at).toLocaleDateString('en-IN')}`}
                      </p>
                      {st.notes && <p className="text-xs text-[#555550] italic mt-1">&ldquo;{st.notes}&rdquo;</p>}
                    </div>
                  </div>

                  {isAuditorOrAdmin && engagement.status !== 'CLOSED' && st.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setTargetStageNumber(st.stage_number);
                        setAdvanceStageModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] shrink-0"
                    >
                      ADVANCE TO THIS STAGE &rarr;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENT EVIDENCE CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E0] pb-4 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#111110]">Document Evidence Checklist</h3>
                <p className="text-xs font-mono text-[#777770]">
                  Mandatory statutory audit documents required prior to final review and sign-off.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#777770]">
                  Verified: <strong className="text-emerald-700">{approvedDocsCount}</strong> of {checklists.length}
                </span>
                {isAuditorOrAdmin && (
                  <button
                    onClick={() => setRequestMultiChannelModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ REQUEST DOCUMENT</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E0] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F8F9FA] border-b border-[#E5E5E0] text-[#777770]">
                  <tr>
                    <th className="p-3">ITEM TITLE</th>
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">ATTACHED EVIDENCE</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EC]">
                  {checklists.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-3 font-semibold text-[#111110]">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.is_mandatory && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                              MANDATORY
                            </span>
                          )}
                        </div>
                        {item.request_message && (
                          <div className="text-[11px] text-amber-800 italic mt-0.5">
                            Note: &ldquo;{item.request_message}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-[#555550]">{item.category}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'REQUESTED'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.document_id ? (
                          <Link
                            href={isAuditorOrAdmin ? `/auditor/documents/${item.document_id}` : `/documents/${item.document_id}`}
                            className="text-sky-700 underline flex items-center gap-1 hover:text-sky-900"
                          >
                            <span>{item.matched_document?.title || 'View Attached Doc'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-[#A1A19A] italic">None uploaded</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isAuditorOrAdmin && item.status !== 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedChecklistItem(item);
                              setRequestDocModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-white border border-[#E5E5E0] text-[#111110] rounded hover:bg-[#F5F5F0] transition-colors"
                          >
                            REQUEST FROM CLIENT
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TASKS & FIELDWORK */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E0] pb-4 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#111110]">Audit Procedures & Tasks</h3>
                <p className="text-xs font-mono text-[#777770]">
                  Track substantive testing, reconciliations, and active client blockers.
                </p>
              </div>
              {isAuditorOrAdmin && (
                <button
                  onClick={() => setAddTaskModalOpen(true)}
                  className="px-3.5 py-2 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD PROCEDURE</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {tasks.map((tsk) => {
                const isBlocked = tsk.status === 'BLOCKED';
                const isCompleted = tsk.status === 'COMPLETED';
                return (
                  <div
                    key={tsk.id}
                    className={`p-4 rounded-lg border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isBlocked
                        ? 'border-rose-300 bg-rose-50/40'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-[#E5E5E0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-[#777770]' : 'text-[#111110]'}`}>
                          {tsk.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            tsk.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : tsk.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tsk.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs font-mono text-[#777770]">
                        <span>Assigned: {tsk.assigned_to_name || 'Staff Auditor'}</span>
                        <span>Due: {tsk.due_date || engagement.due_date}</span>
                      </div>

                      {isBlocked && (
                        <div className="mt-2 bg-rose-100 border border-rose-200 text-rose-900 px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>
                            <strong>Blocked by {tsk.blocked_by}:</strong> {tsk.blocker_reason}
                          </span>
                        </div>
                      )}
                    </div>

                    {isAuditorOrAdmin && engagement.status !== 'CLOSED' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={tsk.status}
                          onChange={(e) => handleUpdateTaskStatus(tsk, e.target.value as TaskStatus)}
                          className="text-xs font-mono bg-white border border-[#E5E5E0] rounded px-2.5 py-1.5 text-[#111110]"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="BLOCKED">BLOCKED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: ENGAGEMENT ISSUES & BLOCKERS */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E0] pb-4 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#111110]">Engagement Issues & Blockers</h3>
                <p className="text-xs font-mono text-[#777770]">
                  Unresolved issues directly block engagement sign-off and final closure verification.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#777770]">
                  Open: <strong className={openIssues.length > 0 ? 'text-rose-600' : 'text-emerald-700'}>{openIssues.length}</strong> of {issues.length}
                </span>
                {isAuditorOrAdmin && engagement.status !== 'CLOSED' && (
                  <button
                    onClick={() => setCreateIssueModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ LOG ISSUE / BLOCKER</span>
                  </button>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-[#E5E5E0] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#777770]">TOTAL LOGGED ISSUES</span>
                <p className="text-2xl font-bold font-mono text-[#111110] mt-1">{issues.length}</p>
              </div>
              <div className={`p-4 bg-white border rounded-lg ${openIssues.length > 0 ? 'border-rose-300 bg-rose-50/40' : 'border-[#E5E5E0]'}`}>
                <span className="text-[10px] font-mono uppercase text-[#777770]">OPEN BLOCKERS</span>
                <p className={`text-2xl font-bold font-mono mt-1 ${openIssues.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {openIssues.length}
                </p>
              </div>
              <div className="p-4 bg-white border border-[#E5E5E0] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#777770]">CLIENT DEPENDENCY</span>
                <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
                  {issues.filter((i) => i.blocked_by_client && i.status !== 'RESOLVED').length}
                </p>
              </div>
            </div>

            {/* Issues List */}
            {issues.length === 0 ? (
              <div className="bg-white border border-[#E5E5E0] rounded-lg p-10 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-[#111110]">No Issues or Blockers Recorded</h4>
                <p className="text-xs font-mono text-[#777770] max-w-md mx-auto">
                  There are currently no active bottlenecks, documentation defects, or pending client dependencies on this engagement.
                </p>
                {isAuditorOrAdmin && engagement.status !== 'CLOSED' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setCreateIssueModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log First Issue</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#E5E5E0] rounded-lg overflow-hidden divide-y divide-[#F0F0EC]">
                {issues.map((issue) => {
                  const isResolved = issue.status === 'RESOLVED' || issue.status === 'CLOSED';
                  return (
                    <div key={issue.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {issue.status}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            issue.priority === 'URGENT' || issue.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {issue.priority}
                          </span>
                          {issue.blocked_by_client && (
                            <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                              CLIENT DEPENDENCY
                            </span>
                          )}
                          <h4 className={`text-sm font-semibold ${isResolved ? 'line-through text-[#777770]' : 'text-[#111110]'}`}>
                            {issue.title}
                          </h4>
                        </div>
                        {issue.description && (
                          <p className="text-xs text-[#555550] pl-1">{issue.description}</p>
                        )}
                        <div className="text-[11px] font-mono text-[#777770] flex items-center gap-3 pt-1">
                          <span>Logged by: {issue.owner_name || 'Auditor'}</span>
                          {issue.due_date && <span>Target: {issue.due_date}</span>}
                          {issue.resolved_at && (
                            <span className="text-emerald-700 font-medium">
                              Resolved: {new Date(issue.resolved_at).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {isAuditorOrAdmin && engagement.status !== 'CLOSED' && (
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleIssue(issue.id, issue.status)}
                            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                              isResolved
                                ? 'border-[#E5E5E0] bg-white text-[#555550] hover:bg-[#F0F0EC]'
                                : 'border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {isResolved ? 'REOPEN ISSUE' : '✓ MARK RESOLVED'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MAKER-CHECKER APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E0] pb-4">
              <h3 className="text-lg font-serif font-bold text-[#111110]">Multi-Tier Maker-Checker Sign-off Chain</h3>
              <p className="text-xs font-mono text-[#777770]">
                Strict 3-tier sequence: Staff Performer &rarr; Manager Reviewer &rarr; Lead Partner Sign-off.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { gate: 'PERFORMER', title: '1. Staff Performer Sign-off', desc: 'Detailed substantive audit & sample checks complete.' },
                { gate: 'REVIEWER', title: '2. Manager Reviewer Sign-off', desc: 'Audit workpapers and reconciliation verification.' },
                { gate: 'PARTNER', title: '3. Partner Sign-off', desc: 'Final CA partner sign-off and reporting clearance.' },
              ].map((tier, idx) => {
                const approval = approvals.find((a) => a.role_gate === tier.gate);
                const isApproved = approval?.status === 'APPROVED';

                // Hierarchy sequence checks
                const performerApproved = approvals.find((a) => a.role_gate === 'PERFORMER')?.status === 'APPROVED';
                const reviewerApproved = approvals.find((a) => a.role_gate === 'REVIEWER')?.status === 'APPROVED';

                const canSign =
                  tier.gate === 'PERFORMER'
                    ? true
                    : tier.gate === 'REVIEWER'
                    ? performerApproved
                    : reviewerApproved;

                return (
                  <div
                    key={tier.gate}
                    className={`bg-white border rounded-lg p-5 flex flex-col justify-between ${
                      isApproved
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : canSign
                        ? 'border-[#111110]'
                        : 'border-[#E5E5E0] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs text-[#777770]">TIER 0{idx + 1}</span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {approval?.status || 'PENDING'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-[#111110]">{tier.title}</h4>
                      <p className="text-xs text-[#777770] mt-1">{tier.desc}</p>

                      <div className="mt-4 pt-3 border-t border-[#F0F0EC] space-y-1.5 text-xs font-mono">
                        <div className="text-[#555550]">
                          Approver: <strong className="text-[#111110]">{approval?.approver_name || 'Not yet signed'}</strong>
                        </div>
                        {approval?.approved_at && (
                          <div className="text-[#555550]">
                            Date: {new Date(approval.approved_at).toLocaleDateString('en-IN')}
                          </div>
                        )}
                        {approval?.remarks && (
                          <div className="text-[#555550] italic">
                            &ldquo;{approval.remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#F0F0EC]">
                      {isAuditorOrAdmin && !isApproved && canSign && (
                        <button
                          onClick={() => {
                            setSelectedRoleGate(tier.gate as any);
                            setApprovalModalOpen(true);
                          }}
                          className="w-full py-2 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
                        >
                          SIGN OFF & APPROVE &rarr;
                        </button>
                      )}
                      {!canSign && !isApproved && (
                        <div className="text-[11px] font-mono text-[#A1A19A] text-center italic">
                          Awaiting prior tier approval
                        </div>
                      )}
                      {isApproved && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>SIGNATURE VERIFIED</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: BILLING & FEES */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E0] pb-4">
              <h3 className="text-lg font-serif font-bold text-[#111110]">Professional Fee Schedule & Billing</h3>
              <p className="text-xs font-mono text-[#777770]">
                Statutory audit fee breakdown, GST calculation, and payment status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fee Breakdown Card */}
              <div className="bg-white border border-[#E5E5E0] rounded-lg p-6">
                <h4 className="font-mono text-xs font-bold uppercase text-[#111110] border-b border-[#F0F0EC] pb-3 mb-4">
                  Fee Computation Breakdown
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-[#555550]">
                    <span>Professional Base Audit Fee:</span>
                    <span className="font-semibold text-[#111110]">₹{engagement.billing_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#555550]">
                    <span>Goods & Services Tax (GST @ 18%):</span>
                    <span className="font-semibold text-[#111110]">₹{engagement.billing_gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 border-t border-[#E5E5E0] flex justify-between text-sm font-bold text-[#111110]">
                    <span>Total Fee Payable:</span>
                    <span className="text-base text-emerald-700">₹{engagement.billing_total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Settlement Status Card */}
              <div className="bg-white border border-[#E5E5E0] rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[#111110] border-b border-[#F0F0EC] pb-3 mb-4">
                    Settlement Status
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#777770]">Invoice Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          engagement.billing_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {engagement.billing_status}
                      </span>
                    </div>
                    {engagement.payment_reference && (
                      <div className="text-[#555550]">
                        Reference / Txn: <strong>{engagement.payment_reference}</strong>
                      </div>
                    )}
                    {engagement.paid_at && (
                      <div className="text-[#555550]">
                        Settled On: {new Date(engagement.paid_at).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>

                {engagement.billing_status !== 'PAID' && (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="mt-6 py-2.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>RECORD PAYMENT & ISSUE RECEIPT</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: UNIFIED TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="border-b border-[#E5E5E0] pb-4">
              <h3 className="text-lg font-serif font-bold text-[#111110]">Unified Audit Trail & Milestone Timeline</h3>
              <p className="text-xs font-mono text-[#777770]">
                Tamper-evident chronological log of all engagement operations and document actions.
              </p>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white border border-[#E5E5E0] rounded-lg flex items-start gap-3 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#111110] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#111110]">{log.action.replace(/_/g, ' ')}</strong>
                      <span className="text-[#777770]">
                        {new Date(log.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                        {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[#555550] mt-0.5">
                      Actor: {log.actor_name || 'System User'} ({log.actor_role || 'USER'})
                    </div>
                    {Object.keys(log.metadata || {}).length > 0 && (
                      <div className="mt-1 bg-[#F9F9F7] p-2 rounded text-[11px] text-[#444440] overflow-x-auto">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ENGAGEMENT CLOSURE */}
        {activeTab === 'closure' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E0] pb-4">
              <h3 className="text-lg font-serif font-bold text-[#111110]">Engagement Closure & Formal Verification</h3>
              <p className="text-xs font-mono text-[#777770]">
                All 5 prerequisites must be certified prior to final archival and seal.
              </p>
            </div>

            {/* If already closed */}
            {engagement.status === 'CLOSED' ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-serif font-bold text-emerald-950">
                  ENGAGEMENT FORMALLY CONCLUDED & SEALED
                </h4>
                <p className="text-xs font-mono text-emerald-800 max-w-lg mx-auto">
                  Official CA Audit Closure ID: <strong>{engagement.closure_id}</strong> · Sealed on{' '}
                  {engagement.closed_at ? new Date(engagement.closed_at).toLocaleDateString('en-IN') : 'Completed'}
                </p>
                <div className="pt-2">
                  <a
                    href={`/api/engagements/${engagement.id}/report`}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD SIGNED CA CLOSURE REPORT PDF</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5-Gate Checklist Cards */}
                <div className="bg-white border border-[#E5E5E0] rounded-lg divide-y divide-[#F0F0EC]">
                  {closurePrereqs?.checks?.map((chk: any) => (
                    <div key={chk.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {chk.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <h5 className="font-semibold text-sm text-[#111110]">{chk.title}</h5>
                          <p className="text-xs text-[#777770] mt-0.5">{chk.description}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                          chk.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {chk.passed ? 'PASSED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Final Closure Trigger Button */}
                <div className="bg-[#F8F9FA] border border-[#E5E5E0] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-serif font-bold text-base text-[#111110]">
                      {closurePrereqs?.canClose
                        ? 'All 5 Prerequisites Met — Ready to Finalize'
                        : `${closurePrereqs?.passedChecks || 0} of 5 Requirements Satisfied`}
                    </h5>
                    <p className="text-xs font-mono text-[#777770] mt-1">
                      {closurePrereqs?.canClose
                        ? 'Clicking below generates the official tamper-evident Closure ID and issues the dossier.'
                        : 'Complete remaining items before closing this engagement.'}
                    </p>
                  </div>

                  {isAuditorOrAdmin && (
                    <button
                      onClick={() => setCloseModalOpen(true)}
                      disabled={!closurePrereqs?.canClose}
                      className={`px-5 py-2.5 rounded text-xs font-mono font-bold flex items-center gap-2 ${
                        closurePrereqs?.canClose
                          ? 'bg-[#111110] text-white hover:bg-[#2A2A28]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>FINALIZE & SEAL CLOSURE</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* Advance Stage Modal */}
      {advanceStageModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">Advance Operational Stage</h3>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">SELECT TARGET STAGE:</label>
                <select
                  value={targetStageNumber}
                  onChange={(e) => setTargetStageNumber(Number(e.target.value))}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.stage_number}>
                      Stage {s.stage_number}: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#777770] mb-1">AUDIT STAGE NOTE (OPTIONAL):</label>
                <textarea
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="E.g. Completed preliminary field testing; moving to manager review."
                  rows={3}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdvanceStageModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleAdvanceStage}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
              >
                {actionLoading ? 'UPDATING...' : 'CONFIRM ADVANCE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Document Modal */}
      {requestDocModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">
              Request Document from Client
            </h3>
            <p className="text-xs text-[#777770] font-mono">
              Item: <strong>{selectedChecklistItem?.title}</strong>
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">INSTRUCTION / NOTE FOR CLIENT:</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="E.g. Please provide signed PDF with director seal and acknowledgment receipt."
                  rows={3}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
              <div>
                <label className="block text-[#777770] mb-1">DUE DATE (OPTIONAL):</label>
                <input
                  type="date"
                  value={requestDueDate}
                  onChange={(e) => setRequestDueDate(e.target.value)}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRequestDocModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleRequestDocument}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
              >
                {actionLoading ? 'SENDING...' : 'SEND REQUEST'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {addTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">Add Audit Procedure / Task</h3>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">PROCEDURE TITLE:</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g. Fixed asset physical verification sample"
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#777770] mb-1">PRIORITY:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#777770] mb-1">DUE DATE:</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                  >
                  </input>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddTaskModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateTask}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
              >
                {actionLoading ? 'SAVING...' : 'ADD PROCEDURE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Task Blocker Modal */}
      {blockerModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Mark Procedure as BLOCKED</span>
            </h3>
            <p className="text-xs text-[#777770] font-mono">
              Task: <strong>{selectedTask?.title}</strong>
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">BLOCKED BY:</label>
                <input
                  type="text"
                  value={blockedBy}
                  onChange={(e) => setBlockedBy(e.target.value)}
                  placeholder="E.g. Client - Missing June Bank Statement"
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
              <div>
                <label className="block text-[#777770] mb-1">EXACT BLOCKER REASON / RECONCILIATION ISSUE:</label>
                <textarea
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  placeholder="Explain why this procedure cannot proceed..."
                  rows={3}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockerModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleSetBlocker}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-mono hover:bg-rose-700"
              >
                {actionLoading ? 'SAVING...' : 'SET BLOCKER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maker-Checker Sign-off Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">
              Sign Off & Approve: {selectedRoleGate} Gate
            </h3>
            <p className="text-xs text-[#777770] font-mono">
              Signing as: <strong>{currentUser?.name}</strong> ({currentUser?.role})
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">APPROVAL REMARKS / WORKING PAPER NOTE:</label>
                <textarea
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="E.g. Reconciled all sales invoices and verified bank ledgers. Compliant with SA 500."
                  rows={3}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleSubmitApproval(selectedRoleGate, 'APPROVED')}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800"
              >
                {actionLoading ? 'SIGNING...' : 'CONFIRM & SIGN OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Fee Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110]">
              Record Professional Fee Payment
            </h3>
            <div className="bg-[#F8F9FA] p-3 rounded text-xs font-mono text-[#555550] space-y-1">
              <div>Base Fee: ₹{engagement.billing_amount.toLocaleString('en-IN')}</div>
              <div>GST (18%): ₹{engagement.billing_gst.toLocaleString('en-IN')}</div>
              <div className="font-bold text-[#111110] pt-1 border-t border-[#E5E5E0]">
                Total Payable: ₹{engagement.billing_total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">PAYMENT REFERENCE / UTR / TXN ID:</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="E.g. HDFC-NEFT-20260918-0912"
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-mono hover:bg-emerald-800"
              >
                {actionLoading ? 'PROCESSING...' : 'RECORD & ISSUE RECEIPT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Engagement Closure Modal */}
      {closeModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 border border-[#E5E5E0] shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#111110] flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <span>Finalize & Seal CA Engagement Closure</span>
            </h3>
            <p className="text-xs text-[#777770] font-mono">
              This action creates an immutable seal and official ICAI closure dossier.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#777770] mb-1">CLOSURE SUMMARY & CERTIFICATION:</label>
                <textarea
                  value={closureSummary}
                  onChange={(e) => setClosureSummary(e.target.value)}
                  placeholder="Statutory audit concluded with unmodified opinion. All supporting registers verified and archived."
                  rows={3}
                  className="w-full border border-[#E5E5E0] rounded p-2 text-[#111110]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCloseModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-[#777770] hover:text-[#111110]"
              >
                CANCEL
              </button>
              <button
                onClick={handleCloseEngagement}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-[#111110] text-white rounded text-xs font-mono hover:bg-[#2A2A28]"
              >
                {actionLoading ? 'SEALING...' : 'SEAL & CLOSE ENGAGEMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={createIssueModalOpen}
        onClose={() => setCreateIssueModalOpen(false)}
        engagementId={engagement.id}
        onIssueCreated={async () => {
          showToast('Issue / Blocker recorded successfully');
          await fetchEngagementData();
        }}
      />

      {/* Multi-Channel Request Document Modal */}
      <RequestDocumentModal
        isOpen={requestMultiChannelModalOpen}
        onClose={() => setRequestMultiChannelModalOpen(false)}
        engagementId={engagement.id}
        onRequestCreated={async () => {
          showToast('Document request dispatched successfully');
          await fetchEngagementData();
        }}
      />
    </AppShell>
  );
}
