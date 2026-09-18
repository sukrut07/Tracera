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
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-xs tracking-wider',
    md: 'text-sm tracking-wider',
    lg: 'text-base tracking-wider',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Audit Glyph */}
      <div
        className={`${iconSizes[size]} bg-[#111110] text-[#FAFAF8] flex items-center justify-center shrink-0 p-1 relative border border-[#111110]`}
        title="TRACERA — Audit Workflow Platform"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="w-full h-full text-white"
        >
          {/* Precise audit connection nodes */}
          <rect x="4" y="4" width="4" height="4" fill="currentColor" />
          <rect x="16" y="10" width="4" height="4" fill="currentColor" />
          <rect x="4" y="16" width="4" height="4" fill="currentColor" />
          <path d="M6 8v8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 6h5a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>

      {showWordmark && (
        <span className={`font-bold text-[#111110] uppercase ${textSizes[size]}`}>
          TRACERA
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
