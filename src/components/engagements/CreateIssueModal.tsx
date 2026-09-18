'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Plus, Loader2 } from 'lucide-react';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagementId: string;
  onIssueCreated: (issue: any) => void;
}

export function CreateIssueModal({
  isOpen,
  onClose,
  engagementId,
  onIssueCreated,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [blockedByClient, setBlockedByClient] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Issue title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/engagements/${engagementId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
          blockedByClient,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to log issue');
      }

      onIssueCreated(data.issue);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Error logging issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-md font-mono text-xs">
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-[#0A0A0A]">
              Log Blocker / Audit Issue
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F7F5EF] border border-transparent hover:border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#0A0A0A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-[#E73520] text-[#E73520] font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Issue Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bank statement unconfirmed discrepancy in Q2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide evidence or reason preventing stage advancement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Blocker)</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="blockedByClient"
              checked={blockedByClient}
              onChange={(e) => setBlockedByClient(e.target.checked)}
              className="w-4 h-4 accent-[#E73520] cursor-pointer"
            />
            <label htmlFor="blockedByClient" className="text-xs font-bold text-[#0A0A0A] cursor-pointer">
              Blocked by client pending document / clarification
            </label>
          </div>

          <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-[#E73520] hover:border-[#E73520] transition-colors cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging Issue...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
