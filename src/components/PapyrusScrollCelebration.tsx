import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles, 
  Printer, 
  CheckCircle,
  Award,
  BookOpen,
  Share2
} from 'lucide-react';
import { Booking, Excursion } from '../types';
import BookingQRCode from './BookingQRCode';

interface PapyrusScrollCelebrationProps {
  booking: Booking | null;
  excursion?: Excursion;
  onClose: () => void;
}

export default function PapyrusScrollCelebration({
  booking,
  excursion,
  onClose,
}: PapyrusScrollCelebrationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  const handlePrint = () => {
    const printContent = scrollRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Sacred Papyrus Scroll - ${booking.excursionTitle}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
                body {
                  background-color: #fcf6e8;
                  color: #3b2314;
                  font-family: 'Playfair Display', serif;
                  padding: 40px;
                  text-align: center;
                }
                .scroll-container {
                  border: 3px double #b08e23;
                  padding: 30px;
                  max-width: 650px;
                  margin: 0 auto;
                  background-color: #faf0d8;
                  border-radius: 8px;
                  box-shadow: inset 0 0 40px rgba(176,142,35,0.15);
                }
                h1 {
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: #8c6e12;
                  margin-bottom: 5px;
                  font-size: 24px;
                }
                .subtitle {
                  font-family: 'Space Grotesk', sans-serif;
                  font-size: 11px;
                  letter-spacing: 3px;
                  color: #70553d;
                  text-transform: uppercase;
                }
                .divider {
                  margin: 20px auto;
                  width: 60px;
                  height: 2px;
                  background-color: #d4af37;
                }
                .grid {
                  display: grid;
                  grid-template-cols: 1fr 1fr;
                  gap: 15px;
                  text-align: left;
                  font-family: 'Space Grotesk', sans-serif;
                  font-size: 13px;
                  margin: 25px 0;
                  background-color: rgba(59,35,20,0.04);
                  padding: 15px;
                  border-radius: 6px;
                }
                .grid-item {
                  margin-bottom: 8px;
                }
                .label {
                  font-size: 10px;
                  text-transform: uppercase;
                  color: #70553d;
                  letter-spacing: 1px;
                  display: block;
                }
                .value {
                  font-weight: bold;
                }
                .qr-placeholder {
                  margin: 25px auto;
                  display: inline-block;
                  background: white;
                  padding: 10px;
                  border: 1px solid #b08e23;
                  border-radius: 8px;
                }
                .seal {
                  font-size: 24px;
                  margin-top: 20px;
                  opacity: 0.7;
                }
                .instructions {
                  font-size: 12px;
                  line-height: 1.6;
                  color: #5c432e;
                  font-style: italic;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body onload="window.print()">
              <div class="scroll-container">
                <div class="seal">𓋹 𓂀 𓆗</div>
                <h1>Sacred Entry Scroll</h1>
                <div class="subtitle">Kemet Tours - Powered by Mas international Agency</div>
                <div class="divider"></div>
                
                <h2>${booking.excursionTitle}</h2>
                <div class="subtitle">Voyage Reference: #${booking.id.slice(-8).toUpperCase()}</div>

                <div class="grid">
                  <div class="grid-item">
                    <span class="label">Noble Traveler</span>
                    <span class="value">${booking.travelerName}</span>
                  </div>
                  <div class="grid-item">
                    <span class="label">Embarkation Date</span>
                    <span class="value">${booking.date}</span>
                  </div>
                  <div class="grid-item">
                    <span class="label">Caravan Guests</span>
                    <span class="value">${booking.numberOfGuests} Traveler(s)</span>
                  </div>
                  <div class="grid-item">
                    <span class="label">Sacred Offering</span>
                    <span class="value">$${booking.totalCost} USD</span>
                  </div>
                </div>

                <div class="instructions">
                  Present this papyrus scroll to the harbor master or caravan guide at check-in. The registries have been updated. May Ra light your path.
                </div>
                
                <div class="seal">𓋹 Horus Sentinel Seal 𓋹</div>
              </div>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Decorative Floating Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-[#d4af37]/30 animate-pulse text-4xl">𓆣</div>
        <div className="absolute top-1/4 right-12 text-[#d4af37]/20 animate-bounce text-5xl">𓂀</div>
        <div className="absolute bottom-1/4 left-16 text-[#d4af37]/25 animate-pulse text-5xl">𓋹</div>
        <div className="absolute bottom-12 right-20 text-[#d4af37]/30 animate-bounce text-4xl">𓏞</div>
      </div>

      <div className="max-w-2xl w-full my-8 relative flex flex-col items-center">
        
        {/* SUCCESS BADGE GREETING */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-6 z-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/40 px-4 py-1.5 rounded-full text-[#d4af37] text-xs font-mono uppercase tracking-widest mb-2.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Voyage Recorded Successfully</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-100 uppercase tracking-widest">
            Divine Seal Affixed!
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            The High Priests have registered your pilgrimage in the papyrus scrolls.
          </p>
        </motion.div>

        {/* INTERACTIVE PAPYRUS UNROLLING FRAME */}
        <div className="relative w-full flex items-center justify-center py-4">
          
          {/* Animated Left Scroll Rod */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.3 }}
            className="absolute h-[105%] w-6 md:w-8 bg-gradient-to-r from-[#2c1d11] via-[#d4af37] to-[#2c1d11] rounded-full shadow-[2px_4px_12px_rgba(0,0,0,0.5)] z-20 flex flex-col justify-between items-center py-4 text-[#140f0c] text-[10px] font-serif select-none border-y-2 border-[#ffdf7a]"
          >
            <span>𓋹</span>
            <div className="h-2/3 w-0.5 bg-black/40" />
            <span>𓆣</span>
          </motion.div>

          {/* Animated Right Scroll Rod */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.3 }}
            className="absolute h-[105%] w-6 md:w-8 bg-gradient-to-r from-[#2c1d11] via-[#d4af37] to-[#2c1d11] rounded-full shadow-[-2px_4px_12px_rgba(0,0,0,0.5)] z-20 flex flex-col justify-between items-center py-4 text-[#140f0c] text-[10px] font-serif select-none border-y-2 border-[#ffdf7a]"
          >
            <span>𓂀</span>
            <div className="h-2/3 w-0.5 bg-black/40" />
            <span>𓋹</span>
          </motion.div>

          {/* UNROLLING PAPYRUS INNER CANVAS */}
          <motion.div
            initial={{ width: 0, opacity: 0, scaleY: 0.9 }}
            animate={{ width: '540px', opacity: 1, scaleY: 1 }}
            transition={{ type: 'spring', damping: 24, stiffness: 75, delay: 0.3 }}
            className="bg-[#f5ebd2] text-[#3b2314] rounded-sm shadow-[0_10px_35px_rgba(0,0,0,0.7)] overflow-hidden z-10 border-y-[6px] border-[#b08e23]/30 flex flex-col select-none relative"
            style={{ maxWidth: 'calc(100vw - 60px)' }}
          >
            {/* Gilded Background Papyrus Grain texture & watermark */}
            <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(#8c6e12_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-[#b08e23]/5 font-serif select-none pointer-events-none">
              𓂀
            </div>

            {/* Scroll Header */}
            <div className="p-6 md:p-8 text-center pb-2 relative" ref={scrollRef}>
              <div className="flex justify-center gap-1.5 text-[#b08e23] text-sm font-serif mb-1">
                <span>𓋹</span>
                <span>𓂀</span>
                <span>𓆗</span>
              </div>
              <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#70553d] font-bold block">
                Sacred Royal Outpost Pass
              </span>
              <h3 className="font-serif text-2xl font-black uppercase tracking-wide text-[#5c432e] mt-1 border-b border-[#b08e23]/30 pb-3">
                {booking.excursionTitle}
              </h3>

              {/* Scroll Content Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-left my-5 bg-[#eae0c6] p-4 rounded-lg border border-[#b08e23]/20 relative shadow-inner">
                <div>
                  <span className="text-[8px] font-mono uppercase text-[#70553d] tracking-wider block">
                    Noble Traveler
                  </span>
                  <span className="font-serif text-sm font-bold text-[#3b2314]">
                    {booking.travelerName}
                  </span>
                  <span className="text-[9px] text-[#70553d] font-mono block truncate">
                    {booking.travelerEmail}
                  </span>
                </div>

                <div>
                  <span className="text-[8px] font-mono uppercase text-[#70553d] tracking-wider block">
                    Embarkation Solar Date
                  </span>
                  <span className="font-serif text-sm font-bold text-[#3b2314] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#b08e23]" />
                    {booking.date}
                  </span>
                </div>

                <div>
                  <span className="text-[8px] font-mono uppercase text-[#70553d] tracking-wider block">
                    Expedition Fleet Size
                  </span>
                  <span className="font-serif text-sm font-bold text-[#3b2314] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#b08e23]" />
                    {booking.numberOfGuests} Traveler(s)
                  </span>
                </div>

                <div>
                  <span className="text-[8px] font-mono uppercase text-[#70553d] tracking-wider block">
                    Tribute Offering
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#8c6e12] flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {booking.totalCost} USD
                  </span>
                </div>
              </div>

              {/* QR Code in Center of Scroll */}
              <div className="flex flex-col items-center justify-center my-4">
                <div className="p-2 bg-white/70 border border-[#b08e23]/40 rounded-xl shadow-md">
                  <BookingQRCode
                    bookingId={booking.id}
                    travelerName={booking.travelerName}
                    excursionTitle={booking.excursionTitle}
                    lightTheme={true}
                    compact={true}
                  />
                </div>
                <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-[#8c6e12] font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Verified in Royal Registries</span>
                </div>
              </div>

              {/* Bottom Instructions */}
              <p className="text-[10px] leading-relaxed text-[#70553d] text-center max-w-sm mx-auto italic mt-4 border-t border-[#b08e23]/15 pt-3">
                “This papyrus authorizes boarding. Present this gold-etched code token to the port officer or desert guide. Have a magnificent, safe adventure.”
              </p>

              {/* Cartouche Sentinel Seal */}
              <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#b08e23] font-extrabold flex justify-center items-center gap-2">
                <span>𓍹</span>
                <span>HOUSE OF LIFE REGISTRY</span>
                <span>𓍺</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="flex flex-wrap gap-3 mt-6 justify-center z-10 font-mono text-xs w-full max-w-sm px-4"
        >
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0c] hover:from-[#e6c280] hover:to-[#d4af37] active:scale-95 transition-all rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Travel Scroll</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-[#d4af37]/45 text-stone-300 hover:text-white active:scale-95 transition-all rounded-xl font-bold uppercase tracking-wider cursor-pointer"
          >
            Close Scroll
          </button>
        </motion.div>

      </div>
    </div>
  );
}
