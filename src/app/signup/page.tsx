'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Building2, User, Shield, Star, Check } from 'lucide-react';
import { InteractiveNetworkBackground } from '@/components/canvas/InteractiveNetworkBackground';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

type Role = 'CLIENT' | 'AUDITOR' | 'PARTNER' | 'ADMIN';

const ROLES: { value: Role; label: string; description: string; icon: React.ElementType; dashboard: string }[] = [
  {
    value: 'CLIENT',
    label: 'Client',
    description: 'Submit docs, track your audit progress',
    icon: Building2,
    dashboard: '/client/dashboard',
  },
  {
    value: 'AUDITOR',
    label: 'Auditor',
    description: 'Manage fieldwork & review queue',
    icon: Shield,
    dashboard: '/auditor/dashboard',
  },
  {
    value: 'PARTNER',
    label: 'Partner',
    description: 'Sign-offs & governance oversight',
    icon: Star,
    dashboard: '/partner/dashboard',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full firm & user administration',
    icon: User,
    dashboard: '/admin/dashboard',
  },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (code === 'auth/weak-password') return 'Password too weak. Use at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid work email address.';
    return err?.message || 'Registration failed. Please check your details.';
  };

  const selectedRole = ROLES.find((r) => r.value === role)!;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid work email.'); return; }
    if (!organization.trim()) { setError('Please enter your organization or firm name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError(null);

    try {
      let firebaseUid: string | undefined;

      if (isFirebaseConfigured && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          firebaseUid = cred.user.uid;
          await updateProfile(cred.user, { displayName: name.trim() });
        } catch (fbErr: any) {
          throw new Error(mapFirebaseError(fbErr));
        }
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          organization: organization.trim(),
          phone: phone.trim() || undefined,
          role,
          firebaseUid,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Redirect to the selected role's dashboard
      window.location.href = data.redirectTo || selectedRole.dashboard;
    } catch (err: any) {
      setError(err.message || 'Registration error. Please verify your details.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F5EF] text-[#0A0A0A] flex flex-col py-8 sm:py-10 px-4 sm:px-6 antialiased selection:bg-[#E73520] selection:text-white overflow-hidden">
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
          href="/login"
          className="text-xs font-bold text-[#4A4A48] hover:text-[#E73520] transition-colors"
        >
          ← Back to sign in
        </Link>
      </header>

      {/* Card */}
      <main className="relative z-10 max-w-lg w-full mx-auto my-auto py-4">
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0_#0A0A0A] p-7 sm:p-9 space-y-6">

          {/* Eyebrow + Title */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-bold text-[#E73520] uppercase tracking-widest">
              Workspace registration
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              Create your account
            </h1>
            <p className="text-xs text-[#555550]">
              Choose your role to access the right workspace from day one.
            </p>
          </div>

          <div className="border-t-2 border-[#0A0A0A]" />

          {/* Role Selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
              I am joining as
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ value, label, description, icon: Icon }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-3 border-2 text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[3px_3px_0_#E73520]'
                        : 'border-[#E5E5E0] hover:border-[#0A0A0A] bg-white text-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#E73520]' : 'text-[#E73520]'}`} />
                        <span className="text-[11px] font-bold">{label}</span>
                      </div>
                      {active && <Check className="w-3 h-3 text-[#E73520]" />}
                    </div>
                    <p className={`text-[10px] leading-tight ${active ? 'text-white/70' : 'text-[#777770]'}`}>
                      {description}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#777770]">
              You&apos;ll be taken to the <strong>{selectedRole.label}</strong> dashboard after account creation.
            </p>
          </div>

          <div className="border-t border-[#E5E5E0]" />

          {/* Error */}
          {error && (
            <div className="p-3 bg-[#FFF2F0] border-2 border-[#E73520] text-xs text-[#0A0A0A] flex items-start gap-2 shadow-[2px_2px_0_#E73520]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E73520] mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Organization *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Acme Manufacturing Ltd"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                Work email *
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                Phone <span className="text-[#888880] font-normal normal-case">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Confirm password *
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn bg-[#0A0A0A] hover:bg-[#E73520] text-white w-full py-3.5 text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : `Create ${selectedRole.label} account →`}
            </button>
          </form>

          {/* Sign in link */}
          <div className="text-center text-xs pt-1 border-t border-[#0A0A0A]/10">
            <span className="text-[#555550]">Already have a workspace account? </span>
            <Link href="/login" className="font-bold text-[#E73520] hover:underline ml-1">
              Sign in →
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-md mx-auto text-center text-[10px] text-[#777770] pt-4">
        Role permissions are assigned by your firm administrator after approval.
      </footer>
    </div>
  );
}
