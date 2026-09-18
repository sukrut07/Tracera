import React from 'react';
import { DocumentStatus } from '@/types';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function DocumentStatusBadge({
  status,
  size = 'md',
  showDot = true,
  className = '',
}: DocumentStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-[11px]',
    lg: 'px-3 py-1 text-xs',
  }[size];

  switch (status) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-none bg-blue-50/90 text-blue-800 border border-blue-200/80 ${sizeClasses} ${className}`}
        >
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
          <span>Submitted</span>
        </span>
      );

    case 'UNDER_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-none bg-amber-50/90 text-amber-800 border border-amber-200/80 ${sizeClasses} ${className}`}
        >
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />}
          <span>Under Review</span>
        </span>
      );

    case 'CORRECTION_REQUIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-none bg-orange-50/90 text-[#C2410C] border border-orange-200/80 ${sizeClasses} ${className}`}
        >
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A] shrink-0" />}
          <span>Correction Required</span>
        </span>
      );

    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-none bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 ${sizeClasses} ${className}`}
        >
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
          <span>Approved</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-none bg-zinc-100 text-zinc-700 border border-zinc-200 ${sizeClasses} ${className}`}
        >
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />}
          <span>{status}</span>
        </span>
      );
  }
}
