import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Printer, 
  Trash2, 
  ShieldCheck,
  MapPin,
  ClipboardCheck,
  Ticket
} from 'lucide-react';
import { Booking, Excursion } from '../types';
import BookingQRCode from './BookingQRCode';
import ExcursionFeedbackForm from './ExcursionFeedbackForm';

const STATUS_CONFIG = {
  'Pending Oracle Approval': {
    colorClass: 'bg-amber-500/10 border-amber-500/35 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    badgeText: '𓀚 Pending Approval',
    desc: 'Awaiting high-priest approval to secure celestial coordinates.',
    bannerColor: 'from-amber-600/30 to-transparent',
    dotColor: 'bg-amber-400'
  },
  'Confirmed by High Priest': {
    colorClass: 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    badgeText: '𓋹 Confirmed Voyage',
    desc: 'Authorized by the Royal Registries of Kemet.',
    bannerColor: 'from-emerald-600/30 to-transparent',
    dotColor: 'bg-emerald-400'
  },
  'Completed': {
    colorClass: 'bg-sky-500/10 border-sky-500/35 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.1)]',
    badgeText: '𓁠 Expedition Completed',
    desc: 'Expedition complete. Lore archived in the House of Life.',
    bannerColor: 'from-sky-600/30 to-transparent',
    dotColor: 'bg-sky-400'
  }
};

interface DetailedTicketCardProps {
  key?: string;
  booking: Booking;
  excursion?: Excursion;
  onCollapse: () => void;
  onCancelBooking?: (id: string) => void;
  onViewItinerary?: () => void;
}

