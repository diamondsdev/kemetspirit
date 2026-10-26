import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Phone, Building, LogOut, Ticket, Compass, ShieldCheck, Sparkles, Check, Edit2, Save } from 'lucide-react';
import { User } from '../types';

interface UserProfilePageProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function UserProfilePage({ currentUser, onLogout, onNavigate, onUpdateUser }: UserProfilePageProps) {
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center text-3xl text-[#d4af37]">
          𓀚
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#e6c280]">Please Log In</h2>
        <p className="text-xs text-stone-400 max-w-sm">
          Please log in or register to view your account, discount codes, and active tour tickets.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] font-serif font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="bg-stone-900 border border-stone-800 text-stone-200 hover:text-[#d4af37] font-serif font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [hotelName, setHotelName] = useState(currentUser.hotelName || '');
  const [roomNumber, setRoomNumber] = useState(currentUser.roomNumber || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = () => {
    const updated = {
      ...currentUser,
      phone,
      whatsapp,
      hotelName,
      roomNumber
    };
    localStorage.setItem('kemet_user', JSON.stringify(updated));
    onUpdateUser(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c1510] via-[#2a1e14] to-[#1c1510] border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#d4af37]/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center text-3xl sm:text-4xl text-[#d4af37] shadow-lg shrink-0">
              𓀚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/15 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30 font-bold">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Kemet Member'}
                </span>
                <span className="text-[10px] font-mono text-stone-400">ID: #{currentUser.id.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#e6c280] uppercase tracking-wider mt-1">
                {currentUser.name}
              </h1>
              <p className="text-xs font-mono text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('bookings')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-500/50 text-stone-300 hover:text-red-300 font-serif font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-stone-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Member Perks */}
        <div className="bg-[#18120c] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
            <Sparkles className="w-4 h-4 text-[#d4af37]" /> Member Benefits
          </h3>

          <ul className="space-y-3 text-xs text-stone-300">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-200 block">30% Discount Code Active</span>
                <span className="text-[10px] text-stone-400 font-mono">Use code <strong>ROYAL30</strong> at checkout for 30% off any tour.</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-200 block">Easy Hotel Pickup</span>
                <span className="text-[10px] text-stone-400">Save hotel & room details in your profile for quick booking.</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-200 block">Digital Tickets & QR Codes</span>
                <span className="text-[10px] text-stone-400">Access QR tickets on your phone for easy check-in.</span>
              </div>
            </li>
          </ul>

          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={() => onNavigate('tours')}
              className="w-full bg-stone-900 hover:bg-[#d4af37]/15 border border-stone-800 hover:border-[#d4af37]/50 text-stone-300 hover:text-[#d4af37] text-xs font-serif font-bold uppercase py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Expeditions</span>
            </button>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="md:col-span-2 bg-[#18120c] border border-[#d4af37]/30 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <h3 className="font-serif text-base font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#d4af37]" /> Personal & Travel Credentials
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-mono text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                className="bg-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-amber-300"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            )}
          </div>

          {savedSuccess && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Travel credentials updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                Full Name
              </span>
              <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 font-medium">
                {currentUser.name}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                Email Address
              </span>
              <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 font-medium">
                {currentUser.email}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                Phone Number
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#090705] border border-[#d4af37]/40 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                />
              ) : (
                <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200">
                  {currentUser.phone || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                WhatsApp Number
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#090705] border border-[#d4af37]/40 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                />
              ) : (
                <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200">
                  {currentUser.whatsapp || currentUser.phone || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                Current Hotel / Resort
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full bg-[#090705] border border-[#d4af37]/40 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                />
              ) : (
                <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200">
                  {currentUser.hotelName || 'Not specified'}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
                Room / Suite Number
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-[#090705] border border-[#d4af37]/40 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                />
              ) : (
                <div className="bg-[#0f0c08] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200">
                  {currentUser.roomNumber || 'Not specified'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
