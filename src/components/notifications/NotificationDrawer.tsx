'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCheck,
} from 'lucide-react';
import { Notification } from '@/types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChange?: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onNotificationsChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      fetchNotifications();
      if (onNotificationsChange) onNotificationsChange();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs font-mono">
      <div
        className="w-full max-w-md bg-white border-l border-[#E5E5E0] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#E03E1A]" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#111110]">
              AUDIT NOTIFICATIONS ({notifications.filter((n) => !n.is_read).length} UNREAD)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              title="Mark all notifications as read"
              className="text-[10px] uppercase text-[#777770] hover:text-[#111110] transition-colors cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark Read</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#777770] hover:text-[#111110] p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E0] text-xs">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-[#777770] space-y-2">
              <div className="w-4 h-4 border-2 border-[#111110] border-t-transparent animate-spin mx-auto" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-[#777770] space-y-2">
              <span className="font-bold text-[#111110] uppercase block">
                ALL CAUGHT UP
              </span>
              <p className="font-sans text-xs text-[#777770]">
                No pending statutory notices or review alerts.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isCorrection = n.type.includes('CORRECTION');
              const isApproval = n.type.includes('APPROVED');

              return (
                <div
                  key={n.id}
                  className={`p-4 transition-colors space-y-2 ${
                    !n.is_read ? 'bg-[#FFFDFB]' : 'hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#777770]">
                    <span
                      className={`font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                        isCorrection
                          ? 'text-[#C2410C] bg-orange-50 border-orange-200'
                          : isApproval
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-[#111110] bg-[#F2F2EE] border-[#E5E5E0]'
                      }`}
                    >
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    <span>{new Date(n.created_at).toLocaleDateString('en-GB')}</span>
                  </div>

                  <h4 className="font-bold text-xs text-[#111110] font-sans">
                    {n.title}
                  </h4>

                  <p className="text-xs text-[#555550] font-sans leading-relaxed">
                    {n.message}
                  </p>

                  {n.link_url && (
                    <div className="pt-1">
                      <Link
                        href={n.link_url}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111110] hover:text-[#E03E1A]"
                      >
                        <span>Open Document Record</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E5E0] bg-[#FAFAF8] text-center text-[10px] text-[#777770]">
          <span>Real-time in-app statutory event stream</span>
        </div>
      </div>
    </div>
  );
}
