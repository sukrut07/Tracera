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
  ArrowRight,
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
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0A0A0A]/60 backdrop-blur-xs font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border-l-[3px] border-[#0A0A0A] h-full flex flex-col shadow-[8px_0_0_#0A0A0A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b-2 border-[#0A0A0A] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#E73520] border border-[#0A0A0A] animate-pulse" />
            <h3 className="text-xs uppercase tracking-widest font-black text-[#0A0A0A]">
              NOTIFICATIONS ({notifications.filter((n) => !n.is_read).length} UNREAD)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              title="Mark all notifications as read"
              className="text-[10px] uppercase text-[#4A4A48] hover:text-[#0A0A0A] font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#E73520]" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 border border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#E73520] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y-2 divide-[#0A0A0A] text-xs">
          {loading && notifications.length === 0 ? (
            <div className="p-12 text-center text-[#777770]">
              Checking for new audit notices...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-[#777770] space-y-1">
              <span className="block font-bold text-[#0A0A0A]">ALL CAUGHT UP</span>
              <span>No unread notifications at this time.</span>
            </div>
          ) : (
            notifications.map((n) => {
              const isCorrection = n.type === 'CORRECTION_REQUIRED';
              const isApproval = n.type === 'DOCUMENT_APPROVED';

              return (
                <div
                  key={n.id}
                  className={`p-4 transition-colors ${
                    !n.is_read ? 'bg-[#FFF2F0]' : 'bg-white hover:bg-[#F7F5EF]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 border border-[#0A0A0A] ${
                          isCorrection
                            ? 'bg-[#E73520] text-white'
                            : isApproval
                            ? 'bg-[#C7F36B] text-[#0A0A0A]'
                            : 'bg-[#5CC8FF] text-[#0A0A0A]'
                        }`}
                      >
                        {n.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#777770]">
                      {new Date(n.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#0A0A0A] text-xs mt-1">
                    {n.title}
                  </h4>

                  <p className="text-[11px] text-[#4A4A48] mt-1 leading-snug">
                    {n.message}
                  </p>

                  {n.document_id && (
                    <div className="mt-2 text-right">
                      <Link
                        href={`/documents/${n.document_id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[10px] font-black text-[#E73520] hover:text-[#0A0A0A] underline uppercase tracking-wider"
                      >
                        <span>VIEW DOCUMENT</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-[#0A0A0A] bg-[#F7F5EF] text-[10px] text-[#777770] flex items-center justify-between font-bold">
          <span>REAL-TIME AUDIT DISPATCH</span>
          <span className="text-[#0A0A0A]">TRACERA ENGINE</span>
        </div>
      </div>
    </div>
  );
}
