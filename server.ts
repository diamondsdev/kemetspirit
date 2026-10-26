import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { processBookingEmailsAndSheet, sendNewsletterWelcomeEmail } from "./server/googleWorkspace";

// ==========================================
// SEED DATA DECLARATIONS
// ==========================================
const EXCURSIONS_DATA_SEED = [
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

const INITIAL_REVIEWS_SEED = [
  {
    id: 'rev-1',
    excursionId: 'diving-1',
    author: "Cleopatra the Diver",
    avatar: "𓁠 Cleopatra",
    rating: 5,
    comment: "I plunged into Ras Mohammed and was greeted by a massive underwater statue of Osiris, surrounded by thousands of golden glassfish. Truly, Sennedjem has aligned the elements perfectly. It felt like walking through a submerged palace of the Nile!",
    date: "2026-06-20"
  },
  {
    id: 'rev-2',
    excursionId: 'safari-1',
    author: "Ramses the Nomad",
    avatar: "𓀚 Ramses",
    rating: 5,
    comment: "Flying across the red dunes on a quad bike was as exhilarating as racing a war chariot in Kadesh! The Bedouin flatbread baked over acacia coals is delicious, and the stargazing is a true communion with Nut.",
    date: "2026-07-01"
  },
  {
    id: 'rev-3',
    excursionId: 'history-1',
    author: "Hatshepsut the Explorer",
    avatar: "𓁥 Hatshepsut",
    rating: 5,
    comment: "Visiting the mortuary temple in Luxor left my royal caravan speechless. The columns of Karnak are so wide they command complete silence. The private Felucca cruise on the Nile at sunset was absolute bliss.",
    date: "2026-07-11"
  }
];

// ==========================================
// DATABASE PERSISTENCE SETUP
// ==========================================
interface DatabaseSchema {
  excursions: any[];
  bookings: any[];
  reviews: any[];
  newsletter_signups: any[];
  oracle_logs: any[];
  community_photos?: any[];
  ancient_sites?: any[];
}

const ANCIENT_SITES_SEED = [
  {
    id: 'giza-pyramids',
    name: "Giza Plateau",
    ancientName: "Akhet Khufu",
    glyph: "𓉴",
    coordinates: { x: 265, y: 140 },
    region: "Lower Egypt",
    facts: [
      "Home to the Great Pyramid of Giza, the oldest of the Seven Wonders of the Ancient World.",
      "Guarded by the colossal Great Sphinx of Giza, carved from a single ridge of limestone.",
      "The pyramids were astronomically aligned with absolute precision to Orion's Belt."
    ],
    lore: "Known to the ancients as 'Akhet Khufu' (The Horizon of Khufu), this plateau was believed to be a cosmic launching pad. It allowed the soul of the Pharaoh to ascend into the northern circumpolar stars, joining the undying gods in the afterlife.",
    relatedExcursionName: "Custom Cairo Extension (Request via Scribe Oracle!)"
  },
  {
    id: 'luxor-waset',
    name: "Luxor (Karnak & Valley of Kings)",
    ancientName: "Waset",
    glyph: "𓉐",
    coordinates: { x: 308, y: 350 },
    region: "Upper Egypt",
    facts: [
      "Waset was the powerhouse of the New Kingdom, dedicated to the supreme sun creator Amun-Ra.",
      "Features Karnak, the largest religious temple complex ever constructed by human hands.",
      "Houses the Valley of the Kings, where pharaohs lay sealed in decorated hypogeum vaults."
    ],
    lore: "To cross from the East Bank (sunrise/living) to the West Bank (sunset/tomb) of Luxor is to traverse the mystical veil. The royal tombs are carved deep into the limestone pyramid of Al-Qurn, mimicking Ra's nightly journey into the underworld.",
    relatedExcursionId: "history-1",
    relatedExcursionName: "Pharaoh's Pilgrimage to Waset (Luxor)"
  },
  {
    id: 'ras-mohammed',
    name: "Ras Mohammed Sanctuary",
    ancientName: "Nun's Deep Sea Basin",
    glyph: "𓆛",
    coordinates: { x: 382, y: 205 },
    region: "Red Sea & Sinai",
    facts: [
      "A protected marine national park situated at the extreme tip of the Sinai Peninsula.",
      "Features spectacular vertical coral walls plunging over 1,000 meters into the deep sea.",
      "Home to vibrant ecosystems of Napoleon wrasse, sea turtles, and hammerhead sharks."
    ],
    lore: "Ancient mariners and priests of Hathor regarded the warm currents of Ras Mohammed as the physical manifestations of Nun—the primeval abyss from which all life emerged. Submerged monuments were left on shorelines to placate the sea spirits.",
    relatedExcursionId: "diving-1",
    relatedExcursionName: "Ras Mohammed Royal Coral Diving"
  },
  {
    id: 'hurghada-coast',
    name: "Hurghada Dunes & Deshret",
    ancientName: "Set's Deshret Coast",
    glyph: "𓅓",
    coordinates: { x: 370, y: 238 },
    region: "Red Sea & Eastern Desert",
    facts: [
      "A majestic frontier where the golden mountains of the Eastern Desert meet the Red Sea shore.",
      "Famous for rolling desert dunes, bedouin oases, and rugged mountain trail passes.",
      "Ideal location for fast quad expeditions and slow, stargazing sunset camel rides."
    ],
    lore: "This red desert land was called 'Deshret' (The Red Land) by pharaohs, feared yet respected as the chaotic domain of Set, god of storms. Ancient miners crossed these harsh lands to gather gold and turquoise for temple offerings.",
    relatedExcursionId: "safari-1",
    relatedExcursionName: "Set's Golden Deshret Safari"
  },
  {
    id: 'giftun-island',
    name: "Giftun Island (Orange Bay)",
    ancientName: "Sobek's Turquoise Realm",
    glyph: "𓍢",
    coordinates: { x: 388, y: 242 },
    region: "Red Sea Islands",
    facts: [
      "A protected natural reserve island famous for soft white sands and transparent crystal water.",
      "Surrounded by shallow, circular lagoons teeming with colorful corals.",
      "Dolphin pods are regularly spotted playing near its pristine shallow sandbars."
    ],
    lore: "In ancient times, sailing around the islands of the Red Sea was dedicated to honoring Sobek, the crocodile lord of waterways. Cedarwood pleasure ships decorated in gold leaf were rowed across these turquoise waters to earn divine favor.",
    relatedExcursionId: "boat-1",
    relatedExcursionName: "Sobek's Royal Queen Nefertari Cruise"
  },
  {
    id: 'el-gouna',
    name: "El Gouna & Northern Islands",
    ancientName: "Horus's Lagoon",
    glyph: "𓅃",
    coordinates: { x: 362, y: 218 },
    region: "Red Sea Lagoons",
    facts: [
      "A breathtaking network of shallow turquoise canals, lagoons, and sandy islands.",
      "Surrounded by secret, untouched offshore coral gardens away from the crowded public spots.",
      "Offers prime deep blue waters for fast-paced luxury speedboat explorations."
    ],
    lore: "The falcon god Horus, symbol of speed and divine sight, was said to patrol the Red Sea waters from the skies. Pharaonic scouts sailed swift papyrus skiffs through these lagoons, flashing mirror signals to protect inland borders.",
    relatedExcursionId: "speedboat-1",
    relatedExcursionName: "Horus's Falcon Eye Speedboat Cruise"
  }
];

const SEED_COMMUNITY_PHOTOS = [
  {
    id: "photo-seed-1",
    caption: "Catching the golden hour on our beautiful Felucca boat ride across the Nile!",
    author: "Amelia & Mark",
    location: "Luxor, Egypt",
    image: "/src/assets/images/egypt_boat_trip_1784071711626.jpg",
    createdAt: "2026-07-15T18:30:00.000Z"
  },
  {
    id: "photo-seed-2",
    caption: "Stunning desert sunset. Racing across the Sinai sand dunes was the highlight of our summer!",
    author: "Sebastian Vance",
    location: "Sinai Desert",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    createdAt: "2026-07-16T19:15:00.000Z"
  },
  {
    id: "photo-seed-3",
    caption: "Dived with thousands of glassfish and swam past a submerged statue of Osiris. Breathtaking!",
    author: "Elena Rostov",
    location: "Ras Mohammed Seabed",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    createdAt: "2026-07-17T09:00:00.000Z"
  }
];

interface DatabaseSchema {
  excursions: any[];
  bookings: any[];
  reviews: any[];
  newsletter_signups: any[];
  oracle_logs: any[];
  community_photos?: any[];
  ancient_sites?: any[];
  users?: any[];
  crm_profiles?: any[];
}

const SEED_CRM_PROFILES = [
  {
    id: "crm-1",
    name: "Cleopatra the Diver",
    email: "cleo.ocean@royal-kemet.com",
    vipTier: "Royal Prince",
    leadStatus: "Deposited Pilgrim",
    totalSpend: 1420,
    inquiriesCount: 6,
    lastActive: "2026-07-28",
    leadScore: 92,
    scribeNotes: "Prefers VIP yacht charters in Ras Mohammed with private Egyptologist-diver. Requested gourmet Bedouin seafood lunch.",
    phone: "+201012345678",
    whatsapp: "+201012345678",
    preferredLanguage: "English",
    tags: ["Scuba Diver", "VIP Royal", "Ras Mohammed"],
    activityTimeline: [
      { id: "act-1", type: "booking", title: "Booked Ras Mohammed Royal Coral Diving", date: "2026-07-20", details: "$240 deposit paid" },
      { id: "act-2", type: "note", title: "Scribe Note Added", date: "2026-07-22", details: "Confirmed private boat upgrade" }
    ]
  },
  {
    id: "crm-2",
    name: "Ramses the Nomad",
    email: "ramses.great@deshret-safaris.org",
    vipTier: "Pharaoh",
    leadStatus: "Eternal Royal Traveler",
    totalSpend: 2890,
    inquiriesCount: 12,
    lastActive: "2026-07-27",
    leadScore: 98,
    scribeNotes: "Repeat customer. Has completed 4 quad safaris in Hurghada and Luxor day trips. Very high budget.",
    phone: "+201098765432",
    whatsapp: "+201098765432",
    preferredLanguage: "Arabic",
    tags: ["Desert Safari", "Repeat Traveler", "High Budget"],
    activityTimeline: [
      { id: "act-3", type: "booking", title: "Booked Set's Golden Deshret Safari", date: "2026-07-22", details: "$225 paid for 3 guests" }
    ]
  },
  {
    id: "crm-3",
    name: "Amelia & Mark Vance",
    email: "vance.travelers@world.com",
    vipTier: "High Priest",
    leadStatus: "Warm Prospect",
    totalSpend: 450,
    inquiriesCount: 3,
    lastActive: "2026-07-26",
    leadScore: 74,
    scribeNotes: "Inquired via Scribe Oracle regarding Nile felucca sunset cruise and Valley of the Kings family packages.",
    phone: "+447700900077",
    whatsapp: "+447700900077",
    preferredLanguage: "English",
    tags: ["Family Group", "Nile Cruise", "Luxor"],
    activityTimeline: [
      { id: "act-4", type: "inquiry", title: "Inquired via AI Scribe Oracle", date: "2026-07-26", details: "Asked for Luxor family itinerary" }
    ]
  }
];

const DB_FILE_PATH = path.join(process.cwd(), "kemet_db.json");
const DB_FILE_FALLBACK_PATH = "/tmp/kemet_db.json";
let activeDbPath = DB_FILE_PATH;

// Self-verify write permissions on load
try {
  fs.writeFileSync(DB_FILE_PATH, fs.readFileSync(DB_FILE_PATH, 'utf8'), { flag: 'r+' });
} catch (e) {
  activeDbPath = DB_FILE_FALLBACK_PATH;
}

function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(activeDbPath)) {
      const defaultDb: DatabaseSchema = {
        excursions: EXCURSIONS_DATA_SEED,
        bookings: [],
        reviews: INITIAL_REVIEWS_SEED,
        newsletter_signups: [],
        oracle_logs: [],
        community_photos: SEED_COMMUNITY_PHOTOS,
        ancient_sites: ANCIENT_SITES_SEED
      };
      fs.writeFileSync(activeDbPath, JSON.stringify(defaultDb, null, 2), 'utf8');
      return defaultDb;
    }
    const raw = fs.readFileSync(activeDbPath, 'utf8');
    const parsed = JSON.parse(raw);
    let updated = false;
    if (!parsed.community_photos || parsed.community_photos.length === 0) {
      parsed.community_photos = SEED_COMMUNITY_PHOTOS;
      updated = true;
    }
    if (!parsed.ancient_sites || parsed.ancient_sites.length === 0) {
      parsed.ancient_sites = ANCIENT_SITES_SEED;
      updated = true;
    }
    if (updated) {
      fs.writeFileSync(activeDbPath, JSON.stringify(parsed, null, 2), 'utf8');
    }
    return parsed;
  } catch (err) {
    console.error("Database reading error, resolving with default seed structure:", err);
    return {
      excursions: EXCURSIONS_DATA_SEED,
      bookings: [],
      reviews: INITIAL_REVIEWS_SEED,
      newsletter_signups: [],
      oracle_logs: [],
      community_photos: SEED_COMMUNITY_PHOTOS,
      ancient_sites: ANCIENT_SITES_SEED
    };
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    const tempPath = `${activeDbPath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, activeDbPath);
  } catch (err) {
    console.error("Failed to commit changes atomically to the persistent database file:", err);
    try {
      fs.writeFileSync(activeDbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (fallbackErr) {
      console.error("Fallback saveDb error:", fallbackErr);
    }
  }
}

// Password hashing & verification with Node crypto PBKDF2
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, storedHash: string, storedSalt?: string): boolean {
  if (!storedSalt) {
    // Backwards compatibility for plain text legacy passwords
    return password === storedHash;
  }
  const hash = crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// User session token storage
const activeUserSessions = new Map<string, { userId: string; expiresAt: number }>();

function createSessionForUser(userId: string): { token: string; expiresAt: number } {
  const token = `usr-tok-${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeUserSessions.set(token, { userId, expiresAt });
  return { token, expiresAt };
}

// ==========================================
// GEMINI CLIENT SETUP
// ==========================================
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please set it in the Secrets panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// CUSTOM SECURITY MIDDLEWARES
// ==========================================

// Memory store for API Rate Limiting to prevent brute-force or AI API abuse
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

// Periodic rate limit store cleanup every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

function apiRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const limitInfo = rateLimitStore.get(ip);

    if (!limitInfo || now > limitInfo.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (limitInfo.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many petitions sent to the divine sanctuary. Please allow the cosmic alignment to balance before trying again."
      });
    }

    limitInfo.count += 1;
    rateLimitStore.set(ip, limitInfo);
    next();
  };
}

