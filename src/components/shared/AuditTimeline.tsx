import React from 'react';
import { AuditLog } from '@/types';
import {
  UploadCloud,
  UserCheck,
  Eye,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  FileText,
} from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
        <Shield className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-zinc-700">No audit events recorded yet</p>
        <p className="text-xs text-zinc-400 mt-1 font-mono">Audit logs will appear as workflow actions occur</p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        timeStr: date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { dateStr: isoString, timeStr: '' };
    }
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'DOCUMENT_UPLOADED':
        return {
          title: 'Document Uploaded',
          icon: UploadCloud,
          bgColor: 'bg-zinc-100',
          borderColor: 'border-zinc-300',
          textColor: 'text-zinc-900',
          badgeText: 'Initial Submission',
        };
      case 'DOCUMENT_ASSIGNED':
        return {
          title: 'Document Assigned',
          icon: UserCheck,
          bgColor: 'bg-zinc-100',
          borderColor: 'border-zinc-200',
          textColor: 'text-zinc-800',
          badgeText: 'Assignment',
        };
      case 'REVIEW_STARTED':
        return {
          title: 'Review Started',
          icon: Eye,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          badgeText: 'Audit Review',
        };
      case 'CORRECTION_REQUESTED':
        return {
          title: 'Correction Requested',
          icon: AlertTriangle,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-800',
          badgeText: 'Action Required',
        };
      case 'CORRECTION_UPLOADED':
        return {
          title: 'Correction Uploaded',
          icon: FileCheck,
          bgColor: 'bg-zinc-100',
          borderColor: 'border-zinc-300',
          textColor: 'text-zinc-900',
          badgeText: 'New Version',
        };
      case 'DOCUMENT_APPROVED':
        return {
          title: 'Document Approved',
          icon: CheckCircle2,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-900',
          badgeText: 'CA Sign-off',
        };
      default:
        return {
          title: action,
          icon: FileText,
          bgColor: 'bg-zinc-100',
          borderColor: 'border-zinc-200',
          textColor: 'text-zinc-800',
          badgeText: 'Event',
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-zinc-200 font-sans">
      {logs.map((log, index) => {
        const config = getActionConfig(log.action);
        const Icon = config.icon;
        const { dateStr, timeStr } = formatDate(log.created_at);
        const isLast = index === logs.length - 1;

        return (
          <div key={log.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-2xs transition-transform group-hover:scale-110 ${config.bgColor} ${config.borderColor} ${config.textColor}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${config.textColor}`}>
                    {config.title}
                  </span>
                  {log.metadata.version && (
                    <span className="text-[11px] font-mono font-semibold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                      v{log.metadata.version}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{dateStr}</span>
                  <span className="text-zinc-300">•</span>
                  <span>{timeStr}</span>
                </div>
              </div>

              {/* Event specific details */}
              {log.action === 'DOCUMENT_UPLOADED' && (
                <div className="text-xs text-zinc-600 space-y-1">
                  <p>
                    Uploaded file:{' '}
                    <span className="font-semibold text-zinc-900">
                      {log.metadata.file_name || 'document'}
                    </span>
                  </p>
                  {Boolean(log.metadata.notes) && (
                    <p className="italic text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 text-[11px]">
                      &ldquo;{String(log.metadata.notes)}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {log.action === 'DOCUMENT_ASSIGNED' && (
                <div className="text-xs text-zinc-600">
                  Assigned to auditor:{' '}
                  <span className="font-semibold text-zinc-900">
                    {String(log.metadata.assigned_to_name || 'Rahul Sharma')}
                  </span>
                </div>
              )}

              {log.action === 'REVIEW_STARTED' && (
                <div className="text-xs text-zinc-600">
                  Reviewer:{' '}
                  <span className="font-semibold text-zinc-900">
                    {log.actor_name || 'Auditor'}
                  </span>
                </div>
              )}

              {log.action === 'CORRECTION_REQUESTED' && (
                <div className="mt-1 space-y-1.5">
                  <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                    <span>Reason for Correction:</span>
                    {Boolean(log.metadata.priority) && (
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                        {String(log.metadata.priority)} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-950 bg-rose-50/70 border border-rose-200/80 p-2.5 rounded-lg leading-relaxed font-medium font-sans">
                    &ldquo;{String(log.metadata.reason)}&rdquo;
                  </p>
                </div>
              )}

              {log.action === 'CORRECTION_UPLOADED' && (
                <div className="text-xs text-zinc-600 space-y-1">
                  <p>
                    Uploaded corrected file:{' '}
                    <span className="font-semibold text-zinc-900">
                      {String(log.metadata.file_name || 'corrected document')}
                    </span>{' '}
                    (Version {log.metadata.version})
                  </p>
                  {Boolean(log.metadata.notes) && (
                    <p className="italic text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 text-[11px]">
                      &ldquo;{String(log.metadata.notes)}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {log.action === 'DOCUMENT_APPROVED' && (
                <div className="mt-1 space-y-1">
                  <div className="text-xs text-emerald-800 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified and signed off for statutory audit filing</span>
                  </div>
                  {log.metadata.comment && (
                    <p className="text-xs text-emerald-950 bg-emerald-50/70 border border-emerald-200/70 p-2 rounded-lg font-medium font-sans">
                      Auditor comment: &ldquo;{String(log.metadata.comment)}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Actor & Role footer */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-400" />
                  <span className="font-medium text-zinc-700">
                    {log.actor_name || 'System User'}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-500">
                    {log.actor_role || 'USER'}
                  </span>
                </div>
                {isLast && (
                  <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Latest Event
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
