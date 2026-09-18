'use client';

import React, { useEffect, useState, useRef } from 'react';

export function TraceCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer and no reduced motion preference
    if (typeof window === 'undefined') return;
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isPointerFine || prefersReducedMotion) {
      return;
    }

    setMounted(true);
    document.body.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor');
      const isButton = target.closest('button, .neo-btn, [role="button"], a, input, select, textarea');
      const isDocument = cursorAttr === 'document' || target.closest('[data-doc], .cursor-doc');
      const isTrace = cursorAttr === 'trace' || target.closest('.cursor-trace, [data-workflow]');

      setIsInteractive(Boolean(isButton || isDocument || isTrace || cursorAttr));
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    let animId: number;
    const render = () => {
      // Direct update for dot
      dotPos.current.x = mousePos.current.x;
      dotPos.current.y = mousePos.current.y;

      // Smooth lag interpolation for red ring & label
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. Black Central Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[4px] -mt-[4px] w-[8px] h-[8px] bg-[#0A0A0A] rounded-full will-change-transform z-10"
      />

      {/* 2. Red Trailing Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-[18px] -mt-[18px] will-change-transform pointer-events-none"
      >
        <div
          className={`rounded-full border-2 transition-all duration-150 ${
            isInteractive
              ? 'w-[36px] h-[36px] border-[#E73520] bg-[#E73520]/15 scale-110'
              : 'w-[36px] h-[36px] border-[#E73520]/80 bg-transparent'
          }`}
        />
      </div>
    </div>
  );
}
