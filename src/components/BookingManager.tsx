import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Clock, MessageSquare, CheckCircle, Sparkles, Printer, QrCode, Ticket, Camera, FileSpreadsheet, Lock, Unlock, RefreshCw, ExternalLink, Award } from 'lucide-react';
import { Booking, Excursion } from '../types';
import { useLanguage } from './LanguageContext';
import ReviewSystem from './ReviewSystem';
import ScrollItineraryModal from './ScrollItineraryModal';
import BookingQRCode from './BookingQRCode';
import DetailedTicketCard from './DetailedTicketCard';
import ExcursionFeedbackForm from './ExcursionFeedbackForm';
import TicketScanner from './TicketScanner';
import ExcursionExpenseCalculator from './ExcursionExpenseCalculator';
import DigitalKeepsakeCertificate from './DigitalKeepsakeCertificate';
import { initAuth, googleSignIn, getAccessToken } from '../lib/firebaseAuth';
import { exportUserBookingsToNewSheet } from '../lib/googleSheets';

const STATUS_CONFIG = {
  'Pending Oracle Approval': {
    colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    barColor: 'bg-amber-500',
    icon: Clock,
    labelText: '𓀚 Reviewing',
    descText: 'Our team is reviewing your request and will approve it soon.',
  },
  'Confirmed by High Priest': {
    colorClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    barColor: 'bg-emerald-500',
    icon: CheckCircle,
    labelText: '𓋹 Confirmed',
    descText: 'Your spot is officially booked and ready to go!',
  },
  'Completed': {
    colorClass: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    barColor: 'bg-sky-500',
    icon: Sparkles,
    labelText: '𓁠 Completed',
    descText: 'We hope you had an amazing experience on your adventure!',
  }
};

interface BookingManagerProps {
  bookings: Booking[];
  excursions?: Excursion[];
  onCancelBooking?: (id: string) => void;
  onVerifyCheckIn?: (id: string) => void;
}

