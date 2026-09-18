'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import {
  Building2,
  UserCheck,
  Shield,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = directEmail || email;

    if (!loginEmail.trim()) {
      setError('Please enter your email address');
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

  const handleResetDemo = async () => {
    setResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch('/api/dev/reset', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Demo database reset to initial seed state.');
        setTimeout(() => setResetMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" href="/" className="justify-center mb-4" />
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
          Welcome back.
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Continue managing your audit workflow.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-zinc-200/90 rounded-3xl sm:px-8">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Demo Feedback */}
          {resetMessage && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-800">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resetMessage}</span>
            </div>
          )}

          {/* Real Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700">
                  Password
                </label>
                <span className="text-[11px] text-zinc-400">Default: demo1234</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white placeholder:text-zinc-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Demo Personas Evaluation Drawer */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Evaluation Demo Accounts
              </span>
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={resetting}
                className="text-[10px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset database back to initial state"
              >
                <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset Demo State</span>
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'client@demo.com')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/80 hover:border-zinc-300 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block group-hover:text-zinc-950">
                      Client: ABC Traders
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      client@demo.com • FY 2024-25
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                  CLIENT
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin(undefined, 'auditor@demo.com')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/80 hover:border-zinc-300 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block group-hover:text-zinc-950">
                      Auditor: Rahul Sharma
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      auditor@demo.com • CA Reviewer
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  AUDITOR
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Trecera Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
