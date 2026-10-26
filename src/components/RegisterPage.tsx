import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, Phone, CheckCircle, ArrowRight, LogIn } from 'lucide-react';
import { User } from '../types';

interface RegisterPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function RegisterPage({ onLoginSuccess, onNavigate }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          whatsapp: whatsapp || phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      localStorage.setItem('kemet_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      onNavigate('profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-[#18120c] border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8a6d1a]/10 border border-[#d4af37]/60 flex items-center justify-center mx-auto text-3xl text-[#d4af37] shadow-inner">
            𓀚
          </div>
          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block font-bold">
            New Traveler Sign Up
          </span>
          <h2 className="font-serif text-3xl font-black text-[#e6c280] uppercase tracking-wider">
            Create Your Account
          </h2>
          <p className="text-xs font-sans text-stone-400">
            Sign up for Kemet Tours to get 30% discount codes, fast bookings, and digital tickets.
          </p>
        </div>

        {/* Perks Box */}
        <div className="bg-[#120d09] border border-[#d4af37]/30 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span className="text-[11px] font-mono text-stone-300">30% Off Discount Codes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span className="text-[11px] font-mono text-stone-300">Fast Easy Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span className="text-[11px] font-mono text-stone-300">Digital Tickets & QR</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-3 text-red-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <UserIcon className="w-3.5 h-3.5 text-[#d4af37]" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-2.5 text-stone-200 text-xs focus:outline-none placeholder-stone-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-2.5 text-stone-200 text-xs focus:outline-none placeholder-stone-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-2.5 text-stone-200 text-xs focus:outline-none placeholder-stone-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 120 218 1834"
                className="w-full bg-[#0d0a07] border border-[#d4af37]/30 focus:border-[#d4af37] rounded-xl px-4 py-2.5 text-stone-200 text-xs focus:outline-none placeholder-stone-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#140f0a] border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Navigation */}
        <div className="text-center pt-2">
          <p className="text-xs text-stone-400 font-sans">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#d4af37] font-bold hover:underline font-serif uppercase tracking-wider cursor-pointer ml-1 inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 inline" /> Log In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
