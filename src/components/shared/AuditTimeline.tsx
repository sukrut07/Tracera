import React, { useState } from 'react';
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
  Download,
  Filter,
} from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-[#0A0A0A] bg-white p-6 neo-box">
        <Shield className="w-8 h-8 text-[#0A0A0A] mx-auto mb-2" />
        <p className="text-xs font-black uppercase text-[#0A0A0A]">No audit events recorded yet</p>
        <p className="text-[11px] text-[#555555] mt-1 font-mono">Audit logs will appear as workflow actions occur</p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString('en-IN', {
          day: '2-digit',
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
          title: 'DOCUMENT UPLOADED',
          icon: UploadCloud,
          badgeText: 'INITIAL SUBMISSION',
          tagBg: 'bg-[#5CC8FF]/20 text-[#0A0A0A]',
        };
      case 'DOCUMENT_ASSIGNED':
        return {
          title: 'AUDITOR ASSIGNED',
          icon: UserCheck,
          badgeText: 'ASSIGNMENT',
          tagBg: 'bg-[#F7F5EF] text-[#0A0A0A]',
        };
      case 'REVIEW_STARTED':
        return {
          title: 'REVIEW COMMENCED',
          icon: Eye,
          badgeText: 'AUDIT EXAMINATION',
          tagBg: 'bg-[#FFD23F]/30 text-[#0A0A0A]',
        };
      case 'CORRECTION_REQUESTED':
        return {
          title: 'CORRECTION REQUIRED',
          icon: AlertTriangle,
          badgeText: 'ACTION REQUIRED',
          tagBg: 'bg-[#FFF2F0] text-[#E73520] font-black',
        };
      case 'CORRECTION_UPLOADED':
        return {
          title: 'CORRECTION SUBMITTED',
          icon: FileCheck,
          badgeText: 'NEW VERSION (V2+)',
          tagBg: 'bg-[#5CC8FF]/30 text-[#0A0A0A]',
        };
      case 'DOCUMENT_APPROVED':
        return {
          title: 'DOCUMENT APPROVED',
          icon: CheckCircle2,
          badgeText: 'CA SIGN-OFF',
          tagBg: 'bg-[#C7F36B]/40 text-[#0A0A0A] font-bold',
        };
      case 'DOCUMENT_REQUESTED':
        return {
          title: 'DOCUMENT REQUEST DISPATCHED',
          icon: FileText,
          badgeText: 'MULTI-CHANNEL REQUEST',
          tagBg: 'bg-[#5CC8FF]/20 text-[#0A0A0A]',
        };
      case 'ISSUE_RECORDED':
        return {
          title: 'AUDIT BLOCKER / ISSUE',
          icon: AlertTriangle,
          badgeText: 'BLOCKER',
          tagBg: 'bg-[#E73520] text-white font-bold',
        };
      default:
        return {
          title: action.replace(/_/g, ' '),
          icon: FileText,
          badgeText: 'SYSTEM AUDIT RECORD',
          tagBg: 'bg-[#F7F5EF] text-[#0A0A0A]',
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const exportTimelineCSV = () => {
    const headers = ['Action,Actor,Role,Timestamp,Metadata'];
    const rows = filteredLogs.map((l) => {
      const meta = JSON.stringify(l.metadata || {}).replace(/"/g, '""');
      return `"${l.action}","${l.actor_name || ''}","${l.actor_role || ''}","${l.created_at}","${meta}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tracera_audit_timeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Controls: Export & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#0A0A0A]">
            IMMUTABLE AUDIT TRAIL ({filteredLogs.length})
          </span>
        </div>

        <button
          onClick={exportTimelineCSV}
          className="px-2.5 py-1 text-xs font-bold border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#0A0A0A]"
          title="Export Audit Trail to CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#E73520]" />
          <span>EXPORT TIMELINE CSV</span>
        </button>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#0A0A0A]">
        {filteredLogs.map((log, index) => {
          const config = getActionConfig(log.action);
          const Icon = config.icon;
          const { dateStr, timeStr } = formatDate(log.created_at);
          const isLatest = index === 0;

          return (
            <div key={log.id} className="relative group">
              {/* Timeline node marker */}
              <div
                className={`absolute -left-6 top-2 w-5 h-5 border-2 border-[#0A0A0A] bg-white flex items-center justify-center shadow-[1px_1px_0_#0A0A0A] ${
                  isLatest ? 'bg-[#E73520] text-white' : 'text-[#0A0A0A]'
                }`}
              >
                <div className={`w-2 h-2 ${isLatest ? 'bg-white' : 'bg-[#0A0A0A]'}`} />
              </div>

              {/* Event Card */}
              <div className="bg-white border-2 border-[#0A0A0A] p-4 shadow-[3px_3px_0_#0A0A0A] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 border border-[#0A0A0A] ${config.tagBg}`}>
                      {config.badgeText}
                    </span>
                    <span className="font-bold text-xs text-[#0A0A0A]">
                      {config.title}
                    </span>
                    {log.metadata.version && (
                      <span className="text-[10px] font-black bg-[#0A0A0A] text-white px-1.5 py-0.5">
                        v{log.metadata.version}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-[#555555] font-bold">
                    <Calendar className="w-3 h-3 text-[#E73520]" />
                    <span>{dateStr}</span>
                    <span>&bull;</span>
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* Event specific details */}
                {log.action === 'DOCUMENT_UPLOADED' && (
                  <div className="text-xs text-[#111111] space-y-1">
                    <p>
                      File:{' '}
                      <span className="font-bold text-[#0A0A0A]">
                        {log.metadata.file_name || 'document'}
                      </span>
                    </p>
                    {Boolean(log.metadata.notes) && (
                      <p className="p-2 bg-[#F7F5EF] border border-[#0A0A0A] text-[11px] text-[#111111]">
                        &ldquo;{String(log.metadata.notes)}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {log.action === 'DOCUMENT_ASSIGNED' && (
                  <div className="text-xs text-[#111111]">
                    Assigned to auditor:{' '}
                    <span className="font-bold text-[#0A0A0A]">
                      {String(log.metadata.assigned_to_name || 'Rahul Sharma')}
                    </span>
                  </div>
                )}

                {log.action === 'REVIEW_STARTED' && (
                  <div className="text-xs text-[#111111]">
                    Reviewer:{' '}
                    <span className="font-bold text-[#0A0A0A]">
                      {log.actor_name || 'Auditor'}
                    </span>
                  </div>
                )}

                {log.action === 'CORRECTION_REQUESTED' && (
                  <div className="space-y-1">
                    <div className="text-xs font-black text-[#E73520]">
                      REASON FOR CORRECTION:
                    </div>
                    <p className="text-xs text-[#0A0A0A] bg-[#FFF2F0] border-2 border-[#E73520] p-2.5 font-bold leading-relaxed">
                      &ldquo;{String(log.metadata.reason)}&rdquo;
                    </p>
                  </div>
                )}

                {log.action === 'CORRECTION_UPLOADED' && (
                  <div className="text-xs text-[#111111] space-y-1">
                    <p>
                      Corrected file:{' '}
                      <span className="font-bold text-[#0A0A0A]">
                        {String(log.metadata.file_name || 'corrected document')}
                      </span>{' '}
                      (Version {log.metadata.version})
                    </p>
                    {Boolean(log.metadata.notes) && (
                      <p className="p-2 bg-[#F7F5EF] border border-[#0A0A0A] text-[11px] text-[#111111]">
                        &ldquo;{String(log.metadata.notes)}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {log.action === 'DOCUMENT_APPROVED' && (
                  <div className="space-y-1">
                    <div className="text-xs text-emerald-800 flex items-center gap-1 font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified and signed off for statutory audit filing</span>
                    </div>
                    {log.metadata.comment && (
                      <p className="text-xs text-[#0A0A0A] bg-[#C7F36B]/20 border border-[#0A0A0A] p-2 font-bold">
                        Auditor comment: &ldquo;{String(log.metadata.comment)}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Actor & Role footer */}
                <div className="pt-2 border-t border-[#0A0A0A]/20 flex items-center justify-between text-[10px] text-[#555555]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#0A0A0A]" />
                    <span className="font-bold text-[#0A0A0A]">
                      {log.actor_name || 'System User'}
                    </span>
                    <span>&bull;</span>
                    <span className="uppercase font-bold text-[#E73520]">
                      {log.actor_role || 'USER'}
                    </span>
                  </div>
                  {isLatest && (
                    <span className="text-[9px] font-black uppercase text-[#E73520] px-1.5 py-0.5 border border-[#E73520]">
                      LATEST EVENT
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
