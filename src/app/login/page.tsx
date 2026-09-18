'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { InteractiveNetworkBackground } from '@/components/canvas/InteractiveNetworkBackground';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, forward to role dashboard
  useEffect(() => {
    fetch('/api/auth/login')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const redirectMap: Record<string, string> = {
            CLIENT: '/client/dashboard',
            AUDITOR: '/auditor/dashboard',
            PARTNER: '/partner/dashboard',
            ADMIN: '/admin/dashboard',
          };
          window.location.href = redirectMap[data.user.role] || '/client/dashboard';
        }
      })
      .catch(() => {});
  }, []);

  const mapFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential'
    ) {
      return 'Incorrect email or password.';
    }
    if (code === 'auth/invalid-email') return 'Please enter a valid work email address.';
    if (code === 'auth/user-disabled') return 'This account has been disabled. Contact your administrator.';
    if (code === 'auth/network-request-failed') return 'Unable to connect. Check your connection.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again shortly.';
    return err?.message || 'Authentication failed. Please verify your credentials.';
  };

  const handleQuickLogin = async (role: 'CLIENT' | 'AUDITOR' | 'PARTNER') => {
    setLoading(true);
    setError(null);
    try {
      const emailMap = {
        CLIENT: 'client@demo.com',
        AUDITOR: 'auditor@demo.com',
        PARTNER: 'partner@demo.com',
      };
      const redirectMap = {
        CLIENT: '/client/dashboard',
        AUDITOR: '/auditor/dashboard',
        PARTNER: '/partner/dashboard',
      };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailMap[role], password: 'Demo@123456' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quick access failed');
      window.location.href = data.redirectTo || redirectMap[role];
    } catch (err: any) {
      setError(err.message || 'Failed to access dashboard');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your work email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    setError(null);

    try {
      let idToken: string | undefined;

      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          idToken = await userCredential.user.getIdToken();
        } catch (fbErr: any) {
          throw new Error(mapFirebaseError(fbErr));
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      window.location.href = data.redirectTo || '/client/dashboard';
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const idToken = await userCredential.user.getIdToken();

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredential.user.email, idToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No TRACERA account associated with this Google ID.');
        window.location.href = data.redirectTo || '/client/dashboard';
      } else {
        setError('Google Sign-In requires Firebase credentials in .env.local.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(mapFirebaseError(err));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F5EF] text-[#0A0A0A] flex flex-col py-6 sm:py-10 px-4 sm:px-6 antialiased selection:bg-[#E73520] selection:text-white overflow-hidden">
      <InteractiveNetworkBackground />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#0A0A0A] border-2 border-[#0A0A0A] flex items-center justify-center shadow-[2px_2px_0_#E73520] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5">
            <div className="w-3 h-3 bg-[#E73520] border border-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">TRACERA</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#4A4A48] hover:text-[#E73520] transition-colors"
        >
          ← Back to overview
        </Link>
      </header>

      {/* Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0_#0A0A0A] p-7 sm:p-9 space-y-5">

          {/* Eyebrow + Title */}
          <div className="space-y-1.5 text-center">
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest">
              Secure workspace access
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Sign in to TRACERA
            </h1>
            <p className="text-xs text-[#555550]">
              Access your firm's audit workspace.
            </p>
          </div>

          <div className="border-t-2 border-[#0A0A0A]" />

          {/* Error */}
          {error && (
            <div className="p-3 bg-[#FFF2F0] border-2 border-[#E73520] text-xs text-[#0A0A0A] flex items-start gap-2 shadow-[2px_2px_0_#E73520]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E73520] mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                Work email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firm.com"
                className="w-full px-3.5 py-3 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#4A4A48] hover:text-[#E73520] font-bold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-3 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777770] hover:text-[#0A0A0A] transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white w-full py-3.5 text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0A0A0A]/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] font-bold uppercase text-[#777770]">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google SSO */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-[#0A0A0A] text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Dashboard Access Buttons */}
            <div className="space-y-2 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t-2 border-[#0A0A0A]/15 absolute" />
                <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-widest text-[#777770]">
                  Or Instant Dashboard Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('CLIENT')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-left transition-all cursor-pointer group hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#5CC8FF] text-[#0A0A0A] border border-[#0A0A0A]">
                      CLIENT
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#0A0A0A] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] font-bold text-[#0A0A0A] leading-tight">Client Portal</p>
                  <p className="text-[9px] text-[#777770]">client@demo.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('AUDITOR')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-left transition-all cursor-pointer group hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#FFD23F] text-[#0A0A0A] border border-[#0A0A0A]">
                      AUDITOR
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#0A0A0A] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] font-bold text-[#0A0A0A] leading-tight">Auditor Console</p>
                  <p className="text-[9px] text-[#777770]">auditor@demo.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('PARTNER')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#F7F5EF] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] text-left transition-all cursor-pointer group hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#C7F36B] text-[#0A0A0A] border border-[#0A0A0A]">
                      PARTNER
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#0A0A0A] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] font-bold text-[#0A0A0A] leading-tight">Partner Suite</p>
                  <p className="text-[9px] text-[#777770]">partner@demo.com</p>
                </button>
              </div>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center text-xs">
            <span className="text-[#555550]">New to TRACERA? </span>
            <Link href="/signup" className="font-bold text-[#E73520] hover:underline ml-1">
              Create account →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-md mx-auto w-full text-center space-y-2 pt-4">
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#555550]">
          <Link href="/terms" className="hover:text-[#0A0A0A] hover:underline">Privacy policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#0A0A0A] hover:underline">Terms</Link>
          <span>·</span>
          <a href="mailto:support@tracera.internal" className="hover:text-[#0A0A0A] hover:underline">Support</a>
        </div>
        <p className="text-[10px] text-[#888880]">
          TRACERA · Section 143(3) immutable audit workflow network.
        </p>
      </footer>
    </div>
  );
}
