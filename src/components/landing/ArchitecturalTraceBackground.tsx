'use client';

import React, { useEffect, useRef, useState } from 'react';

export function ArchitecturalTraceBackground() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Track mouse position smoothly
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: e.clientX / innerWidth,
        y: e.clientY / innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      mediaQuery.removeEventListener('change', handler);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const offsetX = prefersReducedMotion ? 0 : (mousePos.x - 0.5) * 16;
  const offsetY = prefersReducedMotion ? 0 : (mousePos.y - 0.5) * 16;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Fine technical grid */}
      <div
        className="absolute inset-0 opacity-40 bg-subtle-grid transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        }}
      />

      {/* 2. Architectural Trace Lines SVG */}
      <svg
        className="w-full h-full absolute inset-0 opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111110" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#E03E1A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#111110" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Structural axis lines */}
        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="2 6" />
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 8" />

        <line x1="0" y1="28%" x2="100%" y2="28%" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="0" y1="72%" x2="100%" y2="72%" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 8" />

        {/* Flowing animated workflow line */}
        {!prefersReducedMotion ? (
          <path
            d="M -100,120 Q 400,280 800,160 T 1600,240"
            fill="none"
            stroke="url(#traceGrad)"
            strokeWidth="1.5"
            className="animate-workflow-line"
          />
        ) : (
          <path
            d="M -100,120 Q 400,280 800,160 T 1600,240"
            fill="none"
            stroke="url(#traceGrad)"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
}
