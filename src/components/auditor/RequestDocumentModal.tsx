'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Plus, Loader2, MessageSquare, Mail, Phone, HardDrive, ExternalLink } from 'lucide-react';
import { Engagement, UserProfile } from '@/types';

interface RequestDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: (req: any) => void;
  engagementId?: string;
}

export function RequestDocumentModal({
  isOpen,
  onClose,
  onRequestCreated,
  engagementId: initialEngId,
}: RequestDocumentModalProps) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [engagementId, setEngagementId] = useState(initialEngId || '');
  const [documentType, setDocumentType] = useState('PURCHASE_REGISTER');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [channels, setChannels] = useState<string[]>(['TRACERA', 'EMAIL']);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEngId) setEngagementId(initialEngId);
  }, [initialEngId]);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    async function loadEngs() {
      try {
        const res = await fetch('/api/engagements');
        if (res.ok) {
          const data = await res.json();
          setEngagements(data.engagements || []);
          if (!engagementId && data.engagements?.length > 0) {
            setEngagementId(data.engagements[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadEngs();
  }, [isOpen, engagementId]);

  if (!isOpen) return null;

  const selectedEng = engagements.find((e) => e.id === engagementId);
  const engTitle = selectedEng?.title || 'Audit Engagement';

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((c) => c !== ch) : prev) : [...prev, ch]
    );
  };

  const generateWhatsAppUrl = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Hello, this is from the CA Audit Team for TRACERA Engagement: "${engTitle}".\n\nPlease submit the following audit document:\n- Document: ${documentType.replace(/_/g, ' ')}\n- Due Date: ${dueDate || 'Immediate'}\n${description ? `- Note: ${description}\n` : ''}\nYou can upload directly to your TRACERA Client Workspace. Thank you!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const generateMailtoUrl = () => {
    const subject = `[TRACERA Audit Request] ${documentType.replace(/_/g, ' ')} required for ${engTitle}`;
    const body = `Dear Client,\n\nDuring our statutory audit procedure for "${engTitle}", we require the following document:\n\nDocument: ${documentType.replace(/_/g, ' ')}\nTarget Due Date: ${dueDate || 'Promptly'}\nDetails: ${description || 'Please refer to the client portal.'}\n\nPlease submit your working file directly on the TRACERA portal.\n\nRegards,\nTRACERA Statutory Audit Team`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType.trim()) {
      setError('Document type is required');
      return;
    }
    if (!engagementId) {
      setError('Please select or create an engagement first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let combinedDesc = description.trim();
      if (channels.includes('GOOGLE_DRIVE') && driveUrl.trim()) {
        combinedDesc += ` [Google Drive: ${driveUrl.trim()}]`;
      }
      if (channels.includes('PHONE') && callNotes.trim()) {
        combinedDesc += ` [Phone Call Logged: ${callNotes.trim()}]`;
      }

      const res = await fetch(`/api/engagements/${engagementId}/document-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          description: combinedDesc || undefined,
          dueDate: dueDate || undefined,
          channels,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit document request');
      }

      onRequestCreated(data.request);
      onClose();
      setDescription('');
      setPhone('');
      setEmail('');
      setDriveUrl('');
      setCallNotes('');
    } catch (err: any) {
      setError(err.message || 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-lg max-h-[90vh] overflow-y-auto font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-[#0A0A0A]">
              Request Document From Client
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F7F5EF] border border-transparent hover:border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#0A0A0A]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-[#E73520] text-[#E73520] font-bold">
              {error}
            </div>
          )}

          {engagements.length === 0 && !initialEngId && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
              Notice: No active engagements found. Please create an engagement first.
            </div>
          )}

          {!initialEngId && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                Engagement Room *
              </label>
              <select
                required
                value={engagementId}
                onChange={(e) => setEngagementId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A] font-bold"
              >
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Document Requirement Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A] font-bold"
            >
              <option value="PURCHASE_REGISTER">Purchase Register (Consolidated GSTR-2B)</option>
              <option value="SALES_REGISTER">Sales Register (GSTR-1 Rec)</option>
              <option value="BANK_STATEMENT">Official Bank Statement</option>
              <option value="GST_DOCUMENT">GST Return / Filing Acknowledgement</option>
              <option value="EXPENSE_SUMMARY">Expense Summary & Ledger Breakdown</option>
              <option value="INVOICE">Tax Invoices / Sample Vouchers</option>
              <option value="TDS_CERTIFICATE">TDS Certificate (Form 16A / 26AS)</option>
              <option value="FIXED_ASSET_REGISTER">Fixed Asset Register (CARO 2020)</option>
              <option value="OTHER">Other Custom Working Paper</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Instructions / Specific Auditor Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please provide April-June purchase invoices above ₹50,000 for statutory vouching."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Target Submission Deadline
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A] font-bold"
            />
          </div>

          {/* Dispatch Channels */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Dispatch Channels (Multi-Channel Trace)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'TRACERA', label: 'TRACERA Portal', icon: Send },
                { id: 'WHATSAPP', label: 'WhatsApp Link', icon: MessageSquare },
                { id: 'EMAIL', label: 'Email Dispatch', icon: Mail },
                { id: 'GOOGLE_DRIVE', label: 'Google Drive', icon: HardDrive },
                { id: 'PHONE', label: 'Phone Call Log', icon: Phone },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-2.5 border-2 text-left flex items-center gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/30 hover:border-[#0A0A0A]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-bold">{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Channel-Specific Configuration Panels */}
            {channels.includes('WHATSAPP') && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-700 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-emerald-700" />
                    WhatsApp Direct Link
                  </span>
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-emerald-800 underline flex items-center gap-1 hover:text-black"
                  >
                    <span>TEST WA.ME LINK</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  placeholder="Client Phone Number with Country Code (e.g. 919876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-emerald-600 text-xs font-mono text-[#0A0A0A]"
                />
              </div>
            )}

            {channels.includes('EMAIL') && (
              <div className="p-3 bg-blue-50 border-2 border-blue-700 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-blue-700" />
                    Email Dispatch
                  </span>
                  <a
                    href={generateMailtoUrl()}
                    className="text-[10px] font-black text-blue-800 underline flex items-center gap-1 hover:text-black"
                  >
                    <span>OPEN CLIENT MAILTO</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="email"
                  placeholder="Client Email Address (e.g. accounts@client.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-600 text-xs font-mono text-[#0A0A0A]"
                />
              </div>
            )}

            {channels.includes('GOOGLE_DRIVE') && (
              <div className="p-3 bg-amber-50 border-2 border-amber-700 space-y-2 mt-2">
                <span className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3 text-amber-700" />
                  Google Drive Destination URL
                </span>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-600 text-xs font-mono text-[#0A0A0A]"
                />
              </div>
            )}

            {channels.includes('PHONE') && (
              <div className="p-3 bg-zinc-100 border-2 border-zinc-700 space-y-2 mt-2">
                <span className="text-[10px] font-bold text-zinc-900 uppercase flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-zinc-700" />
                  Phone Call Log Notes
                </span>
                <input
                  type="text"
                  placeholder="e.g. Spoke with CFO, promised delivery by Wednesday."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-600 text-xs font-mono text-[#0A0A0A]"
                />
              </div>
            )}

            <p className="text-[10px] text-[#555555] font-bold pt-1">
              Every dispatched channel logs an append-only timeline event in the engagement audit log.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-[#0A0A0A] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-[#F7F5EF] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!initialEngId && engagements.length === 0)}
              className="px-5 py-2 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-bold text-xs uppercase hover:bg-[#E73520] hover:border-[#E73520] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
