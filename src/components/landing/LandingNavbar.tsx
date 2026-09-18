'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5EF] border-b-[3px] border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Brand Identity with technical badge */}
        <Link href="/" className="flex items-center gap-3 group" data-cursor="trace">
          <div className="w-9 h-9 bg-[#0A0A0A] border-2 border-[#0A0A0A] flex items-center justify-center shadow-[3px_3px_0_#E73520] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5">
            <div className="w-3.5 h-3.5 bg-[#E73520] border border-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#0A0A0A] block leading-none font-sans">
              TRACERA
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#4A4A48] block mt-0.5 font-bold">
              CA AUDIT SYSTEM
            </span>
          </div>
        </Link>

        {/* Center: Neo-brutalist Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider font-mono">
          <a
            href="#workflow"
            className="text-[#0A0A0A] hover:text-[#E73520] relative py-1 transition-colors group"
          >
            WORKFLOW
            <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#E73520] transition-all duration-150 group-hover:w-full" />
          </a>
          <a
            href="#problem"
            className="text-[#0A0A0A] hover:text-[#E73520] relative py-1 transition-colors group"
          >
            THE PROBLEM
            <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#E73520] transition-all duration-150 group-hover:w-full" />
          </a>
          <a
            href="#preview"
            className="text-[#0A0A0A] hover:text-[#E73520] relative py-1 transition-colors group"
          >
            PREVIEW
            <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#E73520] transition-all duration-150 group-hover:w-full" />
          </a>
          <a
            href="#security"
            className="text-[#0A0A0A] hover:text-[#E73520] relative py-1 transition-colors group"
          >
            SECURITY
            <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#E73520] transition-all duration-150 group-hover:w-full" />
          </a>
        </nav>

        {/* Right: Enter Workspace Tactile Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="neo-btn bg-[#E73520] text-white px-5 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
            data-cursor="action"
          >
            <span>ENTER WORKSPACE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 border-2 border-[#0A0A0A] bg-white shadow-[2px_2px_0_#0A0A0A]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-[#0A0A0A] bg-[#F7F5EF] px-6 py-5 space-y-4 font-mono text-sm font-bold">
          <a
            href="#workflow"
            onClick={() => setMobileOpen(false)}
            className="block py-2 border-b border-[#0A0A0A]/20"
          >
            01 / WORKFLOW
          </a>
          <a
            href="#problem"
            onClick={() => setMobileOpen(false)}
            className="block py-2 border-b border-[#0A0A0A]/20"
          >
            02 / THE PROBLEM
          </a>
          <a
            href="#preview"
            onClick={() => setMobileOpen(false)}
            className="block py-2 border-b border-[#0A0A0A]/20"
          >
            03 / PREVIEW
          </a>
          <a
            href="#security"
            onClick={() => setMobileOpen(false)}
            className="block py-2 border-b border-[#0A0A0A]/20"
          >
            04 / SECURITY
          </a>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="neo-btn bg-[#E73520] text-white w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
          >
            <span>ENTER WORKSPACE →</span>
          </Link>
        </div>
      )}
    </header>
  );
}
