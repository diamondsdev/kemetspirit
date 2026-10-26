# 𓂀 Kemet Tours - Powered by Mas International Agency: Sacred Excursions & Pharaonic Itineraries 𓋹

Kemet Tours - Powered by Mas International Agency is an immersive, ancient-Egypt-themed full-stack travel portal, CRM, and itinerary planner. It transports travelers to the mystical lands of the Nile, the Red Sea, and the Western deserts, blending a cohesive **Pharaonic visual identity** with sophisticated **Gemini 3.5 Flash Generative AI** capabilities and enterprise-grade **security & authentication safeguards**.

Designed to mimic a royal treasury and scribe’s papyrus scroll, Kemet Tours is optimized for both desktop and mobile screens, offering travelers and administrators an interactive, resilient portal into historical tours, mythical lore, real-time caravan management, and protected administrative controls.

---

## 📖 Table of Contents
1. [Core Features & Traveler Suite](#-core-features--traveler-suite)
2. [Interactive & Analytical Modules](#-interactive--analytical-modules)
3. [Administrator Command Center & Security Architecture](#-administrator-command-center--security-architecture)
4. [Enterprise Security, Auth & Protection](#-enterprise-security-auth--protection)
5. [Client-Side Routes & Hash Navigation](#-client-side-routes--hash-navigation)
6. [Multi-Lingual Support](#-multi-lingual-support)
7. [Visual Identity & Themes](#-visual-identity--themes)
8. [Tech Stack & Architecture](#-tech-stack--architecture)
9. [Comprehensive File Directory Structure](#-comprehensive-file-directory-structure)
10. [Database & API Route Reference](#-database--api-route-reference)
11. [Setup & Installation](#-setup--installation)
12. [Step-by-Step Walkthrough](#-step-by-step-walkthrough)

---

## 🌟 Core Features & Traveler Suite

### 1. 𓆛 Excursion Catalog (`ExcursionCatalog`)
*   Browse curated tour packages categorized by sea, chariot safari, and historic explorations (e.g., diving Ras Mohammed, desert safaris, and Valley of the Kings luxury voyages).
*   Filter by categories and search titles, taglines, or locations.
*   Every excursion comes with transparent pricing, duration, ratings, curated lists of inclusions/highlights, and a **Thematic Ancient Lore** snippet providing historical immersion.

### 2. 𓎬 Sacred Caravan Ledger & Enhanced Checkout (`ExcursionCatalog` & `BookingManager`)
*   Step-by-step hardened checkout interface for securing spots on excursions with instant input sanitization and rate-limit defenses.
*   Input guest counts, departure dates, traveler names, validated emails, **Phone Number**, **WhatsApp Number**, **Hotel Name**, **Room Number**, and **Preferred Pickup Time**.
*   **Promocode Scroll System**: Registered travelers can enter promotional scrolls (e.g. `PHARAOH25` for 25% off or `SOLSTICERA15` for 15% off) with live discount calculations applied directly to the total cost.
*   **Auto-Fill Convenience**: Pre-populates traveler contact information automatically from local account credentials.
*   Instantly generates a printable **Papyrus Scroll Invoice** featuring a full financial breakdown and priest blessings.
*   Triggers the **Sacred Scarab Celebration**—interactive, crawling golden scarabs running across the user's viewport upon successful reservations.
*   Embeds custom generated **QR Codes** (`BookingQRCode`) containing encrypted verification tokens for high-tech check-ins.

### 3. 🔐 User Account & Simplified Registration (`AuthModal` & `RegisterPage`)
*   **User-Friendly Interface**: Clear, plain-language sign-up and login workflows avoiding overly complex phrasing.
*   **Streamlined Registration Fields**: Hotel Name and Room Number have been removed from the registration form to keep account setup fast and simple (requires only Name, Email, Password, and Phone/WhatsApp).
*   **Selective Registration Policy**: Browsing tours and making standard bookings does NOT require account registration. Registration is optional and used for unlocking 30% promo discounts, saving profile preferences, and writing reviews.
*   Features client & server password verification, local token persistence (`kemet_user`), and custom avatar selection.

### 4. 🍪 Cookie Consent & Privacy Manager (`CookieConsentManager`)
*   **Plain-Language GDPR Compliance**: Interactive cookie consent banner explaining data collection in clear, easy-to-understand terms across 5 languages (English, German, Polish, Czech, and Arabic).
*   **Customizable Privacy Categories**: Allows travelers to toggle **Essential** (always active for logins and bookings), **Analytics** (performance tracking), and **Marketing** (special deals and 30% discount codes) preferences.
*   **Persistence & Browser Integration**: Stores consent state in `localStorage` and sets standard browser cookies (`kemet_cookie_consent`, `kemet_analytics_allowed`, `kemet_marketing_allowed`).
*   Includes a customizable modal dialog and feedback toast notifications on save.

### 5. 🔍 Centralized SEO & Dynamic Metadata Engine (`SEOMetadataManager` & `SEOHelper`)
*   **Dynamic Head Management**: Automatically updates document titles, meta descriptions, Open Graph social share tags, Twitter Cards, and canonical URLs when switching pages or inspecting excursion packages.
*   **Schema.org JSON-LD Integration**: Automatically injects rich structured data graphs for search engines, including `TravelAgency`, `Trip`, `FAQPage`, `TouristAttraction`, and `BreadcrumbList` schemas.

### 6. 𓋹 Gemini AI Scribe & Interactive Oracle (`ScribeOracle`)
*   **The Scribe Planner:** Connects server-side with Gemini 3.5 Flash to construct custom, bespoke travel itineraries based on interests, duration (days), intensity, and special requests. Outputs structured JSON styled as a royal greeting.
*   **The Scribe Chat:** Converse directly in real-time with *Sennedjem, Royal Scribe of Kemet*. Sennedjem speaks in elegant Pharaonic prose and provides answers about Egyptian mythology, travel tips, and desert coordinates. Guarded by a dedicated rate-limiter (12 petitions/min).

### 4. 𓁮 Cartouche Hieroglyph Generator (`CartoucheGenerator`)
*   Enter any name or word to see it instantly translated into authentic ancient Egyptian hieroglyphic glyph cards.
*   Provides the phonetic meaning and corresponding mythological symbol card for each letter (e.g., Scarab for transformation, Ankh for life, Eye of Horus for protection).

### 5. 𓁼 Egyptology Gallery & Reviews (`EgyptologyGallery` & `ReviewSystem`)
*   Explore a media gallery of ancient Egypt's visual wonders (temples, coral reefs, desert dunes) with category tabs.
*   Read and submit traveler reviews, choosing an Egyptian-themed traveler avatar (e.g., Pharaoh, High Priestess, Desert Nomad) and rating the caravan services with golden stars.

### 6. 𓋹 24-Hour Travel Departure Alert System
*   Built-in notification reminders alerting travelers who are within 28 hours of departure.
*   Prompts immediate actions (e.g., check-in verification, packing lists, and downloading certificates).

---

## 𓉶 Interactive & Analytical Modules

### 1. 𓉶 Interactive SVG Map of Ancient Sites (`AncientSitesMap`)
*   A responsive vector-drawn map charting historical ruins and ports throughout Egypt (Giza Plateau, Alexandria, Sinai Peninsula, Valley of the Kings, Philae Temple, Red Sea Reefs, and Abydos Temple).
*   Allows travelers to hover and click nodes to view ancient names (e.g., *Achet Chufu*, *Waset*, *Yebu*), localized historical facts, mystical lore, and associated travel excursions.
*   Includes a search panel to instantly pinpoint sites by name, region, or ancient history.

### 2. 𓍝 D3-Powered Donut Budget Calculator (`ExcursionExpenseCalculator`)
*   An advanced, client-side budget manager driven by **D3.js**.
*   Travelers can select or deselect their active excursions and set a custom budget limit.
*   Wired with dynamic transitions, rendering a high-fidelity golden donut chart demonstrating cost breakdowns, percentage slices, and threshold-exceeded alerts when costs surpass the traveler's budget.

### 3. 𓋹 Pharaonic Packing Essentials (`ScribeOracle` Packing Module)
*   An interactive, dynamically generated travel checklist tailored specifically to the traveler's planned or booked excursions.
*   Allows travelers to toggle excursions on and off to dynamically inject customized equipment requirements, auto-syncing from live bookings.
*   Features an interactive progress tracker with a sliding **Eye of Horus** `𓂀` symbol advancing along the bar.
*   Categorizes gear into General Egyptian Travel Essentials, Diving & Red Sea Explorations, Desert Safaris, and Sacred Temples.
*   Offers quick **Copy to Clipboard** plain-text exports and highly polished **PDF Printing Templates**.

### 4. 𓎂 Digital Keepsake Certificate (`DigitalKeepsakeCertificate`)
*   Generates a personalized, royal completion document awarding travelers the eternal title of *"Honorary Explorer of Kemet"*.
*   Features physical signature slots for the High Priest and Scribe, fully printable with ancient borders and stamps.

---

## 🔒 Enterprise Security, Auth & Protection

Kemet Tours implements a multi-layered security architecture designed to defend against common web vulnerabilities, brute-force attacks, XSS injection, and unauthorized data access:

1. **Dual-Tier Dynamic Rate Limiting (`apiRateLimiter`)**:
   * **Scribe AI Protection**: Caps Gemini generative AI planner and chat petitions to 12 requests per minute per IP address, preventing resource exhaustion and API key quota abuse.
   * **Public Form & Checkout Protection**: Caps public write endpoints (caravan bookings, user reviews, newsletter subscriptions, community photo uploads, check-ins) to 15 submissions per minute to defend against automated spamming and bot submissions.
   * **Admin Auth Protection**: Restricts login verification attempts to 10 tries per 15 minutes to thwart brute-force password guessing.

2. **Cryptographic Admin Session Management**:
   * Admin authentication utilizes time-bound cryptographic session tokens (`kemet-token-<timestamp>-<hash>`) generated server-side upon verifying the High Priest passcode.
   * Session tokens carry a mandatory 24-hour expiration window.
   * Unauthenticated or expired requests are automatically rejected with `401 Unauthorized` or `403 Forbidden` status codes, triggering an automatic client-side sanctuary session lock.
   * High Priests can click **"Lock Sanctuary"** in the command dashboard to immediately destroy the local admin token and lock access.

3. **XSS Mitigation & Input Sanitization (`sanitizeString`)**:
   * All traveler-submitted strings (names, emails, special requests, review text, newsletter entries) pass through a server-side sanitizer that strips `<script>` tags, raw HTML elements, and truncates inputs to safe maximum character lengths before writing to the database.

4. **HTTP Security Headers & CSP**:
   * `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing).
   * `X-XSS-Protection: 1; mode=block` (activates browser XSS filtering).
   * `Referrer-Policy: strict-origin-when-cross-origin` (protects referrer details).
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts unrequested hardware access).
   * Strict `Content-Security-Policy` allowing secure iframe embedding while shielding against clickjacking (`frame-ancestors 'self' *`).
   * Explicit removal of the `X-Powered-By` header (`app.disable('x-powered-by')`) to prevent server framework fingerprinting.

---

## 🧭 Client-Side Routes & Hash Navigation

Kemet Tours features clean, deep-linkable client routing synchronized with browser history:

*   **Deep Linking**: Travelers and admins can navigate directly to specific app views using URL hashes:
    *   `#tours` — Excursion Catalog & Filters
    *   `#map` — Interactive Ancient Sites Vector Map
    *   `#scribe` — Gemini AI Oracle, Itinerary Builder & Packing Checklist
    *   `#gallery` — Egyptology Media Gallery
    *   `#cartouche` — Hieroglyphic Name Generator
    *   `#faq` — Oracle's Wisdom FAQ
    *   `#bookings` — Traveler's Sacred Caravan Ledger & Checkout
    *   `#admin` — High Priest Administrative Sanctuary & CRM
*   **Browser History Support**: Users can seamlessly use the browser's Back and Forward buttons (`window.onhashchange`) without losing application state or interrupting active sessions.

---

## 𓂀 Administrator Command Center

### 1. 𓓳 Real-Time Booking Analytics (`BookingAnalytics`)
*   An executive dashboard utilizing **Recharts** representing business telemetry:
    *   *Timeline Area Charts:* Continuous stream tracking total caravan revenues over time.
    *   *Excursion Popularity Bar Charts:* Identifying highest-performing excursions based on total bookings and guest counts.
    *   *Category Pie Charts:* Distributing bookings by diving, safari, history, boat, or speedboat categories.
    *   *Ledger Status Distributions:* Mapping completed, confirmed, and pending voyages.

### 2. 𓂀 Sacred Ledger CRM & Tour CMS (`AdminDashboard`)
*   **Protected High Priest Gateway**: Unauthenticated access attempts present a sleek gold-embossed authentication gate requiring the High Priest passcode.
*   **Caravan Registry CRM with Bulk Actions:** Search and filter registered bookings by status (*Pending Oracle Approval*, *Confirmed by High Priest*, *Completed*). Perform bulk approvals or deletions.
*   **Tour CMS Panel:** Complete CRUD interface to create, edit, or delete excursions on-the-fly. Changes sync instantly across the catalog.
*   **Sanctuary Lock Control**: Dedicated button to instantly invalidate active session tokens and secure the admin portal.

### 3. 𓊟 QR Ticket Verification & Camera Scanner (`TicketScanner`)
*   Wired with **`jsqr`** to allow the High Priest to scan physical or mobile tickets.
*   Taps into the user's camera or accepts image files to parse the QR code and verify check-in status against the live server ledger in real time.

---

## 𓃠 Multi-Lingual Support

Kemet Tours features comprehensive multi-lingual translations across all components, allowing smooth switches between:
*   **EN:** English (International Travel Tongue)
*   **DE:** Deutsch (German)
*   **PL:** Polski (Polish)
*   **CS:** Čeština (Czech)

---

## 🎨 Visual Identity & Themes

*   **Desert Sand & Obsidian (Default):** Warm charcoal canvases (`#140f0c`), glowing Egyptian Gold borders (`#d4af37`), parchment card overlays, and subtle bronze shadows.
*   **Nile Blue (Aquatic Variant):** Cool obsidian backdrops paired with deep-river turquoise, lapis lazuli accents, and cool aquatic neon shadows.

---

## 🛠️ Tech Stack & Architecture

### Frontend
*   **React 19** & **Vite 6** (Single Page Application pipeline).
*   **Tailwind CSS v4** for modern utility layouts.
*   **Motion (from motion/react)** for seamless layout transitions.
*   **D3.js** for high-performance SVG budget donuts.
*   **Recharts** for business analytics graphs.
*   **Lucide React** for vector icons.
*   **jsQR** for client-side QR parsing.

### Backend
*   **Express Server (Node.js)** acting as a secure full-stack middleware and API registry.
*   **JSON Flat-File Persistence Engine:** Atomic file writes with automatic fallback data structures.
*   **tsx & esbuild** build setup compiling TypeScript server files into a single, optimized CommonJS bundle (`dist/server.cjs`).

### Generative AI Integration
*   **`@google/genai` SDK** interfacing server-side with `gemini-3.5-flash`.
*   Access keys are strictly server-bound to guarantee maximum API key protection.

---

## 📁 Comprehensive File Directory Structure

```text
├── .env.example              # Declarations of required server-side secret keys
├── server.ts                 # Hardened Express server (Vite dev middleware, security headers & REST APIs)
├── vite.config.ts            # Vite asset bundler configuration
├── package.json              # App dependencies, CLI scripts, and start commands
├── metadata.json             # AI Studio permissions & capability flags
├── src/
│   ├── main.tsx              # React client-side entry point
│   ├── index.css             # Tailwind CSS global styling and Pharaonic animations
│   ├── App.tsx               # Main application component with hash router & layout state
│   ├── types.ts              # TypeScript schemas (Excursion, Booking, Review, ScribeMessage, Itinerary)
│   ├── lib/
│   │   ├── firebaseAuth.ts   # Optional Firebase Auth provider integration
│   │   └── googleSheets.ts   # Google Sheets CSV sync helper
│   └── components/
│       ├── LanguageContext.tsx           # Multi-lingual context provider (EN, DE, PL, CS)
│       ├── AdminDashboard.tsx            # CMS, CRM registry, traveler simulators, and sanctuary controls
│       ├── BookingAnalytics.tsx          # Recharts area, bar, pie, and status telemetry charts
│       ├── ExcursionExpenseCalculator.tsx# D3-drawn dynamic golden donut budget chart
│       ├── ScribeOracle.tsx              # Gemini planner/chat & dynamic packing list with Horus tracker
│       ├── AncientSitesMap.tsx           # Interactive SVG vector map of Egyptian ruins
│       ├── TicketScanner.tsx             # jsQR web-camera scan validator
│       ├── BookingManager.tsx            # Hardened checkout wizard, guest registries, and printable invoices
│       ├── DetailedTicketCard.tsx        # High-fidelity individual ticket inspector with cancel triggers
│       ├── DigitalKeepsakeCertificate.tsx# Printable explorer certificate under the High Priest's seal
│       ├── CartoucheGenerator.tsx        # Hieroglyph phonetic cards translation deck
│       ├── EgyptologyGallery.tsx         # Media explorer filtered by category
│       ├── ReviewSystem.tsx              # Rating manager with themed Pharaoh/Nomad avatar selectors
│       ├── BookingQRCode.tsx             # QR Canvas rendering from ticket credentials
│       ├── OraclesWisdomFAQ.tsx          # Collapsible ancient Q&A accordion
│       ├── ScarabCelebration.tsx         # Particle system animation spawning golden crawling beetles
│       ├── PapyrusScrollCelebration.tsx  # Particle effect spawning drifting parchment scrolls
│       ├── ScrollItineraryModal.tsx      # Rolling papyrus scroll modal displaying AI itineraries
│       ├── SEOMetadataManager.tsx        # Centralized SEO meta tags & Schema.org JSON-LD generator
│       ├── SEOHelper.tsx                 # High-level SEO wrapper component
│       ├── CookieConsentManager.tsx      # Plain-language multi-lingual cookie banner & preferences modal
│       ├── PromotionalBanner.tsx         # Ancient marketing alerts and discount vouchers
│       ├── FooterNewsletter.tsx          # Newsletter collector with tier preferences
│       └── MobileBottomNav.tsx           # Sticky responsive touch-target navigation bar
```

---

## 🔌 Database & API Route Reference

The backend operates as a stateful JSON database server. Here is the REST specification:

### 1. Generative AI Cognitive Services (Rate Limited: 12 req/min)
*   `POST /api/itinerary`: Sends structured parameters to Gemini 3.5 Flash. Returns an itinerary matching the `CustomItinerary` JSON schema.
*   `POST /api/scribe-chat`: Forwards traveler prompts to Sennedjem, returning rich Pharaonic answers.

### 2. User Authentication (Rate Limited: 10 req/15 min)
*   `POST /api/auth/register`: Registers a new traveler account with encrypted password storage (`bcryptjs` hashing) and input sanitization.
*   `POST /api/auth/login`: Authenticates user credentials and returns user profile & authorization token.

### 3. Excursions (CRUD CMS - Admin Authenticated)
*   `GET /api/excursions`: Fetch all active tour packages.
*   `POST /api/excursions`: Add/Update an excursion (requires admin token or passcode header).
*   `DELETE /api/excursions/:id`: Banish an excursion from the temple database.

### 3. Bookings (CRM Caravan Ledger - Hardened & Rate Limited)
*   `GET /api/bookings`: Fetch all caravans registered (requires admin token or passcode header).
*   `POST /api/bookings`: Place a new caravan booking with input sanitization and guest validation.
*   `PUT /api/bookings/:id/status`: Update booking status (*confirmed*, *completed*, *cancelled*).
*   `DELETE /api/bookings/:id`: Banish a booking ledger entry.
*   `POST /api/bookings/:id/checkin`: Fast QR check-in verification.

### 4. Protected Administration & Security
*   `POST /api/admin/verify`: Authenticates passcode and returns a time-bound session token.
*   `POST /api/admin/purge`: Destroys active ledger entries (requires admin token/passcode).
*   `POST /api/admin/seed`: Seeds temple defaults (requires admin token/passcode).

---

## ⚙️ Setup & Installation

### 1. Configure Environment Variables
Copy `.env.example` to create a local `.env` file:
```bash
cp .env.example .env
```
Populate your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application runs on port **3000** (accessible at `http://localhost:3000`).

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

*“May your path be guided by the sun of Ra and the wisdom of Thoth as you travel through Kemet!”*
