'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import {
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = directEmail || email;

    if (!loginEmail.trim()) {
      setError('Please enter your work email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      window.location.href = data.redirectTo || '/client/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111110] flex flex-col justify-between py-12 px-6 font-sans antialiased">
      {/* Top minimal header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" href="/" />
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-[#666660] hover:text-[#111110] transition-colors"
        >
          ← Return to Overview
        </Link>
      </div>

      {/* Centered Editorial Auth Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="border border-[#E5E5E0] bg-white p-8 sm:p-10 space-y-6">
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E03E1A] font-bold block">
              SECURE PORTAL ACCESS
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#111110]">
              Sign in to TRACERA
            </h1>
            <p className="text-xs text-[#666660] font-mono">
              Audit workflows, clearly traced.
            </p>
          </div>

          <div className="border-t border-[#E5E5E0]" />

          {/* Error notice */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#9A3412] font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E03E1A]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-[11px] font-bold text-[#111110]">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firm.com or client@demo.com"
                className="w-full px-3 py-2.5 bg-white border border-[#E5E5E0] text-[#111110] text-xs focus:outline-none focus:border-[#111110] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block uppercase tracking-wider text-[11px] font-bold text-[#111110]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password recovery: for evaluation, use any demo persona.')}
                  className="text-[10px] text-[#777770] hover:text-[#111110] underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 bg-white border border-[#E5E5E0] text-[#111110] text-xs focus:outline-none focus:border-[#111110] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111110] hover:bg-[#2A2A28] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E0]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-[#777770]">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLogin(undefined, 'client@demo.com')}
              className="w-full py-2.5 bg-white hover:bg-[#FAFAF8] border border-[#E5E5E0] text-[#111110] text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Quick Evaluation Persona Selectors */}
          <div className="pt-4 border-t border-[#E5E5E0] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777770] font-bold block">
              EVALUATION PERSONAS (1-CLICK TEST):
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                onClick={() => handleLogin(undefined, 'client@demo.com')}
                className="p-2 border border-[#E5E5E0] bg-[#FAFAF8] hover:bg-[#111110] hover:text-white transition-colors text-left cursor-pointer"
              >
                <span className="font-bold block">Client</span>
                <span className="text-[9px] text-[#777770] block truncate">ABC Traders</span>
              </button>

              <button
                onClick={() => handleLogin(undefined, 'auditor@demo.com')}
                className="p-2 border border-[#E5E5E0] bg-[#FAFAF8] hover:bg-[#111110] hover:text-white transition-colors text-left cursor-pointer"
              >
                <span className="font-bold block">Auditor</span>
                <span className="text-[9px] text-[#777770] block truncate">Rahul Sharma</span>
              </button>

              <button
                onClick={() => handleLogin(undefined, 'admin@demo.com')}
                className="p-2 border border-[#E5E5E0] bg-[#FAFAF8] hover:bg-[#111110] hover:text-white transition-colors text-left cursor-pointer"
              >
                <span className="font-bold block">Admin</span>
                <span className="text-[9px] text-[#777770] block truncate">Partner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom minimal disclaimer */}
      <div className="max-w-md mx-auto text-center text-[11px] font-mono text-[#777770]">
        <span>Protected by role-based authorization & Section 143(3) immutable logging.</span>
      </div>
    </div>
  );
}
