'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Search,
  Command,
  Menu,
  X,
  Shield,
  User,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { Logo } from '@/components/shared/Logo';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { CommandPalette } from '@/components/shared/CommandPalette';

import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

interface AppHeaderProps {
  currentUser?: UserProfile | null;
}

export function AppHeader({ currentUser }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(currentUser || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync or fetch active user
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      fetch('/api/auth/login')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // Global ⌘K listener
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
        setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (fbErr) {
      console.warn('Firebase sign out notice:', fbErr);
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isPartnerPath = pathname.startsWith('/partner');

  const activeUser = user || currentUser;
  if (!activeUser) {
    return null;
  }

  const isClient = activeUser.role === 'CLIENT';
  const isAdmin = activeUser.role === 'ADMIN';
  const isPartner = activeUser.role === 'PARTNER' || isPartnerPath;

  // Role-specific nav items
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
    { name: 'History', href: '/auditor/history' },
  ];

  const partnerNav = [
    { name: 'Partner Desk', href: '/partner/dashboard' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Review Queue', href: '/auditor/reviews' },
    { name: 'Practice History', href: '/auditor/history' },
  ];

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Engagements', href: '/auditor/engagements' },
    { name: 'Workflows', href: '/admin/workflows' },
    { name: 'Documents', href: '/admin/documents' },
  ];

  const navItems = isClient
    ? clientNav
    : isPartner
    ? partnerNav
    : isAdmin
    ? adminNav
    : auditorNav;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F5EF] border-b-[3px] border-[#0A0A0A] font-sans">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo - always navigates to / */}
          <div className="flex items-center gap-6">
            <Logo size="md" href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/auditor/dashboard');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-1.5 text-xs font-bold tracking-wide transition-colors border-2 ${
                      isActive
                        ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[2px_2px_0_#E73520]'
                        : 'border-transparent text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Quick ⌘K Search button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-[#0A0A0A] bg-white text-xs font-bold text-[#4A4A48] hover:text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#E73520]" />
              <span className="hidden md:inline">Quick jump</span>
              <kbd className="text-[10px] bg-[#F7F5EF] px-1 border border-[#0A0A0A] text-[#0A0A0A] font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
              title="Audit Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#E73520] text-white text-[9px] font-bold flex items-center justify-center border border-[#0A0A0A]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Identity Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-[#0A0A0A] bg-white text-xs shadow-[2px_2px_0_#0A0A0A]">
              <span className="w-2 h-2 rounded-full bg-[#E73520]" />
              <span className="font-bold text-[#111111] max-w-[120px] truncate">{activeUser.name}</span>
              <span className="text-[10px] text-[#777777] font-semibold border-l border-[#0A0A0A]/30 pl-2">
                {activeUser.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-rose-50 text-[#0A0A0A] hover:text-[#E73520] shadow-[2px_2px_0_#0A0A0A] cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="lg:hidden p-2 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-[#0A0A0A] bg-white p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-bold text-[#0A0A0A] hover:bg-[#F7F5EF] border border-[#0A0A0A]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Command Palette & Notification Drawer */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
