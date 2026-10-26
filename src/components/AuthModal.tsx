import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from './LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  reason?: string;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, reason }: AuthModalProps) {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register'
      ? { name, email, password, phone, whatsapp: whatsapp || phone }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success
      localStorage.setItem('kemet_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative p-6 sm:p-8 space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-2xl text-[#d4af37]">
              𓋹
            </div>
            <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.2em] block font-bold">
              {mode === 'register' ? 'Sign Up' : 'Welcome Back'}
            </span>
            <h3 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wider">
              {mode === 'register' ? 'Create Your Account' : 'Log In to Account'}
            </h3>

            {reason && (
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-3 text-amber-200 text-xs font-mono leading-relaxed flex items-center gap-2 text-left mt-2">
                <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>{reason}</span>
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#0c0907] p-1 rounded-xl border border-[#d4af37]/30">
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-serif uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#d4af37] text-[#140f0a] shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-serif uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#d4af37] text-[#140f0a] shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Log In
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-red-300 text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                  <UserIcon className="w-3 h-3 text-[#d4af37]" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-[#0c0907] border border-[#d4af37]/30 rounded-xl px-3.5 py-2.5 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Mail className="w-3 h-3 text-[#d4af37]" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-[#0c0907] border border-[#d4af37]/30 rounded-xl px-3.5 py-2.5 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-semibold">
                <Lock className="w-3 h-3 text-[#d4af37]" /> Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0c0907] border border-[#d4af37]/30 rounded-xl px-3.5 py-2.5 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1 font-semibold">
                  <Phone className="w-3 h-3 text-[#d4af37]" /> Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 120 218 1834"
                  className="w-full bg-[#0c0907] border border-[#d4af37]/30 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#f3e5c8] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#140f0a] border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'register' ? 'Create Account' : 'Log In'}</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-stone-500 text-center font-mono">
            {mode === 'register' ? 'Already have an account? ' : 'New to Kemet Tours? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setErrorMsg(''); }}
              className="text-[#d4af37] hover:underline cursor-pointer uppercase font-bold"
            >
              {mode === 'register' ? 'Log In' : 'Create Account'}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