export default function BookingManager({ bookings, excursions, onCancelBooking, onVerifyCheckIn }: BookingManagerProps) {
  const { t, language } = useLanguage();
  const [selectedScrollBooking, setSelectedScrollBooking] = useState<Booking | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [certificateBooking, setCertificateBooking] = useState<Booking | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isManagerLoading, setIsManagerLoading] = useState<boolean>(true);

  // Google Sheets integration state for individual traveller bookings export
  const [gUser, setGUser] = useState<any>(null);
  const [gToken, setGToken] = useState<string | null>(null);
  const [isGAuthLoading, setIsGAuthLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportMessage, setExportMessage] = useState<string>('');
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string>('');

  // Handle Google OAuth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGUser(user);
        setGToken(token);
        setIsGAuthLoading(false);
      },
      () => {
        setGUser(null);
        setGToken(null);
        setIsGAuthLoading(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleExportUserBookings = async () => {
    let tokenToUse = gToken;
    if (!tokenToUse) {
      try {
        setIsExporting(true);
        setExportStatus('idle');
        setExportMessage(language === 'de' ? 'Autorisiere Google-Konto...' : language === 'pl' ? 'Autoryzowanie konta Google...' : 'Authorizing Google Account...');
        const res = await googleSignIn();
        if (res) {
          tokenToUse = res.accessToken;
          setGUser(res.user);
          setGToken(res.accessToken);
        } else {
          throw new Error('Authentication cancelled or failed.');
        }
      } catch (authErr: any) {
        setExportStatus('error');
        setExportMessage(language === 'de' ? `Autorisierung fehlgeschlagen: ${authErr.message || authErr}` : language === 'pl' ? `Autoryzacja nie powiodła się: ${authErr.message || authErr}` : `Authorization failed: ${authErr.message || authErr}`);
        setIsExporting(false);
        return;
      }
    }

    if (!tokenToUse) return;

    setIsExporting(true);
    setExportStatus('idle');
    setExportMessage(language === 'de' ? 'Erstelle heilige Tabelle und exportiere Buchungsdaten...' : language === 'pl' ? 'Tworzenie arkusza i eksportowanie danych...' : 'Creating sacred spreadsheet and exporting booking data...');

    try {
      const { url } = await exportUserBookingsToNewSheet(tokenToUse, bookings);
      setExportStatus('success');
      setExportedSheetUrl(url);
      setExportMessage(language === 'de' ? 'Expeditionen erfolgreich in Google Sheets exportiert!' : language === 'pl' ? 'Ekspedycje pomyślnie wyeksportowane do Google Sheets!' : 'Expeditions successfully exported to Google Sheets!');
    } catch (err: any) {
      console.error(err);
      setExportStatus('error');
      setExportMessage(language === 'de' ? `Export fehlgeschlagen: ${err.message || err}` : language === 'pl' ? `Eksport nie powiódł się: ${err.message || err}` : `Export failed: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsManagerLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10" id="booking-manager-wrapper">
      
      {/* Excursion Expense Calculator */}
      <ExcursionExpenseCalculator bookings={bookings} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ledger-manager-grid">
      
      {/* LEFT COLUMN: Sacred Booking Ledger (Pending Statuses) */}
      <div className="lg:col-span-6 space-y-6" id="bookings-ledger-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#d4af37]/20 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="text-[#d4af37] w-5 h-5" />
            <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
              {t('book_heading', 'Your Booked Expeditions')}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bookings.length > 0 && (
              <button
                disabled={isExporting}
                onClick={handleExportUserBookings}
                className="bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-[#fbf5e6] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                title="Export your current booking logs to Google Sheets"
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#d4af37]" />
                )}
                <span>
                  {isExporting 
                    ? (language === 'de' ? 'Exportiere...' : language === 'pl' ? 'Eksportowanie...' : 'Exporting...') 
                    : (language === 'de' ? 'In Sheets Exportieren' : language === 'pl' ? 'Eksportuj do Sheets' : 'Export to Sheets')}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 ${
                isScannerOpen
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : 'bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border-[#d4af37]/40 text-[#fbf5e6]'
              }`}
              title={language === 'de' ? 'Kamera öffnen, um Ticket-QR-Code zu scannen' : language === 'pl' ? 'Otwórz aparat, aby zeskanować kod QR biletu' : 'Open camera to scan ticket QR code'}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isScannerOpen ? (language === 'de' ? 'Scanner Schließen' : language === 'pl' ? 'Zamknij skaner' : 'Close Scanner') : (language === 'de' ? 'Ticket QR scannen' : language === 'pl' ? 'Skanuj kod QR biletu' : 'Scan Ticket QR')}</span>
            </button>
          </div>
        </div>

        {/* Export Feedback Console */}
        {(isExporting || exportStatus !== 'idle') && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 ${
            exportStatus === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
              : exportStatus === 'error'
              ? 'bg-red-500/10 border-red-500/35 text-red-400'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-400'
          }`}>
            <div className="flex items-center gap-2.5">
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0 text-[#d4af37]" />
              ) : exportStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 flex-shrink-0 text-red-400" />
              )}
              <span className="text-xs font-mono leading-tight">{exportMessage}</span>
            </div>
            
            {exportStatus === 'success' && exportedSheetUrl && (
              <a
                href={exportedSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'de' ? 'Öffnen' : language === 'pl' ? 'Otwórz' : 'Open'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <AnimatePresence>
          {isScannerOpen && onVerifyCheckIn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <TicketScanner
                bookings={bookings}
                onVerifyCheckIn={onVerifyCheckIn}
                onClose={() => setIsScannerOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {isManagerLoading ? (
            <div className="space-y-4" id="booking-manager-skeleton">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="bg-[#1f1a14] border border-[#d4af37]/15 rounded-xl p-5 space-y-4 shadow-md relative overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  
                  {/* Status Indicator Bar Skeleton */}
                  <div className="absolute top-0 right-0 h-1.5 w-1/3 bg-[#d4af37]/20 rounded-bl-md animate-pulse"></div>

                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                      <div className="w-24 h-3 bg-[#140f0c] rounded-md animate-pulse" />
                      <div className="w-48 h-5 bg-[#140f0c] rounded-md animate-pulse" />
                    </div>
                    
                    {/* Status badge skeleton */}
                    <div className="w-24 h-5 bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-full flex items-center justify-center gap-1.5">
                      <span className="text-[#d4af37]/40 text-[10px] animate-pulse">{idx % 2 === 0 ? '𓋹' : '𓂀'}</span>
                      <div className="w-10 h-2 bg-[#d4af37]/20 rounded-md animate-pulse" />
                    </div>
                  </div>

                  {/* Info grid skeleton */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#d4af37]/10 font-sans">
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-[#140f0c] rounded-md animate-pulse" />
                      <div className="w-24 h-3.5 bg-[#140f0c] rounded-md animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-[#140f0c] rounded-md animate-pulse" />
                      <div className="w-20 h-3.5 bg-[#140f0c] rounded-md animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-[#140f0c] rounded-md animate-pulse" />
                      <div className="w-14 h-3.5 bg-[#140f0c] rounded-md animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-[#140f0c] rounded-md animate-pulse" />
                      <div className="w-12 h-3.5 bg-[#d4af37]/20 rounded-md animate-pulse" />
                    </div>
                  </div>

                  {/* Actions skeleton */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="w-28 h-3.5 bg-[#140f0c] rounded-md animate-pulse" />
                    <div className="w-24 h-7 bg-[#d4af37]/10 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1410] border border-[#d4af37]/15 rounded-2xl text-stone-500 italic text-sm">
              𓀞 {language === 'de' ? 'Sie haben noch keine Reisen gebucht. Stöbern Sie oben in unseren Touren, um Ihr Abenteuer zu planen!' : language === 'pl' ? 'Nie masz jeszcze zarezerwowanych żadnych wycieczek. Przeglądaj nasze wycieczki powyżej, aby zaplanować przygodę!' : "You haven't booked any trips yet. Browse our tours above to plan your adventure!"}
            </div>
          ) : (
             <AnimatePresence mode="popLayout">
              {bookings.map((booking) => {
                const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending Oracle Approval'];
                const StatusIcon = config.icon;

                if (expandedTicketId === booking.id) {
                  return (
                    <DetailedTicketCard
                      key={booking.id}
                      booking={booking}
                      excursion={excursions?.find((e) => e.id === booking.excursionId)}
                      onCollapse={() => setExpandedTicketId(null)}
                      onCancelBooking={onCancelBooking}
                      onViewItinerary={(booking.status === 'Confirmed by High Priest' || booking.status === 'Completed') ? () => setSelectedScrollBooking(booking) : undefined}
                    />
                  );
                }

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#1f1a14] border border-[#d4af37]/30 rounded-xl p-5 space-y-3 shadow-md relative overflow-hidden"
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 right-0 h-1.5 w-1/3 ${config.barColor}`}></div>

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block">
                          Booking ID #{booking.id.slice(-6)}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase mt-0.5">
                          {booking.excursionTitle}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest ${config.colorClass}`}>
                          <StatusIcon className="w-3 h-3" />
                          {language === 'de' ? (booking.status === 'Completed' ? '𓁠 Abgeschlossen' : booking.status === 'Confirmed by High Priest' ? '𓋹 Bestätigt' : '𓀚 In Prüfung') : language === 'pl' ? (booking.status === 'Completed' ? '𓁠 Ukończono' : booking.status === 'Confirmed by High Priest' ? '𓋹 Potwierdzono' : '𓀚 Oczekuje') : config.labelText}
                        </div>
                        {booking.status === 'Confirmed by High Priest' && (
                          <div className="flex items-center gap-1 bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider font-bold shadow-[0_0_8px_rgba(212,175,55,0.15)]">
                            <QrCode className="w-2.5 h-2.5 animate-pulse" />
                            <span>{language === 'de' ? 'Mobiles QR bereit' : language === 'pl' ? 'Mobilny kod QR gotowy' : 'Mobile QR Ready'}</span>
                          </div>
                        )}
                        {booking.checkedIn && (
                          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider font-bold">
                            <span className="text-[10px]">𓋹</span> {language === 'de' ? 'Verifizierter Check-in' : language === 'pl' ? 'Zweryfikowana odprawa' : 'Verified Check-In'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-stone-400 pt-2 border-t border-stone-800/60 font-sans">
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">{language === 'de' ? 'Name des Reisenden:' : language === 'pl' ? 'Imię podróżnego:' : 'Traveler Name:'}</span>
                        <span className="text-stone-200 font-medium">{booking.travelerName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">{language === 'de' ? 'Reisedatum:' : language === 'pl' ? 'Data podróży:' : 'Travel Date:'}</span>
                        <span className="text-stone-200 font-medium">{booking.date}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">{language === 'de' ? 'Gruppengröße:' : language === 'pl' ? 'Rozmiar grupy:' : 'Group Size:'}</span>
                        <span className="text-stone-200 font-medium">{booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Person' : 'People'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Hotel & Room:</span>
                        <span className="text-stone-200 font-medium">{booking.hotelName || "Not specified"} {booking.roomNumber ? `(Room ${booking.roomNumber})` : ""}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Pickup & Phone:</span>
                        <span className="text-stone-200 font-medium">{booking.pickupTime || "07:30 AM"} • {booking.phoneNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">{language === 'de' ? 'Gesamtpreis:' : language === 'pl' ? 'Cena całkowita:' : 'Total Price:'}</span>
                        <span className="text-[#d4af37] font-mono font-bold">${booking.totalCost} {booking.promoCodeUsed ? `(${booking.promoCodeUsed} - Saved $${booking.discountAmount || 0})` : ""}</span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-[#191410] rounded-lg p-2.5 text-[11px] text-stone-400 italic">
                        <strong className="text-stone-500 not-italic uppercase font-mono block text-[9px] tracking-wider mb-0.5">
                          {language === 'de' ? 'Sonderwünsche:' : language === 'pl' ? 'Życzenia specjalne:' : 'Special Requests:'}
                        </strong>
                        "{booking.specialRequests}"
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1 text-[11px] font-mono flex-wrap">
                      <span className="text-stone-500 italic text-left flex-1 self-center min-w-[120px]">
                        {language === 'de' ? (booking.status === 'Completed' ? 'Wir hoffen, Sie hatten ein tolles Abenteuer!' : booking.status === 'Confirmed by High Priest' ? 'Ihre Buchung ist offiziell bestätigt!' : 'Unser Team prüft Ihre Buchung und gibt sie bald frei.') : language === 'pl' ? (booking.status === 'Completed' ? 'Mamy nadzieję, że przeżyłeś wspaniałą przygodę!' : booking.status === 'Confirmed by High Priest' ? 'Twoja rezerwacja jest oficjalnie potwierdzona!' : 'Nasz zespół weryfikuje Twoją rezerwację i wkrótce ją zatwierdzi.') : config.descText}
                      </span>

                      {/* Expand to Ticket Toggle Button */}
                      <button
                        onClick={() => setExpandedTicketId(booking.id)}
                        className="text-[#d4af37] hover:text-[#fbf5e6] px-3 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                        title={language === 'de' ? 'Zu einer detaillierten Ticketkarte ausklappen' : language === 'pl' ? 'Rozwiń, aby wyświetlić szczegółową kartę biletu z kodem QR' : 'Expand to a detailed ticket card with QR code'}
                      >
                        <Ticket className="w-3 h-3" />
                        <span>{language === 'de' ? '🎟️ Ticket anzeigen' : language === 'pl' ? '🎟️ Pokaż bilet' : '🎟️ Expand to Ticket'}</span>
                      </button>

                      {/* Ticket QR Toggle Button - Only for Confirmed Bookings */}
                      {booking.status === 'Confirmed by High Priest' && (
                        <button
                          onClick={() => setExpandedQrId(expandedQrId === booking.id ? null : booking.id)}
                          className={`px-3 py-1 border rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${
                            expandedQrId === booking.id
                              ? 'bg-[#d4af37] text-[#140f0c] border-[#d4af37]'
                              : 'text-[#d4af37] border-[#d4af37]/35 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/60'
                          }`}
                          title="Display unique check-in ticket QR"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>{expandedQrId === booking.id ? (language === 'de' ? 'QR-Code ausblenden' : language === 'pl' ? 'Ukryj kod QR' : 'Hide QR Code') : (language === 'de' ? 'Mobiles QR' : language === 'pl' ? 'Mobilny QR' : 'Mobile QR')}</span>
                        </button>
                      )}

                      {/* Excursion Feedback Toggle Button - Only for Completed Bookings */}
                      {booking.status === 'Completed' && (
                        <>
                          <button
                            onClick={() => setCertificateBooking(booking)}
                            className="px-3 py-1 bg-gradient-to-r from-[#d4af37]/25 to-[#bfa030]/25 hover:from-[#d4af37]/40 hover:to-[#bfa030]/40 border border-[#d4af37]/45 text-[#e6c280] rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                            title="Generate a Pharaonic-styled printable certificate of completion"
                          >
                            <Award className="w-3 h-3 text-[#d4af37]" />
                            <span>{language === 'de' ? '📜 Urkunde erstellen' : language === 'pl' ? '📜 Pobierz certyfikat' : '📜 Digital Keepsake'}</span>
                          </button>

                          <button
                            onClick={() => setExpandedFeedbackId(expandedFeedbackId === booking.id ? null : booking.id)}
                            className={`px-3 py-1 border rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${
                              expandedFeedbackId === booking.id
                                ? 'bg-[#d4af37] text-[#140f0c] border-[#d4af37]'
                                : 'text-[#d4af37] border-[#d4af37]/35 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/60'
                            }`}
                            title="Inscribe a testimony or rating for this completed excursion"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{expandedFeedbackId === booking.id ? (language === 'de' ? 'Formular ausblenden' : language === 'pl' ? 'Ukryj formularz opinii' : 'Hide Feedback Form') : (language === 'de' ? '𓏞 Bewertung schreiben' : language === 'pl' ? '𓏞 Napisz opinię' : '𓏞 Leave Review')}</span>
                          </button>
                        </>
                      )}
                      
                      {/* Print Scroll Button for Confirmed/Completed Bookings */}
                      {(booking.status === 'Confirmed by High Priest' || booking.status === 'Completed') && (
                        <button
                          onClick={() => setSelectedScrollBooking(booking)}
                          className="text-[#d4af37] hover:text-[#fbf5e6] px-3 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{language === 'de' ? '𓏞 Reiseplan ansehen' : language === 'pl' ? '𓏞 Zobacz plan podróży' : '𓏞 View Itinerary'}</span>
                        </button>
                      )}

                      {onCancelBooking && booking.status === 'Pending Oracle Approval' && (
                        <button
                          onClick={() => onCancelBooking(booking.id)}
                          className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all cursor-pointer text-[10px] uppercase font-bold font-mono tracking-wider"
                        >
                          {language === 'de' ? 'Buchung stornieren' : language === 'pl' ? 'Anuluj rezerwację' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>

                    {/* Animated QR Code Section */}
                    <AnimatePresence>
                      {expandedQrId === booking.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <BookingQRCode
                            bookingId={booking.id}
                            travelerName={booking.travelerName}
                            excursionTitle={booking.excursionTitle}
                            lightTheme={false}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animated Feedback Form Section */}
                    <AnimatePresence>
                      {expandedFeedbackId === booking.id && (
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Testimony Board & Review Form */}
      <div className="lg:col-span-6 space-y-6" id="testimony-board-col">
        <div className="flex items-center gap-2 border-b border-[#d4af37]/20 pb-3">
          <MessageSquare className="text-[#d4af37] w-5 h-5" />
          <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
            {language === 'de' ? 'Bewertungen & Reiseberichte' : language === 'pl' ? 'Opinie i świadectwa podróżnych' : 'Traveler Reviews & Testimonials'}
          </h3>
        </div>

        <ReviewSystem />
      </div>

      {/* Scroll Itinerary Modal Overlay */}
      {selectedScrollBooking && (
        <ScrollItineraryModal
          booking={selectedScrollBooking}
          excursion={excursions?.find((e) => e.id === selectedScrollBooking.excursionId)}
          onClose={() => setSelectedScrollBooking(null)}
        />
      )}

      {/* Keepsake Certificate Modal */}
      {certificateBooking && (
        <DigitalKeepsakeCertificate
          booking={certificateBooking}
          onClose={() => setCertificateBooking(null)}
          language={language}
        />
      )}

    </div>
    </div>
  );
}
