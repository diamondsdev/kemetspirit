import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Shield,
  Users,
  Award,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  MessageSquare,
  Compass,
  Send,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings,
  Layers,
  MapPin,
  Clock,
  ThumbsUp,
  UserPlus,
  LogOut,
  Camera,
  QrCode,
  Printer,
  Calendar,
  AlertCircle,
  Database,
  ExternalLink
} from 'lucide-react';
import { Booking, Excursion, Review, SecurityAuditLog, CRMInquiry, FinancialTransaction } from '../types';
import { useLanguage } from './LanguageContext';
import BookingAnalytics from './BookingAnalytics';
import TicketScanner from './TicketScanner';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser?: any;
}

export default function AdminDashboard({ onLogout, currentUser }: AdminDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'bookings' | 'operations' | 'crm' | 'finance' | 'reviews' | 'staff' | 'settings'>('overview');

  // Authoritative State
  const [loading, setLoading] = useState<boolean>(true);
  const [tours, setTours] = useState<Excursion[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<CRMInquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [systemStatus, setSystemStatus] = useState<any>({});

  // UI / Modal States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingTour, setEditingTour] = useState<any | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [actionErrorMsg, setActionErrorMsg] = useState<string>('');

  // Fetch all authoritative data from server
  const loadDashboardData = async () => {
    setLoading(true);
    setActionErrorMsg('');
    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
      // 1. Fetch Overview & Metrics
      const resOverview = await fetch('/api/admin/overview', { headers });
      if (resOverview.ok) {
        const overviewData = await resOverview.json();
        setSystemStatus(overviewData.systemStatus || {});
      }

      // 2. Fetch Tours
      const resTours = await fetch('/api/admin/tours', { headers });
      if (resTours.ok) {
        const toursData = await resTours.json();
        setTours(toursData);
      }

      // 3. Fetch Bookings
      const resBookings = await fetch('/api/admin/bookings', { headers });
      if (resBookings.ok) {
        const bkData = await resBookings.json();
        setBookings(bkData);
      }

      // 4. Fetch Inquiries
      const resInq = await fetch('/api/admin/crm/inquiries', { headers });
      if (resInq.ok) {
        const inqData = await resInq.json();
        setInquiries(inqData);
      }

      // 5. Fetch Reviews
      const resRev = await fetch('/api/admin/reviews', { headers });
      if (resRev.ok) {
        const revData = await resRev.json();
        setReviews(revData);
      }

      // 6. Fetch Finance
      const resFin = await fetch('/api/admin/finance/overview', { headers });
      if (resFin.ok) {
        const finData = await resFin.json();
        setTransactions(finData.recentTransactions || []);
      }

      // 7. Fetch Audit Logs
      const resLogs = await fetch('/api/admin/audit-logs', { headers });
      if (resLogs.ok) {
        const logData = await resLogs.json();
        setAuditLogs(logData);
      }

      // 8. Fetch Newsletter
      const resNews = await fetch('/api/admin/newsletter', { headers });
      if (resNews.ok) {
        const newsData = await resNews.json();
        setSubscribers(newsData);
      }

      // 9. Fetch Settings
      const resSettings = await fetch('/api/admin/settings', { headers });
      if (resSettings.ok) {
        const settingsData = await resSettings.json();
        setSettings(settingsData);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setActionErrorMsg('Could not fetch all operational datasets. Retrying connection...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(''), 5000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  // Booking Status Transition Handler
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string, notes?: string) => {
    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus, internal_notes: notes })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      const updated = await res.json();
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...updated } : b)));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => (prev ? { ...prev, ...updated } : null));
      }
      showNotification(`Booking status successfully transitioned to ${newStatus}`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Tour Upsert Handler
  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour?.title || !editingTour?.base_price) {
      showNotification('Title and base price are required.', true);
      return;
    }

    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    try {
      const res = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...editingTour,
          base_price: Number(editingTour.base_price),
          price: Number(editingTour.base_price),
          inclusions: Array.isArray(editingTour.inclusions) 
            ? editingTour.inclusions 
            : (editingTour.inclusions || '').split('\n').filter(Boolean),
          highlights: Array.isArray(editingTour.highlights)
            ? editingTour.highlights
            : (editingTour.highlights || '').split('\n').filter(Boolean)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save tour');
      }

      const saved = await res.json();
      setTours(prev => {
        const exists = prev.some(t => t.id === saved.id);
        return exists ? prev.map(t => (t.id === saved.id ? saved : t)) : [saved, ...prev];
      });
      setIsTourModalOpen(false);
      setEditingTour(null);
      showNotification(`Excursion "${saved.title}" saved to authoritative catalogue.`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Tour Delete Handler
  const handleDeleteTour = async (tourId: string, title: string) => {
    if (!window.confirm(`Are you certain you wish to delete "${title}" from the sanctuary catalogue?`)) {
      return;
    }

    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Failed to delete tour');

      setTours(prev => prev.filter(t => t.id !== tourId));
      showNotification(`Excursion "${title}" removed.`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Review Moderation Handler
  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Moderation failed');

      setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, status } : r)));
      showNotification(`Review marked as ${status}.`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Inquiry Status Handler
  const handleUpdateInquiry = async (inqId: string, status: string, notes?: string) => {
    const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/crm/inquiries/${inqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status, internal_notes: notes })
      });

      if (!res.ok) throw new Error('Failed to update inquiry');

      setInquiries(prev => prev.map(i => (i.id === inqId ? { ...i, status: status as any, internal_notes: notes } : i)));
      showNotification('Inquiry status updated.');
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const ref = b.booking_reference || b.id || '';
    const name = b.travelerName || b.traveler_name || '';
    const email = b.travelerEmail || b.traveler_email || '';
    const title = b.excursionTitle || b.tour_title || '';
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      ref.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Calculate Authoritative KPIs
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending_approval' || b.status === 'Pending Oracle Approval').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'Confirmed by High Priest').length;
  const completedCount = bookings.filter(b => b.status === 'completed' || b.status === 'Completed').length;
  const totalCollectedRevenue = transactions
    .filter(t => t.transaction_type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalBookingValue = bookings.reduce((sum, b) => sum + (Number(b.totalCost || b.total_cost) || 0), 0);
  const outstandingBalance = Math.max(0, totalBookingValue - totalCollectedRevenue);

  const todayStr = new Date().toISOString().split('T')[0];
  const departuresToday = bookings.filter(b => (b.date === todayStr || b.scheduled_date === todayStr));

  return (
    <div className="min-h-screen bg-[#100c08] text-[#fbf5e6] pb-24 font-sans">
      {/* Top Header */}
      <header className="border-b border-[#d4af37]/20 bg-[#140f0c]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8b6508] flex items-center justify-center text-black text-xl font-bold shadow-lg shadow-[#d4af37]/20">
              𓋹
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#e6c280] uppercase">
                  Kemet Operational Command
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                  {currentUser?.role || 'Staff'}
                </span>
              </div>
              <p className="text-xs text-[#a89270] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${systemStatus.supabaseActive ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
                {systemStatus.supabaseActive ? 'Supabase Authoritative DB Connected' : 'Local Fallback Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/25 text-xs font-medium transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Gate Check-In</span>
            </button>

            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl bg-[#1c1611] border border-[#d4af37]/20 text-[#a89270] hover:text-[#d4af37] transition cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#d4af37]' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/50 text-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'tours', label: 'Tours & Catalogue', icon: Compass, count: tours.length },
            { id: 'bookings', label: 'Bookings Ledger', icon: FileText, count: pendingCount > 0 ? pendingCount : bookings.length, alert: pendingCount > 0 },
            { id: 'operations', label: 'Daily Operations', icon: Calendar, count: departuresToday.length },
            { id: 'crm', label: 'Traveler CRM', icon: Users, count: inquiries.filter(i => i.status === 'new').length, alert: inquiries.filter(i => i.status === 'new').length > 0 },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign },
            { id: 'reviews', label: 'Review Moderation', icon: ThumbsUp, count: reviews.filter(r => r.status === 'pending').length, alert: reviews.filter(r => r.status === 'pending').length > 0 },
            { id: 'staff', label: 'Staff & Audit Logs', icon: Shield },
            { id: 'settings', label: 'Settings & SEO', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#d4af37] text-black shadow-md font-bold'
                    : 'text-[#c2ab87] hover:text-[#fbf5e6] hover:bg-[#1f1710]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-black text-[#d4af37]'
                      : tab.alert
                      ? 'bg-amber-500 text-black font-bold animate-pulse'
                      : 'bg-[#2a1f14] text-[#a89270]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {actionSuccessMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
        {actionErrorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 shadow-lg">
                <span className="text-[11px] text-[#a89270] uppercase font-mono tracking-wider block">Total Bookings</span>
                <div className="text-2xl font-bold font-serif text-[#e6c280] mt-1">{totalBookingsCount}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-[#a89270]">
                  <span className="text-amber-400 font-bold">{pendingCount} awaiting approval</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 shadow-lg">
                <span className="text-[11px] text-[#a89270] uppercase font-mono tracking-wider block">Collected Revenue</span>
                <div className="text-2xl font-bold font-serif text-emerald-400 mt-1">${totalCollectedRevenue.toLocaleString()}</div>
                <div className="text-[11px] text-[#a89270] mt-2">
                  <span>${outstandingBalance.toLocaleString()} pending collection</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 shadow-lg">
                <span className="text-[11px] text-[#a89270] uppercase font-mono tracking-wider block">Today's Departures</span>
                <div className="text-2xl font-bold font-serif text-sky-400 mt-1">{departuresToday.length}</div>
                <div className="text-[11px] text-[#a89270] mt-2">
                  <span>{departuresToday.reduce((sum, b) => sum + (b.guest_count || b.numberOfGuests || 1), 0)} travelers departing</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 shadow-lg">
                <span className="text-[11px] text-[#a89270] uppercase font-mono tracking-wider block">Action Items</span>
                <div className="text-2xl font-bold font-serif text-[#ffd700] mt-1">
                  {inquiries.filter(i => i.status === 'new').length + reviews.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-[11px] text-[#a89270] mt-2 flex gap-2">
                  <span>{inquiries.filter(i => i.status === 'new').length} inquiries</span>
                  <span>•</span>
                  <span>{reviews.filter(r => r.status === 'pending').length} reviews</span>
                </div>
              </div>
            </div>

            {/* Departures Alert List */}
            {departuresToday.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#1c140e] border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif font-bold text-amber-300 uppercase tracking-wide">
                      Departures Scheduled For Today ({todayStr})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('operations')}
                    className="text-xs text-[#d4af37] hover:underline"
                  >
                    View Operations Roster &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {departuresToday.map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-[#140e0a] border border-[#d4af37]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-mono text-[#d4af37] font-bold mr-2">{b.booking_reference || b.id}</span>
                        <strong className="text-[#fbf5e6]">{b.traveler_name || b.travelerName}</strong>
                        <span className="text-[#a89270]"> &bull; {b.tour_title || b.excursionTitle} ({b.guest_count || b.numberOfGuests} guests)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#e6c280]">Pickup: {b.pickup_time || b.pickupTime || '07:30 AM'} ({b.hotel_name || b.hotelName || 'Lobby'})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.checked_in || b.checkedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {b.checked_in || b.checkedIn ? 'Checked In' : 'Awaiting Gate'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Analytics & Performance Chart */}
            <div className="p-5 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 shadow-xl">
              <BookingAnalytics bookings={bookings} excursions={tours} />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: TOURS & CATALOGUE MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'tours' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  Tour & Excursion Catalogue
                </h2>
                <p className="text-xs text-[#a89270]">Manage published excursions, pricing, capacities, and lore.</p>
              </div>
              <button
                onClick={() => {
                  setEditingTour({
                    title: '',
                    slug: '',
                    category_slug: 'diving',
                    duration: 'Full Day (8 Hours)',
                    base_price: 100,
                    currency: 'USD',
                    location: 'Red Sea, Egypt',
                    primary_image_url: '/src/assets/images/egypt_sea_diving_1784070366165.jpg',
                    description: '',
                    ancient_lore: '',
                    status: 'published',
                    is_featured: false,
                    max_capacity_per_departure: 20,
                    inclusions: ['Hotel pick-up & drop-off', 'Certified Guide', 'Equipment'],
                    highlights: ['Explore ancient sights']
                  });
                  setIsTourModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#8b6508] text-black font-bold text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Excursion</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map(tour => (
                <div key={tour.id} className="rounded-2xl bg-[#18120d] border border-[#d4af37]/20 overflow-hidden flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="relative h-44 w-full bg-[#120e0a]">
                      <img
                        src={tour.primary_image_url || tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tour.status === 'published' ? 'bg-emerald-500/80 text-white' : 'bg-zinc-700/80 text-zinc-300'
                        }`}>
                          {tour.status || 'published'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-[#d4af37] border border-[#d4af37]/30">
                          {tour.category_slug || tour.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-base text-[#e6c280]">{tour.title}</h3>
                      <p className="text-xs text-[#a89270] line-clamp-2">{tour.description}</p>
                      <div className="flex items-center justify-between text-xs text-[#c2ab87] pt-2 border-t border-[#d4af37]/10">
                        <span>{tour.duration}</span>
                        <span className="font-serif font-bold text-sm text-[#ffd700]">
                          ${tour.base_price || tour.price} {tour.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#140e0a] border-t border-[#d4af37]/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#a89270]">Max Cap: {tour.max_capacity_per_departure || 20}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTour({ ...tour });
                          setIsTourModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#241a10] text-[#d4af37] hover:bg-[#342415] text-xs transition cursor-pointer"
                        title="Edit Excursion"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id, tour.title)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 text-xs transition cursor-pointer"
                        title="Delete Excursion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: BOOKINGS LEDGER */}
        {/* ================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  Caravan Bookings Ledger
                </h2>
                <p className="text-xs text-[#a89270]">Authoritative records of traveler reservations and approval statuses.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#a89270] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ref, guest, tour..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-[#18120d] border border-[#d4af37]/30 text-xs text-[#fbf5e6] focus:outline-none focus:border-[#d4af37] w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#18120d] border border-[#d4af37]/30 text-xs text-[#d4af37] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-2xl bg-[#18120d] border border-[#d4af37]/20 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#140e0a] border-b border-[#d4af37]/20 font-serif uppercase tracking-wider text-[#d4af37]">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Traveler</th>
                      <th className="py-3 px-4">Excursion</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4">Offering</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/10 text-[#fbf5e6]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#a89270]">
                          No caravan bookings match the specified filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-[#1f1710]/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#ffd700]">
                            {b.booking_reference || b.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#e6c280]">{b.traveler_name || b.travelerName}</div>
                            <div className="text-[11px] text-[#a89270]">{b.traveler_email || b.travelerEmail}</div>
                          </td>
                          <td className="py-3 px-4">{b.tour_title || b.excursionTitle}</td>
                          <td className="py-3 px-4 font-mono">
                            {b.scheduled_date || b.date}
                            <span className="block text-[10px] text-[#a89270]">{b.pickup_time || b.pickupTime || '07:30 AM'}</span>
                          </td>
                          <td className="py-3 px-4">{b.guest_count || b.numberOfGuests}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            ${b.total_cost || b.totalCost}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'confirmed' || b.status === 'Confirmed by High Priest'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'completed' || b.status === 'Completed'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : b.status === 'cancelled'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-2.5 py-1 rounded-lg bg-[#241a10] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-medium transition cursor-pointer text-[11px]"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: DAILY OPERATIONS */}
        {/* ================================================================= */}
        {activeTab === 'operations' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Daily Operations & Departure Rosters
              </h2>
              <p className="text-xs text-[#a89270]">Track guide assignments, pickup schedules, and departure readiness.</p>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-[#a89270] bg-[#18120d] rounded-2xl border border-[#d4af37]/20">
                  No upcoming departures scheduled.
                </div>
              ) : (
                bookings
                  .filter(b => b.status !== 'cancelled')
                  .sort((a, b) => (a.scheduled_date || a.date).localeCompare(b.scheduled_date || b.date))
                  .map(b => (
                    <div key={b.id} className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-bold text-[#ffd700]">{b.scheduled_date || b.date}</span>
                          <span className="text-[#a89270]">&bull;</span>
                          <span className="font-serif font-bold text-base text-[#fbf5e6]">{b.tour_title || b.excursionTitle}</span>
                        </div>
                        <div className="text-xs text-[#a89270]">
                          Traveler: <strong className="text-[#e6c280]">{b.traveler_name || b.travelerName}</strong> ({b.guest_count || b.numberOfGuests} travelers) &bull; Hotel: {b.hotel_name || b.hotelName || 'Lobby'} {b.room_number ? `(Room ${b.room_number})` : ''}
                        </div>
                        {b.special_requests && (
                          <div className="text-[11px] text-amber-300 italic">
                            Special: {b.special_requests}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-[#a89270] block">Guide / Driver</span>
                          <span className="font-medium text-[#c2ab87]">{b.assigned_guide_name || 'Sheikh Mansour'} &bull; {b.assigned_driver_name || 'Ahmed Driver'}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'completed', 'Marked completed on departure')}
                          className="px-3 py-1.5 rounded-xl bg-sky-900/40 border border-sky-600/40 text-sky-200 hover:bg-sky-800/50 transition cursor-pointer"
                        >
                          Mark Ready
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: TRAVELER CRM */}
        {/* ================================================================= */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Traveler CRM & Inquiries Inbox
              </h2>
              <p className="text-xs text-[#a89270]">Inquiries submitted by travelers awaiting staff responses and VIP notes.</p>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-[#a89270] bg-[#18120d] rounded-2xl border border-[#d4af37]/20">
                  No customer inquiries in the inbox.
                </div>
              ) : (
                inquiries.map(inq => (
                  <div key={inq.id} className="p-5 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-bold text-[#e6c280] text-base">{inq.subject}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            inq.status === 'new' ? 'bg-amber-500 text-black' : inq.status === 'in_progress' ? 'bg-sky-500 text-black' : 'bg-emerald-500 text-black'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#a89270]">
                          From: <strong className="text-[#fbf5e6]">{inq.name}</strong> ({inq.email}) {inq.phone ? `&bull; Phone: ${inq.phone}` : ''}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#a89270]">
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#140e0a] border border-[#d4af37]/10 text-xs text-[#c2ab87] leading-relaxed">
                      "{inq.message}"
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-[#a89270]">
                        {inq.internal_notes && <span className="text-amber-300">Staff Note: {inq.internal_notes}</span>}
                      </div>
                      <div className="flex space-x-2">
                        {inq.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateInquiry(inq.id, 'resolved', 'Resolved by operational staff')}
                            className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50 text-xs transition cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                        <a
                          href={`mailto:${inq.email}?subject=RE: ${encodeURIComponent(inq.subject)}`}
                          className="px-3 py-1 rounded-lg bg-[#241a10] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black text-xs transition inline-flex items-center space-x-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: FINANCE & TRANSACTIONS */}
        {/* ================================================================= */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  Authoritative Financial Ledger
                </h2>
                <p className="text-xs text-[#a89270]">Audited payments, collections, refunds, and financial reporting.</p>
              </div>
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold hover:bg-emerald-800/50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Manual Payment/Refund</span>
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#18120d] border border-emerald-500/30">
                <span className="text-[11px] text-[#a89270] uppercase font-mono block">Confirmed Collections</span>
                <div className="text-2xl font-bold font-serif text-emerald-400 mt-1">${totalCollectedRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-[#a89270] mt-1">Verified transactions</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18120d] border border-amber-500/30">
                <span className="text-[11px] text-[#a89270] uppercase font-mono block">Outstanding Booking Balance</span>
                <div className="text-2xl font-bold font-serif text-amber-400 mt-1">${outstandingBalance.toLocaleString()}</div>
                <p className="text-[11px] text-[#a89270] mt-1">Pay on arrival / pending invoice</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/30">
                <span className="text-[11px] text-[#a89270] uppercase font-mono block">Gross Booking Value</span>
                <div className="text-2xl font-bold font-serif text-[#ffd700] mt-1">${totalBookingValue.toLocaleString()}</div>
                <p className="text-[11px] text-[#a89270] mt-1">Total excursion contracts</p>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="rounded-2xl bg-[#18120d] border border-[#d4af37]/20 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#d4af37]/10 flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#e6c280] uppercase">Transaction History</h3>
                <span className="text-xs text-[#a89270]">{transactions.length} recorded entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#140e0a] border-b border-[#d4af37]/20 font-serif uppercase tracking-wider text-[#d4af37]">
                    <tr>
                      <th className="py-3 px-4">Txn ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/10 text-[#fbf5e6]">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#a89270]">
                          No financial transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map(t => (
                        <tr key={t.id} className="hover:bg-[#1f1710]/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#ffd700]">{t.id}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.transaction_type === 'payment' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            ${t.amount} {t.currency}
                          </td>
                          <td className="py-3 px-4">{t.payment_method}</td>
                          <td className="py-3 px-4 text-[#a89270]">{t.recorded_by || 'Staff'}</td>
                          <td className="py-3 px-4 text-[#c2ab87]">{t.notes || 'N/A'}</td>
                          <td className="py-3 px-4 font-mono text-[#a89270]">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: REVIEWS MODERATION */}
        {/* ================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Customer Reviews Moderation
              </h2>
              <p className="text-xs text-[#a89270]">Approve or reject customer reviews before they appear on the public portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <strong className="text-[#e6c280] text-sm">{rev.author_name || rev.author}</strong>
                        <span className="text-xs text-amber-400">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : rev.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rev.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-[#c2ab87] mt-2 italic leading-relaxed">"{rev.comment}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#d4af37]/10">
                    <span className="text-[10px] font-mono text-[#a89270]">Tour: {rev.tour_id || rev.excursionId}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModerateReview(rev.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50 text-xs transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateReview(rev.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-600/40 text-rose-300 hover:bg-rose-900/50 text-xs transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: STAFF & AUDIT LOGS */}
        {/* ================================================================= */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Staff Governance & Security Audit Trail
              </h2>
              <p className="text-xs text-[#a89270]">Tamper-resistant audit log of all administrative actions and logins.</p>
            </div>

            <div className="rounded-2xl bg-[#18120d] border border-[#d4af37]/20 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#d4af37]/10 flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#e6c280] uppercase">Administrative Audit Logs</h3>
                <span className="text-xs text-[#a89270]">Real-time operational records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#140e0a] border-b border-[#d4af37]/20 font-serif uppercase tracking-wider text-[#d4af37]">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/10 text-[#fbf5e6]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#1f1710]/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{log.action}</td>
                        <td className="py-3 px-4 text-[#e6c280]">{log.actor_email || 'system'}</td>
                        <td className="py-3 px-4 text-[#a89270] uppercase font-mono text-[10px]">{log.actor_role || log.userRole || 'staff'}</td>
                        <td className="py-3 px-4 font-mono text-[#a89270]">{log.entity_type || 'system'}</td>
                        <td className="py-3 px-4 text-[#c2ab87]">{log.details}</td>
                        <td className="py-3 px-4 font-mono text-[#a89270] text-[10px]">
                          {log.created_at || log.timestamp || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 9: SETTINGS & SEO */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Website Configuration & SEO Metadata
              </h2>
              <p className="text-xs text-[#a89270]">Business contacts, currencies, operational defaults, and database health.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Connection Status Card */}
              <div className="p-5 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 space-y-3">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-serif font-bold text-base text-[#e6c280] uppercase">
                    Authoritative Database Status
                  </h3>
                </div>
                <div className="p-4 rounded-xl bg-[#140e0a] border border-[#d4af37]/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#a89270]">Backend Engine:</span>
                    <strong className="text-[#fbf5e6]">Node.js 22 + Express + Supabase Postgres</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a89270]">Supabase Authoritative Connection:</span>
                    <span className={`font-bold ${systemStatus.supabaseActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {systemStatus.supabaseActive ? 'Active & Verified' : 'Local Fallback / Environment Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a89270]">Row Level Security (RLS):</span>
                    <span className="text-emerald-400 font-bold">Enabled & Enforced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a89270]">Server Port:</span>
                    <span className="font-mono text-[#d4af37]">3000 (0.0.0.0)</span>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="p-5 rounded-2xl bg-[#18120d] border border-[#d4af37]/20 space-y-3">
                <h3 className="font-serif font-bold text-base text-[#e6c280] uppercase">
                  Company & Agency Details
                </h3>
                <div className="space-y-2 text-xs text-[#c2ab87]">
                  <p><strong className="text-[#e6c280]">Official Name:</strong> Kemet Spirit - Powered by Mas International Agency</p>
                  <p><strong className="text-[#e6c280]">Headquarters:</strong> Sheraton Road, Marine Promenade, Hurghada, Egypt</p>
                  <p><strong className="text-[#e6c280]">Support Phone:</strong> +20 100 000 0000</p>
                  <p><strong className="text-[#e6c280]">Support Email:</strong> operations@kemetspirit.com</p>
                  <p><strong className="text-[#e6c280]">Default Currency:</strong> USD ($)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL: TOUR CREATE / EDIT */}
      {/* =================================================================== */}
      {isTourModalOpen && editingTour && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18120d] border border-[#d4af37]/40 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase">
                {editingTour.id ? 'Edit Excursion' : 'Create New Excursion'}
              </h3>
              <button
                onClick={() => setIsTourModalOpen(false)}
                className="text-[#a89270] hover:text-[#fbf5e6] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTour} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a89270] mb-1 font-medium">Excursion Title *</label>
                  <input
                    type="text"
                    required
                    value={editingTour.title}
                    onChange={e => setEditingTour({ ...editingTour, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#a89270] mb-1 font-medium">Category</label>
                  <select
                    value={editingTour.category_slug || editingTour.category}
                    onChange={e => setEditingTour({ ...editingTour, category_slug: e.target.value, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#d4af37] focus:outline-none"
                  >
                    <option value="diving">Scuba Diving & Reefs</option>
                    <option value="safari">Desert Quad & Camel Safaris</option>
                    <option value="history">Ancient Temples & Nile</option>
                    <option value="boat">Royal Yacht & Island</option>
                    <option value="speedboat">Speedboat Cruise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#a89270] mb-1 font-medium">Base Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingTour.base_price || editingTour.price || ''}
                    onChange={e => setEditingTour({ ...editingTour, base_price: Number(e.target.value), price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#a89270] mb-1 font-medium">Duration</label>
                  <input
                    type="text"
                    value={editingTour.duration}
                    onChange={e => setEditingTour({ ...editingTour, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#a89270] mb-1 font-medium">Max Departure Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={editingTour.max_capacity_per_departure || 20}
                    onChange={e => setEditingTour({ ...editingTour, max_capacity_per_departure: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a89270] mb-1 font-medium">Image URL / Path</label>
                <input
                  type="text"
                  value={editingTour.primary_image_url || editingTour.image || ''}
                  onChange={e => setEditingTour({ ...editingTour, primary_image_url: e.target.value, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#a89270] mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={editingTour.description || ''}
                  onChange={e => setEditingTour({ ...editingTour, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-[#a89270] mb-1 font-medium">Ancient Lore & Myth Snippet</label>
                <textarea
                  rows={2}
                  value={editingTour.ancient_lore || editingTour.ancientLore || ''}
                  onChange={e => setEditingTour({ ...editingTour, ancient_lore: e.target.value, ancientLore: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0a] border border-[#d4af37]/30 text-[#fbf5e6] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.status === 'published'}
                    onChange={e => setEditingTour({ ...editingTour, status: e.target.checked ? 'published' : 'draft' })}
                    className="rounded border-[#d4af37]"
                  />
                  <span className="text-[#e6c280]">Publish Tour to Public Portal</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c1611] text-[#a89270] hover:text-[#fbf5e6] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#8b6508] text-black font-bold hover:brightness-110 transition cursor-pointer"
                >
                  Save Excursion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: BOOKING DETAIL & MANAGEMENT */}
      {/* =================================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18120d] border border-[#d4af37]/40 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
              <div>
                <span className="font-mono text-xs text-[#d4af37]">Reference: {selectedBooking.booking_reference || selectedBooking.id}</span>
                <h3 className="font-serif text-lg font-bold text-[#e6c280]">{selectedBooking.tour_title || selectedBooking.excursionTitle}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-[#a89270] hover:text-[#fbf5e6]">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#140e0a] border border-[#d4af37]/10">
              <div>
                <span className="text-[#a89270] block">Traveler:</span>
                <strong className="text-[#fbf5e6]">{selectedBooking.traveler_name || selectedBooking.travelerName}</strong>
                <span className="block text-[#a89270]">{selectedBooking.traveler_email || selectedBooking.travelerEmail}</span>
              </div>
              <div>
                <span className="text-[#a89270] block">Scheduled Date:</span>
                <strong className="text-[#ffd700]">{selectedBooking.scheduled_date || selectedBooking.date}</strong>
                <span className="block text-[#a89270]">{selectedBooking.guest_count || selectedBooking.numberOfGuests} guests</span>
              </div>
              <div>
                <span className="text-[#a89270] block">Total Offering:</span>
                <strong className="text-emerald-400 text-sm">${selectedBooking.total_cost || selectedBooking.totalCost}</strong>
              </div>
              <div>
                <span className="text-[#a89270] block">Hotel Pickup:</span>
                <span className="text-[#e6c280]">{selectedBooking.hotel_name || selectedBooking.hotelName || 'Lobby'} {selectedBooking.room_number ? `(Room ${selectedBooking.room_number})` : ''}</span>
              </div>
            </div>

            {selectedBooking.special_requests && (
              <div className="p-3 rounded-xl bg-[#241a10] border border-amber-500/20 text-amber-200">
                <strong>Special Requests:</strong> {selectedBooking.special_requests}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="block text-[#a89270] font-medium">Update Status Transition:</label>
              <div className="flex flex-wrap gap-2">
                {['pending_approval', 'confirmed', 'completed', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateBookingStatus(selectedBooking.id, st)}
                    className={`px-3 py-1.5 rounded-xl uppercase font-bold text-[10px] tracking-wider transition cursor-pointer ${
                      selectedBooking.status === st
                        ? 'bg-[#d4af37] text-black'
                        : 'bg-[#241a10] text-[#a89270] hover:text-[#d4af37]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#d4af37]/20">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-[#241a10] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 rounded-xl bg-[#d4af37] text-black font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TICKET QR SCANNER (GATE CHECK-IN) */}
      {/* =================================================================== */}
      {isScannerOpen && (
        <TicketScanner
          bookings={bookings}
          onVerifyCheckIn={bookingId => {
            handleUpdateBookingStatus(bookingId, 'completed', 'Verified and checked in via camera scanner at tour gate');
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
