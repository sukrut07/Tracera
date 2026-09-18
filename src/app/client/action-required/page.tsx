'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditDocument, UserProfile } from '@/types';
import { DocumentStatusBadge } from '@/components/shared/DocumentStatusBadge';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { AppShell } from '@/components/layout/AppShell';

export default function ClientActionRequiredPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [correctionDoc, setCorrectionDoc] = useState<AuditDocument | null>(null);

  const fetchCorrections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (res.ok) {
        const allDocs = data.documents || [];
        const corrections = allDocs.filter(
          (d: AuditDocument) => d.status === 'CORRECTION_REQUIRED'
        );
        setDocuments(corrections);
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCorrections();
  }, [fetchCorrections]);

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: '1',
          name: 'ABC Traders',
          email: 'client@demo.com',
          role: 'CLIENT',
          client_id: 'c1',
          created_at: '',
        }
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#E5E5E0] pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STATUTORY AUDITOR NOTICES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111110] uppercase font-mono">
              Action Required ({documents.length})
            </h1>
            <p className="text-xs text-[#666660] font-sans mt-1">
              The documents below have active revision requests issued by your engagement Chartered Accountant.
            </p>
          </div>

          <button
            onClick={fetchCorrections}
            title="Refresh action items"
            className="p-2 border border-[#E5E5E0] bg-white hover:bg-[#FAFAF8] text-[#111110] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List of items needing correction */}
        {loading && documents.length === 0 ? (
          <div className="p-12 text-center text-[#777770] font-mono text-xs space-y-2">
            <div className="w-5 h-5 border-2 border-[#111110] border-t-transparent animate-spin mx-auto" />
            <span>CHECKING PENDING AUDITOR NOTICES...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="border border-[#E5E5E0] bg-white p-12 text-center space-y-3 font-mono">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#111110] uppercase">
              NO PENDING ACTIONS
            </h3>
            <p className="text-xs text-[#666660] font-sans max-w-sm mx-auto">
              All your submitted audit documents are currently under review or have already received statutory sign-off.
            </p>
            <div className="pt-2">
              <Link
                href="/client/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] text-white text-xs uppercase tracking-wider font-bold"
              >
                ← Return to Overview
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const reasonText =
                doc.latest_review?.remarks ||
                doc.latest_correction_reason ||
                doc.current_review?.comment ||
                'Invoice INV-204 from Balaji Enterprises is missing from ledger. Reconcile with GSTR-2B and re-upload.';

              return (
                <div
                  key={doc.id}
                  className="border-2 border-[#E03E1A] bg-white p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-[#111110] uppercase">
                        {doc.title}
                      </span>
                      <DocumentStatusBadge status={doc.status} size="sm" />
                    </div>

                    <span className="text-xs font-mono text-[#777770]">
                      Current: <strong>Version {doc.current_version}</strong> · Submitted {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  {/* Auditor Reason Callout */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                      AUDITOR REMARKS (RAHUL SHARMA, CA):
                    </span>
                    <p className="text-sm font-sans text-[#111110] bg-orange-50/80 p-4 border-l-2 border-[#E03E1A] leading-relaxed">
                      "{reasonText}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="px-4 py-2 border border-[#111110] bg-white hover:bg-[#FAFAF8] text-[#111110] uppercase tracking-wider font-bold transition-colors"
                    >
                      Review Audit Record
                    </Link>

                    <button
                      onClick={() => setCorrectionDoc(doc)}
                      className="px-5 py-2 bg-[#E03E1A] hover:bg-[#C2410C] text-white uppercase tracking-wider font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Upload Version {doc.current_version + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Correction Modal */}
      {correctionDoc && (
        <UploadCorrectionModal
          isOpen={!!correctionDoc}
          document={correctionDoc}
          onClose={() => setCorrectionDoc(null)}
          onSuccess={() => {
            setCorrectionDoc(null);
            fetchCorrections();
          }}
        />
      )}
    </AppShell>
  );
}
