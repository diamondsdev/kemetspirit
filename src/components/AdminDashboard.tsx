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
  Check,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings,
  Briefcase,
  Layers,
  ChevronDown,
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  ThumbsUp,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  LogOut,
  ExternalLink,
  Lock,
  Unlock,
  Camera,
  QrCode,
  Printer
} from 'lucide-react';
import { Booking, Excursion, Review, ScribeMessage, SecurityAuditLog } from '../types';
import { useLanguage } from './LanguageContext';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/firebaseAuth';
import { createKemetSpreadsheet, syncTablesToSpreadsheet, importExcursionsFromSpreadsheet, importBookingsFromSpreadsheet } from '../lib/googleSheets';
import BookingAnalytics from './BookingAnalytics';
import TicketScanner from './TicketScanner';

// Initial Excursions from Catalog for fallback
const INITIAL_EXCURSIONS_DATA: Excursion[] = [
  {
    id: 'diving-1',
    title: "Ras Mohammed Royal Coral Diving",
    tagline: "Explore the sunken statues of the sea god Nun",
    category: 'diving',
    duration: "Full Day (8 Hours)",
    price: 120,
    rating: 4.9,
    location: "Red Sea, Egypt (Ras Mohammed National Park)",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    description: "Plunge into the deep turquoise kingdom of Nun, the primordial waters of Egyptian lore. This professional-led scuba diving excursion guides you past vertical coral walls, hammerhead sanctuaries, and a breathtaking submerged field of hand-carved Pharaonic stone monuments resting on the seabed.",
    inclusions: [
      "All high-quality diving equipment (scuba tanks, wetsuits, regulators)",
      "Two deep dives with certified Egyptian Egyptologist-Divers",
      "Traditional open-deck yacht lunch cooked by maritime Bedouins",
      "Hotel pick-up & drop-off in Hurghada or Sharm El Sheikh"
    ],
    highlights: [
      "Swim alongside giant Napoleon fish & sea turtles",
      "Unveil the underwater stone sanctuary of Anubis & Ramses",
      "Professional underwater video and photography package"
    ],
    ancientLore: "Ancient priests of the Red Sea wrote of 'Nun'—the source of all life. They believed that submerged stone statues kept the ocean spirits pacified, ensuring safe passage for Queen Hatshepsut's trade caravans navigating to the mythical land of Punt."
  },
  {
    id: 'safari-1',
    title: "Set's Golden Deshret Safari",
    tagline: "Race quad bikes and trek camels across the red dunes",
    category: 'safari',
    duration: "Half Day (6 Hours)",
    price: 75,
    rating: 4.8,
    location: "Sinai Desert, Egypt (Hurghada Outskirts)",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    description: "Race high-performance quad bikes over rolling sand ripples before transitioning to the majestic pace of a traditional camel caravan. Conclude your voyage at a secluded, torch-lit Bedouin oasis, enjoying hibiscus tea, fireside lore, and powerful telescope stargazing into the starry canopy of Nut.",
    inclusions: [
      "Premium Quad Bike (ATV) and safety gear",
      "Traditional 30-minute sunrise/sunset camel trek",
      "Secluded Bedouin camp feast with flatbread baking masterclass",
      "Egyptologist-led telescope stargazing and celestial alignment talk"
    ],
    highlights: [
      "Conquer high sand waves at 50km/h on a quad",
      "Listen to Bedouin rababa tunes around open acacia campfires",
      "Trace the constellation Sah (Orion) under the guidance of our oracle stargazers"
    ],
    ancientLore: "The red desert was called 'Deshret' by Pharaohs, ruled by Set, the god of storms. Ancient miners traversed these dunes under the guard of the King's archers to secure Sinai's copper and turquoise, marking key rocks with cartouches to guarantee their return."
  },
  {
    id: 'history-1',
    title: "Pharaoh's Pilgrimage to Waset (Luxor)",
    tagline: "Unlock the tombs of Valley of the Kings & Karnak",
    category: 'history',
    duration: "Full Day (14 Hours)",
    price: 180,
    rating: 4.95,
    location: "Luxor (Ancient Waset), Egypt",
    image: "/src/assets/images/egypt_luxor_temple_1784070393047.jpg",
    description: "Cross the Sinai mountains to the rich Nile Valley. Arrive in ancient Waset (Luxor), capital of the New Kingdom, where you will wander the gargantuan column halls of Karnak, descend into the painted royal vaults of the Valley of the Kings, and stand in awe before the Colossi of Memnon.",
    inclusions: [
      "Private luxury chariot (Mercedes minibus) transport from Red Sea coast",
      "VIP tickets to 3 Royal Tombs in the Valley of the Kings",
      "Guided tour of Karnak Temple & Hatshepsut's Temple",
      "Traditional Egyptian lunch on a private island on the Nile River"
    ],
    highlights: [
      "Touch the hieroglyphs of the giant Hypostyle Hall in Karnak",
      "Descend into Tutankhamun's resting chamber",
      "A scenic sunset Felucca cruise down the life-giving Nile"
    ],
    ancientLore: "To cross from the East Bank to the West Bank of Luxor is to traverse the veil between the living and the dead. The Pharaohs carved their tombs deep inside mountain crevices to match the setting of Ra, assuring resurrection into the eternal fields of Aaru."
  },
  {
    id: 'boat-1',
    title: "Sobek's Royal Queen Nefertari Cruise",
    tagline: "Sail past Giftun Island aboard our gold-appointed yacht",
    category: 'boat',
    duration: "Full Day (7 Hours)",
    price: 95,
    rating: 4.85,
    location: "Hurghada, Red Sea, Egypt",
    image: "/src/assets/images/egypt_boat_trip_1784071711626.jpg",
    description: "Sail upon the shimmering turquoise empire of Sobek in absolute luxury. Relax on the double-tiered sun-decks of our royal wooden yacht as we voyage toward Giftun Island. Feast on a fresh sea-tribute banquet cooked by your private onboard chefs, swim in pristine shallow lagoons, and snorkel amidst vibrant coral clusters.",
    inclusions: [
      "All high-quality snorkeling gear and safety vests",
      "Gourmet seafood and traditional mezze buffet cooked onboard",
      "Unlimited fresh juices, Egyptian coffee, and Bedouin mint tea",
      "Round-trip air-conditioned VIP van transfer"
    ],
    highlights: [
      "Snorkel the pristine lagoons of Giftun Orange Bay",
      "Sunbathe on comfortable golden leather lounge beds",
      "Spot playful Red Sea dolphins dancing alongside the bow"
    ],
    ancientLore: "The Nile and the seas were overseen by Sobek, the patron of water and fertility. Ancient Egyptian kings launched cedarwood pleasure barges covered in gold leaf to honor the water spirits, believing that a joyful voyage over the sea ensured good harvest and divine favor from Osiris."
  },
  {
    id: 'speedboat-1',
    title: "Horus's Falcon Eye Speedboat Cruise",
    tagline: "Unleash adrenaline at high speeds across secret islands",
    category: 'speedboat',
    duration: "Half Day (4 Hours)",
    price: 150,
    rating: 4.9,
    location: "El Gouna & Red Sea Islands, Egypt",
    image: "/src/assets/images/egypt_speedboat_1784071721552.jpg",
    description: "Soar across the waves of the Red Sea like the sacred sky falcon Horus. This premium speedboat voyage lets you bypass the slow yachts and dive straight into the most secluded, untouched island reefs of the Red Sea. Tailor your route, stop at uninhabited sandbanks, and experience the thrill of high-speed pharaonic transport.",
    inclusions: [
      "Private high-speed luxury yacht/speedboat with professional captain",
      "Premium snorkeling kits and underwater action cameras",
      "Gourmet refreshments and iced organic hibiscus elixir",
      "VIP hotel pickup with private modern sedan"
    ],
    highlights: [
      "Fly across the turquoise waters at thrilling speeds",
      "Private custom stops at uninhabited sandbars for solitary swims",
      "Explore hidden coral gardens unknown to the public"
    ],
    ancientLore: "Horus, the falcon-headed lord of skies, was famous for his unmatched speed and piercing vision. Pharaonic scouts used swift reed skiffs to patrol the shores with falcon-like swiftness, communicating back to the royal temples via mirrored light signals."
  }
];

export interface TravelerCRMProfile {
  id: string;
  name: string;
  email: string;
  vipTier: 'Noble' | 'High Priest' | 'Royal Prince' | 'Pharaoh';
  leadStatus: 'Warm Prospect' | 'Deposited Pilgrim' | 'Eternal Royal Traveler' | 'Closed Lost';
  totalSpend: number;
  lastActive: string;
  scribeNotes: string;
  inquiriesCount: number;
}

const INITIAL_CRM_PROFILES: TravelerCRMProfile[] = [
  {
    id: 'crm-1',
    name: "Cleopatra the Diver",
    email: "cleo.ocean@royal-kemet.com",
    vipTier: "Pharaoh",
    leadStatus: "Eternal Royal Traveler",
    totalSpend: 540,
    lastActive: "2026-06-20",
    scribeNotes: "Deep love for scuba diving in Ras Mohammed. Prefers private maritime escorts and certified Egyptologist guides.",
    inquiriesCount: 5
  },
  {
    id: 'crm-2',
    name: "Ramses the Nomad",
    email: "ramses.great@deshret-safaris.org",
    vipTier: "Royal Prince",
    leadStatus: "Deposited Pilgrim",
    totalSpend: 225,
    lastActive: "2026-07-01",
    scribeNotes: "Excellent quad driver. Demands premium organic Bedouin flatbread and high-magnification astronomical equipment for celestial stargazing.",
    inquiriesCount: 3
  },
  {
    id: 'crm-3',
    name: "Hatshepsut the Explorer",
    email: "hatshepsut@luxor-tours.net",
    vipTier: "High Priest",
    leadStatus: "Deposited Pilgrim",
    totalSpend: 360,
    lastActive: "2026-07-11",
    scribeNotes: "Interested in the architectural history of Hatshepsut Temple. Booked sunset Felucca with a private harpist.",
    inquiriesCount: 4
  },
  {
    id: 'crm-4',
    name: "Nefertiti Noble",
    email: "nefertiti.beauty@beauty-kemet.com",
    vipTier: "Noble",
    leadStatus: "Warm Prospect",
    totalSpend: 0,
    lastActive: "2026-07-14",
    scribeNotes: "Looking for an immersive couples retreat. Interested in both Ras Mohammed marine life and Luxor historical tombs.",
    inquiriesCount: 2
  }
];

const INITIAL_SECURITY_LOGS: SecurityAuditLog[] = [
  {
    id: 'sec-log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    eventType: 'AUTH_SANCTUARY_ACCESS',
    action: 'High Priest Sanctuary Login Verified',
    userRole: 'High Priest Admin',
    ipAddress: '192.168.1.100 (Gateway)',
    status: 'SUCCESS',
    details: 'Verified with PBKDF2 token & admin passcode. Sanctuary vault unlocked.'
  },
  {
    id: 'sec-log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    eventType: 'BOOKING_LEDGER_SYNC',
    action: 'Caravan Status Confirmed',
    userRole: 'High Priest Admin',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    details: 'Booking #BK-9482 status updated to Confirmed. Confirmation scroll dispatched.'
  },
  {
    id: 'sec-log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    eventType: 'SHEETS_INTEGRATION_SYNC',
    action: 'Google Sheets Divine Ledger Export',
    userRole: 'High Priest Admin',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    details: 'Synchronized active tables to Google Sheets.'
  },
  {
    id: 'sec-log-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    eventType: 'CRM_PROFILE_MODIFIED',
    action: 'Traveler CRM Scribe Notes Updated',
    userRole: 'High Priest Admin',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    details: 'Updated profile for Cleopatra the Diver (ID: crm-1).'
  },
  {
    id: 'sec-log-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    eventType: 'SECURITY_VAULT_LOCK',
    action: 'Sanctuary Vault Locked & Token Revoked',
    userRole: 'High Priest Admin',
    ipAddress: '192.168.1.100',
    status: 'REVOKED',
    details: 'High Priest session locked manually. Admin passcode token purged.'
  }
];

interface AdminDashboardProps {
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
  onCancelBooking: (id: string) => void;
  onUpdateBookingsList: (updated: Booking[]) => void;
  onVerifyCheckIn?: (id: string) => void;
}

type CRMTab = 'dashboard' | 'caravans' | 'nobles' | 'offerings' | 'testimonies' | 'oracle' | 'subscribers' | 'sheets' | 'analytics' | 'security';

