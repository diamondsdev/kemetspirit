import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Sparkles, Award } from 'lucide-react';
import { Booking } from '../types';

interface CertificateProps {
  booking: Booking;
  onClose: () => void;
  language: string;
}

export default function DigitalKeepsakeCertificate({ booking, onClose, language }: CertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  const getLocalizedTexts = () => {
    const texts: Record<string, {
      title: string;
      subtitle: string;
      certified: string;
      hasSuccessfully: string;
      rankGranted: string;
      givenOn: string;
      underSeal: string;
      officialSeal: string;
      printBtn: string;
      closeBtn: string;
    }> = {
      en: {
        title: "Sacred Seal of Completion",
        subtitle: "KINGDOM OF KEMET EXPEDITIONS",
        certified: "Be it known to all scribes and nobles across the Nile",
        hasSuccessfully: "has braved the trials and successfully completed the holy expedition of",
        rankGranted: "And is hereby granted the eternal title of Honorary Explorer of Kemet, with all rights and blessings of the water, earth, and sky spirits.",
        givenOn: "Granted on this day",
        underSeal: "Under the watchful eye of the High Priest and Oracle",
        officialSeal: "OFFICIAL SEAL",
        printBtn: "Print / Save as PDF",
        closeBtn: "Close Scroll"
      },
      de: {
        title: "Heiliges Siegel der Vollendung",
        subtitle: "EXPEDITIONEN DES KÖNIGREICHS KEMET",
        certified: "Es sei allen Schreibern und Adligen am Nil kundgetan",
        hasSuccessfully: "hat die Prüfungen bestanden und die heilige Expedition erfolgreich abgeschlossen:",
        rankGranted: "Und erhält hiermit den ewigen Titel eines Ehrenforschers von Kemet, mit allen Rechten und Segnungen der Wasser-, Erd- und Himmelsgeister.",
        givenOn: "Verliehen am heutigen Tage",
        underSeal: "Unter dem wachsamen Auge des Hohepriesters und Orakels",
        officialSeal: "OFFIZIELLES SIEGEL",
        printBtn: "Drucken / Als PDF speichern",
        closeBtn: "Schriftrolle schließen"
      },
      pl: {
        title: "Święta Pieczęć Ukończenia",
        subtitle: "WYPRAWY KRÓLESTWA KEMET",
        certified: "Niech będzie to wiadome wszystkim pisarzom i szlachcie wzdłuż Nilu",
        hasSuccessfully: "stawił czoła próbom i pomyślnie ukończył świętą wyprawę:",
        rankGranted: "I niniejszym otrzymuje wieczny tytuł Honorowego Odkrywcy Kemet, ze wszystkimi prawami i błogosławieństwami duchów wody, ziemi i nieba.",
        givenOn: "Nadano dnia",
        underSeal: "Pod czujnym okiem Arcykapłana i Wyroczni",
        officialSeal: "OFICJALNA PIECZĘĆ",
        printBtn: "Drukuj / Zapisz jako PDF",
        closeBtn: "Zamknij zwoje"
      },
      cs: {
        title: "Posvátná pečeť dokončení",
        subtitle: "EXPEDICE KRÁLOVSTVÍ KEMET",
        certified: "Nechť je známo všem písařům a šlechticům podél Nilu",
        hasSuccessfully: "čelil zkouškám a úspěšně dokončil posvátnou expedici:",
        rankGranted: "A tímto se mu uděluje věčný titul čestného objevitele Kemeta se všemi právy a požehnáními duchů vody, země a nebe.",
        givenOn: "Uděleno dne",
        underSeal: "Pod bdělým okem velekněze a věštírny",
        officialSeal: "OFICIÁLNÍ PEČEŤ",
        printBtn: "Vytisknout / Uložit jako PDF",
        closeBtn: "Zavřít svitek"
      }
    };

    return texts[language] || texts['en'];
  };

  const t = getLocalizedTexts();

  return (
    <div className="fixed inset-0 bg-[#0c0805]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
      {/* Dynamic style tag to clean up printing outputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #keepsake-certificate-print, #keepsake-certificate-print * {
            visibility: visible !important;
          }
          #keepsake-certificate-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background: #fbf5e6 !important;
            color: #2c1a0c !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="max-w-3xl w-full bg-[#18110b] border border-[#d4af37]/45 rounded-2xl p-6 md:p-8 relative shadow-2xl flex flex-col items-center">
        
        {/* Header toolbar */}
        <div className="w-full flex justify-between items-center border-b border-[#d4af37]/20 pb-4 mb-6 no-print">
          <div className="flex items-center gap-2">
            <Award className="text-[#d4af37] w-5 h-5 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#e6c280]">
              {language === 'de' ? 'Digitales Andenken' : language === 'pl' ? 'Cyfrowa pamiątka' : 'Digital Keepsake'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-[#d4af37] to-[#bfa030] text-[#140f0a] px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/15"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white bg-[#261c12] p-2 rounded-xl border border-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINT TARGET CONTAINER */}
        <div 
          id="keepsake-certificate-print"
          className="w-full bg-[#fbf5e6] text-[#2c1a0c] border-8 border-double border-[#d4af37] p-8 md:p-12 rounded-xl relative overflow-hidden flex flex-col items-center text-center shadow-inner"
          style={{ backgroundImage: 'radial-gradient(#f7edce 1px, transparent 1px)', backgroundColor: '#fbf5e6', backgroundSize: '24px 24px' }}
        >
          {/* Subtle Hieroglyphic Corners */}
          <div className="absolute top-4 left-4 text-[#d4af37]/40 text-2xl font-serif select-none">𓋹 𓂀</div>
          <div className="absolute top-4 right-4 text-[#d4af37]/40 text-2xl font-serif select-none">𓂀 𓋹</div>
          <div className="absolute bottom-4 left-4 text-[#d4af37]/40 text-2xl font-serif select-none">𓉐 𓅃</div>
          <div className="absolute bottom-4 right-4 text-[#d4af37]/40 text-2xl font-serif select-none">𓅃 𓉐</div>

          {/* Certificate Content */}
          <div className="space-y-6 max-w-2xl">
            {/* Header / Seal */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#d4af37] uppercase">{t.subtitle}</span>
              <div className="flex items-center gap-3 my-2">
                <span className="text-3xl text-[#d4af37]">𓋹</span>
                <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-wide uppercase text-[#3e2714]">
                  {t.title}
                </h1>
                <span className="text-3xl text-[#d4af37]">𓂀</span>
              </div>
              <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            </div>

            {/* Certifies */}
            <p className="font-serif italic text-sm text-[#5a3f24] leading-relaxed">
              {t.certified}
            </p>

            {/* Traveler's Name in Cartouche */}
            <div className="relative inline-block my-4">
              {/* Left/Right Cartouche End caps */}
              <div className="absolute left-[-12px] top-0 bottom-0 w-[12px] border-y-4 border-l-4 border-[#d4af37] rounded-l-full bg-[#fbf5e6]"></div>
              <div className="absolute right-[-12px] top-0 bottom-0 w-[12px] border-y-4 border-r-4 border-[#d4af37] rounded-r-full bg-[#fbf5e6]"></div>
              
              <div className="border-y-4 border-[#d4af37] px-8 py-2.5 bg-[#f5ebd0] text-[#3e2714] font-serif tracking-[0.2em] text-lg md:text-xl uppercase font-extrabold min-w-[240px] text-center shadow-sm">
                {booking.travelerName}
              </div>
            </div>

            {/* Completion Statement */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#5a3f24] uppercase tracking-wider">
                {t.hasSuccessfully}
              </p>
              <h2 className="font-serif text-xl md:text-2xl font-extrabold uppercase text-[#3e2714] tracking-wide my-2 px-4 py-1.5 bg-[#f3e5c8]/50 border-y border-[#d4af37]/30">
                {booking.excursionTitle}
              </h2>
              <p className="text-xs font-serif text-[#5a3f24] max-w-lg mx-auto leading-relaxed">
                {t.rankGranted}
              </p>
            </div>

            {/* Date */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[#5a3f24] uppercase block tracking-widest">{t.givenOn}</span>
              <span className="font-serif text-sm text-[#3e2714] font-bold underline decoration-[#d4af37] underline-offset-4">{booking.date}</span>
            </div>

            {/* Signatures & Seal Block */}
            <div className="flex justify-between items-center pt-6 max-w-md mx-auto">
              <div className="text-left space-y-1">
                <span className="font-serif text-xs italic text-[#5a3f24]">{t.underSeal}</span>
                <div className="w-28 h-[1px] bg-stone-400"></div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">Scribe of Hermopolis</span>
              </div>

              {/* Official Seal Emblem */}
              <div className="w-16 h-16 rounded-full border-4 border-[#d4af37] bg-[#f5ebd0] flex flex-col items-center justify-center relative shadow-sm">
                <span className="text-[#d4af37] text-xl font-serif">𓁠</span>
                <span className="text-[7px] font-mono text-[#d4af37] uppercase tracking-widest mt-0.5 scale-90">{t.officialSeal}</span>
                {/* Outer decorative ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-[#d4af37]/50 m-[2px]"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info message */}
        <p className="text-[11px] font-mono text-stone-500 text-center mt-4 leading-normal no-print max-w-md">
          {language === 'de'
            ? 'Tipp: Wenn Sie auf Drucken klicken, können Sie im Druckmenü "Als PDF speichern" auswählen, um das Andenken digital zu behalten.'
            : language === 'pl'
            ? 'Wskazówka: Po kliknięciu Drukuj, możesz wybrać opcję „Zapisz jako PDF” w menu drukarki, aby zachować pamiątkę w formacie cyfrowym.'
            : 'Tip: After clicking Print, you can select "Save as PDF" in your print destination menu to keep this keepsake digitally.'}
        </p>

      </div>
    </div>
  );
}
