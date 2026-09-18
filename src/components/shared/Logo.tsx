import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = 'md',
  href = '/',
  showWordmark = true,
  className = '',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm tracking-tight',
    md: 'text-base tracking-tight',
    lg: 'text-xl tracking-tight',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Geometric Audit Trail Glyph */}
      <div
        className={`${iconSizes[size]} bg-zinc-950 text-zinc-50 rounded-lg flex items-center justify-center shadow-xs shrink-0 p-1 relative overflow-hidden`}
        title="Trecera — Traceable Audit Workflow"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-zinc-100"
        >
          {/* Three connected document/audit nodes & trace lines */}
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="18" cy="12" r="2" fill="currentColor" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <path d="M6 8v8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 6h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18 14v-2a4 4 0 0 0-4-4H8" stroke="currentColor" strokeWidth="1.8" opacity="0.4" />
        </svg>
      </div>

      {showWordmark && (
        <span className={`font-black text-zinc-950 font-sans ${textSizes[size]}`}>
          Trecera
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
