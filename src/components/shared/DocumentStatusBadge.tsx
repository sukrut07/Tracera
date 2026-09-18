import React from 'react';
import { DocumentStatus } from '@/types';
import { Clock, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function DocumentStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: DocumentStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-bold tracking-wide gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  switch (status) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-50/80 text-sky-800 border border-sky-200/90 shadow-2xs ${sizeClasses} ${className}`}
          title="Document has been submitted and is waiting in the auditor queue"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
          {showIcon && <Clock className={`${iconSizes} text-sky-600`} />}
          <span>SUBMITTED</span>
        </span>
      );

    case 'UNDER_REVIEW':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50/80 text-amber-800 border border-amber-200/90 shadow-2xs ${sizeClasses} ${className}`}
          title="Document is currently being reviewed by an auditor"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 animate-pulse" />
          {showIcon && <Eye className={`${iconSizes} text-amber-600`} />}
          <span>UNDER REVIEW</span>
        </span>
      );

    case 'CORRECTION_REQUIRED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50/90 text-rose-800 border border-rose-200/90 shadow-2xs ${sizeClasses} ${className}`}
          title="Auditor requested correction. Client action needed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          {showIcon && <AlertCircle className={`${iconSizes} text-rose-600`} />}
          <span>CORRECTION REQUIRED</span>
        </span>
      );

    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50/80 text-emerald-800 border border-emerald-200/90 shadow-2xs ${sizeClasses} ${className}`}
          title="Document has been reviewed and approved by auditor"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          {showIcon && <CheckCircle2 className={`${iconSizes} text-emerald-600`} />}
          <span>APPROVED</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${sizeClasses} ${className}`}
        >
          {status}
        </span>
      );
  }
}
