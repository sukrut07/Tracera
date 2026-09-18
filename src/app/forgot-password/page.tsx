'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { InteractiveNetworkBackground } from '@/components/canvas/InteractiveNetworkBackground';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFirebaseConfigured && auth) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (fbErr: any) {
          console.warn('Firebase reset notice:', fbErr);
        }
      }

      // Also notify backend
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F5EF] text-[#0A0A0A] flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 font-sans antialiased selection:bg-[#E73520] selection:text-white overflow-hidden">
      {/* 1. Interactive Network Background */}
      <InteractiveNetworkBackground />

      {/* 2. Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-4">
        <Link href="/" className="flex items-center gap-2.5 group" data-cursor="action">
          <div className="w-8 h-8 bg-[#0A0A0A] border-2 border-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#E73520] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5">
            <div className="w-3 h-3 bg-[#E73520] border border-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#0A0A0A] font-sans">
            TRACERA
          </span>
        </Link>

        <Link
          href="/login"
          className="text-xs font-mono uppercase tracking-wider font-bold text-[#4A4A48] hover:text-[#E73520] transition-colors flex items-center gap-1.5"
          data-cursor="action"
        >
          <span>← BACK TO SIGN IN</span>
        </Link>
      </header>

      {/* 3. Centered Password Recovery Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-6">
        <div className="auth-card bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0_#0A0A0A] p-7 sm:p-9 space-y-6">
          {/* Eyebrow and Headline */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E73520] font-black block">
              CREDENTIAL RECOVERY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A0A0A] font-sans uppercase">
              RESET YOUR PASSWORD
            </h1>
            <p className="text-xs text-[#555550] font-mono">
              Enter your work email to receive password reset instructions.
            </p>
          </div>

          <div className="border-t-2 border-[#0A0A0A]" />

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-[#FFF2F0] border-2 border-[#E73520] text-xs text-[#0A0A0A] font-mono flex items-start gap-2 shadow-[2px_2px_0_#E73520]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E73520] mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {submitted ? (
            /* Success confirmation */
            <div className="space-y-5 text-center font-mono py-3">
              <div className="w-12 h-12 mx-auto bg-[#ECFDF5] border-2 border-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#0A0A0A]">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black uppercase text-[#0A0A0A]">
                  RESET LINK DISPATCHED
                </h3>
                <p className="text-xs text-[#555550] leading-relaxed">
                  If an account exists for <span className="font-bold text-[#0A0A0A]">{email}</span>, a secure password reset link has been sent to your inbox.
                </p>
              </div>

              <Link
                href="/login"
                className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white w-full py-3 text-xs uppercase tracking-widest font-black transition-colors flex items-center justify-center gap-2 shadow-[3px_3px_0_#0A0A0A] mt-4"
              >
                <span>RETURN TO SIGN IN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleReset} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-[11px] font-black text-[#0A0A0A]">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                  className="w-full px-3.5 py-3 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] focus:shadow-[2px_2px_0_#0A0A0A] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white w-full py-3.5 text-xs uppercase tracking-widest font-black transition-colors cursor-pointer flex items-center justify-center gap-2 mt-3 shadow-[3px_3px_0_#0A0A0A] disabled:opacity-50"
                data-cursor="action"
              >
                {loading ? (
                  <span>SENDING LINK...</span>
                ) : (
                  <>
                    <span>SEND RESET LINK</span>
                    <Mail className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Return to Login */}
          {!submitted && (
            <div className="pt-4 border-t border-[#0A0A0A]/20 text-center font-mono text-xs">
              <Link
                href="/login"
                className="font-black text-[#4A4A48] hover:text-[#E73520] uppercase tracking-wide"
              >
                ← CANCEL AND RETURN TO SIGN IN
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 4. Bottom Disclaimer */}
      <footer className="relative z-10 max-w-md mx-auto text-center text-[10px] font-mono text-[#777770]">
        <span>Passwords are securely hashed and managed under standard cryptographic standards.</span>
      </footer>
    </div>
  );
}
