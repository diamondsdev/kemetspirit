import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, CheckSquare, Square, Calculator, RefreshCw, AlertTriangle, Info, Sparkles, TrendingUp, User } from 'lucide-react';
import { Booking } from '../types';
import { useLanguage } from './LanguageContext';

interface ExcursionExpenseCalculatorProps {
  bookings: Booking[];
}

interface ChartSegment {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
  booking: Booking;
}

// Egyptian Theme Color Palette for Donut Chart Slices
const EGYPT_COLORS = [
  '#d4af37', // Ra Gold
  '#2b6cb0', // Lapis Lazuli
  '#319795', // Nile Teal
  '#dd6b20', // Terracotta Orange
  '#38a169', // Emerald Green
  '#805ad5', // Royal Purple
  '#e53e3e', // Carnelian Red
  '#4a5568', // Desert Basalt
];

export default function ExcursionExpenseCalculator({ bookings }: ExcursionExpenseCalculatorProps) {
  const { language } = useLanguage();
  // Select/Deselect states for each booking
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Max Budget Limit set by user
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [hoveredSegment, setHoveredSegment] = useState<ChartSegment | null>(null);

  // Synchronize selection state when bookings list changes
  useEffect(() => {
    if (bookings.length > 0) {
      // By default, select all active bookings
      setSelectedIds(bookings.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  }, [bookings]);

  // Handle single check/uncheck
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Select all or Clear all
  const selectAll = () => {
    setSelectedIds(bookings.map(b => b.id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  // Selected Bookings
  const selectedBookings = useMemo(() => {
    return bookings.filter(b => selectedIds.includes(b.id));
  }, [bookings, selectedIds]);

  // Calculations
  const totalCost = useMemo(() => {
    return selectedBookings.reduce((sum, b) => sum + b.totalCost, 0);
  }, [selectedBookings]);

  const totalGuests = useMemo(() => {
    return selectedBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
  }, [selectedBookings]);

  const avgCostPerGuest = useMemo(() => {
    return totalGuests > 0 ? Math.round(totalCost / totalGuests) : 0;
  }, [totalCost, totalGuests]);

  const isBudgetExceeded = totalCost > budgetLimit;

  // Prepare data for the D3 donut chart
  const chartData = useMemo<ChartSegment[]>(() => {
    if (selectedBookings.length === 0) return [];
    
    return selectedBookings.map((b, i) => {
      const value = b.totalCost;
      const percentage = totalCost > 0 ? (value / totalCost) * 100 : 0;
      return {
        id: b.id,
        label: b.excursionTitle,
        value,
        percentage,
        color: EGYPT_COLORS[i % EGYPT_COLORS.length],
        booking: b
      };
    });
  }, [selectedBookings, totalCost]);

  // SVG Dimension configurations
  const width = 280;
  const height = 280;
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.65; // Donut thickness
  const outerRadius = radius * 0.95;
  const cornerRadius = 4; // rounded segment edges

  // D3 calculations for path generation
  const pieGenerator = useMemo(() => {
    return d3.pie<ChartSegment>()
      .value(d => d.value)
      .sort(null); // Keep natural order
  }, []);

  const arcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<ChartSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius)
      .padAngle(0.03); // spacing between slices
  }, [innerRadius, outerRadius]);

  const hoverArcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<ChartSegment>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(outerRadius + 6)
      .cornerRadius(cornerRadius)
      .padAngle(0.02);
  }, [innerRadius, outerRadius]);

  // Calculate coordinates for the text annotations or arc path string
  const pieArcs = useMemo(() => {
    return pieGenerator(chartData);
  }, [chartData, pieGenerator]);

  return (
    <div className="bg-[#1f1a14] border-2 border-[#d4af37]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="excursion-expense-calculator">
      {/* Background Graphic Watermark */}
      <div className="absolute bottom-[-20px] right-[-20px] text-stone-900 opacity-[0.03] text-9xl font-serif select-none pointer-events-none">
        𓎛
      </div>

      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.2em] block">
              {language === 'de' ? 'Tribut-Schatzkammer' : language === 'pl' ? 'Skarbiec Ofiar' : 'Offerings Treasury'}
            </span>
            <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider">
              {language === 'de' ? 'Ausgaben-Rechner' : language === 'pl' ? 'Kalkulator Wydatków Wycieczki' : 'Excursion Expense Calculator'}
            </h3>
          </div>
        </div>
        
        {bookings.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-2 py-1 text-[10px] font-mono uppercase bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/25 text-[#fbf5e6] rounded-md transition-colors cursor-pointer"
            >
              {language === 'de' ? 'Alle' : language === 'pl' ? 'Wszystko' : 'All'}
            </button>
            <button
              onClick={clearAll}
              className="px-2 py-1 text-[10px] font-mono uppercase bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-stone-400 hover:text-red-300 rounded-md transition-colors cursor-pointer"
            >
              {language === 'de' ? 'Leeren' : language === 'pl' ? 'Wyczyść' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-stone-500 italic text-xs bg-[#15110d] rounded-xl border border-dashed border-[#d4af37]/15">
          {language === 'de' 
            ? '𓀚 Noch keine Ausflüge gebucht. Fügen Sie oben Expeditionen hinzu, um Ihr heiliges Reisebudget zu berechnen!' 
            : language === 'pl'
            ? '𓀚 Nie zarezerwowano jeszcze żadnych wycieczek. Dodaj ekspedycje powyżej, aby obliczyć swój święty budżet podróży!'
            : '𓀚 No excursions booked yet. Add expeditions above to calculate your sacred travel budget!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Excursions Checklist Selection */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                {language === 'de' ? 'Expeditionen Auswählen' : language === 'pl' ? 'Wybierz ekspedycje' : 'Select Expeditions'} ({selectedBookings.length}/{bookings.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-950">
              {bookings.map((booking, idx) => {
                const isSelected = selectedIds.includes(booking.id);
                const color = EGYPT_COLORS[idx % EGYPT_COLORS.length];
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => toggleSelect(booking.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#2a2118] border-[#d4af37]/40 shadow-inner'
                        : 'bg-[#15110d] border-stone-800 hover:border-stone-700 opacity-60 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        className="text-[#d4af37] focus:outline-none flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-[#d4af37]/10" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-600" />
                        )}
                      </button>
                      
                      {/* Color indicator dot */}
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />

                      <div className="min-w-0">
                        <span className="font-serif text-xs font-bold text-stone-200 block truncate uppercase tracking-wide">
                          {booking.excursionTitle}
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono block">
                          ID: #{booking.id.slice(-6)} • {booking.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="font-mono text-xs font-bold text-[#d4af37]">
                        ${booking.totalCost}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Treasury Offering Limit Setting */}
            <div className="bg-[#17130f] rounded-xl p-3 border border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                <span>{language === 'de' ? 'Goldtribut-Limit (Budget)' : language === 'pl' ? 'Limit budżetu oferowanego złota' : 'Gold Offering Cap (Budget)'}</span>
                <span className="text-[#d4af37] font-bold">${budgetLimit}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseInt(e.target.value))}
                className="w-full accent-[#d4af37] bg-stone-800 h-1.5 rounded-lg cursor-pointer focus:outline-none"
              />
              <div className="flex justify-between text-[8px] font-mono text-stone-600">
                <span>$500</span>
                <span>$15,000</span>
              </div>
            </div>
          </div>

          {/* D3 Donut Chart Visualization */}
          <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4">
            
            {selectedBookings.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-[#15110d] border border-stone-800 rounded-2xl w-full max-w-[280px]">
                <AlertTriangle className="w-8 h-8 text-amber-500 animate-bounce" />
                <div>
                  <h4 className="font-serif text-xs font-bold text-stone-300 uppercase">
                    {language === 'de' ? 'Kein Tribut berechnet' : language === 'pl' ? 'Nie obliczono ofiary' : 'No Offerings Computed'}
                  </h4>
                  <p className="text-[10px] text-stone-500 max-w-[200px] mt-1">
                    {language === 'de' 
                      ? 'Wählen Sie Karawanenreisen aus der Liste aus, um Ihren steuerlichen Tribut im Diagramm darzustellen.' 
                      : language === 'pl'
                      ? 'Wybierz podróże karawan z listy kontrolnej, aby przedstawić swoje ofiary finansowe na wykresie.'
                      : 'Select caravan voyages from the checklist to map your fiscal tribute in the chart.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full flex flex-col items-center justify-center">
                {/* Responsive SVG wrapper with fixed width for stability */}
                <div className="relative" style={{ width, height }}>
                  <svg width={width} height={height} className="overflow-visible">
                    <g transform={`translate(${width / 2}, ${height / 2})`}>
                      
                      {/* Interactive Pie Slices */}
                      {pieArcs.map((arc, i) => {
                        const isHovered = hoveredSegment?.id === arc.data.id;
                        const d = isHovered 
                          ? hoverArcGenerator(arc) 
                          : arcGenerator(arc);

                        return (
                          <path
                            key={arc.data.id}
                            d={d || ''}
                            fill={arc.data.color}
                            className="cursor-pointer transition-all duration-300 stroke-[#1f1a14] stroke-2 hover:stroke-[#e6c280]"
                            onMouseEnter={() => setHoveredSegment(arc.data)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            style={{
                              filter: isHovered 
                                ? 'drop-shadow(0px 0px 8px rgba(212, 175, 55, 0.45))' 
                                : 'none'
                            }}
                          />
                        );
                      })}

                      {/* Optional Inner subtle circle border */}
                      <circle
                        r={innerRadius - 2}
                        fill="transparent"
                        stroke="#d4af37"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        className="opacity-25"
                      />

                      {/* Center Content Inside Donut Hole */}
                      <foreignObject
                        x={-innerRadius + 8}
                        y={-innerRadius + 8}
                        width={(innerRadius - 8) * 2}
                        height={(innerRadius - 8) * 2}
                        className="pointer-events-none"
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                          <AnimatePresence mode="wait">
                            {hoveredSegment ? (
                              <motion.div
                                key={`hover-${hoveredSegment.id}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-0.5"
                              >
                                <span className="text-[8px] font-mono text-[#d4af37] uppercase tracking-widest block truncate max-w-[110px]">
                                  {hoveredSegment.label}
                                </span>
                                <span className="font-mono text-lg font-black text-white leading-none block">
                                  ${hoveredSegment.value}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full inline-block">
                                  {hoveredSegment.percentage.toFixed(1)}%
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="total"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-0.5"
                              >
                                <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block">
                                  {language === 'de' ? 'Gesamttribut' : language === 'pl' ? 'Suma ofiar' : 'Total Offering'}
                                </span>
                                <span className={`font-mono text-2xl font-black leading-none block transition-colors ${
                                  isBudgetExceeded ? 'text-red-400' : 'text-[#d4af37]'
                                }`}>
                                  ${totalCost}
                                </span>
                                <span className="text-[8px] text-stone-400 font-serif uppercase tracking-wider block">
                                  {selectedBookings.length} {selectedBookings.length === 1 
                                    ? (language === 'de' ? 'Reise aktiv' : language === 'pl' ? 'Aktywna podróż' : 'Trip Active') 
                                    : (language === 'de' ? 'Reisen aktiv' : language === 'pl' ? 'Aktywne podróże' : 'Trips Active')}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </foreignObject>

                    </g>
                  </svg>
                </div>

                {/* Under-Chart Budget Status Alert Banner */}
                <div className="w-full max-w-[340px] pt-2">
                  <AnimatePresence mode="wait">
                    {isBudgetExceeded ? (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="bg-red-950/30 border border-red-500/40 rounded-xl p-3 text-center space-y-1"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{language === 'de' ? 'Tributgrenze überschritten!' : language === 'pl' ? 'Przekroczono limit skarbu!' : 'Treasury Cap Exceeded!'}</span>
                        </div>
                        <p className="text-stone-300 text-[10px] leading-relaxed max-w-xs mx-auto">
                          {language === 'de' ? (
                            <>
                              Das Opfer übersteigt die Obergrenze um{' '}
                              <span className="text-red-400 font-bold font-mono">${totalCost - budgetLimit}</span>
                              . Die Königliche Schatzkammer ist überlastet! Passen Sie die Pläne an oder erhöhen Sie das Limit.
                            </>
                          ) : language === 'pl' ? (
                            <>
                              Oferta przekracza limit o{' '}
                              <span className="text-red-400 font-bold font-mono">${totalCost - budgetLimit}</span>
                              . Królewski skarbiec jest przeciążony! Dostosuj plany lub podnieś limit.
                            </>
                          ) : (
                            <>
                              Offering exceeds cap by{' '}
                              <span className="text-red-400 font-bold font-mono">${totalCost - budgetLimit}</span>
                              . The Royal Treasury is strained! Adjust plans or raise the cap.
                            </>
                          )}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="bg-[#241c14] border border-[#d4af37]/20 rounded-xl p-3 flex justify-around text-center text-stone-300 font-sans"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider font-mono text-stone-500">
                            <User className="w-3 h-3 text-stone-400" />
                            <span>{language === 'de' ? 'Gäste gesamt' : language === 'pl' ? 'Suma gości' : 'Total Guests'}</span>
                          </div>
                          <span className="text-sm font-bold text-[#e6c280] font-mono">{totalGuests}</span>
                        </div>

                        <div className="h-7 w-[1px] bg-[#d4af37]/10 self-center"></div>

                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider font-mono text-stone-500">
                            <TrendingUp className="w-3 h-3 text-stone-400" />
                            <span>{language === 'de' ? 'Schnitt pro Gast' : language === 'pl' ? 'Śr. na gościa' : 'Avg Per Guest'}</span>
                          </div>
                          <span className="text-sm font-bold text-[#d4af37] font-mono">${avgCostPerGuest}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
