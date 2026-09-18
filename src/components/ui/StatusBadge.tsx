import React from 'react';
import { DocumentStatus, EngagementStatus } from '@/types';

type AnyStatus = DocumentStatus | EngagementStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3 py-1.5 text-xs',
  }[size];

  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  let label = normalized.replace(/_/g, ' ');
  let colorClasses = 'bg-[#F7F5EF] text-[#111111] border-[#0A0A0A]';
  let dotColor = 'bg-[#777777]';

  switch (normalized) {
    case 'SUBMITTED':
      label = 'SUBMITTED';
      colorClasses = 'bg-[#5CC8FF]/20 text-[#0A0A0A] border-[#0A0A0A]';
      dotColor = 'bg-[#0088CC]';
      break;

    case 'UNDER_REVIEW':
    case 'IN_REVIEW':
      label = 'UNDER REVIEW';
      colorClasses = 'bg-[#FFD23F]/30 text-[#0A0A0A] border-[#0A0A0A]';
      dotColor = 'bg-[#D9A000]';
      break;

    case 'CORRECTION_REQUIRED':
      label = 'CORRECTION REQUIRED';
      colorClasses = 'bg-[#FFF2F0] text-[#E73520] border-[#E73520] font-black shadow-[2px_2px_0_#0A0A0A]';
      dotColor = 'bg-[#E73520] animate-pulse';
      break;

    case 'APPROVED':
      label = 'APPROVED';
      colorClasses = 'bg-[#C7F36B]/30 text-[#111111] border-[#0A0A0A] font-bold';
      dotColor = 'bg-emerald-600';
      break;

    case 'COMPLETED':
      label = 'COMPLETED';
      colorClasses = 'bg-[#C7F36B]/50 text-[#111111] border-[#0A0A0A] font-bold';
      dotColor = 'bg-emerald-700';
      break;

    case 'DRAFT':
    case 'PLANNING':
      label = normalized === 'PLANNING' ? 'PLANNING' : 'DRAFT';
      colorClasses = 'bg-white text-[#555555] border-[#0A0A0A]';
      dotColor = 'bg-gray-400';
      break;

    case 'DOCUMENT_COLLECTION':
      label = 'DOCUMENT COLLECTION';
      colorClasses = 'bg-sky-50 text-sky-900 border-[#0A0A0A] font-bold';
      dotColor = 'bg-sky-600';
      break;

    case 'MANAGER_REVIEW':
      label = 'MANAGER REVIEW';
      colorClasses = 'bg-amber-50 text-amber-900 border-[#0A0A0A] font-bold';
      dotColor = 'bg-amber-600';
      break;

    case 'PARTNER_REVIEW':
    case 'READY_TO_CLOSE':
      label = normalized === 'READY_TO_CLOSE' ? 'READY TO CLOSE' : 'PARTNER REVIEW';
      colorClasses = 'bg-[#FFD23F] text-[#0A0A0A] border-[#0A0A0A] font-black shadow-[2px_2px_0_#0A0A0A]';
      dotColor = 'bg-[#0A0A0A] animate-pulse';
      break;

    case 'CLOSED':
      label = 'CLOSED';
      colorClasses = 'bg-emerald-100 text-emerald-950 border-[#0A0A0A] font-black';
      dotColor = 'bg-emerald-700';
      break;

    case 'PAID':
      label = 'PAID';
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-600 font-bold';
      dotColor = 'bg-emerald-600';
      break;

    case 'PAYMENT_PENDING':
    case 'ISSUED':
      label = normalized === 'PAYMENT_PENDING' ? 'PAYMENT PENDING' : 'ISSUED';
      colorClasses = 'bg-amber-50 text-amber-900 border-[#0A0A0A] font-bold';
      dotColor = 'bg-amber-500';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-[0.04em] border-2 ${colorClasses} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
}