export default function AdminDashboard({
  bookings,
  onUpdateBookingStatus,
  onCancelBooking,
  onUpdateBookingsList,
  onVerifyCheckIn
}: AdminDashboardProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CRMTab>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Security Audit Logs state
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem('kemet_security_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SECURITY_LOGS;
      }
    }
    return INITIAL_SECURITY_LOGS;
  });
  const [securitySearch, setSecuritySearch] = useState<string>('');
  const [securityFilterStatus, setSecurityFilterStatus] = useState<string>('all');

  const addSecurityAuditLog = (
    eventType: string,
    action: string,
    status: 'SUCCESS' | 'WARNING' | 'REVOKED' | 'FAILED' = 'SUCCESS',
    details: string = ''
  ) => {
    const newLog: SecurityAuditLog = {
      id: `sec-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType,
      action,
      userRole: 'High Priest Admin',
      ipAddress: '192.168.1.100 (Gateway)',
      status,
      details
    };
    setSecurityLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem('kemet_security_audit_logs', JSON.stringify(updated.slice(0, 100)));
      return updated;
    });
  };

  const handleExportSecurityLogs = () => {
    try {
      const headers = ['Log_ID', 'Timestamp', 'Event_Type', 'Action', 'User_Role', 'IP_Address', 'Status', 'Details'];
      const csvRows = [headers.join(',')];

      securityLogs.forEach((log) => {
        const row = [
          `"${(log.id || '').replace(/"/g, '""')}"`,
          `"${(log.timestamp || '').replace(/"/g, '""')}"`,
          `"${(log.eventType || '').replace(/"/g, '""')}"`,
          `"${(log.action || '').replace(/"/g, '""')}"`,
          `"${(log.userRole || '').replace(/"/g, '""')}"`,
          `"${(log.ipAddress || '').replace(/"/g, '""')}"`,
          `"${(log.status || '').replace(/"/g, '""')}"`,
          `"${(log.details || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `kemet_security_audit_logs_${dateStr}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      triggerNotification("Security audit logs exported to CSV successfully!");

      addSecurityAuditLog('SECURITY_AUDIT_EXPORT', 'Exported Security Audit Logs CSV', 'SUCCESS', `Exported ${securityLogs.length} audit log entries.`);
    } catch (err: any) {
      console.error("Export security logs failed:", err);
      triggerNotification("Failed to export security logs");
    }
  };

  // Google Sheets integration state
  const [gUser, setGUser] = useState<any>(null);
  const [gToken, setGToken] = useState<string | null>(null);
  const [isGAuthLoading, setIsGAuthLoading] = useState<boolean>(true);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('kemet_active_spreadsheet_id') || '';
  });
  const [activeSpreadsheetUrl, setActiveSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('kemet_active_spreadsheet_url') || '';
  });
  const [selectedSyncTables, setSelectedSyncTables] = useState<Record<string, boolean>>({
    bookings: true,
    subscribers: true,
    excursions: true,
    crmProfiles: true,
    oracleLogs: true
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Real-Time 'Kemet Bookings' Google Sheet visual sync indicator state
  const [lastSheetSyncTime, setLastSheetSyncTime] = useState<string>('Just now');
  const [isRealTimeSyncing, setIsRealTimeSyncing] = useState<boolean>(false);
  const [realTimeSyncToast, setRealTimeSyncToast] = useState<string | null>(null);
  const [prevBookingsCount, setPrevBookingsCount] = useState<number>(bookings.length);

  // Monitor bookings for real-time additions to update the indicator & trigger feedback
  useEffect(() => {
    if (bookings.length > prevBookingsCount) {
      setIsRealTimeSyncing(true);
      setRealTimeSyncToast(`⚡ Real-Time Sync: New booking pushed to 'Kemet Bookings' Sheet! (${bookings.length} total rows)`);
      
      const timer = setTimeout(() => {
        setIsRealTimeSyncing(false);
        setLastSheetSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setTimeout(() => setRealTimeSyncToast(null), 6000);
      }, 1200);

      setPrevBookingsCount(bookings.length);
      return () => clearTimeout(timer);
    } else if (bookings.length !== prevBookingsCount) {
      setPrevBookingsCount(bookings.length);
    }
  }, [bookings.length, prevBookingsCount]);

  // Handle explicit real-time refresh from server & sheets
  const handleFetchAndSyncRealtimeSheet = React.useCallback(async () => {
    setIsRealTimeSyncing(true);
    try {
      const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
      const res = await fetch('/api/bookings', {
        headers: { 'x-admin-passcode': passcode }
      });
      if (res.ok) {
        const latestBookings = await res.json();
        onUpdateBookingsList(latestBookings);
        setLastSheetSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      // silent catch for background auto-sync
    } finally {
      setTimeout(() => {
        setIsRealTimeSyncing(false);
      }, 1000);
    }
  }, [onUpdateBookingsList]);

  // Periodic Auto-Sync for Admin Dashboard
  useEffect(() => {
    handleFetchAndSyncRealtimeSheet();
    const interval = setInterval(() => {
      handleFetchAndSyncRealtimeSheet();
    }, 30000); // Auto sync every 30 seconds
    return () => clearInterval(interval);
  }, [handleFetchAndSyncRealtimeSheet]);

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

  // Sync to local storage
  useEffect(() => {
    if (activeSpreadsheetId) {
      localStorage.setItem('kemet_active_spreadsheet_id', activeSpreadsheetId);
    } else {
      localStorage.removeItem('kemet_active_spreadsheet_id');
    }
  }, [activeSpreadsheetId]);

  useEffect(() => {
    if (activeSpreadsheetUrl) {
      localStorage.setItem('kemet_active_spreadsheet_url', activeSpreadsheetUrl);
    } else {
      localStorage.removeItem('kemet_active_spreadsheet_url');
    }
  }, [activeSpreadsheetUrl]);

  // Trigger google sheet export
  const handleExportToSheets = async () => {
    if (!gToken) {
      setSyncStatus('error');
      setSyncMessage('Scribe must be logged into Google Account first.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('Connecting to Google Sheets and synchronizing tablets...');

    try {
      let spreadId = activeSpreadsheetId;
      let spreadUrl = activeSpreadsheetUrl;

      // Create new spreadsheet if we don't have one
      if (!spreadId) {
        const { id, url } = await createKemetSpreadsheet(gToken);
        spreadId = id;
        spreadUrl = url;
        setActiveSpreadsheetId(id);
        setActiveSpreadsheetUrl(url);
      }

      // Sync active tables
      await syncTablesToSpreadsheet(gToken, spreadId, {
        bookings: selectedSyncTables.bookings ? bookings : [],
        subscribers: selectedSyncTables.subscribers ? subscribers : [],
        excursions: selectedSyncTables.excursions ? excursions : [],
        crmProfiles: selectedSyncTables.crmProfiles ? crmProfiles : [],
        oracleLogs: selectedSyncTables.oracleLogs ? oracleLogs : []
      });

      setSyncStatus('success');
      setSyncMessage('Ledgers have been successfully synced to the sacred Google Sheet! 𓇛');
      triggerNotification("Divine ledgers synchronized successfully!");
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger Google Sheet import for Excursions and Bookings
  const handleImportFromSheets = async () => {
    if (!gToken) {
      setSyncStatus('error');
      setSyncMessage('Scribe must be logged into Google Account first.');
      return;
    }

    if (!activeSpreadsheetId) {
      setSyncStatus('error');
      setSyncMessage('No active Google Sheet selected for import.');
      return;
    }

    const confirmImport = window.confirm(
      "Are you sure you want to pull and overwrite Kemet Tours data with the values inside your Google Sheet? This cannot be undone."
    );
    if (!confirmImport) return;

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('Fetching data from the Google Sheet...');

    try {
      let excursionsUpdatedCount = 0;
      let bookingsUpdatedCount = 0;

      // 1. Pull Excursions if selected
      if (selectedSyncTables.excursions) {
        const importedExcursions = await importExcursionsFromSpreadsheet(gToken, activeSpreadsheetId);
        if (importedExcursions && importedExcursions.length > 0) {
          // Merge imported excursions back into excursions state, adding new ones
          const excursionMap = new Map<string, any>(excursions.map(e => [e.id, e]));
          
          importedExcursions.forEach((imported: any) => {
            const existing = excursionMap.get(imported.id);
            if (existing) {
              excursionsUpdatedCount++;
              excursionMap.set(imported.id, {
                ...existing,
                title: imported.title || existing.title,
                tagline: imported.tagline || existing.tagline,
                category: (imported.category && ['diving', 'safari', 'history', 'boat', 'speedboat'].includes(imported.category)) ? imported.category : existing.category,
                duration: imported.duration || existing.duration,
                price: imported.price || existing.price,
                rating: imported.rating || existing.rating,
                location: imported.location || existing.location,
                description: imported.description || existing.description,
                ancientLore: imported.ancientLore || existing.ancientLore,
                image: imported.image || existing.image,
                inclusions: (imported.inclusions && imported.inclusions.length > 0) ? imported.inclusions : existing.inclusions,
                highlights: (imported.highlights && imported.highlights.length > 0) ? imported.highlights : existing.highlights,
              });
            } else {
              // Create brand new excursion from spreadsheet row
              excursionsUpdatedCount++;
              excursionMap.set(imported.id, {
                id: imported.id,
                title: imported.title || 'Untitled Tour',
                tagline: imported.tagline || 'Eternally curated pharaonic voyage',
                category: (imported.category && ['diving', 'safari', 'history', 'boat', 'speedboat'].includes(imported.category)) ? imported.category : 'diving',
                duration: imported.duration || 'Full Day (8 Hours)',
                price: imported.price || 100,
                rating: imported.rating || 5.0,
                location: imported.location || 'Red Sea, Egypt',
                image: imported.image || '/src/assets/images/egypt_sea_diving_1784070366165.jpg',
                description: imported.description || 'No description provided.',
                inclusions: (imported.inclusions && imported.inclusions.length > 0) ? imported.inclusions : [
                  "Premium transport under royal flag",
                  "Certified High Priest Guides",
                  "Fresh water of the Nile"
                ],
                highlights: (imported.highlights && imported.highlights.length > 0) ? imported.highlights : [
                  "Inspect unique architectural glyphs",
                  "Engage with desert/maritime local tribes"
                ],
                ancientLore: imported.ancientLore || 'This sacred terrain was aligned by Imhotep to match the solar zenith, granting safety to all travelers under the eye of Horus.'
              });
            }
          });

          const updatedExcursions = Array.from(excursionMap.values());

          // Push in bulk to the backend server to persist in kemet_db.json
          const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
          const adminToken = localStorage.getItem('kemet_admin_token') || '';
          try {
            const response = await fetch('/api/excursions/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-passcode': passcode,
                'x-admin-token': adminToken
              },
              body: JSON.stringify(updatedExcursions)
            });
            if (response.ok) {
              const serverExcursions = await response.json();
              setExcursions(serverExcursions);
              localStorage.setItem('kemet_excursions', JSON.stringify(serverExcursions));
              window.dispatchEvent(new Event('kemet_excursions_updated'));
            } else {
              setExcursions(updatedExcursions);
              localStorage.setItem('kemet_excursions', JSON.stringify(updatedExcursions));
              window.dispatchEvent(new Event('kemet_excursions_updated'));
            }
          } catch (err) {
            console.error("Failed to sync bulk excursions with server:", err);
            setExcursions(updatedExcursions);
            localStorage.setItem('kemet_excursions', JSON.stringify(updatedExcursions));
            window.dispatchEvent(new Event('kemet_excursions_updated'));
          }
        }
      }

      // 2. Pull Bookings status if selected
      if (selectedSyncTables.bookings) {
        const importedBookings = await importBookingsFromSpreadsheet(gToken, activeSpreadsheetId);
        if (importedBookings && importedBookings.length > 0) {
          const updatedBookings = bookings.map(b => {
            const imported = importedBookings.find((ib: any) => ib.id === b.id);
            if (imported) {
              bookingsUpdatedCount++;
              return {
                ...b,
                status: imported.status as Booking['status'] || b.status
              };
            }
            return b;
          });
          onUpdateBookingsList(updatedBookings);
        }
      }

      setSyncStatus('success');
      setSyncMessage(
        `Import complete! Updated ${excursionsUpdatedCount} Excursions and ${bookingsUpdatedCount} Booking statuses from the Google Sheet!`
      );
      triggerNotification("Divine ledgers updated from Google Sheet!");
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(`Import failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Subscribers state
  const [subscribers, setSubscribers] = useState<any[]>(() => {
    const saved = localStorage.getItem('kemet_newsletter_signups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const INITIAL_SUBS = [
      {
        id: 'sub-seed-1',
        email: 'alexander.great@macedon.org',
        interests: ['diving', 'history'],
        tier: 'pharaoh',
        signupDate: '2026-07-10',
        promoCode: 'RAMSES-8821-30'
      },
      {
        id: 'sub-seed-2',
        email: 'hypatia.scribe@alexandrialibrary.edu',
        interests: ['history'],
        tier: 'scribe',
        signupDate: '2026-07-12',
        promoCode: 'RAMSES-1029-30'
      }
    ];
    localStorage.setItem('kemet_newsletter_signups', JSON.stringify(INITIAL_SUBS));
    return INITIAL_SUBS;
  });

  // Synchronize subscribers from server API & local storage
  const fetchServerSubscribers = React.useCallback(async () => {
    const saved = localStorage.getItem('kemet_newsletter_signups');
    let localList: any[] = [];
    if (saved) {
      try {
        localList = JSON.parse(saved);
      } catch (e) {
        localList = [];
      }
    }

    try {
      const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
      const adminToken = localStorage.getItem('kemet_admin_token') || '';
      const res = await fetch('/api/newsletter', {
        headers: {
          'x-admin-passcode': passcode,
          'x-admin-token': adminToken
        }
      });
      if (res.ok) {
        const serverSubs = await res.json();
        if (Array.isArray(serverSubs)) {
          // Merge server signups with any local signups by email key
          const subMap = new Map<string, any>();
          serverSubs.forEach(s => subMap.set(s.email.toLowerCase(), s));
          localList.forEach(l => {
            if (!subMap.has(l.email.toLowerCase())) {
              subMap.set(l.email.toLowerCase(), l);
            }
          });
          const merged = Array.from(subMap.values());
          setSubscribers(merged);
          localStorage.setItem('kemet_newsletter_signups', JSON.stringify(merged));
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch server newsletter subscribers:", e);
    }

    if (localList.length > 0) {
      setSubscribers(localList);
    }
  }, []);

  useEffect(() => {
    fetchServerSubscribers();
    window.addEventListener('kemet_subscribers_updated', fetchServerSubscribers);
    return () => {
      window.removeEventListener('kemet_subscribers_updated', fetchServerSubscribers);
    };
  }, [fetchServerSubscribers]);

  // Core CRM States backed by localStorage
  const [excursions, setExcursions] = useState<Excursion[]>(() => {
    const saved = localStorage.getItem('kemet_excursions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Excursion[];
        const merged = [...parsed];
        INITIAL_EXCURSIONS_DATA.forEach(initial => {
          if (!merged.some(ex => ex.id === initial.id)) {
            merged.push(initial);
          }
        });
        return merged;
      } catch (e) {
        return INITIAL_EXCURSIONS_DATA;
      }
    }
    return INITIAL_EXCURSIONS_DATA;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kemet_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [crmProfiles, setCrmProfiles] = useState<TravelerCRMProfile[]>(() => {
    const saved = localStorage.getItem('kemet_crm_profiles');
    if (saved) return JSON.parse(saved);
    // Otherwise seed with initials plus any names from bookings
    return INITIAL_CRM_PROFILES;
  });

  const [oracleLogs, setOracleLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('kemet_oracle_chats_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-1',
        name: "Nefertiti Prospect",
        email: "nefertiti.beauty@beauty-kemet.com",
        query: "What is the ancient lore behind the sea god Nun at Ras Mohammed?",
        time: "2026-07-14 14:32"
      },
      {
        id: 'log-2',
        name: "Marc Antony Noble",
        email: "antony.rome@empire.org",
        query: "Do you have chariot tours crossing from Hurghada to Luxor for the Hypostyle Hall?",
        time: "2026-07-14 11:15"
      }
    ];
  });

  // Interactive Revenue Forecaster & Caravan Ledger Search/Filters state
  const [targetRevenue, setTargetRevenue] = useState<number>(5000);
  const [caravanSearch, setCaravanSearch] = useState<string>("");
  const [caravanStatusFilter, setCaravanStatusFilter] = useState<string>("all");

  // Edit / Add Excursion States
  const [editingExcursion, setEditingExcursion] = useState<Excursion | null>(null);
  const [isAddOfferingOpen, setIsAddOfferingOpen] = useState<boolean>(false);
  const [newExTitle, setNewExTitle] = useState<string>("");
  const [newExTagline, setNewExTagline] = useState<string>("");
  const [newExCategory, setNewExCategory] = useState<'diving' | 'safari' | 'history' | 'boat' | 'speedboat'>("diving");
  const [newExDuration, setNewExDuration] = useState<string>("Full Day (8 Hours)");
  const [newExPrice, setNewExPrice] = useState<number>(100);
  const [newExLocation, setNewExLocation] = useState<string>("Red Sea, Egypt");
  const [newExImage, setNewExImage] = useState<string>("/src/assets/images/egypt_sea_diving_1784070366165.jpg");
  const [newExDesc, setNewExDesc] = useState<string>("");
  const [newExLore, setNewExLore] = useState<string>("");
  const [newExInclusions, setNewExInclusions] = useState<string>("Premium transport under royal flag; Certified High Priest Guides; Fresh water of the Nile");
  const [newExHighlights, setNewExHighlights] = useState<string>("Inspect unique architectural glyphs; Engage with desert/maritime local tribes");

  // Traveler CRM Edit / Add States
  const [editingProfile, setEditingProfile] = useState<TravelerCRMProfile | null>(null);
  const [isAddProfileOpen, setIsAddProfileOpen] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>("");
  const [newProfileEmail, setNewProfileEmail] = useState<string>("");
  const [newProfileVipTier, setNewProfileVipTier] = useState<'Noble' | 'High Priest' | 'Royal Prince' | 'Pharaoh'>('Noble');
  const [newProfileLeadStatus, setNewProfileLeadStatus] = useState<'Warm Prospect' | 'Deposited Pilgrim' | 'Eternal Royal Traveler' | 'Closed Lost'>('Warm Prospect');
  const [newProfileNotes, setNewProfileNotes] = useState<string>("");
  const [filterVip, setFilterVip] = useState<string>("all");
  const [filterLead, setFilterLead] = useState<string>("all");
  const [crmSearch, setCrmSearch] = useState<string>("");

  // Feedback Notification
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Bulk Actions selection state for Caravan Ledger
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Internal notes modal state for bookings
  const [activeNoteModalBooking, setActiveNoteModalBooking] = useState<Booking | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>('');

  // Clear selected bookings whenever the active tab or caravan filters change
  useEffect(() => {
    setSelectedBookingIds([]);
  }, [activeTab, caravanStatusFilter]);

  // Sync state helpers
  const triggerNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveBookingInternalNote = () => {
    if (!activeNoteModalBooking) return;
    const updatedBookings = bookings.map(b =>
      b.id === activeNoteModalBooking.id
        ? { ...b, internalNotes: noteInputText.trim() }
        : b
    );
    onUpdateBookingsList(updatedBookings);
    triggerNotification(`Internal note updated for booking #${activeNoteModalBooking.id.slice(-4)}!`);
    setActiveNoteModalBooking(null);
    setNoteInputText('');
  };

  const handleBulkApprove = () => {
    if (selectedBookingIds.length === 0) return;
    
    let count = 0;
    const updated = bookings.map(b => {
      if (selectedBookingIds.includes(b.id)) {
        if (b.status === 'Pending Oracle Approval') {
          count++;
          return { ...b, status: 'Confirmed by High Priest' as const };
        } else if (b.status === 'Confirmed by High Priest') {
          count++;
          return { ...b, status: 'Completed' as const };
        }
      }
      return b;
    });

    onUpdateBookingsList(updated);
    setSelectedBookingIds([]);
    triggerNotification(`Approved & advanced ${count} selected bookings!`);
  };

  const handleBulkCancel = () => {
    if (selectedBookingIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedBookingIds.length} selected bookings from the sacred ledger?`)) {
      const count = selectedBookingIds.length;
      const updated = bookings.filter(b => !selectedBookingIds.includes(b.id));
      onUpdateBookingsList(updated);
      setSelectedBookingIds([]);
      triggerNotification(`Banished ${count} selected bookings from ledger`);
    }
  };

  const handleDownloadCSV = () => {
    if (bookings.length === 0) {
      triggerNotification("No bookings available in the sacred ledger to export.", "info");
      return;
    }
    const headers = [
      "Booking ID",
      "Excursion Title",
      "Traveler Name",
      "Traveler Email",
      "Phone Number",
      "WhatsApp Number",
      "Hotel Name",
      "Room Number",
      "Passage Date",
      "Pickup Time",
      "Guests Count",
      "Total Cost ($)",
      "Promo Code",
      "Discount ($)",
      "Status",
      "Internal Notes",
      "Checked In",
      "Created At"
    ];

    const rows = bookings.map(b => [
      `"${(b.id || '').replace(/"/g, '""')}"`,
      `"${(b.excursionTitle || '').replace(/"/g, '""')}"`,
      `"${(b.travelerName || '').replace(/"/g, '""')}"`,
      `"${(b.travelerEmail || '').replace(/"/g, '""')}"`,
      `"${(b.phoneNumber || '').replace(/"/g, '""')}"`,
      `"${(b.whatsappNumber || '').replace(/"/g, '""')}"`,
      `"${(b.hotelName || '').replace(/"/g, '""')}"`,
      `"${(b.roomNumber || '').replace(/"/g, '""')}"`,
      `"${(b.date || '').replace(/"/g, '""')}"`,
      `"${(b.pickupTime || '').replace(/"/g, '""')}"`,
      b.numberOfGuests || 1,
      b.totalCost || 0,
      `"${(b.promoCodeUsed || '').replace(/"/g, '""')}"`,
      b.discountAmount || 0,
      `"${(b.status || '').replace(/"/g, '""')}"`,
      `"${(b.internalNotes || '').replace(/"/g, '""')}"`,
      b.checkedIn ? 'Yes' : 'No',
      `"${(b.createdAt || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Kemet_Caravan_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotification("Caravan bookings exported to CSV file successfully!");
  };

  const handleDownloadManifest = () => {
    if (bookings.length === 0) {
      triggerNotification("No bookings available in the sacred ledger to generate a manifest.", "info");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerNotification("Please allow pop-ups to open the High Priest's Guest Manifest PDF print view.", "info");
      return;
    }

    const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalCost) || 0), 0);
    const uniqueTravelers = new Set(bookings.map(b => (b.travelerEmail || b.travelerName || '').toLowerCase().trim()).filter(Boolean)).size;
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed by High Priest' || b.status === 'Completed').length;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const manifestHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kemet Caravan Expeditions - High Priest Guest Manifest</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            
            @page {
              size: A4 landscape;
              margin: 12mm;
            }

            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              background-color: #120e0b;
              color: #f3e5c8;
              margin: 0;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }

            .logo-title {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .title-group h1 {
              font-family: 'Cinzel', serif;
              color: #d4af37;
              margin: 0;
              font-size: 22px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            .title-group p {
              margin: 2px 0 0 0;
              font-size: 11px;
              color: #a89f91;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }

            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #d4af37;
              font-family: monospace;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }

            .stat-card {
              background: #1c1611;
              border: 1px solid rgba(212, 175, 55, 0.4);
              border-radius: 8px;
              padding: 12px 16px;
            }

            .stat-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #a89f91;
              font-family: monospace;
              display: block;
            }

            .stat-value {
              font-size: 20px;
              font-weight: 800;
              color: #d4af37;
              font-family: 'Cinzel', serif;
              margin-top: 4px;
              display: block;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }

            th {
              background-color: #211a14;
              color: #d4af37;
              font-family: 'Cinzel', serif;
              text-align: left;
              padding: 10px;
              border-bottom: 1px solid #d4af37;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-size: 10px;
            }

            td {
              padding: 10px;
              border-bottom: 1px solid #2a221b;
              vertical-align: top;
            }

            tr:nth-child(even) {
              background-color: #17120e;
            }

            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-family: monospace;
            }

            .badge-pending {
              background: rgba(245, 158, 11, 0.2);
              color: #fcd34d;
              border: 1px solid rgba(245, 158, 11, 0.5);
            }

            .badge-confirmed {
              background: rgba(16, 185, 129, 0.2);
              color: #6ee7b7;
              border: 1px solid rgba(16, 185, 129, 0.5);
            }

            .badge-completed {
              background: rgba(168, 85, 247, 0.2);
              color: #c084fc;
              border: 1px solid rgba(168, 85, 247, 0.5);
            }

            .note-box {
              background: #241c15;
              border-left: 3px solid #d4af37;
              padding: 6px 10px;
              margin-top: 4px;
              border-radius: 0 4px 4px 0;
              color: #e6c280;
              font-size: 10px;
            }

            .footer {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px solid #2a221b;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #786d5f;
            }

            @media print {
              body {
                background-color: #ffffff !important;
                color: #1a1a1a !important;
              }

              .title-group h1 {
                color: #8a6d1a !important;
              }

              .header {
                border-bottom: 2px solid #8a6d1a !important;
              }

              .stat-card {
                background: #fdfbf7 !important;
                border: 1px solid #8a6d1a !important;
              }

              .stat-value {
                color: #8a6d1a !important;
              }

              th {
                background-color: #f5efe6 !important;
                color: #5c4710 !important;
                border-bottom: 2px solid #8a6d1a !important;
              }

              td {
                border-bottom: 1px solid #e2d9cc !important;
              }

              tr:nth-child(even) {
                background-color: #faf7f2 !important;
              }

              .note-box {
                background: #f7f3eb !important;
                border-left: 3px solid #8a6d1a !important;
                color: #4a3d1b !important;
              }

              .badge-pending {
                background: #fef3c7 !important;
                color: #92400e !important;
                border: 1px solid #f59e0b !important;
              }

              .badge-confirmed {
                background: #d1fae5 !important;
                color: #065f46 !important;
                border: 1px solid #10b981 !important;
              }

              .badge-completed {
                background: #f3e8ff !important;
                color: #6b21a8 !important;
                border: 1px solid #a855f7 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-title">
              <div style="font-size: 28px; color: #d4af37;">𓋹</div>
              <div class="title-group">
                <h1>Kemet Caravan Expeditions</h1>
                <p>High Priest Sacred Guest Manifest & Itinerary Summary</p>
              </div>
            </div>
            <div class="meta-info">
              <div><strong>Generated Date:</strong> ${dateStr}</div>
              <div><strong>Ledger Version:</strong> 2026.7.27</div>
              <div><strong>Sealed By:</strong> High Priest Temple Office</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Bookings</span>
              <span class="stat-value">${bookings.length}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Unique Travelers</span>
              <span class="stat-value">${uniqueTravelers}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Sealed / Confirmed</span>
              <span class="stat-value">${confirmedCount}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Total Ledger Value</span>
              <span class="stat-value">$${totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Excursion / Expedition</th>
                <th>Traveler Details</th>
                <th>Hotel & Pickup</th>
                <th>Date & Time</th>
                <th>Guests</th>
                <th>Total Cost</th>
                <th>Status & Internal Notes</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td style="font-family: monospace; font-weight: bold; color: #d4af37;">#${b.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <strong>${b.excursionTitle}</strong>
                    ${b.promoCodeUsed ? `<div style="font-size: 9px; color: #10b981;">Promo: ${b.promoCodeUsed} (-$${b.discountAmount || 0})</div>` : ''}
                  </td>
                  <td>
                    <strong>${b.travelerName}</strong>
                    <div style="font-size: 10px; opacity: 0.8;">${b.travelerEmail}</div>
                    <div style="font-size: 10px; opacity: 0.8;">Tel: ${b.phoneNumber || 'N/A'}</div>
                  </td>
                  <td>
                    <div><strong>${b.hotelName}</strong></div>
                    <div style="font-size: 10px; opacity: 0.8;">Room: ${b.roomNumber || 'N/A'}</div>
                  </td>
                  <td>
                    <div><strong>${b.date}</strong></div>
                    <div style="font-size: 10px; opacity: 0.8;">Pickup: ${b.pickupTime || 'Standard'}</div>
                  </td>
                  <td style="text-align: center; font-weight: bold;">${b.numberOfGuests}</td>
                  <td style="font-weight: bold; color: #34d399;">$${b.totalCost}</td>
                  <td>
                    <span class="badge ${
                      b.status === 'Pending Oracle Approval' ? 'badge-pending' :
                      b.status === 'Confirmed by High Priest' ? 'badge-confirmed' : 'badge-completed'
                    }">
                      ${b.status === 'Pending Oracle Approval' ? 'Pending' : b.status === 'Confirmed by High Priest' ? 'Confirmed' : 'Completed'}
                    </span>
                    ${b.internalNotes ? `<div class="note-box"><strong>Note:</strong> ${b.internalNotes}</div>` : ''}
                    ${b.specialRequests ? `<div style="font-size: 9px; font-style: italic; margin-top:2px;">Req: ${b.specialRequests}</div>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Confidential & Prophetic Document • Kemet Royal Expedition Archives</div>
            <div>High Priest Seal Verification: VALIDATED</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(manifestHTML);
    printWindow.document.close();
    triggerNotification("Guest Manifest print summary generated successfully!");
  };

  useEffect(() => {
    localStorage.setItem('kemet_excursions', JSON.stringify(excursions));
  }, [excursions]);

  useEffect(() => {
    localStorage.setItem('kemet_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kemet_crm_profiles', JSON.stringify(crmProfiles));
  }, [crmProfiles]);

  useEffect(() => {
    localStorage.setItem('kemet_oracle_chats_logs', JSON.stringify(oracleLogs));
  }, [oracleLogs]);

  // Compile Dynamic CRM Profiles based on new bookings automatically
  useEffect(() => {
    let updatedProfiles = [...crmProfiles];
    let profilesChanged = false;

    bookings.forEach((booking) => {
      const exists = updatedProfiles.find(
        (p) => p.email.toLowerCase() === booking.travelerEmail.toLowerCase()
      );

      if (!exists) {
        // Automatically spawn a new traveler CRM profile!
        const newProfile: TravelerCRMProfile = {
          id: `crm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: booking.travelerName,
          email: booking.travelerEmail,
          vipTier: 'Noble',
          leadStatus: 'Deposited Pilgrim',
          totalSpend: booking.totalCost,
          lastActive: booking.date,
          scribeNotes: `Automatically created from Booking of: ${booking.excursionTitle}. Special Requests listed: ${booking.specialRequests || 'None'}`,
          inquiriesCount: 1
        };
        updatedProfiles.push(newProfile);
        profilesChanged = true;
      } else {
        // Update their total spend if changed
        const currentBookingSpend = bookings
          .filter((b) => b.travelerEmail.toLowerCase() === booking.travelerEmail.toLowerCase())
          .reduce((sum, b) => sum + b.totalCost, 0);

        if (exists.totalSpend !== currentBookingSpend) {
          exists.totalSpend = currentBookingSpend;
          exists.lastActive = booking.date;
          if (exists.leadStatus === 'Warm Prospect') {
            exists.leadStatus = 'Deposited Pilgrim';
          }
          profilesChanged = true;
        }
      }
    });

    if (profilesChanged) {
      setCrmProfiles(updatedProfiles);
    }
  }, [bookings]);

  // Analytics Computations
  const totalBookingsCount = bookings.length;
  const uniqueTravelersCount = new Set(
    bookings.map((b) => (b.travelerEmail || b.travelerName || '').toLowerCase().trim()).filter(Boolean)
  ).size;
  const totalRevenueAmount = bookings.reduce((sum, b) => sum + (Number(b.totalCost) || 0), 0);

  const totalGoldCoins = bookings
    .filter((b) => b.status === 'Confirmed by High Priest' || b.status === 'Completed')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const pendingGoldCoins = bookings
    .filter((b) => b.status === 'Pending Oracle Approval')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const conversionRate = crmProfiles.length
    ? Math.round((crmProfiles.filter((p) => p.leadStatus === 'Deposited Pilgrim' || p.leadStatus === 'Eternal Royal Traveler').length / crmProfiles.length) * 100)
    : 0;

  const avgExcursionPrice = excursions.length 
    ? Math.round(excursions.reduce((sum, ex) => sum + ex.price, 0) / excursions.length) 
    : 100;

  const bookingsNeeded = Math.ceil(targetRevenue / (avgExcursionPrice || 1));

  const progressPercentage = targetRevenue > 0 
    ? Math.min(Math.round((totalGoldCoins / targetRevenue) * 100), 100) 
    : 0;

  // Review status
  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    triggerNotification("Testimony deleted from the sacred public board");
  };

  const handlePurgeAllData = async () => {
    if (window.confirm("𓋹 WARNING: You are about to initiate a TOTAL PURGE of the sacred records! This will permanently delete all customer bookings, active traveler cards, user reviews, newsletter subscriptions, and chat transcripts. This action is irreversible. Proceed?")) {
      const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
      const adminToken = localStorage.getItem('kemet_admin_token') || '';
      try {
        const response = await fetch('/api/admin/purge', {
          method: 'POST',
          headers: {
            'x-admin-passcode': passcode,
            'x-admin-token': adminToken
          }
        });
        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
        }
      } catch (err) {
        console.error("Failed to purge server database:", err);
      }

      localStorage.setItem('kemet_bookings', JSON.stringify([]));
      localStorage.setItem('kemet_reviews', JSON.stringify([]));
      localStorage.setItem('kemet_newsletter_signups', JSON.stringify([]));
      localStorage.setItem('kemet_oracle_chats_logs', JSON.stringify([]));
      localStorage.setItem('kemet_crm_profiles', JSON.stringify([]));
      localStorage.setItem('kemet_excursions', JSON.stringify(INITIAL_EXCURSIONS_DATA));

      setReviews([]);
      setCrmProfiles([]);
      setOracleLogs([]);
      setSubscribers([]);
      setExcursions(INITIAL_EXCURSIONS_DATA);
      onUpdateBookingsList([]);

      window.dispatchEvent(new Event('kemet_reviews_updated'));
      window.dispatchEvent(new Event('kemet_excursions_updated'));
      window.dispatchEvent(new Event('kemet_subscribers_updated'));

      triggerNotification("Sacred Sanctuary Cleansed! All demo data purged.", "info");
    }
  };

  const handleRestoreDivineSeeds = async () => {
    if (window.confirm("Do you wish to populate the sanctuary with premium pre-configured traveler data, reviews, and bookings for testing/presentation?")) {
      const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
      const adminToken = localStorage.getItem('kemet_admin_token') || '';
      try {
        const response = await fetch('/api/admin/seed', {
          method: 'POST',
          headers: {
            'x-admin-passcode': passcode,
            'x-admin-token': adminToken
          }
        });
        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
        }
      } catch (err) {
        console.error("Failed to seed server database:", err);
      }

      const SEED_BOOKINGS: Booking[] = [
        {
          id: 'b-seed-1',
          excursionId: 'diving-1',
          excursionTitle: 'Ras Mohammed Royal Coral Diving',
          travelerName: 'Cleopatra the Diver',
          travelerEmail: 'cleo.ocean@royal-kemet.com',
          date: '2026-07-20',
          numberOfGuests: 2,
          totalCost: 240,
          specialRequests: 'Prefers private boat transfer and certified diving guides',
          status: 'Confirmed by High Priest',
          createdAt: new Date('2026-07-10').toISOString()
        },
        {
          id: 'b-seed-2',
          excursionId: 'safari-1',
          excursionTitle: "Set's Golden Deshret Safari",
          travelerName: 'Ramses the Nomad',
          travelerEmail: 'ramses.great@deshret-safaris.org',
          date: '2026-07-22',
          numberOfGuests: 3,
          totalCost: 225,
          specialRequests: 'Demands premium quad bikes and heavy star alignments info',
          status: 'Pending Oracle Approval',
          createdAt: new Date('2026-07-12').toISOString()
        }
      ];

      const SEED_REVIEWS: Review[] = [
        {
          id: 'rev-1',
          excursionId: 'diving-1',
          author: "Cleopatra the Diver",
          avatar: "𓁠 Cleopatra the Diver",
          rating: 5,
          comment: "I plunged into Ras Mohammed and was greeted by a massive underwater statue of Osiris, surrounded by thousands of golden glassfish. Truly, Sennedjem has aligned the elements perfectly. It felt like walking through a submerged palace of the Nile!",
          date: "2026-06-20"
        },
        {
          id: 'rev-2',
          excursionId: 'safari-1',
          author: "Ramses the Nomad",
          avatar: "𓀚 Ramses the Nomad",
          rating: 5,
          comment: "Flying across the red dunes on a quad bike was as exhilarating as racing a war chariot in Kadesh! The Bedouin flatbread baked over acacia coals is delicious, and the stargazing is a true communion with Nut.",
          date: "2026-07-01"
        },
        {
          id: 'rev-3',
          excursionId: 'history-1',
          author: "Hatshepsut the Explorer",
          avatar: "𓁥 Hatshepsut the Scribe",
          rating: 5,
          comment: "Visiting the mortuary temple in Luxor left my royal caravan speechless. The columns of Karnak are so wide they command complete silence. The private Felucca cruise on the Nile at sunset was absolute bliss.",
          date: "2026-07-11"
         }
      ];

      const SEED_SUBS = [
        {
          id: 'sub-seed-1',
          email: 'alexander.great@macedon.org',
          interests: ['diving', 'history'],
          tier: 'pharaoh',
          signupDate: '2026-07-10',
          promoCode: 'RAMSES-8821-30'
        },
        {
          id: 'sub-seed-2',
          email: 'hypatia.scribe@alexandrialibrary.edu',
          interests: ['history'],
          tier: 'scribe',
          signupDate: '2026-07-12',
          promoCode: 'RAMSES-1029-30'
        }
      ];

      const SEED_ORACLE_LOGS = [
        {
          id: 'log-1',
          name: "Nefertiti Prospect",
          email: "nefertiti.beauty@beauty-kemet.com",
          query: "What is the ancient lore behind the sea god Nun at Ras Mohammed?",
          time: "2026-07-14 14:32"
        },
        {
          id: 'log-2',
          name: "Marc Antony Noble",
          email: "antony.rome@empire.org",
          query: "Do you have chariot tours crossing from Hurghada to Luxor for the Hypostyle Hall?",
          time: "2026-07-14 11:15"
        }
      ];

      localStorage.setItem('kemet_bookings', JSON.stringify(SEED_BOOKINGS));
      localStorage.setItem('kemet_reviews', JSON.stringify(SEED_REVIEWS));
      localStorage.setItem('kemet_newsletter_signups', JSON.stringify(SEED_SUBS));
      localStorage.setItem('kemet_oracle_chats_logs', JSON.stringify(SEED_ORACLE_LOGS));
      localStorage.setItem('kemet_crm_profiles', JSON.stringify(INITIAL_CRM_PROFILES));
      localStorage.setItem('kemet_excursions', JSON.stringify(INITIAL_EXCURSIONS_DATA));

      setReviews(SEED_REVIEWS);
      setCrmProfiles(INITIAL_CRM_PROFILES);
      setOracleLogs(SEED_ORACLE_LOGS);
      setSubscribers(SEED_SUBS);
      setExcursions(INITIAL_EXCURSIONS_DATA);
      onUpdateBookingsList(SEED_BOOKINGS);

      window.dispatchEvent(new Event('kemet_reviews_updated'));
      window.dispatchEvent(new Event('kemet_excursions_updated'));
      window.dispatchEvent(new Event('kemet_subscribers_updated'));

      triggerNotification("Divine seeds successfully sown inside the registry!");
    }
  };

  const handleSimulateRandomBooking = async () => {
    const randomNames = ["Anubis Voyager", "Isis Pilgrim", "Osiris Nomad", "Thoth Explorer", "Sobek Diver", "Nut Gazer"];
    const randomEmails = ["anubis@underworld.org", "isis.heals@sacred.com", "osiris.lord@aaru.net", "thoth.wisdom@library.edu", "sobek.waters@nile.com", "nut.sky@stars.org"];
    const randomRequests = ["Wants to see dolphin pods and ancient hieroglyph marks", "Requires cold water at all stops", "Prefers early morning desert departures", "Wishes to have an extra scroll copy", "Vegetarian food options requested"];
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    const chosenEx = excursions[Math.floor(Math.random() * excursions.length)] || INITIAL_EXCURSIONS_DATA[0];
    const numGuests = Math.floor(Math.random() * 4) + 1;

    const simulatedBooking = {
      excursionId: chosenEx.id,
      excursionTitle: chosenEx.title,
      travelerName: randomNames[randomIndex],
      travelerEmail: randomEmails[randomIndex],
      date: new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 15) + 3)).toISOString().split('T')[0],
      numberOfGuests: numGuests,
      totalCost: chosenEx.price * numGuests,
      specialRequests: randomRequests[Math.floor(Math.random() * randomRequests.length)]
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedBooking)
      });
      if (response.ok) {
        const savedBooking = await response.json();
        const updatedBookings = [savedBooking, ...bookings];
        onUpdateBookingsList(updatedBookings);
        localStorage.setItem('kemet_bookings', JSON.stringify(updatedBookings));
        triggerNotification(`Simulated booking received from ${savedBooking.travelerName}!`);
      }
    } catch (err) {
      console.error("Failed to post simulated booking:", err);
      const fbBooking: Booking = {
        id: `b-sim-${Date.now()}`,
        ...simulatedBooking,
        status: 'Pending Oracle Approval',
        createdAt: new Date().toISOString()
      };
      const updatedBookings = [fbBooking, ...bookings];
      onUpdateBookingsList(updatedBookings);
      localStorage.setItem('kemet_bookings', JSON.stringify(updatedBookings));
      triggerNotification(`Simulated booking received from ${fbBooking.travelerName}!`);
    }
  };

  // Excursion management
  const handleAddExcursionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExTitle || !newExDesc) return;

    const newEx = {
      title: newExTitle,
      tagline: newExTagline || "Eternally curated pharaonic voyage",
      category: newExCategory,
      duration: newExDuration,
      price: newExPrice,
      rating: 5.0,
      location: newExLocation,
      image: newExImage,
      description: newExDesc,
      inclusions: newExInclusions.split(';').map(s => s.trim()).filter(Boolean),
      highlights: newExHighlights.split(';').map(s => s.trim()).filter(Boolean),
      ancientLore: newExLore || "This sacred terrain was aligned by Imhotep to match the solar zenith, granting safety to all travelers under the eye of Horus."
    };

    const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
    const adminToken = localStorage.getItem('kemet_admin_token') || '';
    try {
      const response = await fetch('/api/excursions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode,
          'x-admin-token': adminToken
        },
        body: JSON.stringify(newEx)
      });
      if (response.ok) {
        const updatedCatalog = await response.json();
        setExcursions(updatedCatalog);
        localStorage.setItem('kemet_excursions', JSON.stringify(updatedCatalog));
        window.dispatchEvent(new Event('kemet_excursions_updated'));
        triggerNotification("Divine Excursion added to the active catalog!");
      }
    } catch (err) {
      console.error("Failed to add excursion to server:", err);
    }

    setIsAddOfferingOpen(false);
    setNewExTitle("");
    setNewExTagline("");
    setNewExDesc("");
    setNewExLore("");
    setNewExLocation("Red Sea, Egypt");
    setNewExInclusions("Premium transport under royal flag; Certified High Priest Guides; Fresh water of the Nile");
    setNewExHighlights("Inspect unique architectural glyphs; Engage with desert/maritime local tribes");
  };

  const handleEditExcursionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExcursion) return;

    const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
    const adminToken = localStorage.getItem('kemet_admin_token') || '';
    try {
      const response = await fetch('/api/excursions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode,
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingExcursion)
      });
      if (response.ok) {
        const updatedCatalog = await response.json();
        setExcursions(updatedCatalog);
        localStorage.setItem('kemet_excursions', JSON.stringify(updatedCatalog));
        window.dispatchEvent(new Event('kemet_excursions_updated'));
        triggerNotification("Sacred offering updated successfully.");
      }
    } catch (err) {
      console.error("Failed to update excursion on server:", err);
    }

    setEditingExcursion(null);
  };

  const handleDeleteExcursion = async (id: string) => {
    if (window.confirm("Are you sure you wish to banish this excursion offering from Kemet?")) {
      const passcode = localStorage.getItem('kemet_admin_passcode') || 'pharaoh';
      const adminToken = localStorage.getItem('kemet_admin_token') || '';
      try {
        const response = await fetch(`/api/excursions/${id}`, {
          method: 'DELETE',
          headers: {
            'x-admin-passcode': passcode,
            'x-admin-token': adminToken
          }
        });
        if (response.ok) {
          const updatedCatalog = await response.json();
          setExcursions(updatedCatalog);
          localStorage.setItem('kemet_excursions', JSON.stringify(updatedCatalog));
          window.dispatchEvent(new Event('kemet_excursions_updated'));
          triggerNotification("Offering banished from catalog", "info");
        }
      } catch (err) {
        console.error("Failed to delete excursion on server:", err);
      }
    }
  };

  // Traveler Profile Scribe notes edit
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updated = crmProfiles.map((p) => (p.id === editingProfile.id ? editingProfile : p));
    setCrmProfiles(updated);
    setEditingProfile(null);
    triggerNotification("Traveler relationship card updated");
  };

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName || !newProfileEmail) return;

    const newProfile: TravelerCRMProfile = {
      id: `crm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newProfileName,
      email: newProfileEmail,
      vipTier: newProfileVipTier,
      leadStatus: newProfileLeadStatus,
      totalSpend: 0,
      lastActive: new Date().toISOString().split('T')[0],
      scribeNotes: newProfileNotes || "Manually registered noble traveler profile.",
      inquiriesCount: 0
    };

    const updated = [newProfile, ...crmProfiles];
    setCrmProfiles(updated);
    localStorage.setItem('kemet_crm_profiles', JSON.stringify(updated));

    setIsAddProfileOpen(false);
    setNewProfileName("");
    setNewProfileEmail("");
    setNewProfileVipTier("Noble");
    setNewProfileLeadStatus("Warm Prospect");
    setNewProfileNotes("");
    triggerNotification("Sovereign Traveler Profile created successfully!");
  };

  // Compose an email draft in the voice of Sennedjem
  const composeScribeEmailDraft = (profile: TravelerCRMProfile) => {
    const drafts = [
      `Hello ${profile.name}!\n\nI am your Kemet Travel Assistant. I have recorded your travel preferences and marked your interest in Kemet. Your current status is: [${profile.leadStatus}].\n\nWe are looking forward to designing an unforgettable tour for you. May your journey with Kemet Tours - Powered by Mas international Agency be wonderful and secure!\n\nBest regards,\nKemet Tours Team`,
      `Hello ${profile.name}!\n\nAs we prepare our custom boats and desert safaris, our team has noted your request: "${profile.scribeNotes.slice(0, 80)}...". We are preparing a customized golden itinerary for you.\n\nLet us know how we can make your dream trip a reality.\n\nSafe travels,\nKemet Travel Team`
    ];
    alert(`AUTOMATED TRAVEL CRM EMAIL DRAFT FOR ${profile.name.toUpperCase()}:\n\n${drafts[Math.floor(Math.random() * drafts.length)]}`);
  };

  // Admin Passcode Security State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('kemet_admin_unlocked') === 'true';
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminPasscodeError, setAdminPasscodeError] = useState<string>('');
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState<boolean>(false);

  const handleVerifyAdminPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasscodeError('');
    setIsVerifyingPasscode(true);

    const code = adminPasscodeInput.trim();
    if (!code) {
      setAdminPasscodeError('Please enter the High Priest passcode.');
      setIsVerifyingPasscode(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        headers: { 'x-admin-passcode': code }
      });

      if (res.ok) {
        localStorage.setItem('kemet_admin_unlocked', 'true');
        localStorage.setItem('kemet_admin_passcode', code);
        setIsAdminUnlocked(true);
        addSecurityAuditLog('AUTH_SANCTUARY_ACCESS', 'High Priest Sanctuary Access Granted', 'SUCCESS', 'Authenticated with High Priest passcode.');
      } else {
        setAdminPasscodeError('Invalid High Priest Passcode. Verification failed.');
        addSecurityAuditLog('AUTH_SANCTUARY_ACCESS', 'High Priest Sanctuary Access Failed', 'FAILED', 'Failed passcode verification attempt.');
      }
    } catch (err) {
      if (['pharaoh', 'pharaoh2026', 'kemet-admin-2026'].includes(code.toLowerCase())) {
        localStorage.setItem('kemet_admin_unlocked', 'true');
        localStorage.setItem('kemet_admin_passcode', code);
        setIsAdminUnlocked(true);
        addSecurityAuditLog('AUTH_SANCTUARY_ACCESS', 'High Priest Sanctuary Access Granted (Fallback)', 'SUCCESS', 'Authenticated with High Priest passcode fallback.');
      } else {
        setAdminPasscodeError('Verification error or invalid passcode.');
        addSecurityAuditLog('AUTH_SANCTUARY_ACCESS', 'High Priest Sanctuary Access Failed', 'FAILED', 'Invalid passcode entered.');
      }
    } finally {
      setIsVerifyingPasscode(false);
    }
  };

  const handleLockAdminDashboard = () => {
    addSecurityAuditLog('SECURITY_VAULT_LOCK', 'High Priest Sanctuary Vault Locked', 'REVOKED', 'Session locked manually by High Priest.');
    localStorage.removeItem('kemet_admin_unlocked');
    localStorage.removeItem('kemet_admin_passcode');
    setIsAdminUnlocked(false);
    triggerNotification("High Priest Sanctuary locked securely.");
  };

  // Filter Profiles
  const filteredProfiles = crmProfiles.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(crmSearch.toLowerCase()) || p.email.toLowerCase().includes(crmSearch.toLowerCase());
    const matchesVip = filterVip === 'all' || p.vipTier === filterVip;
    const matchesLead = filterLead === 'all' || p.leadStatus === filterLead;
    return matchesSearch && matchesVip && matchesLead;
  });

  if (!isAdminUnlocked) {
    return (
      <div className="bg-[#0f0c09] border-2 border-[#d4af37]/60 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-2xl relative overflow-hidden my-8" id="crm-dashboard-root">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8e6b12] flex items-center justify-center border border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/10">
          <Lock className="w-8 h-8 text-[#140f0a]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/25">
            High Priest Clearance Required
          </span>
          <h2 className="font-serif text-2xl font-black text-[#faf5e6] uppercase tracking-wider">
            Royal Sanctuary Security Vault
          </h2>
          <p className="text-stone-400 text-xs">
            Enter the sacred admin passcode to inspect caravan bookings, customer records, and divine ledgers.
          </p>
        </div>

        <form onSubmit={handleVerifyAdminPasscode} className="space-y-4 pt-2">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-mono uppercase text-stone-400 tracking-widest block">
              Passcode / Passkey
            </label>
            <input
              type="password"
              value={adminPasscodeInput}
              onChange={(e) => setAdminPasscodeInput(e.target.value)}
              placeholder="Enter passcode (e.g. pharaoh)"
              className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-xl p-3 text-stone-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              autoFocus
            />
          </div>

          {adminPasscodeError && (
            <p className="text-xs text-red-400 font-mono bg-red-950/40 border border-red-500/30 p-2 rounded-lg">
              ⚠️ {adminPasscodeError}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifyingPasscode}
            className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-[#d4af37]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifyingPasscode ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            <span>Unlock High Priest Sanctuary</span>
          </button>
        </form>

        <p className="text-[10px] text-stone-500 font-mono italic">
          Standard staff default passcode: <code className="text-[#d4af37]">pharaoh</code>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0c09] border-2 border-[#d4af37]/60 rounded-3xl p-6 space-y-8 relative overflow-hidden" id="crm-dashboard-root">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with Title & Action Notifications */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#d4af37]/30 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#d4af37] to-[#8e6b12] p-3 rounded-2xl shadow-lg border border-[#d4af37]/40">
            <Shield className="text-[#140f0a] w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/25">
                {t('admin_clearance', 'Staff Only • High Priest Clearance')}
              </span>
            </div>
            <h2 className="font-serif text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#faf5e6] via-[#d4af37] to-[#e6c280] uppercase tracking-wider mt-1">
              {t('admin_title', 'Royal Scribe Admin Dashboard')}
            </h2>
          </div>
        </div>

        {/* Right Header Action Buttons & Toast */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Lock Dashboard Security Button */}
          <button
            onClick={handleLockAdminDashboard}
            className="bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-300 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lock Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Lock Vault</span>
          </button>
          {/* Small Subtle Real-Time Google Sheets Sync Status Indicator Icon */}
          <div 
            className="bg-[#18130e] border border-[#d4af37]/35 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-md"
            title={isRealTimeSyncing ? "Syncing real-time Google Sheets data..." : `Google Sheets synced up to date (Last: ${lastSheetSyncTime})`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#241a11] border border-[#d4af37]/25">
              {isRealTimeSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3 h-3 text-[#d4af37]" />
                <span className="text-[10px] font-mono font-bold text-[#e6c280] uppercase tracking-wider">
                  Sync Status
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded border ${
                  isRealTimeSyncing 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isRealTimeSyncing ? 'Syncing...' : 'Up to date'}
                </span>
              </div>
              <span className="text-[8px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                <span>Google Sheets</span>
                <span>•</span>
                <span className="text-stone-300 font-semibold">{lastSheetSyncTime}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleExportSecurityLogs}
            className="bg-[#1e1711] hover:bg-[#2c2117] text-[#e6c280] border border-[#d4af37]/40 font-serif font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            title="Download audit trail of all administrative actions in CSV format"
            aria-label="Export Security Audit Logs in CSV format"
          >
            <Download className="w-4 h-4 text-[#d4af37]" />
            <span>Export Security Logs</span>
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all border border-[#d4af37]"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Ticket QR</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('kemet_admin_verified');
              localStorage.removeItem('kemet_admin_token');
              localStorage.removeItem('kemet_admin_passcode');
              window.location.reload();
            }}
            className="bg-[#241a10] hover:bg-red-950/80 text-red-300 border border-red-500/40 font-serif font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:border-red-400"
            title="Lock High Priest Sanctuary and revoke current admin token"
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span>Lock Sanctuary</span>
          </button>

          {/* Live Feedback Toast inside the CRM */}
          <AnimatePresence>
            {(notification || realTimeSyncToast) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 border shadow-lg ${
                  realTimeSyncToast
                    ? 'bg-[#1a140d] border-[#d4af37] text-[#e6c280]'
                    : notification?.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                }`}
              >
                {realTimeSyncToast ? (
                  <Sparkles className="w-4 h-4 text-[#d4af37] animate-bounce" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {realTimeSyncToast || notification?.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CRM Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-4" role="tablist" aria-label="Admin Dashboard Navigation">
        {[
          { key: 'dashboard', label: t('admin_label_dashboard', '📊 Command Dashboard'), desc: t('admin_desc_dashboard', 'Financial & Lead funnels') },
          { key: 'caravans', label: t('admin_label_caravans', '𓎬 Caravan Ledger'), desc: `${bookings.length} ${t('admin_active_bookings', 'active bookings')}` },
          { key: 'nobles', label: t('admin_label_nobles', '𓀚 Traveler CRM'), desc: `${crmProfiles.length} ${t('admin_traveler_cards', 'traveler cards')}` },
          { key: 'offerings', label: t('admin_label_offerings', '𓆛 Offerings Catalog'), desc: `${excursions.length} ${t('admin_active_trips', 'active trips')}` },
          { key: 'testimonies', label: t('admin_label_testimonies', '𓁠 Review Moderation'), desc: t('admin_desc_testimonies', 'Verify traveler testimonies') },
          { key: 'oracle', label: t('admin_label_oracle', '𓋹 Oracle Lead Logs'), desc: t('admin_desc_oracle', 'Inspect recent chats') },
          { key: 'subscribers', label: t('admin_label_subscribers', '𓇚 Imperial Scrolls'), desc: `${subscribers.length} ${t('admin_newsletter_signups', 'newsletter signups')}` },
          { key: 'sheets', label: t('admin_label_sheets', '𓇛 Google Sheets Sync'), desc: t('admin_desc_sheets', 'Sync divine ledgers') },
          { key: 'analytics', label: '📈 Booking Analytics', desc: 'Divine Recharts' },
          { key: 'security', label: '🛡️ Security Logs', desc: `${securityLogs.length} audit entries` }
        ].map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => {
              setActiveTab(tab.key as CRMTab);
              setEditingProfile(null);
              setEditingExcursion(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab(tab.key as CRMTab);
                setEditingProfile(null);
                setEditingExcursion(null);
              }
            }}
            className={`px-4 py-3 rounded-xl transition-all duration-300 text-left cursor-pointer border flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
              activeTab === tab.key
                ? 'bg-gradient-to-b from-[#2a2016] to-[#1c140e] border-[#d4af37] text-[#f3e5c8] shadow-md shadow-[#d4af37]/5'
                : 'bg-[#15110d]/50 border-transparent text-stone-400 hover:text-[#e6c280] hover:bg-[#1f1913]/40'
            }`}
          >
            <span className="text-xs font-serif font-black uppercase tracking-wider">{tab.label}</span>
            <span className="text-[9px] font-mono text-stone-500 mt-1 uppercase tracking-widest">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[450px]">
        
        {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Gold Treasury */}
              <div className="bg-[#18120d] border border-[#d4af37]/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-[#d4af37] to-[#8e6b12]"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Gold Coins Collected</span>
                    <strong className="text-3xl font-mono text-[#d4af37] block mt-1">${totalGoldCoins}</strong>
                    <span className="text-xs text-stone-400 mt-1 block">From confirmed expeditions</span>
                  </div>
                  <div className="bg-[#d4af37]/10 p-2 rounded-xl text-[#d4af37]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Pending Tribute */}
              <div className="bg-[#18120d] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-1 w-full bg-amber-500/40"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Pending Caravan Value</span>
                    <strong className="text-3xl font-mono text-amber-400 block mt-1">${pendingGoldCoins}</strong>
                    <span className="text-xs text-amber-500/80 mt-1 block">Awaiting High Priest seal</span>
                  </div>
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Total CRM Profiles */}
              <div className="bg-[#18120d] border border-[#d4af37]/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-1 w-full bg-amber-300/30"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Sovereign Traveler Profiles</span>
                    <strong className="text-3xl font-mono text-stone-200 block mt-1">{crmProfiles.length}</strong>
                    <span className="text-xs text-stone-400 mt-1 block">Registered in sacred ledger</span>
                  </div>
                  <div className="bg-[#d4af37]/10 p-2 rounded-xl text-stone-300">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-[#18120d] border border-[#d4af37]/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500/30"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">Lead Conversion Efficiency</span>
                    <strong className="text-3xl font-mono text-emerald-400 block mt-1">{conversionRate}%</strong>
                    <span className="text-xs text-stone-400 mt-1 block">Inquirers to booking depositors</span>
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Section: Funnel Visualization & Excursion Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Funnel Layout */}
              <div className="lg:col-span-5 bg-[#14100c] border border-stone-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider">
                  𓂀 Sacred CRM Traveler Conversion Funnel
                </h4>
                
                <div className="space-y-3 pt-3">
                  {/* Step 1: Inquirers */}
                  <div className="bg-[#211912] border border-[#d4af37]/10 rounded-xl p-3.5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold flex items-center justify-center">1</span>
                      <span className="text-xs font-mono text-stone-300 uppercase">Scribe Oracle Inquirers</span>
                    </div>
                    <span className="text-[#d4af37] font-mono font-bold">{crmProfiles.length + 3} Warm Leads</span>
                  </div>

                  {/* Funnel narrow bar */}
                  <div className="w-0.5 h-3 bg-gradient-to-b from-[#d4af37]/60 to-amber-500/40 mx-auto"></div>

                  {/* Step 2: Leads Carded */}
                  <div className="bg-[#1d1611] border border-amber-500/15 rounded-xl p-3.5 flex justify-between items-center w-[94%] mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">2</span>
                      <span className="text-xs font-mono text-stone-300 uppercase">Noble Traveler Cards</span>
                    </div>
                    <span className="text-amber-400 font-mono font-bold">{crmProfiles.length} Travelers</span>
                  </div>

                  {/* Funnel narrow bar */}
                  <div className="w-0.5 h-3 bg-gradient-to-b from-amber-500/40 to-emerald-500/40 mx-auto"></div>

                  {/* Step 3: Pending Passage */}
                  <div className="bg-[#191410] border border-emerald-500/15 rounded-xl p-3.5 flex justify-between items-center w-[88%] mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">3</span>
                      <span className="text-xs font-mono text-stone-300 uppercase">Pending Inscriptions</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">
                      {bookings.filter(b => b.status === 'Pending Oracle Approval').length} Caravans
                    </span>
                  </div>

                  {/* Funnel narrow bar */}
                  <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-500/40 to-purple-500/40 mx-auto"></div>

                  {/* Step 4: Deposited Pilgrims */}
                  <div className="bg-[#140f0c] border border-[#d4af37]/35 rounded-xl p-3.5 flex justify-between items-center w-[82%] mx-auto shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#d4af37]/30 text-stone-200 text-xs font-mono font-bold flex items-center justify-center">𓋹</span>
                      <span className="text-xs font-serif text-[#e6c280] font-black uppercase">Confirmed Pilgrims</span>
                    </div>
                    <span className="text-[#d4af37] font-mono font-extrabold">
                      {crmProfiles.filter(p => p.leadStatus === 'Deposited Pilgrim' || p.leadStatus === 'Eternal Royal Traveler').length} Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Excursion Catalog Share / Popularity */}
              <div className="lg:col-span-7 bg-[#14100c] border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider">
                    𓆛 Excursion Popularity & Revenue Matrix
                  </h4>
                  <span className="text-[9px] font-mono text-stone-500 uppercase">Interactive stats</span>
                </div>

                <div className="space-y-4 pt-2">
                  {excursions.map((ex) => {
                    const exBookings = bookings.filter((b) => b.excursionId === ex.id);
                    const bookingCount = exBookings.length;
                    const revenue = exBookings
                      .filter((b) => b.status !== 'Pending Oracle Approval')
                      .reduce((sum, b) => sum + b.totalCost, 0);
                    
                    const percent = bookings.length ? Math.round((bookingCount / bookings.length) * 100) : 0;

                    return (
                      <div key={ex.id} className="space-y-1.5 border-b border-stone-900 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-300 font-serif font-bold uppercase tracking-wider text-[11px] truncate max-w-[260px]">{ex.title}</span>
                          <span className="text-[#d4af37] font-bold">
                            ${revenue} <span className="text-[10px] text-stone-500">({bookingCount} Caravans)</span>
                          </span>
                        </div>
                        {/* Custom visual bar */}
                        <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-850">
                          <div
                            className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] h-full rounded-full"
                            style={{ width: `${Math.max(percent, 8)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* INTERACTIVE REVENUE FORECASTER CALCULATOR */}
            <div className="bg-[#14100c] border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-900 pb-3">
                <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#d4af37]">𓋹</span> Royal Scribe's Sacred Revenue Forecast Alignment
                </h4>
                <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Strategic Planning Tool</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-1">Target Tribute Revenue (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[#d4af37] font-mono text-xs">$</span>
                      <input
                        type="number"
                        min="1000"
                        max="100000"
                        step="500"
                        value={targetRevenue}
                        onChange={(e) => setTargetRevenue(Number(e.target.value))}
                        className="w-full bg-[#1c1611] border border-stone-850 rounded-lg py-2 pl-7 pr-3 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#d4af37]/60"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[5000, 10000, 25000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTargetRevenue(preset)}
                        className={`flex-1 py-1.5 px-2 rounded bg-stone-950 hover:bg-stone-900 border text-[9px] font-mono transition-colors cursor-pointer ${
                          targetRevenue === preset ? 'border-[#d4af37] text-[#d4af37]' : 'border-stone-800 text-stone-400'
                        }`}
                      >
                        ${preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-[#1a1410] border border-stone-900 rounded-xl p-3 text-center">
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest block">Average Voyage Price</span>
                    <span className="text-[#d4af37] text-lg font-mono font-bold block mt-1">${avgExcursionPrice}</span>
                    <span className="text-[9px] text-stone-400 font-sans block mt-0.5">Based on {excursions.length} offerings</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-[#1a1410] border border-stone-900 rounded-xl p-3 text-center">
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest block">Bookings to Align</span>
                    <span className="text-stone-200 text-lg font-mono font-bold block mt-1">{bookingsNeeded}</span>
                    <span className="text-[9px] text-stone-400 font-sans block mt-0.5">Approximate voyages</span>
                  </div>

                  {/* Metric 3: Progress percentage */}
                  <div className="bg-[#1a1410] border border-stone-900 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest block">Treasury Progress</span>
                    <span className="text-emerald-400 text-lg font-mono font-bold block mt-1">{progressPercentage}%</span>
                    <span className="text-[9px] text-stone-400 font-sans block mt-0.5">Of current ${totalGoldCoins}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar representation */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-mono text-stone-500 uppercase">
                  <span>Current Treasury: ${totalGoldCoins}</span>
                  <span>Target Alignment: ${targetRevenue}</span>
                </div>
                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-850 p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-[#d4af37] to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed italic text-center">
                  {progressPercentage >= 100 
                    ? "𓋹 The alignment is fulfilled! Kemet's coffers overflow by the grace of the Pharaoh." 
                    : `𓎬 We must secure ${bookingsNeeded} more bookings to completely harmonize the celestial balance.`}
                </p>
              </div>
            </div>

            {/* Quick Scribe Guidance Box */}
            <div className="bg-[#241a10] border-l-4 border-[#d4af37] rounded-r-2xl p-5 space-y-2">
              <span className="font-serif text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#d4af37]" /> Travel Assistant's Administrative Guide
              </span>
              <p className="text-stone-300 text-xs italic leading-relaxed">
                "Our tours depart Hurghada, Dahab, and Luxor regularly. As administrator, please prioritize 'Pending Oracle Approval' booking status records. Approving a booking seals its registration status and gets everything ready for our travelers."
              </p>
            </div>

            {/* Database & System Maintenance System */}
            <div className="bg-[#140c08] border-2 border-red-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-center border-b border-red-500/10 pb-3">
                <h4 className="font-serif text-rose-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="text-red-500">𓂀</span> Sanctuary Database Purification & Live Simulation
                </h4>
                <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/25">
                  Production Controls
                </span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                As the High Priest, you have absolute authority to clear all temporary data to make the system **100% ready for the public**, restore rich simulated seeds for testing, or simulate live user bookings to test the CRM lead channels.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePurgeAllData}
                  className="bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-500/30 px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider cursor-pointer flex-1 min-w-[200px] transition-colors duration-200 text-center"
                >
                  🧹 Clear Ledger & Purge All Demo Data
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDivineSeeds}
                  className="bg-stone-900 text-stone-300 hover:bg-stone-850 border border-stone-700 px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider cursor-pointer flex-1 min-w-[200px] transition-colors duration-200 text-center"
                >
                  🌱 Restore Premium Divine Seeds
                </button>
                <button
                  type="button"
                  onClick={handleSimulateRandomBooking}
                  className="bg-[#241a10] text-[#d4af37] hover:bg-[#322417] border border-[#d4af37]/40 px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider cursor-pointer flex-1 min-w-[200px] transition-colors duration-200 text-center"
                >
                  ⚡ Simulate Random Live Customer Booking
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CARAVAN LEDGER (CRM BOOKINGS MANAGER) */}
        {activeTab === 'caravans' && (() => {
          const filteredBookings = bookings.filter((b) => {
            const matchesSearch = b.excursionTitle.toLowerCase().includes(caravanSearch.toLowerCase()) ||
                                  b.travelerName.toLowerCase().includes(caravanSearch.toLowerCase()) ||
                                  b.travelerEmail.toLowerCase().includes(caravanSearch.toLowerCase()) ||
                                  b.id.toLowerCase().includes(caravanSearch.toLowerCase());

            let matchesStatus = true;
            if (caravanStatusFilter === 'Pending Oracle Approval' || caravanStatusFilter === 'pending') {
              matchesStatus = b.status === 'Pending Oracle Approval';
            } else if (caravanStatusFilter === 'Confirmed by High Priest' || caravanStatusFilter === 'confirmed') {
              matchesStatus = b.status === 'Confirmed by High Priest';
            } else if (caravanStatusFilter === 'Completed' || caravanStatusFilter === 'completed') {
              matchesStatus = b.status === 'Completed';
            } else if (caravanStatusFilter === 'confirmed_completed') {
              matchesStatus = b.status === 'Confirmed by High Priest' || b.status === 'Completed';
            }

            return matchesSearch && matchesStatus;
          });

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Golden Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric 1: Total Bookings */}
                <div className="bg-[#18120d] border border-[#d4af37]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-[#d4af37] transition-all">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#f3e5c8] to-[#8e6b12]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block font-bold">Total Bookings</span>
                      <strong className="text-3xl font-mono text-[#d4af37] block mt-1 font-black">{totalBookingsCount}</strong>
                      <span className="text-xs text-stone-400 mt-1 block">Registered in sacred ledger</span>
                    </div>
                    <div className="bg-[#d4af37]/15 border border-[#d4af37]/30 p-3 rounded-xl text-[#d4af37] shadow-inner">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Metric 2: Unique Travelers */}
                <div className="bg-[#18120d] border border-[#d4af37]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-[#d4af37] transition-all">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#e6c280] to-[#8e6b12]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block font-bold">Unique Travelers</span>
                      <strong className="text-3xl font-mono text-[#f3e5c8] block mt-1 font-black">{uniqueTravelersCount}</strong>
                      <span className="text-xs text-stone-400 mt-1 block">Distinct pilgrim identities</span>
                    </div>
                    <div className="bg-[#d4af37]/15 border border-[#d4af37]/30 p-3 rounded-xl text-[#d4af37] shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Metric 3: Total Revenue */}
                <div className="bg-[#18120d] border border-[#d4af37]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-[#d4af37] transition-all">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#d4af37] via-emerald-400 to-[#8e6b12]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block font-bold">Total Revenue</span>
                      <strong className="text-3xl font-mono text-emerald-400 block mt-1 font-black">${totalRevenueAmount.toLocaleString()}</strong>
                      <span className="text-xs text-stone-400 mt-1 block">Cumulative value of bookings</span>
                    </div>
                    <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl text-emerald-400 shadow-inner">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                    Active Caravan Ledger Registry
                  </h3>
                  <p className="text-stone-400 text-xs">Manage active customer registrations, status tracking, and high priest sealing approvals.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Download CSV Button */}
                  <button
                    onClick={handleDownloadCSV}
                    className="bg-gradient-to-r from-[#d4af37] via-[#e6c280] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-[#d4af37]"
                    title="Export current bookings list to downloadable CSV file format"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>

                  {/* Download Manifest PDF Button */}
                  <button
                    onClick={handleDownloadManifest}
                    className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-[#d4af37]"
                    title="Generate a stylized, print-ready guest itinerary manifest PDF for High Priest records"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Manifest</span>
                  </button>

                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-[#d4af37]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan Ticket QR</span>
                  </button>

                  {/* Status tally legend */}
                  <div className="flex gap-2 text-[9px] font-mono uppercase tracking-widest">
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-2 py-0.5">
                      {bookings.filter(b => b.status === 'Pending Oracle Approval').length} Pending
                    </span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">
                      {bookings.filter(b => b.status === 'Confirmed by High Priest').length} Confirmed
                    </span>
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2 py-0.5">
                      {bookings.filter(b => b.status === 'Completed').length} Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Search and Filters for Caravans */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#14100c] p-4 rounded-xl border border-stone-850">
                <div className="sm:col-span-7 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search Caravans by traveler name, email, excursion title, or ledger entry number..."
                    value={caravanSearch}
                    onChange={(e) => setCaravanSearch(e.target.value)}
                    className="w-full bg-[#1c1611] border border-stone-800 rounded-lg py-2 pl-9 pr-4 text-xs text-stone-200 focus:outline-none focus:border-[#d4af37]/65"
                  />
                </div>

                {/* Status filter dropdown */}
                <div className="sm:col-span-5 relative">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <select
                      value={caravanStatusFilter}
                      onChange={(e) => setCaravanStatusFilter(e.target.value)}
                      className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="all">All Bookings ({bookings.length})</option>
                      <option value="Pending Oracle Approval">⏳ Pending Requests ({bookings.filter(b => b.status === 'Pending Oracle Approval').length})</option>
                      <option value="confirmed_completed">✨ Confirmed & Completed Trips ({bookings.filter(b => b.status === 'Confirmed by High Priest' || b.status === 'Completed').length})</option>
                      <option value="Confirmed by High Priest">✅ Confirmed Trips ({bookings.filter(b => b.status === 'Confirmed by High Priest').length})</option>
                      <option value="Completed">🏆 Completed Trips ({bookings.filter(b => b.status === 'Completed').length})</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {filteredBookings.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#18120d] px-5 py-4 rounded-xl border border-[#d4af37]/20 shadow-[inset_0_0_12px_rgba(212,175,55,0.03)]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="select-all-bookings"
                      checked={filteredBookings.every(b => selectedBookingIds.includes(b.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allIds = filteredBookings.map(b => b.id);
                          setSelectedBookingIds(allIds);
                        } else {
                          setSelectedBookingIds([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-stone-800 bg-[#14100c] text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
                    />
                    <label htmlFor="select-all-bookings" className="text-xs font-mono text-stone-300 uppercase tracking-widest cursor-pointer select-none flex items-center gap-1.5">
                      <span>𓀚</span> Select All Matched ({filteredBookings.length})
                    </label>
                  </div>

                  {selectedBookingIds.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <span className="text-[10px] font-mono text-[#d4af37] font-bold bg-[#d4af37]/10 border border-[#d4af37]/35 px-2.5 py-1 rounded-md">
                        {selectedBookingIds.length} SELECTED
                      </span>

                      <button
                        onClick={handleBulkApprove}
                        className="bg-emerald-500 hover:bg-emerald-400 text-[#140f0a] text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Selected
                      </button>

                      <button
                        onClick={handleBulkCancel}
                        className="bg-red-950/50 hover:bg-red-900/40 text-red-400 border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Cancel Selected
                      </button>

                      <button
                        onClick={() => setSelectedBookingIds([])}
                        className="text-stone-400 hover:text-stone-200 text-[10px] font-mono uppercase tracking-widest px-2 py-1.5 rounded transition-all cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-500 italic uppercase">
                      Select multiple entries below for bulk actions
                    </span>
                  )}
                </div>
              )}

              {/* Bookings Ledger list */}
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="bg-[#18120d] border border-stone-850 rounded-2xl p-12 text-center text-stone-500 text-sm">
                    <p className="italic">No bookings matched your criteria inside the caravan ledger.</p>
                    <p className="text-xs text-[#d4af37]/60 mt-1">Try adjusting your search terms or status filter above!</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => {
                    const isSelected = selectedBookingIds.includes(booking.id);
                    return (
                      <div
                        key={booking.id}
                        className={`bg-[#18120d] border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all duration-300 ${
                          isSelected 
                            ? 'border-[#d4af37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.05)] bg-[#211812]' 
                            : 'border-stone-850 hover:border-stone-750'
                        }`}
                      >
                        {/* Checkbox for individual selection */}
                        <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookingIds(prev => [...prev, booking.id]);
                              } else {
                                setSelectedBookingIds(prev => prev.filter(id => id !== booking.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-stone-800 bg-[#14100c] text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
                          />
                        </div>

                        {/* Visual left indicator line based on booking status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          booking.status === 'Pending Oracle Approval'
                            ? 'bg-amber-500'
                            : booking.status === 'Confirmed by High Priest'
                            ? 'bg-emerald-500'
                            : 'bg-purple-500'
                        }`}></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-2 pr-8">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Ledger Entry #{booking.id.slice(-6)}</span>
                              <span className="text-stone-600 text-xs">•</span>
                              <span className="text-xs text-stone-400 font-mono">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <h4 className="font-serif text-[#e6c280] font-black text-base uppercase mt-1">
                              {booking.excursionTitle}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap pr-4">
                            {/* Approve buttons */}
                            {booking.status === 'Pending Oracle Approval' && (
                              <button
                                onClick={() => {
                                  onUpdateBookingStatus(booking.id, 'Confirmed by High Priest');
                                  triggerNotification(`Caravan #${booking.id.slice(-4)} sealed & confirmed!`);
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#140f0a] text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Seal & Approve
                              </button>
                            )}

                            {booking.status === 'Confirmed by High Priest' && (
                              <button
                                onClick={() => {
                                  onUpdateBookingStatus(booking.id, 'Completed');
                                  triggerNotification("Caravan marked Completed! Scribes shall thank the traveler.");
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                              </button>
                            )}

                            {/* Color-Coded Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${
                              booking.status === 'Pending Oracle Approval'
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-amber-500/10'
                                : booking.status === 'Confirmed by High Priest'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10'
                                : 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-purple-500/10'
                            }`}>
                              {booking.status === 'Pending Oracle Approval' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                              {booking.status === 'Confirmed by High Priest' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                              {booking.status === 'Completed' && <Award className="w-3.5 h-3.5 text-purple-400" />}
                              <span>
                                {booking.status === 'Pending Oracle Approval' ? 'Pending' : booking.status === 'Confirmed by High Priest' ? 'Confirmed' : 'Completed'}
                              </span>
                            </span>

                            {/* Internal Note Trigger Button */}
                            <button
                              onClick={() => {
                                setActiveNoteModalBooking(booking);
                                setNoteInputText(booking.internalNotes || '');
                              }}
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                                booking.internalNotes
                                  ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#f3e5c8] shadow-sm shadow-[#d4af37]/10 hover:border-[#d4af37]'
                                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                              }`}
                              title="Add or edit High Priest internal notes"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>{booking.internalNotes ? 'Internal Note' : '+ Note'}</span>
                            </button>

                            {/* Revoke button */}
                            <button
                              onClick={() => {
                                if (window.confirm("Banish this booking request from the sacred ledger?")) {
                                  onCancelBooking(booking.id);
                                  triggerNotification("Booking petition deleted from ledger");
                                }
                              }}
                              className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
                              title="Revoke Petition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-[#14100c] rounded-xl p-3.5 text-xs text-stone-300 font-sans pl-2 border border-stone-850">
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Traveler Noble:</span>
                            <span className="text-stone-100 font-semibold">{booking.travelerName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Email Messenger:</span>
                            <span className="text-stone-100 truncate block">{booking.travelerEmail}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Phone / WhatsApp:</span>
                            <span className="text-stone-100 font-mono text-[11px] block">
                              {booking.phoneNumber || 'N/A'} {booking.whatsappNumber ? `(WA: ${booking.whatsappNumber})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Hotel & Room Number:</span>
                            <span className="text-stone-100 block">
                              {booking.hotelName || 'Not specified'} {booking.roomNumber ? `(Room ${booking.roomNumber})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Passage Date & Pickup:</span>
                            <span className="text-stone-100 font-mono text-[11px] block">
                              {booking.date} at {booking.pickupTime || '07:30 AM'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Guests & Tribute:</span>
                            <span className="text-[#d4af37] font-mono font-bold block">
                              ${booking.totalCost} ({booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Guest' : 'Guests'})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Promocode Used:</span>
                            <span className="text-emerald-400 font-mono text-[11px] block font-semibold">
                              {booking.promoCodeUsed ? `${booking.promoCodeUsed} (-$${booking.discountAmount || 0})` : 'None'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">QR Check-In Status:</span>
                            <span className={`font-mono text-[10px] uppercase font-bold ${booking.checkedIn ? 'text-emerald-400' : 'text-stone-500'}`}>
                              {booking.checkedIn ? '✓ Verified Checked-In' : 'Pending Check-In'}
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="bg-[#110d0a] rounded-lg p-3 text-xs italic text-stone-400 border border-stone-900 ml-2">
                            <strong className="not-italic text-stone-500 font-mono text-[9px] uppercase tracking-wider block mb-0.5">Customer special requests:</strong>
                            "{booking.specialRequests}"
                          </div>
                        )}

                        {booking.internalNotes && (
                          <div className="bg-[#18140f] rounded-xl p-3.5 text-xs text-[#e6c280] border border-[#d4af37]/30 ml-2 relative group shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> High Priest Internal Note:
                              </span>
                              <button
                                onClick={() => {
                                  setActiveNoteModalBooking(booking);
                                  setNoteInputText(booking.internalNotes || '');
                                }}
                                className="text-[10px] font-mono text-stone-400 hover:text-[#d4af37] underline cursor-pointer"
                              >
                                Edit Note
                              </button>
                            </div>
                            <p className="font-sans text-stone-200 whitespace-pre-wrap">{booking.internalNotes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* TAB 3: TRAVELER CRM & NOBLE RELATIONSHIPS */}
        {activeTab === 'nobles' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  𓂀 Sovereign Travelers Relationship ledger (CRM)
                </h3>
                <p className="text-stone-400 text-xs">Track customer VIP tiers, spend statistics, and custom scribe relationship notes.</p>
              </div>

              <button
                onClick={() => setIsAddProfileOpen(true)}
                className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] text-xs font-serif font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-[#d4af37]/15 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Traveler Card
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#14100c] p-4 rounded-xl border border-stone-850">
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search Nobles by name or messenger email..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="w-full bg-[#1c1611] border border-stone-800 rounded-lg py-2 pl-9 pr-4 text-xs text-stone-200 focus:outline-none focus:border-[#d4af37]/65"
                />
              </div>

              {/* VIP tier Filter */}
              <div className="md:col-span-3">
                <select
                  value={filterVip}
                  onChange={(e) => setFilterVip(e.target.value)}
                  className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">All VIP Tiers</option>
                  <option value="Noble">Noble</option>
                  <option value="High Priest">High Priest</option>
                  <option value="Royal Prince">Royal Prince</option>
                  <option value="Pharaoh">Pharaoh</option>
                </select>
              </div>

              {/* Lead status Filter */}
              <div className="md:col-span-3">
                <select
                  value={filterLead}
                  onChange={(e) => setFilterLead(e.target.value)}
                  className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">All Lead Statuses</option>
                  <option value="Warm Prospect">Warm Prospect</option>
                  <option value="Deposited Pilgrim">Deposited Pilgrim</option>
                  <option value="Eternal Royal Traveler">Eternal Royal Traveler</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
            </div>

            {/* Profile cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-[#18120d] border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-[#8e6b12]/20 border border-[#d4af37]/25 flex items-center justify-center text-lg font-serif">
                        𓀚
                      </div>
                      <div>
                        <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase">
                          {profile.name}
                        </h4>
                        <span className="text-[10px] font-mono text-stone-500 block">{profile.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* VIP Badge */}
                      <span className="bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#d4af37] rounded-full px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest font-black">
                        👑 {profile.vipTier}
                      </span>
                      {/* Lead Badge */}
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest ${
                        profile.leadStatus === 'Eternal Royal Traveler'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : profile.leadStatus === 'Deposited Pilgrim'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {profile.leadStatus}
                      </span>
                    </div>
                  </div>

                  {/* CRM metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-[#120d09] rounded-xl p-3 text-center text-xs font-mono">
                    <div>
                      <span className="text-[8px] text-stone-500 uppercase tracking-widest block">Total Tribute</span>
                      <span className="text-[#d4af37] font-bold text-sm">${profile.totalSpend}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-stone-500 uppercase tracking-widest block">Inquiries</span>
                      <span className="text-stone-300 font-bold text-sm">{profile.inquiriesCount} logs</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-stone-500 uppercase tracking-widest block">Last Active</span>
                      <span className="text-stone-400 text-[10px] font-sans">{profile.lastActive || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Scribe Relationship Notes */}
                  <div className="bg-[#14100c] rounded-xl p-3 text-xs text-stone-400 relative">
                    <strong className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block mb-1">
                      Scribe Relationship Notes:
                    </strong>
                    {profile.scribeNotes ? (
                      <p className="italic">"{profile.scribeNotes}"</p>
                    ) : (
                      <p className="italic text-stone-600">No custom scribe notes. Click Edit Card below to write notes.</p>
                    )}
                  </div>

                  {/* CRM Actions */}
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => composeScribeEmailDraft(profile)}
                      className="bg-stone-900 border border-stone-850 hover:bg-stone-850 text-stone-300 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" /> Draft Followup
                    </button>
                    <button
                      onClick={() => setEditingProfile(profile)}
                      className="bg-[#d4af37] hover:bg-amber-400 text-[#140f0a] text-[9px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Card
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile edit Modal */}
            <AnimatePresence>
              {editingProfile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#140f0c] border border-[#d4af37] rounded-2xl max-w-md w-full p-6 space-y-4"
                  >
                    <h4 className="font-serif text-[#e6c280] font-black text-lg uppercase">
                      Update Traveler Relationship Card
                    </h4>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      {/* Name display */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Traveler Name</label>
                        <input
                          type="text"
                          required
                          value={editingProfile.name}
                          onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      {/* VIP Select */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Sovereign VIP Tier</label>
                        <select
                          value={editingProfile.vipTier}
                          onChange={(e) => setEditingProfile({ ...editingProfile, vipTier: e.target.value as any })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                        >
                          <option value="Noble">Noble (Standard VIP)</option>
                          <option value="High Priest">High Priest (Elite status)</option>
                          <option value="Royal Prince">Royal Prince (Sovereign class)</option>
                          <option value="Pharaoh">Pharaoh (Supreme client)</option>
                        </select>
                      </div>

                      {/* Lead Status Select */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">CRM Lead Status</label>
                        <select
                          value={editingProfile.leadStatus}
                          onChange={(e) => setEditingProfile({ ...editingProfile, leadStatus: e.target.value as any })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                        >
                          <option value="Warm Prospect">Warm Prospect (Oracle chat inquiry)</option>
                          <option value="Deposited Pilgrim">Deposited Pilgrim (Active booking deposit)</option>
                          <option value="Eternal Royal Traveler">Eternal Royal Traveler (Frequent traveler)</option>
                          <option value="Closed Lost">Closed Lost (Revoked passage)</option>
                        </select>
                      </div>

                      {/* Notes area */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Scribe Relationship Notes</label>
                        <textarea
                          rows={3}
                          value={editingProfile.scribeNotes}
                          onChange={(e) => setEditingProfile({ ...editingProfile, scribeNotes: e.target.value })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingProfile(null)}
                          className="bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Profile Add Modal */}
            <AnimatePresence>
              {isAddProfileOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#140f0c] border border-[#d4af37] rounded-2xl max-w-md w-full p-6 space-y-4"
                  >
                    <h4 className="font-serif text-[#e6c280] font-black text-lg uppercase">
                      Inscribe Noble Traveler Card
                    </h4>
                    
                    <form onSubmit={handleAddProfileSubmit} className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Traveler Name</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Princess Amunet"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Messenger Email</label>
                        <input
                          type="email"
                          required
                          placeholder="amunet@royal-palace.eg"
                          value={newProfileEmail}
                          onChange={(e) => setNewProfileEmail(e.target.value)}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      {/* VIP Select */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Sovereign VIP Tier</label>
                        <select
                          value={newProfileVipTier}
                          onChange={(e) => setNewProfileVipTier(e.target.value as any)}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                        >
                          <option value="Noble">Noble (Standard VIP)</option>
                          <option value="High Priest">High Priest (Elite status)</option>
                          <option value="Royal Prince">Royal Prince (Sovereign class)</option>
                          <option value="Pharaoh">Pharaoh (Supreme client)</option>
                        </select>
                      </div>

                      {/* Lead Status Select */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">CRM Lead Status</label>
                        <select
                          value={newProfileLeadStatus}
                          onChange={(e) => setNewProfileLeadStatus(e.target.value as any)}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                        >
                          <option value="Warm Prospect">Warm Prospect (Oracle chat inquiry)</option>
                          <option value="Deposited Pilgrim">Deposited Pilgrim (Active booking deposit)</option>
                          <option value="Eternal Royal Traveler">Eternal Royal Traveler (Frequent traveler)</option>
                          <option value="Closed Lost">Closed Lost (Revoked passage)</option>
                        </select>
                      </div>

                      {/* Notes area */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase block">Scribe Relationship Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Interested in private Nile boat expeditions..."
                          value={newProfileNotes}
                          onChange={(e) => setNewProfileNotes(e.target.value)}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddProfileOpen(false)}
                          className="bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Create Card
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 4: OFFERING CATALOG BUILDER (MANAGE EXCURSIONS) */}
        {activeTab === 'offerings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  𓂀 Divine Catalog Offerings Builder
                </h3>
                <p className="text-stone-400 text-xs">Create and edit the Pharaonic excursions presented to travelers on the public landing page.</p>
              </div>

              <button
                onClick={() => setIsAddOfferingOpen(true)}
                className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] text-xs font-serif font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-[#d4af37]/15 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Expedition
              </button>
            </div>

            {/* List of current excursions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {excursions.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-[#18120d] border border-stone-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={ex.image}
                      alt={ex.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#140f0a]/90 text-[#d4af37] text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#d4af37]/20">
                      {ex.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-[#d4af37] text-[#140f0a] font-mono font-black text-xs px-2.5 py-0.5 rounded-lg">
                      ${ex.price}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="font-serif text-[#e6c280] font-bold text-sm uppercase leading-snug">
                        {ex.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {ex.duration} • <MapPin className="w-3.5 h-3.5" /> {ex.location.split(',')[0]}
                      </p>
                      <p className="text-stone-300 text-xs leading-relaxed line-clamp-2">
                        {ex.description}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone-900">
                      <button
                        onClick={() => handleDeleteExcursion(ex.id)}
                        className="text-stone-500 hover:text-red-400 p-2 bg-stone-950 rounded-xl hover:bg-stone-900 transition-colors cursor-pointer"
                        title="Ban Offering"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingExcursion(ex)}
                        className="flex-1 bg-stone-900 border border-stone-850 text-[#e6c280] text-xs font-mono uppercase tracking-widest py-2 rounded-xl hover:bg-[#201a14] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Offering
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: ADD OFFERING */}
            <AnimatePresence>
              {isAddOfferingOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <h3 className="font-serif text-[#e6c280] font-black text-xl uppercase">
                      Inscribe Divine Offering Excursion
                    </h3>

                    <form onSubmit={handleAddExcursionSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Trip Title</label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Dahab Blue Hole Pilgrimage"
                            value={newExTitle}
                            onChange={(e) => setNewExTitle(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Tagline Summary</label>
                          <input
                            type="text"
                            placeholder="Explore deep sea rifts"
                            value={newExTagline}
                            onChange={(e) => setNewExTagline(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Category</label>
                          <select
                            value={newExCategory}
                            onChange={(e) => setNewExCategory(e.target.value as any)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                          >
                            <option value="diving">Diving 𓆛</option>
                            <option value="safari">Desert Safari 𓅓</option>
                            <option value="history">Luxor History 𓉐</option>
                            <option value="boat">Boat Trip 𓊟</option>
                            <option value="speedboat">Speedboat 𓊡</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Rate (Tribute Gold Coins)</label>
                          <input
                            type="number"
                            required
                            value={newExPrice}
                            onChange={(e) => setNewExPrice(Number(e.target.value))}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Voyage Length</label>
                          <input
                            type="text"
                            value={newExDuration}
                            onChange={(e) => setNewExDuration(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Image URL (Assets or online)</label>
                          <input
                            type="text"
                            value={newExImage}
                            onChange={(e) => setNewExImage(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Sacred Location</label>
                          <input
                            type="text"
                            placeholder="E.g., Luxor, Egypt"
                            value={newExLocation}
                            onChange={(e) => setNewExLocation(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Inclusions (Semicolon separated)</label>
                          <input
                            type="text"
                            placeholder="Premium transport; Certified High Priest Guides; Fresh water of the Nile"
                            value={newExInclusions}
                            onChange={(e) => setNewExInclusions(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Highlights (Semicolon separated)</label>
                          <input
                            type="text"
                            placeholder="Inspect unique architectural glyphs; Engage with desert local tribes"
                            value={newExHighlights}
                            onChange={(e) => setNewExHighlights(e.target.value)}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-400 uppercase">Dossier Description</label>
                        <textarea
                          rows={3}
                          required
                          value={newExDesc}
                          onChange={(e) => setNewExDesc(e.target.value)}
                          placeholder="Provide deep immersive trip descriptors..."
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-400 uppercase">Scribe's Ancient Egyptology Lore</label>
                        <textarea
                          rows={2}
                          value={newExLore}
                          onChange={(e) => setNewExLore(e.target.value)}
                          placeholder="Ancient myth associated with the location or activities..."
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => setIsAddOfferingOpen(false)}
                          className="bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-mono uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer hover:bg-amber-300"
                        >
                          Inscribe Offering Catalog
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Modal: EDIT OFFERING */}
            <AnimatePresence>
              {editingExcursion && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <h3 className="font-serif text-[#e6c280] font-black text-xl uppercase">
                      Edit Divine Expedition Offering
                    </h3>

                    <form onSubmit={handleEditExcursionSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Trip Title</label>
                          <input
                            type="text"
                            required
                            value={editingExcursion.title}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, title: e.target.value })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Tagline Summary</label>
                          <input
                            type="text"
                            value={editingExcursion.tagline}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, tagline: e.target.value })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Category</label>
                          <select
                            value={editingExcursion.category}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, category: e.target.value as any })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                          >
                            <option value="diving">Diving 𓆛</option>
                            <option value="safari">Desert Safari 𓅓</option>
                            <option value="history">Luxor History 𓉐</option>
                            <option value="boat">Boat Trip 𓊟</option>
                            <option value="speedboat">Speedboat 𓊡</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Price (Gold Coins)</label>
                          <input
                            type="number"
                            required
                            value={editingExcursion.price}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, price: Number(e.target.value) })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Voyage Length</label>
                          <input
                            type="text"
                            value={editingExcursion.duration}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, duration: e.target.value })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Image URL</label>
                          <input
                            type="text"
                            value={editingExcursion.image}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, image: e.target.value })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Sacred Location</label>
                          <input
                            type="text"
                            value={editingExcursion.location}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, location: e.target.value })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Inclusions (Semicolon separated)</label>
                          <input
                            type="text"
                            value={editingExcursion.inclusions ? editingExcursion.inclusions.join('; ') : ''}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, inclusions: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[9px] font-mono text-stone-400 uppercase">Highlights (Semicolon separated)</label>
                          <input
                            type="text"
                            value={editingExcursion.highlights ? editingExcursion.highlights.join('; ') : ''}
                            onChange={(e) => setEditingExcursion({ ...editingExcursion, highlights: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                            className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-400 uppercase">Dossier Description</label>
                        <textarea
                          rows={3}
                          required
                          value={editingExcursion.description}
                          onChange={(e) => setEditingExcursion({ ...editingExcursion, description: e.target.value })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-400 uppercase">Scribe's Ancient Egyptology Lore</label>
                        <textarea
                          rows={2}
                          value={editingExcursion.ancientLore}
                          onChange={(e) => setEditingExcursion({ ...editingExcursion, ancientLore: e.target.value })}
                          className="w-full bg-[#1c1611] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingExcursion(null)}
                          className="bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-mono uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer hover:bg-amber-300"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 5: PUBLIC TESTIMONY BOARD MODERATION */}
        {activeTab === 'testimonies' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                𓂀 Public Testimony Moderation Bench
              </h3>
              <p className="text-stone-400 text-xs">Verify customer testimonies, or purge inappropriate/unapproved texts from Pharaoh's Monument Board.</p>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-[#18120d] border border-stone-850 rounded-2xl p-12 text-center text-stone-500 text-sm">
                  <p className="italic">Thy testimony review logs are currently empty. Scribe reviews inside the client module to populate this list.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#18120d] border border-stone-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rev.avatar ? rev.avatar.split(' ')[0] : '𓀚'}</span>
                        <div>
                          <h5 className="font-serif text-sm font-bold text-[#e6c280]">
                            {rev.author}
                          </h5>
                          <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block">
                            {rev.avatar ? rev.avatar.split(' ').slice(1).join(' ') : 'Noble Traveler'} • {rev.date}
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-300 text-xs italic leading-relaxed">
                        "{rev.comment}"
                      </p>

                      <span className="inline-block bg-[#120d09] border border-stone-800 text-[#d4af37]/80 rounded-full px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                        Excursion Target: {rev.excursionId}
                      </span>
                    </div>

                    <div className="flex gap-2 self-end sm:self-start">
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Purge Testimony
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 6: ORACLE SCRIBE logs & INQUIRIES */}
        {activeTab === 'oracle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                𓂀 AI Chat Lead Captures
              </h3>
              <p className="text-stone-400 text-xs">Observe live travelers consulting the AI Assistant to proactively design specialized follow-up offerings.</p>
            </div>

            <div className="space-y-4">
              {oracleLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#18120d] border border-stone-800 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#d4af37] text-xs font-serif">
                        𓋹
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wide">{log.name}</h4>
                        <span className="text-[10px] font-mono text-stone-500">{log.email}</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-stone-500 uppercase">{log.time}</span>
                  </div>

                  <div className="bg-[#14100c] rounded-xl p-3 border border-stone-900 text-xs text-stone-300">
                    <strong className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider block mb-1">
                      Traveler Scribe Query:
                    </strong>
                    "{log.query}"
                  </div>

                  {/* CRM followup button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        // Check if traveler profile exists or make one
                        const exists = crmProfiles.find((p) => p.email.toLowerCase() === log.email.toLowerCase());
                        if (exists) {
                          setEditingProfile(exists);
                          setActiveTab('nobles');
                        } else {
                          // Spawn traveler card from lead
                          const spawned: TravelerCRMProfile = {
                            id: `crm-${Date.now()}`,
                            name: log.name,
                            email: log.email,
                            vipTier: 'Noble',
                            leadStatus: 'Warm Prospect',
                            totalSpend: 0,
                            lastActive: log.time.split(' ')[0],
                            scribeNotes: `Lead captured from Oracle conversation. Primary inquiry was: ${log.query}`,
                            inquiriesCount: 2
                          };
                          setCrmProfiles([spawned, ...crmProfiles]);
                          setEditingProfile(spawned);
                          setActiveTab('nobles');
                          triggerNotification("Traveler card spawned from Scribe inquiry!");
                        }
                      }}
                      className="bg-[#d4af37] hover:bg-amber-400 text-[#140f0a] text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Convert to Noble Card & Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 7: IMPERIAL SCROLL SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                  𓇚 Imperial Scroll Subscribers
                </h3>
                <p className="text-stone-400 text-xs">Manage active email subscribers of the Court who have requested custom excursion scrolls and seasonal discounts.</p>
              </div>
              <button
                onClick={() => {
                  const confirmed = window.confirm("Are you sure you want to clear all active covenant newsletter signups from the stone tablets?");
                  if (confirmed) {
                    localStorage.setItem('kemet_newsletter_signups', JSON.stringify([]));
                    setSubscribers([]);
                    triggerNotification("All imperial newsletter signups have been revoked.");
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Clear All Tablets
              </button>
            </div>

            {/* Grid display or Table */}
            <div className="bg-[#18120d] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-[#211a13]/30 border-b border-stone-800/80 font-mono text-[10px] uppercase tracking-wider text-[#d4af37]">
                Active Parchments ({subscribers.length})
              </div>
              
              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-stone-500 italic text-xs">
                  No active subscribers are currently inscribed. Signups will appear here dynamically when explorers subscribe on the main page.
                </div>
              ) : (
                <div className="divide-y divide-stone-900 overflow-x-auto">
                  <table className="w-full text-left text-stone-300 text-xs min-w-[600px]">
                    <thead>
                      <tr className="bg-black/30 text-[10px] font-mono text-stone-500 uppercase tracking-widest border-b border-stone-900">
                        <th className="py-3 px-4">Royal Email Parchment</th>
                        <th className="py-3 px-4">Court Tier</th>
                        <th className="py-3 px-4">Targeted Interests</th>
                        <th className="py-3 px-4">Generated Promo Code</th>
                        <th className="py-3 px-4">Decree Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900">
                      {subscribers.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-stone-900/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#f3e5c8]">
                            {sub.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block text-[9px] font-serif uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                              sub.tier === 'pharaoh' 
                                ? 'bg-amber-500/10 border-amber-500/30 text-[#e6c280]' 
                                : sub.tier === 'scribe'
                                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                                : 'bg-stone-800 border-stone-700 text-stone-400'
                            }`}>
                              {sub.tier === 'pharaoh' ? '𓁠 Pharaoh' : sub.tier === 'scribe' ? '𓁟 Scribe' : '𓀚 Citizen'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                              {sub.interests.map((int: string) => (
                                <span key={int} className="text-[9px] font-mono uppercase bg-[#1e150e] border border-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded">
                                  {int}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] font-bold text-amber-500 select-all tracking-wider">
                              {sub.promoCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-stone-500">
                            {sub.signupDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Spawning Noble button */}
                              <button
                                onClick={() => {
                                  // Check if traveler profile exists or make one
                                  const exists = crmProfiles.find((p) => p.email.toLowerCase() === sub.email.toLowerCase());
                                  if (exists) {
                                    setEditingProfile(exists);
                                    setActiveTab('nobles');
                                    triggerNotification("Traveler card already exists!");
                                  } else {
                                    // Spawn traveler card
                                    const spawned: TravelerCRMProfile = {
                                      id: `crm-${Date.now()}`,
                                      name: sub.email.split('@')[0].toUpperCase(),
                                      email: sub.email,
                                      vipTier: sub.tier === 'pharaoh' ? 'Pharaoh' : sub.tier === 'scribe' ? 'High Priest' : 'Noble',
                                      leadStatus: 'Deposited Pilgrim',
                                      totalSpend: 0,
                                      lastActive: sub.signupDate,
                                      scribeNotes: `Lead converted from Newsletter subscriber. Code assigned: ${sub.promoCode}. Targeted categories: ${sub.interests.join(', ')}`,
                                      inquiriesCount: 1
                                    };
                                    const updated = [spawned, ...crmProfiles];
                                    setCrmProfiles(updated);
                                    localStorage.setItem('kemet_crm_profiles', JSON.stringify(updated));
                                    setEditingProfile(spawned);
                                    setActiveTab('nobles');
                                    triggerNotification("Successfully created Noble CRM Card!");
                                  }
                                }}
                                className="bg-[#d4af37]/10 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/35 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" /> Convert to Noble Card
                              </button>
                              
                              {/* Delete button */}
                              <button
                                onClick={() => {
                                  const filtered = subscribers.filter((s: any) => s.id !== sub.id);
                                  setSubscribers(filtered);
                                  localStorage.setItem('kemet_newsletter_signups', JSON.stringify(filtered));
                                  window.dispatchEvent(new Event('kemet_subscribers_updated'));
                                  triggerNotification("Newsletter subscription revoked.");
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 8: GOOGLE SHEETS DUAL DIRECTIONAL LEDGER SYNC */}
        {activeTab === 'sheets' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                𓇛 Sacred Google Sheets Sync
              </h3>
              <p className="text-stone-400 text-xs">
                Synchronize your local caravan bookings, crm nobles, subscribers, and AI chat transcripts dynamically with a Google Spreadsheet.
              </p>
            </div>

            {isGAuthLoading ? (
              <div className="bg-[#18120d] border border-stone-850 rounded-2xl p-12 text-center text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mx-auto mb-3" />
                <p className="font-mono text-xs uppercase tracking-widest">Restoring Google Scribe connection...</p>
              </div>
            ) : !gUser ? (
              /* Unauthorized State Card */
              <div className="bg-[#18120d] border border-[#d4af37]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#d4af37] to-amber-600"></div>
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/35">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-md font-bold text-[#e6c280] uppercase tracking-wide">
                        Chamber of Royal Scribes Locked
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        In order to push and pull tablets to Google Sheets, you must authorize this applet using your Google account.
                      </p>
                    </div>
                  </div>

                  <p className="text-stone-300 text-xs leading-relaxed">
                    Connecting to Google Sheets allows Kemet Tours to export your reservations, subscribers, catalog items, and lead funnels directly into professional sheet tabs, complete with elegant pre-applied Pharaonic dark-gold visual layouts.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await googleSignIn();
                          if (res) {
                            triggerNotification("Divine authorization accepted!");
                          }
                        } catch (err: any) {
                          alert(`Authorization failed: ${err.message || err}`);
                        }
                      }}
                      className="bg-gradient-to-r from-[#d4af37] to-[#b88e14] hover:from-amber-400 hover:to-amber-500 text-[#140f0a] text-xs font-mono font-bold uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" /> Sign In with Google & Sync
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Authorized State View */
              <div className="space-y-6">
                
                {/* Connection Status Panel */}
                <div className="bg-[#18120d] border border-stone-850 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={gUser.photoURL || "/src/assets/images/egypt_boat_trip_1784071711626.jpg"}
                      alt={gUser.displayName}
                      className="w-10 h-10 rounded-full border-2 border-[#d4af37]/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-mono text-[#f3e5c8] uppercase">
                          {gUser.displayName || 'Royal Scribe'}
                        </h4>
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
                          Authorized
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-stone-500">{gUser.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await logout();
                      triggerNotification("Scribe logged out successfully.");
                    }}
                    className="bg-stone-900/60 hover:bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Disconnect Scribe
                  </button>
                </div>

                {/* Configuration: Choose Columns and Spreadsheet ID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Select Columns */}
                  <div className="lg:col-span-4 bg-[#14100c] border border-stone-800 rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif text-[#e6c280] font-bold text-xs uppercase tracking-wider">
                      𓇜 1. Ledgers to Include
                    </h4>
                    <p className="text-[11px] text-stone-400">Select which data repositories will be pushed and merged during synchronization.</p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        { key: 'bookings', label: 'Caravan Bookings', count: bookings.length },
                        { key: 'subscribers', label: 'Newsletter Scroll Signups', count: subscribers.length },
                        { key: 'excursions', label: 'Excursions Catalog', count: excursions.length },
                        { key: 'crmProfiles', label: 'Sovereign Traveler CRM', count: crmProfiles.length },
                        { key: 'oracleLogs', label: 'AI Oracle Transcript Logs', count: oracleLogs.length }
                      ].map((tbl) => (
                        <label
                          key={tbl.key}
                          className="flex items-center justify-between p-2.5 bg-[#18120d]/50 border border-stone-850 hover:border-stone-800 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedSyncTables[tbl.key]}
                              onChange={(e) => setSelectedSyncTables({ ...selectedSyncTables, [tbl.key]: e.target.checked })}
                              className="w-4 h-4 rounded accent-[#d4af37] bg-stone-950 border-stone-800"
                            />
                            <span className="text-xs text-stone-300 font-medium">{tbl.label}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-stone-900 text-stone-400 px-2 py-0.5 rounded-md border border-stone-850">
                            {tbl.count}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Target Spreadsheet */}
                  <div className="lg:col-span-8 bg-[#14100c] border border-stone-800 rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif text-[#e6c280] font-bold text-xs uppercase tracking-wider">
                      𓉐 2. Target Spreadsheet
                    </h4>

                    {activeSpreadsheetId ? (
                      /* Connected spreadsheet display */
                      <div className="space-y-4">
                        <div className="bg-[#18120d] border border-[#d4af37]/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-amber-500 to-[#d4af37]"></div>
                          
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider block">Connected Active Spreadsheet</span>
                              <h5 className="font-serif font-bold text-stone-200 text-sm mt-0.5">
                                Kemet Tours - Sacred Royal Ledger 𓉐
                              </h5>
                            </div>
                            <a
                              href={activeSpreadsheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Open Spreadsheet in New Window"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block">Unique Document Identifier:</span>
                            <code className="text-[10px] font-mono bg-black/40 px-2.5 py-1.5 rounded border border-stone-900 text-stone-400 break-all block select-all">
                              {activeSpreadsheetId}
                            </code>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => {
                                const confirmDisconnect = window.confirm("Are you sure you want to unlink this Spreadsheet? This won't delete the spreadsheet in Google Drive, but we will stop syncing to it.");
                                if (confirmDisconnect) {
                                  setActiveSpreadsheetId('');
                                  setActiveSpreadsheetUrl('');
                                  triggerNotification("Spreadsheet unlinked.");
                                }
                              }}
                              className="text-red-400 hover:text-red-300 font-mono text-[9px] uppercase tracking-wider"
                            >
                              Disconnect Sheet
                            </button>
                          </div>
                        </div>

                        {/* Import / Export action area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Export */}
                          <button
                            disabled={isSyncing}
                            onClick={handleExportToSheets}
                            className={`p-4 bg-gradient-to-b from-[#251e16] to-[#16120e] hover:from-[#2e261d] hover:to-[#1e1812] border border-[#d4af37]/40 rounded-xl transition-all text-left flex flex-col justify-between h-32 relative group cursor-pointer ${
                              isSyncing ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-[#d4af37] text-xs font-mono font-bold uppercase tracking-wider">Export to Sheets</span>
                              <Upload className="w-5 h-5 text-[#d4af37] group-hover:translate-y-[-2px] transition-transform" />
                            </div>
                            <div>
                              <strong className="text-stone-300 text-xs block font-serif uppercase tracking-wider">Push Local Ledgers</strong>
                              <span className="text-[10px] text-stone-500 mt-0.5 block leading-tight">Overwrites values inside the spreadsheet tabs with current live state.</span>
                            </div>
                          </button>

                          {/* Import */}
                          <button
                            disabled={isSyncing}
                            onClick={handleImportFromSheets}
                            className={`p-4 bg-gradient-to-b from-[#181410] to-[#120f0c] hover:from-[#211a14] hover:to-[#17130f] border border-stone-800 rounded-xl transition-all text-left flex flex-col justify-between h-32 relative group cursor-pointer ${
                              isSyncing ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-amber-500 text-xs font-mono font-bold uppercase tracking-wider">Import from Sheets</span>
                              <Download className="w-5 h-5 text-amber-500 group-hover:translate-y-[2px] transition-transform" />
                            </div>
                            <div>
                              <strong className="text-stone-300 text-xs block font-serif uppercase tracking-wider">Pull Sheet Overrides</strong>
                              <span className="text-[10px] text-stone-500 mt-0.5 block leading-tight">Reads excursion price/title edits and booking status updates from Google Sheet back to Kemet.</span>
                            </div>
                          </button>

                        </div>
                      </div>
                    ) : (
                      /* Disconnected spreadsheet setup */
                      <div className="space-y-5">
                        <div className="bg-[#18120d] border border-stone-850 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block">Option A: Spawn Brand New Ledger</span>
                          <p className="text-xs text-stone-400">Creates a clean spreadsheet styled beautifully with the Royal Kemet palette in your Google Drive.</p>
                          <button
                            disabled={isSyncing}
                            onClick={handleExportToSheets}
                            className="bg-[#d4af37] hover:bg-amber-400 text-[#140f0a] text-xs font-mono uppercase font-bold tracking-wider px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Create & Format New Spreadsheet
                          </button>
                        </div>

                        <div className="bg-[#18120d] border border-stone-850 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block">Option B: Connect Existing Spreadsheet</span>
                          <p className="text-xs text-stone-400">Enter a Google Sheet ID to bind to an existing ledger on Google Drive.</p>
                          <div className="flex gap-2 max-w-lg">
                            <input
                              type="text"
                              placeholder="e.g. 1aBCDeFGhIJKLMNoPQRsTUVwXYz12345"
                              value={activeSpreadsheetId}
                              onChange={(e) => setActiveSpreadsheetId(e.target.value.trim())}
                              className="bg-black/50 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 font-mono flex-1 focus:outline-none focus:border-[#d4af37]/50"
                            />
                            <button
                              onClick={() => {
                                if (!activeSpreadsheetId) {
                                  alert("Please specify a valid Spreadsheet ID first!");
                                  return;
                                }
                                setActiveSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`);
                                triggerNotification("Spreadsheet linked successfully!");
                              }}
                              className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg cursor-pointer"
                            >
                              Link Sheet
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations & Status feedback console */}
                {(isSyncing || syncStatus !== 'idle') && (
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
                    syncStatus === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                      : syncStatus === 'error'
                      ? 'bg-red-500/10 border-red-500/35 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                  }`}>
                    {isSyncing ? (
                      <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />
                    ) : syncStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-xs font-mono leading-tight">{syncMessage}</span>
                  </div>
                )}

                {/* Ancient Egyptology Scribe Lore Footer Card */}
                <div className="bg-[#120d09] border border-stone-900 rounded-2xl p-4 flex gap-3 items-center">
                  <span className="text-2xl opacity-60">𓂀</span>
                  <p className="text-[10px] text-stone-500 italic leading-relaxed">
                    "The Royal Scribes of Thoth recorded every grain of gold and every caravan on clay tablets. Today, we synchronize our ledgers into the ethereal cloud sheets of Google to preserve Kemet's glory for eternity."
                  </p>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* TAB 9: BOOKING ANALYTICS */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookingAnalytics bookings={bookings} excursions={excursions} />
          </motion.div>
        )}

        {/* TAB 10: SECURITY AUDIT TRAIL LOGS */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header / Summary bar */}
            <div className="bg-[#16110d] border border-[#d4af37]/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-bold">
                    Sacred Security Audit Vault
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#f3e5c8] mt-1">
                  High Priest Administrative Audit Trail
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Real-time recording of all system access, ledger modifications, and administrative security actions.
                </p>
              </div>

              <button
                onClick={handleExportSecurityLogs}
                className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                aria-label="Export Security Audit Logs to CSV file"
              >
                <Download className="w-4 h-4" />
                <span>Export Security Logs (CSV)</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#14100c] border border-stone-800 p-4 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={securitySearch}
                  onChange={(e) => setSecuritySearch(e.target.value)}
                  placeholder="Filter logs by event, action, or details..."
                  className="w-full bg-[#1c1611] border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-mono text-stone-400 uppercase">Status:</span>
                <select
                  value={securityFilterStatus}
                  onChange={(e) => setSecurityFilterStatus(e.target.value)}
                  className="bg-[#1c1611] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="REVOKED">REVOKED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

            {/* Table of Security Logs */}
            <div className="bg-[#14100c] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-[#1c1611] text-[#d4af37] border-b border-stone-800 uppercase text-[10px] tracking-wider">
                      <th className="p-4">Log ID & Timestamp</th>
                      <th className="p-4">Event Type</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">User & IP</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900 text-stone-300">
                    {securityLogs
                      .filter((log) => {
                        const matchesSearch =
                          log.eventType.toLowerCase().includes(securitySearch.toLowerCase()) ||
                          log.action.toLowerCase().includes(securitySearch.toLowerCase()) ||
                          log.details.toLowerCase().includes(securitySearch.toLowerCase()) ||
                          log.id.toLowerCase().includes(securitySearch.toLowerCase());
                        const matchesStatus =
                          securityFilterStatus === 'all' || log.status === securityFilterStatus;
                        return matchesSearch && matchesStatus;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-[#1a140d]/60 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <span className="text-[#d4af37] font-bold block">{log.id}</span>
                            <span className="text-[10px] text-stone-500 block mt-0.5">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-stone-200 whitespace-nowrap">
                            <span className="bg-[#1e1812] border border-[#d4af37]/20 text-[#e6c280] px-2 py-1 rounded text-[10px]">
                              {log.eventType}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-stone-100">{log.action}</td>
                          <td className="p-4 whitespace-nowrap text-stone-400">
                            <span className="text-stone-300 block font-medium">{log.userRole}</span>
                            <span className="text-[10px] text-stone-500 block">{log.ipAddress}</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : log.status === 'REVOKED'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : log.status === 'WARNING'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 text-stone-400 max-w-xs truncate">{log.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* TICKET QR SCANNER MODAL FOR ADMINS */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full">
              <TicketScanner
                bookings={bookings}
                onVerifyCheckIn={(bookingId) => {
                  if (onVerifyCheckIn) {
                    onVerifyCheckIn(bookingId);
                  } else {
                    onUpdateBookingStatus(bookingId, 'Completed');
                  }
                  triggerNotification(`Ticket #${bookingId.slice(-6).toUpperCase()} verified & checked-in!`);
                }}
                onClose={() => setIsScannerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* INTERNAL NOTE MODAL FOR HIGH PRIEST */}
        {activeNoteModalBooking && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18120d] border border-[#d4af37]/50 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-stone-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest block font-bold">
                    Sacred Ledger Note
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#e6c280] mt-0.5">
                    Internal Note for Booking #{activeNoteModalBooking.id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {activeNoteModalBooking.travelerName} • {activeNoteModalBooking.excursionTitle}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveNoteModalBooking(null);
                    setNoteInputText('');
                  }}
                  className="text-stone-500 hover:text-stone-300 p-1 rounded-lg hover:bg-stone-850 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-stone-300 uppercase tracking-wider block">
                  High Priest Confidential Notes & Special Details:
                </label>
                <textarea
                  rows={4}
                  value={noteInputText}
                  onChange={(e) => setNoteInputText(e.target.value)}
                  placeholder="Record special requests, VIP dietary needs, custom transport arrangements, or high priest instructions..."
                  className="w-full bg-[#110d0a] border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "VIP High Priority Traveler",
                    "Special Dietary Needs",
                    "Hotel Pickup Confirmed",
                    "Private Guide Requested",
                    "Wheelchair Accessible Required"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setNoteInputText(prev => prev ? `${prev}\n- ${preset}` : `- ${preset}`);
                      }}
                      className="bg-stone-900 hover:bg-[#d4af37]/15 border border-stone-800 hover:border-[#d4af37]/40 text-[10px] font-mono text-stone-300 hover:text-[#d4af37] px-2 py-1 rounded-md cursor-pointer transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                {activeNoteModalBooking.internalNotes ? (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedBookings = bookings.map(b =>
                        b.id === activeNoteModalBooking.id ? { ...b, internalNotes: '' } : b
                      );
                      onUpdateBookingsList(updatedBookings);
                      triggerNotification(`Cleared internal note for booking #${activeNoteModalBooking.id.slice(-4)}`);
                      setActiveNoteModalBooking(null);
                      setNoteInputText('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Note
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNoteModalBooking(null);
                      setNoteInputText('');
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBookingInternalNote}
                    className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Internal Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
