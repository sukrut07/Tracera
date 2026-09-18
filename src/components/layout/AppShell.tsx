'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Sliders,
  RefreshCw,
  Search,
  Check,
  Building2,
  Menu,
  X,
  Command,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { Logo } from '@/components/shared/Logo';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';

interface AppShellProps {
  currentUser?: UserProfile | null;
  children: React.ReactNode;
}

export function AppShell({ currentUser, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch unread notifications count
  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.notifications) {
        setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // Quick switch between evaluation roles
  const handleQuickSwitch = async (email: string, targetPath?: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = targetPath || data.redirectTo || '/auditor/dashboard';
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

  const isPartnerPath = pathname.startsWith('/partner');

  const activeUser: UserProfile = currentUser || {
    id: 'usr-guest',
    name: pathname.startsWith('/client')
      ? 'Client User'
      : isPartnerPath
      ? 'Partner'
      : pathname.startsWith('/admin')
      ? 'Admin'
      : 'Auditor',
    email: pathname.startsWith('/client')
      ? 'client@demo.com'
      : isPartnerPath
      ? 'partner@demo.com'
      : pathname.startsWith('/admin')
      ? 'admin@demo.com'
      : 'auditor@demo.com',
    role: pathname.startsWith('/client')
      ? 'CLIENT'
      : isPartnerPath
      ? 'PARTNER'
      : pathname.startsWith('/admin')
      ? 'ADMIN'
      : 'AUDITOR',
    client_id: null,
    created_at: '',
  };

  const isClient = activeUser.role === 'CLIENT';
  const isAdmin = activeUser.role === 'ADMIN';
  const isAuditor = activeUser.role === 'AUDITOR' && !isPartnerPath;
  const isPartner = activeUser.role === 'PARTNER' || isPartnerPath;

  // Role-specific navigation links
  const clientNav = [
    { name: 'Overview', href: '/client/dashboard' },
    { name: 'Engagements', href: '/client/engagements' },
    { name: 'Documents', href: '/client/documents' },
    { name: 'Action Required', href: '/client/action-required' },
    { name: 'History', href: '/client/history' },
  ];

  const auditorNav = [
    { name: 'Overview', href: '/auditor/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'My Work', href: '/auditor/my-work' },
    { name: 'Review Queue', href: '/auditor/reviews' },
    { name: 'Documents', href: '/auditor/dashboard?filter=all' },
    { name: 'History', href: '/auditor/history' },
  ];

  const partnerNav = [
    { name: 'Partner Desk', href: '/partner/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Approvals Queue', href: '/partner/dashboard#approvals' },
    { name: 'Practice History', href: '/auditor/history' },
  ];

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Templates', href: '/admin/workflows' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Documents', href: '/admin/documents' },
    { name: 'Evaluation Tools', href: '/admin/evaluation-tools' },
  ];

  const navItems = isClient
    ? clientNav
    : isPartner
    ? partnerNav
    : isAdmin
    ? adminNav
    : auditorNav;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#0A0A0A] font-sans antialiased">
      {/* 1. Evaluation Persona / Utility Strip */}
      <div className="bg-[#0A0A0A] text-[#A1A19A] text-[11px] font-mono px-6 py-2 border-b-2 border-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#E73520] animate-pulse border border-white" />
          <span className="uppercase tracking-widest text-[#777770] text-[10px] font-bold">
            PERSONA:
          </span>
          <span className="text-white font-bold">
            {activeUser.name} ({activeUser.role})
          </span>
          {activeUser.organization && (
            <span className="hidden sm:inline-block text-[#888880]">
              · {activeUser.organization}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#777770] uppercase tracking-wider hidden md:inline">
              SWITCH ROLE:
            </span>
            <button
              onClick={() => handleQuickSwitch('client@demo.com', '/client/dashboard')}
              disabled={isSwitching}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeUser.role === 'CLIENT'
                  ? 'text-[#E73520] font-black underline underline-offset-4'
                  : ''
              }`}
            >
              Client
            </button>
            <span className="text-[#444440]">/</span>
            <button
              onClick={() => handleQuickSwitch('auditor@demo.com', '/auditor/dashboard')}
              disabled={isSwitching}
              className={`hover:text-white transition-colors cursor-pointer ${
                isAuditor ? 'text-[#E73520] font-black underline underline-offset-4' : ''
              }`}
            >
              Auditor
            </button>
            <span className="text-[#444440]">/</span>
            <button
              onClick={() => handleQuickSwitch('partner@demo.com', '/partner/dashboard')}
              disabled={isSwitching}
              className={`hover:text-white transition-colors cursor-pointer ${
                isPartner ? 'text-[#E73520] font-black underline underline-offset-4' : ''
              }`}
            >
              Partner
            </button>
            <span className="text-[#444440]">/</span>
            <button
              onClick={() => handleQuickSwitch('admin@demo.com', '/admin/dashboard')}
              disabled={isSwitching}
              className={`hover:text-white transition-colors cursor-pointer ${
                isAdmin && !isPartnerPath
                  ? 'text-[#E73520] font-black underline underline-offset-4'
                  : ''
              }`}
            >
              Admin
            </button>
          </div>

          <span className="text-[#444440]">|</span>

          <Link
            href="/admin/evaluation-tools"
            className="text-[10px] uppercase tracking-wider text-[#E73520] hover:underline font-bold flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Evaluation Tools</span>
          </Link>

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reset database to fresh seed state"
            className="text-[10px] uppercase tracking-wider text-[#A1A19A] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Main Neo-Brutalist Header */}
      <header className="bg-white border-b-[3px] border-[#0A0A0A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo
              size="md"
              href="/"
            />

            <span className="hidden sm:inline text-[#CCCCCC] text-xs font-mono font-bold">
              /
            </span>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.includes('?') && pathname === item.href.split('?')[0]);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs uppercase tracking-wider font-sans transition-colors pb-1 border-b-2 ${
                      isActive
                        ? 'border-[#E73520] text-[#0A0A0A] font-black'
                        : 'border-transparent text-[#4A4A48] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick ⌘K Search Pill */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7F5EF] hover:bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-[11px] font-sans text-[#0A0A0A] font-bold transition-all cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Search className="w-3.5 h-3.5 text-[#E73520]" />
              <span>Search / Commands</span>
              <kbd className="text-[9px] bg-[#0A0A0A] text-white px-1.5 py-0.5 font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Notification Drawer Trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              title="Open Notifications Drawer"
              className="relative p-2 text-[#0A0A0A] bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E73520] border-2 border-[#0A0A0A]" />
              )}
            </button>

            {/* User Profile */}
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l-2 border-[#0A0A0A]">
              <div className="text-right font-sans">
                <span className="block text-xs font-black text-[#0A0A0A] leading-tight">
                  {activeUser.name}
                </span>
                <span className="block text-[10px] uppercase text-[#E73520] tracking-wider font-bold">
                  {isPartner ? 'PARTNER DESK' : activeUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of TRACERA"
              className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#E73520] hover:text-white shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border-2 border-[#0A0A0A] bg-white p-1.5 shadow-[2px_2px_0_#0A0A0A]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#0A0A0A] bg-[#F7F5EF] px-6 py-4 space-y-3 font-sans">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandOpen(true);
              }}
              className="w-full text-left flex items-center justify-between p-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-xs font-bold text-[#0A0A0A]"
            >
              <span>Search / Commands (⌘K)</span>
              <Search className="w-3.5 h-3.5 text-[#E73520]" />
            </button>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-wider text-[#0A0A0A] py-2 border-b border-[#0A0A0A]/20 font-bold"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* 4. Minimal Neo-Brutalist Footer */}
      <footer className="border-t-[3px] border-[#0A0A0A] bg-white mt-auto py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-[11px] font-sans text-[#4A4A48] gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#0A0A0A]">TRACERA</span>
            <span>— CA AUDIT & ENGAGEMENT OPERATING SYSTEM</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="hover:text-[#0A0A0A] font-bold underline cursor-pointer"
            >
              Command Palette (⌘K)
            </button>
            <span>·</span>
            <span className="text-[#0A0A0A] font-bold">Section 143(3) Compliance</span>
            <span>·</span>
            <Link
              href="/admin/evaluation-tools"
              className="text-[#E73520] hover:underline font-black"
            >
              Evaluation Tools
            </Link>
          </div>
        </div>
      </footer>

      {/* 5. Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* 6. Notification Slide-Over Drawer */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNotificationsChange={fetchUnread}
      />
    </div>
  );
}
