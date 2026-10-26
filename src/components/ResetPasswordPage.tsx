import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { User } from '../types';

interface ResetPasswordPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function ResetPasswordPage({ onLoginSuccess, onNavigate }: ResetPasswordPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoPin, setDemoPin] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request reset code');
      }

      setSuccessMsg(data.message || 'Sacred verification pin code generated!');
      if (data.demoPin) {
        setDemoPin(data.demoPin);
        setResetPin(data.demoPin);
      }
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetPin, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccessMsg('Your password has been restored! Redirecting to login...');
      if (data.user) {
        localStorage.setItem('kemet_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#18120c] border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8a6d1a]/10 border border-[#d4af37]/60 flex items-center justify-center mx-auto text-3xl text-[#d4af37] shadow-inner">
            <KeyRound className="w-8 h-8 text-[#d4af37]" />
          </div>
          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block font-bold">
            Password Recovery
          </span>
          <h2 className="font-serif text-3xl font-black text-[#e6c280] uppercase tracking-wider">
            Reset Password
          </h2>
          <p className="text-xs font-sans text-stone-400">
            {step === 1
              ? "Enter your email address to receive a verification PIN code."
              : "Enter the verification PIN code and your new password below."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-3 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3 text-emerald-300 text-xs font-mono flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p>{successMsg}</p>
              {demoPin && (
                <p className="mt-1 font-bold text-amber-200">
                  Demo Sacred Verification PIN: <span className="font-mono text-base underline">{demoPin}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. traveler@kemet.com"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-3 text-stone-200 text-xs focus:outline-none transition-all placeholder-stone-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#140f0a] border-t-transparent rounded-full animate-spin" />
                  <span>Generating Verification PIN...</span>
                </>
              ) : (
                <>
                  <span>Request Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                Verification PIN Code *
              </label>
              <input
                type="text"
                required
                value={resetPin}
                onChange={(e) => setResetPin(e.target.value)}
                placeholder="6-Digit Code (e.g. 777123)"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-3 text-stone-200 text-xs font-mono tracking-widest focus:outline-none transition-all placeholder-stone-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-3 text-stone-200 text-xs focus:outline-none transition-all placeholder-stone-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-3 text-stone-200 text-xs focus:outline-none transition-all placeholder-stone-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#140f0a] border-t-transparent rounded-full animate-spin" />
                  <span>Restoring Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-stone-800">
          <p className="text-xs text-stone-400 font-sans">
            Remembered your credentials?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#d4af37] font-bold hover:underline font-serif uppercase tracking-wider cursor-pointer ml-1 inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 inline" /> Back To Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
