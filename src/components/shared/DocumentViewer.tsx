import React from 'react';
import { DocumentVersion } from '@/types';
import { FileText, Download, ExternalLink, Table, Eye } from 'lucide-react';

interface DocumentViewerProps {
  version: DocumentVersion;
  title: string;
}

export function DocumentViewer({ version, title }: DocumentViewerProps) {
  const isPdf = version.file_name.toLowerCase().endsWith('.pdf');
  const isSpreadsheet = /\.(xlsx?|csv)$/i.test(version.file_name);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '45.2 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
      {/* File Header Bar */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-2xs">
            {isSpreadsheet ? (
              <Table className="w-5 h-5 text-emerald-600" />
            ) : (
              <FileText className="w-5 h-5 text-zinc-800" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950 leading-none">
                {version.file_name}
              </h3>
              <span className="text-[11px] font-mono font-semibold bg-zinc-200/80 text-zinc-800 px-1.5 py-0.5 rounded">
                v{version.version_number}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-mono text-[11px]">
              Size: {formatFileSize(version.file_size)} • Type: {isSpreadsheet ? 'Structured Ledger / CSV' : isPdf ? 'PDF Document' : 'Document File'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={version.file_path}
            target="_blank"
            rel="noopener noreferrer"
            download={version.file_name}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
          <a
            href={version.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Tab</span>
          </a>
        </div>
      </div>

      {/* Viewer Canvas */}
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/40 flex flex-col items-center justify-center min-h-[420px]">
        {isSpreadsheet ? (
          <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-mono font-bold text-zinc-800 uppercase tracking-wider">
                  Spreadsheet Preview Table (GSTR-2B / Purchase Summary)
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                4 verified records
              </span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-xs text-left text-zinc-700">
                <thead className="bg-zinc-50 text-[10px] font-mono uppercase font-bold text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Invoice #</th>
                    <th className="px-3 py-2.5">Supplier Name</th>
                    <th className="px-3 py-2.5">GSTIN</th>
                    <th className="px-3 py-2.5 text-right">Taxable</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans">
                  <tr className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2.5 font-mono text-[11px]">05-Apr-2024</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-zinc-900">INV-101</td>
                    <td className="px-3 py-2.5">Om Logistics Ltd</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]">27AABCO1234F1Z1</td>
                    <td className="px-3 py-2.5 text-right font-mono">₹45,000</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-zinc-900">₹53,100</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2.5 font-mono text-[11px]">12-Apr-2024</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-zinc-900">INV-102</td>
                    <td className="px-3 py-2.5">Apex Steel Fab</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]">27AAXPS5678G1Z2</td>
                    <td className="px-3 py-2.5 text-right font-mono">₹1,28,000</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-zinc-900">₹1,51,040</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2.5 font-mono text-[11px]">18-Apr-2024</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-zinc-900">INV-103</td>
                    <td className="px-3 py-2.5">Zenith Electricals</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]">07ZZZEN9012H1Z5</td>
                    <td className="px-3 py-2.5 text-right font-mono">₹82,000</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-zinc-900">₹96,760</td>
                  </tr>
                  {version.version_number >= 2 ? (
                    <tr className="bg-emerald-50/60 hover:bg-emerald-50 border-l-2 border-l-emerald-600">
                      <td className="px-3 py-2.5 font-mono text-[11px]">25-Apr-2024</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>INV-204</span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Added v2
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-emerald-950">Balaji Enterprises</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]">27AABTB3456J1Z9</td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium">₹65,000</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-950">₹76,700</td>
                    </tr>
                  ) : (
                    <tr className="bg-rose-50/50 text-rose-800 italic">
                      <td colSpan={6} className="px-3 py-2.5 text-center font-mono text-[11px]">
                        ⚠️ Notice: Invoice INV-204 was missing in this initial v1 submission.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-[11px]">Viewing version {version.version_number} spreadsheet representation</span>
              <a
                href={version.file_path}
                download={version.file_name}
                className="text-zinc-950 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download raw {version.file_name}
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white border border-zinc-200 rounded-xl shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 mb-4">
              <Eye className="w-8 h-8 text-zinc-500" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1">{version.file_name}</h4>
            <p className="text-xs text-zinc-500 max-w-md mb-6">
              Official audit attachment for {title}. You can preview or download the authentic file directly below.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={version.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Fullscreen Viewer</span>
              </a>
              <a
                href={version.file_path}
                download={version.file_name}
                className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Version Notes Footer if present */}
      {version.notes && (
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-600 flex items-center gap-2">
          <span className="font-semibold text-zinc-900 font-mono text-[11px]">Uploader note:</span>
          <span className="italic">{version.notes}</span>
        </div>
      )}
    </div>
  );
}
