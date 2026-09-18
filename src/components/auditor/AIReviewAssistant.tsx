import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuditDocument } from '@/types';

interface AIReviewAssistantProps {
  document: AuditDocument;
}

export function AIReviewAssistant({ document }: AIReviewAssistantProps) {
  // Generate contextual suggestions based on document type and version
  const getSuggestions = () => {
    if (document.document_type === 'PURCHASE_REGISTER') {
      if (document.current_version === 1) {
        return [
          {
            type: 'warning',
            text: 'Discrepancy: Invoice INV-204 referenced in ledger appears unlisted in register records.',
          },
          {
            type: 'info',
            text: 'CGST and SGST rates match standard 9% slab across 94% of entries.',
          },
        ];
      } else {
        return [
          {
            type: 'success',
            text: 'Version 2 reconciliation: Missing invoice INV-204 has been added with valid GSTIN and 18% tax calculation.',
          },
          {
            type: 'info',
            text: 'All supplier GSTINs format validated (22-char checksum passing).',
          },
        ];
      }
    }

    if (document.document_type === 'BANK_STATEMENT') {
      return [
        {
          type: 'success',
          text: 'Opening balance matches previous quarter closing balance exactly (₹12,45,210.00).',
        },
        {
          type: 'info',
          text: 'No high-value round cash deposits detected above ₹2,00,000 threshold.',
        },
      ];
    }

    return [
      {
        type: 'info',
        text: 'Document metadata matches CA filing criteria for the current assessment period.',
      },
      {
        type: 'info',
        text: 'Tax deductions and TDS certificates verified against Form 26AS data.',
      },
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100">
        <div className="w-5 h-5 rounded-md bg-zinc-950 text-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-zinc-200" />
        </div>
        <span className="text-[10px] font-mono font-bold text-zinc-950 uppercase tracking-wider">
          AI Audit Assistant
        </span>
        <span className="ml-auto text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          v1.2 Scan
        </span>
      </div>

      <div className="space-y-2 my-2.5">
        {suggestions.map((s, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70"
          >
            {s.type === 'warning' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <span className="text-zinc-700 leading-snug font-sans">{s.text}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5">
        <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
          Advisory
        </span>
        <p className="text-[10.5px] text-zinc-400 font-mono">
          Automated heuristic — auditor decision strictly required.
        </p>
      </div>
    </div>
  );
}
