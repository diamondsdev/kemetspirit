import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Clock, MessageSquare, CheckCircle, Sparkles, Printer, QrCode, Ticket, Camera, Download, ExternalLink } from 'lucide-react';
import { Booking, Excursion } from '../types';
import { useLanguage } from './LanguageContext';
import ReviewSystem from './ReviewSystem';
import ScrollItineraryModal from './ScrollItineraryModal';
import BookingQRCode from './BookingQRCode';
import DetailedTicketCard from './DetailedTicketCard';
import ExcursionFeedbackForm from './ExcursionFeedbackForm';
import TicketScanner from './TicketScanner';
import ExcursionExpenseCalculator from './ExcursionExpenseCalculator';

const STATUS_CONFIG: Record<string, any> = {
  'Pending Oracle Approval': {
    colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    barColor: 'bg-amber-500',
    icon: Clock,
    labelText: '𓀚 Reviewing',
    descText: 'Our team is reviewing your request and will approve it soon.',
  },
  'pending_approval': {
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
  'confirmed': {
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
  },
  'completed': {
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
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isManagerLoading, setIsManagerLoading] = useState<boolean>(true);

  // CSV Export for traveler bookings
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Booking Ref', 'Tour Title', 'Traveler', 'Date', 'Guests', 'Total Cost', 'Status'];
    const rows = bookings.map(b => [
      `"${b.booking_reference || b.id}"`,
      `"${b.excursionTitle || b.tour_title}"`,
      `"${b.travelerName || b.traveler_name}"`,
      `"${b.date || b.scheduled_date}"`,
      b.numberOfGuests || b.guest_count || 1,
      `"$${b.totalCost || b.total_cost}"`,
      `"${b.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kemet_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsManagerLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10" id="booking-manager-wrapper">
      {/* Excursion Expense Calculator */}
      <ExcursionExpenseCalculator bookings={bookings} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ledger-manager-grid">
        {/* LEFT COLUMN: Sacred Booking Ledger */}
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
                  onClick={handleExportCSV}
                  className="bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-[#fbf5e6] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Export your current booking logs to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Export CSV</span>
                </button>
              )}

              <button
                onClick={() => setIsScannerOpen(!isScannerOpen)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isScannerOpen
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : 'bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border-[#d4af37]/40 text-[#fbf5e6]'
                }`}
                title="Scan ticket QR code"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isScannerOpen ? 'Close Scanner' : 'Scan Ticket QR'}</span>
              </button>
            </div>
          </div>

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
              <div className="text-center py-8 text-[#a89270] animate-pulse">
                Consulting the sacred ledger...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1410] border border-[#d4af37]/15 rounded-2xl text-stone-500 italic text-sm">
                𓀞 {language === 'de' ? 'Sie haben noch keine Reisen gebucht. Stöbern Sie oben in unseren Touren, um Ihr Abenteuer zu planen!' : language === 'pl' ? 'Nie masz jeszcze zarezerwowanych żadnych wycieczek. Przeglądaj nasze wycieczki powyżej, aby zaplanować przygodę!' : "You haven't booked any trips yet. Browse our tours above to plan your adventure!"}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {bookings.map((booking) => {
                  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG['pending_approval'] || STATUS_CONFIG['Pending Oracle Approval'];
                  const StatusIcon = config.icon;

                  if (expandedTicketId === booking.id) {
                    return (
                      <DetailedTicketCard
                        key={booking.id}
                        booking={booking}
                        excursion={excursions?.find((e) => e.id === booking.excursionId || e.id === booking.tour_id)}
                        onCollapse={() => setExpandedTicketId(null)}
                        onCancelBooking={onCancelBooking}
                        onViewItinerary={booking.status.toLowerCase().includes('confirm') ? () => setSelectedScrollBooking(booking) : undefined}
                      />
                    );
                  }

                  const isConfirmed = booking.status === 'confirmed' || booking.status === 'Confirmed by High Priest';
                  const isCompleted = booking.status === 'completed' || booking.status === 'Completed';

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
                          <span className="text-[10px] font-mono text-[#ffd700] uppercase tracking-widest block font-bold">
                            Ref: {booking.booking_reference || `#${booking.id.slice(-6)}`}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase mt-0.5">
                            {booking.excursionTitle || booking.tour_title}
                          </h4>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest ${config.colorClass}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.labelText}</span>
                          </div>
                          {isConfirmed && (
                            <div className="flex items-center gap-1 bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider font-bold">
                              <QrCode className="w-2.5 h-2.5" />
                              <span>Ticket QR Ready</span>
                            </div>
                          )}
                          {(booking.checkedIn || booking.checked_in) && (
                            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider font-bold">
                              <span className="text-[10px]">𓋹</span> Checked In
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-stone-400 pt-2 border-t border-stone-800/60 font-sans">
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Traveler:</span>
                          <span className="text-stone-200 font-medium">{booking.travelerName || booking.traveler_name}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Date:</span>
                          <span className="text-stone-200 font-medium">{booking.date || booking.scheduled_date}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Guests:</span>
                          <span className="text-stone-200 font-medium">{booking.numberOfGuests || booking.guest_count || 1}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Hotel:</span>
                          <span className="text-stone-200 font-medium">{booking.hotelName || booking.hotel_name || 'Lobby'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Pickup:</span>
                          <span className="text-stone-200 font-medium">{booking.pickupTime || booking.pickup_time || '07:30 AM'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase font-mono tracking-wider">Total:</span>
                          <span className="text-[#d4af37] font-mono font-bold">${booking.totalCost || booking.total_cost}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 text-[11px] font-mono flex-wrap">
                        <button
                          onClick={() => setExpandedTicketId(booking.id)}
                          className="text-[#d4af37] hover:text-[#fbf5e6] px-3 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>View Ticket Voucher</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => setExpandedQrId(expandedQrId === booking.id ? null : booking.id)}
                            className={`px-3 py-1 border rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${
                              expandedQrId === booking.id
                                ? 'bg-[#d4af37] text-[#140f0c] border-[#d4af37]'
                                : 'text-[#d4af37] border-[#d4af37]/35 hover:bg-[#d4af37]/10'
                            }`}
                          >
                            <QrCode className="w-3 h-3" />
                            <span>{expandedQrId === booking.id ? 'Hide QR' : 'Mobile QR'}</span>
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => setExpandedFeedbackId(expandedFeedbackId === booking.id ? null : booking.id)}
                            className="px-3 py-1 border border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Leave Review</span>
                          </button>
                        )}

                        {(isConfirmed || isCompleted) && (
                          <button
                            onClick={() => setSelectedScrollBooking(booking)}
                            className="text-[#d4af37] hover:text-[#fbf5e6] px-3 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Itinerary</span>
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
                            className="overflow-hidden"
                          >
                            <BookingQRCode
                              bookingId={booking.booking_reference || booking.id}
                              travelerName={booking.travelerName || booking.traveler_name || 'Traveler'}
                              excursionTitle={booking.excursionTitle || booking.tour_title || 'Kemet Excursion'}
                              lightTheme={false}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Feedback Form Section */}
                      <AnimatePresence>
                        {expandedFeedbackId === booking.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <ExcursionFeedbackForm
                              bookingId={booking.id}
                              excursionId={booking.excursionId || booking.tour_id || ''}
                              excursionTitle={booking.excursionTitle || booking.tour_title || ''}
                              travelerName={booking.travelerName || booking.traveler_name || ''}
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
              Traveler Reviews & Testimonials
            </h3>
          </div>
          <ReviewSystem />
        </div>
      </div>

      {/* Scroll Itinerary Modal Overlay */}
      {selectedScrollBooking && (
        <ScrollItineraryModal
          booking={selectedScrollBooking}
          excursion={excursions?.find((e) => e.id === selectedScrollBooking.excursionId || e.id === selectedScrollBooking.tour_id)}
          onClose={() => setSelectedScrollBooking(null)}
        />
      )}
    </div>
  );
}
