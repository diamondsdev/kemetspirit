import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Compass, User, Zap, Send, MessageCircle, HelpCircle, Loader2, BookOpen, Printer, X, CheckSquare, Square, Copy, Check } from 'lucide-react';
import { Booking, CustomItinerary, ScribeMessage, Excursion } from '../types';
import { useLanguage } from './LanguageContext';
import { getAccessToken } from '../lib/firebaseAuth';

interface ScribeOracleProps {
  onScribeSuccess?: () => void;
  onAddBooking?: (newBooking: Booking) => Promise<void>;
  bookings?: Booking[];
  excursions?: Excursion[];
  onUpdateExcursions?: (newExcursions: Excursion[]) => void;
}

export default function ScribeOracle({ onScribeSuccess, onAddBooking, bookings = [], excursions = [], onUpdateExcursions }: ScribeOracleProps) {
  const { language } = useLanguage();
  // Tabs: 'planner' or 'chat'
  const [activeTab, setActiveTab] = useState<'planner' | 'chat'>('planner');

  // Planner States
  const [duration, setDuration] = useState<number>(4);
  const [interest, setInterest] = useState<string>("Balanced Exploration (Corals, Desert, History)");
  const [intensity, setIntensity] = useState<string>("Balanced (Active exploration + temple relaxation)");
  const [companion, setCompanion] = useState<string>("Couple / Partners");
  const [customReq, setCustomReq] = useState<string>("");
  const [itinerary, setItinerary] = useState<CustomItinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  
  // Export to BookingManager States
  const [showExportBookingModal, setShowExportBookingModal] = useState<boolean>(false);
  const [bookingTravelerName, setBookingTravelerName] = useState<string>('');
  const [bookingTravelerEmail, setBookingTravelerEmail] = useState<string>('');
  const [bookingTravelDate, setBookingTravelDate] = useState<string>('');
  const [bookingGuestsCount, setBookingGuestsCount] = useState<number>(2);
  const [bookingSpecialRequests, setBookingSpecialRequests] = useState<string>('');
  const [isExportingBooking, setIsExportingBooking] = useState<boolean>(false);
  const [exportBookingError, setExportBookingError] = useState<string | null>(null);
  const [exportBookingSuccess, setExportBookingSuccess] = useState<boolean>(false);

  // Packing Essentials States
  const [selectedExcursionsForPacking, setSelectedExcursionsForPacking] = useState<string[]>(() => {
    const bookedIds = bookings.map(b => b.excursionId).filter(Boolean);
    if (bookedIds.length > 0) return bookedIds;
    return excursions.slice(0, 2).map(e => e.id);
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Spreadsheet States
  const [sheetUrlInput, setSheetUrlInput] = useState<string>(() => {
    return localStorage.getItem('kemet_oracle_sync_spreadsheet_url') || '';
  });
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<boolean>(false);

  // WhatsApp & Toggle Sync States
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [isSyncExpanded, setIsSyncExpanded] = useState<boolean>(false);
  const [waBookName, setWaBookName] = useState<string>('');
  const [waBookExcursion, setWaBookExcursion] = useState<string>('');
  const [waBookDate, setWaBookDate] = useState<string>('');
  const [waBookGuests, setWaBookGuests] = useState<number>(2);

  // Parse CSV data while respecting quoted commas
  const parseCSVData = (csvText: string): any[] => {
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    
    const parseRow = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      if (cells.length === 0 || !cells[0]) continue;
      
      const item: any = {};
      headers.forEach((header, index) => {
        const val = cells[index] || '';
        if (header.includes('id')) item.id = val;
        else if (header.includes('title')) item.title = val;
        else if (header.includes('tagline')) item.tagline = val;
        else if (header.includes('category')) item.category = val;
        else if (header.includes('duration')) item.duration = val;
        else if (header.includes('price')) item.price = Number(val.replace(/[^0-9.]/g, '')) || 100;
        else if (header.includes('rating')) item.rating = Number(val) || 5.0;
        else if (header.includes('location')) item.location = val;
        else if (header.includes('description')) item.description = val;
        else if (header.includes('lore') || header.includes('ancient')) item.ancientLore = val;
        else if (header.includes('image')) item.image = val;
        else if (header.includes('inclusions')) {
          item.inclusions = val ? val.split(/[;|\n]/).map((s: string) => s.trim()).filter(Boolean) : [];
        }
        else if (header.includes('highlights')) {
          item.highlights = val ? val.split(/[;|\n]/).map((s: string) => s.trim()).filter(Boolean) : [];
        }
      });

      // Fallbacks
      if (!item.id) item.id = `ex-sheet-${i}-${Date.now().toString().slice(-4)}`;
      if (!item.title) item.title = cells[1] || `Trip ${i}`;
      if (!item.category) item.category = 'diving';
      if (!item.price) item.price = 100;
      if (!item.duration) item.duration = 'Full Day';
      if (!item.location) item.location = 'Red Sea, Egypt';
      if (!item.image) item.image = '/src/assets/images/egypt_sea_diving_1784070366165.jpg';

      rows.push(item);
    }
    return rows;
  };

  const handleSyncFromSpreadsheet = async (explicitUrl?: string) => {
    const targetUrl = explicitUrl || sheetUrlInput;
    if (!targetUrl.trim()) {
      setSheetSyncError("Please enter a valid Google Spreadsheet URL or ID.");
      return;
    }

    setIsSyncingSheet(true);
    setSheetSyncError(null);
    setSheetSyncSuccess(false);

    try {
      let spreadsheetId = targetUrl.trim();
      const match = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        spreadsheetId = match[1];
      }

      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Excursions`;
      let csvRes = await fetch(csvUrl);
      if (!csvRes.ok) {
        const fallbackUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
        csvRes = await fetch(fallbackUrl);
        if (!csvRes.ok) {
          throw new Error("Could not access Google Sheet. Please ensure it is shared as 'Anyone with the link can view' (Public).");
        }
      }

      const csvText = await csvRes.text();
      const parsedExcursions = parseCSVData(csvText);

      if (parsedExcursions.length === 0) {
        throw new Error("No valid excursions rows found in the spreadsheet. Make sure your sheet has a header row like 'ID', 'Title', 'Price', 'Category'...");
      }

      const saveRes = await fetch('/api/excursions/sync-public-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedExcursions)
      });

      if (!saveRes.ok) {
        throw new Error("Failed to persist excursions in the divine server archives.");
      }

      const updatedExcursions = await saveRes.json();
      
      if (onUpdateExcursions) {
        onUpdateExcursions(updatedExcursions);
      }
      localStorage.setItem('kemet_excursions', JSON.stringify(updatedExcursions));
      localStorage.setItem('kemet_oracle_sync_spreadsheet_url', targetUrl.trim());
      localStorage.setItem('kemet_active_spreadsheet_id', spreadsheetId);

      setSheetSyncSuccess(true);
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `scribe-${Date.now()}`,
          role: 'assistant',
          text: `**Sacred Scroll Synchronized!**\n\nBy the order of the cosmic inkwells of Kemet, I have aligned my divine vision with your royal spreadsheet: \`${spreadsheetId.slice(0, 8)}...\`.\n\nOur excursions catalog has been updated with **${parsedExcursions.length}** newly revealed expeditions. Ask me about them, and I shall guide your caravan!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (onScribeSuccess) {
        onScribeSuccess();
      }

    } catch (err: any) {
      console.error(err);
      setSheetSyncError(err.message || "An error occurred while communicating with the Google Sheet API.");
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleWaBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waBookName.trim() || !waBookExcursion || !waBookDate) return;

    const selectedTour = excursions.find(ex => ex.id === waBookExcursion);
    if (!selectedTour) return;

    const totalCost = (selectedTour.price || 100) * waBookGuests;

    // Post booking record to backend
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          excursionId: selectedTour.id,
          excursionTitle: selectedTour.title,
          travelerName: waBookName.trim(),
          travelerEmail: `whatsapp.${Math.floor(Math.random() * 900) + 100}@wa.kemet.com`,
          date: waBookDate,
          numberOfGuests: waBookGuests,
          totalCost,
          specialRequests: "WhatsApp Instant Reservation Direct Inquiry"
        })
      });

      if (res.ok) {
        const newBooking = await res.json();
        if (onAddBooking) {
          await onAddBooking(newBooking);
        }
      }
    } catch (err) {
      console.error("Failed to register booking in background archives", err);
    }

    const waText = `Hail High Priests of Kemet (Mas International Agency)! 𓂀\n\nI, *${waBookName.trim()}*, wish to reserve royal passage for the following caravan expedition:\n\n✨ *Trip:* ${selectedTour.title}\n📅 *Date:* ${waBookDate}\n👥 *Guests:* ${waBookGuests} Noble Travelers\n💰 *Total Cost Estimate:* $${totalCost}\n\nPlease register my caravan and confirm availability. May Ra align our paths!`;

    const waLink = `https://wa.me/201004812323?text=${encodeURIComponent(waText)}`;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: `scribe-${Date.now()}`,
        role: 'assistant',
        text: `**Caravan Ledger Updated!** 𓂀\n\nNoble traveler **${waBookName.trim()}**, your request has been recorded into our archives. I am now redirecting you to our High Priests via WhatsApp to finalize your golden passage. If the window did not open, [click here to open WhatsApp directly](${waLink}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setShowBookingForm(false);
    window.open(waLink, '_blank');
  };

  const handleWaSupportClick = () => {
    const waText = `Hail High Priests of Kemet (Mas International Agency)! 𓂀\n\nI am consulting Scribe Sennedjem and require personal guidance from a real agent regarding my travel plans. Please guide my caravan!`;
    const waLink = `https://wa.me/201004812323?text=${encodeURIComponent(waText)}`;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: `scribe-${Date.now()}`,
        role: 'assistant',
        text: `**High Priest Summoned!** 𓀚\n\nI have signaled our personal advisors at Mas International Agency. You can message them immediately via WhatsApp: [Message Agent Now](${waLink}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    window.open(waLink, '_blank');
  };

  const bookingsLength = bookings.length;
  React.useEffect(() => {
    const bookedIds = bookings.map(b => b.excursionId).filter(Boolean);
    if (bookedIds.length > 0) {
      setSelectedExcursionsForPacking(prev => {
        const combined = Array.from(new Set([...prev, ...bookedIds]));
        return combined;
      });
    }
  }, [bookingsLength]);

  const toggleExcursionForPacking = (exId: string) => {
    setSelectedExcursionsForPacking(prev => {
      if (prev.includes(exId)) {
        return prev.filter(id => id !== exId);
      } else {
        return [...prev, exId];
      }
    });
  };

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Generate dynamic customized packing list
  const generatedChecklist = React.useMemo(() => {
    const selectedExcs = excursions.filter(e => selectedExcursionsForPacking.includes(e.id));
    const selectedCategories = new Set(selectedExcs.map(e => e.category));

    const categories: {
      id: string;
      title: { en: string; de: string; pl: string; cs: string };
      icon: string;
      items: { id: string; name: { en: string; de: string; pl: string; cs: string }; desc: { en: string; de: string; pl: string; cs: string } }[];
    }[] = [];

    // 1. General Essentials (Always included)
    categories.push({
      id: 'general',
      title: {
        en: "General Egyptian Travel Essentials",
        de: "Allgemeine Ägypten-Reiseutensilien",
        pl: "Ogólny niezbędnik podróży do Egiptu",
        cs: "Obecné cestovní potřeby pro Egypt"
      },
      icon: "𓂀",
      items: [
        {
          id: 'gen_passport',
          name: {
            en: "Passport & Entry Visa",
            de: "Reisepass & Einreisevisum",
            pl: "Paszport i wiza wjazdowa",
            cs: "Cestovní pas a vstupní vízum"
          },
          desc: {
            en: "Ensure passport is valid for at least 6 months. Carry printed copy of e-Visa or cash for visa-on-arrival.",
            de: "Stellen Sie sicher, dass Ihr Pass noch mindestens 6 Monate gültig ist. Nehmen Sie eine gedruckte E-Visum-Kopie oder Bargeld mit.",
            pl: "Upewnij się, że paszport jest ważny przez co najmniej 6 miesięcy. Przygotuj wydruk e-wizy lub gotówkę na wizę na lotnisku.",
            cs: "Ujistěte se, že platnost pasu je alespoň 6 měsíců. Připravte si vytištěné e-vízum nebo hotovost na vízum po příletu."
          }
        },
        {
          id: 'gen_adapter',
          name: {
            en: "Universal Power Adapter",
            de: "Universal-Netzadapter",
            pl: "Uniwersalny adapter zasilania",
            cs: "Univerzální napájecí adaptér"
          },
          desc: {
            en: "Egypt uses Type C and F plugs (standard European round pins, 220V).",
            de: "In Ägypten werden Steckdosen des Typs C und F verwendet (europäische Rundstifte, 220 V).",
            pl: "W Egipcie używane są gniazdka typu C i F (standardowe okrągłe wtyczki europejskie, 220V).",
            cs: "Egypt používá zásuvky typu C a F (standardní evropské kulaté kolíky, 220 V)."
          }
        },
        {
          id: 'gen_meds',
          name: {
            en: "Travel First-Aid & Stomach Care",
            de: "Reiseapotheke & Magenmedikamente",
            pl: "Apteczka podróżna i leki na żołądek",
            cs: "Cestovní lékárnička a léky na žaludek"
          },
          desc: {
            en: "Pack rehydration salts and basic digestive remedies to ward off Pharaoh's Revenge.",
            de: "Packen Sie Elektrolyte und bewährte Magen-Darm-Mittel ein, um Rache des Pharaos vorzubeugen.",
            pl: "Zapakuj elektrolity i podstawowe leki żołądkowe, aby zapobiec tzw. Zemście Faraona.",
            cs: "Zabalte si rehydratační soli a základní žaludeční léky k prevenci faraonovy pomsty."
          }
        }
      ]
    });

    // 2. Diving & Speedboat / Watersport
    if (selectedCategories.has('diving') || selectedCategories.has('boat') || selectedCategories.has('speedboat')) {
      const isDiving = selectedCategories.has('diving');
      categories.push({
        id: 'water',
        title: {
          en: "Diving & Red Sea Explorations",
          de: "Tauchen & Rotes Meer Erkundungen",
          pl: "Nurkowanie i eksploracja Morza Czerwonego",
          cs: "Potápění a průzkum Rudého moře"
        },
        icon: "𓆟",
        items: [
          {
            id: 'water_sunscreen',
            name: {
              en: "Reef-Safe Biodegradable Sunscreen",
              de: "Riffsichere biologisch abbaubare Sonnencreme",
              pl: "Koralowo-bezpieczny filtr biodegradowalny",
              cs: "Opalovací krém šetrný ke korálům"
            },
            desc: {
              en: "Strictly required to protect the delicate corals of Sobek and diverse marine life of the Red Sea.",
              de: "Dringend erforderlich, um die empfindlichen Korallen von Sobek und die Tierwelt des Roten Meeres zu schützen.",
              pl: "Absolutnie wymagany do ochrony delikatnych koralowców Sobka i życia morskiego w Morzu Czerwonym.",
              cs: "Nezbytně nutné pro ochranu křehkých korálů boha Sobka a rozmanitého mořskiego života v Rudém moři."
            }
          },
          {
            id: 'water_drybag',
            name: {
              en: "Waterproof Dry-Bag",
              de: "Wasserdichter Packsack (Dry-Bag)",
              pl: "Wodoszczelny worek (Dry-bag)",
              cs: "Vodotěsný vak (Dry-Bag)"
            },
            desc: {
              en: "Keeps your electronic 'scarabs' (smartphones) and dry clothes secure from sea spray on boats.",
              de: "Schützt Ihre elektronischen 'Skarabäen' (Smartphones) und trockene Kleidung vor Gischt.",
              pl: "Zabezpiecza Twoje elektroniczne 'skarabeusze' (smartfony) i suche ubrania przed morską bryzą.",
              cs: "Udrží vaše elektronické 'skarabee' (smartphony) a suché oblečení v bezpečí před stříkající mořskou vodou."
            }
          },
          ...(isDiving ? [{
            id: 'water_card',
            name: {
              en: "Diver Certification Card & Logbook",
              de: "Tauchschein (Brevet) & Logbuch",
              pl: "Certyfikat nurkowy i logbook",
              cs: "Potápěčská karta (certifikace) a logbook"
            },
            desc: {
              en: "Essential verification for certified dive excursions. Digital copies are accepted but physical is safer.",
              de: "Nachweis für zertifizierte Tauchgänge erforderlich. Digitale Versionen sind okay, physische sicherer.",
              pl: "Niezbędny dokument dla certyfikowanych wycieczek nurkowych. Cyfrowe są akceptowane, ale fizyczne pewniejsze.",
              cs: "Nezbytné ověření pro certifikované potápěčské ponory. Digitální kopie jsou akceptovány, ale fyzické jsou jistější."
            }
          }] : []),
          {
            id: 'water_swim',
            name: {
              en: "Quick-Dry Swimwear & Rash Guard",
              de: "Schnelltrocknende Badebekleidung & Rashguard",
              pl: "Szybkoschnący strój kąpielowy i rashguard",
              cs: "Rychleschnoucí plavky a rash guard"
            },
            desc: {
              en: "UV-protection apparel is highly recommended for hours spent snorkeling in the shallow lagoons.",
              de: "UV-Schutzkleidung wird dringend empfohlen für stundenlanges Schnorcheln im seichten Wasser.",
              pl: "Odzież z ochroną UV jest zalecana podczas wielogodzinnego snurkowania w płytkich lagunach.",
              cs: "Oblečení s UV ochranou se velmi doporučuje při dlouhých hodinách šnorchlování v mělkých lagunách."
            }
          }
        ]
      });
    }

    // 3. Desert Safari
    if (selectedCategories.has('safari')) {
      categories.push({
        id: 'safari',
        title: {
          en: "Desert Safari & Bedouin Expeditions",
          de: "Wüstensafari & Beduinen-Expeditionen",
          pl: "Pustynne safari i ekspedycje beduińskie",
          cs: "Pouštní safari a expedice do beduínských táborů"
        },
        icon: "𓃘",
        items: [
          {
            id: 'safari_scarf',
            name: {
              en: "Head Scarf / Shemagh",
              de: "Kopftuch / Shemagh-Schal",
              pl: "Arafatka / Chusta Shemagh",
              cs: "Šátek na hlavu / Šemag"
            },
            desc: {
              en: "Protects your face and hair from fine blowing sand during high-speed quad bike rides in Deshret.",
              de: "Schützt Gesicht und Haare vor feinem, wirbelndem Wüstensand bei rasanten Quad-Fahrten.",
              pl: "Chroni twarz i włosy przed drobnym, nawiewanym piaskem podczas szybkiej jazdy na quadach.",
              cs: "Chrání váš obličej a vlasy před jemným poletujícím pískem při rychlé jízdě na čtyřkolkách v poušti."
            }
          },
          {
            id: 'safari_shoes',
            name: {
              en: "Sturdy Closed-Toe Shoes",
              de: "Feste, geschlossene Schuhe",
              pl: "Wytrzymałe buty z zakrytymi palcami",
              cs: "Pevná uzavřená obuv"
            },
            desc: {
              en: "Protects from scorching sand, sharp desert rocks, and heat rising from the quad engine.",
              de: "Schützt vor kochend heißem Sand, scharfen Wüstenfelsen und der Motorhitze des Quads.",
              pl: "Chroni przed parzącym piaskiem, ostrymi skałami pustynnymi i ciepłem bijącym z silnika quada.",
              cs: "Chrání před rozpáleným pískem, ostrými pouštními kameny a horkem stoupajícím z motoru čtyřkolky."
            }
          },
          {
            id: 'safari_layers',
            name: {
              en: "Windbreaker or Fleece Layers",
              de: "Windjacke oder Fleece-Schichten",
              pl: "Wiatrówka lub ciepła warstwa polarowa",
              cs: "Větrovka nebo fleecová mikina"
            },
            desc: {
              en: "Desert temperatures drop rapidly after sunset. Crucial for evening camel treks or Bedouin stargazing.",
              de: "Die Temperaturen in der Wüste sinken nach Sonnenuntergang rasant. Wichtig für abendliche Ritte.",
              pl: "Temperatury na pustyni spadają gwałtownie po zachodzie słońca. Niezbędne na wieczorne przejażdżki.",
              cs: "Teploty v poušti po západu slunce rychle klesají. Zásadní pro večerní jízdy na velbloudech či beduínské pozorování hvězd."
            }
          }
        ]
      });
    }

    // 4. Historical Sites
    if (selectedCategories.has('history')) {
      categories.push({
        id: 'history',
        title: {
          en: "Sacred Temples & Ancient Shrines",
          de: "Heilige Tempel & Antike Schreine",
          pl: "Święte świątynie i starożytne grobowce",
          cs: "Posvátné chrámy a starověké památky"
        },
        icon: "𓉶",
        items: [
          {
            id: 'history_modest',
            name: {
              en: "Modest & Light Clothing",
              de: "Züchtige & leichte Kleidung",
              pl: "Skromne i przewiewne ubrania",
              cs: "Zdrženlivé a lehké oblečení"
            },
            desc: {
              en: "Cover shoulders and knees when exploring sacred temples and religious sites to show respect to local customs.",
              de: "Bedecken Sie Schultern und Knie beim Besuch antiker Tempel und heiliger Stätten als Zeichen des Repräsentanten.",
              pl: "Zakryj ramiona i kolana podczas zwiedzania świętych świątyń, aby okazać szacunek lokalnym tradycjom.",
              cs: "Zakryjte si ramena a kolena při prohlídce posvátných chrámů a historických míst na znamení úcty k místním zvyklostem."
            }
          },
          {
            id: 'history_shoes',
            name: {
              en: "Supportive Walking Shoes",
              de: "Bequeme Laufschuhe",
              pl: "Wygodne buty do chodzenia",
              cs: "Pohodlná obuv na chůzi"
            },
            desc: {
              en: "Perfect for long walks over uneven stone carvings, tomb gravels, and expansive temple corridors.",
              de: "Ideal für lange Gänge über unebene Steinböden, Grabpfade und weitläufige Tempelkorridore.",
              pl: "Doskonałe na długie spacery po nierównych kamiennych posadzkach, żwirze w grobowcach i korytarzach świątyń.",
              cs: "Ideální pro dlouhé procházky po nerovném kamenném dláždění, štěrku v hrobkách a rozlehlých chodbách chrámů."
            }
          },
          {
            id: 'history_flashlight',
            name: {
              en: "Compact LED Flashlight / Mobile Torch",
              de: "Kompakte LED-Taschenlampe",
              pl: "Mała latarka LED",
              cs: "Kompaktní LED svítilna"
            },
            desc: {
              en: "Allows you to illuminate and appreciate ancient hieroglyphs inside darker chambers and tomb shafts.",
              de: "Hilft Ihnen, altägyptische Hieroglyphen in dunkleren Grabkammern und Gängen wunderbar zu beleuchten.",
              pl: "Ułatwia oświetlenie i podziwianie starożytnych hieroglifów w ciemniejszych komorach i korytarzach grobowców.",
              cs: "Umožní vám posvítit si na starověké hieroglyfy v temnějších zákoutích chrámových komnat a hrobek."
            }
          }
        ]
      });
    }

    // 5. Excursion Specific Items
    if (selectedExcs.length > 0) {
      const excursionSpecificItems = selectedExcs.map(exc => {
        let nameEn = `Special gear for: ${exc.title}`;
        let nameDe = `Spezialausrüstung für: ${exc.title}`;
        let namePl = `Specjalny sprzęt na: ${exc.title}`;
        let nameCs = `Speciální výbava pro: ${exc.title}`;

        let descEn = `Refer to highlights: ${exc.tagline}. Carry loose clothes and cash for local guides and small souvenirs.`;
        let descDe = `Siehe Highlights: ${exc.tagline}. Denken Sie an bequeme Kleidung und Bargeld für Souvenirs und Führer.`;
        let descPl = `Zobacz atrakcje: ${exc.tagline}. Zabierz wygodne ubrania i gotówkę na pamiątki oraz lokalnych przewodników.`;
        let descCs = `Viz hlavní body: ${exc.tagline}. Nezapomeňte na pohodlné oblečení a hotovost na suvenýry a místní průvodce.`;

        if (exc.category === 'diving') {
          descEn = `Certified divers should bring their certification card. Snorkelers should pack an underwater strap for cameras to safely film the reefs in: ${exc.title}.`;
          descDe = `Zertifizierte Taucher sollten ihre Brevet-Karte mitbringen. Schnorchler sollten eine Unterwasserhalterung einpacken, um die Riffe bei '${exc.title}' sicher zu filmen.`;
          descPl = `Certyfikowani nurkowie powinni wziąć kartę certyfikacyjną. Snurkujący powinni spakować uchwyt wodoodporny na kamerę, aby bezpiecznie nagrać rafy w '${exc.title}'.`;
          descCs = `Certifikovaní potápěči by si měli vzít certifikační kartu. Šnorchlaři by si měli přibalit podvodní popruh na fotoaparát pro bezpečné focení útesů u '${exc.title}'.`;
        } else if (exc.category === 'safari') {
          descEn = `Pack secure goggles or dust-proof sunglasses for the wind-blown desert sand on: ${exc.title}. Bring some cash in Egyptian Pounds for local Bedouin tips.`;
          descDe = `Bringen Sie staubdichte Brillen mit für den Sandwind bei '${exc.title}'. Denken Sie an etwas Bargeld in Ägyptischen Pfund für Beduinen-Trinkgelder.`;
          descPl = `Zapakuj okulary ochronne chroniące przed pyłem na '${exc.title}'. Weź ze sobą gotówkę w funtach egipskich na drobne napiwki dla Beduinów.`;
          descCs = `Přibalte si ochranné brýle proti písku při '${exc.title}'. Vezměte si hotovost v egyptských librách na spropitné pro místní beduíny.`;
        } else if (exc.category === 'history') {
          descEn = `Tomb frescoes are light-sensitive; photography is allowed without flash. Bring comfortable breathable clothes for the heat in: ${exc.title}.`;
          descDe = `Wandbilder in Gräbern sind lichtempfindlich; Fotos nur ohne Blitz erlaubt. Bringen Sie luftige Kleidung mit für die Hitze bei '${exc.title}'.`;
          descPl = `Malowidła grobowe są wrażliwe na światło, fotografowanie dozwolone tylko bez lampy. Zabierz przewiewne ubrania na upał podczas '${exc.title}'.`;
          descCs = `Nástěnné malby v hrobkách jsou citlivé na světlo; fotografování je povoleno bez blesku. Přibalte si lehké vzdušné oblečení pro horko u '${exc.title}'.`;
        }

        return {
          id: `exc_spec_${exc.id}`,
          name: { en: nameEn, de: nameDe, pl: namePl, cs: nameCs },
          desc: { en: descEn, de: descDe, pl: descPl, cs: descCs }
        };
      });

      categories.push({
        id: 'excursions',
        title: {
          en: "Selected Excursion Specifics",
          de: "Besonderheiten für ausgewählte Ausflüge",
          pl: "Specyfika wybranych wycieczek",
          cs: "Specifické potřeby pro vybrané výlety"
        },
        icon: "𓎬",
        items: excursionSpecificItems
      });
    }

    return categories;
  }, [selectedExcursionsForPacking, excursions]);

  const copyChecklistToClipboard = () => {
    let text = `𓂀 Kemet Tours - ${language === 'de' ? 'Ihre pharaonische Packliste' : language === 'pl' ? 'Twój faraoński niezbędnik pakowania' : 'Your Pharaonic Packing Essentials'} 𓂀\n\n`;
    
    generatedChecklist.forEach(cat => {
      const catTitle = cat.title[language as 'en' | 'de' | 'pl' | 'cs'] || cat.title.en;
      text += `--- ${cat.icon} ${catTitle.toUpperCase()} ---\n`;
      cat.items.forEach(item => {
        const isChecked = !!checkedItems[item.id];
        const itemName = item.name[language as 'en' | 'de' | 'pl' | 'cs'] || item.name.en;
        const itemDesc = item.desc[language as 'en' | 'de' | 'pl' | 'cs'] || item.desc.en;
        text += `${isChecked ? '[✓]' : '[ ]'} ${itemName}\n    ${itemDesc}\n\n`;
      });
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const computedTotalItems = React.useMemo(() => {
    return generatedChecklist.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [generatedChecklist]);

  const computedCheckedCount = React.useMemo(() => {
    let count = 0;
    generatedChecklist.forEach(cat => {
      cat.items.forEach(item => {
        if (checkedItems[item.id]) count++;
      });
    });
    return count;
  }, [generatedChecklist, checkedItems]);

  const computedProgressPercent = computedTotalItems > 0 ? Math.round((computedCheckedCount / computedTotalItems) * 100) : 0;

  const computedCost = duration * 125 * bookingGuestsCount;

  const initExportBooking = () => {
    if (!itinerary) return;
    const activitiesList = itinerary.days.map(d => `Day ${d.dayNumber} (${d.theme}): ${d.activities.join('; ')}`).join(' | ');
    setBookingSpecialRequests(`Custom Itinerary: ${itinerary.title}. Plan: ${activitiesList}`);
    
    // Set default travel date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingTravelDate(tomorrow.toISOString().split('T')[0]);
    
    setExportBookingError(null);
    setExportBookingSuccess(false);
    setShowExportBookingModal(true);
  };

  const handleExportBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary || !onAddBooking) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bookingTravelerName.trim()) {
      setExportBookingError("Please provide your noble explorer name.");
      return;
    }
    if (!bookingTravelerEmail.trim() || !emailRegex.test(bookingTravelerEmail)) {
      setExportBookingError("Please provide a valid email so the Scribe may contact you.");
      return;
    }
    if (!bookingTravelDate) {
      setExportBookingError("Please select a valid scheduled date for your voyage.");
      return;
    }

    setIsExportingBooking(true);
    setExportBookingError(null);

    const bookingPayload: Booking = {
      id: `b-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      excursionId: 'custom-itinerary',
      excursionTitle: `Custom: ${itinerary.title}`,
      travelerName: bookingTravelerName.trim(),
      travelerEmail: bookingTravelerEmail.trim(),
      date: bookingTravelDate,
      numberOfGuests: bookingGuestsCount,
      totalCost: computedCost,
      specialRequests: bookingSpecialRequests.trim(),
      status: 'Pending Oracle Approval',
      createdAt: new Date().toISOString()
    };

    try {
      await onAddBooking(bookingPayload);
      setExportBookingSuccess(true);
      setTimeout(() => {
        setShowExportBookingModal(false);
        setExportBookingSuccess(false);
        setBookingTravelerName('');
        setBookingTravelerEmail('');
        setBookingSpecialRequests('');
      }, 2000);
    } catch (err: any) {
      setExportBookingError(err.message || "Failed to create booking ledger request.");
    } finally {
      setIsExportingBooking(false);
    }
  };
  
  // Custom Activity Builder States & Methods
  const [newActivityInputs, setNewActivityInputs] = useState<{[key: number]: string}>({});

  const removeActivity = (dayNumber: number, activityIndex: number) => {
    if (!itinerary) return;
    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter((_, idx) => idx !== activityIndex)
        };
      }
      return day;
    });
    setItinerary({
      ...itinerary,
      days: updatedDays
    });
  };

  const addActivity = (dayNumber: number, activityText: string) => {
    if (!itinerary || !activityText.trim()) return;
    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: [...day.activities, activityText.trim()]
        };
      }
      return day;
    });
    setItinerary({
      ...itinerary,
      days: updatedDays
    });
  };

  // Chat States
  const [chatMessages, setChatMessages] = useState<ScribeMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: language === 'de'
        ? "Hallo und willkommen! Ich bin Ihr KI-Reiseassistent. Ich kann Ihnen bei der Planung Ihrer Reise helfen, Fragen zur altägyptischen Geschichte beantworten oder die Bedeutungen hinter den Hieroglyphensymbolen erklären. Wie kann ich Ihnen heute bei Ihren Reiseplänen helfen?"
        : language === 'pl'
        ? "Witaj! Jestem Twoim Asystentem Podróży AI. Mogę pomóc Ci w zaplanowaniu podróży, odpowiedzieć na pytania dotyczące historii starożytnego Egiptu lub wyjaśnić znaczenie symboli hieroglificznych. Jak mogę Ci dzisiaj pomóc w planach podróży?"
        : language === 'cs'
        ? "Dobrý den a vítáme vás! Jsem váš cestovní asistent AI. Mohu vám pomoci naplánovat vaši cestu, odpovědět na otázky o starověké egyptské historii nebo vysvětlit význam hieroglyfických symbolů. Jak vám mohu dnes pomoci s vašimi cestovními plány?"
        : language === 'ar'
        ? "أهلاً بك! أنا مساعد السفر الذكي الخاص بك. يمكنني مساعدتك في تخطيط رحلتك، والإجابة عن أسئلتك حول تاريخ مصر القديمة، أو شرح معاني الرموز الهيروغليفية. كيف يمكنني مساعدتك اليوم؟"
        : "Hello and welcome! I am your AI Travel Assistant. I can help you plan your journey, answer questions about ancient Egyptian history, or explain the meanings behind hieroglyphic symbols. How can I assist you with your travel plans today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Excursion customizable options
  const interests = language === 'de' ? [
    "Ausgewogene Erkundung (Korallen, Wüste, Geschichte)",
    "Tiefsee-Meeresleben & Tauchen",
    "Adrenalin-Wüstensafaris & Kamelritte",
    "Pharaonische Tempel & Ägyptologie (Luxor-Touren)"
  ] : language === 'pl' ? [
    "Zrównoważona eksploracja (rafy, pustynia, historia)",
    "Głębinowe życie morskie i nurkowanie",
    "Adrenalinowe pustynne safari i przejażdżki na wielbłądach",
    "Faraońskie świątynie i starożytna egiptologia (wycieczki do Luksoru)"
  ] : language === 'cs' ? [
    "Vyvážené poznávání (korály, poušť, historie)",
    "Hlubinný mořský život a potápění",
    "Adrenalinové pouštní safari a jízda na velbloudu",
    "Faraonské chrámy a starověká egyptologie (výlety do Luxoru)"
  ] : language === 'ar' ? [
    "استكشاف متوازن (شعاب مرجانية، صحراء، تاريخ)",
    "الحياة البحرية والأعماق والغوص",
    "رحلات السفاري الصحراوية وركوب الجمال",
    "المعابد الفرعونية وعلم المصريات (جولات الأقصر)"
  ] : [
    "Balanced Exploration (Corals, Desert, History)",
    "Deep-Sea Marine Life & Diving",
    "Adrenaline Desert Safaris & Camel Treks",
    "Pharaonic Temples & Ancient Egyptology (Luxor Tours)"
  ];

  const paces = language === 'de' ? [
    "Gemütlich (Langsamer, Segeln im Sonnenuntergang & leichte Riffspaziergänge)",
    "Ausgewogen (Aktive Erkundung + Tempel-Entspannung)",
    "Intensiv (Quadfahren bei Sonnenaufgang, tiefe Scuba-Tauchergänge, ganztägige Denkmaltouren)"
  ] : language === 'pl' ? [
    "Rekreacyjne (wolniejsze tempo, rejsy o zachodzie słońca i lekkie spacery po rafie)",
    "Zrównoważone (aktywna eksploracja + relaks w świątyniach)",
    "Intensywne (jazda na quadach o wschodzie słońca, głębokie nurkowanie, całodniowe wędrówki po zabytkach)"
  ] : language === 'cs' ? [
    "Pohodové (pomalé tempo, plavby při západu slunce a lehké procházky po útesech)",
    "Vyvážené (aktivní poznávání + odpočinek v chrámech)",
    "Intensivní (ranní jízda v dunách, hluboké potápění, celodenní pěší túry po památkách)"
  ] : language === 'ar' ? [
    "هادئ (إبحار عند غروب الشمس، وجولات خفيفة)",
    "متوازن (استكشاف نشط + استرخاء في المعابد)",
    "مكثف (بيتش باجي عند الشروق، غوص عميق، جولات كاملة للمقابر)"
  ] : [
    "Leisurely (Slower-paced, sunset sails & light reef walks)",
    "Balanced (Active exploration + temple relaxation)",
    "Intense (Sunrise dune biking, deep scuba dives, day-long monument treks)"
  ];

  const companions = language === 'de' ? [
    "Alleinreisende(r)",
    "Paar / Partner",
    "Königliche Familie (inkl. Kinder)",
    "Gruppe von Entdeckern (Freunde/Gruppe)"
  ] : language === 'pl' ? [
    "Samotny podróżnik",
    "Para / Partnerzy",
    "Królewska rodzina (z dziećmi)",
    "Grupa odkrywców (znajomi/grupa)"
  ] : language === 'cs' ? [
    "Sólo dobrodruh",
    "Pár / partneři",
    "Královská rozina (včetně dětí)",
    "Skupina objevitelů (přátelé/skupina)"
  ] : language === 'ar' ? [
    "مسافر بمفرده",
    "زوجان / شريكان",
    "عائلة ملكية (شاملة الأطفال)",
    "مجموعة من المستكشفين (أصدقاء)"
  ] : [
    "Solo Adventurer",
    "Couple / Partners",
    "Royal Family (Kids included)",
    "Band of Explorers (Friends/Group)"
  ];

  // Call the backend to generate custom itinerary
  const generateItinerary = async () => {
    setIsGenerating(true);
    setPlannerError(null);
    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          durationDays: duration,
          interest,
          intensity,
          companion,
          customPreferences: customReq
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to contact the Royal Scribe");
      }

      const data = await response.json();
      setItinerary(data);
      onScribeSuccess?.();
    } catch (err: any) {
      console.warn("Express endpoint failed or unconfigured, utilizing royal scribe fallback: ", err);
      // Fallback elegant customized simulated itinerary based on user inputs
      const simulated: CustomItinerary = generateFallbackItinerary(duration, interest, intensity, language);
      setItinerary(simulated);
      onScribeSuccess?.();
    } finally {
      setIsGenerating(false);
    }
  };

  // Format assistant messages to support markdown-like structures gracefully
  const formatScribeMessage = (text: string, isUserMessage: boolean) => {
    if (!text) return null;
    if (isUserMessage) {
      return <p className="text-[#140f0a] font-medium whitespace-pre-wrap">{text}</p>;
    }
    
    // Split by newlines to handle paragraphs and lists
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-stone-200">
        {lines.map((line, idx) => {
          let content = line;
          
          // Bold formatting **text**
          content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-200 font-bold">$1</strong>');
          
          // Inline highlighted terms `text`
          content = content.replace(/`(.*?)`/g, '<code class="bg-[#140f0a] border border-[#d4af37]/20 px-1.5 py-0.5 rounded font-mono text-xs text-amber-400">$1</code>');

          // Check if it's a bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const cleanLi = content.trim().replace(/^[\-\*]\s+/, '');
            return (
              <li key={idx} className="ml-4 list-disc list-outside text-stone-200 pl-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanLi }} />
            );
          }
          
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="leading-relaxed text-stone-200" dangerouslySetInnerHTML={{ __html: content }} />
          );
        })}
      </div>
    );
  };

  // Submit suggestion prompt immediately
  const triggerQuickPrompt = async (promptText: string) => {
    if (isChatLoading) return;
    setIsChatLoading(true);
    
    const userMsg: ScribeMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Detect spreadsheet commands in quick prompt
    const sheetRegex = /(?:https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)|(?:pull|sync|import)\s+(?:from\s+)?(?:sheet|spreadsheet)\s+([a-zA-Z0-9-_:\/.]+))/i;
    const sheetMatch = promptText.match(sheetRegex);
    if (sheetMatch) {
       const urlOrId = sheetMatch[1] || sheetMatch[2];
       if (urlOrId && (urlOrId.startsWith('http') || urlOrId.length > 15)) {
         setTimeout(() => {
           handleSyncFromSpreadsheet(urlOrId);
         }, 400);
         return;
       }
    }
    
    // Save CRM Lead Log
    try {
      const savedLogs = localStorage.getItem('kemet_oracle_chats_logs');
      const currentLogs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `log-${Date.now()}`,
        name: "Prospect Noble",
        email: `prospect.${Math.floor(Math.random() * 900) + 100}@traveler.kemet.com`,
        query: promptText,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      localStorage.setItem('kemet_oracle_chats_logs', JSON.stringify([newLog, ...currentLogs]));
    } catch (e) {
      console.warn("Could not save inquiry lead", e);
    }

    try {
      // Create simplified history
      const history = [...chatMessages, userMsg].slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const token = await getAccessToken();

      const response = await fetch('/api/scribe-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: promptText,
          chatHistory: history,
          excursions,
          bookings,
          accessToken: token || ''
        })
      });

      if (!response.ok) {
        throw new Error("Scribe is busy consulting Osiris");
      }

      const data = await response.json();
      if (data.bookingCreated && onAddBooking) {
        await onAddBooking(data.bookingCreated);
      }

      setChatMessages(prev => [...prev, {
        id: `scribe-${Date.now()}`,
        role: 'assistant',
        text: data.response || "My apologies, the cosmic inkwells of Kemet have run dry for a moment. Ask again, noble voyager.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      onScribeSuccess?.();
    } catch (err) {
      console.warn("Express chat failed, utilizing offline scribe response.");
      const reply = getOfflineScribeResponse(promptText, language);
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: `scribe-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        onScribeSuccess?.();
      }, 800);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Chat with Scribe Sennedjem
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const queryText = chatInput;

    const userMsg: ScribeMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    // Detect spreadsheet sync request in chat input!
    const sheetRegex = /(?:https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)|(?:pull|sync|import)\s+(?:from\s+)?(?:sheet|spreadsheet)\s+([a-zA-Z0-9-_:\/.]+))/i;
    const sheetMatch = queryText.match(sheetRegex);
    if (sheetMatch) {
       const urlOrId = sheetMatch[1] || sheetMatch[2];
       if (urlOrId && (urlOrId.startsWith('http') || urlOrId.length > 15)) {
         setTimeout(() => {
           handleSyncFromSpreadsheet(urlOrId);
         }, 400);
         return;
       }
    }

    // Save CRM Lead Log
    try {
      const savedLogs = localStorage.getItem('kemet_oracle_chats_logs');
      const currentLogs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `log-${Date.now()}`,
        name: "Prospect Noble",
        email: `prospect.${Math.floor(Math.random() * 900) + 100}@traveler.kemet.com`,
        query: queryText,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      localStorage.setItem('kemet_oracle_chats_logs', JSON.stringify([newLog, ...currentLogs]));
    } catch (e) {
      console.warn("Could not save inquiry lead", e);
    }

    try {
      // Create simplified history
      const history = [...chatMessages, userMsg].slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const token = await getAccessToken();

      const response = await fetch('/api/scribe-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg.text,
          chatHistory: history,
          excursions,
          bookings,
          accessToken: token || ''
        })
      });

      if (!response.ok) {
        throw new Error("Scribe is busy consulting Osiris");
      }

      const data = await response.json();
      if (data.bookingCreated && onAddBooking) {
        await onAddBooking(data.bookingCreated);
      }

      setChatMessages(prev => [...prev, {
        id: `scribe-${Date.now()}`,
        role: 'assistant',
        text: data.response || "My apologies, the cosmic inkwells of Kemet have run dry for a moment. Ask again, noble voyager.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      onScribeSuccess?.();
    } catch (err) {
      console.warn("Express chat failed, utilizing offline scribe response.");
      // Simulated wise responses
      const reply = getOfflineScribeResponse(userMsg.text, language);
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: `scribe-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        onScribeSuccess?.();
      }, 800);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-[#1a140f] border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative" id="scribe-oracle-container">
      {/* Ancient Egyptian Design Borders */}
      <div className="absolute top-4 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"></div>

      {/* Tabs Menu */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#241c14] p-1.5 rounded-xl border border-[#d4af37]/25 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-serif font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-[#d4af37] text-[#140f0a] shadow-lg shadow-[#d4af37]/20'
                : 'text-[#e6c280]/70 hover:text-[#f3e5c8] hover:bg-[#2e241b]'
            }`}
          >
            <Compass className="w-4 h-4" />
            {language === 'de' ? 'Reiseplaner' : language === 'pl' ? 'Planer podróży' : 'Itinerary Planner'}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-serif font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#d4af37] text-[#140f0a] shadow-lg shadow-[#d4af37]/20'
                : 'text-[#e6c280]/70 hover:text-[#f3e5c8] hover:bg-[#2e241b]'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {language === 'de' ? 'Mit KI-Assistent chatten' : language === 'pl' ? 'Czatuj z asystentem AI' : 'Chat with AI Assistant'}
          </button>
          <button
            onClick={() => setActiveTab('packing' as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-serif font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === ('packing' as any)
                ? 'bg-[#d4af37] text-[#140f0a] shadow-lg shadow-[#d4af37]/20'
                : 'text-[#e6c280]/70 hover:text-[#f3e5c8] hover:bg-[#2e241b]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {language === 'de' ? 'Packliste' : language === 'pl' ? 'Niezbędnik pakowania' : 'Packing Essentials'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'planner' ? (
          <motion.div
            key="planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">
                {language === 'de' ? 'Individueller Reiseplan' : language === 'pl' ? 'Spersonalizowany plan podróży' : 'Custom Travel Plan'}
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] mt-1 uppercase">
                {language === 'de' ? 'Kreativer Reiseplaner' : language === 'pl' ? 'Kreator spersonalizowanego planu podróży' : 'Custom Travel Itinerary Planner'}
              </h2>
              <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
                {language === 'de' 
                  ? 'Planen Sie Ihre perfekte Reise, indem Sie Ihre Reisedaten unten eingeben, um einen maßgeschneiderten Tagesplan zu erhalten.'
                  : language === 'pl'
                  ? 'Zaplanuj swoją idealną podróż, wprowadzając szczegóły poniżej, aby otrzymać spersonalizowany plan dzień po dniu.'
                  : 'Plan your perfect trip by entering your travel details below to receive a personalized day-by-day itinerary.'}
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#211911] p-6 rounded-2xl border border-[#d4af37]/15">
              
              {/* Duration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-stone-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d4af37]" />
                    {language === 'de' ? 'Reisedauer (Tage)' : language === 'pl' ? 'Czas trwania podróży (dni)' : 'Trip Duration (Days)'}
                  </label>
                  <span className="text-[#d4af37] font-mono font-bold text-lg">
                    {duration} {language === 'de' ? 'Tage' : language === 'pl' ? 'Dni' : 'Days'}
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={7}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-[#d4af37] bg-stone-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>{language === 'de' ? '3 Tage (Kurztrip)' : language === 'pl' ? '3 dni (Krótki wyjazd)' : '3 Days (Short Trip)'}</span>
                  <span>{language === 'de' ? '7 Tage (Volles Erlebnis)' : language === 'pl' ? '7 dni (Pełne doświadczenie)' : '7 Days (Full Experience)'}</span>
                </div>
              </div>

              {/* Primary Focus */}
              <div className="space-y-1.5">
                <label className="text-stone-300 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#d4af37]" />
                  {language === 'de' ? 'Hauptfokus' : language === 'pl' ? 'Główny cel' : 'Primary Focus'}
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-[#16120e] border border-[#d4af37]/35 rounded-lg p-2.5 text-[#f3e5c8] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                >
                  {interests.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Pacing */}
              <div className="space-y-1.5">
                <label className="text-stone-300 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#d4af37]" />
                  {language === 'de' ? 'Tempo' : language === 'pl' ? 'Tempo' : 'Pacing'}
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-[#16120e] border border-[#d4af37]/35 rounded-lg p-2.5 text-[#f3e5c8] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                >
                  {paces.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Companions */}
              <div className="space-y-1.5">
                <label className="text-stone-300 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4af37]" />
                  {language === 'de' ? 'Reisebegleitung' : language === 'pl' ? 'Towarzysze podróży' : 'Travel Companions'}
                </label>
                <select
                  value={companion}
                  onChange={(e) => setCompanion(e.target.value)}
                  className="w-full bg-[#16120e] border border-[#d4af37]/35 rounded-lg p-2.5 text-[#f3e5c8] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                >
                  {companions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Special Requests */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-stone-300 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#d4af37]" />
                  {language === 'de' ? 'Besondere Wünsche (Optional)' : language === 'pl' ? 'Specjalne życzenia (Opcjonalnie)' : 'Special Requests (Optional)'}
                </label>
                <textarea
                  value={customReq}
                  onChange={(e) => setCustomReq(e.target.value)}
                  placeholder={language === 'de' ? 'Z. B. vegetarische Optionen, bestimmte Tauchplätze, Jubiläumswünsche...' : language === 'pl' ? 'Np. opcje wegetariańskie, konkretne miejsca nurkowe, życzenia rocznicowe...' : 'E.g., Vegetarian options, specific diving sites, anniversary requests...'}
                  rows={2}
                  className="w-full bg-[#16120e] border border-[#d4af37]/30 rounded-lg p-3 text-[#f3e5c8] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] placeholder-stone-600"
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={generateItinerary}
                disabled={isGenerating}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#d4af37] to-[#9a7b1c] text-[#140f0a] font-serif font-bold text-base px-10 py-3.5 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] hover:scale-[1.02] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                id="consult-scribe-btn"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#140f0a]" />
                    {language === 'de' ? 'Reiseplan wird generiert...' : language === 'pl' ? 'Generowanie planu podróży...' : 'Generating Travel Plan...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#140f0a] animate-pulse" />
                    {language === 'de' ? 'Meinen Reiseplan generieren' : language === 'pl' ? 'Wygeneruj mój plan podróży' : 'Generate My Travel Itinerary'}
                  </>
                )}
              </button>
            </div>

            {/* Generated Itinerary Display */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="itinerary-skeleton"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#faf3e0] border-8 border-double border-[#8b6508] rounded-2xl p-6 md:p-8 text-[#2b1f0d] relative shadow-[0_0_50px_rgba(0,0,0,0.6)] font-sans max-w-4xl mx-auto overflow-hidden mt-8"
                  id="parchment-itinerary-skeleton"
                >
                  {/* Parchment Background Texture Accent */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(139,101,8,0.06)_100%)] pointer-events-none"></div>

                  {/* Golden glowing shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6508]/15 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none"></div>

                  <div className="text-center border-b-2 border-[#8b6508]/20 pb-6 mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8b6508] font-bold block animate-pulse">
                      {language === 'de' ? 'Reiseoptionen werden analysiert...' : language === 'pl' ? 'Analizowanie opcji podróży...' : 'Analyzing Travel Options...'}
                    </span>
                    <h3 className="font-serif text-2xl font-black text-[#5c4001] tracking-wide mt-2 uppercase">
                      {language === 'de' ? 'Ihr maßgeschneiderter Reiseplan wird erstellt' : language === 'pl' ? 'Tworzenie Twojego spersonalizowanego planu' : 'Creating Your Custom Itinerary'}
                    </h3>
                    
                    {/* Animated Golden Hieroglyphs pulsing in sequence */}
                    <div className="flex justify-center gap-3.5 text-[#8b6508] text-2xl font-serif py-3 mt-1.5">
                      {[
                        { glyph: '𓋹', delay: 0 },
                        { glyph: '𓂀', delay: 0.2 },
                        { glyph: '𓅃', delay: 0.4 },
                        { glyph: '𓏞', delay: 0.6 },
                        { glyph: '𓎬', delay: 0.8 },
                        { glyph: '𓆛', delay: 1.0 },
                        { glyph: '𓊟', delay: 1.2 }
                      ].map((item, index) => (
                        <motion.span
                          key={index}
                          animate={{ 
                            opacity: [0.25, 1, 0.25], 
                            scale: [0.95, 1.15, 0.95],
                            y: [0, -3, 0] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.6, 
                            delay: item.delay,
                            ease: "easeInOut"
                          }}
                          className="filter drop-shadow-[0_0_4px_rgba(139,101,8,0.35)] select-none"
                        >
                          {item.glyph}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Scribe greeting skeleton */}
                  <motion.div 
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="bg-[#f0e4c6] border-l-4 border-[#8b6508] p-4 rounded-r-lg mb-8 space-y-2.5"
                  >
                    <div className="w-full h-3 bg-[#8b6508]/15 rounded-md" />
                    <div className="w-4/5 h-3 bg-[#8b6508]/15 rounded-md" />
                  </motion.div>

                  {/* 3 Days Timeline Skeleton */}
                  <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#8b6508]/15">
                    {[1, 2, 3].map((dayNum) => (
                      <div key={dayNum} className="relative pl-12">
                        {/* Bullet Circle */}
                        <div className="absolute left-[14px] top-1.5 w-5 h-5 rounded-full border-2 border-[#faf3e0] bg-[#8b6508]/40 shadow-[0_0_8px_rgba(139,101,8,0.25)] flex items-center justify-center text-[10px] font-bold text-[#faf3e0] font-mono animate-pulse">
                          {dayNum}
                        </div>

                        <div className="space-y-3">
                          <motion.div 
                            animate={{ opacity: [0.5, 0.9, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: dayNum * 0.2 }}
                            className="w-1/3 h-5 bg-[#8b6508]/20 rounded-md"
                          />
                          
                          <div className="space-y-2">
                            <motion.div 
                              animate={{ opacity: [0.4, 0.8, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: dayNum * 0.2 + 0.1 }}
                              className="w-full h-3 bg-[#8b6508]/10 rounded-md"
                            />
                            <motion.div 
                              animate={{ opacity: [0.4, 0.8, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: dayNum * 0.2 + 0.2 }}
                              className="w-5/6 h-3 bg-[#8b6508]/10 rounded-md"
                            />
                          </div>

                          {/* Scribe Wisdom Box Skeleton */}
                          <div className="mt-3 bg-[#f2e7c9] border border-[#8b6508]/15 rounded-lg p-3 space-y-2">
                            <div className="w-24 h-3 bg-[#8b6508]/25 rounded-md animate-pulse" />
                            <div className="w-11/12 h-2.5 bg-[#8b6508]/10 rounded-md animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Royal Blessing Conclusion Skeleton */}
                  <div className="mt-8 pt-6 border-t-2 border-[#8b6508]/20 text-center space-y-2">
                    <div className="w-1/2 h-3.5 bg-[#8b6508]/15 mx-auto rounded-md animate-pulse" />
                    <div className="mt-4 flex justify-center gap-2 text-[#8b6508]/30 text-2xl select-none animate-pulse">
                      𓋹 𓎬 𓅃
                    </div>
                  </div>
                </motion.div>
              ) : itinerary ? (() => {
                const totalActivities = itinerary.days.reduce((sum, d) => sum + d.activities.length, 0);
                const targetActivities = itinerary.days.length * 3;
                const progressPercent = targetActivities > 0 ? Math.min(100, Math.round((totalActivities / targetActivities) * 100)) : 0;

                return (
                  <motion.div
                    key="itinerary-parchment"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-[#faf3e0] border-8 border-double border-[#8b6508] rounded-2xl p-6 md:p-8 text-[#2b1f0d] relative shadow-[0_0_50px_rgba(0,0,0,0.6)] font-sans max-w-4xl mx-auto overflow-hidden mt-8"
                    id="parchment-itinerary"
                  >
                    {/* Parchment Background Texture Accent */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(139,101,8,0.06)_100%)] pointer-events-none"></div>

                    {/* Actions bar */}
                    <div className="md:absolute md:top-6 md:right-6 mb-6 md:mb-0 flex justify-center gap-2 z-10">
                      <button
                        onClick={() => setShowPrintModal(true)}
                        className="bg-[#8b6508] hover:bg-[#6e4e03] text-white px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 group/btn border border-yellow-600/30"
                        title={language === 'de' ? 'Reiseplan exportieren (PDF)' : language === 'pl' ? 'Eksportuj plan podróży (PDF)' : language === 'cs' ? 'Exportovat itinerář (PDF)' : 'Export Itinerary (PDF)'}
                      >
                        <Printer className="w-3.5 h-3.5 text-yellow-200 group-hover/btn:scale-110 transition-transform" />
                        <span>{language === 'de' ? 'Reiseplan exportieren' : language === 'pl' ? 'Eksportuj plan' : language === 'cs' ? 'Exportovat itinerář' : 'Export Itinerary'}</span>
                      </button>

                      {onAddBooking && (
                        <button
                          onClick={initExportBooking}
                          className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e6c280] hover:to-[#d4af37] text-[#140f0a] px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 group/btn border border-yellow-600/30"
                          title={language === 'de' ? 'Buchungsanfrage für diesen Reiseplan senden' : language === 'pl' ? 'Prześlij prośbę o rezerwację tego planu' : language === 'cs' ? 'Odeslat žádost o rezervaci tohoto itineráře' : 'Submit booking request for this itinerary'}
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#140f0a] group-hover/btn:scale-110 transition-transform" />
                          <span>{language === 'de' ? 'Reise buchen' : language === 'pl' ? 'Zarezerwuj plan' : language === 'cs' ? 'Rezervovat itinerář' : 'Book Itinerary'}</span>
                        </button>
                      )}
                    </div>

                    <div className="text-center border-b-2 border-[#8b6508]/20 pb-6 mb-6 md:pr-48">
                      <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8b6508] font-bold">
                        {language === 'de' ? 'Ihr individueller Reiseplan' : language === 'pl' ? 'Twój spersonalizowany plan podróży' : language === 'cs' ? 'Váš spersonalizovaný plán cesty' : 'Your Customized Travel Plan'}
                      </span>
                      <h3 className="font-serif text-3xl font-black text-[#5c4001] tracking-wide mt-1 uppercase">
                        {itinerary.title}
                      </h3>
                    </div>

                    {/* Voyage Progress Banner */}
                    <div className="bg-[#f3e6c3] border-2 border-dashed border-[#8b6508]/40 rounded-xl p-4 mb-6 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6508]/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2.5">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#5c4001] uppercase flex items-center gap-2">
                            <span className="text-[#8b6508] text-base">𓊟</span>
                            {language === 'de' ? 'Ihr Reisemanifest' : language === 'pl' ? 'Twój manifest podróży' : 'Your Travel Manifest'}
                          </h4>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            {progressPercent < 35 ? (
                              <span>{language === 'de' ? 'Fügen Sie mehr Ausflüge hinzu, um Ihren Plan zu vervollständigen.' : language === 'pl' ? 'Dodaj więcej wycieczek i aktywności, aby uzupełnić swój plan.' : 'Add more excursions and activities to complete your itinerary.'}</span>
                            ) : progressPercent < 75 ? (
                              <span>{language === 'de' ? 'Ihr Reiseplan nimmt langsam Gestalt an!' : language === 'pl' ? 'Twój plan podróży nabiera świetnego kształtu!' : 'Your travel itinerary is shaping up nicely!'}</span>
                            ) : progressPercent < 100 ? (
                              <span>{language === 'de' ? 'Fast fertig! Fügen Sie noch ein paar Aktivitäten hinzu.' : language === 'pl' ? 'Prawie gotowe! Dodaj jeszcze kilka aktywności, aby zakończyć planowanie.' : 'Almost finished! Add a couple more activities to complete your plans.'}</span>
                            ) : (
                              <span className="text-[#5c4001] font-semibold">{language === 'de' ? 'Perfekt! Ihr Reiseplan ist vollständig und bereit.' : language === 'pl' ? 'Doskonale! Twój plan podróży jest kompletny i gotowy.' : 'Perfect! Your travel itinerary is complete and ready.'}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right flex md:flex-col items-baseline md:items-end gap-1.5">
                          <span className="text-xs font-mono font-bold text-[#8b6508] bg-[#faf3e0] px-2 py-0.5 rounded border border-[#8b6508]/20 shadow-sm">
                            {totalActivities} / {targetActivities} {language === 'de' ? 'Aktivitäten' : language === 'pl' ? 'Aktywności' : language === 'cs' ? 'Aktivity' : 'Activities'}
                          </span>
                          <span className="text-xs font-serif font-black text-[#5c4001]">
                            {progressPercent}% {language === 'de' ? 'Abgeschlossen' : language === 'pl' ? 'Ukończono' : language === 'cs' ? 'Dokončeno' : 'Complete'}
                          </span>
                        </div>
                      </div>

                      {/* Modern Progress Track with Sliding Hieroglyph */}
                      <div className="relative h-4 bg-[#e2d5b2] rounded-full overflow-visible border border-[#8b6508]/20 p-[2px]">
                        {/* Active Fill */}
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#8b6508]/60 via-[#8b6508] to-[#604403] rounded-full shadow-[0_0_8px_rgba(139,101,8,0.35)] relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        >
                          {/* Glowing Tip */}
                          {progressPercent > 0 && (
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-200/50 rounded-r-full filter blur-[1px]"></div>
                          )}
                        </motion.div>

                        {/* Sliding Hieroglyph Walker Icon */}
                        <motion.div 
                          className="absolute top-1/2 -translate-y-1/2 -ml-2 text-base select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] cursor-default"
                          animate={{ left: `${progressPercent}%` }}
                          transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          style={{ pointerEvents: 'none' }}
                        >
                          {progressPercent === 100 ? '𓋹' : progressPercent > 60 ? '𓅃' : '𓀚'}
                        </motion.div>
                      </div>

                      {/* Progress Marks */}
                      <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-1.5 px-1">
                        <span>{language === 'de' ? 'Kurztrip' : language === 'pl' ? 'Krótki wyjazd' : language === 'cs' ? 'Krátký výlet' : 'Short Trip'} (0%)</span>
                        <span className={`${progressPercent >= 50 ? 'text-[#8b6508] font-bold' : ''}`}>{language === 'de' ? 'Ausgewogen' : language === 'pl' ? 'Zrównoważony' : language === 'cs' ? 'Vyvážený' : 'Balanced'} (50%)</span>
                        <span className={`${progressPercent === 100 ? 'text-[#8b6508] font-bold' : ''}`}>{language === 'de' ? 'Volles Erlebnis' : language === 'pl' ? 'Pełne doświadczenie' : language === 'cs' ? 'Plný zážitek' : 'Full Experience'} (100%)</span>
                      </div>
                    </div>

                    {/* Poetic Greeting */}
                    <div className="bg-[#f0e4c6] border-l-4 border-[#8b6508] p-4 rounded-r-lg mb-8 italic text-stone-800 text-sm leading-relaxed shadow-sm">
                      "{itinerary.royalGreeting}"
                    </div>

                    {/* Days Timeline */}
                    <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#8b6508]/20">
                      {itinerary.days.map((day) => (
                        <div key={day.dayNumber} className="relative pl-12 group/day">
                          {/* Bullet Circle */}
                          <div className="absolute left-[14px] top-1.5 w-5 h-5 rounded-full border-4 border-[#faf3e0] bg-[#8b6508] shadow-[0_0_10px_rgba(139,101,8,0.4)] flex items-center justify-center text-[10px] font-bold text-white font-mono group-hover/day:scale-110 transition-transform">
                            {day.dayNumber}
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-serif text-lg font-bold text-[#5c4001] uppercase flex items-center gap-2">
                              {language === 'de' ? 'Tag' : language === 'pl' ? 'Dzień' : language === 'cs' ? 'Den' : 'Day'} {day.dayNumber}: {day.theme}
                            </h4>
                            
                            {/* Interactive Activities list */}
                            <ul className="space-y-2 text-stone-700 text-sm">
                              {day.activities.map((act, i) => (
                                <motion.li 
                                  key={i} 
                                  layout
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="group/item flex items-start justify-between gap-3 bg-[#faf3e0]/40 hover:bg-[#faf3e0]/90 p-2 rounded-lg border border-transparent hover:border-[#8b6508]/15 transition-all"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-[#8b6508] mt-1 select-none text-xs">𓎬</span>
                                    <span className="leading-relaxed text-stone-800">{act}</span>
                                  </div>
                                  <button
                                    onClick={() => removeActivity(day.dayNumber, i)}
                                    className="text-stone-400 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                                    title={language === 'de' ? 'Aktivität entfernen' : language === 'pl' ? 'Usuń tę aktywność' : language === 'cs' ? 'Odebrat tuto aktivitu' : 'Remove this activity'}
                                  >
                                    <span className="text-xs font-bold font-mono">✕</span>
                                  </button>
                                </motion.li>
                              ))}
                            </ul>

                            {/* Add Custom Activity Form */}
                            <div className="mt-3 bg-[#fbf8ee]/60 border border-dashed border-[#8b6508]/20 rounded-xl p-2.5">
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const val = newActivityInputs[day.dayNumber] || "";
                                  if (val.trim()) {
                                    addActivity(day.dayNumber, val);
                                    setNewActivityInputs(prev => ({ ...prev, [day.dayNumber]: "" }));
                                  }
                                }}
                                className="flex gap-2"
                              >
                                <input
                                  type="text"
                                  placeholder={language === 'de' ? 'Eigene Aktivität eingeben...' : language === 'pl' ? 'Wpisz własną aktywność...' : language === 'cs' ? 'Zadejte vlastní aktivitu...' : 'Enter custom activity...'}
                                  value={newActivityInputs[day.dayNumber] || ""}
                                  onChange={(e) => setNewActivityInputs(prev => ({ ...prev, [day.dayNumber]: e.target.value }))}
                                  className="flex-1 bg-[#fcfaf4] border border-[#8b6508]/25 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8b6508] placeholder-stone-400"
                                />
                                <button
                                  type="submit"
                                  className="bg-[#8b6508] hover:bg-[#6e4e03] text-white px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <span>+</span>
                                  <span>{language === 'de' ? 'Hinzufügen' : language === 'pl' ? 'Dodaj' : language === 'cs' ? 'Přidat' : 'Add'}</span>
                                </button>
                              </form>
                            </div>

                            {/* Scribe Wisdom Box */}
                            <div className="mt-3 bg-[#f2e7c9] border border-[#8b6508]/15 rounded-lg p-3 text-xs text-stone-600 italic">
                              <span className="font-serif font-bold text-[#8b6508] block not-italic mb-1 uppercase tracking-wider">
                                {language === 'de' ? '𓋹 Historischer & kultureller Tipp:' : language === 'pl' ? '𓋹 Wskazówka historyczno-kulturowa:' : language === 'cs' ? '𓋹 Historický a kulturní tip:' : '𓋹 Historical & Cultural Tip:'}
                              </span>
                              {day.scribeWisdom}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Royal Blessing Conclusion */}
                    <div className="mt-8 pt-6 border-t-2 border-[#8b6508]/25 text-center">
                      <p className="text-sm font-serif italic text-stone-800 leading-relaxed">
                        "{itinerary.blessing}"
                      </p>
                      <div className="mt-4 flex justify-center text-[#8b6508] text-4xl select-none">
                        𓋹 𓎬 𓅃
                      </div>
                    </div>
                  </motion.div>
                );
              })() : null}
            </AnimatePresence>
          </motion.div>
        ) : (activeTab as any) === 'packing' ? (
          <motion.div
            key="packing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">
                {language === 'de' ? 'Ausrüstung & Schutz' : language === 'pl' ? 'Niezbędnik pakowania' : 'Gear & Protections'}
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] mt-1 uppercase">
                {language === 'de' ? 'Pharaonische Packliste' : language === 'pl' ? 'Królewska lista rzeczy' : 'Scribe\'s Packing Essentials'}
              </h2>
              <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
                {language === 'de' 
                  ? 'Der Sand ist heiß, die Gräber sind dunkel und das Rote Meer ist tief. Lassen Sie unseren Schreiber eine maßgeschneiderte Packliste basierend auf Ihren ausgewählten Ausflügen erstellen.'
                  : language === 'pl'
                  ? 'Piasek jest gorący, grobowce ciemne, a Morze Czerwone głębokie. Pozwól pisaćowi przygotować spersonalizowaną listę rzeczy do spakowania na podstawie wybranych wycieczek.'
                  : 'The sands are scorching, the tombs dark, and the Red Sea is deep. Let the Royal Scribe construct a customized packing checklist tailored directly to your chosen excursions.'}
              </p>
            </div>

            {/* Scribe Wisdom Banner */}
            <div className="bg-[#241c14] border border-[#d4af37]/25 rounded-2xl p-4 md:p-5 flex items-start gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-[0.02] text-7xl font-serif select-none pointer-events-none">
                𓆟
              </div>
              <div className="bg-[#140f0c] p-3 rounded-xl border border-[#d4af37]/20 text-2xl text-[#d4af37] select-none">
                𓀚
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-[#e6c280] uppercase tracking-wide">
                  {language === 'de' ? 'Schreiber Sennedjems Rat' : language === 'pl' ? 'Rada Pisarza Sennedjema' : 'Counsel of Scribe Sennedjem'}
                </h4>
                <p className="text-stone-300 text-xs leading-relaxed italic">
                  {language === 'de'
                    ? '"Gute Vorbereitung schützt den Reisenden unter dem Auge von Ra. Wer das Rote Meer befahren will, muss die Riffe von Sobek ehren. Wer das rote Land (Deshret) durchqueren möchte, muss seine Füße vor der Wüstenglut schützen. Packt weise, und eure Reise wird gesegnet sein."'
                    : language === 'pl'
                    ? '"Dobre przygotowanie chroni podróżnika pod okiem Ra. Kto pragnie żeglować po Morzu Czerwonym, musi szanować rafy Sobka. Kto pragnie przemierzyć czerwoną ziemię (Deshret), musi chronić stopy przed żarem. Pakujcie się mądrze, a wasza podróż będzie błogosławiona."'
                    : '"Good preparation shields the traveler under the hot eye of Ra. He who wishes to sail the Red Sea must honor the living reef of Sobek. He who wishes to cross the red land of Deshret must guard his feet from the sands. Pack wisely, and your voyage will be favored."'}
                </p>
              </div>
            </div>

            {/* Interactive Excursions Toggle Deck */}
            <div className="bg-[#1b140f] border border-[#d4af37]/15 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-[#d4af37]/10">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#e6c280] uppercase tracking-wider">
                    {language === 'de' ? '1. Wählen Sie Ihre geplanten Ausflüge' : language === 'pl' ? '1. Wybierz planowane wycieczki' : '1. Select Your Scheduled Excursions'}
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {language === 'de'
                      ? 'Aktivieren Sie Ausflüge, um die Liste sofort anzupassen.'
                      : language === 'pl'
                      ? 'Zaznacz wycieczki, aby natychmiast dostosować listę.'
                      : 'Toggle excursions on and off to dynamically inject customized equipment requirements.'}
                  </p>
                </div>
                {bookings.length > 0 && (
                  <span className="text-[10px] font-mono text-[#d4af37] bg-[#241c14] border border-[#d4af37]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {language === 'de' ? 'Aus Buchungen geladen' : language === 'pl' ? 'Wczytano z rezerwacji' : 'Syncing Live Bookings'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {excursions.map(exc => {
                  const isSelected = selectedExcursionsForPacking.includes(exc.id);
                  const isBooked = bookings.some(b => b.excursionId === exc.id);
                  return (
                    <button
                      key={exc.id}
                      onClick={() => toggleExcursionForPacking(exc.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2a2015] border-[#d4af37] shadow-md shadow-[#d4af37]/5 text-stone-100'
                          : 'bg-[#120e0a]/60 border-stone-800 hover:border-stone-700 text-stone-400'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border text-xs transition-colors ${
                        isSelected 
                          ? 'bg-[#d4af37] border-[#d4af37] text-[#140f0a]' 
                          : 'border-stone-600 bg-stone-900/40 text-transparent'
                      }`}>
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-serif font-bold truncate leading-tight flex items-center gap-1">
                          {exc.title}
                          {isBooked && <span className="text-[9px] font-mono text-amber-400 uppercase tracking-tighter" title="Booked!">(Booked)</span>}
                        </div>
                        <span className="text-[9px] font-mono uppercase text-stone-500 tracking-wider">
                          {exc.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklist Header Actions & Progress */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#211811] border border-[#d4af37]/15 p-4 rounded-2xl">
              {/* Progress Tracker with sliding Eye of Horus or Ankh */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs font-serif font-bold text-[#e6c280] uppercase tracking-wide">
                  <span>{language === 'de' ? 'Sicherungsverlauf' : language === 'pl' ? 'Postęp pakowania' : 'Items Secured & Packed'}</span>
                  <span className="font-mono text-[#d4af37]">
                    {computedCheckedCount} / {computedTotalItems} ({computedProgressPercent}%)
                  </span>
                </div>
                {/* Progress bar container */}
                <div className="relative h-3.5 bg-stone-950 rounded-full overflow-visible border border-[#d4af37]/25 p-[2px]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#d4af37]/70 to-[#d4af37] rounded-full relative shadow-[0_0_8px_rgba(212,175,55,0.35)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${computedProgressPercent}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  />
                  {/* Floating Eye of Horus symbol walking along the progress bar */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -ml-2 text-sm select-none pointer-events-none text-[#d4af37]"
                    animate={{ left: `${computedProgressPercent}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  >
                    𓂀
                  </motion.div>
                </div>
              </div>

              {/* Clipboard & Print Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={copyChecklistToClipboard}
                  className="flex-1 md:flex-none bg-[#241c14] hover:bg-[#2f241a] text-[#e6c280] border border-[#d4af37]/35 py-2.5 px-4 rounded-xl text-xs font-serif font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'de' ? 'Kopiert!' : language === 'pl' ? 'Skopiowano!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#d4af37]" />
                      <span>{language === 'de' ? 'Liste kopieren' : language === 'pl' ? 'Kopiuj listę' : 'Copy Text'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 md:flex-none bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e6c280] hover:to-[#d4af37] text-[#140f0a] py-2.5 px-4 rounded-xl text-xs font-serif font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#140f0a]" />
                  <span>{language === 'de' ? 'Drucken / PDF' : language === 'pl' ? 'Drukuj / PDF' : 'Print Checklist'}</span>
                </button>
              </div>
            </div>

            {/* Checklist Category Groups */}
            <div className="space-y-4">
              {generatedChecklist.length === 0 ? (
                <div className="bg-[#241c14]/40 border border-[#d4af37]/15 rounded-2xl p-10 text-center space-y-2">
                  <span className="text-4xl text-[#d4af37]/40 block">𓎬</span>
                  <p className="text-stone-400 text-sm">
                    {language === 'de' 
                      ? 'Wählen Sie oben mindestens einen Ausflug aus, um Ihre Packliste zu generieren.'
                      : language === 'pl' 
                      ? 'Wybierz co najmniej jedną wycieczkę powyżej, aby wygenerować niezbędnik.'
                      : 'Please select at least one excursion above to compile your personalized packing checklist.'}
                  </p>
                </div>
              ) : (
                generatedChecklist.map(cat => {
                  const catTitle = cat.title[language as 'en' | 'de' | 'pl' | 'cs'] || cat.title.en;
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#1c1611] border border-[#d4af37]/20 rounded-2xl p-5 space-y-4 shadow-lg hover:border-[#d4af37]/35 transition-colors"
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-3 pb-2 border-b border-stone-800">
                        <span className="text-xl text-[#d4af37] select-none">{cat.icon}</span>
                        <h3 className="font-serif text-base font-bold text-[#e6c280] uppercase tracking-wider">
                          {catTitle}
                        </h3>
                      </div>

                      {/* Category Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cat.items.map(item => {
                          const isChecked = !!checkedItems[item.id];
                          const name = item.name[language as 'en' | 'de' | 'pl' | 'cs'] || item.name.en;
                          const desc = item.desc[language as 'en' | 'de' | 'pl' | 'cs'] || item.desc.en;

                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-[#14100c]/40 border-stone-800/40 text-stone-500'
                                  : 'bg-[#201812]/50 border-[#d4af37]/10 hover:border-[#d4af37]/30 text-stone-200'
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#d4af37]/65 hover:text-[#d4af37]" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-xs font-serif font-bold tracking-wide block ${
                                  isChecked ? 'line-through text-stone-500' : 'text-[#e6c280]'
                                }`}>
                                  {name}
                                </span>
                                <p className={`text-[11px] leading-relaxed ${
                                  isChecked ? 'text-stone-600' : 'text-stone-400'
                                }`}>
                                  {desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[550px]"
          >
            <div className="text-center mb-3">
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">{language === 'de' ? 'KI-Chat' : language === 'pl' ? 'Czat AI' : language === 'cs' ? 'AI Chat' : 'AI Chat'}</span>
              <h2 className="font-serif text-2xl font-bold text-[#e6c280] mt-1 uppercase">
                {language === 'de' ? 'Mit KI-Reiseführer chatten' : language === 'pl' ? 'Rozmawiaj z przewodnikiem AI' : language === 'cs' ? 'Chatovat s AI průvodcem' : 'Chat with AI Travel Guide'}
              </h2>
            </div>



            {/* Chat Messages area */}
            <div className="flex-1 overflow-y-auto bg-[#16120e] border border-[#d4af37]/20 rounded-2xl p-4 md:p-6 space-y-4 mb-4" id="scribe-chat-chamber">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md relative ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#d4af37] to-[#c5a059] text-[#140f0a] rounded-tr-none font-medium'
                        : 'bg-[#241c14] border border-[#d4af37]/20 text-stone-200 rounded-tl-none'
                    }`}
                  >
                    {/* Timestamp */}
                    <div className={`text-[9px] font-mono mb-1.5 ${msg.role === 'user' ? 'text-[#140f0a]/60' : 'text-stone-500'}`}>
                      {msg.role === 'user' ? (language === 'de' ? 'Reisender' : language === 'pl' ? 'Podróżnik' : language === 'cs' ? 'Cestovatel' : 'Traveler') : (language === 'de' ? 'Schreiber Sennedjem' : language === 'pl' ? 'Pisarz Sennedjem' : language === 'cs' ? 'Písař Sennedjem' : 'Scribe Sennedjem')} • {msg.timestamp}
                    </div>
                    {formatScribeMessage(msg.text, msg.role === 'user')}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#241c14] border border-[#d4af37]/25 rounded-2xl rounded-tl-none px-5 py-3.5 flex flex-col gap-2.5 max-w-[80%] shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="text-[#d4af37] text-sm font-serif select-none"
                      >
                        𓋹
                      </motion.div>
                      <span className="italic tracking-wide text-[#e6c280]/95">{language === 'de' ? 'KI-Reiseführer schreibt...' : language === 'pl' ? 'Przewodnik AI pisze...' : language === 'cs' ? 'AI průvodce píše...' : 'AI Travel Guide is writing...'}</span>
                    </div>
                    {/* Floating gold hieroglyphs typing transition */}
                    <div className="flex items-center gap-3 bg-[#1c1611] px-4 py-2 rounded-xl border border-[#d4af37]/10 w-fit">
                      {[
                        { symbol: '𓋹', delay: 0 },
                        { symbol: '𓂀', delay: 0.2 },
                        { symbol: '𓅃', delay: 0.4 },
                        { symbol: '𓏞', delay: 0.6 },
                        { symbol: '𓎬', delay: 0.8 }
                      ].map((item, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0.25, y: 1.5 }}
                          animate={{ 
                            opacity: [0.25, 1, 0.25],
                            y: [1.5, -3, 1.5],
                            scale: [0.95, 1.15, 0.95]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.4,
                            delay: item.delay,
                            ease: "easeInOut"
                          }}
                          className="text-[#d4af37] text-lg font-serif select-none filter drop-shadow-[0_0_3px_rgba(212,175,55,0.45)]"
                        >
                          {item.symbol}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mb-3">
              <p className="text-[10px] font-mono text-[#d4af37]/75 uppercase tracking-wider mb-2 select-none">
                {language === 'de' ? '𓏞 Scribe-Konsultationen:' : language === 'pl' ? '𓏞 Konsultacje pisarza:' : language === 'cs' ? '𓏞 Konzultace písaře:' : '𓏞 Scribe Consultations:'}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {(language === 'de' ? [
                  { text: "𓋹 Meine Buchungen prüfen", prompt: "Bitte zeige meine aktiven Caravan-Buchungen an." },
                  { text: "𓂀 Hieroglyphen-Name", prompt: "Kannst du meinen Namen in Hieroglyphen übersetzen?" },
                  { text: "𓆟 Rotes Meer Tauchen", prompt: "Welche Tauchabenteuer am Roten Meer empfiehlst du?" },
                  { text: "𓃘 Wüsten-Safaris", prompt: "Erzähle mir von den Wüsten-Quad- und Kamelsafaris." }
                ] : language === 'pl' ? [
                  { text: "𓋹 Sprawdź rezerwacje", prompt: "Proszę pokaż moje aktywne rezerwacje karawanowe." },
                  { text: "𓂀 Imię w hieroglifach", prompt: "Czy możesz przetłumaczyć moje imię na hieroglify?" },
                  { text: "𓆟 Nurkowanie Morze Czerwone", prompt: "Jakie przygody z nurkowaniem w Morzu Czerwonym polecasz?" },
                  { text: "𓃘 Safari pustynne", prompt: "Opowiedz mi o quadowym i wielbłądzim safari na pustyni." }
                ] : language === 'cs' ? [
                  { text: "𓋹 Zkontrolovat rezervace", prompt: "Prosím, ukaž moje aktivní rezervace karavan." },
                  { text: "𓂀 Jméno v hieroglyfech", prompt: "Můžeš přeložit mé jméno do hieroglyfů?" },
                  { text: "𓆟 Potápění v Rudém moři", prompt: "Jaká dobrodružství při potápění v Rudém moři doporučuješ?" },
                  { text: "𓃘 Pouštní safari", prompt: "Řekni mi o safari na čtyřkolkách a velbloudech v poušti." }
                ] : [
                  { text: "𓋹 Check my bookings", prompt: "Please show my active caravan bookings." },
                  { text: "𓂀 Hieroglyph Name", prompt: "Can you translate my name into hieroglyphs?" },
                  { text: "𓆟 Red Sea Diving", prompt: "What Red Sea diving adventures do you recommend?" },
                  { text: "𓃘 Desert Safaris", prompt: "Tell me about the desert quad and camel safaris." }
                ]).map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => triggerQuickPrompt(sug.prompt)}
                    disabled={isChatLoading}
                    className="text-xs bg-[#241c14] hover:bg-[#d4af37]/15 text-[#e6c280] border border-[#d4af37]/30 rounded-full px-3 py-1 transition-all hover:border-[#d4af37]/70 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    {sug.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive WhatsApp Portals & Booking Form */}
            <div className="mb-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(!showBookingForm);
                    if (!waBookName) {
                      setWaBookName(localStorage.getItem('kemet_traveler_name') || '');
                    }
                    if (!waBookExcursion && excursions.length > 0) {
                      setWaBookExcursion(excursions[0].id);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer select-none ${
                    showBookingForm
                      ? 'bg-[#d4af37] text-[#140f0a] border-[#d4af37]'
                      : 'bg-[#241c14] hover:bg-[#2f241a] text-[#d4af37] border-[#d4af37]/35'
                  }`}
                >
                  <span>𓎬</span>
                  <span>{language === 'de' ? 'Direkt buchen (WhatsApp)' : language === 'pl' ? 'Zarezerwuj (WhatsApp)' : 'Book Caravan (WhatsApp)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWaSupportClick}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-100 border border-emerald-500/20 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer select-none"
                >
                  <span>𓀚</span>
                  <span>{language === 'de' ? 'Berater kontaktieren' : language === 'pl' ? 'Kontakt z doradcą' : 'Contact Real Person'}</span>
                </button>
              </div>

              <AnimatePresence>
                {showBookingForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="bg-[#241c14] border border-[#d4af37]/35 rounded-xl p-4 space-y-3 shadow-xl"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                      <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider">𓋹 Sacred Booking Details</span>
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="text-[10px] text-stone-500 hover:text-[#d4af37]"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <form onSubmit={handleWaBookingSubmit} className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-[#e6c280] mb-1">Traveler Name</label>
                        <input
                          type="text"
                          required
                          value={waBookName}
                          onChange={(e) => setWaBookName(e.target.value)}
                          placeholder="Your Name (e.g., Cleopatra)"
                          className="w-full bg-[#120e0a] border border-[#d4af37]/25 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-[#e6c280] mb-1">Select Trip</label>
                          <select
                            value={waBookExcursion}
                            onChange={(e) => setWaBookExcursion(e.target.value)}
                            className="w-full bg-[#120e0a] border border-[#d4af37]/25 rounded-lg px-2 py-1.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50"
                          >
                            {excursions.map(ex => (
                              <option key={ex.id} value={ex.id}>{ex.title} (${ex.price})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono text-[#e6c280] mb-1">Travel Date</label>
                          <input
                            type="date"
                            required
                            value={waBookDate}
                            onChange={(e) => setWaBookDate(e.target.value)}
                            className="w-full bg-[#120e0a] border border-[#d4af37]/25 rounded-lg px-2 py-1.5 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-mono text-[#e6c280]">Guests:</span>
                          <button
                            type="button"
                            onClick={() => setWaBookGuests(g => Math.max(1, g - 1))}
                            className="bg-[#120e0a] text-[#d4af37] border border-stone-800 w-6 h-6 rounded flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold text-stone-200 px-1">{waBookGuests}</span>
                          <button
                            type="button"
                            onClick={() => setWaBookGuests(g => Math.min(20, g + 1))}
                            className="bg-[#120e0a] text-[#d4af37] border border-stone-800 w-6 h-6 rounded flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e6c280] text-[#140f0a] px-4 py-1.5 rounded-lg text-xs font-serif font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>𓋹</span>
                          <span>{language === 'de' ? 'Über WhatsApp senden' : language === 'pl' ? 'Wyślij przez WhatsApp' : 'Reserve & Redirect'}</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Form */}
            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={language === 'de' 
                  ? 'Fragen Sie nach historischen Stätten, Tauchplätzen, Wüstensafaris oder der Übersetzung eines Namens...'
                  : language === 'pl'
                  ? 'Zapytaj o miejsca historyczne, miejsca do nurkowania, safari pustynne lub przetłumaczenie imienia...'
                  : language === 'cs'
                  ? 'Zeptejte se na historická místa, potápěčské lokality, pouštní safari nebo na překlad jména...'
                  : 'Ask about historical sites, diving spots, desert safaris, or translating a name...'}
                className="flex-1 bg-[#201a14] border border-[#d4af37]/45 rounded-xl py-3 px-4 text-[#f3e5c8] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                id="scribe-chat-input"
              />
              <button
                type="submit"
                className="bg-[#d4af37] text-[#140f0a] px-5 rounded-xl flex items-center justify-center hover:bg-[#c5a059] transition-colors active:scale-95 cursor-pointer font-serif font-bold text-sm gap-2"
                id="scribe-chat-send-btn"
              >
                <Send className="w-4 h-4 text-[#140f0a]" />
                {language === 'de' ? 'Senden' : language === 'pl' ? 'Wyślij' : language === 'cs' ? 'Odeslat' : 'Send'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Overlay for Printable Papyrus Scroll */}
      <AnimatePresence>
        {showPrintModal && itinerary && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#faf3e0] border-8 border-double border-[#8b6508] rounded-2xl p-6 md:p-10 text-[#2b1f0d] relative shadow-[0_0_60px_rgba(0,0,0,0.85)] max-w-3xl w-full my-8 font-sans overflow-hidden"
            >
              {/* Background Subtle Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(139,101,8,0.06)_100%)] pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowPrintModal(false)}
                className="absolute top-4 right-4 text-[#8b6508] hover:text-red-700 hover:bg-stone-200/50 p-2 rounded-full transition-colors cursor-pointer z-20"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Print Utility Helper Banner */}
              <div className="bg-[#f2e7c9] border-l-4 border-[#8b6508] p-4 rounded-r-lg mb-6 shadow-sm">
                <h4 className="font-serif text-sm font-bold text-[#5c4001] uppercase flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-[#8b6508]" />
                  {language === 'de' ? 'Reiseplan exportieren & drucken' : language === 'pl' ? 'Eksportuj i wydrukuj plan' : language === 'cs' ? 'Exportovat a vytisknout itinerář' : 'Export & Print Itinerary'}
                </h4>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  {language === 'de' 
                    ? 'Ihr maßgeschneiderter Reiseplan ist fertig! Klicken Sie auf "Reiseplan drucken", um das Druckmenü Ihres Browsers zu öffnen. Sie können "Als PDF speichern" wählen, um eine digitale Kopie zu speichern, oder ihn direkt ausdrucken.'
                    : language === 'pl'
                    ? 'Twój spersonalizowany plan podróży jest gotowy! Kliknij „Wydrukuj plan podróży”, aby otworzyć menu drukowania przeglądarki. Możesz wybrać „Zapisz jako PDF”, aby zachować kopię cyfrową, lub wydrukować go bezpośrednio.'
                    : language === 'cs'
                    ? 'Váš spersonalizovaný plán cesty je připraven! Kliknutím na "Vytisknout itinerář" otevřete tiskové menu vašeho prohlížeče. Můžete zvolit "Uložit jako PDF" pro uchování digitální kopie, nebo jej přímo vytisknout.'
                    : 'Your custom travel plan is ready! Click Print Itinerary to open your browser\'s print menu. You can choose Save as PDF to save a digital copy or print it directly.'}
                </p>
              </div>

              {/* Preview Scroll Content */}
              <div className="border-4 border-double border-[#8b6508]/40 p-4 md:p-6 bg-[#fbf8ee]/70 rounded-xl space-y-6 max-h-[50vh] overflow-y-auto mb-6">
                <div className="text-center border-b-2 border-[#8b6508]/20 pb-4 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8b6508] font-bold block mb-1">
                    {language === 'de' ? 'Ihr maßgeschneiderter Reiseplan' : language === 'pl' ? 'Twój spersonalizowany plan podróży' : language === 'cs' ? 'Váš spersonalizovaný plán cesty' : 'Your Customized Travel Plan'}
                  </span>
                  <h3 className="font-serif text-2xl font-black text-[#5c4001] uppercase">
                    {itinerary.title}
                  </h3>
                </div>

                <p className="italic text-stone-700 text-xs leading-relaxed border-l-2 border-[#8b6508]/30 pl-3">
                  "{itinerary.royalGreeting}"
                </p>

                <div className="space-y-6">
                  {itinerary.days.map((day) => (
                    <div key={day.dayNumber} className="space-y-1.5">
                      <h4 className="font-serif text-sm font-bold text-[#5c4001] uppercase">
                        {language === 'de' ? `Tag ${day.dayNumber}: ${day.theme}` : language === 'pl' ? `Dzień ${day.dayNumber}: ${day.theme}` : language === 'cs' ? `Den ${day.dayNumber}: ${day.theme}` : `Day ${day.dayNumber}: ${day.theme}`}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-stone-700 text-xs pl-2">
                        {day.activities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4 border-t border-[#8b6508]/20">
                  <p className="text-xs font-serif italic text-stone-600">
                    "{itinerary.blessing}"
                  </p>
                </div>
              </div>

              {/* Action button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 border border-[#8b6508]/30 rounded-xl text-xs font-semibold hover:bg-stone-200/50 transition-colors cursor-pointer"
                >
                  {language === 'de' ? 'Abbrechen' : language === 'pl' ? 'Anuluj' : language === 'cs' ? 'Zrušit' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-[#8b6508] hover:bg-[#6e4e03] text-white px-5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-yellow-600/30"
                >
                  <Printer className="w-4 h-4 text-yellow-200" />
                  <span>{language === 'de' ? 'Reiseplan drucken (oder als PDF speichern)' : language === 'pl' ? 'Wydrukuj plan podróży (lub zapisz jako PDF)' : language === 'cs' ? 'Vytisknout itinerář (nebo uložit jako PDF)' : 'Print Itinerary (or Save as PDF)'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Overlay for Exporting Itinerary to Booking Ledger */}
      <AnimatePresence>
        {showExportBookingModal && itinerary && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#17120e] border-2 border-[#d4af37]/45 rounded-3xl p-6 md:p-8 text-[#fbf5e6] relative shadow-[0_0_60px_rgba(0,0,0,0.85)] max-w-lg w-full my-8 overflow-hidden font-sans"
            >
              {/* Ancient Egyptian Design Borders */}
              <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-8xl font-serif select-none pointer-events-none">
                𓂀
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowExportBookingModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-red-400 p-2 rounded-full transition-colors cursor-pointer z-20"
                title={language === 'de' ? 'Abbrechen' : language === 'pl' ? 'Anuluj' : language === 'cs' ? 'Zrušit' : 'Cancel'}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center border-b border-[#d4af37]/25 pb-4 mb-5">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block mb-1">
                  {language === 'de' ? '𓋹 Heilige Registerinschrift 𓋹' : language === 'pl' ? '𓋹 Święty wpis do rejestru 𓋹' : language === 'cs' ? '𓋹 Posvátný zápis do registru 𓋹' : '𓋹 Sacred Ledger Inscription 𓋹'}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wide">
                  {language === 'de' ? 'Maßgeschneiderte Reise buchen' : language === 'pl' ? 'Zarezerwuj spersonalizowaną podróż' : language === 'cs' ? 'Rezervovat spersonalizovanou cestu' : 'Book Custom Itinerary'}
                </h3>
                <p className="text-stone-400 text-xs mt-1">
                  {language === 'de' 
                    ? 'Senden Sie eine ausstehende Buchungsanfrage für:' 
                    : language === 'pl'
                    ? 'Wyślij oczekujące zapytanie rezerwacyjne na:'
                    : language === 'cs'
                    ? 'Odeslat předběžnou žádost o rezervaci pro:'
                    : 'Submit a pending booking request for:'}{' '}
                  <span className="text-amber-300 font-semibold">{itinerary.title}</span>
                </p>
              </div>

              {exportBookingSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 text-3xl"
                  >
                    𓋹
                  </motion.div>
                  <h4 className="font-serif text-lg font-bold text-emerald-400 uppercase tracking-wider">
                    {language === 'de' ? 'Erfolgreich eingetragen!' : language === 'pl' ? 'Pomyślnie zapisano!' : language === 'cs' ? 'Úspěšně zapsáno!' : 'Inscribed Successfully!'}
                  </h4>
                  <p className="text-stone-300 text-xs max-w-sm mx-auto leading-relaxed">
                    {language === 'de' 
                      ? 'Ihre maßgeschneiderte Reiseanfrage ist nun im heiligen Buchungsregister besiegelt. Die Hohenpriester prüfen Ihre Anfrage.'
                      : language === 'pl'
                      ? 'Twoje spersonalizowane zapytanie o podróż zostało zapieczętowane w świętej księdze rezerwacji. Arcykapłani sprawdzają Twoją prośbę.'
                      : language === 'cs'
                      ? 'Vaše spersonalizovaná žádost o cestu je nyní zpečetěna v posvátné knize rezervací. Arcykněží vaši žádost kontrolují.'
                      : 'Your custom voyage request is now sealed inside the sacred Booking Ledger. The high priests are reviewing your petition.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleExportBookingSubmit} className="space-y-4 text-left">
                  {exportBookingError && (
                    <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-red-400 text-[11px] leading-relaxed font-mono">
                      ⚠️ {exportBookingError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                      {language === 'de' ? 'Name des Entdeckers' : language === 'pl' ? 'Imię odkrywcy' : language === 'cs' ? 'Jméno objevitele' : 'Explorer Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'de' ? 'z. B. Edler Schreiber Sophia' : language === 'pl' ? 'np. Szlachetny Pisarz Zofia' : language === 'cs' ? 'např. Ušlechtilý písař Sofie' : 'e.g. Noble Scribe Sophia'}
                      value={bookingTravelerName}
                      onChange={(e) => setBookingTravelerName(e.target.value)}
                      className="w-full bg-[#110d0a] border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                      {language === 'de' ? 'E-Mail des Entdeckers' : language === 'pl' ? 'E-mail odkrywcy' : language === 'cs' ? 'E-mail objevitele' : 'Explorer Email'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sophia@traveler.com"
                      value={bookingTravelerEmail}
                      onChange={(e) => setBookingTravelerEmail(e.target.value)}
                      className="w-full bg-[#110d0a] border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                        {language === 'de' ? 'Abreisedatum' : language === 'pl' ? 'Data wyjazdu' : language === 'cs' ? 'Datum odjezdu' : 'Departure Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingTravelDate}
                        onChange={(e) => setBookingTravelDate(e.target.value)}
                        className="w-full bg-[#110d0a] border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                        {language === 'de' ? 'Anzahl der Gäste' : language === 'pl' ? 'Liczba gości' : language === 'cs' ? 'Počet hostů' : 'Number of Guests'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={bookingGuestsCount}
                        onChange={(e) => setBookingGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#110d0a] border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                      {language === 'de' ? 'Besondere Wünsche & Eigene Inschrift' : language === 'pl' ? 'Specjalne życzenia i własny wpis' : language === 'cs' ? 'Zvláštní přání a vlastní nápis' : 'Special Requests & Custom Inscription'}
                    </label>
                    <textarea
                      rows={3}
                      value={bookingSpecialRequests}
                      onChange={(e) => setBookingSpecialRequests(e.target.value)}
                      className="w-full bg-[#110d0a] border border-[#d4af37]/25 rounded-xl p-3 text-stone-300 text-xs focus:outline-none focus:border-[#d4af37] transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Pricing dynamic calculation */}
                  <div className="bg-[#241c14] border border-[#d4af37]/20 rounded-xl p-3.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                        {language === 'de' ? 'Geschätzte Opfergabe' : language === 'pl' ? 'Szacowany koszt oferty' : language === 'cs' ? 'Odhadovaná obětina' : 'Estimated Offering Cost'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        ({duration} {language === 'de' ? 'Tage' : language === 'pl' ? 'Dni' : language === 'cs' ? 'Dní' : 'Days'} • {bookingGuestsCount} {language === 'de' ? 'Gäste' : language === 'pl' ? 'Goście' : language === 'cs' ? 'Hosté' : 'Guests'})
                      </span>
                    </div>
                    <span className="font-mono text-xl font-bold text-[#d4af37]">
                      ${computedCost}
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowExportBookingModal(false)}
                      className="flex-1 border border-stone-800 hover:bg-stone-900 text-stone-400 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      {language === 'de' ? 'Abbrechen' : language === 'pl' ? 'Anuluj' : language === 'cs' ? 'Zrušit' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isExportingBooking}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e6c280] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isExportingBooking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#140f0a]" />
                          <span>{language === 'de' ? 'Besiegeln...' : language === 'pl' ? 'Pieczętowanie...' : 'Sealing...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#140f0a]" />
                          <span>{language === 'de' ? 'Anfrage bestätigen' : language === 'pl' ? 'Potwierdź zapytanie' : 'Confirm Request'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden high-fidelity printing template */}
      <div id="papyrus-print-area" className="hidden">
        {(activeTab as any) === 'packing' ? (
          <div>
            <div className="text-center border-b-4 border-double border-[#8b6508] pb-6 mb-8">
              <span className="text-xs font-mono uppercase tracking-[0.4em] text-[#8b6508] font-bold block mb-2">
                {language === 'de' 
                  ? '𓋹 Pharaonische Ausrüstungsdepesche von Sennedjem 𓋹' 
                  : language === 'pl'
                  ? '𓋹 Faraoński Spis Rzeczy Sennedjema, Królewskiego Pisarza 𓋹' 
                  : language === 'cs'
                  ? '𓋹 Faraonský seznam věcí písaře Sennedjema 𓋹'
                  : '𓋹 Pharaonic Packing Dispatch of Scribe Sennedjem 𓋹'}
              </span>
              <h1 className="font-serif text-4xl font-black text-[#5c4001] tracking-wide uppercase">
                {language === 'de' ? 'Ihre königliche Packliste' : language === 'pl' ? 'Twój niezbędnik pakowania' : 'Your Royal Packing Checklist'}
              </h1>
              <p className="text-xs text-stone-500 italic mt-2 font-serif">
                {language === 'de' ? 'Sorgfältig zusammengestellt am' : language === 'pl' ? 'Sporządzono starannie dnia' : language === 'cs' ? 'Pečlivě sestaveno dne' : 'Compiled with care on,'} {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
              </p>
            </div>

            <div className="bg-[#f0e4c6]/60 border-l-4 border-[#8b6508] p-5 rounded-r-lg mb-8 italic text-stone-800 text-sm leading-relaxed">
              {language === 'de'
                ? '"Möge Ra eure Schritte auf dem heißen Wüstensand erwärmen und Sobek eure Gewässer besänftigen. Jedes Ausrüstungsteil in dieser Liste dient eurem Schutz auf den heiligen Pfaden der Götter."'
                : language === 'pl'
                ? '"Niech Ra ogrzewa wasze kroki na gorącym piasku, a Sobek ukoi wasze wody. Każdy element tego spisu służy waszemu bezpieczeństwu na świętych ścieżkach bogów."'
                : '"May Ra warm your footsteps upon the scorching sands, and may Sobek soothe your waters. Every instrument in this inventory serves your protection along the sacred pathways of the gods."'}
            </div>

            <div className="space-y-8">
              {generatedChecklist.map(cat => {
                const catTitle = cat.title[language as 'en' | 'de' | 'pl' | 'cs'] || cat.title.en;
                return (
                  <div key={cat.id} className="print-avoid-break border-b border-[#8b6508]/20 pb-6 last:border-0">
                    <h3 className="font-serif text-xl font-bold text-[#5c4001] uppercase flex items-center gap-2 mb-4">
                      <span className="text-[#8b6508]">{cat.icon}</span> {catTitle}
                    </h3>
                    
                    <div className="space-y-3.5 pl-2">
                      {cat.items.map(item => {
                        const isChecked = !!checkedItems[item.id];
                        const name = item.name[language as 'en' | 'de' | 'pl' | 'cs'] || item.name.en;
                        const desc = item.desc[language as 'en' | 'de' | 'pl' | 'cs'] || item.desc.en;
                        return (
                          <div key={item.id} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded border-2 border-[#8b6508] flex items-center justify-center text-xs text-[#5c4001] font-bold font-mono mt-0.5 flex-shrink-0">
                              {isChecked ? '✓' : ' '}
                            </div>
                            <div>
                              <span className={`text-sm font-serif font-bold ${isChecked ? 'line-through text-stone-500' : 'text-[#5c4001]'}`}>
                                {name}
                              </span>
                              <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                                {desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t-4 border-double border-[#8b6508] text-center">
              <p className="text-base font-serif italic text-stone-800 leading-relaxed max-w-xl mx-auto">
                {language === 'de'
                  ? 'Geht unbesorgt, edler Entdecker. Die Götter Ägyptens wachen über eure Pfade.'
                  : language === 'pl'
                  ? 'Idźcie bez lęku, szlachetni odkrywcy. Bogowie Egiptu czuwają nad waszymi ścieżkami.'
                  : 'Go without fear, noble explorers. The gods of Egypt watch over your pathways.'}
              </p>
              <div className="mt-6 text-[#8b6508] text-4xl select-none tracking-widest">
                𓋹 𓎬 𓅃 𓊟 𓂀
              </div>
            </div>
          </div>
        ) : itinerary ? (
          <div>
            <div className="text-center border-b-4 border-double border-[#8b6508] pb-6 mb-8">
              <span className="text-xs font-mono uppercase tracking-[0.4em] text-[#8b6508] font-bold block mb-2">
                {language === 'de' 
                  ? '𓋹 Heilige Reisedepesche von Sennedjem, königlicher Schreiber 𓋹' 
                  : language === 'pl'
                  ? '𓋹 Święta Karta Podróży Sennedjema, Królewskiego Pisarza 𓋹' 
                  : language === 'cs'
                  ? '𓋹 Posvátná cestovní listina písaře Sennedjema, královského písaře 𓋹'
                  : '𓋹 Sacred Travel Charter of Sennedjem, Royal Scribe 𓋹'}
              </span>
              <h1 className="font-serif text-4xl font-black text-[#5c4001] tracking-wide uppercase">
                {itinerary.title}
              </h1>
              <p className="text-xs text-stone-500 italic mt-2 font-serif">
                {language === 'de' ? 'Eingetragen im Nil-Kalender,' : language === 'pl' ? 'Zapisano w kalendarzu nilowym,' : language === 'cs' ? 'Zapsáno v nilském kalendáři,' : 'Inscribed on the Nile Calendar,'} {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
              </p>
            </div>

            <div className="bg-[#f0e4c6]/60 border-l-4 border-[#8b6508] p-5 rounded-r-lg mb-8 italic text-stone-800 text-sm leading-relaxed">
              "{itinerary.royalGreeting}"
            </div>

            <div className="space-y-8">
              {itinerary.days.map((day) => (
                <div key={day.dayNumber} className="print-avoid-break border-b border-[#8b6508]/20 pb-6 last:border-0">
                  <h3 className="font-serif text-xl font-bold text-[#5c4001] uppercase flex items-center gap-2 mb-3">
                    <span className="text-[#8b6508]">{language === 'de' ? 'Tag' : language === 'pl' ? 'Dzień' : language === 'cs' ? 'Den' : 'Day'} {day.dayNumber}:</span> {day.theme}
                  </h3>
                  
                  <ul className="space-y-2 text-stone-800 text-sm pl-4 list-disc mb-4">
                    {day.activities.map((act, i) => (
                      <li key={i} className="leading-relaxed pl-1">{act}</li>
                    ))}
                  </ul>

                  <div className="bg-[#f2e7c9] border border-[#8b6508]/20 rounded-lg p-4 text-xs text-stone-700 italic">
                    <span className="font-serif font-bold text-[#8b6508] block not-italic mb-1 uppercase tracking-wider">
                      {language === 'de' ? '𓋹 Alte Weisheit des Schreibers:' : language === 'pl' ? '𓋹 Starożytna mądrość pisarza:' : language === 'cs' ? '𓋹 Starožitná mądrość písaře:' : "𓋹 Scribe's Ancient Wisdom:"}
                    </span>
                    {day.scribeWisdom}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t-4 border-double border-[#8b6508] text-center">
              <p className="text-base font-serif italic text-stone-800 leading-relaxed max-w-xl mx-auto">
                "{itinerary.blessing}"
              </p>
              <div className="mt-6 text-[#8b6508] text-4xl select-none tracking-widest">
                𓋹 𓎬 𓅃 𓊟 𓂀
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Generate fallback itinerary in case Gemini key isn't provided
function generateFallbackItinerary(days: number, focus: string, pace: string, language?: string): CustomItinerary {
  const lowercaseFocus = focus.toLowerCase();
  
  let daysArray: any[] = [];
  
  const isDe = language === 'de';
  const isPl = language === 'pl';
  const isCs = language === 'cs';
  const isAr = language === 'ar';

  if (lowercaseFocus.includes("diving") || lowercaseFocus.includes("corals") || lowercaseFocus.includes("tauch") || lowercaseFocus.includes("nurkow") || lowercaseFocus.includes("potápě")) {
    daysArray = [
      {
        dayNumber: 1,
        theme: isDe ? "Salbung von Nun (Ankunft am Roten Meer)" : isPl ? "Namaszczenie Nun (Przybycie nad Morze Czerwone)" : isCs ? "Pomazání Nun (Příjezd k Rudému moři)" : "Anointing of Nun (Red Sea Arrival)",
        activities: isDe ? [
          "Begrüßen Sie die kristallklaren Ufer von Hurghada und beziehen Sie Ihre königliche Unterkunft am Strand",
          "Eine Schnorchelsafari am Nachmittag an den Riffen der Giftun-Insel unter dem warmen Auge von Ra",
          "Entspannen Sie sich auf einem traditionellen hölzernen Felucca-Segelboot bei Sonnenuntergang und lauschen Sie alten nubischen Flöten"
        ] : isPl ? [
          "Powitaj krystaliczne brzegi Hurghady, meldując się w swojej nadmorskiej królewskiej kwaterze",
          "Popołudniowe safari snurkowym na rafach wyspy Giftun pod ciepłym okiem Ra",
          "Zrelaksuj się na tradycyjnej drewnianej łodzi żaglowej Felucca o zachodzie słońca, słuchając starożytnych nubijskich fletów"
        ] : isCs ? [
          "Přivítejte křišťálové břehy Hurghady a ubytujte se ve svém královském ubytování na pláži",
          "Odpolední šnorchlovací safari u útesů ostrova Giftun pod hřejivým dohledem boha Ra",
          "Odpočiňte si na tradiční dřevěné plachetnici Felucca při západu slunce za doprovodu starověkých nubijských fléten"
        ] : [
          "Greet the crystalline shores of Hurghada, checking into your beachside royal lodging",
          "An afternoon snorkeling safari at Giftun Island reefs under the warm eye of Ra",
          "Unwind on a traditional sunset wooden Felucca sailboat listening to ancient Nubian flutes"
        ],
        scribeWisdom: isDe 
          ? "In der Kemet-Mythologie werden die Urgewässer 'Nun' genannt. Respektieren Sie die Strömungen des Meeres; sie sind die uralten Strömungen der Schöpfung selbst. Denken Sie daran, korallenfreundlichen Sonnenschutz aufzutragen."
          : isPl
          ? "W mitologii Kemet wody pierwotne nazywane są 'Nun'. Szanuj prądy morskie; są to starożytne prądy samego stworzenia. Pamiętaj o nałożeniu filtra bezpiecznego dla rafy koralowej."
          : isCs
          ? "V egyptské mytologii se prvotní vody nazývají 'Nun'. Respektujte mořské proudy; jsou to starověké proudy samotného stvoření. Nezapomeňte použít opalovací krém šetrný ke korálům."
          : "In Kemet myth, the primordial waters are called 'Nun'. Respect the sea's currents; they are the ancient currents of creation itself. Remember to apply coral-safe sun protection."
      },
      {
        dayNumber: 2,
        theme: isDe ? "Der Abgrund von Ras Mohammed" : isPl ? "Otchłań Ras Mohammed" : isCs ? "Propast Ras Mohammed" : "The Abyss of Ras Mohammed",
        activities: isDe ? [
          "Morgendlicher Transfer mit dem Schnellboot zum Meeresschutzgebiet Ras Mohammed",
          "Erster tiefer Tauchgang am 'Yolanda Reef' mit Blick auf riesige Korallen, Hammerhaie und alte versunkene Amphoren",
          "Gourmet-Mittagessen, frisch an Bord zubereitet von lokalen Seefahrer-Beduinen"
        ] : isPl ? [
          "Poranny transfer szybką łodzią do Rezerwatu Morskiego Ras Mohammed",
          "Pierwsze głębokie nurkowanie na 'Yolanda Reef' podziwiając gigantyczne koralowce, młoty i starożytne zatopione amfory",
          "Wykwintny lunch przygotowany świeżo na pokładzie przez lokalnych beduińskich żeglarzy"
        ] : isCs ? [
          "Ranní transfer rychlým člunem do mořské rezervace Ras Mohammed",
          "První hloubkový ponor na útesu 'Yolanda Reef' s pozorováním obřích korálů, kladivounů a starověkých potopených amfor",
          "Gurmánský oběd čerstvě připravený na palubě místními beduínskými námořníky"
        ] : [
          "Morning high-speed boat transfer to the Ras Mohammed Marine Sanctuary",
          "First deep scuba dive at 'Yolanda Reef' gazing at giant corals, hammerheads, and ancient submerged amphorae",
          "Gourmet lunch cooked fresh on board by local seafaring Bedouins"
        ],
        scribeWisdom: isDe
          ? "Betrachten Sie die Korallen, die der Lotusblume von Nefertem ähneln. Die Tiefsee birgt Schätze des Friedens; halten Sie Ihren Atem ruhig wie das Schilf im Wind."
          : isPl
          ? "Spójrz na koralowce, które przypominają kwiat lotosu Nefertema. Głębokie morze kryje skarby spokoju; zachowaj spokojny oddech, jak trzcina na wietrze."
          : isCs
          ? "Pohleďte na korály, které připomínají lotosový květ boha Nefertema. Hluboké moře skrývá poklady klidu; udržujte svůj dech stabilní jako rákos ve větru."
          : "Gaze upon the corals, which resemble the lotus flower of Nefertem. The deep sea holds treasures of peace; keep your breathing steady like the reed in the wind."
      },
      {
        dayNumber: 3,
        theme: isDe ? "Tempel der versunkenen Pharaonen" : isPl ? "Świątynia Zatopionych Faraonów" : isCs ? "Chrám potopených faraonů" : "Temple of the Submerged Pharaohs",
        activities: isDe ? [
          "Spezialisierte Tauch-/Schnorchelerkundung des 'Hauses der Steinstatuen' auf der Suche nach versunkenen pharaonischen Monumenten",
          "Abendliche Sternenbeobachtung an der Küste mit einem Ägyptologen, der erklärt, wie antike Astronomen den Himmel von Nut kartierten",
          "Ein üppiges Meeresfrüchte-Festmahl, verfeinert mit ägyptischem Kreuzkümmel und lokaler Limette"
        ] : isPl ? [
          "Specjalistyczna wycieczka nurkowa/snurkowa do Domu Kamiennych Posągów w poszukiwaniu zatopionych faraońskich zabytków",
          "Wieczorna sesja obserwacji gwiazd nad wybrzeżem z egiptologiem wyjaśniającym, jak starożytni astronomowie mapowali niebo Nut",
          "Wspaniała uczta z owoców morza przyprawiona egipskim kminem rzymskim i lokalną limonką"
        ] : isCs ? [
          "Specializovaný ponor/šnorchlování v Domě kamenných soch s hledáním potopených faraonských památek",
          "Večerní pozorování hvězd na pobřeží s egyptologem, který vám přiblíží, jak starověcí astronomové mapovali nebe bohyně Nut",
          "Bohatá hostina z mořských plodů ochucená egyptským kmínem a místní limetkou"
        ] : [
          "A specialized dive/snorkel exploration of the House of Stone Statues, searching for the submerged Pharaonic monuments",
          "Evening stargazing session by the coast with an Egyptologist detailing how ancient astronomers mapped the sky of Nut",
          "A lavish seafood feast flavored with Egyptian cumin and local lime"
        ],
        scribeWisdom: isDe
          ? "Antike Seefahrer navigierten auf dem Roten Meer nach Punt (Somalia), um seltenen Weihrauch für Hatschepsut zu holen. Die Sterne, die Sie heute Nacht sehen, führten ihre Zedernholzschiffe sicher zurück."
          : isPl
          ? "Starożytni żeglarze pływali po Morzu Czerwonym do Punt (Somalia), aby sprowadzić rzadkie kadzidło dla Hatszepsut. Gwiazdy, które widzisz dzisiaj, bezpiecznie poprowadziły ich cedrowe statki z powrotem."
          : isCs
          ? "Starověcí mořeplavci se plavili po Rudém moři do země Punt (Somálsko), aby přivezli vzácné kadidlo pro královnu Hatšepsut. Hvězdy, které dnes vidíte, bezpečně vedly jejich cedrové lodě zpět."
          : "Ancient sailors navigated the Red Sea to Punt (Somalia) to retrieve rare frankincense for Hatshepsut. The stars you see tonight guided their cedar ships safely back."
      }
    ];
  } else if (lowercaseFocus.includes("safari") || lowercaseFocus.includes("desert") || lowercaseFocus.includes("wüste") || lowercaseFocus.includes("pustyn") || lowercaseFocus.includes("poušť")) {
    daysArray = [
      {
        dayNumber: 1,
        theme: isDe ? "Die Roten Dünen von Hurghada" : isPl ? "Czerwone Wydmy Hurghady" : isCs ? "Červené duny Hurghady" : "The Red Dunes of Hurghada",
        activities: isDe ? [
          "Nachmittags Abholung im klimatisierten 4x4 Offroader zur Durchquerung der Wüstenebenen",
          "Rasen mit dem Quad über goldene Sandwellen und um hochragende Sinai-Felsnadeln",
          "Ankunft in einem traditionellen, abgelegenen Beduinenlager, Begrüßung mit frischem Hibiskustee (Karkadeh)"
        ] : isPl ? [
          "Popołudniowy odbiór klimatyzowanym samochodem terenowym 4x4 w celu przemierzenia pustynnych równin",
          "Szybka jazda na quadach po złotych wydmach i wokół strzelistych iglic skalnych Synaju",
          "Przyjazd do tradycyjnego, ustronnego obozu beduińskiego, powitanie świeżą herbatą z hibiskusa (Karkadeh)"
        ] : isCs ? [
          "Odpolední vyzvednutí klimatizovaným terénním vozem 4x4 a cesta přes pouštní pláně",
          "Rychlá jízda na čtyřkolkách po zlatých písečných dunách a kolem tyčících se skalních jehel na Sinaji",
          "Příjezd do tradičního odlehlého beduínského tábora, uvítání čerstvým ibiškovým čajem (Karkadeh)"
        ] : [
          "Afternoon pickup in an air-conditioned 4x4 off-road vehicle to cross the desert plains",
          "High-speed quad biking across golden sand ripples and around towering Sinai rock needles",
          "Arrival at a traditional secluded Bedouin camp, welcoming you with fresh hibiscus tea (Karkadeh)"
        ],
        scribeWisdom: isDe
          ? "Die Wüste ist 'Deshret', das rote Land, regiert von Set, dem Gott der Stürme und der Wildnis. Wandeln Sie mit Ehrfurcht; der Sand hat ein Gedächtnis. Tragen Sie lockeres Leinen, um Ihre Haut vor dem Feuer der Sonne zu schützen."
          : isPl
          ? "Pustynia to 'Deshret', czerwona ziemia rządzona przez Seta, boga burz i dziczy. Stąpaj z honorem; piaski mają pamięć. Noś luźne lniane ubrania, aby chronić skórę przed żarem słońca."
          : isCs
          ? "Poušť je 'Dešret', červená země, které vládne Sutech (Set), bůh bouří a divočiny. Kráčejte s úctou; písek má paměť. Oblečte si volný len, abyste chránili svou pokožku před žárem slunce."
          : "The desert is 'Deshret', the red land, ruled by Set, the god of storms and wilderness. Tread with honor; the sands have memory. Dress in loose linens to shield your skin from the sun's fire."
      },
      {
        dayNumber: 2,
        theme: isDe ? "Die Karawane von Nut" : isPl ? "Karawana Nut" : isCs ? "Karavana bohyně Nut" : "The Caravan of Nut",
        activities: isDe ? [
          "Sonnenaufgangs-Kamelexpedition in die stillen, tiefen Täler im ruhigen Tempo der antiken Karawanen",
          "Lernen Sie die beduinische Kunst, traditionelles ungesäuertes Fladenbrot über offener Akazienkohle zu backen",
          "Eine aufregende Wüstenfahrt mit dem Dünenbuggy, während die Sonne hinter dem Horizont versinkt"
        ] : isPl ? [
          "Wyprawa na wielbłądach o wschodzie słońca w ciche, głębokie doliny, dopasowana do spokojnego tempa starożytnych karawan",
          "Poznaj beduińską sztukę wypieku tradycyjnego przaśnego chleba na otwartych węglach akacjowych",
          "Ekscytująca wycieczka buggy po pustyni, gdy słońce zaczyna chować się za horyzontem"
        ] : isCs ? [
          "Expedice na velbloudech při východu slunce do tichých hlubokých údolí v klidném tempu starověkých karavan",
          "Naučte se beduínskému umění pečení tradičního nekvašeného chleba na rozžhaveném akáciovém uhlí",
          "Vzrušující jízda v pouštní bugině v době, kdy slunce začíná zapadat za obzor"
        ] : [
          "Sunrise camel expedition into the quiet deep valleys, matching the calm tempo of the ancient caravans",
          "Learn the Bedouin art of baking traditional unleavened flatbread over open acacia coals",
          "A thrilling dune-buggy desert racing tour as the sun begins to dip below the horizon"
        ],
        scribeWisdom: isDe
          ? "Kamelkarawanen transportieren seit den Zeiten von Ramses Gold, Gewürze und Kupfer. Lassen Sie den langsam schaukelnden Rhythmus des Kamels Ihren Geist auf das Tempo der Dünen einstimmen."
          : isPl
          ? "Karawany wielbłądów przewoziły złoto, przyprawy i miedź od czasów Ramzesu. Pozwól, aby powolny, kołyszący rytm wielbłąda zsynchronizował Twojego ducha z tempem wydm."
          : isCs
          ? "Karavany velbloudů přepravovaly zlato, koření a měď již od dob Ramesse II. Nechte pomalý houpavý rytmus velblouda sladit vaši mysl s tempem dun."
          : "Camel caravans have carried gold, spices, and copper since the times of Ramses. Let the slow rocking rhythm of the camel align your spirit with the pacing of the dunes."
      },
      {
        dayNumber: 3,
        theme: isDe ? "Das Mitternachtsorakel & die Sterne" : isPl ? "Północna Wyrocznia i Gwiazdy" : isCs ? "Půlnoční věštírna a hvězdy" : "The Midnight Oracle & Stars",
        activities: isDe ? [
          "Traditionelles Beduinenfestmahl mit langsam gegartem Lammfleisch, ägyptischem Fladenbrot und Sesam-Tahini",
          "Live-Unterhaltung am Lagerfeuer mit ägyptischen Rababa-Instrumenten und dem mystischen Tannoura-Wirbeltanz",
          "Beobachtung des Nachthimmels mit einem leistungsstarken Teleskop unter der kristallklaren, pechschwarzen Wüstenkuppel"
        ] : isPl ? [
          "Tradycyjna beduińska uczta z wolno pieczoną jagnięciną, egipskim chlebem i sezamową tahini",
          "Rozrywka na żywo przy ognisku z egipskimi instrumentami Rababa i mistycznym tańcem obrotowym Tannoura",
          "Obserwacja nieba przez potężny teleskop pod krystalicznie czystą, ciemną kopułą pustyni"
        ] : isCs ? [
          "Tradiční beduínská hostina s pomalu pečeným jehněčím masem, egyptským chlebem a sezamovou tahini",
          "Zábava u táborového ohně s tradičními egyptskými nástroji Rababa a mystickým točivým tancem Tannoura",
          "Pozorování noční oblohy výkonným dalekohledem pod křišťálově čistou a dokonale temnou pouštní klenbou"
        ] : [
          "Traditional Bedouin feast with slow-roasted lamb, Egyptian flatbread, and sesame tahini",
          "Live fireside entertainment featuring Egyptian Rababa instruments and the mystical Tannoura spiral dance",
          "Powerful telescope stargazing session under the crystal clear pitch-black desert dome"
        ],
        scribeWisdom: isDe
          ? "Die Göttin Nut beugt sich über die Erde, ihr Körper ist mit Sternen übersät. Suchen Sie nach dem Sternbild Sah (Orion), das die mächtige Seele von Osiris darstellt, die sich in der Nacht erhebt."
          : isPl
          ? "Bogini Nut pochyla się nad ziemią, a jej ciało usiane jest gwiazdami. Poszukaj gwiazdozaworu Sah (Orion), który reprezentował potężną duszę Ozyrysa wschodzącą w nocy."
          : isCs
          ? "Bohyně Nut se klene nad zemí a její tělo je poseto hvězdami. Hledejte souhvězdí Sah (Orion), které představovalo mocnou duši boha Usira (Osirida) stoupající k nočnímu nebi."
          : "The goddess Nut bends over the earth, her body studded with stars. Look for the constellation Sah (Orion), which represented the mighty soul of Osiris rising in the night."
      }
    ];
  } else if (lowercaseFocus.includes("history") || lowercaseFocus.includes("temple") || lowercaseFocus.includes("luxor") || lowercaseFocus.includes("geschicht") || lowercaseFocus.includes("histor") || lowercaseFocus.includes("chram") || lowercaseFocus.includes("pamat")) {
    daysArray = [
      {
        dayNumber: 1,
        theme: isDe ? "Wallfahrt nach Waset (Luxor-Reise)" : isPl ? "Pielgrzymka do Waset (Podróż do Luksoru)" : isCs ? "Pouť do Vesetu (Cesta do Luxoru)" : "Pilgrimage to Waset (Luxor Journey)",
        activities: isDe ? [
          "Malerische Fahrt bei Sonnenaufgang von der Küste des Roten Meeres durch die hohen Berge ins Nil-Tal",
          "Ankunft in Waset (Luxor), der glorreichen Hauptstadt des Neuen Reiches von Ägypten",
          "Spaziergang auf der großen Allee der Sphinxe, die den Luxor-Tempel mit der riesigen Tempelanlage von Karnak verbindet"
        ] : isPl ? [
          "Malownicza podróż o wschodzie słońca z wybrzeża Morza Czerwonego przez wysokie góry do Doliny Nilu",
          "Przyjazd do Waset (Luksor), wspaniałej stolicy Nowego Państwa Egipskiego",
          "Spacer wzdłuż wspaniałej Alei Sfinksów łączącej Świątynię Luksoru z ogromnym kompleksem świątynnym w Karnaku"
        ] : isCs ? [
          "Malebná cesta při východu slunce od pobřeží Rudého moře přes vysoké hory do údolí Nilu",
          "Příjezd do Vesetu (Luxoru), slavného hlavního města Nové říše Egypta",
          "Procházka po velkolepé Aleji sfing, která spojuje chrám v Luxoru s obrovským komplexem v Karnaku"
        ] : [
          "Scenic sunrise journey from the Red Sea coast through the high mountains to the Nile Valley",
          "Arrival in Waset (Luxor), the glorious capital of the New Kingdom of Egypt",
          "Walk the grand Avenue of Sphinxes, connecting Luxor Temple and the immense Karnak Temple complex"
        ],
        scribeWisdom: isDe
          ? "Karnak ist der größte jemals von Menschenhand errichtete Tempelkomplex, erbaut über 2.000 Jahre. Berühren Sie die riesigen Sandsteinsäulen, um sich mit dem genialen architektonischen Geist von Imhotep zu verbinden."
          : isPl
          ? "Karnak to największy kompleks świątynny, jaki kiedykolwiek wzniesiono ludzkimi rękami, budowany przez ponad 2000 lat. Dotknij gigantycznych piaskowcowych filarów, aby połączyć się z boskim architektonicznym geniuszem Imhotepa."
          : isCs
          ? "Karnak je největší chrámový komplex, jaký byl kdy lidskou rukou postaven, budovaný po více než 2 000 let. Dotkněte se obřích pískovcových sloupů a spojte se s božským architektonickým géniem Imhotepem."
          : "Karnak is the largest temple complex ever constructed by human hands, built over 2,000 years. Touch the giant sandstone pillars to connect with the divine architectural genius of Imhotep."
      },
      {
        dayNumber: 2,
        theme: isDe ? "Das Tal der Schatten" : isPl ? "Dolina Cieni" : isCs ? "Údolí stínů" : "The Valley of the Shadows",
        activities: isDe ? [
          "Überquerung des heiligen Nils im Morgengrauen zum Westufer, dem Reich der Toten",
          "Hinabsteigen in die farbenfroh bemälten Gräber im Tal der Könige, darunter Tutanchamun und Ramses IV.",
          "Ehrfürchtiges Staunen vor den Memnonkolossen, zwei riesigen Steinstatuen, die im Wüstenwind flüstern"
        ] : isPl ? [
          "Przeprawa przez święty Nil o świcie na Zachodni Brzeg, domenę umarłych",
          "Zejście do tętniących życiem, malowanych podziemnych grobowców w Dolinie Królów, w tym Tutenchamona i Ramzesa IV",
          "Podziwiaj Kolosy Memnona, dwa masywne kamienne posągi szepczące na pustynnym wietrze"
        ] : isCs ? [
          "Přechod posvátného Nilu za úsvitu na západní břeh, do říše mrtvých",
          "Sestup do pestrobarevně zdobených podzemních hrobek v Údolí králů, včetně hrobky Tutanchamona a Ramesse IV.",
          "Zastavení v němém úžasu před Memnonovými kolosy, dvěma obřími kamennými sochami šeptajícími v pouštním větru"
        ] : [
          "Cross the sacred Nile River at dawn to the West Bank, the domain of the dead",
          "Descend into the vibrantly painted underground tombs of the Valley of the Kings, including Tutankhamun and Ramses IV",
          "Stand in awe before the Colossi of Memnon, two massive stone statues whispering in the desert wind"
        ],
        scribeWisdom: isDe
          ? "Am Westufer geht Ra unter und betritt die Unterwelt (Duat). Die Grabwände sind mit dem Buch der Pforten verziert, um die Pharaonen durch die Prüfungen des Jenseits zu führen. Schweigen Sie im Inneren, um die Toten zu ehren."
          : isPl
          ? "Na Zachodnim Brzegu Ra zachodzi, wkraczając do Zaświatów (Duat). Ściany grobowców są ozdobione Księgą Bram, aby prowadzić faraonów przez próby życia pośmiertnego. Zachowaj ciszę w środku, aby uczcić zmarłych."
          : isCs
          ? "Na západním břehu slunce (Ra) zapadá a vstupuje do podsvětí (Duat). Stěny hrobek jsou zdobeny Knihou bran, která provází faraony zkouškami posmrtného života. Uvnitř zachovávejte ticho k uctění zesnulých."
          : "The West Bank is where Ra sets, entering the Underworld (Duat). The tomb walls are decorated with the Book of Gates to guide the Pharaohs through tests of the afterlife. Keep silent inside to honor the dead."
      },
      {
        dayNumber: 3,
        theme: isDe ? "Der Tempel der Sonnenkönigin" : isPl ? "Świątynia Królowej Słońca" : isCs ? "Chrám sluneční královny" : "The Temple of the Sun Queen",
        activities: isDe ? [
          "Erkundung des terrassierten Totentempels der Königin Hatschepsut, der direkt in die steilen Klippen von Deir el-Bahari gehauen wurde",
          "Traditionelle Felucca-Bootsfahrt auf dem Nil zurück zum Ostufer, mit lokalen Datteln und Honigkuchen",
          "Rückreise zur Küste des Roten Meeres unter einem Baldachin aus Wüstensternen"
        ] : isPl ? [
          "Eksploracja tarasowej świątyni grobowej królowej Hatszepsut, wykutej bezpośrednio w stromych klifach Deir el-Bahari",
          "Tradycyjny rejs łodzią Felucca po Nilu z powrotem na Wschodni Brzeg, jedzenie lokalnych daktyli i ciastek miodowych",
          "Podróż powrotna na wybrzeże Morza Czerwonego pod baldachimem pustynnych gwiazd"
        ] : isCs ? [
          "Průzkum terasovitého chrámového komplexu královny Hatšepsut, vytesaného přímo do strmých útesů Deir el-Bahrí",
          "Tradiční plavba lodí Felucca po Nilu zpět na východní břeh, ochutnávka místních datlí a medových koláčků",
          "Návrat k pobřeží Rudého moře pod nebeskou klenbou pouštních hvězd"
        ] : [
          "Explore the terraced mortuary temple of Queen Hatshepsut, carved directly into the sheer cliffs of Deir el-Bahari",
          "A traditional Felucca boat ride on the Nile back to the East Bank, dining on local dates and honey cakes",
          "Return trip to the Red Sea coast under a canopy of desert stars"
        ],
        scribeWisdom: isDe
          ? "Hatschepsut war eine der größten Pharaoninnen Ägyptens und regierte als König. Ihr Tempeldesign ist ein Meisterwerk der Symmetrie und passt sich dem Rhythmus der Klippen an. Seien Sie stark und unabhängig auf Ihren Lebenswegen."
          : isPl
          ? "Hatszepsut była jednym z największych faraonów Egiptu, rządzącym jako król. Architektura jej świątyni to arcydzieło symetrii harmonizujące z rytmem klifów. Bądź silny i niezależny w swoich życiowych podróżach."
          : isCs
          ? "Hatšepsut byla jedním z největších egyptských faraonů a vládla jako král. Architektura jejího chrámu je mistrovským dílem symetrie, které dokonale ladí s rytmem útesů. Buďte silní a nezávislí na svých životních cestách."
          : "Hatshepsut was one of Egypt's greatest pharaohs, ruling as a king. Her temple design is a masterpiece of symmetry and matches the rhythm of the cliffs. Be strong and independent in your life journeys."
      }
    ];
  } else {
    // Default balanced
    daysArray = [
      {
        dayNumber: 1,
        theme: isDe ? "Die Goldenen Küsten von Kemet" : isPl ? "Złote Wybrzeża Kemet" : isCs ? "Zlaté břehy Kemetu" : "The Golden Shores of Kemet",
        activities: isDe ? [
          "Herzlicher pharaonischer Empfang am Roten Meer, Beziehen Ihres Küstenrückzugsortes",
          "Nachmittags Schnorcheln im Hausriff mit neonglänzenden Papageienfischen und goldenen Anemonen",
          "Ein stimmungsvolles Abendessen am Meer bei Fackelschein mit traditionellen ägyptischen Mezze-Tellern"
        ] : isPl ? [
          "Ciepłe faraońskie powitanie nad Morzem Czerwonym, zameldowanie w nadmorskim ustroniu",
          "Popołudniowy snurkowanie na domowej rafie, podziwianie neonowoniebieskich papugoryb i złotych ukwiałów",
          "Nastrojowa kolacja nad brzegiem morza przy blasku pochodni, tradycyjne egipskie dania Mezze"
        ] : isCs ? [
          "Vřelé faraonské přivítání u Rudého moře a ubytování ve vašem přímořském útočišti",
          "Odpolední šnorchlování na domácím útesu s pozorováním neonově modrých ploskozubců a zlatých hřebenatek",
          "Atmosférická večeře na pobřeží při svitu pochodní s tradičním egyptským předkrmem Mezze"
        ] : [
          "Warm Pharaonic welcome at the Red Sea, checking into your coastal retreat",
          "Afternoon snorkeling in the house reef, seeing neon-blue parrotfish and golden anemones",
          "An atmospheric seaside dinner under torchlight, enjoying traditional Egyptian Mezze plates"
        ],
        scribeWisdom: isDe
          ? "Willkommen an Kemets großem Meer! Die alten Pharaonen sandten Expeditionen hierher, um ferne Länder zu befahren. Blicken Sie auf das Wasser und spüren Sie die Gelassenheit von Nun."
          : isPl
          ? "Witaj nad wielkim morzem Kemet! Starożytni faraonowie wysyłali stąd ekspedycje do odległych krajów. Spójrz na wodę i poczuj spokój Nun."
          : isCs
          ? "Vítejte u velkého moře Kemetu! Starověcí faraoni odtud vysílali expedice do dalekých zemí. Pohleďte na vodní hladinu a vnímejte klid Nun."
          : "Welcome to Kemet's great sea! The ancient pharaohs sent expeditions here to navigate to distant lands. Gaze out at the water and feel the serenity of Nun."
      },
      {
        dayNumber: 2,
        theme: isDe ? "Sets Wüstensand & beduinische Sterne" : isPl ? "Pustynne Piaski Seta i Beduńskie Gwiazdy" : isCs ? "Sutechův pouštní písek a beduínské hvězdy" : "Set's Desert Sands & Bedouin Stars",
        activities: isDe ? [
          "Spannende Nachmittags-Quad-Tour über die rollenden Wüstensandwellen",
          "Einzug in ein traditionelles Beduinenlager für frischen Minztee und Fotos im Sonnenuntergang",
          "Epische Sternenbeobachtung mit Teleskopen in den dunklen Bergtälern, Lesen der Himmelsgeschichten von Nut"
        ] : isPl ? [
          "Ekscytująca popołudniowa wycieczka na quadach po falujących piaskach pustyni",
          "Odpoczynek w tradycyjnym beduińskim obozie przy świeżej miętowej herbacie i zdjęcia o zachodzie słońca",
          "Niesamowita obserwacja gwiazd przez teleskop w ciemnych dolinach górskich, czytanie opowieści z nieba Nut"
        ] : isCs ? [
          "Vzrušující odpolední jízda na čtyřkolkách po zvlněných pouštních dunách",
          "Posezení v tradičním pouštním beduínském táboře u čerstvého mátového čaje a fotografování při západu slunce",
          "Velkolepé pozorování hvězd dalekohledem v tmavých horských údolích a čtení nebeských příběhů bohyně Nut"
        ] : [
          "Thrilling afternoon quad bike tour across the rolling desert sand waves",
          "Settle into a traditional desert Bedouin encampment for fresh mint tea and sunset photos",
          "Epic telescope stargazing in the black mountain valleys, reading the celestial tales of Nut"
        ],
        scribeWisdom: isDe
          ? "Die Wüstenluft ist rein und trägt den Atem von Shu. In der Stille der Dünen hören Sie den Herzschlag der Erde. Lauschen Sie genau und finden Sie Ihren inneren Frieden."
          : isPl
          ? "Pustynne powietrze jest czyste i niesie oddech Szu. W ciszy wydm usłyszysz bicie serca Ziemi. Słuchaj uważnie i znajdź swój wewnętrzny spokój."
          : isCs
          ? "Pouštní vzduch je čistý a nese dech boha Šu. V tichu dun můžete slyšet tlukot srdce samotné Země. Naslouchejte pozorně a najdete svůj vnitřní klid."
          : isAr
          ? "هواء الصحراء نقي يحمل أنفاس الإله شو. في صمت الكثبان يمكن أن تسمع نبضات قلب الأرض. استمع بتركيز واعتبر روحك."
          : "The desert air is pure, carrying the breath of Shu. In the silence of the dunes, you can hear the heartbeat of the Earth. Listen closely and find your inner peace."
      },
      {
        dayNumber: 3,
        theme: isDe ? "Wallfahrt nach Karnak" : isPl ? "Pielgrzymka do Karnaku" : isCs ? "Pouť do Karnaku" : isAr ? "رحلة الحج إلى الكرنك" : "Pilgrimage to Karnak",
        activities: isDe ? [
          "Ganztägiger Ausflug über die Wüste nach Luxor, der antiken Stadt Waset",
          "Erkunden Sie die Säulenhalle des Karnak-Tempels und wandern Sie zwischen 134 riesigen Sandsteinsäulen",
          "Eine magische Felucca-Fahrt bei Sonnenuntergang auf dem heiligen Nil, mit lokal gewürztem Fleisch und süßen Datteln"
        ] : isPl ? [
          "Całodniowa wycieczka przez pustynię do Luksoru, starożytnego miasta Waset",
          "Eksploruj Salę Kolumnową w Świątyni Karnak, spacerując wśród 134 masywnych filarów z piaskowca",
          "Magiczny rejs łodzią Felucca o zachodzie słońca po świętym Nilu, kolacja z lokalnym przyprawionym mięsem i słodkimi daktylami"
        ] : isCs ? [
          "Celodenní výlet přes poušť do Luxoru, starověkého města Vesetu",
          "Průzkum Velkého sloupového sálu v chrámu v Karnaku a procházka mezi 134 masivními pískovcovými sloupy",
          "Magická plavba lodí Felucca při západu slunce po posvátné řece Nil, s ochutnávkou místního kořeněného masa a sladkých datlí"
        ] : isAr ? [
          "رحلة ليوم كامل عبر الصحراء إلى الأقصر، مدينة طيبة العريقة",
          "استكشاف صالة الأعمدة الكبرى بجمع معابد الكرنك، والتجول بين 134 عموداً ضخماً من الحجر الرملي",
          "رحلة ساحرة بالفلوكة عند غروب الشمس على النيل الخالد وتناول وجبة العشاء المشوية مع التمور الحلوة"
        ] : [
          "Full day excursion crossing the desert to Luxor, the ancient city of Waset",
          "Explore the Hypostyle Hall of Karnak Temple, wandering through 134 massive sandstones pillars",
          "A magical sunset Felucca cruise on the holy Nile River, dining on local spiced meats and sweet dates"
        ],
        scribeWisdom: isDe
          ? "Der Nil ist die Lebensader Ägyptens. Wenn die Sonne am Westufer untergeht, werden Sie Zeuge des Zyklus der Wiedergeburt, der dreitausend Jahre von Königen und Königinnen inspirierte."
          : isPl
          ? "Nil jest źródłem życia Egiptu. Gdy słońce zachodzi nad Zachodnim Brzegiem, jesteś świadkiem cyklu odrodzenia, który inspirował królów i królowe przez trzy tysiące lat."
          : isCs
          ? "Nil je životodárnou tepnou Egypta. Když slunce zapadá nad západním břehem, stáváte se svědky cyklu znovuzrození, který po tři tisíce let inspiroval krále a královny."
          : isAr
          ? "نهر النيل هو شريان الحياة في مصر. عندما تغرب الشمس فوق البر الغربي، تشهد دورة التجدد البعث التي ألهمت الملوك والملكات لآلاف السنين."
          : "The Nile is the lifespring of Egypt. As the sun sets over the West Bank, you witness the cycle of rebirth that inspired three thousand years of kings and queens."
      }
    ];
  }

  // Extend days if requested up to 7
  if (days > 3) {
    for (let d = 4; d <= days; d++) {
      if (d === 4) {
        daysArray.push({
          dayNumber: 4,
          theme: isDe ? "El Gouna Lagunen-Navigation" : isPl ? "Nawigacja po Lagunie El Gouna" : isCs ? "Plavba v lagunách El Gouna" : isAr ? "استكشاف بحيرات الجونة" : "El Gouna Lagoon Navigation",
          activities: isDe ? [
            "Ein entspannter Tag beim Segeln durch die ruhigen türkisfarbenen Lagunen von El Gouna in einem traditionellen Boot",
            "Schnorchelsafari am Riff 'Dolphin House', Schwimmen mit wilden Großen Tümmlern",
            "Cocktailempfang bei Sonnenuntergang auf einer eleganten Hafenterrasse mit Harfenmusik"
          ] : isPl ? [
            "Relaksujący dzień pływania po cichych turkusowych lagunach El Gouny na tradycyjnej łodzi",
            "Snurkowanie w rezerwacie 'Dolphin House', pływanie u boku dzikich delfinów buttonosych",
            "Wieczorne przyjęcie koktajlowe na eleganckim tarasie w marinie z muzyką na harfie na żywo"
          ] : isCs ? [
            "Relaxační den strávený plavbou po klidných tyrkysových lagunách El Gouna na tradiční lodi",
            "Šnorchlovací safari v zátoce 'Dolphin House' a plavání po boku divokých delfínů",
            "Koktejlová recepce při západu slunce na elegantní terase v přístavu za doprovodu živé hudby"
          ] : isAr ? [
            "يوم ممتع وهادئ للإبحار في البحيرات الفيروزية الصافية بالجونة على قارب تقليدي",
            "رحلة سفاري لممارسة السنوركلينج في منطقة بيت الدلافين والسباحة مع الدلافين البرية",
            "حفل كوكتيل عند غروب الشمس على شرفة مرسى الجونة الراقي مع ألحان الهارب"
          ] : [
            "A relaxing day sailing through the quiet turquoise lagoons of El Gouna in a traditional boat",
            "Snorkeling safari at the 'Dolphin House' reef, swimming alongside wild bottle-nose dolphins",
            "Sunset cocktail reception on an elegant marina terrace with live harp music"
          ],
          scribeWisdom: isDe
            ? "Delfine sind weise Kreaturen, Freunde seefahrender Wächter. Behandeln Sie sie mit tiefem Respekt und hetzen Sie sie niemals, damit sie friedlich mitschwimmen."
            : isPl
            ? "Delfiny to mądre stworzenia, przyjaciele morskich strażników. Traktuj je z głębokim szacunkiem, nigdy ich nie pospieszaj, pozwalając im pływać obok w spokoju."
            : isCs
            ? "Delfíni jsou moudrá stvoření, přátelé mořskich strážců. Zacházejte s nimi s hlubokou úctou, nikdy na ně nespěchejte a nechte je plavat po vašem boku v klidu."
            : isAr
            ? "الدلافين كائنات حكيمة وصديقة للبحارة. عاملها باحترام عميق ولا تستعجلها لكي تسبح بجانبك بسلام."
            : "Dolphins are wise creatures, friends of seafaring guardians. Treat them with deep respect, never rushing them, allowing them to swim alongside in peace."
        });
      } else if (d === 5) {
        daysArray.push({
          dayNumber: 5,
          theme: isDe ? "Die Klöster der Wüstenväter" : isPl ? "Klasztory Ojców Pustyni" : isCs ? "Kláštery pouštních otců" : isAr ? "أديرة آباء الصحراء" : "The Monasteries of the Desert Fathers",
          activities: isDe ? [
            "Morgendliche Reise in die rauen Hügel des Roten Meeres, um das St.-Antonius-Kloster zu besuchen, das älteste aktive Kloster der Welt",
            "Wanderung zur Berghöhle des Heiligen Antonius mit spektakulärem Panoramablick auf die Wüstenwildnis",
            "Ein herzhaftes Mittagessen mit lokalen Oliven, warmem Fladenbrot und frischem Ziegenkäse"
          ] : isPl ? [
            "Poranna podróż w góry Morza Czerwonego, aby odwiedzić klasztor św. Antoniego, najstarszy działający klasztor na świecie",
            "Wędrówka do jaskini górskiej św. Antoniego, podziwianie spektakularnych panoramicznych widoków na pustynię",
            "Pożywny lunch z lokalnymi oliwkami, ciepłym chlebem i świeżym kozim serem"
          ] : isCs ? [
            "Ranní cesta do drsných hor u Rudého moře a návštěva kláštera sv. Antonína, nejstaršího aktivního kláštera na světě",
            "Výšlap k jeskyni sv. Antonína v horách, odkud se otevírá nádherný panoramatický výhled na pustou poušť",
            "Vydatný oběd s místními olivami, teplým chlebem a čerstvým kozím sýrem"
          ] : isAr ? [
            "رحلة صباحية إلى جبال البحر الأحمر لزيارة دير الأنبا أنطونيوس، أقدم دير مأهول في العالم",
            "الصعود إلى مغارة الأنبا أنطونيوس في الجبل والاستمتاع بإطلالة بانورامية ساحرة على الصحراء",
            "وجبة غداء شهية تضم الزيتون المحلي، الخبز الساخن والجبن الطازج"
          ] : [
            "Morning journey into the rugged Red Sea hills to visit St. Anthony, the oldest active monastery in the world",
            "Hike the mountain cave of St. Anthony, gazing at spectacular panoramic desert wilderness views",
            "A hearty lunch featuring local olives, warm flatbread, and fresh goat cheese"
          ],
          scribeWisdom: isDe
            ? "Diese Berge beherbergen seit dem 4. Jahrhundert spirituelle Einsiedler. Die Stille der Hügel wirkt wie ein reinigendes Tonikum für den aktiven Geist."
            : isPl
            ? "W tych górach od IV wieku żyli duchowi pustelnicy. Cisza wzgórz działa jak oczyszczający balsam dla aktywnego umysłu."
            : isCs
            ? "V těchto horách žili duchovní poustevníci již od 4. století. Ticho zdejších kopců působí jako očistný balzám pro neklidnou mysl."
            : isAr
            ? "استضافت هذه الجبال النساك الروحانيين منذ القرن الرابع. تعمل سكينة التلال كبلسم مطهر للعقل المجهد."
            : "These mountains have hosted spiritual hermits since the 4th century. The quietness of the hills acts as a purifying tonic for the active mind."
        });
      } else if (d === 6) {
        daysArray.push({
          dayNumber: 6,
          theme: isDe ? "Königliches Spa & Horus-Bad" : isPl ? "Królewskie Spa i Kąpiel Horusa" : isCs ? "Královské lázně a Horova koupel" : isAr ? "المنتجع الملكي وحمام حورس" : "Sovereign Spa & Horus Bath",
          activities: isDe ? [
            "Gönnen Sie sich ein exquises ägyptisches Spa-Ritual mit Meersalzpeelings, warmem Sesamöl und süßer Weihrauchmassage",
            "Abendlicher Spaziergang durch die historische Altstadt von Hurghada (El Dahar), Mangosäfte probieren und Gewürzmärkte besuchen",
            "Traditionelles ägyptisches Abendessen mit Koshary (dem legendären Komfortgericht aus Linsen, Reis und Makkaroni)"
          ] : isPl ? [
            "Zafunduj sobie wyjątkowy rytuał spa z użyciem peelingu z soli morskiej, ciepłego oleju sezamowego i masażu z pachnącym kadzidłem",
            "Wieczorny spacer po zabytkowej starówce Hurghady (El Dahar), degustacja świeżych soków mango i wizyta na bazarach przypraw",
            "Tradycyjna egipska kolacja składająca się z Koshary (legendarnego rozgrzewającego dania z soczewicy, ryżu i makaronu)"
          ] : isCs ? [
            "Dopřejte si jedinečný lázeňský rituál s peelingem z mořské soli, teplým sezamovým olejem a jemnou masáží s kadidlem",
            "Večerní procházka historickým starým městem Hurghady (El Dahar), ochutnávka čerstvého mangového džusu a návštěva bazarů s kořením",
            "Tradiční egyptská večeře s národním jídlem Košari (legendární pokrm z čočky, rýže, těstovin a pikantní omáčky)"
          ] : isAr ? [
            "استمتع بجلسة سبا فريدة على الطراز المصري باستخدام تقشير الملح البحري وزيت السمسم الدافئ والتدليك بالبخور",
            "جولة مسائية في الدهار (البلدة القديمة بالغردقة)، وتذوق عصير المانجو الطازج وزيارة أسواق التوابل",
            "عشاء مصري تقليدي يتضمن طبق الكشري الشهير"
          ] : [
            "Indulge in a signature Egyptian spa ritual utilizing sea salt scrubs, warm sesame oil, and sweet frankincense massage",
            "An evening stroll through Hurghada's historic Old Town (El Dahar), sampling local mango juices and visiting the spice bazaars",
            "Traditional Egyptian dinner featuring Koshary (the legendary spiced lentil, rice, and macaroni comfort dish)"
          ],
          scribeWisdom: isDe
            ? "Antike Königinnen wie Cleopatra badeten in Milch und Honig, um ihre Ausstrahlung zu bewahren. Weihrauch war wertvoller als Gold und wurde zur Reinigung von Körper und Geist verwendet."
            : isPl
            ? "Starożytne królowe, takie jak Kleopatra, kąpały się w mleku i miodzie, aby zachować swój blask. Kadzidło było warte więcej niż złoto, używane do oczyszczania ciał fizycznych i duchowych."
            : isCs
            ? "Starověké královny jako Kleopatra se koupaly v mléce a medu, aby si uchovaly svůj půvab. Kadidlo mělo větší hodnotu než złato a používalo se k očištění těla i ducha."
            : isAr
            ? "استحمت الملكات القدامى مثل كليوباترا في الحليب والعسل للحفاظ على نضارتهن. كان البخور أغلى من الذهب لتطهير الروح والجسد."
            : "Ancient queens like Cleopatra bathed in milk and honey to preserve their glow. Frankincense was worth more than gold, used to cleanse both physical and spiritual bodies."
        });
      } else if (d === 7) {
        daysArray.push({
          dayNumber: 7,
          theme: isDe ? "Der Segen von Ra (Abreise)" : isPl ? "Błogosławieństwo Ra (Wyjazd)" : isCs ? "Požehnání boha Ra (Odjezd)" : isAr ? "بركة الإله راع (المغادرة)" : "The Blessing of Ra (Departure)",
          activities: isDe ? [
            "Eine abschließende Meditation bei Sonnenaufgang am Strand zur Begrüßung des aufsteigenden Sonnengottes Khepri",
            "Letzte Souvenirkäufe im Jachthafen, Erwerb von lokalen Papyrusrollen und Statuen aus reinem Alabaster",
            "Privater Transfer in einer königlichen Kutsche zurück zum Flughafen für Ihren Rückflug"
          ] : isPl ? [
            "Ostatnia medytacja o wschodzie słońca na plaży, pozdrawiająca wschodzącego boga słońca Khepri",
            "Zakupy pamiątek w marinie w ostatniej chwili, zakup lokalnych zwojów papirusu i posążków z czystego alabastru",
            "Prywatny transfer królewskim powozem z powrotem na lotnisko przed powrotem do domu"
          ] : isCs ? [
            "Závěrečná meditace při východu slunce na pláži a pozdrav vycházejícímu bohu slunce Cheperovi",
            "Nákupy suvenýrů v přístavu na poslední chvíli, nákup originálních papyrusů a sošek z čistého alabastru",
            "Soukromý transfer luxusním vozem zpět na letiště a odlet domů"
          ] : isAr ? [
            "تأمل أخير عند شروق الشمس على الشاطئ لتحية إله الشمس خبري",
            "تسوق هدايا تذكارية في اللحظة الأخيرة من المرسى، وشراء برديات محلية وتماثيل من الألباستر الخالص",
            "توصيل خاص إلى المطار للعودة إلى الوطن"
          ] : [
            "A final sunrise meditation on the beach, saluting the rising sun god Khepri",
            "Last-minute souvenir shopping in the marina, acquiring local papyrus scrolls and pure alabaster statues",
            "Private royal chariot transfer back to the airport for your departure back home"
          ],
          scribeWisdom: isDe
            ? "Jede Abreise ist nur ein Kreislauf der Rückkehr. Möge Ra sein Gesicht über Ihren Reisen leuchten lassen, und möge Ihr Herz leicht wie eine Fehter auf Ma'ats Waagschale der Gerechtigkeit bleiben."
            : isPl
            ? "Każde odejście jest tylko cyklem powrotu. Niech Ra rozświetli swoje oblicze nad Twoimi podróżami, a Twoje serce niech pozostanie lekkie jak piórko na szali sprawiedliwości Maat."
            : isCs
            ? "Každý odjezd je pouze začátkem dalšího návratu. Nechť bůh Ra rozjasní svou tvář nad vašimi cestami a vaše srdce zůstane lehké jako pírko na váze spravedlnosti bohyně Maat."
            : isAr
            ? "كل مغادرة هي مجرد بداية لرحلة عودة. ليجعل الرب را وجهه يشرق على أسفارك، وليبقَ قلبك خفيفاً كالعصفور."
            : "Every departure is merely a cycle of return. May Ra make his face shine upon your travels, and may your heart remain light as a feather on Ma'at's scale of justice."
        });
      }
    }
  }

  return {
    royalGreeting: isDe 
      ? "Willkommen, Entdecker! Wir freuen uns, Ihnen bei der Planung Ihrer Reise zu helfen. Hier ist Ihr maßgeschneiderter Reiseplan:" 
      : isPl
      ? "Witaj, odkrywco! Z przyjemnością pomożemy Ci zaplanować podróż. Oto Twój spersonalizowany plan:"
      : isCs
      ? "Vítejte, objeviteli! Rádi vám pomůžeme naplánovat vaši cestu. Zde je váš spersonalizovaný itinerář:"
      : isAr
      ? "مرحباً بك أيتها المستكشف! يسعدنا مساعدتك في تخطيط رحلتك القادمة. إليك برنامج رحلة مخصص بناءً على تفضيلاتك:"
      : "Welcome, explorer! We are excited to help you plan your upcoming journey. Here is a custom itinerary designed for your preferences:",
    title: isDe
      ? `${days}-Tage Individueller Reiseplan`
      : isPl
      ? `Spersonalizowany plan podróży na ${days} dni`
      : isCs
      ? `${days}denní spersonalizovaný plán cesty`
      : isAr
      ? `برنامج رحلة مخصص لمدة ${days} أيام`
      : `${days}-Day Customized Travel Itinerary`,
    days: daysArray,
    blessing: isDe
      ? "Wir hoffen, dieser Reiseplan inspiriert Ihr nächstes Abenteuer. Gute Reise und eine fantastische Zeit!"
      : isPl
      ? "Mamy nadzieję, że ten plan zainspiruje Cię do kolejnej przygody. Bezpiecznej podróży i wspaniałego wyjazdu!"
      : isCs
      ? "Doufáme, że vás tento itinerář inspiruje k dalšímu dobrodružství. Šťastnou cestu a úžasný pobyt!"
      : isAr
      ? "نتمنى أن يلهمك برنامج الرحلة هذا لمغامرتك القادمة. رحلة سعيدة وأوقات رائعة!"
      : "We hope this travel itinerary inspires your next adventure. Safe travels and have an amazing trip!"
  };
}

// Get offline scribe responses for different queries
function getOfflineScribeResponse(query: string, language?: string): string {
  const text = query.toLowerCase();
  
  const isDe = language === 'de';
  const isPl = language === 'pl';
  const isCs = language === 'cs';
  const isAr = language === 'ar';

  if (text.includes("name") || text.includes("hieroglyph") || text.includes("translate") || text.includes("übersetz") || text.includes("tłumacz") || text.includes("překlad") || text.includes("jméno") || text.includes("اسم") || text.includes("ترجم")) {
    return isDe
      ? "Um Ihren Namen in altägyptischen Hieroglyphen zu sehen, nutzen Sie unser Namensübersetzer-Tool oben! Geben Sie einfach Ihren Namen ein, und wir übersetzen jeden Buchstaben in das entsprechende Hieroglyphen-Symbol."
      : isPl
      ? "Aby zobaczyć swoje imię zapisane starożytnymi egipskimi hieroglifami, skorzystaj z naszego Tłumacza Imion powyżej! Po prostu wpisz swoje imię, a my przetłumaczymy każdą literę na odpowiadający jej symbol hieroglificzny."
      : isCs
      ? "Chcete-li vidět své jméno napsané ve starověkých egyptských hieroglyfech, podívejte se na náš Překladač jmen výše! Stačí zadat své jméno a my přeložíme každé písmeno do odpovídajícího hieroglyfického symbolu."
      : isAr
      ? "لرؤية اسمك مكتوباً بالهيروغليفية المصرية القديمة، استخدم أداة مترجم الأسماء أعلاه! فقط اكتب اسمك وسنترجم كل حرف إلى الرمز الهيروغليفي المقابل."
      : "To see your name written in ancient Egyptian hieroglyphs, check out our Name Translator tool above! Just type in your name, and we will translate each letter into its matching hieroglyphic symbol.";
  }
  
  if (text.includes("dive") || text.includes("coral") || text.includes("reef") || text.includes("sea") || text.includes("tauch") || text.includes("meer") || text.includes("nurkow") || text.includes("rafa") || text.includes("potápě") || text.includes("moř") || text.includes("korál") || text.includes("غوص") || text.includes("بحر") || text.includes("شعاب")) {
    return isDe
      ? "Das Rote Meer ist weltweit bekannt für sein kristallklares Wasser und seine lebendige Unterwasserwelt. Beim Tauchen an Orten wie Ras Mohammed können Sie spektakuläre Korallengärten, historische Schiffswracks und Hunderte von Fischarten erkunden."
      : isPl
      ? "Morze Czerwone słynie na całym świecie z krystalicznie czystej wody i tętniącego życiem życia morskiego. Podczas nurkowania w miejscach takich jak Ras Mohammed możesz odkrywać spektakularne ogrody koralowe, historyczne wraki statków i setki gatunków ryb."
      : isCs
      ? "Rudé moře je světově proslulé svou křišťálově čistou vodou a živým mořským životem. Při potápění v lokalitách jako Ras Mohammed můžete objevovat spektakulární korálové zahrady, historické vraky lodí a stovky druhů ryb."
      : isAr
      ? "يشتهر البحر الأحمر عالمياً بمياهه النقية وحياته البحرية النابضة بالحياة. عند الغوص في مواقع مثل رأس محمد، يمكنك استكشاف حدائق الشعاب المرجانية، وحطام السفن التاريخية، ومئات الأنواع من الأسماك."
      : "The Red Sea is world-famous for its crystal-clear waters and vibrant marine life. When diving at sites like Ras Mohammed, you can explore spectacular coral gardens, historic shipwrecks, and hundreds of species of fish.";
  }

  if (text.includes("safari") || text.includes("desert") || text.includes("camel") || text.includes("quad") || text.includes("wüste") || text.includes("pustyn") || text.includes("velbloud") || text.includes("poušť") || text.includes("čtyřkol") || text.includes("صحراء") || text.includes("سفاري") || text.includes("جمل") || text.includes("جمال")) {
    return isDe
      ? "Unsere Wüstensafaris bieten eine perfekte Mischung aus Abenteuer und Kultur. Sie können mit dem Quad über die Dünen rasen, einen ruhigen Kamelritt bei Sonnenuntergang genießen und ein Beduinenlager besuchen, um traditionelle Gastfreundschaft und Tee zu erleben."
      : isPl
      ? "Nasze pustynne safari oferują idealne połączenie przygody i kultury. Możesz pędzić po wydmach na quadzie, cieszyć się spokojną przejażdżką na wielbłądzie o zachodzie słońca i odwiedzić obóz Beduinów, aby doświadczyć tradycyjnej gościnności i herbaty."
      : isCs
      ? "Naše pouštní safari nabízí dokonalou kombinaci dobrodružství a kultury. Můžete se prohánět po dunách na čtyřkolce, užít si klidnou projížďku na velbloudu při západu slunce a navštívit beduínský tábor, abyste zažili tradiční pohostinnost a čaj."
      : isAr
      ? "تقدم رحلات السفاري الصحراوية لدينا مزيجاً مثالياً من المغامرة والثقافة. يمكنك ركوب البيتش باجي فوق الكثبان الرملية، والاستمتاع بركوب الجمال عند الغروب، وزيارة مخيم بدوي لتجربة الضيافة والشاي الأصيل."
      : "Our desert safaris offer a perfect blend of adventure and culture. You can race over the dunes on a quad bike, enjoy a quiet camel trek at sunset, and visit a Bedouin camp to experience traditional hospitality and tea.";
  }

  if (text.includes("luxor") || text.includes("temple") || text.includes("king") || text.includes("ruin") || text.includes("history") || text.includes("geschicht") || text.includes("histor") || text.includes("ruine") || text.includes("zabyt") || text.includes("pamat") || text.includes("chrám") || text.includes("الأقصر") || text.includes("معبد") || text.includes("تاريخ")) {
    return isDe
      ? "Luxor beheimatet einige der unglaublichsten historischen Stätten der Welt. Am Ostufer des Nils können Sie die riesigen Tempelanlagen von Karnak und Luxor besichtigen. Am Westufer können Sie in die wunderschön bemälten Gräber im Tal der Könige hinabsteigen."
      : isPl
      ? "Luksor jest domem dla niektórych z najwspanialszych zabytków historycznych na świecie. Na wschodnim brzegu Nilu można odwiedzić ogromne kompleksy świątynne Karnak i Luksor. Na zachodnim brzegu można zejść do pięknie pomalowanych grobowców w Dolinie Królów."
      : isCs
      ? "Luxor je domovem některých z nejúžasnějších historických památek na světě. Na východním břehu Nilu můžete navštívit masivní chrámy v Karnaku a Luxoru. Na západním břehu můžete sestoupit do nádherně zdobených hrobek v Údolí králů."
      : isAr
      ? "تضم الأقصر بعضاً من أروع المواقع التاريخية في العالم. في البر الشرقي للنيل، يمكنك زيارة معابدهم الهائلة في الكرنك والأقصر. وفي البر الغربي، يمكنك النزول إلى المقابر الملونة الرائعة في وادي الملوك."
      : "Luxor is home to some of the world's most incredible historical sites. On the East Bank of the Nile, you can visit the massive Karnak and Luxor temples. On the West Bank, you can descend into the beautifully painted tombs of the Valley of the Kings.";
  }

  return isDe
    ? "Vielen Dank für Ihre Frage! Ich kann Ihnen bei allen Fragen zu den Korallenriffen des Roten Meeres, Wüstensafaris oder historischen Touren nach Luxor behilflich sein. Worüber möchten Sie mehr erfahren?"
    : isPl
    ? "Dziękuję za pytanie! Mogę pomóc Ci we wszystkim, co dotyczy raf koralowych Morza Czerwonego, pustynnego safari lub wycieczek historycznych do Luksoru. O czym chcesz dowiedzieć się więcej?"
    : isCs
    ? "Děkuji za vaši otázku! Mohu vám pomoci s čímkoli, co se týká korálových útesów Rudého moře, pouštního safari nebo historických výletů do Luxoru. O čem byste se chtěli dozvědět více?"
    : isAr
    ? "شكراً لسؤالك! يمكنني مساعدتك في كل ما يتعلق بالشعاب المرجانية في البحر الأحمر، رحلات السفاري الصحراوية، أو الجولات التاريخية للأقصر. ماذا تحب أن تعرف أكثر؟"
    : "Thank you for your question! I can help you with anything related to the Red Sea coral reefs, desert safaris, or historical tours to Luxor. What would you like to know more about?";
}