export default function DetailedTicketCard({
  booking,
  excursion,
  onCollapse,
  onCancelBooking,
  onViewItinerary,
}: DetailedTicketCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending Oracle Approval'];

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full relative bg-[#130e0a] border-2 border-[#d4af37]/45 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col"
    >
      {/* Gilded Accent Top Border & Egyptian Hieroglyph Background Ribbons */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10" />
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#d4af37_1.2px,transparent_1.2px)] [background-size:16px_16px] pointer-events-none" />

      {/* TICKET TOP HEADER */}
      <div className={`p-5 border-b border-[#d4af37]/15 bg-gradient-to-b ${config.bannerColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg bg-stone-900/80 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all cursor-pointer flex items-center justify-center"
            title="Go back to list view"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-stone-400 tracking-widest uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                Ticket No. #{booking.id.slice(-6)}
              </span>
              <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold ${config.colorClass}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotColor}`}></span>
                </span>
                <span>{config.badgeText}</span>
              </div>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider mt-1 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#d4af37] flex-shrink-0 animate-pulse" />
              Sacred Embarkation Pass
            </h3>
          </div>
        </div>

        <button
          onClick={onCollapse}
          className="text-[10px] font-mono text-stone-500 hover:text-[#d4af37] uppercase tracking-wider transition-colors cursor-pointer border border-stone-800 hover:border-[#d4af37]/30 px-3 py-1 rounded-md bg-stone-950/40"
        >
          𓍼 Standard View
        </button>
      </div>

      {/* MAIN TICKET BODY (SPLIT DESIGN) */}
      <div className="grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* LEFT COLUMN: Receipt and Excursion Particulars (8 cols) */}
        <div className="md:col-span-7 p-6 space-y-5 border-b md:border-b-0 md:border-r border-[#d4af37]/15 relative">
          
          {/* Circular Ticket Punch Cutout Right (for desktop split effect) */}
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#140f0c] border border-l-stone-950 border-r-[#d4af37]/30 z-20 pointer-events-none" />

          {/* Excursion Header */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#d4af37] tracking-widest uppercase block">
              Celestial Outpost
            </span>
            <h4 className="font-serif text-xl font-bold text-stone-100 uppercase tracking-wide">
              {booking.excursionTitle}
            </h4>
            {excursion?.tagline && (
              <p className="text-xs text-stone-400 italic">
                "{excursion.tagline}"
              </p>
            )}
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[#18130f]/60 p-4 rounded-xl border border-stone-800/80">
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#d4af37]" /> Traveler:
              </span>
              <span className="text-stone-100 text-xs font-semibold">{booking.travelerName}</span>
              <span className="text-stone-500 block text-[9px] truncate">{booking.travelerEmail}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#d4af37]" /> Embark Date:
              </span>
              <span className="text-stone-100 text-xs font-semibold">{booking.date}</span>
              <span className="text-stone-500 block text-[9px]">Astro-Solar Alignment</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-[#d4af37]" /> Expedition Size:
              </span>
              <span className="text-stone-100 text-xs font-semibold">
                {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#d4af37]" /> Golden Fee:
              </span>
              <span className="text-[#d4af37] text-xs font-mono font-bold">${booking.totalCost}</span>
              <span className="text-[8px] text-stone-500 uppercase block">Exc. Taxes & Offerings</span>
            </div>
          </div>

          {/* Ancient Lore snippet or Custom details */}
          <div className="text-[11px] leading-relaxed text-stone-300 font-sans space-y-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] font-black block">
              𓋹 Sanctuary Guidelines:
            </span>
            <p>
              {excursion?.ancientLore || "Aligned under the eye of Horus, this voyage departs from the eastern harbor outpost. Secure your sun protection, travel scrolls, and water flasks. Inform the caravan guide of any special requests upon boarding."}
            </p>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-[#191410] border border-stone-800/40 rounded-lg p-3 text-[11px] text-stone-400 italic">
              <strong className="text-stone-500 not-italic uppercase font-mono block text-[8px] tracking-wider mb-1">
                Sacred Special Petitions:
              </strong>
              "{booking.specialRequests}"
            </div>
          )}

          {/* Ticket ID click-to-copy */}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-900 flex-wrap">
            <span className="text-[9px] font-mono text-stone-500 uppercase">Cryptographic Token:</span>
            <code className="text-[9px] font-mono text-[#d4af37] bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">
              {booking.id}
            </code>
            <button
              onClick={handleCopyId}
              className="text-[9px] font-mono text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              {copiedId ? 'Copied! 𓋹' : 'Copy'}
            </button>
            {booking.status === 'Completed' && (
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="ml-auto text-[10px] font-mono font-bold text-[#d4af37] hover:text-[#e6c280] underline cursor-pointer uppercase tracking-wider"
              >
                {showFeedback ? '𓂀 Hide Review' : '𓏞 Leave Review'}
              </button>
            )}
          </div>

          {/* Feedback Form Section */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ExcursionFeedbackForm
                  bookingId={booking.id}
                  excursionId={booking.excursionId}
                  excursionTitle={booking.excursionTitle}
                  travelerName={booking.travelerName}
                  lightTheme={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: The Interactive QR check-in voucher (5 cols) */}
        <div className="md:col-span-5 p-6 flex flex-col justify-center items-center bg-[#15100c]/80 relative overflow-hidden">
          
          {/* Circular Ticket Punch Cutout Left */}
          <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#140f0c] border border-r-stone-950 border-l-[#d4af37]/30 z-20 pointer-events-none" />

          <div className="text-center mb-4">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">
              Oracle Outpost
            </span>
            <span className="text-xs font-serif text-[#e6c280] uppercase tracking-wide font-semibold">
              Digital Check-In Token
            </span>
          </div>

          {/* QR Code Container with nice glow */}
          <div className="relative group">
            {/* Soft decorative golden glow behind the QR code */}
            <div className="absolute inset-0 bg-[#d4af37]/5 blur-xl rounded-full group-hover:bg-[#d4af37]/10 transition-all pointer-events-none" />
            
            <BookingQRCode
              bookingId={booking.id}
              travelerName={booking.travelerName}
              excursionTitle={booking.excursionTitle}
              lightTheme={false}
              compact={false}
            />
          </div>

          <p className="text-[9px] font-sans text-stone-400 text-center max-w-[190px] mt-4 leading-normal">
            Keep this amulet loaded. Tap to scan at the harbor outpost, ship ramp, or canyon gateway.
          </p>

          <div className="mt-2 text-[#d4af37]/30 text-xs font-serif select-none pointer-events-none">
            𓋹 𓂀 𓆗 𓏞
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="p-4 bg-[#18130e] border-t border-[#d4af37]/15 flex flex-wrap justify-between items-center gap-3">
        <p className="text-[10px] font-mono text-stone-500 italic max-w-sm">
          {config.desc}
        </p>

        <div className="flex gap-2 font-mono text-[10px]">
          {/* Return to list button */}
          <button
            onClick={onCollapse}
            className="px-3.5 py-1.5 border border-[#d4af37]/25 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md transition-all cursor-pointer font-bold uppercase tracking-wider"
          >
            𓍼 Standard List
          </button>

          {/* Print/Itinerary Scroll Button */}
          {(booking.status === 'Confirmed by High Priest' || booking.status === 'Completed') && onViewItinerary && (
            <button
              onClick={onViewItinerary}
              className="px-3.5 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 text-[#d4af37] rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-wider"
            >
              <Printer className="w-3 h-3" />
              <span>𓏞 View Itinerary</span>
            </button>
          )}

          {/* Cancel button */}
          {onCancelBooking && booking.status === 'Pending Oracle Approval' && (
            <button
              onClick={() => onCancelBooking(booking.id)}
              className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 rounded-md transition-all cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider"
            >
              <Trash2 className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
