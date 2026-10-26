import React, { useEffect } from 'react';
import { Excursion } from '../types';

export type PageType = 
  | 'tours' 
  | 'map' 
  | 'scribe' 
  | 'gallery' 
  | 'cartouche' 
  | 'faq' 
  | 'bookings' 
  | 'admin' 
  | 'login' 
  | 'register' 
  | 'reset-password' 
  | 'profile';

interface SEOMetadataManagerProps {
  activePage: PageType;
  activeExcursion?: Excursion | null;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  customUrl?: string;
}

export default function SEOMetadataManager({
  activePage,
  activeExcursion,
  customTitle,
  customDescription,
  customImage,
  customUrl
}: SEOMetadataManagerProps) {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kemettours.com';
    const defaultImage = "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80";

    let pageTitle = "Kemet Tours - Powered by Mas International Agency | Premium Red Sea Excursions";
    let metaDesc = "Book VIP Red Sea scuba diving in Ras Mohammed, Hurghada desert ATV safaris, and ancient Luxor temple pilgrimages with Kemet Tours - Powered by Mas International Agency.";
    let shareImg = customImage || defaultImage;
    let canonicalPath = `#${activePage}`;
    let isNoIndex = false;
    let jsonLdSchemas: any[] = [];

    // Base Travel Agency Schema (Present across pages)
    const agencySchema = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "@id": `${origin}/#organization`,
      "name": "Kemet Tours - Powered by Mas International Agency",
      "alternateName": "Kemet Red Sea & Nile Expeditions",
      "url": origin,
      "logo": `${origin}/icon.png`,
      "image": defaultImage,
      "description": "Premier Red Sea luxury excursion provider, offering Hurghada desert safaris, Sharm El Sheikh diving, and Luxor pharaonic expeditions.",
      "telephone": "+20-100-555-KEMET",
      "email": "expeditions@kemettours.com",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "El Mamsha Promenade, Touristic Center",
        "addressLocality": "Hurghada",
        "addressRegion": "Red Sea Governorate",
        "postalCode": "84511",
        "addressCountry": "EG"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 27.2579,
        "longitude": 33.8116
      },
      "sameAs": [
        "https://facebook.com/KemetToursEgypt",
        "https://instagram.com/KemetToursOfficial"
      ]
    };

    // Construct Page Specific Metadata
    if (activeExcursion) {
      pageTitle = `${activeExcursion.title} (${activeExcursion.duration}) - Kemet Tours`;
      metaDesc = `${activeExcursion.description.substring(0, 155)}... Book now for $${activeExcursion.price} USD per person. Included: ${activeExcursion.inclusions.slice(0, 3).join(', ')}.`;
      shareImg = activeExcursion.image || defaultImage;
      canonicalPath = `#excursion-${activeExcursion.id}`;

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "Trip",
        "name": activeExcursion.title,
        "description": activeExcursion.description,
        "image": activeExcursion.image,
        "offers": {
          "@type": "Offer",
          "price": activeExcursion.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `${origin}/#excursion-${activeExcursion.id}`,
          "validFrom": new Date().toISOString().split('T')[0]
        },
        "itinerary": {
          "@type": "ItemList",
          "numberOfItems": activeExcursion.highlights.length,
          "itemListElement": activeExcursion.highlights.map((h, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": h
          }))
        },
        "provider": {
          "@type": "TravelAgency",
          "name": "Kemet Tours - Powered by Mas International Agency",
          "url": origin
        }
      });
    } else {
      switch (activePage) {
        case 'tours':
          pageTitle = "VIP Red Sea Excursions & Ancient Egyptian Caravans | Kemet Tours";
          metaDesc = "Explore Hurghada quad bike safaris, Ras Mohammed VIP scuba diving, Luxor temple day trips, and Nile felucca cruises. Book directly with instant confirmation.";
          canonicalPath = "#tours";
          
          jsonLdSchemas.push(agencySchema);
          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Excursion Catalog", "item": `${origin}/#tours` }
            ]
          });
          break;

        case 'map':
          pageTitle = "Interactive Ancient Egypt Sites & Sanctuary Map | Kemet Tours";
          metaDesc = "Explore interactive map coordinates for Giza Pyramids, Luxor Karnak Temple, Ras Mohammed marine sanctuary, and Hurghada Deshret dunes.";
          canonicalPath = "#map";

          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            "name": "Ancient Egyptian Sacred Sites & Red Sea Reserves",
            "description": "Interactive GIS cartography of pharaonic temples, tombs, and marine sanctuaries.",
            "location": {
              "@type": "Place",
              "name": "Nile River Valley & Red Sea Coast",
              "address": { "@type": "PostalAddress", "addressCountry": "EG" }
            }
          });
          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Interactive Sanctuary Map", "item": `${origin}/#map` }
            ]
          });
          break;

        case 'scribe':
          pageTitle = "Royal AI Itinerary Creator (Gemini 3.5 Flash) | Kemet Tours";
          metaDesc = "Generate a bespoke, day-by-day vacation itinerary across the Red Sea and ancient Nile Valley powered by the Scribe Oracle Sennedjem.";
          canonicalPath = "#scribe";

          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Scribe Oracle Sennedjem AI Itinerary Planner",
            "applicationCategory": "TravelApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript",
            "description": "AI-powered custom itinerary engine for Egypt & Red Sea travel."
          });
          break;

        case 'gallery':
          pageTitle = "Imperial Egyptology Gallery & Artifact Showcase | Kemet Tours";
          metaDesc = "High-resolution historical showcase of Tutankhamun gold relics, Nefertiti artifacts, and Red Sea coral reef marine life.";
          canonicalPath = "#gallery";

          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "Imperial Egyptology & Marine Sanctuary Gallery",
            "description": "Curated digital gallery of ancient Egyptian heritage and Red Sea underwater marvels."
          });
          break;

        case 'cartouche':
          pageTitle = "Hieroglyphic Cartouche Stamp Generator | Kemet Tours";
          metaDesc = "Inscribe your name in ancient Egyptian hieroglyphs, customize royal seals, and download high-resolution pharaonic cartouche artwork.";
          canonicalPath = "#cartouche";

          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Pharaonic Cartouche Seal Generator",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "All"
          });
          break;

        case 'faq':
          pageTitle = "Oracle's Wisdom FAQ & Traveler Guidance | Kemet Tours";
          metaDesc = "Essential advice regarding Red Sea entry visas, hotel pickup logistics, quad bike safety, scuba certification requirements, and payment options.";
          canonicalPath = "#faq";

          jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is included in the Hurghada Desert Quad Bike Safari?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Includes hotel pickup and drop-off, ATV quad bike rental, helmet, bedouin tea, camel ride experience, and sunset dinner."
                }
              },
              {
                "@type": "Question",
                "name": "Are diving trips suitable for beginners?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We offer Intro Discovery Dives with certified PADI instructors for beginners as well as advanced drift diving in Ras Mohammed."
                }
              },
              {
                "@type": "Question",
                "name": "How far in advance should I book Luxor Temple day trips?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We recommend booking at least 24 to 48 hours in advance to secure private convoy permits and expert Egyptologist guides."
                }
              }
            ]
          });
          break;

        case 'bookings':
          pageTitle = "My Royal Caravans & Booking Ledger | Kemet Tours";
          metaDesc = "Review and verify active caravan departure tickets, digital check-in passes, and reservation receipts.";
          canonicalPath = "#bookings";
          break;

        case 'admin':
          pageTitle = "High Priest Admin & CRM Ledger Sanctuary | Kemet Tours";
          metaDesc = "Staff clearance command center for managing caravan bookings, traveler CRM profiles, Google Sheets sync, and audit logs.";
          canonicalPath = "#admin";
          isNoIndex = true;
          break;

        case 'login':
        case 'register':
        case 'reset-password':
        case 'profile':
          pageTitle = "Traveler Sanctuary Portal | Kemet Tours";
          metaDesc = "Access your Kemet Tours account to view bookings, redeem rewards, and update traveler preferences.";
          canonicalPath = `#${activePage}`;
          isNoIndex = activePage === 'reset-password';
          break;

        default:
          break;
      }
    }

    if (customTitle) pageTitle = customTitle;
    if (customDescription) metaDesc = customDescription;

    const fullCanonicalUrl = customUrl || `${origin}/${canonicalPath}`;

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update standard & Open Graph Meta Tags
    const setMetaTag = (selector: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attribute}="${selector}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, selector);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('description', metaDesc, 'name');
    setMetaTag('robots', isNoIndex ? 'noindex, nofollow' : 'index, follow', 'name');

    // Open Graph
    setMetaTag('og:title', pageTitle, 'property');
    setMetaTag('og:description', metaDesc, 'property');
    setMetaTag('og:image', shareImg, 'property');
    setMetaTag('og:url', fullCanonicalUrl, 'property');
    setMetaTag('og:type', activeExcursion ? 'article' : 'website', 'property');
    setMetaTag('og:site_name', 'Kemet Tours', 'property');

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image', 'name');
    setMetaTag('twitter:title', pageTitle, 'name');
    setMetaTag('twitter:description', metaDesc, 'name');
    setMetaTag('twitter:image', shareImg, 'name');

    // 3. Update Canonical Tag
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Update JSON-LD Script
    const jsonLdScriptId = 'centralized-seo-jsonld';
    let scriptEl = document.getElementById(jsonLdScriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = jsonLdScriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    if (jsonLdSchemas.length > 0) {
      scriptEl.textContent = JSON.stringify(
        jsonLdSchemas.length === 1 ? jsonLdSchemas[0] : { "@context": "https://schema.org", "@graph": jsonLdSchemas }
      );
    } else {
      scriptEl.textContent = JSON.stringify(agencySchema);
    }

  }, [activePage, activeExcursion, customTitle, customDescription, customImage, customUrl]);

  return null;
}