// Security Headers Middleware
function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), display-capture=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-src 'self' https:; " +
    "frame-ancestors 'self' *; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
}

// Active Admin Session Management
const activeAdminSessions = new Map<string, number>(); // token -> expiry timestamp

function isValidAdminSession(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const expiry = activeAdminSessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    activeAdminSessions.delete(token);
    return false;
  }
  return true;
}

// Admin Authorization Middleware
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcodeHeader = req.headers['x-admin-passcode'];
  const tokenHeader = (req.headers['x-admin-token'] as string) || (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const correctPasscode = process.env.ADMIN_PASSCODE || "pharaoh";

  if (passcodeHeader && (passcodeHeader as string).trim().toLowerCase() === correctPasscode.toLowerCase()) {
    return next();
  }

  if (tokenHeader && isValidAdminSession(tokenHeader.trim())) {
    return next();
  }

  res.status(403).json({ error: "Access Denied. You are not authorized inside the High Priest inner chamber." });
}

// Input sanitization helper to strip potentially malicious characters or script tags
function sanitizeString(str: any, maxLen: number = 500): string {
  if (typeof str !== 'string') return '';
  let sanitized = str.trim();
  // Strip dangerous script tags and raw HTML tags for XSS mitigation
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  if (sanitized.length > maxLen) {
    sanitized = sanitized.substring(0, maxLen);
  }
  return sanitized;
}

