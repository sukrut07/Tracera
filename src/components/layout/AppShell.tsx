'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  ChevronDown,
  ExternalLink,
  Shield,
  RefreshCw,
  Sliders,
  Check,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Logo } from '@/components/shared/Logo';

interface AppShellProps {
  currentUser: UserProfile;
  children: React.ReactNode;
}

export function AppShell({ currentUser, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Quick switch between evaluation roles
  const handleQuickSwitch = async (email: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (err) {
      console.error(err);
      setIsSwitching(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset prototype database back to initial seed data?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/dev/reset', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isClient = currentUser.role === 'CLIENT';
  const isAdmin = currentUser.role === 'ADMIN';
  const isAuditor = currentUser.role === 'AUDITOR';

  // Specific role navigation
  const clientNav = [
    { name: 'Overview', href: '/client/dashboard' },
    { name: 'Documents', href: '/client/documents' },
    { name: 'History', href: '/client/history' },
  ];

  const auditorNav = [
    { name: 'Overview', href: '/auditor/dashboard' },
    { name: 'Review Queue', href: '/auditor/reviews' },
    { name: 'Documents', href: '/auditor/dashboard?filter=all' },
    { name: 'History', href: '/auditor/history' },
  ];

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Documents', href: '/admin/documents' },
    { name: 'Evaluation Tools', href: '/admin/evaluation-tools' },
  ];

  const navItems = isClient ? clientNav : isAdmin ? adminNav : auditorNav;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111110] font-sans antialiased">
      {/* 1. Subtle Evaluation Persona / Utility Strip */}
      <div className="bg-[#111110] text-[#A1A19A] text-[11px] font-mono px-6 py-1.5 border-b border-[#222220] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="uppercase tracking-widest text-[#777770] text-[10px]">
            ACTIVE PERSONA:
          </span>
          <span className="text-[#FAFAF8] font-bold">
            {currentUser.name} ({currentUser.role})
          </span>
          {isClient && (
            <span className="hidden sm:inline-block text-[#777770]">
              · Entity: ABC Traders Pvt Ltd
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#777770] uppercase tracking-wider hidden md:inline">
              Switch:
            </span>
            <button
              onClick={() => handleQuickSwitch('client@demo.com')}
              disabled={isSwitching}
              className={`hover:text-[#FAFAF8] transition-colors cursor-pointer ${
                currentUser.role === 'CLIENT' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
              }`}
            >
              Client
            </button>
            <span className="text-[#333330]">/</span>
            <button
              onClick={() => handleQuickSwitch('auditor@demo.com')}
              disabled={isSwitching}
              className={`hover:text-[#FAFAF8] transition-colors cursor-pointer ${
                currentUser.role === 'AUDITOR' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
              }`}
            >
              Auditor
            </button>
            <span className="text-[#333330]">/</span>
            <button
              onClick={() => handleQuickSwitch('admin@demo.com')}
              disabled={isSwitching}
              className={`hover:text-[#FAFAF8] transition-colors cursor-pointer ${
                currentUser.role === 'ADMIN' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
              }`}
            >
              Admin
            </button>
          </div>

          <span className="text-[#333330]">|</span>

          <Link
            href="/admin/evaluation-tools"
            className="text-[10px] uppercase tracking-wider text-[#E03E1A] hover:underline font-bold flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>Evaluation Tools</span>
          </Link>

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reset database to fresh seed state"
            className="text-[10px] uppercase tracking-wider text-[#A1A19A] hover:text-[#FAFAF8] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Main Editorial Header */}
      <header className="bg-white border-b border-[#E5E5E0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Logo size="md" href={isClient ? '/client/dashboard' : '/auditor/dashboard'} />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs uppercase tracking-wider font-mono transition-colors pb-1 border-b-2 ${
                      isActive
                        ? 'border-[#111110] text-[#111110] font-bold'
                        : 'border-transparent text-[#666660] hover:text-[#111110]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[#E5E5E0]">
              <div className="text-right">
                <span className="block text-xs font-bold text-[#111110] leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] font-mono uppercase text-[#777770] tracking-wider">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of TRACERA"
              className="text-[#666660] hover:text-[#111110] p-2 hover:bg-[#F2F2EE] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#111110] p-1.5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E5E0] bg-white px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-mono uppercase tracking-wider text-[#111110] py-1 font-semibold"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 3. Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* 4. Minimal Editorial Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white mt-auto py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#777770] gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111110]">TRACERA</span>
            <span>— CA Audit Workflow Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Section 143(3) Compliance</span>
            <span>·</span>
            <span>Immutable Audit Trail</span>
            <span>·</span>
            <Link href="/admin/evaluation-tools" className="text-[#E03E1A] hover:underline font-bold">
              Evaluation Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
