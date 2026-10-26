import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Calendar,
  Layers,
  Percent,
  CheckCircle,
  HelpCircle,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Booking, Excursion } from '../types';
import KemetBookingsTrendsChart from './KemetBookingsTrendsChart';

interface BookingAnalyticsProps {
  bookings: Booking[];
  excursions: Excursion[];
}

export default function BookingAnalytics({ bookings, excursions }: BookingAnalyticsProps) {
  const [revenueMetric, setRevenueMetric] = useState<'total' | 'confirmed_only'>('total');
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'popularity' | 'categories' | 'status'>('timeline');

  // Compute stats
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pilgrimCount = bookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
    
    // Filter by revenue metrics choice
    const validBookings = bookings.filter(b => 
      revenueMetric === 'total' || b.status !== 'Pending Oracle Approval'
    );
    
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.totalCost, 0);
    const avgPassageTribute = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    
    // Confirmed bookings count
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed by High Priest' || b.status === 'Completed').length;
    const pendingCount = bookings.filter(b => b.status === 'Pending Oracle Approval').length;
    const completedCount = bookings.filter(b => b.status === 'Completed').length;

    return {
      totalBookings,
      pilgrimCount,
      totalRevenue,
      avgPassageTribute,
      confirmedCount,
      pendingCount,
      completedCount,
      conversionRate: totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0
    };
  }, [bookings, revenueMetric]);

  // Chart 1: Bookings & Revenue Timeline (Grouped by date)
  const timelineData = useMemo(() => {
    const groups: { [key: string]: { bookingsCount: number; revenue: number; guests: number } } = {};
    
    bookings.forEach(b => {
      // Clean up the date string (e.g. "2026-07-25" or fallback to createdAt date part)
      let rawDate = b.createdAt ? b.createdAt.split('T')[0] : b.date;
      if (!rawDate) rawDate = b.date;
      
      // If date is still invalid or empty, use fallback
      if (!rawDate) rawDate = 'Unknown';

      // Format date beautifully if possible, e.g. "2026-07-15" to "15 Jul"
      let formattedDate = rawDate;
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        }
      } catch (e) {
        // use raw date
      }

      if (!groups[formattedDate]) {
        groups[formattedDate] = { bookingsCount: 0, revenue: 0, guests: 0 };
      }
      
      groups[formattedDate].bookingsCount += 1;
      // Only include revenue if it fits the metric selected
      if (revenueMetric === 'total' || b.status !== 'Pending Oracle Approval') {
        groups[formattedDate].revenue += b.totalCost;
      }
      groups[formattedDate].guests += b.numberOfGuests;
    });

    // Convert to array and sort chronologically (best effort based on bookings order or dates)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      const d1 = new Date(a + ' 2026'); // append year for proper parsing
      const d2 = new Date(b + ' 2026');
      return d1.getTime() - d2.getTime();
    });

    return sortedDates.map(date => ({
      date,
      revenue: groups[date].revenue,
      bookingsCount: groups[date].bookingsCount,
      guests: groups[date].guests,
    }));
  }, [bookings, revenueMetric]);

  // Chart 2: Excursion Popularity (revenue and reservation count per excursion)
  const excursionPopularityData = useMemo(() => {
    return excursions.map(ex => {
      const exBookings = bookings.filter(b => b.excursionId === ex.id);
      const bookingsCount = exBookings.length;
      const guestsCount = exBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
      const revenue = exBookings
        .filter(b => revenueMetric === 'total' || b.status !== 'Pending Oracle Approval')
        .reduce((sum, b) => sum + b.totalCost, 0);

      return {
        id: ex.id,
        shortTitle: ex.title.length > 25 ? ex.title.substring(0, 22) + '...' : ex.title,
        fullTitle: ex.title,
        bookingsCount,
        guestsCount,
        revenue,
        category: ex.category
      };
    }).sort((a, b) => b.revenue - a.revenue); // sort by revenue descending
  }, [excursions, bookings, revenueMetric]);

  // Chart 3: Category Distribution
  const categoryData = useMemo(() => {
    const categories: { [key: string]: { name: string; revenue: number; bookingsCount: number; color: string } } = {
      diving: { name: 'Diving (Ras Mohammed)', revenue: 0, bookingsCount: 0, color: '#d4af37' },
      safari: { name: 'Desert Safari', revenue: 0, bookingsCount: 0, color: '#e6c280' },
      history: { name: 'Nile History', revenue: 0, bookingsCount: 0, color: '#f3e5c8' },
      boat: { name: 'Royal Cruise', revenue: 0, bookingsCount: 0, color: '#8e6b12' },
      speedboat: { name: 'Falcon Speedboat', revenue: 0, bookingsCount: 0, color: '#a27b1e' },
    };

    bookings.forEach(b => {
      const ex = excursions.find(e => e.id === b.excursionId);
      const cat = ex ? ex.category : 'diving';
      
      if (categories[cat]) {
        categories[cat].bookingsCount += 1;
        if (revenueMetric === 'total' || b.status !== 'Pending Oracle Approval') {
          categories[cat].revenue += b.totalCost;
        }
      }
    });

    return Object.values(categories).filter(c => c.bookingsCount > 0);
  }, [bookings, excursions, revenueMetric]);

  // Chart 4: Status Breakdown
  const statusData = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'Pending Oracle Approval').length;
    const confirmed = bookings.filter(b => b.status === 'Confirmed by High Priest').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;

    return [
      { name: 'Pending Oracle Approval', value: pending, color: '#f59e0b' },
      { name: 'Confirmed by High Priest', value: confirmed, color: '#10b981' },
      { name: 'Completed Past passage', value: completed, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  }, [bookings]);

  // Colors for charts
  const GOLDEN_COLORS = ['#d4af37', '#e6c280', '#a27b1e', '#8e6b12', '#ffe8a3', '#faf5e6', '#241a10'];

  return (
    <div className="space-y-8" id="booking-analytics-panel">
      
      {/* Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14100c] p-5 rounded-2xl border border-stone-850">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2">
            <span>𓂀</span> Kemet Sanctuary Booking Analytics
          </h3>
          <p className="text-stone-400 text-xs mt-0.5">
            Visualize financial treasuries, caravan counts, and sacred excursion popularity over active solar cycles.
          </p>
        </div>

        {/* Filter Metric Controls */}
        <div className="flex items-center gap-2 bg-[#1c1611] p-1.5 rounded-xl border border-stone-800 self-start md:self-auto">
          <button
            onClick={() => setRevenueMetric('total')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              revenueMetric === 'total'
                ? 'bg-[#d4af37] text-[#140f0a] font-bold shadow-md'
                : 'text-stone-400 hover:text-[#e6c280]'
            }`}
          >
            Gross Treasury (All)
          </button>
          <button
            onClick={() => setRevenueMetric('confirmed_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              revenueMetric === 'confirmed_only'
                ? 'bg-[#d4af37] text-[#140f0a] font-bold shadow-md'
                : 'text-stone-400 hover:text-[#e6c280]'
            }`}
          >
            Sealed Gold (Confirmed/Completed)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Royal Treasury */}
        <div className="bg-[#18120d] border border-[#d4af37]/35 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-[#d4af37] to-[#8e6b12]"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Total Gold Inflow</span>
              <strong className="text-3xl font-mono text-[#d4af37] block mt-1">
                ${stats.totalRevenue.toLocaleString()}
              </strong>
              <span className="text-[10px] text-stone-400 mt-1 block italic">
                {revenueMetric === 'total' ? 'Includes unsealed reserves' : 'Sealed by high priest only'}
              </span>
            </div>
            <div className="bg-[#d4af37]/10 p-2.5 rounded-xl text-[#d4af37] border border-[#d4af37]/25">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 2: Caravan count */}
        <div className="bg-[#18120d] border border-[#d4af37]/25 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-1 w-full bg-amber-500/30"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Caravan Bookings</span>
              <strong className="text-3xl font-mono text-stone-200 block mt-1">
                {stats.totalBookings}
              </strong>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {stats.pendingCount} pending • {stats.confirmedCount} confirmed
              </span>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/15">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3: Pilgrims registered */}
        <div className="bg-[#18120d] border border-[#d4af37]/25 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-1 w-full bg-yellow-600/30"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Total Pilgrims</span>
              <strong className="text-3xl font-mono text-stone-200 block mt-1">
                {stats.pilgrimCount} <span className="text-sm font-sans font-normal text-stone-400">guests</span>
              </strong>
              <span className="text-[10px] text-stone-400 mt-1 block">
                Average {stats.totalBookings > 0 ? (stats.pilgrimCount / stats.totalBookings).toFixed(1) : 0} pilgrims per caravan
              </span>
            </div>
            <div className="bg-yellow-500/10 p-2.5 rounded-xl text-yellow-400 border border-yellow-500/15">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 4: Average ticket price */}
        <div className="bg-[#18120d] border border-[#d4af37]/25 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500/30"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Average Passage Tribute</span>
              <strong className="text-3xl font-mono text-emerald-400 block mt-1">
                ${stats.avgPassageTribute}
              </strong>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {stats.conversionRate}% sealed booking rate
              </span>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/15">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Chart Selectors and Dynamic Chart Card */}
        <div className="lg:col-span-8 bg-[#14100c] border border-stone-800 rounded-2xl p-6 space-y-6 shadow-2xl flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-850 pb-4 gap-4">
            <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>𓋹</span> Divine Ledger Chart Viewer
            </h4>
            
            {/* Chart Sub Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'timeline', label: 'Timeline Line' },
                { id: 'popularity', label: 'Tours Popularity' },
                { id: 'categories', label: 'Categories Flow' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveChartTab(t.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                    activeChartTab === t.id
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#fbf5e6] font-bold'
                      : 'bg-transparent border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Chart Canvas Container */}
          <div className="h-[360px] w-full flex items-center justify-center bg-[#18130e]/30 rounded-xl p-4 border border-stone-900/50">
            {bookings.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-stone-400 font-serif italic text-sm">"The ledger scrolls are empty. No caravans have embarked yet."</p>
                <p className="text-[10px] font-mono text-stone-600 uppercase">Simulate booking records in the Command tab to generate data.</p>
              </div>
            ) : activeChartTab === 'timeline' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#241a10" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8e6b12" 
                    fontSize={10} 
                    fontFamily="monospace"
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#d4af37" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#38bdf8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(v) => `${v}`}
                  />
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
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Tribute Revenue ($)" 
                    stroke="#d4af37" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2.5}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="bookingsCount" 
                    name="Caravan Count" 
                    stroke="#38bdf8" 
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : activeChartTab === 'popularity' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={excursionPopularityData.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#241a10" opacity={0.3} />
                  <XAxis 
                    dataKey="shortTitle" 
                    stroke="#8e6b12" 
                    fontSize={9} 
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#d4af37" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#14100c', 
                      borderColor: '#d4af37', 
                      borderRadius: '12px',
                      color: '#faf5e6',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                    formatter={(value: any, name: any, props: any) => {
                      if (name === 'revenue') return [`$${value}`, 'Revenue Generated'];
                      return [value, 'Caravan Bookings'];
                    }}
                    labelFormatter={(label) => `Tour: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                    formatter={(value) => value === 'revenue' ? 'Gold Revenue ($)' : 'Bookings Count'}
                  />
                  <Bar dataKey="revenue" fill="#d4af37" name="revenue" radius={[6, 6, 0, 0]}>
                    {excursionPopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GOLDEN_COLORS[index % GOLDEN_COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="bookingsCount" fill="#8e6b12" name="bookings" radius={[3, 3, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryData} 
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#241a10" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    stroke="#8e6b12" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#d4af37" 
                    fontSize={9} 
                    fontFamily="serif"
                    width={110}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#14100c', 
                      borderColor: '#d4af37', 
                      borderRadius: '12px',
                      color: '#faf5e6',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                    formatter={(value: any) => [`$${value}`, 'Total Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={20}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick analysis summary paragraph */}
          <div className="bg-[#1a140f] border border-stone-850 p-4 rounded-xl flex items-start gap-3">
            <span className="text-[#d4af37] text-xl mt-0.5">𓂀</span>
            <div className="space-y-1">
              <h5 className="font-serif text-xs font-bold text-[#e6c280] uppercase tracking-wider">Royal Scribe Observation</h5>
              <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                {timelineData.length > 0 ? (
                  `Caravan passage registered a peak inflow totaling $${stats.totalRevenue.toLocaleString()} gold tokens. The most lucrative solar cycle represented is our current month. The general staff recommends promoting the high-revenue categories with custom scribe messaging cards.`
                ) : (
                  "Add simulated booking inscriptions inside the Sanctuary Database panel under the Command tab to reveal pharaonic graphs and gold charts."
                )}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Status Distribution & Excursion High Earners */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          
          {/* Status Donut Chart Card */}
          <div className="bg-[#14100c] border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col">
            <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider">
              𓎬 Caravan Status Sealing
            </h4>
            
            <div className="h-[200px] w-full relative flex items-center justify-center">
              {statusData.length === 0 ? (
                <span className="text-stone-600 text-[10px] font-mono">NO ACTIVE STATUSES</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#14100c', 
                        borderColor: '#d4af37', 
                        borderRadius: '12px',
                        color: '#faf5e6',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Donut inner text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                <span className="text-stone-500 text-[8px] font-mono uppercase tracking-widest">Total Active</span>
                <span className="text-2xl font-mono text-[#d4af37] font-bold">{bookings.length}</span>
                <span className="text-stone-400 text-[8px] font-mono uppercase">Ledger Rows</span>
              </div>
            </div>

            {/* Status Legend List */}
            <div className="space-y-2 pt-1 border-t border-stone-850">
              {statusData.map((item, index) => {
                const pct = bookings.length > 0 ? Math.round((item.value / bookings.length) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-stone-300 text-[10px] uppercase max-w-[170px] truncate" title={item.name}>
                        {item.name.replace('Approval', '').replace('by High Priest', '')}
                      </span>
                    </div>
                    <span className="text-stone-400 text-[10px]">
                      {item.value} <span className="text-stone-600">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Excursions Leaderboard */}
          <div className="bg-[#14100c] border border-stone-800 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col space-y-4">
            <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>𓀚</span> Gold-Winner Caravans
            </h4>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
              {excursionPopularityData.length === 0 ? (
                <div className="text-center py-6 text-stone-600 text-[10px] font-mono">NO TOURS LOADED</div>
              ) : (
                excursionPopularityData.slice(0, 4).map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-2.5 rounded-xl bg-[#1c1611]/80 border border-stone-900 flex items-center justify-between gap-3 group hover:border-[#d4af37]/35 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#241a10] border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0 text-[#d4af37] text-xs font-mono font-bold">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-serif font-bold text-stone-200 block truncate group-hover:text-[#d4af37] transition-colors">
                          {item.fullTitle}
                        </span>
                        <span className="text-[9px] font-mono text-stone-500 uppercase block mt-0.5">
                          {item.category} • {item.bookingsCount} caravans
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-[#d4af37] block">
                        ${item.revenue}
                      </span>
                      <span className="text-[8px] font-mono text-[#8e6b12] block">
                        generated
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Google Sheets Trends Chart Component */}
      <KemetBookingsTrendsChart bookings={bookings} excursions={excursions} />

    </div>
  );
}
