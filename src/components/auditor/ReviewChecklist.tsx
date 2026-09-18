'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ReviewChecklistProps {
  onChecklistChange?: (allChecked: boolean) => void;
}

export function ReviewChecklist({ onChecklistChange }: ReviewChecklistProps) {
  const [items, setItems] = useState([
    { id: 1, label: 'Document readable & clear', checked: true },
    { id: 2, label: 'Required fields present', checked: true },
    { id: 3, label: 'Supporting information present', checked: false },
    { id: 4, label: 'Amount verified', checked: false },
  ]);

  const toggle = (id: number) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      if (onChecklistChange) {
        onChecklistChange(next.every((i) => i.checked));
      }
      return next;
    });
  };

  const completedCount = items.filter((i) => i.checked).length;

  return (
    <div className="border border-[#E5E5E0] bg-white p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold">
          4-POINT CA VERIFICATION CHECKLIST
        </span>
        <span className="text-[10px] text-[#111110] bg-[#F2F2EE] px-2 py-0.5 border border-[#E5E5E0]">
          {completedCount} / {items.length} Checked
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`w-full text-left flex items-center gap-2.5 p-2 border transition-colors cursor-pointer ${
              item.checked
                ? 'bg-[#FAFAF8] border-[#111110] text-[#111110]'
                : 'bg-white border-[#E5E5E0] text-[#777770] hover:border-[#111110]'
            }`}
          >
            <div
              className={`w-4 h-4 flex items-center justify-center border shrink-0 transition-colors ${
                item.checked
                  ? 'bg-[#111110] border-[#111110] text-white'
                  : 'border-[#CCCCCC] bg-white'
              }`}
            >
              {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className={`text-xs font-mono ${item.checked ? 'font-bold text-[#111110]' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
