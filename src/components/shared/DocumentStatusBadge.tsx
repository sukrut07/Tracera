import React from 'react';
import { DocumentStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
  return (
    <StatusBadge
      status={status}
      size={size}
      showDot={showDot}
      className={className}
    />
  );
}
