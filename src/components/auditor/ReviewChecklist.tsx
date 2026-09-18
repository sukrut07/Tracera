'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

export function ReviewChecklist() {
  const [items, setItems] = useState([
    { id: 1, label: 'Document type and financial assessment year match audit period', checked: true },
    { id: 2, label: 'Statutory fields present (Invoice date, Supplier GSTIN, Tax breakup)', checked: true },
    { id: 3, label: 'Arithmetic calculations verified (Taxable Value + Tax = Total)', checked: false },
    { id: 4, label: 'Supplier GSTIN status verified against GST portal records', checked: false },
    { id: 5, label: 'Document is authentic, clearly legible, and reconciled with ledger', checked: true },
  ]);

  const toggle = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
          5-Point Auditor Checklist
        </h4>
        <span className="text-[10px] font-mono font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          {completedCount} / {items.length} Checked
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              item.checked
                ? 'bg-zinc-50 text-zinc-900 border border-zinc-200/80 shadow-2xs'
                : 'text-zinc-500 hover:bg-zinc-50/60'
            }`}
          >
            <div
              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-colors ${
                item.checked
                  ? 'bg-zinc-950 border-zinc-950 text-white'
                  : 'border-zinc-300 bg-white'
              }`}
            >
              {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className={item.checked ? 'font-medium text-zinc-900 leading-snug' : 'leading-snug'}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] font-mono text-zinc-400 mt-2.5">
        Standard Operating Procedure (SOP) under Section 143(3) review protocol.
      </p>
    </div>
  );
}
