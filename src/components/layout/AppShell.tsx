'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  LogOut,
  Search,
  Menu,
  X,
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
  const [user, setUser] = useState<UserProfile | null>(currentUser || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real user from session if not passed as prop
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      return;
    }
    fetch('/api/auth/login')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [currentUser]);

  // Global ⌘K shortcut
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

  // Poll unread notifications
  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.notifications) {
        // Use consistent 'read' field name
        setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
      }
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Derive navigation from authenticated user's role (not from URL)
  const role = user?.role;

  const clientNav = [
    { name: 'Overview', href: '/client/dashboard' },
    { name: 'Engagements', href: '/client/engagements' },
    { name: 'Documents', href: '/client/documents' },
    { name: 'Action required', href: '/client/action-required' },
    { name: 'History', href: '/client/history' },
  ];

  const auditorNav = [
    { name: 'Overview', href: '/auditor/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'My work', href: '/auditor/my-work' },
    { name: 'Review queue', href: '/auditor/reviews' },
    { name: 'History', href: '/auditor/history' },
  ];

  const partnerNav = [
    { name: 'Partner desk', href: '/partner/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Approvals', href: '/partner/dashboard#approvals' },
    { name: 'History', href: '/auditor/history' },
  ];

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Templates', href: '/admin/workflows' },
    { name: 'Documents', href: '/admin/documents' },
  ];

  const navItems =
    role === 'CLIENT'
      ? clientNav
      : role === 'PARTNER'
      ? partnerNav
      : role === 'ADMIN'
      ? adminNav
      : auditorNav; // default for AUDITOR and unauthenticated (will redirect via middleware)

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#0A0A0A] font-sans antialiased">
      {/* Main Header */}
      <header className="bg-white border-b-[3px] border-[#0A0A0A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" href="/" />

            <span className="hidden sm:inline text-[#CCCCCC] text-xs font-bold">/</span>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' &&
                    !item.href.includes('#') &&
                    pathname.startsWith(item.href.split('?')[0]) &&
                    item.href !== '/auditor/dashboard');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs font-bold transition-colors pb-1 border-b-2 ${
                      isActive
                        ? 'border-[#E73520] text-[#0A0A0A]'
                        : 'border-transparent text-[#4A4A48] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Search / ⌘K */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7F5EF] hover:bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-[11px] font-bold text-[#0A0A0A] transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#E73520]" />
              <span className="hidden md:inline">Search</span>
              <kbd className="text-[9px] bg-[#0A0A0A] text-white px-1.5 py-0.5 font-bold">⌘K</kbd>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-[#0A0A0A] bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E73520] border-2 border-[#0A0A0A]" />
              )}
            </button>

            {/* User Identity */}
            {user && (
              <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l-2 border-[#0A0A0A]">
                <div className="text-right">
                  <span className="block text-xs font-bold text-[#0A0A0A] leading-tight">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-[#E73520] font-bold uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#E73520] hover:text-white shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border-2 border-[#0A0A0A] bg-white p-1.5 shadow-[2px_2px_0_#0A0A0A]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#0A0A0A] bg-[#F7F5EF] px-6 py-4 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); setCommandOpen(true); }}
              className="w-full text-left flex items-center justify-between p-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-xs font-bold text-[#0A0A0A]"
            >
              <span>Search (⌘K)</span>
              <Search className="w-3.5 h-3.5 text-[#E73520]" />
            </button>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs text-[#0A0A0A] py-2 border-b border-[#0A0A0A]/20 font-bold"
              >
                {item.name}
              </Link>
            ))}

            {user && (
              <div className="pt-2 border-t border-[#0A0A0A]/20 text-xs text-[#555550]">
                Signed in as <strong className="text-[#0A0A0A]">{user.name}</strong> ({user.role})
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-[3px] border-[#0A0A0A] bg-white mt-auto py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-[11px] text-[#4A4A48] gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0A0A0A]">TRACERA</span>
            <span>— CA Audit &amp; Engagement Workflow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="hover:text-[#0A0A0A] font-bold underline cursor-pointer"
            >
              Command palette (⌘K)
            </button>
            {role === 'ADMIN' && (
              <>
                <span>·</span>
                <Link
                  href="/admin/evaluation-tools"
                  className="text-[#E73520] hover:underline font-bold"
                >
                  Evaluation tools
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNotificationsChange={fetchUnread}
      />
    </div>
  );
}
