import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Tag, ChevronRight, X, Percent } from 'lucide-react';

interface SeasonDiscount {
  id: string;
  name: string;
  hieroglyph: string;
  discount: string;
  code: string;
  title: string;
  description: string;
  dates: string;
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  textColor: string;
  iconBg: string;
}

export function getCurrentSeasonDiscount(date: Date): SeasonDiscount {
  const month = date.getMonth(); // 0-indexed: 0=Jan, 6=July, 11=Dec
  const day = date.getDate();
  
  // Summer Solstice of Ra (June 21 to Aug 31) -> Months: 5 (June 21+) to 7 (Aug 31)
  if (
    (month === 5 && day >= 21) || 
    month === 6 || 
    month === 7
  ) {
    return {
      id: 'summer_ra',
      name: "Ra's Summer Solstice",
      hieroglyph: "𓇳",
      discount: "15% OFF",
      code: "SOLSTICERA15",
      title: "The Zenith of Ra: High Summer Sanctuary",
      description: "As Ra shines at his supreme celestial peak, we offer 15% off all sacred desert safaris and coral diving expeditions. Bask in the solar energy of Kemet!",
      dates: "June 21 - August 31",
      colorFrom: "from-amber-950/40",
      colorTo: "to-red-950/30",
      accentColor: "border-[#d4af37]/45",
      textColor: "text-[#e6c280]",
      iconBg: "bg-[#d4af37]/10",
    };
  } 
  // Inundation (Akhet) Season (Sept 1 to Nov 30) -> Months: 8 (Sept) to 10 (Nov)
  else if (month >= 8 && month <= 10) {
    return {
      id: 'akhet_nile',
      name: "Akhet Inundation Festival",
      hieroglyph: "𓈗",
      discount: "20% OFF",
      code: "FLOODHAPI20",
      title: "Hapi's Bounty: Nile Inundation Season",
      description: "Celebrate the annual rising of the life-giving Nile river with 20% off all private yacht cruises and speedboat journeys. Let the waters of abundance carry you!",
      dates: "September 1 - November 30",
      colorFrom: "from-cyan-950/40",
      colorTo: "to-blue-950/30",
      accentColor: "border-cyan-500/40",
      textColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
    };
  } 
  // Osiris Winter Mysteries (Dec 1 to Feb 28/29) -> Months: 11 (Dec), 0 (Jan), 1 (Feb)
  else if (month === 11 || month === 0 || month === 1) {
    return {
      id: 'osiris_winter',
      name: "Osiris Winter Mysteries",
      hieroglyph: "𓀭",
      discount: "10% OFF",
      code: "OSIRISMYSTERY10",
      title: "Mysteries of Osiris: Crisp Desert Solace",
      description: "Under the cool starry canopy of Nut, enjoy 10% off the holy Valley of the Kings pilgrimage routes and nocturnal dune star-gazing safaris.",
      dates: "December 1 - February 28",
      colorFrom: "from-purple-950/40",
      colorTo: "to-stone-900/30",
      accentColor: "border-purple-500/40",
      textColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
    };
  } 
  // Spring Rebirth (Shemu) (March 1 to June 20) -> Months: 2 (March) to 5 (June 20)
  else {
    return {
      id: 'shemu_harvest',
      name: "Shemu Spring Rebirth",
      hieroglyph: "𓆰",
      discount: "15% OFF",
      code: "REBIRTHSHEMU15",
      title: "Shemu: The Harvest and Spring Rebirth",
      description: "The fertile soils blossom! Embark with 15% off on all deep sea diving voyages and speed-chariots across the Red Sea as the earth awakens.",
      dates: "March 1 - June 20",
      colorFrom: "from-emerald-950/40",
      colorTo: "to-stone-900/30",
      accentColor: "border-emerald-500/40",
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    };
  }
}

export default function PromotionalBanner() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // We sync with actual local system time
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const season = getCurrentSeasonDiscount(currentDate);

  const handleWhatsAppRedirection = () => {
    const msg = `𓂀 Kemet Tours - Powered by Mas international Agency - SEASONAL OFFER 𓂀\n\nGreetings Scribe! I wish to redeem the "${season.name}" seasonal discount offering ${season.discount}.\nCode: ${season.code}\n\nPlease advise how I may apply this gold standard privilege to my upcoming booking!`;
    const url = `https://wa.me/201202181834?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank') || (window.location.href = url);
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(season.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full relative overflow-hidden rounded-2xl border ${season.accentColor} bg-gradient-to-r ${season.colorFrom} ${season.colorTo} p-5 md:p-6 shadow-xl shadow-black/40`}
        id="pharaonic-promo-banner"
      >
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

        {/* Background Hieroglyphs for mystical style */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] text-[120px] font-serif pointer-events-none select-none text-right">
          {season.hieroglyph} 𓋹 𓂀
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Discount Badge + Title Description */}
          <div className="flex items-start gap-4">
            <div className={`hidden sm:flex shrink-0 w-14 h-14 rounded-xl items-center justify-center ${season.textColor} ${season.iconBg} border border-current/20 font-serif text-3xl font-bold shadow-inner`}>
              {season.hieroglyph}
            </div>

            <div className="space-y-1.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-500/10 text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Divine Favor Active
                </span>
                <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {season.dates}
                </span>
              </div>
              <h3 className="font-serif text-lg md:text-xl font-extrabold text-[#fbf5e6] tracking-wide flex items-center gap-2">
                {season.title}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                {season.description}
              </p>
            </div>
          </div>

          {/* Action Call / Coupon Area */}
          <div className="flex flex-col xs:flex-row sm:items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
            {/* Promo Code Pill */}
            <div 
              onClick={copyToClipboard}
              className="bg-[#140f0a]/80 hover:bg-[#211a13] border border-[#d4af37]/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 group"
              title="Click to copy ritual code"
            >
              <div className="text-left">
                <span className="block text-[8px] font-mono uppercase tracking-widest text-stone-500">Sacred Voucher</span>
                <span className="font-mono text-sm font-black text-[#d4af37] tracking-wider uppercase group-hover:text-amber-200">
                  {season.code}
                </span>
              </div>
              <div className="bg-[#d4af37]/15 p-1.5 rounded-lg border border-[#d4af37]/25 text-[#d4af37] group-hover:bg-[#d4af37]/35 transition-colors">
                {copied ? (
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 px-1">Sealed!</span>
                ) : (
                  <Tag className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            {/* Redirection / Redeem Action Button */}
            <button
              onClick={handleWhatsAppRedirection}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-serif font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.03] shadow-md shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2 border-b-2 border-emerald-700 hover:border-emerald-500"
            >
              <span>Redeem {season.discount}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-stone-400 hover:text-[#d4af37] transition-colors p-1 hover:bg-stone-900/30 rounded-full cursor-pointer"
          title="Dismiss Offer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