// ==========================================
// SERVER INITIALIZATION
// ==========================================
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));
  app.use(securityHeaders);

  // Global Rate Limiting Middleware for all API endpoints (120 requests / min / IP)
  const globalApiLimiter = apiRateLimiter(120, 60 * 1000);
  app.use("/api", globalApiLimiter);

  // ==========================================
  // SEO SITEMAP & ROBOTS GENERATOR
  // ==========================================
  app.get("/sitemap.xml", (req, res) => {
    try {
      const db = loadDb();
      const host = req.get('host') || 'kemet-tours.com';
      const protocol = req.protocol || 'https';
      const baseUrl = `${protocol}://${host}`;
      const today = new Date().toISOString().split('T')[0];

      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/#tours', priority: '0.9', changefreq: 'daily' },
        { url: '/#map', priority: '0.8', changefreq: 'weekly' },
        { url: '/#scribe', priority: '0.8', changefreq: 'weekly' },
        { url: '/#gallery', priority: '0.7', changefreq: 'monthly' },
        { url: '/#cartouche', priority: '0.7', changefreq: 'monthly' },
        { url: '/#faq', priority: '0.6', changefreq: 'monthly' },
        { url: '/#bookings', priority: '0.8', changefreq: 'daily' },
      ];

      const excursionPages = (db.excursions || []).map((ex: any) => ({
        url: `/#excursion-${ex.id}`,
        priority: '0.85',
        changefreq: 'weekly',
        title: ex.title,
        description: ex.description
      }));

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${excursionPages.map((ex: any) => `  <url>
    <loc>${baseUrl}${ex.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${ex.changefreq}</changefreq>
    <priority>${ex.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err) {
      console.error("Sitemap generation error:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const host = req.get('host') || 'kemet-tours.com';
    const protocol = req.protocol || 'https';
    const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${protocol}://${host}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // ==========================================
  // SYSTEM API ENDPOINTS
  // ==========================================

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), db: activeDbPath });
  });

  const adminLoginLimiter = apiRateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 mins
  const publicWriteLimiter = apiRateLimiter(15, 60 * 1000); // 15 write requests per minute

  // 2. Admin Verification
  app.post("/api/admin/verify", adminLoginLimiter, (req, res) => {
    const { passcode } = req.body;
    const correctPasscode = process.env.ADMIN_PASSCODE || "pharaoh";
    if (passcode && passcode.trim().toLowerCase() === correctPasscode.toLowerCase()) {
      const sessionToken = `kemet-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
      activeAdminSessions.set(sessionToken, expiry);
      res.json({ success: true, token: sessionToken, expiresAt: expiry });
    } else {
      res.status(401).json({ success: false, error: "Incorrect passcode. Access is restricted." });
    }
  });

  // ==========================================
  // EXCURSIONS CMS ENDPOINTS
  // ==========================================
  app.get("/api/excursions", (req, res) => {
    const db = loadDb();
    res.json(db.excursions);
  });

  app.post("/api/excursions", adminAuth, (req, res) => {
    try {
      const { id, title, tagline, category, duration, price, rating, location, image, description, inclusions, highlights, ancientLore } = req.body;
      const db = loadDb();

      const newExcursion = {
        id: id ? sanitizeString(id, 50) : `ex-${Date.now()}`,
        title: sanitizeString(title, 100),
        tagline: sanitizeString(tagline, 150),
        category: sanitizeString(category, 50),
        duration: sanitizeString(duration, 50),
        price: Math.max(1, Number(price) || 50),
        rating: Math.min(5, Math.max(1, Number(rating) || 5.0)),
        location: sanitizeString(location, 150),
        image: sanitizeString(image, 250),
        description: sanitizeString(description, 1000),
        inclusions: Array.isArray(inclusions) ? inclusions.map(i => sanitizeString(i, 200)) : [],
        highlights: Array.isArray(highlights) ? highlights.map(h => sanitizeString(h, 200)) : [],
        ancientLore: sanitizeString(ancientLore, 1000)
      };

      const existingIndex = db.excursions.findIndex(ex => ex.id === newExcursion.id);
      if (existingIndex > -1) {
        db.excursions[existingIndex] = newExcursion;
      } else {
        db.excursions.unshift(newExcursion);
      }

      saveDb(db);
      res.json(db.excursions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/excursions/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    db.excursions = db.excursions.filter(ex => ex.id !== id);
    saveDb(db);
    res.json(db.excursions);
  });

  app.post("/api/excursions/bulk", adminAuth, (req, res) => {
    try {
      const bulkData = req.body;
      if (!Array.isArray(bulkData)) {
        return res.status(400).json({ error: "Excursions list must be an array." });
      }

      const db = loadDb();
      bulkData.forEach((ex: any) => {
        const newExcursion = {
          id: ex.id ? sanitizeString(ex.id, 50) : `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: sanitizeString(ex.title, 100),
          tagline: sanitizeString(ex.tagline, 150),
          category: sanitizeString(ex.category, 50),
          duration: sanitizeString(ex.duration, 50),
          price: Math.max(1, Number(ex.price) || 50),
          rating: Math.min(5, Math.max(1, Number(ex.rating) || 5.0)),
          location: sanitizeString(ex.location, 150),
          image: sanitizeString(ex.image, 250) || "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
          description: sanitizeString(ex.description, 1000),
          inclusions: Array.isArray(ex.inclusions) ? ex.inclusions.map((i: any) => sanitizeString(i, 200)) : [
            "Premium transport under royal flag",
            "Certified High Priest Guides",
            "Fresh water of the Nile"
          ],
          highlights: Array.isArray(ex.highlights) ? ex.highlights.map((h: any) => sanitizeString(h, 200)) : [
            "Inspect unique architectural glyphs",
            "Engage with desert/maritime local tribes"
          ],
          ancientLore: sanitizeString(ex.ancientLore, 1000) || "This sacred terrain was aligned to grant safety under the eye of Horus."
        };

        const existingIndex = db.excursions.findIndex(existing => existing.id === newExcursion.id);
        if (existingIndex > -1) {
          db.excursions[existingIndex] = newExcursion;
        } else {
          db.excursions.unshift(newExcursion);
        }
      });

      saveDb(db);
      res.json(db.excursions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/excursions/sync-public-sheet", adminAuth, (req, res) => {
    try {
      const bulkData = req.body;
      if (!Array.isArray(bulkData)) {
        return res.status(400).json({ error: "Sacred excursions list must be a contiguous array." });
      }

      const db = loadDb();
      const parsedExcursions = bulkData.map((ex: any, index: number) => {
        return {
          id: ex.id ? sanitizeString(ex.id, 50) : `ex-sheet-${Date.now()}-${index}`,
          title: sanitizeString(ex.title, 100),
          tagline: sanitizeString(ex.tagline, 150),
          category: sanitizeString(ex.category, 50) || "diving",
          duration: sanitizeString(ex.duration, 50) || "Full Day",
          price: Math.max(1, Number(ex.price) || 100),
          rating: Math.min(5, Math.max(1, Number(ex.rating) || 5.0)),
          location: sanitizeString(ex.location, 150) || "Red Sea, Egypt",
          image: sanitizeString(ex.image, 250) || "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
          description: sanitizeString(ex.description, 1000) || "Explore the grand wonders of Kemet.",
          inclusions: Array.isArray(ex.inclusions) ? ex.inclusions.map((i: any) => sanitizeString(i, 200)) : (typeof ex.inclusions === 'string' ? ex.inclusions.split(',').map((s: string) => sanitizeString(s, 200)) : []),
          highlights: Array.isArray(ex.highlights) ? ex.highlights.map((h: any) => sanitizeString(h, 200)) : (typeof ex.highlights === 'string' ? ex.highlights.split(',').map((s: string) => sanitizeString(s, 200)) : []),
          ancientLore: sanitizeString(ex.ancientLore, 1000) || "This ancient land holds great divine alignment."
        };
      }).filter(e => e.title);

      if (parsedExcursions.length > 0) {
        db.excursions = parsedExcursions;
        saveDb(db);
      }
      res.json(db.excursions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Direct Google Sheets API Integration Endpoint
  app.post("/api/excursions/fetch-google-sheet", async (req, res) => {
    try {
      const rawInput = req.body.sheetUrl || req.body.spreadsheetId || "1Ms9LU8f20q3wX5fNaw8JqkIbB_QlDmeAN8ZEIdTFKKc";
      const match = rawInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const spreadsheetId = match ? match[1] : rawInput;
      let token = req.headers.authorization || (req.body.accessToken ? `Bearer ${req.body.accessToken}` : '');

      let rows: any[][] = [];

      // 1. Try Google Sheets API v4 if token is present
      if (token) {
        if (!token.startsWith('Bearer ')) token = `Bearer ${token}`;
        try {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z500`;
          const sheetsResponse = await fetch(url, {
            headers: { Authorization: token }
          });

          if (sheetsResponse.ok) {
            const data = await sheetsResponse.json();
            rows = data.values || [];
          }
        } catch (e) {
          console.warn("Sheets API v4 request failed, trying CSV fallback:", e);
        }
      }

      // 2. Fallback to gviz CSV export if rows still empty
      if (!rows || rows.length === 0) {
        try {
          const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
          const csvResponse = await fetch(csvUrl);
          if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            // Basic CSV parser for lines
            const lines = csvText.split(/\r?\n/);
            rows = lines.map(line => {
              // Parse simple CSV values
              const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
              if (matches) {
                return matches.map(m => m.replace(/^"|"$/g, '').trim());
              }
              return line.split(',').map(s => s.trim());
            });
          }
        } catch (e) {
          console.warn("CSV export fetch failed:", e);
        }
      }

      if (!rows || rows.length < 2) {
        const db = loadDb();
        return res.json({ 
          success: true, 
          count: db.excursions.length, 
          excursions: db.excursions,
          notice: "Using active local database excursions catalog." 
        });
      }

      const headers = rows[0].map((h: any) => String(h || '').toLowerCase().trim());
      const excursionsList: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0]) continue;

        const getVal = (fieldNames: string[]) => {
          for (const fn of fieldNames) {
            const idx = headers.findIndex((h: string) => h.includes(fn));
            if (idx !== -1 && row[idx]) return String(row[idx]).trim();
          }
          return '';
        };

        const title = getVal(['title', 'name', 'tour']);
        if (!title) continue;

        const tagline = getVal(['tagline', 'subtitle', 'motto']);
        const category = getVal(['category', 'type']) || 'diving';
        const duration = getVal(['duration', 'time', 'hours']) || 'Full Day';
        const price = Number(getVal(['price', 'cost', 'rate'])) || 120;
        const rating = Number(getVal(['rating', 'stars', 'score'])) || 4.9;
        const location = getVal(['location', 'place', 'city']) || 'Red Sea, Egypt';
        const image = getVal(['image', 'photo', 'url', 'picture']) || '/src/assets/images/egypt_sea_diving_1784070366165.jpg';
        const description = getVal(['description', 'desc', 'details', 'about']);
        const inclusionsRaw = getVal(['inclusions', 'includes', 'included']);
        const highlightsRaw = getVal(['highlights', 'features', 'key']);
        const ancientLore = getVal(['ancientlore', 'lore', 'history', 'story']);

        excursionsList.push({
          id: `sheet-item-${i}`,
          title: sanitizeString(title, 100),
          tagline: sanitizeString(tagline, 150) || "Sacred excursion through ancient Kemet",
          category: sanitizeString(category, 50),
          duration: sanitizeString(duration, 50),
          price: Math.max(1, price),
          rating: Math.min(5, Math.max(1, rating)),
          location: sanitizeString(location, 150),
          image: sanitizeString(image, 250),
          description: sanitizeString(description, 1000) || "Experience the historic beauty of Egypt.",
          inclusions: inclusionsRaw ? inclusionsRaw.split(/[;,\n]/).map((s: string) => sanitizeString(s.trim(), 200)).filter(Boolean) : [],
          highlights: highlightsRaw ? highlightsRaw.split(/[;,\n]/).map((s: string) => sanitizeString(s.trim(), 200)).filter(Boolean) : [],
          ancientLore: sanitizeString(ancientLore, 1000) || "Aligned under the sacred skies of Egypt."
        });
      }

      if (excursionsList.length > 0) {
        const db = loadDb();
        db.excursions = excursionsList;
        saveDb(db);
        return res.json({ success: true, count: excursionsList.length, excursions: db.excursions });
      } else {
        const db = loadDb();
        return res.json({ success: true, count: db.excursions.length, excursions: db.excursions });
      }
    } catch (err: any) {
      console.error("Error fetching Google Sheet:", err);
      const db = loadDb();
      return res.json({ success: true, count: db.excursions.length, excursions: db.excursions });
    }
  });

  // ==========================================
  // USER AUTHENTICATION ENDPOINTS
  // ==========================================
  app.post("/api/auth/register", publicWriteLimiter, (req, res) => {
    try {
      const { name, email, password, phone, whatsapp, hotelName, roomNumber } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password are required to register a royal account." });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }

      const db = loadDb();
      if (!db.users) db.users = [];

      const existing = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "An account with this email already exists. Please log in instead." });
      }

      const { hash, salt } = hashPassword(password);
      const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newUser = {
        id: userId,
        name: sanitizeString(name, 100),
        email: sanitizeString(email, 100).toLowerCase(),
        password: hash,
        salt: salt,
        phone: sanitizeString(phone, 40),
        whatsapp: sanitizeString(whatsapp, 40),
        hotelName: sanitizeString(hotelName, 120),
        roomNumber: sanitizeString(roomNumber, 40),
        role: "traveler",
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDb(db);

      const session = createSessionForUser(userId);
      const { password: _, salt: __, ...userSafe } = newUser;
      res.json({ success: true, user: userSafe, token: session.token, expiresAt: session.expiresAt });
    } catch (err: any) {
      console.error("Auth register error:", err);
      res.status(500).json({ error: "Failed to register account." });
    }
  });

  app.post("/api/auth/login", publicWriteLimiter, (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const db = loadDb();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password. Please verify your credentials." });
      }

      const isMatch = verifyPassword(password, user.password, user.salt);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password. Please verify your credentials." });
      }

      // Upgrade legacy unhashed password to salted hash on successful login
      if (!user.salt) {
        const { hash, salt } = hashPassword(password);
        user.password = hash;
        user.salt = salt;
        saveDb(db);
      }

      const session = createSessionForUser(user.id);
      const { password: _, salt: __, ...userSafe } = user;
      res.json({ success: true, user: userSafe, token: session.token, expiresAt: session.expiresAt });
    } catch (err: any) {
      console.error("Auth login error:", err);
      res.status(500).json({ error: "Failed to authenticate." });
    }
  });

  app.post("/api/auth/request-reset", publicWriteLimiter, (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Please enter your registered email address." });
      }

      const db = loadDb();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "No account found with this email address. Please register a new account." });
      }

      // Generate a 6-digit sacred pin for resetting password
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPin = pin;
      user.resetPinExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      saveDb(db);

      res.json({
        success: true,
        message: "Sacred verification code generated and sent to your email.",
        demoPin: pin
      });
    } catch (err: any) {
      console.error("Auth request-reset error:", err);
      res.status(500).json({ error: "Failed to process reset request." });
    }
  });

  app.post("/api/auth/reset-password", publicWriteLimiter, (req, res) => {
    try {
      const { email, resetPin, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }

      const db = loadDb();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "User account not found." });
      }

      if (user.resetPin && user.resetPin !== resetPin?.trim()) {
        return res.status(400).json({ error: "Invalid verification code. Please check your code or request a new one." });
      }

      if (user.resetPinExpiry && Date.now() > user.resetPinExpiry) {
        return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
      }

      const { hash, salt } = hashPassword(newPassword);
      user.password = hash;
      user.salt = salt;
      delete user.resetPin;
      delete user.resetPinExpiry;
      saveDb(db);

      const { password: _, salt: __, ...userSafe } = user;
      res.json({ success: true, user: userSafe, message: "Password updated successfully!" });
    } catch (err: any) {
      console.error("Auth reset-password error:", err);
      res.status(500).json({ error: "Failed to reset password." });
    }
  });

  // ==========================================
  // CARAVAN BOOKINGS ENDPOINTS
  // ==========================================
  app.get("/api/bookings", adminAuth, (req, res) => {
    const db = loadDb();
    res.json(db.bookings);
  });

  app.post("/api/bookings", publicWriteLimiter, async (req, res) => {
    try {
      const {
        excursionId,
        excursionTitle,
        travelerName,
        travelerEmail,
        phoneNumber,
        whatsappNumber,
        hotelName,
        roomNumber,
        pickupTime,
        date,
        numberOfGuests,
        totalCost,
        promoCodeUsed,
        discountAmount,
        specialRequests
      } = req.body;
      const accessToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || req.body.accessToken;
      const db = loadDb();

      // Simple secure inputs validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!travelerName || !travelerEmail || !emailRegex.test(travelerEmail)) {
        return res.status(400).json({ error: "Noble traveler name and a valid email are required to register inside the ledger." });
      }

      const guestsCount = Math.min(25, Math.max(1, Number(numberOfGuests) || 1));
      const costAmount = Math.max(0, Number(totalCost) || 0);

      const newBooking = {
        id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        excursionId: sanitizeString(excursionId, 50),
        excursionTitle: sanitizeString(excursionTitle, 100),
        travelerName: sanitizeString(travelerName, 100),
        travelerEmail: sanitizeString(travelerEmail, 100),
        phoneNumber: sanitizeString(phoneNumber, 40),
        whatsappNumber: sanitizeString(whatsappNumber || phoneNumber, 40),
        hotelName: sanitizeString(hotelName, 120),
        roomNumber: sanitizeString(roomNumber, 40),
        pickupTime: sanitizeString(pickupTime, 40),
        date: sanitizeString(date, 30),
        numberOfGuests: guestsCount,
        totalCost: costAmount,
        promoCodeUsed: sanitizeString(promoCodeUsed, 40),
        discountAmount: Number(discountAmount) || 0,
        specialRequests: sanitizeString(specialRequests, 500),
        status: "Pending Oracle Approval",
        createdAt: new Date().toISOString()
      };

      db.bookings.unshift(newBooking);
      saveDb(db);

      // Async process Google Workspace integration (Kemet Bookings Sheet & Gmail alerts)
      let workspaceSync = { sheetSynced: false, emailsSent: false };
      if (accessToken) {
        try {
          workspaceSync = await processBookingEmailsAndSheet(accessToken, newBooking);
        } catch (wsErr) {
          console.error("Workspace integration error during booking creation:", wsErr);
        }
      }

      res.json({
        ...newBooking,
        sheetSynced: workspaceSync.sheetSynced,
        emailsSent: workspaceSync.emailsSent
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/bookings/:id/status", adminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = loadDb();
    const booking = db.bookings.find(b => b.id === id);

    if (booking) {
      booking.status = sanitizeString(status, 50);
      saveDb(db);
      res.json({ success: true, bookings: db.bookings });
    } else {
      res.status(404).json({ error: "Booking ledger entry not found." });
    }
  });

  app.delete("/api/bookings/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    db.bookings = db.bookings.filter(b => b.id !== id);
    saveDb(db);
    res.json({ success: true, bookings: db.bookings });
  });

  // Instant Check-In Verification from QR Scanner
  app.post("/api/bookings/:id/checkin", publicWriteLimiter, (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const booking = db.bookings.find(b => b.id === id);

    if (booking) {
      booking.status = "Completed";
      booking.checkedIn = true;
      saveDb(db);
      res.json({ success: true, booking, bookings: db.bookings });
    } else {
      res.status(404).json({ error: "Booking ledger entry not found." });
    }
  });

  // ==========================================
  // REVIEW BOARD ENDPOINTS
  // ==========================================
  app.get("/api/reviews", (req, res) => {
    const db = loadDb();
    res.json(db.reviews);
  });

  app.post("/api/reviews", publicWriteLimiter, (req, res) => {
    try {
      const { excursionId, author, avatar, rating, comment } = req.body;
      if (!author || !comment) {
        return res.status(400).json({ error: "Reviewer name and testimony content are required." });
      }

      const db = loadDb();
      const ratingVal = Math.min(5, Math.max(1, Number(rating) || 5));

      const newReview = {
        id: `rev-${Date.now()}`,
        excursionId: sanitizeString(excursionId, 50),
        author: sanitizeString(author, 100),
        avatar: sanitizeString(avatar, 100),
        rating: ratingVal,
        comment: sanitizeString(comment, 1000),
        date: new Date().toISOString().split('T')[0]
      };

      db.reviews.unshift(newReview);
      saveDb(db);
      res.json(newReview);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // ANCIENT SITES ENDPOINTS
  // ==========================================
  app.get("/api/ancient-sites", (req, res) => {
    const db = loadDb();
    res.json(db.ancient_sites || []);
  });

  // ==========================================
  // COMMUNITY TRAVELS BOARD ENDPOINTS
  // ==========================================
  app.get("/api/community-photos", (req, res) => {
    const db = loadDb();
    res.json(db.community_photos || []);
  });

  app.post("/api/community-photos", publicWriteLimiter, (req, res) => {
    try {
      const { image, caption, author, location } = req.body;
      if (!image || !author) {
        return res.status(400).json({ error: "Image data and author name are required." });
      }

      const db = loadDb();
      if (!db.community_photos) {
        db.community_photos = [];
      }

      const newPhoto = {
        id: `photo-${Date.now()}`,
        image, 
        caption: sanitizeString(caption, 280),
        author: sanitizeString(author, 100),
        location: sanitizeString(location, 100),
        createdAt: new Date().toISOString()
      };

      db.community_photos.unshift(newPhoto);
      saveDb(db);
      res.json(newPhoto);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // NEWSLETTER BOARD ENDPOINTS
  // ==========================================
  app.get("/api/newsletter", adminAuth, (req, res) => {
    const db = loadDb();
    res.json(db.newsletter_signups);
  });

  app.post("/api/newsletter", publicWriteLimiter, async (req, res) => {
    try {
      const { email, interests, tier, accessToken } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(String(email).trim())) {
        return res.status(400).json({ error: "Please offer a valid email address (e.g. traveler@example.com)." });
      }

      const trimmedEmail = String(email).toLowerCase().trim();
      const db = loadDb();
      if (db.newsletter_signups.some(sub => sub.email.toLowerCase() === trimmedEmail)) {
        return res.status(400).json({ error: "Your email is already registered inside our newsletter scrolls!" });
      }

      const promoCode = `RAMSES-${Math.floor(Math.random() * 9000) + 1000}-30`;
      const newSignup = {
        id: `sub-${Date.now()}`,
        email: trimmedEmail,
        interests: Array.isArray(interests) ? interests.map(i => sanitizeString(i, 30)) : ['all'],
        tier: sanitizeString(tier, 30) || 'scribe',
        signupDate: new Date().toISOString().split('T')[0],
        promoCode
      };

      db.newsletter_signups.unshift(newSignup);
      saveDb(db);

      // Trigger sending welcome email template
      let welcomeEmailSent = false;
      try {
        const emailResult = await sendNewsletterWelcomeEmail(accessToken, trimmedEmail, promoCode, newSignup.interests);
        welcomeEmailSent = emailResult.emailSent;
      } catch (wsErr) {
        console.error("Welcome email dispatch warning:", wsErr);
      }

      res.json({
        success: true,
        signup: newSignup,
        promoCode,
        welcomeEmailSent
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // SANCTUARY ADMINISTRATION MAINTENANCE
  // ==========================================
  app.post("/api/admin/purge", adminAuth, (req, res) => {
    const db = loadDb();
    db.bookings = [];
    db.reviews = [];
    db.newsletter_signups = [];
    db.oracle_logs = [];
    db.excursions = EXCURSIONS_DATA_SEED;
    saveDb(db);
    res.json({ success: true, message: "Sanctuary fully purified of transient data records." });
  });

  app.post("/api/admin/seed", adminAuth, (req, res) => {
    const db = loadDb();
    db.bookings = [
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
    db.reviews = INITIAL_REVIEWS_SEED;
    db.newsletter_signups = [
      {
        id: 'sub-seed-1',
        email: 'alexander.great@macedon.org',
        interests: ['diving', 'history'],
        tier: 'pharaoh',
        signupDate: '2026-07-10',
        promoCode: 'RAMSES-8821-30'
      }
    ];
    db.excursions = EXCURSIONS_DATA_SEED;
    saveDb(db);
    res.json({ success: true, message: "Divine seed data safely injected into the server." });
  });

  // ==========================================
  // GEMINI COGNITIVE SERVICES (RATE LIMITED)
  // ==========================================

  // Apply maximum 20 requests per IP per minute limit for all Generative AI services
  const geminiRateLimiter = apiRateLimiter(20, 60000);

  // API Route: Custom Pharaoh Itinerary Creator using Gemini 3.5 Flash
  app.post("/api/itinerary", geminiRateLimiter, async (req, res) => {
    try {
      const durationDays = Math.min(14, Math.max(1, Number(req.body.durationDays) || 3));
      const interest = sanitizeString(req.body.interest, 150);
      const intensity = sanitizeString(req.body.intensity, 100);
      const companion = sanitizeString(req.body.companion, 100);
      const customPreferences = sanitizeString(req.body.customPreferences, 300);

      const prompt = `You are Sennedjem, the Royal Scribe of Kemet, an ancient Egyptian counselor and travel sage. 
Craft a bespoke, day-by-day vacation itinerary located around the Red Sea, Egypt (specifically based out of Hurghada/Sharm El Sheikh).

User preferences:
- Duration: ${durationDays} Days
- Focus: ${interest || 'Balanced Exploration (Corals, Desert, History)'}
- Pace/Intensity: ${intensity || 'Leisurely'}
- Companions: ${companion || 'Solo traveler'}
- Special Requests / Input Language: ${customPreferences || 'None'}

CRITICAL LANGUAGE RULE: Detect the language of the user's inputs/preferences or special requests (e.g. Arabic, German, Polish, Czech, English, Spanish, French, Italian, etc.) and write the entire itinerary (greeting, title, themes, activities, wisdom, and blessing) in that exact language!

Incorporate these elements:
1. A poetic Pharaonic introduction greeting the traveler as a visiting noble or dignitary.
2. Day-by-day activities pairing Red Sea wonders (diving Ras Mohammed, Giftun Island, snorkeling reefs) with majestic Desert Safaris (camel treks, Bedouin tea, star gazing under the eye of Nut) and historic Ancient Egypt excursions (like a day-trip to Luxor/Karnak or a mystical valley tour).
3. "Scribe's Wisdom": Ancient lore, mythical trivia, or safety tips for each day (e.g. mentioning Anubis, Ra, Osiris, or the god of the sea, Nun).
4. A concluding royal blessing or cartouche blessing in prose.

Ensure the output is formatted as a clean, structured JSON object with the following JSON schema:
{
  "royalGreeting": "Greeting string",
  "title": "A Pharaonic title for the itinerary",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme of the day",
      "activities": ["Activity 1", "Activity 2"],
      "scribeWisdom": "Lore, myth or tip for this day"
    }
  ],
  "blessing": "Concluding blessing"
}

Respond ONLY with valid JSON. Do not wrap in markdown blocks, do not write anything else.`;

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedItinerary = JSON.parse(responseText.trim());
      res.json(parsedItinerary);
    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ 
        error: error.message || "Failed to summon the Royal Scribe. Please check your Gemini API key." 
      });
    }
  });

  // API Route: Royal Scribe Interactive Oracle Chat
  app.post("/api/scribe-chat", geminiRateLimiter, async (req, res) => {
    try {
      const message = sanitizeString(req.body.message, 1000);
      const { chatHistory, excursions, bookings } = req.body;
      const accessToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || req.body.accessToken;
      const ai = getAI();

      // Fetch latest server database state to enrich the Scribe's context
      const db = loadDb();
      const availableExcursions = excursions || db.excursions;
      const userBookings = bookings || db.bookings;

      let contextString = "";
      if (availableExcursions && availableExcursions.length > 0) {
        contextString += "\nAVAILABLE EXCURSIONS IN OUR CATALOG:\n";
        availableExcursions.forEach((ex: any) => {
          contextString += `- ID: "${ex.id}"\n  Title: "${ex.title}"\n  Category: "${ex.category}"\n  Price: ${ex.price}\n  Duration: "${ex.duration}"\n  Highlights: ${ex.highlights?.join(', ') || ''}\n  Ancient Lore: "${ex.ancientLore || ''}"\n`;
        });
      }

      if (userBookings && userBookings.length > 0) {
        contextString += "\nTHE USER'S CURRENT BOOKINGS (CARAVAN LEDGER):\n";
        userBookings.forEach((b: any) => {
          contextString += `- Booking ID: "${b.id}"\n  Excursion Title: "${b.excursionTitle}" (ID: "${b.excursionId}")\n  Traveler Name: "${b.travelerName}"\n  Traveler Email: "${b.travelerEmail}"\n  Scheduled Date: "${b.date}"\n  Guests: ${b.numberOfGuests}\n  Total Cost: ${b.totalCost}\n  Status: "${b.status}"\n  Special Requests: "${b.specialRequests || 'None'}"\n`;
        });
      } else {
        contextString += "\nThe traveler currently has no active bookings in our ledger.\n";
      }

      const systemInstruction = `You are Sennedjem, the wise Royal Scribe of Kemet. You speak in a highly sophisticated, polite, and atmospheric Pharaonic style. You use terms like 'noble traveler', 'Kemet', 'the gift of the Nile', 'the golden sun of Ra', 'by the grace of Isis'.
You are an expert on Egyptian mythology, history, desert safaris, and the secrets of the Red Sea (Nun's great waters).

Here is the real-time context of our sanctuary's excursions and the traveler's active bookings:
${contextString}

Guidelines for your responses:
1. Speak as a wise, poetic counselor. Under no circumstances should you break character.
2. CRITICAL MULTILINGUAL AUTOMATIC DETECT RULE: Automatically detect the language of the traveler's message or chat history (e.g., Arabic, German, Polish, Czech, English, Spanish, French, Italian, Russian, Chinese, Japanese, Dutch, etc.) and respond fluently, accurately, and naturally in that EXACT SAME LANGUAGE while retaining your atmospheric, polite Pharaonic Scribe persona and tone.
3. If the user asks for recommendations, refer to the available excursions listed above by name and customize your suggestions based on their interests. Mention the price or duration if relevant to help them plan.
4. If the user wants to book an excursion or provides booking details (e.g. tour name/ID, traveler name, traveler email, date, number of guests), confirm the reservation warmly in character in their language.
CRITICAL: Whenever you confirm or record a booking for the traveler, you MUST append this exact JSON trigger tag on a new line at the very end of your message:
[[CREATE_BOOKING:{"excursionTitle":"<Tour Title>","travelerName":"<Full Name>","travelerEmail":"<Email>","date":"<YYYY-MM-DD or date string>","numberOfGuests":<Number>,"totalCost":<Calculated Price>,"specialRequests":"<Any special notes>"}]]
5. If the user asks about their bookings or status, consult the "CURRENT BOOKINGS" above.
6. Keep your responses relatively concise (1-2 short paragraphs) but highly immersive, flavorful, and formatted using clean markdown.`;

      let prompt = "";
      if (chatHistory && Array.isArray(chatHistory)) {
        prompt += "Here is our previous conversation:\n";
        chatHistory.slice(-10).forEach((h: any) => {
          const authorRole = h.role === 'user' ? 'Traveler' : 'Scribe Sennedjem';
          const text = sanitizeString(h.text, 500);
          if (text) {
            prompt += `${authorRole}: ${text}\n`;
          }
        });
        prompt += "\n";
      }
      prompt += `Traveler: ${message}\nScribe Sennedjem:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
        }
      });

      let responseText = response.text || "";
      let newBookingCreated: any = null;

      // Detect [[CREATE_BOOKING:...]] trigger tag in AI output
      const bookingMatch = responseText.match(/\[\[CREATE_BOOKING:(.*?)\]\]/s);
      if (bookingMatch) {
        try {
          const bookingData = JSON.parse(bookingMatch[1].trim());
          const matchingEx = (availableExcursions || []).find((e: any) => 
            e.title.toLowerCase().includes((bookingData.excursionTitle || '').toLowerCase()) ||
            (bookingData.excursionTitle || '').toLowerCase().includes(e.title.toLowerCase())
          );

          const guests = Math.max(1, Number(bookingData.numberOfGuests) || 1);
          const pricePerGuest = matchingEx ? matchingEx.price : 120;
          const calculatedCost = Number(bookingData.totalCost) || (pricePerGuest * guests);

          newBookingCreated = {
            id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            excursionId: matchingEx ? matchingEx.id : 'custom-excursion',
            excursionTitle: bookingData.excursionTitle || (matchingEx ? matchingEx.title : 'Kemet Excursion'),
            travelerName: sanitizeString(bookingData.travelerName || 'Noble Traveler', 100),
            travelerEmail: sanitizeString(bookingData.travelerEmail || 'traveler@kemet.com', 100),
            date: sanitizeString(bookingData.date || new Date().toISOString().split('T')[0], 30),
            numberOfGuests: guests,
            totalCost: calculatedCost,
            specialRequests: sanitizeString(bookingData.specialRequests || 'Booked via Sennedjem AI Scribe', 500),
            status: 'Confirmed by AI Scribe',
            createdAt: new Date().toISOString()
          };

          const dbState = loadDb();
          dbState.bookings.unshift(newBookingCreated);
          saveDb(dbState);

          // Strip the raw trigger tag from response text
          responseText = responseText.replace(/\[\[CREATE_BOOKING:(.*?)\]\]/s, '').trim();

          // Sync to Google Sheet 'Kemet Bookings' & Send emails via Gmail
          if (accessToken) {
            try {
              const syncRes = await processBookingEmailsAndSheet(accessToken, newBookingCreated);
              if (syncRes.sheetSynced) {
                responseText += `\n\n📜 *Recorded in Google Sheet: **Kemet Bookings***\n✉️ *Confirmation emails dispatched to **${newBookingCreated.travelerEmail}** & **kemettoursagency@gmail.com***`;
              }
            } catch (wsErr) {
              console.warn("Google Workspace sync error during Scribe booking:", wsErr);
            }
          } else {
            responseText += `\n\n📜 *Booking Ref ID ${newBookingCreated.id} recorded in local ledger.*`;
          }
        } catch (parseErr) {
          console.error("Error parsing AI Scribe booking JSON:", parseErr);
        }
      }

      // Save to Oracle chats log for administrative insight
      try {
        const dbState = loadDb();
        dbState.oracle_logs.unshift({
          id: `log-${Date.now()}`,
          name: newBookingCreated ? newBookingCreated.travelerName : "Anonymous Traveler",
          email: newBookingCreated ? newBookingCreated.travelerEmail : "Session Chat Guest",
          query: message,
          time: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
        if (dbState.oracle_logs.length > 50) dbState.oracle_logs = dbState.oracle_logs.slice(0, 50);
        saveDb(dbState);
      } catch (logErr) {
        // ignore log error
      }

      res.json({ response: responseText, bookingCreated: newBookingCreated });
    } catch (error: any) {
      console.error("Error in scribe chat:", error);
      res.status(500).json({ 
        error: error.message || "Failed to consult the Oracle. Please check your Gemini API key." 
      });
    }
  });

  // ==========================================
  // SEO SITEMAP & ROBOTS ENDPOINTS
  // ==========================================
  app.get("/sitemap.xml", (req, res) => {
    const db = loadDb();
    const baseUrl = "https://kemet-excursions.app";
    const excursionsXml = (db.excursions || []).map(ex => `
  <url>
    <loc>${baseUrl}/#excursion-${ex.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#excursions</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#planner</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#reviews</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>${excursionsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/
Sitemap: https://kemet-excursions.app/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  // ==========================================
  // CRM CLIENTS & PROFILES API ENDPOINTS
  // ==========================================
  app.get("/api/crm/profiles", adminAuth, (req, res) => {
    const db = loadDb();
    if (!db.crm_profiles || db.crm_profiles.length === 0) {
      db.crm_profiles = SEED_CRM_PROFILES;
      saveDb(db);
    }
    res.json(db.crm_profiles);
  });

  app.post("/api/crm/profiles", adminAuth, (req, res) => {
    try {
      const { name, email, phone, whatsapp, vipTier, leadStatus, scribeNotes, tags } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required to create a CRM client profile." });
      }

      const db = loadDb();
      if (!db.crm_profiles) db.crm_profiles = [];

      const newProfile = {
        id: `crm-${Date.now()}`,
        name: sanitizeString(name, 100),
        email: sanitizeString(email, 100).toLowerCase(),
        phone: sanitizeString(phone, 40),
        whatsapp: sanitizeString(whatsapp || phone, 40),
        vipTier: sanitizeString(vipTier, 40) || "Pharaoh Pilgrim",
        leadStatus: sanitizeString(leadStatus, 40) || "Active Inquiry",
        totalSpend: 0,
        inquiriesCount: 1,
        lastActive: new Date().toISOString().split('T')[0],
        leadScore: 75,
        scribeNotes: sanitizeString(scribeNotes, 1000),
        tags: Array.isArray(tags) ? tags.map(t => sanitizeString(t, 30)) : ["New Prospect"],
        activityTimeline: [
          {
            id: `act-${Date.now()}`,
            type: "created",
            title: "CRM Profile Created",
            date: new Date().toISOString().split('T')[0],
            details: "Client profile manually added to High Priest CRM."
          }
        ]
      };

      db.crm_profiles.unshift(newProfile);
      saveDb(db);
      res.json(db.crm_profiles);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/crm/profiles/:id", adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const db = loadDb();
      if (!db.crm_profiles) db.crm_profiles = [];

      const profile = db.crm_profiles.find(p => p.id === id);
      if (!profile) {
        return res.status(404).json({ error: "CRM client profile not found." });
      }

      const { name, email, phone, whatsapp, vipTier, leadStatus, scribeNotes, leadScore, tags } = req.body;
      if (name) profile.name = sanitizeString(name, 100);
      if (email) profile.email = sanitizeString(email, 100);
      if (phone !== undefined) profile.phone = sanitizeString(phone, 40);
      if (whatsapp !== undefined) profile.whatsapp = sanitizeString(whatsapp, 40);
      if (vipTier) profile.vipTier = sanitizeString(vipTier, 40);
      if (leadStatus) profile.leadStatus = sanitizeString(leadStatus, 40);
      if (scribeNotes !== undefined) profile.scribeNotes = sanitizeString(scribeNotes, 1000);
      if (leadScore !== undefined) profile.leadScore = Number(leadScore) || 50;
      if (Array.isArray(tags)) profile.tags = tags.map(t => sanitizeString(t, 30));

      profile.lastActive = new Date().toISOString().split('T')[0];

      saveDb(db);
      res.json(db.crm_profiles);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/crm/profiles/:id/notes", adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      if (!note) return res.status(400).json({ error: "Note content is required." });

      const db = loadDb();
      if (!db.crm_profiles) db.crm_profiles = [];

      const profile = db.crm_profiles.find(p => p.id === id);
      if (!profile) return res.status(404).json({ error: "Profile not found." });

      const cleanNote = sanitizeString(note, 500);
      profile.scribeNotes = profile.scribeNotes ? `${profile.scribeNotes}\n[${new Date().toISOString().split('T')[0]}]: ${cleanNote}` : cleanNote;
      if (!profile.activityTimeline) profile.activityTimeline = [];
      profile.activityTimeline.unshift({
        id: `act-${Date.now()}`,
        type: "note",
        title: "Scribe Note Added",
        date: new Date().toISOString().split('T')[0],
        details: cleanNote
      });

      saveDb(db);
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // CLIENT ROUTING AND STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Kemet Excursions] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
