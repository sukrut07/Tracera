'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Briefcase, ShieldCheck, Users } from 'lucide-react';
import { InteractiveNetworkBackground } from '@/components/canvas/InteractiveNetworkBackground';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'AUDITOR' | 'PARTNER'>('CLIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (code === 'auth/weak-password') return 'Password too weak. Use at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid work email address.';
    return err?.message || 'Registration failed. Please check your details.';
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
      let idToken: string | undefined;

      if (isFirebaseConfigured && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          idToken = await cred.user.getIdToken();
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
          role: selectedRole,
          idToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      window.location.href = data.redirectTo || '/client/dashboard';
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
              {selectedRole === 'CLIENT'
                ? 'Client Portal Registration'
                : selectedRole === 'AUDITOR'
                ? 'Auditor Console Registration'
                : 'Partner Suite Registration'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {selectedRole === 'CLIENT'
                ? 'Register your organization'
                : selectedRole === 'AUDITOR'
                ? 'Register as CA Auditor'
                : 'Register as CA Partner'}
            </h1>
            <p className="text-xs text-[#555550]">
              {selectedRole === 'CLIENT'
                ? 'Create your client audit workspace to submit statutory documents.'
                : selectedRole === 'AUDITOR'
                ? 'Join the practice audit team to review documents, raise corrections, and verify compliance.'
                : 'Join the lead CA partner team for sign-off gates, billing settlement, and audit closures.'}
            </p>
          </div>

          <div className="border-t-2 border-[#0A0A0A]" />

          {/* Role Registration Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#0A0A0A] uppercase tracking-wider">
              Registering As:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('CLIENT')}
                className={`py-2 px-2 border-2 border-[#0A0A0A] flex items-center justify-center gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === 'CLIENT'
                    ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0_#5CC8FF]'
                    : 'bg-[#F7F5EF] text-[#0A0A0A] hover:bg-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#5CC8FF]" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('AUDITOR')}
                className={`py-2 px-2 border-2 border-[#0A0A0A] flex items-center justify-center gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === 'AUDITOR'
                    ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0_#FFD23F]'
                    : 'bg-[#F7F5EF] text-[#0A0A0A] hover:bg-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#FFD23F]" />
                <span>Auditor</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('PARTNER')}
                className={`py-2 px-2 border-2 border-[#0A0A0A] flex items-center justify-center gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === 'PARTNER'
                    ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0_#C7F36B]'
                    : 'bg-[#F7F5EF] text-[#0A0A0A] hover:bg-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
                <span>Partner</span>
              </button>
            </div>
          </div>

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
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
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
                  placeholder={selectedRole === 'CLIENT' ? 'rahul@acme.com' : 'rahul@tracera.internal'}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                {selectedRole === 'CLIENT' ? 'Organization / Client name *' : 'Practice / Firm Name *'}
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={selectedRole === 'CLIENT' ? 'Acme Manufacturing Ltd.' : 'TRACERA Audit Practice'}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs focus:outline-none focus:shadow-[2px_2px_0_#E73520] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                Contact phone (Optional)
              </label>
              <input
                type="tel"
                autoComplete="tel"
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
              {loading
                ? 'Creating account…'
                : selectedRole === 'CLIENT'
                ? 'Register organization →'
                : selectedRole === 'AUDITOR'
                ? 'Register as Auditor →'
                : 'Register as CA Partner →'}
            </button>
          </form>

          {/* Quick Dashboard Access Buttons */}
          <div className="space-y-2 pt-1">
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

          <div className="border-2 border-[#0A0A0A] bg-[#F7F5EF] p-4 space-y-2 shadow-[2px_2px_0_#E73520]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E73520]">
              Role Permissions Notice
            </p>
            <p className="text-[11px] text-[#555550]">
              Client accounts are bound to an auditee organization. Auditor and Partner accounts join the CA firm practice with access to review consoles, maker-checker sign-offs, and engagement closures.
            </p>
          </div>

          <div className="text-center text-xs pt-1 border-t border-[#0A0A0A]/10">
            <span className="text-[#555550]">Already have an account? </span>
            <Link href="/login" className="font-bold text-[#E73520] hover:underline ml-1">
              Sign in →
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-md mx-auto text-center text-[10px] text-[#777770] pt-4">
        Administrator access is reserved for the bootstrap account and firm-approved administrators.
      </footer>
    </div>
  );
}
