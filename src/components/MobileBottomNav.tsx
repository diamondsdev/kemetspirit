import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, HelpCircle, FileText, Menu, X, Sparkles, Image, MessageSquare, ShieldAlert, Award, Sun, Moon, Map, User } from 'lucide-react';

interface MobileBottomNavProps {
  scrollToSection: (id: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  theme: 'desert' | 'nile';
  setTheme: (theme: 'desert' | 'nile') => void;
  activePage: string;
}

export default function MobileBottomNav({ scrollToSection, isAdminMode, setIsAdminMode, theme, setTheme, activePage }: MobileBottomNavProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavClick = (targetId: string) => {
    scrollToSection(targetId);
    setIsDrawerOpen(false);
  };

  const handleAdminToggle = () => {
    setIsAdminMode(!isAdminMode);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* 1. BOTTOM FIXED TAB BAR (Visible on mobile/tablet screens only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#140f0c]/95 border-t border-[#d4af37]/35 backdrop-blur-lg px-4 py-2.5 flex justify-around items-center md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-safe no-print">
        
        {/* Expeditions button */}
        <motion.button
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleNavClick('excursions-section')}
          className={`flex flex-col items-center gap-1 ${activePage === 'tours' ? 'text-[#d4af37]' : 'text-stone-400'} hover:text-[#d4af37] transition-all cursor-pointer flex-1`}
        >
          <motion.div
            variants={{
              hover: { scale: 1.25, rotate: 12, y: -2 },
              tap: { scale: 0.9, rotate: -8 }
            }}
            animate={activePage === 'tours' ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <Compass className="w-5 h-5" />
          </motion.div>
          <span className="text-[9px] font-mono uppercase tracking-widest font-medium">Expeditions</span>
        </motion.button>

        {/* FAQ button */}
        <motion.button
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleNavClick('faq-section')}
          className={`flex flex-col items-center gap-1 ${activePage === 'faq' ? 'text-[#d4af37]' : 'text-stone-400'} hover:text-[#d4af37] transition-all cursor-pointer flex-1`}
        >
          <motion.div
            variants={{
              hover: { scale: 1.25, rotate: -12, y: -2 },
              tap: { scale: 0.9, rotate: 8 }
            }}
            animate={activePage === 'faq' ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <HelpCircle className="w-5 h-5" />
          </motion.div>
          <span className="text-[9px] font-mono uppercase tracking-widest font-medium">FAQs</span>
        </motion.button>

        {/* Ledger button */}
        <motion.button
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleNavClick('ledger-section')}
          className={`flex flex-col items-center gap-1 ${activePage === 'bookings' ? 'text-[#d4af37]' : 'text-stone-400'} hover:text-[#d4af37] transition-all cursor-pointer flex-1`}
        >
          <motion.div
            variants={{
              hover: { scale: 1.25, rotate: 8, y: -2 },
              tap: { scale: 0.9, rotate: -8 }
            }}
            animate={activePage === 'bookings' ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <FileText className="w-5 h-5" />
          </motion.div>
          <span className="text-[9px] font-mono uppercase tracking-widest font-medium">Bookings</span>
        </motion.button>

        {/* More/Drawer Trigger button */}
        <motion.button
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-[#d4af37] hover:text-amber-300 transition-all cursor-pointer flex-1 relative"
        >
          <div className="absolute -top-1 right-8 w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <motion.div
            variants={{
              hover: { scale: 1.25, rotate: 90, y: -1 },
              tap: { scale: 0.9, rotate: -45 }
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
          >
            <Menu className="w-5 h-5" />
          </motion.div>
          <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Menu</span>
        </motion.button>

      </div>

      {/* Padding helper to prevent content overlap with bottom tab bar on mobile */}
      <div className="h-20 block md:hidden no-print" />

      {/* 2. SLIDE-UP BOTTOM DRAWER & BACKDROP OVERLAY */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:hidden no-print"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#16110d] border-t-2 border-[#d4af37] rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto px-6 pt-5 pb-8 flex flex-col space-y-6 md:hidden no-print"
            >
              
              {/* Drag line visual indicator */}
              <div className="w-12 h-1.5 bg-stone-800 rounded-full mx-auto" />

              {/* Drawer Header */}
                <div className="flex justify-between items-center border-b border-stone-800/85 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#d4af37] text-xl font-serif">𓋹</span>
                  <h4 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider">
                    Travel Directory
                  </h4>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-stone-400 hover:text-stone-200 p-1.5 bg-stone-900 rounded-full cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. Expeditions */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('excursions-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'tours'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 15, y: -2 },
                      tap: { scale: 0.85, rotate: -10 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <Compass className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Expeditions</span>
                  <span className="text-[9px] font-sans text-stone-500">Traverse deep Sea & Dunes</span>
                </motion.button>

                {/* 1.5. Ancient Map */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('map-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'map'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 10, y: -2 },
                      tap: { scale: 0.85, rotate: -8 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <Map className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Ancient Map</span>
                  <span className="text-[9px] font-sans text-stone-500">Interactive geography & lore</span>
                </motion.button>

                {/* 2. Scribe Oracle */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('scribe-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'scribe'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: -12, y: -2 },
                      tap: { scale: 0.85, rotate: 8 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <MessageSquare className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">AI Assistant</span>
                  <span className="text-[9px] font-sans text-stone-500">Chat with Sennedjem</span>
                </motion.button>

                {/* 3. Immersive Galleries */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('gallery-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'gallery'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 8, y: -2 },
                      tap: { scale: 0.85, rotate: -8 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <Image className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Galleries</span>
                  <span className="text-[9px] font-sans text-stone-500">Visual Egyptology guide</span>
                </motion.button>

                {/* 4. Cartouche Scribe */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('cartouche-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'cartouche'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 20, y: -2 },
                      tap: { scale: 0.85, rotate: -15 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <Award className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Cartouche</span>
                  <span className="text-[9px] font-sans text-stone-500">Write your name in hieroglyphs</span>
                </motion.button>

                {/* 5. FAQ Wisdom */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('faq-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'faq'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: -10, y: -2 },
                      tap: { scale: 0.85, rotate: 10 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <HelpCircle className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Help & FAQs</span>
                  <span className="text-[9px] font-sans text-stone-500">Gear, seasons, & health tips</span>
                </motion.button>

                {/* 6. Ledger ledger */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleNavClick('ledger-section')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'bookings'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 12, y: -2 },
                      tap: { scale: 0.85, rotate: -8 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <FileText className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">My Bookings</span>
                  <span className="text-[9px] font-sans text-stone-500">View trip statuses & details</span>
                </motion.button>

                {/* 7. Royal Account Portal */}
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => {
                    handleNavClick('profile');
                  }}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                    activePage === 'profile' || activePage === 'login' || activePage === 'register'
                      ? 'bg-[#2a2016]/80 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#1c1510] border-[#d4af37]/15 hover:border-[#d4af37]/45'
                  }`}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.3, rotate: 12, y: -2 },
                      tap: { scale: 0.85, rotate: -8 }
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                  >
                    <User className="w-5 h-5 text-[#d4af37]" />
                  </motion.div>
                  <span className="font-serif text-xs font-bold text-[#e6c280] uppercase">Traveler Portal</span>
                  <span className="text-[9px] font-sans text-stone-500">Login, Register & Profile</span>
                </motion.button>



              </div>

              {/* WhatsApp Quick Chat Integration */}
              <div className="pt-1">
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => {
                    const msg = "𓂀 Kemet Tours - Powered by Mas international Agency 𓂀\n\nGreetings Scribe! I am visiting your temple dashboard and would like to ask a general question about excursions, bookings, or custom travel plans!";
                    const url = `https://wa.me/201202181834?text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank') || (window.location.href = url);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl border font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-emerald-950/20 text-emerald-400 border-emerald-500/35 hover:border-emerald-500 hover:bg-emerald-950/40"
                >
                  <motion.span
                    className="text-emerald-400 text-sm inline-block"
                    variants={{
                      hover: { scale: 1.4, rotate: -25 },
                      tap: { scale: 0.85, rotate: 10 }
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    𓍢
                  </motion.span>
                  <span>WhatsApp Chat (+201202181834)</span>
                </motion.button>
              </div>

              {/* Theme Toggle (Mobile Drawer) */}
              <div className="pt-2">
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setTheme(theme === 'desert' ? 'nile' : 'desert')}
                  className="w-full py-3.5 px-4 rounded-xl border font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-[#241a10]/60 text-[#e6c280] border-[#d4af37]/35 hover:border-[#d4af37]"
                >
                  {theme === 'desert' ? (
                    <>
                      <motion.div
                        variants={{
                          hover: { scale: 1.3, rotate: 45 },
                          tap: { scale: 0.85, rotate: -15 }
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Sun className="w-4 h-4 text-amber-400" />
                      </motion.div>
                      <span>Desert Sun Theme</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        variants={{
                          hover: { scale: 1.3, rotate: 30 },
                          tap: { scale: 0.85, rotate: -15 }
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Moon className="w-4 h-4 text-sky-400" />
                      </motion.div>
                      <span>Nile Midnight Theme</span>
                    </>
                  )}
                </motion.button>
              </div>



              {/* Small lore quote in drawer footer */}
              <div className="text-center pt-2">
                <p className="text-[10px] font-mono text-stone-600 italic">
                  Have a wonderful journey through Egypt!
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
