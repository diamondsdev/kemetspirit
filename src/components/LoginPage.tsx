import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, KeyRound, UserPlus } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onLoginSuccess, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('kemet_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      onNavigate('profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#18120c] border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8a6d1a]/10 border border-[#d4af37]/60 flex items-center justify-center mx-auto text-3xl text-[#d4af37] shadow-inner">
            𓋹
          </div>
          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block font-bold">
            Account Login
          </span>
          <h2 className="font-serif text-3xl font-black text-[#e6c280] uppercase tracking-wider">
            Log In
          </h2>
          <p className="text-xs font-sans text-stone-400">
            Welcome back to Kemet Tours.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-3 text-red-300 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Password *
              </label>
              <button
                type="button"
                onClick={() => onNavigate('reset-password')}
                className="text-[10px] font-mono text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" /> Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-3 text-stone-200 text-xs focus:outline-none transition-all placeholder-stone-600 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#140f0a] border-t-transparent rounded-full animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Helper */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block text-center">
            Or test with registered traveler:
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail('traveler@kemet.com');
              setPassword('pharaoh');
            }}
            className="w-full bg-stone-900/80 hover:bg-[#d4af37]/10 border border-stone-800 hover:border-[#d4af37]/40 text-stone-300 hover:text-[#d4af37] text-[11px] font-mono py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Fill Demo Credentials (traveler@kemet.com)</span>
          </button>
        </div>

        {/* Register Navigation */}
        <div className="text-center pt-2">
          <p className="text-xs text-stone-400 font-sans">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#d4af37] font-bold hover:underline font-serif uppercase tracking-wider cursor-pointer ml-1 inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5 inline" /> Create Account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
