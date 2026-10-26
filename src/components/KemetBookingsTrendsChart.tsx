import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Award,
  Sparkles,
  Users,
  CheckCircle,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { Booking, Excursion } from '../types';

interface KemetBookingsTrendsChartProps {
  bookings: Booking[];
  excursions: Excursion[];
  onRefreshData?: () => void;
}

export default function KemetBookingsTrendsChart({
  bookings,
  excursions,
  onRefreshData
}: KemetBookingsTrendsChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeChartMode, setActiveChartMode] = useState<'trends' | 'stacked' | 'pie'>('trends');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Colors for Recharts styling (Pharaonic Gold, Lapis Azure, Sunset Amber, Coral Bronze, Oasis Emerald)
  const GOLDEN_PALETTE = ['#d4af37', '#e6c280', '#38bdf8', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#8e6b12'];

  // Helper to format month key like "Jul 2026" from date string
  const getMonthKey = (dateStr: string) => {
    if (!dateStr) return 'Unknown Solar Cycle';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Jul 2026';
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Jul 2026';
    }
  };

  // Helper date sorting score
  const getMonthSortScore = (monthKey: string) => {
    try {
      const d = new Date(`01 ${monthKey}`);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    } catch {
      return 0;
    }
  };

  // All unique months present in bookings
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    bookings.forEach((b) => {
      const mKey = getMonthKey(b.date || b.createdAt);
      if (mKey) monthSet.add(mKey);
    });
    // Ensure current month is present as default if empty
    if (monthSet.size === 0) monthSet.add('Jul 2026');
    return Array.from(monthSet).sort((a, b) => getMonthSortScore(a) - getMonthSortScore(b));
  }, [bookings]);

  // Aggregated Monthly Booking Trends Data (for AreaChart & LineChart)
  const monthlyTrendsData = useMemo(() => {
    const monthsMap: {
      [month: string]: {
        month: string;
        totalBookings: number;
        confirmedBookings: number;
        totalRevenue: number;
        totalGuests: number;
        [excursionTitle: string]: any;
      };
    } = {};

    // Initialize map with all available months
    availableMonths.forEach((m) => {
      monthsMap[m] = {
        month: m,
        totalBookings: 0,
        confirmedBookings: 0,
        totalRevenue: 0,
        totalGuests: 0
      };
      // Initialize zero count for each excursion title
      excursions.forEach((ex) => {
        monthsMap[m][ex.title] = 0;
      });
    });

    // Populate counts
    bookings.forEach((b) => {
      const mKey = getMonthKey(b.date || b.createdAt);
      if (!monthsMap[mKey]) {
        monthsMap[mKey] = {
          month: mKey,
          totalBookings: 0,
          confirmedBookings: 0,
          totalRevenue: 0,
          totalGuests: 0
        };
        excursions.forEach((ex) => {
          monthsMap[mKey][ex.title] = 0;
        });
      }

      monthsMap[mKey].totalBookings += 1;
      if (b.status === 'Confirmed by High Priest' || b.status === 'Completed') {
        monthsMap[mKey].confirmedBookings += 1;
      }
      monthsMap[mKey].totalRevenue += b.totalCost || 0;
      monthsMap[mKey].totalGuests += b.numberOfGuests || 1;

      // Track per-excursion popularity count
      const exTitle = b.excursionTitle || excursions.find((e) => e.id === b.excursionId)?.title;
      if (exTitle) {
        monthsMap[mKey][exTitle] = (monthsMap[mKey][exTitle] || 0) + 1;
      }
    });

    return Object.values(monthsMap).sort(
      (a, b) => getMonthSortScore(a.month) - getMonthSortScore(b.month)
    );
  }, [bookings, excursions, availableMonths]);

  // Excursion Popularity overall or filtered by selected month
  const excursionPopularityBreakdown = useMemo(() => {
    const filteredBookings = selectedMonth === 'all'
      ? bookings
      : bookings.filter((b) => getMonthKey(b.date || b.createdAt) === selectedMonth);

    const counts: { [exId: string]: { excursion: Excursion; bookingsCount: number; guestsCount: number; revenue: number } } = {};

    excursions.forEach((ex) => {
      counts[ex.id] = { excursion: ex, bookingsCount: 0, guestsCount: 0, revenue: 0 };
    });

    filteredBookings.forEach((b) => {
      const exId = b.excursionId || excursions.find((e) => e.title === b.excursionTitle)?.id;
      if (exId && counts[exId]) {
        counts[exId].bookingsCount += 1;
        counts[exId].guestsCount += b.numberOfGuests || 1;
        counts[exId].revenue += b.totalCost || 0;
      }
    });

    return Object.values(counts)
      .map((item) => ({
        name: item.excursion.title.length > 22 ? item.excursion.title.substring(0, 20) + '...' : item.excursion.title,
        fullTitle: item.excursion.title,
        category: item.excursion.category,
        bookings: item.bookingsCount,
        guests: item.guestsCount,
        revenue: item.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings);
  }, [bookings, excursions, selectedMonth]);

  // Overall KPI metrics for header
  const totalSheetRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  }, [bookings]);

  const peakMonth = useMemo(() => {
    if (monthlyTrendsData.length === 0) return 'Jul 2026';
    const sorted = [...monthlyTrendsData].sort((a, b) => b.totalBookings - a.totalBookings);
    return sorted[0]?.month || 'Jul 2026';
  }, [monthlyTrendsData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      onRefreshData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="bg-[#14100c] border border-stone-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header & Source Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-850 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl text-[#d4af37]">𓇛</span>
            <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider">
              Kemet Bookings Google Sheet — Monthly Trends & Excursion Popularity
            </h3>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" /> Live Google Sheet
            </span>
          </div>
          <p className="text-stone-400 text-xs">
            Visualizing monthly booking velocity, traveler volume, and tour popularity directly synced with the 'Kemet Bookings' Google Sheet ledger.
          </p>
        </div>

        {/* Sync Controls & Month Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#1c1611] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#d4af37]/60 font-mono"
          >
            <option value="all">🗓️ All Solar Cycles (All Months)</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                📅 {m}
              </option>
            ))}
          </select>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-[#d4af37] hover:bg-[#c5a059] text-[#140f0a] px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Refresh from Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#18130e] border border-[#d4af37]/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-stone-500 text-[9px] font-mono uppercase tracking-widest block">Total Sheet Bookings</span>
            <strong className="text-2xl font-mono text-[#d4af37] block mt-0.5">{bookings.length} Caravans</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Peak Month */}
        <div className="bg-[#18130e] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-stone-500 text-[9px] font-mono uppercase tracking-widest block">Peak Popular Month</span>
            <strong className="text-2xl font-mono text-amber-400 block mt-0.5">{peakMonth}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#18130e] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-stone-500 text-[9px] font-mono uppercase tracking-widest block">Sheet Treasury Revenue</span>
            <strong className="text-2xl font-mono text-emerald-400 block mt-0.5">${totalSheetRevenue.toLocaleString()}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Most Popular Tour */}
        <div className="bg-[#18130e] border border-sky-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-stone-500 text-[9px] font-mono uppercase tracking-widest block">Top Popular Excursion</span>
            <strong className="text-xs font-serif font-bold text-sky-300 block mt-1 truncate max-w-[160px]">
              {excursionPopularityBreakdown[0]?.fullTitle || 'Ras Mohammed Diving'}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mode View Toggle Tabs */}
      <div className="flex justify-between items-center bg-[#18120d] p-1.5 rounded-xl border border-stone-850">
        <span className="text-[10px] font-serif font-bold text-[#e6c280] uppercase tracking-wider px-2">
          𓎬 Visualization Mode
        </span>
        <div className="flex gap-1">
          {[
            { id: 'trends', label: 'Monthly Growth Area' },
            { id: 'stacked', label: 'Monthly Tour Popularity' },
            { id: 'pie', label: 'Excursion Share Pie' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveChartMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                activeChartMode === mode.id
                  ? 'bg-[#d4af37] text-[#140f0a] font-bold border-[#d4af37] shadow-sm'
                  : 'bg-transparent text-stone-400 hover:text-stone-200 border-transparent'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="bg-[#18130e]/40 border border-stone-900 rounded-xl p-4 min-h-[360px] flex items-center justify-center relative">
        {bookings.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-stone-400 font-serif italic text-sm">"No entries found in the Kemet Bookings Google Sheet."</p>
            <p className="text-[10px] font-mono text-stone-600 uppercase">Simulate customer bookings or click 'Sync Sheet' to import entries.</p>
          </div>
        ) : activeChartMode === 'trends' ? (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cyanBookingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2016" opacity={0.4} />
              <XAxis dataKey="month" stroke="#8e6b12" fontSize={11} fontFamily="monospace" />
              <YAxis yAxisId="left" stroke="#d4af37" fontSize={10} fontFamily="monospace" tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14100c',
                  borderColor: '#d4af37',
                  borderRadius: '12px',
                  color: '#faf5e6',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}
                labelStyle={{ color: '#e6c280', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="totalRevenue"
                name="Monthly Revenue ($)"
                stroke="#d4af37"
                fillOpacity={1}
                fill="url(#goldRevenueGrad)"
                strokeWidth={2.5}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalBookings"
                name="Monthly Caravan Volume"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#cyanBookingsGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeChartMode === 'stacked' ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={excursionPopularityBreakdown} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2016" opacity={0.4} />
              <XAxis dataKey="name" stroke="#8e6b12" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#d4af37" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14100c',
                  borderColor: '#d4af37',
                  borderRadius: '12px',
                  color: '#faf5e6',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}
                formatter={(value: any, name: any) => [
                  name === 'bookings' ? `${value} caravans` : name === 'revenue' ? `$${value}` : `${value} travelers`,
                  name === 'bookings' ? 'Bookings Count' : name === 'revenue' ? 'Revenue' : 'Travelers Count'
                ]}
                labelFormatter={(label) => `Excursion: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Bar dataKey="bookings" name="Bookings Count" radius={[6, 6, 0, 0]}>
                {excursionPopularityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GOLDEN_PALETTE[index % GOLDEN_PALETTE.length]} />
                ))}
              </Bar>
              <Bar dataKey="guests" name="Guests Volume" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={excursionPopularityBreakdown}
                dataKey="bookings"
                nameKey="fullTitle"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={4}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {excursionPopularityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GOLDEN_PALETTE[index % GOLDEN_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14100c',
                  borderColor: '#d4af37',
                  borderRadius: '12px',
                  color: '#faf5e6',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}
                formatter={(value: any) => [`${value} bookings`, 'Popularity']}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Popularity Ranking Grid */}
      <div className="bg-[#18120d] border border-stone-850 rounded-xl p-4 space-y-3">
        <h4 className="font-serif text-[#e6c280] font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <span>𓂀</span> Excursion Popularity Leaderboard ({selectedMonth === 'all' ? 'All Months' : selectedMonth})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {excursionPopularityBreakdown.map((ex, idx) => (
            <div
              key={ex.fullTitle}
              className="bg-[#140f0c] border border-stone-900 hover:border-[#d4af37]/40 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#241a10] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-mono text-xs font-bold flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-serif font-bold text-stone-200 truncate" title={ex.fullTitle}>
                    {ex.fullTitle}
                  </h5>
                  <span className="text-[9px] font-mono text-stone-500 uppercase block mt-0.5">
                    {ex.category} • {ex.guests} pilgrims
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-mono font-bold text-[#d4af37] block">
                  {ex.bookings} <span className="text-[9px] text-stone-400 font-normal">tours</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 block">${ex.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
