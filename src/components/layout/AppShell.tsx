'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  Shield,
  RefreshCw,
  Sparkles,
  Menu,
  X,
  Building2,
  Check,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Switch role handler
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

  // Reset demo state handler
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

  // Logout handler
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isClient = currentUser.role === 'CLIENT';
  const isAuditor = currentUser.role === 'AUDITOR' || currentUser.role === 'ADMIN';

  const clientNav = [
    { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'All Documents', href: '/client/dashboard', icon: FileText },
    { name: 'Action Required', href: '/client/dashboard?filter=correction', icon: AlertTriangle },
  ];

  const auditorNav = [
    { name: 'Review Workspace', href: '/auditor/dashboard', icon: LayoutDashboard },
    { name: 'Pending Reviews', href: '/auditor/dashboard?filter=pending', icon: Clock },
    { name: 'Under Review', href: '/auditor/dashboard?filter=under_review', icon: FileText },
    { name: 'Corrections Awaiting', href: '/auditor/dashboard?filter=correction', icon: AlertTriangle },
    { name: 'Approved Archive', href: '/auditor/dashboard?filter=approved', icon: CheckCircle2 },
  ];

  const navItems = isClient ? clientNav : auditorNav;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
      {/* Top Evaluation & Role Switcher Bar */}
      <header className="bg-zinc-950 text-zinc-300 px-4 py-2 border-b border-zinc-800/80 text-xs flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5">
          <span className="font-mono uppercase text-[10px] text-zinc-400 tracking-wider">
            Evaluation Role:
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => handleQuickSwitch('client@demo.com')}
              disabled={isSwitching}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentUser.role === 'CLIENT'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {currentUser.role === 'CLIENT' && <Check className="w-3 h-3 stroke-[3]" />}
              <span>Client (ABC Traders)</span>
            </button>

            <button
              onClick={() => handleQuickSwitch('auditor@demo.com')}
              disabled={isSwitching}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentUser.role === 'AUDITOR'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {currentUser.role === 'AUDITOR' && <Check className="w-3 h-3 stroke-[3]" />}
              <span>Auditor (Rahul Sharma, CA)</span>
            </button>

            <button
              onClick={() => handleQuickSwitch('admin@demo.com')}
              disabled={isSwitching}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentUser.role === 'ADMIN'
                  ? 'bg-zinc-100 text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {currentUser.role === 'ADMIN' && <Check className="w-3 h-3 stroke-[3]" />}
              <span>Admin (Partner)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SQLite WAL Active</span>
          </div>

          <NotificationBell />

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reset prototype to clean demo seed data"
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer border border-zinc-800 px-2 py-1 rounded-md hover:bg-zinc-800/50"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <Logo size="md" href={isClient ? '/client/dashboard' : '/auditor/dashboard'} />

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Client Organization Badge if Client */}
          {isClient && (
            <div className="mx-4 my-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-zinc-700 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider block leading-none">
                  Client Account
                </span>
                <span className="text-xs font-bold text-zinc-900 truncate block mt-0.5">
                  ABC Traders Pvt Ltd
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              {isClient ? 'Client Portal' : 'Audit Operations'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-xs text-zinc-900 block truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Header Bar */}
          <div className="md:hidden px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="sm" />
            <div className="w-6" />
          </div>

          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
