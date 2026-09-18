'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Building2, User, Shield, Star } from 'lucide-react';
import { InteractiveNetworkBackground } from '@/components/canvas/InteractiveNetworkBackground';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

const ROLE_OPTIONS = [
  {
    value: 'CLIENT',
    label: 'Client',
    description: 'Submit documents & track your audit',
    icon: Building2,
    href: '/client/dashboard',
  },
  {
    value: 'AUDITOR',
    label: 'Auditor',
    description: 'Manage fieldwork & review queue',
    icon: Shield,
    href: '/auditor/dashboard',
  },
  {
    value: 'PARTNER',
    label: 'Partner',
    description: 'Approve sign-offs & governance',
    icon: Star,
    href: '/partner/dashboard',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full practice administration',
    icon: User,
    href: '/admin/dashboard',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          </form>

          {/* Workspace role previews */}
          <div className="pt-3 border-t border-[#0A0A0A]/20 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#777770] text-center">
              Your role determines your workspace
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, href }) => (
                <Link
                  key={value}
                  href={href}
                  className="p-2.5 border border-[#E5E5E0] hover:border-[#0A0A0A] hover:bg-[#F7F5EF] transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-3 h-3 text-[#E73520]" />
                    <span className="text-[11px] font-bold text-[#0A0A0A]">{label}</span>
                  </div>
                  <p className="text-[10px] text-[#777770] leading-tight">{description}</p>
                </Link>
              ))}
            </div>
          </div>

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
