'use client';

import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagementId: string;
  totalAmount: number;
  onPaymentRecorded: (engagement: any) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  engagementId,
  totalAmount,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER_NEFT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReference.trim()) {
      setError('Payment transaction reference / UTR is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/engagements/${engagementId}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentReference: `${paymentMethod}: ${paymentReference.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onPaymentRecorded(data.engagement);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] w-full max-w-md font-mono text-xs">
        <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-white">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E73520]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-[#0A0A0A]">
              Record External Payment
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

          <div className="p-3 bg-white border-2 border-[#0A0A0A] space-y-1">
            <span className="text-[10px] text-[#777770] uppercase font-bold block">
              Engagement Total Due
            </span>
            <div className="text-2xl font-black text-[#0A0A0A]">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-800 font-bold block">
              Status will transition to: PAID
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none text-[#0A0A0A]"
            >
              <option value="BANK_TRANSFER_NEFT">NEFT / RTGS Bank Transfer</option>
              <option value="UPI">UPI Reference</option>
              <option value="CHEQUE">Cheque Clearance</option>
              <option value="CASH_DIRECT">Direct Cash Receipt</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              Transaction Reference / UTR Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC20260918009231 or CHQ-004910"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#0A0A0A] focus:outline-none focus:bg-amber-50/20 text-[#0A0A0A]"
            />
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
            Record keeping only. Marking payment records an immutable Section 143(3) timeline event and clears the financial gate requirement for engagement closure.
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
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge Paid</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
