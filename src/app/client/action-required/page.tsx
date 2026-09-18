'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UploadCorrectionModal } from '@/components/client/UploadCorrectionModal';
import { AuditDocument, UserProfile } from '@/types';

export default function ActionRequiredPage() {
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctionDoc, setCorrectionDoc] = useState<AuditDocument | null>(null);

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (res.ok) {
        const allDocs: AuditDocument[] = data.documents || [];
        setDocuments(allDocs.filter((d) => d.status === 'CORRECTION_REQUIRED'));
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  return (
    <AppShell
      currentUser={
        currentUser || {
          id: 'usr-client-001',
          name: 'Client User',
          email: 'client@demo.com',
          role: 'CLIENT',
          client_id: null,
          created_at: '',
        }
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header */}
        <div className="border-b-[3px] border-[#0A0A0A] pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#E73520] mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STATUTORY AUDITOR NOTICES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Action Required ({documents.length})
            </h1>
            <p className="text-xs text-[#555550] mt-1">
              The documents below have active revision requests issued by your engagement Chartered Accountant.
            </p>
          </div>

          <button
            onClick={fetchCorrections}
            title="Refresh action items"
            className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List of items needing correction / Empty State */}
        {loading && documents.length === 0 ? (
          <div className="p-12 text-center text-[#555550] text-xs space-y-2 font-bold">
            <div className="w-6 h-6 border-3 border-[#0A0A0A] border-t-[#E73520] animate-spin mx-auto" />
            <span>Checking pending auditor notices...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="neo-box-lg bg-white border-2 border-[#0A0A0A] p-12 text-center space-y-3 shadow-[6px_6px_0_#0A0A0A]">
            <div className="w-12 h-12 bg-[#F7F5EF] border-2 border-[#0A0A0A] text-emerald-700 flex items-center justify-center mx-auto shadow-[2px_2px_0_#0A0A0A]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0A0A0A]">
              No Pending Actions
            </h3>
            <p className="text-xs text-[#666660] max-w-sm mx-auto leading-relaxed">
              All your submitted audit documents are currently under review or have already received statutory sign-off.
            </p>
            <div className="pt-2">
              <Link
                href="/client/dashboard"
                className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>← Return to Overview</span>
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
                'Discrepancy identified during audit verification. Please reconcile and upload the corrected version.';

              return (
                <div
                  key={doc.id}
                  className="neo-box bg-[#FFF2F0] border-2 border-[#0A0A0A] p-6 sm:p-7 space-y-4 shadow-[6px_6px_0_#0A0A0A]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#0A0A0A] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#0A0A0A]">
                        {doc.title}
                      </span>
                      <StatusBadge status={doc.status} size="sm" />
                    </div>

                    <span className="text-xs text-[#555550]">
                      Current: <strong className="text-[#0A0A0A]">Version {doc.current_version}</strong> • Submitted{' '}
                      {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  {/* Auditor Reason Callout */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase tracking-widest text-[#777770] font-bold block">
                      AUDITOR INSTRUCTION ({doc.assigned_auditor?.name || 'ASSIGNED CA'}):
                    </span>
                    <p className="text-sm text-[#0A0A0A] bg-white p-4 border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] font-semibold leading-relaxed">
                      "{reasonText}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                    <Link
                      href={`/client/documents/${doc.id}`}
                      className="neo-btn bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                      Review Audit Record
                    </Link>

                    <button
                      onClick={() => setCorrectionDoc(doc)}
                      className="neo-btn bg-[#E73520] hover:bg-[#D32814] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Version {doc.current_version + 1} →</span>
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
