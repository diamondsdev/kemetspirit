import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Calendar, Users, Compass, Shield, Award, MapPin } from 'lucide-react';
import { Booking, Excursion } from '../types';
import BookingQRCode from './BookingQRCode';

interface ScrollItineraryModalProps {
  booking: Booking;
  excursion?: Excursion;
  onClose: () => void;
}

export default function ScrollItineraryModal({ booking, excursion, onClose }: ScrollItineraryModalProps) {
  
  // Clean up body scroll bar when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      
      {/* Dynamic style tag for high-fidelity print overrides */}
      <style>{`
        @media print {
          /* Hide all page content except the print scroll container */
          body * {
            visibility: hidden;
            background: none !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            color: #3b2314 !important;
            background-color: #f7ebd3 !important;
            border: 4px double #8b6c42 !important;
            padding: 2.5rem !important;
            box-shadow: none !important;
          }
          /* Hide print action button in PDF/Print view */
          .no-print {
            display: none !important;
          }
          /* Ensure text reads nicely */
          .print-gold {
            color: #8b6c42 !important;
          }
          .print-dark {
            color: #3b2314 !important;
          }
        }
      `}</style>

      {/* Main Dialog Container */}
      <div className="relative w-full max-w-2xl bg-[#140f0c] border border-[#d4af37]/45 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        
        {/* Header action bar (non-printable) */}
        <div className="flex justify-between items-center p-5 border-b border-stone-800 bg-[#1c1612] no-print">
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37] text-lg">𓏞</span>
            <span className="font-serif font-black text-xs uppercase tracking-widest text-[#e6c280]">
              Travel Itinerary Scroll
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#d4af37] hover:bg-[#e5c250] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#d4af37]/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 p-1.5 bg-stone-800/50 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Content container (Scrollable for preview, elegant look) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-start bg-black/40">
          
          {/* Scroll preview frame with roll ends */}
          <div className="w-full max-w-xl space-y-2">
            
            {/* Top Scroll Roller Bar */}
            <div className="w-[102%] -ml-[1%] h-5 bg-[#b08e23] border border-[#856512] rounded-full shadow-md relative flex justify-between items-center px-4 no-print">
              <div className="w-3 h-3 bg-stone-900 rounded-full border border-[#856512]" />
              <div className="w-20 h-1 bg-[#fbf5e6]/20 rounded-full" />
              <div className="w-3 h-3 bg-stone-900 rounded-full border border-[#856512]" />
            </div>

            {/* Inner Scroll Parchment */}
            <div
              id="print-area"
              className="bg-[#fcf5e3] border-4 border-[#d4af37]/80 rounded-sm p-8 md:p-12 text-[#2e1d11] shadow-2xl relative overflow-hidden font-serif"
              style={{ backgroundImage: 'radial-gradient(#fff9ea 40%, #f1e4c3)' }}
            >
              {/* Egyptian Hieroglyphs Decorative watermark backgrounds */}
              <div className="absolute top-8 left-8 text-amber-900/5 text-7xl select-none pointer-events-none font-serif">
                𓂀
              </div>
              <div className="absolute top-8 right-8 text-amber-900/5 text-7xl select-none pointer-events-none font-serif">
                𓋹
              </div>
              <div className="absolute bottom-8 left-8 text-amber-900/5 text-7xl select-none pointer-events-none font-serif">
                𓅃
              </div>
              <div className="absolute bottom-8 right-8 text-amber-900/5 text-7xl select-none pointer-events-none font-serif">
                𓉐
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-900/[0.02] text-[180px] select-none pointer-events-none font-serif">
                𓁠
              </div>

              {/* Scroll Content */}
              <div className="space-y-6 relative z-10">
                
                {/* Royal Seal & Greeting */}
                <div className="text-center space-y-2 border-b-2 border-dashed border-[#b08e23]/30 pb-6">
                  <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#b08e23] flex items-center justify-center bg-[#fdfaf2] text-[#b08e23] text-3xl font-serif shadow-sm">
                    𓋹
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#8e6512] uppercase font-bold block">
                    Kemet Travel Expeditions
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-[#56361a] uppercase tracking-wider print-dark">
                    Official Travel Itinerary
                  </h2>
                  <p className="text-[11px] font-mono text-[#8c6b3e] uppercase tracking-widest">
                    Booking ID: #{booking.id.toUpperCase()}
                  </p>
                </div>

                {/* Blessing intro */}
                <div className="text-center italic text-[#563b25] text-xs max-w-md mx-auto leading-relaxed">
                  "This document certifies that your booking has been successfully confirmed. We are excited to welcome you on this unforgettable journey. Please keep a copy of this itinerary with you."
                </div>

                {/* Main Details block */}
                <div className="bg-[#f7ebd3]/60 border border-[#b08e23]/25 rounded-2xl p-5 md:p-6 space-y-4 shadow-inner">
                  
                  {/* Row 1: Traveler name & Excursion Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#b08e23]/20">
                    <div>
                      <span className="text-[9px] font-mono text-[#8e6512] uppercase tracking-wider block font-bold">Traveler Name:</span>
                      <span className="text-[#3b2314] font-bold text-base block">{booking.travelerName}</span>
                      <span className="text-[10px] text-[#70553d] font-mono">{booking.travelerEmail}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#8e6512] uppercase tracking-wider block font-bold">Selected Tour:</span>
                      <span className="text-[#3b2314] font-bold text-base block uppercase tracking-wide">{booking.excursionTitle}</span>
                    </div>
                  </div>

                  {/* Row 2: Date, Guest count, Gold cost */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border-r border-[#b08e23]/20">
                      <span className="text-[9px] font-mono text-[#8e6512] uppercase tracking-wider block font-bold">Travel Date:</span>
                      <span className="text-[#3b2314] text-xs font-bold block font-mono mt-0.5">{booking.date}</span>
                    </div>
                    <div className="border-r border-[#b08e23]/20">
                      <span className="text-[9px] font-mono text-[#8e6512] uppercase tracking-wider block font-bold">Group Size:</span>
                      <span className="text-[#3b2314] text-xs font-bold block mt-0.5">{booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Person' : 'People'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#8e6512] uppercase tracking-wider block font-bold">Total Paid:</span>
                      <span className="text-[#b48316] text-xs font-mono font-bold block mt-0.5">${booking.totalCost}</span>
                    </div>
                  </div>

                </div>

                {/* Stylized QR Code Amulet for Outpost Check-in (Prints beautifully on Papyrus Scroll) */}
                <div className="w-full pt-1">
                  <BookingQRCode
                    bookingId={booking.id}
                    travelerName={booking.travelerName}
                    excursionTitle={booking.excursionTitle}
                    lightTheme={true}
                  />
                </div>

                {/* Excursion Particulars (Highlights & Lore if available) */}
                {excursion && (
                  <div className="space-y-3.5 text-xs text-[#4b311e] border-t border-[#b08e23]/20 pt-4">
                    
                    <div>
                      <h4 className="font-mono text-[9px] uppercase tracking-wider text-[#8e6512] font-bold mb-1">
                        𓆛 Tour Information & Highlights
                      </h4>
                      <p className="italic leading-relaxed text-[#5a422e] text-[11px] pl-3 border-l-2 border-[#b08e23]/40">
                        "{excursion.ancientLore}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#8e6512] font-bold block mb-1">What's Included:</span>
                        <ul className="space-y-1 text-[10px] list-disc list-inside text-[#563c27]">
                          {excursion.inclusions.slice(0, 3).map((inc, i) => (
                            <li key={i}>{inc}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#8e6512] font-bold block mb-1">Tour Highlights:</span>
                        <ul className="space-y-1 text-[10px] list-disc list-inside text-[#563c27]">
                          {excursion.highlights.slice(0, 3).map((hi, i) => (
                            <li key={i}>{hi}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* Special Wishes */}
                {booking.specialRequests && (
                  <div className="bg-[#fbfbf8] border border-stone-300 rounded-xl p-3.5 text-[11px] text-[#563b25] italic font-sans">
                    <strong className="text-[#8e6512] not-italic uppercase font-mono block text-[8px] tracking-wider mb-0.5 font-bold">
                      Special Requests:
                    </strong>
                    "{booking.specialRequests}"
                  </div>
                )}

                {/* Royal Seal Signatures */}
                <div className="flex justify-between items-end pt-8 border-t border-dashed border-[#b08e23]/30">
                  <div className="text-left space-y-1">
                    <div className="text-[14px] font-serif text-[#8e6512] select-none">
                      𓂀 𓋹 𓏞
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[#8c6b3e] block font-bold">
                      Authorized Registrar Seal
                    </span>
                    <span className="text-[9px] font-sans italic text-stone-500 block">
                      Confirmed & Approved
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono text-xs text-[#3b2314] italic">
                      Travel Registrar
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[#8c6b3e] block font-bold">
                      Travel Registrar
                    </span>
                    <span className="text-[9px] font-sans text-stone-500 block">
                      Inscribed on 2026-07-15
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Scroll Roller Bar */}
            <div className="w-[102%] -ml-[1%] h-5 bg-[#b08e23] border border-[#856512] rounded-full shadow-md relative flex justify-between items-center px-4 no-print">
              <div className="w-3 h-3 bg-stone-900 rounded-full border border-[#856512]" />
              <div className="w-20 h-1 bg-[#fbf5e6]/20 rounded-full" />
              <div className="w-3 h-3 bg-stone-900 rounded-full border border-[#856512]" />
            </div>

          </div>

          {/* Quick tip (non-printable) */}
          <p className="text-[10px] font-mono text-stone-500 text-center mt-4 uppercase tracking-widest no-print">
            💡 Tip: Choose 'Save as PDF' inside the print dialog to secure this scroll digitally.
          </p>

        </div>

      </div>

    </div>
  );
}
