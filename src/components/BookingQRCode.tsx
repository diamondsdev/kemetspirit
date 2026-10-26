import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, RefreshCw, QrCode, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

interface BookingQRCodeProps {
  bookingId: string;
  travelerName: string;
  excursionTitle: string;
  lightTheme?: boolean;
  compact?: boolean;
}

export default function BookingQRCode({
  bookingId,
  travelerName,
  excursionTitle,
  lightTheme = false,
  compact = false,
}: BookingQRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Generate unique check-in payload representing the ticket
  const checkInPayload = JSON.stringify({
    ticketId: bookingId,
    traveler: travelerName,
    tour: excursionTitle,
    issuedAt: new Date().toISOString(),
    registrar: 'Kemet Royal Registries',
  });

  useEffect(() => {
    let active = true;

    const generateCode = async () => {
      try {
        setGenerating(true);
        // Design colors matching the ancient Kemet aesthetic
        const darkColor = lightTheme ? '#3b2314' : '#d4af37'; // Nile Clay or Pharaonic Gold
        const lightColor = lightTheme ? '#f7ebd3' : '#140f0c'; // Papyrus or Obsidian Temple Basalt

        const url = await QRCode.toDataURL(checkInPayload, {
          width: compact ? 140 : 200,
          margin: 1.5,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'H', // High error correction
        });

        if (active) {
          setQrUrl(url);
          setGenerating(false);
        }
      } catch (err: any) {
        console.error('Failed to craft sacred QR talisman:', err);
        if (active) {
          setError('Divine matrix failed to align.');
          setGenerating(false);
        }
      }
    };

    generateCode();

    return () => {
      active = false;
    };
  }, [bookingId, travelerName, excursionTitle, lightTheme, compact]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color constants for themes
  const textTitleClass = lightTheme ? 'text-[#3b2314] font-bold' : 'text-[#e6c280] font-bold';
  const textMutedClass = lightTheme ? 'text-[#70553d]' : 'text-stone-400';
  const borderClass = lightTheme ? 'border-[#b08e23]/30' : 'border-[#d4af37]/30';
  const bgClass = lightTheme ? 'bg-[#f7ebd3]/60' : 'bg-[#140f0c]/80';

  if (compact) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${borderClass} ${bgClass} relative overflow-hidden group`}>
        {generating ? (
          <div className="w-[120px] h-[120px] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-[#d4af37]" />
          </div>
        ) : error ? (
          <div className="text-[10px] text-red-400 font-mono text-center w-[120px] h-[120px] flex items-center justify-center">
            {error}
          </div>
        ) : (
          <div className="relative">
            {/* Holographic scanner laser line */}
            <motion.div
              animate={{ y: [0, 120, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-400/70 shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none z-10"
            />
            <img
              src={qrUrl}
              alt="Sacred QR Ticket"
              className="w-[120px] h-[120px] object-contain rounded border border-[#d4af37]/20 select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <span className="text-[8px] font-mono mt-1 text-[#d4af37] tracking-widest uppercase">
          𓂀 SCAN AT OUTPOST
        </span>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl border-2 ${borderClass} ${bgClass} relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center gap-6`}>
      {/* Decorative Pharaonic Corner Amulets */}
      <div className="absolute top-2 left-2 text-[#d4af37]/30 text-xs font-serif pointer-events-none select-none">𓋹</div>
      <div className="absolute top-2 right-2 text-[#d4af37]/30 text-xs font-serif pointer-events-none select-none">𓂀</div>
      <div className="absolute bottom-2 left-2 text-[#d4af37]/30 text-xs font-serif pointer-events-none select-none">𓆗</div>
      <div className="absolute bottom-2 right-2 text-[#d4af37]/30 text-xs font-serif pointer-events-none select-none">𓏞</div>

      {/* QR Code Canvas Frame */}
      <div className="relative flex-shrink-0 flex flex-col items-center justify-center">
        <div className={`p-2.5 rounded-xl border border-[#d4af37]/40 bg-black/40 relative shadow-inner overflow-hidden`}>
          {generating ? (
            <div className="w-[160px] h-[160px] flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#d4af37]" />
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Inscribing...</span>
            </div>
          ) : error ? (
            <div className="w-[160px] h-[160px] flex items-center justify-center text-center text-xs text-red-400 font-mono p-4">
              {error}
            </div>
          ) : (
            <div className="relative">
              {/* Animated scanner radar light */}
              <motion.div
                animate={{ y: [0, 160, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                className="absolute left-0 right-0 h-[2.5px] bg-[#d4af37] shadow-[0_0_10px_#d4af37] pointer-events-none z-10"
              />
              <img
                src={qrUrl}
                alt="Sacred QR Code check-in token"
                className="w-[160px] h-[160px] object-contain rounded-lg border border-[#d4af37]/20 select-none shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
        
        {/* Pulsator Indicator representing a live ticket */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
            Ready to Scan
          </span>
        </div>
      </div>

      {/* Ticket Details Box */}
      <div className="flex-1 space-y-3.5 text-center md:text-left">
        <div>
          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest block font-bold">
            Sacred Entry Ticket
          </span>
          <h4 className={`font-serif text-base uppercase tracking-wide mt-0.5 ${textTitleClass}`}>
            {excursionTitle}
          </h4>
          <p className={`text-[11px] font-medium ${textMutedClass} mt-0.5`}>
            Traveler Name: <span className={lightTheme ? 'text-[#3b2314] font-bold' : 'text-stone-100 font-medium'}>{travelerName}</span>
          </p>
        </div>

        {/* Informational Guidelines for Check-in */}
        <div className={`p-3 rounded-lg text-[11px] leading-relaxed border ${lightTheme ? 'bg-[#3b2314]/5 border-[#3b2314]/10 text-[#4b311e]' : 'bg-[#1a1410]/90 border-stone-800/80 text-stone-300'} font-sans`}>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] font-black block mb-0.5">
            𓋹 Check-in Instructions:
          </span>
          Present this gold-inscribed digital amulet to the harbor master or desert caravan captain at check-in. The registrar will scan your booking token to authorize boarding. May Ra shine upon your journey.
        </div>

        {/* Actions panel */}
        <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
          <span className="font-mono text-[10px] text-stone-500 uppercase">Token:</span>
          <code className={`px-2 py-1 rounded text-[10px] font-mono ${lightTheme ? 'bg-[#3b2314]/10 text-[#3b2314]' : 'bg-stone-900 text-stone-300'}`}>
            {bookingId.slice(0, 10)}...{bookingId.slice(-6)}
          </code>
          <button
            onClick={handleCopyToken}
            className={`p-1.5 rounded transition-all cursor-pointer ${lightTheme ? 'hover:bg-[#3b2314]/10 text-[#3b2314]' : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'}`}
            title="Copy full booking token ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
