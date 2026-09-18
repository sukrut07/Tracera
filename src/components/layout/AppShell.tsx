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

  const activeUser: UserProfile = currentUser || {
    id: 'u2222222-2222-2222-2222-222222222222',
    name: pathname.startsWith('/client') ? 'ABC Traders (Client)' : 'Rahul Sharma',
    email: pathname.startsWith('/client') ? 'client@demo.com' : 'auditor@demo.com',
    role: pathname.startsWith('/client') ? 'CLIENT' : 'AUDITOR',
    client_id: pathname.startsWith('/client') ? 'c1111111-1111-1111-1111-111111111111' : null,
    created_at: '',
  };

  const isClient = activeUser.role === 'CLIENT';
  const isAdmin = activeUser.role === 'ADMIN';
  const isAuditor = activeUser.role === 'AUDITOR';

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

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
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
            {activeUser.name} ({activeUser.role})
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
                activeUser.role === 'CLIENT' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
              }`}
            >
              Client
            </button>
            <span className="text-[#333330]">/</span>
            <button
              onClick={() => handleQuickSwitch('auditor@demo.com')}
              disabled={isSwitching}
              className={`hover:text-[#FAFAF8] transition-colors cursor-pointer ${
                activeUser.role === 'AUDITOR' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
              }`}
            >
              Auditor
            </button>
            <span className="text-[#333330]">/</span>
            <button
              onClick={() => handleQuickSwitch('admin@demo.com')}
              disabled={isSwitching}
              className={`hover:text-[#FAFAF8] transition-colors cursor-pointer ${
                activeUser.role === 'ADMIN' ? 'text-[#FAFAF8] font-bold underline underline-offset-4' : ''
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
          <div className="flex items-center gap-8">
            <Logo size="md" href={isClient ? '/client/dashboard' : '/auditor/dashboard'} />

            {/* Breadcrumb separator */}
            <span className="hidden sm:inline text-[#CCCCCC] text-xs font-mono">/</span>

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

          {/* Right Header Controls: ⌘K Command Palette, Notifications, Profile, Logout */}
          <div className="flex items-center gap-3">
            {/* Quick ⌘K Search Pill */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5E0] text-[11px] font-mono text-[#777770] hover:text-[#111110] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search / Commands</span>
              <kbd className="text-[9px] bg-white border border-[#E5E5E0] px-1 py-0.5 rounded-none font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Notification Drawer Trigger with Unread Pill */}
            <button
              onClick={() => setDrawerOpen(true)}
              title="Open Notifications Drawer"
              className="relative p-2 text-[#666660] hover:text-[#111110] hover:bg-[#FAFAF8] border border-transparent hover:border-[#E5E5E0] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E03E1A] rounded-none" />
              )}
            </button>

            {/* User Profile */}
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-[#E5E5E0]">
              <div className="text-right">
                <span className="block text-xs font-bold text-[#111110] leading-tight font-mono">
                  {activeUser.name}
                </span>
                <span className="block text-[10px] font-mono uppercase text-[#777770] tracking-wider">
                  {activeUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of TRACERA"
              className="text-[#666660] hover:text-[#111110] p-2 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
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

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E5E0] bg-white px-6 py-4 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandOpen(true);
              }}
              className="w-full text-left flex items-center justify-between p-2 bg-[#FAFAF8] border border-[#E5E5E0] text-xs font-mono text-[#777770]"
            >
              <span>Search / Commands (⌘K)</span>
              <Search className="w-3.5 h-3.5" />
            </button>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-mono uppercase tracking-wider text-[#111110] py-1.5 font-semibold"
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

      {/* 4. Minimal Editorial Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white mt-auto py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#777770] gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111110]">TRACERA</span>
            <span>— CA Audit Workflow Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="hover:text-[#111110] underline cursor-pointer"
            >
              Command Palette (⌘K)
            </button>
            <span>·</span>
            <span>Section 143(3) Compliance</span>
            <span>·</span>
            <Link href="/admin/evaluation-tools" className="text-[#E03E1A] hover:underline font-bold">
              Evaluation Workspace
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
