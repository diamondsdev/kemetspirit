import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, ScrollText, CalendarDays, Eye, BookOpen, Anchor, Map, Info, Sun, Moon, Globe, ChevronDown, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { Booking, User } from './types';
import ExcursionCatalog, { EXCURSIONS_DATA } from './components/ExcursionCatalog';
import BookingManager from './components/BookingManager';
import FooterNewsletter from './components/FooterNewsletter';
import OraclesWisdomFAQ from './components/OraclesWisdomFAQ';
import MobileBottomNav from './components/MobileBottomNav';
import ScarabCelebration from './components/ScarabCelebration';
import PapyrusScrollCelebration from './components/PapyrusScrollCelebration';
import SEOMetadataManager from './components/SEOMetadataManager';
import CookieConsentManager from './components/CookieConsentManager';
import SEOHelper from './components/SEOHelper';
import { useLanguage } from './components/LanguageContext';
import { getAccessToken } from './lib/firebaseAuth';

// Lazy loaded heavy components for optimal page load speed
const CartoucheGenerator = lazy(() => import('./components/CartoucheGenerator'));
const ScribeOracle = lazy(() => import('./components/ScribeOracle'));
const EgyptologyGallery = lazy(() => import('./components/EgyptologyGallery'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AncientSitesMap = lazy(() => import('./components/AncientSitesMap'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const UserProfilePage = lazy(() => import('./components/UserProfilePage'));

const SacredLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-[#140f0c]/60 border border-[#d4af37]/30 rounded-3xl backdrop-blur-md text-center my-8">
    <div className="w-12 h-12 rounded-full border-2 border-t-[#d4af37] border-r-transparent border-b-[#d4af37]/40 border-l-transparent animate-spin flex items-center justify-center text-[#d4af37] text-xl">
      𓋹
    </div>
    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em] animate-pulse">
      Summoning Sacred Wisdom...
    </span>
  </div>
);

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'desert' | 'nile'>(() => {
    return (localStorage.getItem('kemet_theme') as 'desert' | 'nile') || 'desert';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kemet_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kemet_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kemet_theme', theme);
  }, [theme]);

  const [excursions, setExcursions] = useState<any[]>(() => {
    const saved = localStorage.getItem('kemet_excursions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return EXCURSIONS_DATA;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<'browsing' | 'itinerary' | 'finalizing'>('browsing');
  const [activePage, setActivePage] = useState<'tours' | 'map' | 'scribe' | 'gallery' | 'cartouche' | 'faq' | 'bookings' | 'admin' | 'login' | 'register' | 'reset-password' | 'profile'>('tours');
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    return localStorage.getItem('kemet_admin_verified') === 'true';
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#language-dropdown-container')) {
        setIsLangDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isLangDropdownOpen]);

  // Fetch excursion data directly from Google Sheet on application load
  const fetchExcursionsFromGoogleSheet = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/excursions/fetch-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          accessToken: token || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.excursions && Array.isArray(data.excursions) && data.excursions.length > 0) {
          setExcursions(data.excursions);
          localStorage.setItem('kemet_excursions', JSON.stringify(data.excursions));
          window.dispatchEvent(new Event('kemet_excursions_updated'));
          return;
        }
      }
    } catch (err) {
      console.warn("Direct Google Sheet fetch failed on load, falling back to server registry:", err);
    }

    try {
      const resEx = await fetch('/api/excursions');
      if (resEx.ok) {
        const exData = await resEx.json();
        setExcursions(exData);
        localStorage.setItem('kemet_excursions', JSON.stringify(exData));
        window.dispatchEvent(new Event('kemet_excursions_updated'));
      }
    } catch (err) {
      console.error("Failed to load excursions from sacred server registry:", err);
    }
  };

  // Sync with Google Sheets and secure server database on mount and when admin status changes
  useEffect(() => {
    fetchExcursionsFromGoogleSheet();

    if (isAdminVerified) {
      const loadAdminBookings = async () => {
        const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
        const adminToken = localStorage.getItem('kemet_admin_token') || '';
        try {
          const resBk = await fetch('/api/bookings', {
            headers: {
              'x-admin-passcode': passcode,
              'x-admin-token': adminToken
            }
          });
          if (resBk.ok) {
            const bkData = await resBk.json();
            setBookings(bkData);
            localStorage.setItem('kemet_bookings', JSON.stringify(bkData));
          } else if (resBk.status === 401 || resBk.status === 403) {
            localStorage.removeItem('kemet_admin_verified');
            localStorage.removeItem('kemet_admin_token');
            localStorage.removeItem('kemet_admin_passcode');
            setIsAdminVerified(false);
          }
        } catch (err) {
          console.error("Failed to load bookings ledger from server:", err);
        }
      };
      loadAdminBookings();
    }
  }, [isAdminVerified]);

  // Listen to window.location.hash for deep-linking & browser history navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      const validPages = ['tours', 'map', 'scribe', 'gallery', 'cartouche', 'faq', 'bookings', 'admin', 'login', 'register', 'reset-password', 'profile'];
      if (validPages.includes(hash)) {
        setActivePage(hash as any);
        if (hash === 'admin') setIsAdminMode(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync window hash when activePage changes
  useEffect(() => {
    if (window.location.hash.replace('#', '') !== activePage) {
      window.history.replaceState(null, '', `#${activePage}`);
    }
  }, [activePage]);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  const [scrollY, setScrollY] = useState<number>(0);
  const [celebrationCount, setCelebrationCount] = useState<number>(0);
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<Booking | null>(null);

  // 24-Hour Travel Departure Notification System States & Helpers
  const [activeReminders, setActiveReminders] = useState<Booking[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('kemet_dismissed_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      setActiveReminders([]);
      return;
    }

    const now = new Date();
    const upcoming = bookings.filter(booking => {
      if (booking.checkedIn || booking.status === 'Completed') return false;
      if (dismissedReminders.includes(booking.id)) return false;

      try {
        const bookingDate = new Date(booking.date + "T00:00:00");
        const diffMs = bookingDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Starts within 28 hours (covering timezone offsets and tomorrow departure)
        return diffHours >= 0 && diffHours <= 28;
      } catch (e) {
        return false;
      }
    });

    setActiveReminders(upcoming);
  }, [bookings, dismissedReminders]);

  const handleDismissReminder = (bookingId: string) => {
    const updated = [...dismissedReminders, bookingId];
    setDismissedReminders(updated);
    try {
      sessionStorage.setItem('kemet_dismissed_reminders', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Scroll listener to update the active stage in progress tracker
  useEffect(() => {
    if (isAdminMode) return;

    const handleScrollStage = () => {
      const sections = [
        { id: 'excursions-section', stage: 'browsing' as const },
        { id: 'map-section', stage: 'browsing' as const },
        { id: 'gallery-section', stage: 'browsing' as const },
        { id: 'scribe-section', stage: 'itinerary' as const },
        { id: 'cartouche-section', stage: 'itinerary' as const },
        { id: 'faq-section', stage: 'itinerary' as const },
        { id: 'ledger-section', stage: 'finalizing' as const }
      ];

      let closestStage: 'browsing' | 'itinerary' | 'finalizing' = 'browsing';
      let minDistance = Infinity;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from top-middle viewport focus line
          const distance = Math.abs(rect.top - 150);
          if (distance < minDistance) {
            minDistance = distance;
            closestStage = section.stage;
          }
        }
      }

      // If at the very top of page (Hero section)
      if (window.scrollY < 200) {
        closestStage = 'browsing';
      }

      // If scrolled near bottom
      const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 150);
      if (isNearBottom) {
        closestStage = 'finalizing';
      }

      setActiveStage(closestStage);
    };

    window.addEventListener('scroll', handleScrollStage, { passive: true });
    // Run once immediately
    handleScrollStage();

    return () => {
      window.removeEventListener('scroll', handleScrollStage);
    };
  }, [isAdminMode]);

  const triggerCelebration = () => {
    setCelebrationCount(prev => prev + 1);
  };

  // Scroll listener for parallax background hieroglyphs
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Synchronize excursions dynamically when ratings or offerings are updated
  useEffect(() => {
    const syncExcursions = () => {
      const saved = localStorage.getItem('kemet_excursions');
      if (saved) {
        try {
          setExcursions(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener('kemet_excursions_updated', syncExcursions);
    return () => {
      window.removeEventListener('kemet_excursions_updated', syncExcursions);
    };
  }, []);

  // Global celebrate event listener
  useEffect(() => {
    const handleCelebrate = () => {
      triggerCelebration();
    };
    window.addEventListener('kemet_celebrate', handleCelebrate);
    return () => {
      window.removeEventListener('kemet_celebrate', handleCelebrate);
    };
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kemet_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Handle adding a new booking from the catalog
  const handleAddBooking = async (newBooking: Booking) => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...newBooking,
          accessToken: token || ''
        })
      });
      if (response.ok) {
        const savedBooking = await response.json();
        setBookings(prev => [savedBooking, ...prev]);
        setNewlyCreatedBooking(savedBooking);
        triggerCelebration();
      } else {
        const errData = await response.json();
        console.error(errData.error || "Failed to submit booking to server.");
        // Fallback to local memory
        setBookings(prev => [newBooking, ...prev]);
        setNewlyCreatedBooking(newBooking);
        triggerCelebration();
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setBookings(prev => [newBooking, ...prev]);
      setNewlyCreatedBooking(newBooking);
      triggerCelebration();
    }
  };

  // Handle cancelling/revoking a pending booking
  const handleCancelBooking = async (bookingId: string) => {
    const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
    const adminToken = localStorage.getItem('kemet_admin_token') || '';
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': passcode,
          'x-admin-token': adminToken
        }
      });
      if (response.ok) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      } else {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      }
    } catch (err) {
      console.error("Failed to cancel booking on server:", err);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
    const adminToken = localStorage.getItem('kemet_admin_token') || '';
    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode,
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch (err) {
      console.error("Failed to update booking status on server:", err);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  // High Priest Admin Authentication Handler
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('kemet_admin_verified', 'true');
        localStorage.setItem('kemet_admin_passcode', passcodeInput);
        if (data.token) {
          localStorage.setItem('kemet_admin_token', data.token);
        }
        setIsAdminVerified(true);
        setPasscodeInput('');
      } else {
        setPasscodeError(data.error || 'Incorrect passcode. Access is restricted to the High Priest.');
      }
    } catch (err: any) {
      setPasscodeError('Verification server unavailable. Please try again.');
    }
  };

  const handleUpdateBookingsList = (updatedList: Booking[]) => {
    setBookings(updatedList);
  };

  const handleVerifyCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.bookings) {
          setBookings(data.bookings);
        } else {
          setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Completed', checkedIn: true } : b));
        }
      } else {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Completed', checkedIn: true } : b));
      }
    } catch (err) {
      console.error("Failed to sync check-in with server, checking in locally:", err);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Completed', checkedIn: true } : b));
    }
  };

  const scrollToSection = (id: string) => {
    if (id === 'excursions-section' || id === 'tours') {
      setActivePage('tours');
    } else if (id === 'map-section' || id === 'map') {
      setActivePage('map');
    } else if (id === 'scribe-section' || id === 'scribe') {
      setActivePage('scribe');
    } else if (id === 'gallery-section' || id === 'gallery') {
      setActivePage('gallery');
    } else if (id === 'cartouche-section' || id === 'cartouche') {
      setActivePage('cartouche');
    } else if (id === 'faq-section' || id === 'faq') {
      setActivePage('faq');
    } else if (id === 'ledger-section' || id === 'bookings') {
      setActivePage('bookings');
    } else if (id === 'admin-section' || id === 'admin') {
      setActivePage('admin');
      setIsAdminMode(true);
    }

    // Scroll with motion animation & smooth alignment directly to screen main view
    setTimeout(() => {
      const targetEl = document.getElementById('main-content-section');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div 
      className={`min-h-screen bg-[#100c08] text-stone-200 font-sans selection:bg-[#d4af37]/30 selection:text-white overflow-x-hidden relative ${theme === 'nile' ? 'theme-nile' : 'theme-desert'}`} 
      id="app-root"
      style={theme === 'nile' ? { '--nile-bg-x': `${scrollY * 0.05}px` } as React.CSSProperties : undefined}
    >
      <SEOMetadataManager activePage={activePage} />
      <CookieConsentManager />
      
      {/* Scroll-Triggered Parallax Background Hieroglyphs */}
      <div className="absolute inset-y-0 left-0 right-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Left Side Runes */}
        {[
          { glyph: '𓋹', top: '10%', speed: 0.12, size: 'text-8xl', left: '1.5rem' },
          { glyph: '𓅃', top: '25%', speed: -0.15, size: 'text-7xl', left: '2.5rem' },
          { glyph: '𓎬', top: '40%', speed: 0.18, size: 'text-9xl', left: '0.75rem' },
          { glyph: '𓉐', top: '55%', speed: -0.08, size: 'text-6xl', left: '2rem' },
          { glyph: '𓆛', top: '70%', speed: 0.22, size: 'text-8xl', left: '1.5rem' },
          { glyph: '𓃠', top: '85%', speed: -0.12, size: 'text-7xl', left: '2.5rem' },
          { glyph: '𓁠', top: '95%', speed: 0.15, size: 'text-9xl', left: '0.75rem' },
        ].map((item, idx) => (
          <div
            key={`left-rune-${idx}`}
            className={`absolute font-serif text-[#1e1610] select-none pointer-events-none opacity-45 hidden xl:block transition-transform duration-75 ease-out ${item.size}`}
            style={{
              top: item.top,
              left: item.left,
              transform: `translateY(${scrollY * item.speed}px)`,
            }}
          >
            {item.glyph}
          </div>
        ))}

        {/* Right Side Runes */}
        {[
          { glyph: '𓆗', top: '12%', speed: -0.14, size: 'text-7xl', right: '1.5rem' },
          { glyph: '𓁠', top: '28%', speed: 0.16, size: 'text-9xl', right: '2.5rem' },
          { glyph: '𓆣', top: '43%', speed: -0.2, size: 'text-8xl', right: '0.75rem' },
          { glyph: '𓊟', top: '58%', speed: 0.1, size: 'text-7xl', right: '2rem' },
          { glyph: '𓂀', top: '73%', speed: -0.25, size: 'text-9xl', right: '1.5rem' },
          { glyph: '𓎡', top: '88%', speed: 0.14, size: 'text-6xl', right: '2.5rem' },
          { glyph: '𓋹', top: '97%', speed: -0.1, size: 'text-8xl', right: '0.75rem' },
        ].map((item, idx) => (
          <div
            key={`right-rune-${idx}`}
            className={`absolute font-serif text-[#1e1610] select-none pointer-events-none opacity-45 hidden xl:block transition-transform duration-75 ease-out ${item.size}`}
            style={{
              top: item.top,
              right: item.right,
              transform: `translateY(${scrollY * item.speed}px)`,
            }}
          >
            {item.glyph}
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative">
        
        {/* HERO BANNER / COMPACT SCREEN HEADER BANNER */}
        {activePage === 'tours' ? (
          <header className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b-4 border-[#d4af37] shadow-[0_15px_30px_rgba(212,175,55,0.08)]">
            
            {/* Hero Image Background */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={theme === 'nile' ? "/src/assets/images/nile_midnight_bg_1784129212752.jpg" : "/src/assets/images/egypt_red_sea_hero_1784070351173.jpg"}
                alt={theme === 'nile' ? "Nile River Midnight View" : "Ancient Egypt Red Sea Coast"}
                className="w-full h-full object-cover object-bottom transition-transform duration-75 ease-out"
                style={{
                  transform: theme === 'nile'
                    ? `translateX(${scrollY * 0.08}px) scale(1.15)`
                    : `translateX(${scrollY * 0.04}px) scale(1.1)`,
                }}
                referrerPolicy="no-referrer"
              />
              {/* Dark, glowing gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#100c08]/60 via-[#100c08]/30 to-[#100c08] z-0"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#100c08] via-transparent to-[#100c08] opacity-80 z-0"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center space-y-6">
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="inline-flex items-center gap-2 bg-[#140f0c]/90 border border-[#d4af37]/45 rounded-full px-5 py-1.5 shadow-[0_0_15px_rgba(212,175,55,0.15)] backdrop-blur-md"
              >
                <Sparkles className="text-[#d4af37] w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e6c280]">
                  {t('hero_sub', 'Experience Ancient Egypt')}
                </span>
                <Sparkles className="text-[#d4af37] w-4 h-4 animate-pulse" />
              </motion.div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="font-serif text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fbf5e6] via-[#d4af37] to-[#8e6b12] uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-none"
                >
                  {t('hero_title', 'Kemet Tours')}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="font-serif text-base md:text-xl text-[#e6c280]/80 tracking-widest uppercase drop-shadow-md"
                >
                  {t('hero_powered', 'Powered by Mas international Agency')}
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.6 }}
                className="text-stone-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans drop-shadow"
              >
                {t('hero_desc', 'Explore world-class Red Sea coral reefs, experience desert quad and camel safaris, and discover the historic temples and tombs of Luxor with our personalized travel planner.')}
              </motion.p>

              {/* Quick action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-wrap gap-4 justify-center pt-4"
              >
                <button
                  onClick={() => scrollToSection('excursions-section')}
                  className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#f3e5c8] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-[#d4af37]/25 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {t('hero_explore', 'Explore Tours')}
                </button>
                <button
                  onClick={() => scrollToSection('scribe-section')}
                  className="bg-[#140f0a]/90 hover:bg-[#201710] border border-[#d4af37]/50 text-[#e6c280] font-serif font-bold text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer hover:border-amber-300"
                >
                  {t('hero_chat_ai', 'Chat with AI Assistant')}
                </button>
              </motion.div>
            </div>

            {/* Golden Bottom Border Corner Accents */}
            <div className="absolute bottom-4 left-4 text-[#d4af37] font-serif text-sm select-none pointer-events-none opacity-40">𓋹 𓎬</div>
            <div className="absolute bottom-4 right-4 text-[#d4af37] font-serif text-sm select-none pointer-events-none opacity-40">𓅃 𓉐</div>
          </header>
        ) : (
          <div className="relative py-8 px-6 bg-[#140f0c]/80 border-b-2 border-[#d4af37]/30 shadow-md backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] text-3xl font-serif">
                  {activePage === 'map' ? '𓉶' : activePage === 'scribe' ? '𓋹' : activePage === 'gallery' ? '𓅓' : activePage === 'cartouche' ? '𓉐' : activePage === 'faq' ? '𓇚' : activePage === 'bookings' ? '𓎬' : '𓂀'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest">Kemet Tours Screen</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-[10px] font-mono text-stone-400 uppercase">Powered by Mas international Agency</span>
                  </div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#e6c280] uppercase tracking-wide">
                    {activePage === 'map' && 'Ancient Interactive Map'}
                    {activePage === 'scribe' && 'AI Travel Planner & Assistant'}
                    {activePage === 'gallery' && 'Egyptology Photo Gallery'}
                    {activePage === 'cartouche' && 'Hieroglyphic Name Cartouche'}
                    {activePage === 'faq' && 'Scribes Sanctuary & FAQs'}
                    {activePage === 'bookings' && 'My Bookings & Reviews'}
                    {activePage === 'admin' && 'High Priest Admin Portal'}
                  </h1>
                </div>
              </div>

              <button
                onClick={() => scrollToSection('excursions-section')}
                className="bg-[#241a10] hover:bg-[#382818] text-[#e6c280] border border-[#d4af37]/40 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>𓆛</span>
                <span>Back to Expeditions</span>
              </button>
            </div>
          </div>
        )}

        {/* EMBEDDED NAVIGATION BAR */}
        <nav className="sticky top-0 bg-[#140f0c]/90 border-b border-[#d4af37]/25 py-3.5 px-6 z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto space-y-3.5">
            {/* Main Nav Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              
              {/* Logo */}
              <motion.div
                whileHover="hover"
                whileTap="tap"
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => scrollToSection('excursions-section')}
              >
                <motion.span
                  variants={{
                    hover: { scale: 1.35, rotate: 360, y: -2 },
                    tap: { scale: 0.85 }
                  }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                  className="text-[#d4af37] text-2xl font-serif inline-block"
                >
                  𓋹
                </motion.span>
                <span className="font-serif font-bold text-[#e6c280] tracking-widest uppercase text-base group-hover:text-[#d4af37] transition-all duration-300">
                  KEMET TOURS
                </span>
              </motion.div>

              {/* Anchors & Toggle */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs font-mono uppercase tracking-widest">
                {[
                  { label: t('nav_tours', '𓆛 Tours & Excursions'), id: 'tours', target: 'excursions-section' },
                  { label: t('nav_map', '𓉶 Ancient Map'), id: 'map', target: 'map-section' },
                  { label: t('nav_ai_planner', '𓋹 AI Travel Planner'), id: 'scribe', target: 'scribe-section' },
                  { label: t('nav_gallery', '𓅓 Photo Gallery'), id: 'gallery', target: 'gallery-section' },
                  { label: t('nav_cartouche', '𓉐 Name Translator'), id: 'cartouche', target: 'cartouche-section' },
                  { label: t('nav_faq', '𓇚 Questions & Answers'), id: 'faq', target: 'faq-section' },
                  { label: t('nav_bookings', '𓎬 My Bookings'), id: 'bookings', target: 'ledger-section' }
                ].map((item) => {
                  const isItemActive = activePage === item.id;
                  const text = item.label;
                  const firstSpaceIdx = text.indexOf(' ');
                  const glyph = firstSpaceIdx !== -1 ? text.substring(0, firstSpaceIdx) : '';
                  const rest = firstSpaceIdx !== -1 ? text.substring(firstSpaceIdx + 1) : text;
                  
                  return (
                    <motion.button
                      key={item.target}
                      onClick={() => scrollToSection(item.target)}
                      whileHover="hover"
                      whileTap="tap"
                      className={`${isItemActive ? 'text-[#d4af37] font-bold bg-[#281d14] px-3 py-1.5 rounded-lg border border-[#d4af37]/40 shadow-sm' : 'text-stone-400 px-2.5 py-1.5'} hover:text-[#d4af37] transition-all duration-300 cursor-pointer flex items-center gap-1.5`}
                    >
                      {glyph && (
                        <motion.span
                          className="text-[#d4af37] text-sm inline-block"
                          variants={{
                            hover: { scale: 1.35, rotate: 18, y: -2 },
                            tap: { scale: 0.9, rotate: -15 }
                          }}
                          animate={isItemActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 10 }}
                        >
                          {glyph}
                        </motion.span>
                      )}
                      <span className={`${isItemActive ? 'underline underline-offset-4' : 'hover:underline hover:underline-offset-4'}`}>
                        {rest}
                      </span>
                    </motion.button>
                  );
                })}

                {/* Pharaonic-styled compact Language Dropdown */}
                <div className="relative" id="language-dropdown-container">
                  <button
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all duration-300 cursor-pointer uppercase flex items-center gap-2 bg-[#241a10]/60 text-[#e6c280] border-[#d4af37]/40 hover:border-[#d4af37]"
                    title="Select Language / Sprache wählen / Wybierz język / Vybrat jazyk"
                  >
                    <span className="text-[#d4af37] text-sm animate-pulse">𓂀</span>
                    <span className="tracking-wider">
                      {language === 'en' ? 'EN' : language === 'de' ? 'DE' : language === 'pl' ? 'PL' : 'CS'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-[#d4af37] transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  <AnimatePresence>
                    {isLangDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-36 bg-[#1a120b] border border-[#d4af37]/50 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden z-50 py-1 font-mono text-xs backdrop-blur-md"
                      >
                        {[
                          { code: 'en', label: 'EN', fullName: 'English', glyph: '𓎛' },
                          { code: 'de', label: 'DE', fullName: 'Deutsch', glyph: '𓐠' },
                          { code: 'pl', label: 'PL', fullName: 'Polski', glyph: '𓃮' },
                          { code: 'cs', label: 'CS', fullName: 'Čeština', glyph: '𓅱' },
                          { code: 'ar', label: 'AR', fullName: 'العربية', glyph: '𓋹' }
                        ].map((item) => (
                          <button
                            key={item.code}
                            onClick={() => {
                              setLanguage(item.code as any);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-all cursor-pointer ${
                              language === item.code
                                ? 'bg-[#d4af37]/20 text-[#d4af37] font-bold'
                                : 'text-stone-300 hover:bg-[#d4af37]/10 hover:text-white'
                            }`}
                          >
                            <span className="text-[#d4af37] text-sm">{item.glyph}</span>
                            <span className="font-semibold text-[11px]">{item.fullName}</span>
                            <span className="ml-auto text-[9px] text-stone-500 font-bold">{item.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Account / Auth Button */}
                {currentUser ? (
                  <button
                    onClick={() => setActivePage('profile')}
                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      activePage === 'profile'
                        ? 'bg-[#d4af37] text-[#140f0a] border-white shadow-md'
                        : 'bg-[#241a10]/80 text-[#e6c280] border-[#d4af37]/50 hover:border-[#d4af37]'
                    }`}
                    title="View Profile & Royal Credentials"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActivePage('login')}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                        activePage === 'login'
                          ? 'bg-[#d4af37] text-[#140f0a] border-white shadow-md'
                          : 'bg-[#241a10]/80 text-[#e6c280] border-[#d4af37]/40 hover:border-[#d4af37]'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Log In</span>
                    </button>
                    <button
                      onClick={() => setActivePage('register')}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                        activePage === 'register'
                          ? 'bg-[#d4af37] text-[#140f0a] border-white shadow-md'
                          : 'bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] border-[#d4af37] hover:brightness-110'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register</span>
                    </button>
                  </div>
                )}

                {/* Theme Toggle Button */}
                <button
                  onClick={() => setTheme(theme === 'desert' ? 'nile' : 'desert')}
                  className="px-3 py-1.5 rounded-lg border font-mono font-bold transition-all duration-300 cursor-pointer uppercase flex items-center gap-1.5 bg-[#241a10]/60 text-[#e6c280] border-[#d4af37]/40 hover:border-[#d4af37]"
                  title={language === 'de' ? (theme === 'desert' ? "Zu Nil-Mitternacht wechseln" : "Zu Wüstensonne wechseln") : language === 'pl' ? (theme === 'desert' ? "Przełącz na Nil Północny" : "Przełącz na Słońce Pustyni") : (theme === 'desert' ? "Switch to Nile Midnight" : "Switch to Desert Sun")}
                >
                  {theme === 'desert' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'de' ? 'Wüstensonne' : language === 'pl' ? 'Słońce Pustyni' : 'Desert Sun'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{language === 'de' ? 'Nil-Mitternacht' : language === 'pl' ? 'Nil Północny' : 'Nile Midnight'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN BODY CONTENTS */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative" id="main-content-section" tabIndex={-1}>
          
          <Suspense fallback={<SacredLoader />}>
            <AnimatePresence mode="wait">
            {activePage === 'tours' && (
                <motion.div
                  key="tours"
                  id="excursions-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <ExcursionCatalog onAddBooking={handleAddBooking} excursions={excursions} />
                </motion.div>
              )}

              {activePage === 'map' && (
                <motion.div
                  key="map"
                  id="map-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <AncientSitesMap />
                </motion.div>
              )}

              {activePage === 'scribe' && (
                <motion.div
                  key="scribe"
                  id="scribe-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <div className="text-center">
                    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">{language === 'de' ? 'Künstliche Intelligenz' : language === 'pl' ? 'Sztuczna inteligencja' : language === 'cs' ? 'Umělá inteligence' : 'Artificial Intelligence'}</span>
                    <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] uppercase mt-1">
                      {language === 'de' ? 'KI-Reiseführer & Assistent' : language === 'pl' ? 'Asystent i przewodnik AI' : language === 'cs' ? 'Průvodce a asistent s AI' : 'AI Travel Guide & Assistant'}
                    </h2>
                    <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
                      {language === 'de' ? 'Stellen Sie unserem KI-Helfer Fragen oder erstellen Sie einen individuellen Tages-Reiseplan.' : language === 'pl' ? 'Zadaj pytania naszemu asystentowi AI lub wygeneruj spersonalizowany plan dobrobytu.' : language === 'cs' ? 'Zeptejte se našeho asistenta s AI na cokoli nebo si nechte vytvořit vlastní denní itinerář.' : 'Ask our AI helper any questions or generate a custom day-by-day travel plan.'}
                    </p>
                  </div>
                  <ScribeOracle onScribeSuccess={triggerCelebration} onAddBooking={handleAddBooking} bookings={bookings} excursions={excursions} onUpdateExcursions={setExcursions} />
                </motion.div>
              )}

              {activePage === 'gallery' && (
                <motion.div
                  key="gallery"
                  id="gallery-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <EgyptologyGallery />
                </motion.div>
              )}

              {activePage === 'cartouche' && (
                <motion.div
                  key="cartouche"
                  id="cartouche-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <div className="text-center">
                    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">{language === 'de' ? 'Ägyptische Kartusche' : language === 'pl' ? 'Egipska kartusza' : language === 'cs' ? 'Egyptská kartuše' : 'Egyptian Cartouche'}</span>
                    <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] uppercase mt-1">
                      {language === 'de' ? 'Ägyptischer Namensübersetzer' : language === 'pl' ? 'Tłumacz egipskich imion' : language === 'cs' ? 'Překladač egyptských jmen' : 'Egyptian Name Translator'}
                    </h2>
                    <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
                      {language === 'de' ? 'Übersetzen Sie Ihren Namen in altägyptische Hieroglyphensymbole in einer wunderschönen schützenden Kartusche.' : language === 'pl' ? 'Przetłumacz swoje imię na starożytne egipskie hieroglify wewnątrz pięknej, ochronnej kartuszy.' : language === 'cs' ? 'Přeložte své jméno do starověkých egyptských hieroglyfů uvnitř krásné ochranné kartuše.' : 'Translate your name into ancient Egyptian hieroglyphic symbols inside a beautiful protective cartouche.'}
                    </p>
                  </div>
                  <CartoucheGenerator />
                </motion.div>
              )}

              {activePage === 'faq' && (
                <motion.div
                  key="faq"
                  id="faq-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-12 scroll-mt-28"
                >
                  {/* Subheader */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#140f0c]/60 border border-[#d4af37]/20 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.3em] flex items-center gap-1.5">
                        <span className="animate-pulse">𓇚</span> {t('archive', 'Egyptian Archives 𓇚')}
                      </span>
                      <h2 className="font-serif text-xl font-bold text-[#e6c280] uppercase">{t('sanctuary_title', "The Scribes' Sanctuary")}</h2>
                      <p className="text-stone-400 text-xs">{t('sanctuary_desc', 'Access critical travel wisdom and sacred records here.')}</p>
                    </div>
                  </div>

                  {/* Decorative Wisdom Column / Travel Tips before the FAQ section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#120e0a]/80 border border-[#d4af37]/15 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl text-[#d4af37]">𓋹</span>
                        <h4 className="font-serif text-lg font-bold text-[#e6c280] uppercase">{t('safety_title', 'Sacred Nile & Desert Safety')}</h4>
                      </div>
                      <ul className="space-y-3.5 text-xs text-stone-400 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('safety_water', 'Water Wisdom')}:</strong> {t('safety_water_desc', 'Standard tap water is not fit for consumption. Please enjoy the abundant, complimentary ice-cold bottled mineral water provided across all tours and camps.')}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('safety_garb', 'Desert Garb')}:</strong> {t('safety_garb_desc', 'When riding quad bikes or hiking sand dunes, wear secure closed-toe shoes and wraps. The sun evaporates heat instantly, but temperatures drop rapidly after twilight.')}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('safety_cultural', 'Cultural Respect')}:</strong> {t('safety_cultural_desc', 'Cover shoulders and knees when visiting ancient shrines, and always request permission before capturing memories of Bedouin hosts.')}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#120e0a]/80 border border-[#d4af37]/15 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl text-[#d4af37]">𓅃</span>
                        <h4 className="font-serif text-lg font-bold text-[#e6c280] uppercase">{t('diving_title', 'Diving & Historical Passes')}</h4>
                      </div>
                      <ul className="space-y-3.5 text-xs text-stone-400 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('diving_coral', 'Corals of Sobek')}:</strong> {t('diving_coral_desc', 'Use strictly reef-safe biodegradable sunscreen. Never stand on, touch, or handle corals as it damages sensitive living systems.')}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('diving_passes', 'Valley Passes')}:</strong> {t('diving_passes_desc', 'Standard entry tickets are included and allow entry into 3 major tombs. Specialty tombs like Tutankhamun can be booked through your guide 48 hours in advance.')}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#d4af37]">✦</span>
                          <span><strong>{t('diving_photo', 'Pharaonic Photography')}:</strong> {t('diving_photo_desc', 'Smartphone photos are free inside tombs, but professional DSLR cameras/tripods are strictly banned without commercial licenses.')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* THE FAQ SECTION */}
                  <div className="pt-4 border-t border-[#d4af37]/15">
                    <OraclesWisdomFAQ />
                  </div>
                </motion.div>
              )}

              {activePage === 'bookings' && (
                <motion.div
                  key="bookings"
                  id="ledger-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  <div className="text-center">
                    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">{language === 'de' ? 'Meine Buchungen' : language === 'pl' ? 'Moje rezerwacje' : language === 'cs' ? 'Moje rezervace' : 'My Bookings'}</span>
                    <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] uppercase mt-1">
                      {language === 'de' ? 'Ihre Buchungen & Bewertungen' : language === 'pl' ? 'Twoje rezerwacje i opinie' : language === 'cs' ? 'Vaše rezervace a hodnocení' : 'Your Bookings & Reviews'}
                    </h2>
                    <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
                      {language === 'de' ? 'Sehen Sie sich Ihre ausstehenden oder bestätigten Buchungen an und lesen Sie Bewertungen von anderen Reisenden.' : language === 'pl' ? 'Przeglądaj swoje oczekujące i potwierdzone rezerwacje oraz czytaj opinie innych podróżnych.' : language === 'cs' ? 'Zobrazte své čekající nebo potvrzené rezervace a přečtěte si hodnocení ostatních cestovatelů.' : 'View your pending or confirmed bookings, and read reviews from other travelers.'}
                    </p>
                  </div>
                  <BookingManager bookings={bookings} excursions={excursions} onCancelBooking={handleCancelBooking} onVerifyCheckIn={handleVerifyCheckIn} />
                </motion.div>
              )}

              {activePage === 'admin' && (
                <motion.div
                  key="admin"
                  id="admin-section"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-8 scroll-mt-28"
                >
                  {!isAdminVerified ? (
                    <div className="max-w-md mx-auto bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                      <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-3xl text-[#d4af37]">
                        𓂀
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em]">Protected Area</span>
                        <h2 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wider">High Priest Sanctuary</h2>
                        <p className="text-stone-400 text-xs leading-relaxed">
                          This portal is restricted to High Priests and Scribe Administrators. Enter your secret passcode to access live ledgers, CRM, and spreadsheet controls.
                        </p>
                      </div>

                      <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#d4af37] mb-1.5">
                            Passcode / Key
                          </label>
                          <input
                            type="password"
                            value={passcodeInput}
                            onChange={(e) => setPasscodeInput(e.target.value)}
                            placeholder="Enter High Priest passcode (e.g. pharaoh)"
                            className="w-full bg-[#0c0907] border border-[#d4af37]/40 rounded-xl px-4 py-3 text-stone-200 text-sm font-mono focus:outline-none focus:border-[#d4af37]"
                            required
                          />
                        </div>

                        {passcodeError && (
                          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-red-400 text-xs font-mono">
                            ⚠️ {passcodeError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#f3e5c8] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
                        >
                          Unlock Sanctuary
                        </button>
                      </form>
                    </div>
                  ) : (
                    <AdminDashboard
                      bookings={bookings}
                      onUpdateBookingStatus={handleUpdateBookingStatus}
                      onCancelBooking={handleCancelBooking}
                      onUpdateBookingsList={handleUpdateBookingsList}
                      onVerifyCheckIn={handleVerifyCheckIn}
                    />
                  )}
                </motion.div>
              )}

              {activePage === 'login' && (
                <motion.div
                  key="login-page"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <LoginPage
                    onLoginSuccess={(user) => {
                      setCurrentUser(user);
                    }}
                    onNavigate={(page) => {
                      setActivePage(page as any);
                    }}
                  />
                </motion.div>
              )}

              {activePage === 'register' && (
                <motion.div
                  key="register-page"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <RegisterPage
                    onLoginSuccess={(user) => {
                      setCurrentUser(user);
                    }}
                    onNavigate={(page) => {
                      setActivePage(page as any);
                    }}
                  />
                </motion.div>
              )}

              {activePage === 'reset-password' && (
                <motion.div
                  key="reset-password-page"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <ResetPasswordPage
                    onLoginSuccess={(user) => {
                      setCurrentUser(user);
                    }}
                    onNavigate={(page) => {
                      setActivePage(page as any);
                    }}
                  />
                </motion.div>
              )}

              {activePage === 'profile' && (
                <motion.div
                  key="profile-page"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <UserProfilePage
                    currentUser={currentUser}
                    onLogout={() => {
                      localStorage.removeItem('kemet_user');
                      setCurrentUser(null);
                      setActivePage('tours');
                    }}
                    onNavigate={(page) => {
                      setActivePage(page as any);
                    }}
                    onUpdateUser={(updated) => {
                      setCurrentUser(updated);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>

        </main>

        {/* IMPERIAL NEWSLETTER SIGNUP BANNER */}
        <section className="px-6 pb-12 w-full">
          <FooterNewsletter />
        </section>

        {/* MAIN FOOTER */}
        <footer className="bg-[#0b0806] border-t-4 border-[#d4af37] py-12 px-6 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-center items-center gap-2">
            <span className="text-[#d4af37] text-2xl font-serif">𓋹</span>
            <span className="font-serif font-black text-xl text-[#e6c280] tracking-widest uppercase">
              Kemet Tours
            </span>
            <span className="text-[#d4af37] text-2xl font-serif">𓋹</span>
          </div>

          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
            {language === 'de' ? 'Unterstützt von Mas international Agency. Entwickelt für Wüstenentdecker, Tiefseetaucher und Geschichtsliebhaber. Gute Reise und einen fantastischen Urlaub!' : language === 'pl' ? 'Wspierane przez Mas international Agency. Zaprojektowane dla odkrywców pustyni, nurków głębinowych i miłośników historii. Bezpiecznej podróży i niesamowitych wakacji!' : language === 'cs' ? 'S podporou Mas international Agency. Navrženo pro objevitele pouští, hlubinné potápěče a milovníky historie. Šťastnou cestu a skvělou dovolenou!' : 'Powered by Mas international Agency. Designed for desert explorers, deep-sea divers, and lovers of history. Safe travels and have an amazing trip!'}
          </p>

          {/* Ancient seals icons */}
          <div className="flex justify-center gap-6 text-[#d4af37] text-3xl opacity-50 select-none">
            <span>𓋹</span>
            <span>𓎬</span>
            <span>𓅃</span>
            <span>𓉐</span>
            <span>𓆛</span>
          </div>

          <div className="pt-4 border-t border-stone-900/60 text-stone-600 text-[10px] font-mono uppercase tracking-widest">
            © 2026 Kemet Tours - Powered by Mas international Agency • {language === 'de' ? 'Alle Rechte vorbehalten.' : language === 'pl' ? 'Wszelkie prawa zastrzeżone.' : language === 'cs' ? 'Všechna práva vyhrazena.' : 'All Rights Reserved.'}
          </div>
        </footer>

        {/* ERGONOMIC MOBILE BOTTOM NAVIGATION DRAWER */}
        <MobileBottomNav
          scrollToSection={scrollToSection}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
          theme={theme}
          setTheme={setTheme}
          activePage={activePage}
        />

        {/* FLOATING HIGH PRIEST ADMIN DASHBOARD BUTTON (Only shown when logged in as admin) */}
        {isAdminVerified && (
          <div className="fixed bottom-24 md:bottom-6 left-6 z-50 no-print">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (activePage === 'admin') {
                  scrollToSection('excursions-section');
                } else {
                  scrollToSection('admin-section');
                }
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-[0_4px_25px_rgba(212,175,55,0.4)] border-2 transition-all cursor-pointer backdrop-blur-md ${
                activePage === 'admin'
                  ? 'bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b08e23] text-[#140f0a] border-white font-bold'
                  : 'bg-[#18120c]/95 border-[#d4af37] text-[#e6c280] hover:text-white hover:border-amber-300'
              }`}
              title="Access High Priest Admin Dashboard"
            >
              <div className="relative flex items-center justify-center">
                <span className="text-xl font-serif text-[#d4af37]">𓂀</span>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37]"></span>
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider leading-none">
                  High Priest Admin
                </span>
                <span className="text-[9px] font-mono text-amber-200/90 leading-tight mt-0.5">
                  {activePage === 'admin' ? '✓ Dashboard Active' : 'Open Dashboard'}
                </span>
              </div>
            </motion.button>
          </div>
        )}

        {/* FLOATING WHATSAPP ASSISTANCE WIDGET */}
        <div className="fixed bottom-24 md:bottom-6 right-6 z-40 no-print">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const msg = language === 'de'
                ? "𓂀 Kemet Tours - Unterstützt von Mas international Agency 𓂀\n\nSeid gegrüßt, Schreiber! Ich besuche Ihr Tempel-Dashboard und möchte mich über maßgeschneiderte Reiserouten, Buchungsverfügbarkeit oder spezielle pharaonische Ausflüge erkundigen!"
                : language === 'pl'
                ? "𓂀 Kemet Tours - Wspierane przez Mas international Agency 𓂀\n\nWitaj Pisarzu! Odwiedzam Twój panel świątynny i chciałbym zapytać o spersonalizowane plany podróży, dostępność rezerwacji lub specjalne wycieczki faraońskie!"
                : language === 'cs'
                ? "𓂀 Kemet Tours - S podporou Mas international Agency 𓂀\n\nZdravím Vás, písaři! Navštěvuji Váš chrámový panel a rád bych se zeptal na individuální itineráře, dostupnost rezervací nebo speciální faraonské výlety!"
                : "𓂀 Kemet Tours - Powered by Mas international Agency 𓂀\n\nGreetings Scribe! I am visiting your temple dashboard and would like to inquire about customized itineraries, booking availability, or special Pharaonic excursions!";
              const url = `https://wa.me/201202181834?text=${encodeURIComponent(msg)}`;
              window.open(url, '_blank') || (window.location.href = url);
            }}
            className="bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] border-2 border-[#d4af37] relative group cursor-pointer"
            title={language === 'de' ? "Sofortige WhatsApp-Beratung" : language === 'pl' ? "Natychmiastowa konsultacja WhatsApp" : language === 'cs' ? "Okamžitá konzultace na WhatsApp" : "Instant WhatsApp Consultation"}
          >
            {/* Pulsing indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
            </span>

            {/* Icon */}
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>

            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-3 scale-0 transition-all rounded bg-stone-900 border border-[#d4af37] px-3 py-1.5 text-[10px] font-mono text-[#e6c280] uppercase tracking-wider whitespace-nowrap group-hover:scale-100 z-50 shadow-2xl">
              {language === 'de' ? '𓂀 Chatte mit dem Hohenpriester (+201202181834)' : language === 'pl' ? '𓂀 Porozmawiaj z Arcykapłanem (+201202181834)' : language === 'cs' ? '𓂀 Promluvte si s veleknězem (+201202181834)' : '𓂀 Chat with High Priest (+201202181834)'}
            </span>
          </motion.button>
        </div>

        {/* Golden Scarab Particle Celebration Overlay */}
        <ScarabCelebration triggerCount={celebrationCount} />

        {/* Papyrus Scroll Unrolling Celebration Overlay */}
        <AnimatePresence>
          {newlyCreatedBooking && (
            <PapyrusScrollCelebration
              booking={newlyCreatedBooking}
              onClose={() => setNewlyCreatedBooking(null)}
            />
          )}
        </AnimatePresence>

        {/* Sacred Travel Departure Reminder Modal Overlay */}
        <AnimatePresence>
          {activeReminders.length > 0 && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-[#15110d] border-4 border-double border-[#d4af37] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.3)] text-center relative overflow-hidden"
              >
                {/* Visual Theme Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Ancient Seal Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-amber-950/20 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-2xl text-[#d4af37] shadow-inner mb-4 animate-pulse">
                  𓋹
                </div>

                <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block mb-1">
                  {language === 'de' ? 'Heilige Abreisewarnung' : language === 'pl' ? 'Święte ostrzeżenie przed wyjazdem' : language === 'cs' ? 'Posvátné varování před odjezdem' : 'Sacred Departure Warning'}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wide">
                  {language === 'de' ? 'Expedition bricht morgen auf' : language === 'pl' ? 'Ekspedycja wyrusza jutro' : language === 'cs' ? 'Expedice odjíždí zítra' : 'Expedition Departing Tomorrow'}
                </h3>

                <div className="my-5 border-y border-[#d4af37]/10 py-4 text-left space-y-3 max-h-[40vh] overflow-y-auto">
                  {activeReminders.map(booking => (
                    <div key={booking.id} className="bg-amber-950/20 border border-[#d4af37]/15 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-serif text-xs font-bold text-[#e6c280] uppercase leading-snug">
                          {booking.excursionTitle}
                        </span>
                        <span className="font-mono text-[9px] bg-[#2a2016] text-[#d4af37] border border-[#d4af37]/20 px-2 py-0.5 rounded uppercase">
                          {booking.status}
                        </span>
                      </div>
                      
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        {language === 'de' ? (
                          <>Seid gegrüßt, edler Reisender <span className="text-[#e6c280] font-semibold">{booking.travelerName}</span>. Ihre Karawane soll am <span className="text-[#d4af37] font-semibold font-mono">{booking.date}</span> aufbrechen (in weniger als 24 Stunden).</>
                        ) : language === 'pl' ? (
                          <>Witaj, szlachetny podróżniku <span className="text-[#e6c280] font-semibold">{booking.travelerName}</span>. Twoja karawana wyrusza w dniu <span className="text-[#d4af37] font-semibold font-mono">{booking.date}</span> (za mniej niż 24 godziny).</>
                        ) : language === 'cs' ? (
                          <>Zdravíme Vás, vznešený cestovateli <span className="text-[#e6c280] font-semibold">{booking.travelerName}</span>. Vaše karavana má odjet <span className="text-[#d4af37] font-semibold font-mono">{booking.date}</span> (za méně než 24 hodin).</>
                        ) : (
                          <>Greetings, noble traveler <span className="text-[#e6c280] font-semibold">{booking.travelerName}</span>. Your caravan is scheduled to depart on <span className="text-[#d4af37] font-semibold font-mono">{booking.date}</span> (less than 24 hours from now).</>
                        )}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-stone-400 pt-1">
                        <span className="text-[#d4af37]">𓀚</span>
                        <span>{language === 'de' ? `Gäste: ${booking.numberOfGuests} • Kosten: $${booking.totalCost}` : language === 'pl' ? `Goście: ${booking.numberOfGuests} • Koszt: $${booking.totalCost}` : language === 'cs' ? `Hosté: ${booking.numberOfGuests} • Náklady: $${booking.totalCost}` : `Guests: ${booking.numberOfGuests} • Cost: $${booking.totalCost}`}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-stone-400 text-[11px] leading-relaxed mb-6 italic">
                  {language === 'de' 
                    ? '"Stellt sicher, dass eure Schläuche voll und eure Sonnenschilde bereit sind, denn Ra scheint heiß auf das Tal."'
                    : language === 'pl'
                    ? '"Upewnij się, że Twoje bukłaki na wodę są pełne, a osłony przeciwsłoneczne gotowe, ponieważ Ra mocno świeci nad doliną."'
                    : language === 'cs'
                    ? '"Ujistěte se, že jsou vaše měchy na vodu plné a sluneční štíty připravené, neboť Re pálí nad údolím."'
                    : '"Ensure your water skins are full and your sun shields are ready, for Ra shines hot upon the valley."'}
                </p>

                <button
                  onClick={() => {
                    // Dismiss all active reminders shown
                    activeReminders.forEach(booking => handleDismissReminder(booking.id));
                  }}
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e6c280] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {language === 'de' ? 'Ich bin bereit (Warnung schließen)' : language === 'pl' ? 'Jestem gotów (Zamknij ostrzeżenie)' : language === 'cs' ? 'Jsem připraven (Zavřít varování)' : 'I am Prepared (Dismiss Alert)'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
