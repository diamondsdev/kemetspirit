import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Compass, Shield, Anchor, Calendar, Waves, Search, Sparkles, BookOpen, CheckSquare, Square, RotateCcw, Luggage, Shirt, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface FAQItem {
  id: string;
  category: 'equipment' | 'seasons' | 'history' | 'general';
  question: string;
  glyph: string;
  answer: string;
  loreQuote?: string;
  highlights: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'equipment',
    question: 'What diving gear is provided and what do I need to bring?',
    glyph: '𓆛',
    answer: 'We provide all your main scuba diving equipment, including 12L tanks, high-quality regulators, BCD vests, and wetsuits (3mm or 5mm thickness). All you need to bring is your swimsuit and your physical or digital diving certification card. If you use a prescription diving mask, we highly recommend bringing yours so you can enjoy the reefs to the fullest!',
    loreQuote: 'The Red Sea is stunningly clear, but having the right gear ensures a safe and comfortable dive.',
    highlights: ['All core dive gear included', '3mm & 5mm wetsuits available', 'Just bring swimwear & certification']
  },
  {
    id: 'faq-2',
    category: 'equipment',
    question: 'What should I wear for desert safaris and stargazing?',
    glyph: '𓅓',
    answer: 'The desert is very sunny and warm during the day but gets surprisingly cold once the sun goes down! We recommend wearing loose, light long-sleeve clothing to protect yourself from sunburn. Make sure to wear comfortable closed-toe shoes like sneakers or hiking boots (sandals are not allowed for safety). We will give you a free cotton headscarf and safety goggles to keep dust out of your face during quad biking.',
    loreQuote: 'Layer up for the desert. Sun protection by day, cozy layers by night.',
    highlights: ['Closed-toe sneakers or boots required', 'Wear light long-sleeve clothes', 'Free headscarf & safety goggles']
  },
  {
    id: 'faq-3',
    category: 'seasons',
    question: 'When is the best time of year to go diving in the Red Sea?',
    glyph: '𓊟',
    answer: 'Diving here is great all year round! However, if you want the absolute best visibility (often over 30 meters) and lovely warm water temperatures (between 26°C and 29°C), we recommend visiting from late September to November, or in spring from April to June. If you specifically want to see schools of Hammerhead Sharks, the hot summer months of July and August are the absolute best times.',
    loreQuote: 'Spring and autumn offer the clearest water and the most comfortable weather.',
    highlights: ['September–November: Best visibility', 'July–August: Hammerhead shark season', 'Water temp: 21°C (Winter) to 29°C (Summer)']
  },
  {
    id: 'faq-4',
    category: 'seasons',
    question: 'Is the Nile cruise comfortable during the hot summer months?',
    glyph: '𓊡',
    answer: 'Yes! Our cruise boats have excellent, modern air conditioning throughout, along with nice shaded outdoor decks and swimming pools to help you cool off. While it can get over 40°C at noon in Luxor, we schedule all temple sightseeing tours for early in the morning (around 5:30 AM) or late in the afternoon. This way, you avoid the midday heat and get to see the monuments in beautiful golden light.',
    loreQuote: 'We skip the midday heat with smart scheduling, leaving your afternoons free to relax by the pool.',
    highlights: ['Full air conditioning on board', 'Early-morning cool temple tours', 'Relax by the pool during peak heat']
  },
  {
    id: 'faq-5',
    category: 'history',
    question: 'Do I need tickets or permits to take photos inside the tombs?',
    glyph: '𓉐',
    answer: 'Yes, we take care of pre-booking your standard entry tickets, which cover access to three major tombs in places like the Valley of the Kings. Some famous tombs, like King Tutankhamun or Seti I, require extra individual tickets—just let us know 48 hours before your tour and we will get them sorted for you. You can take photos with your smartphone for free in almost all tombs, but professional cameras and tripods are not allowed without an expensive commercial permit.',
    loreQuote: 'Smartphones are great for capturing memories for free, but please turn off your flash to protect the ancient paintings.',
    highlights: ['Standard passes booked for you', 'Tutankhamun requires extra ticket', 'Free smartphone photos (no flash)']
  },
  {
    id: 'faq-6',
    category: 'history',
    question: 'Is there a dress code for visiting temples and ancient sites?',
    glyph: '𓋹',
    answer: 'Yes. Even though these are outdoor historic sites, they are still highly respected cultural landmarks. We kindly ask both men and women to wear respectful clothing that covers shoulders and knees. Bringing a light scarf is super handy for sun protection, and comfortable walking shoes are absolutely essential for uneven stone pathways.',
    loreQuote: 'Dress respectfully to honor local culture, and protect yourself from the hot sun.',
    highlights: ['Cover shoulders and knees', 'Sturdy walking shoes are a must', 'Bring a light scarf for sun cover']
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'Is the tap water safe to drink, and how do I stay hydrated?',
    glyph: '𓎬',
    answer: 'Please do not drink tap water or river water from the Nile. We provide unlimited, ice-cold bottled mineral water in all of our tour vans, transfer cars, boats, and desert camps completely free of charge. We recommend drinking 3 to 4 liters of water a day to stay healthy in the desert. Our tour guides also carry first-aid kits and rehydration salts just in case you feel dehydrated.',
    loreQuote: 'Drink plenty of bottled water to keep your energy up under the Egyptian sun.',
    highlights: ['Do not drink tap or river water', 'Unlimited free bottled water provided', 'Rehydration kits carried on all tours']
  }
];

const FAQ_DATA_DE: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'equipment',
    question: 'Welche Tauchausrüstung wird zur Verfügung gestellt und was muss ich mitbringen?',
    glyph: '𓆛',
    answer: 'Wir stellen Ihre gesamte Tauchausrüstung zur Verfügung, einschließlich 12L-Flaschen, hochwertigen Atemreglern, Tarierwesten (BCD) und Neoprenanzügen (3mm oder 5mm Dicke). Sie müssen lediglich Ihren Badeanzug/Badehose und Ihre physische oder digitale Tauchzertifizierungskarte mitbringen. Wenn Sie eine optische Tauchmaske verwenden, empfehlen wir dringend, Ihre eigene mitzubringen, um die Riffe in vollen Zügen genießen zu können!',
    loreQuote: 'Das Rote Meer ist atemberaubend klar, aber die richtige Ausrüstung sorgt für einen sicheren und komfortablen Tauchgang.',
    highlights: ['Kernausrüstung inbegriffen', '3mm & 5mm Neoprenanzüge verfügbar', 'Nur Badebekleidung & Zertifikat mitbringen']
  },
  {
    id: 'faq-2',
    category: 'equipment',
    question: 'Was sollte ich für Wüstensafaris und Sternenbeobachtung anziehen?',
    glyph: '𓅓',
    answer: 'Die Wüste ist tagsüber sehr sonnig und warm, wird aber überraschend kalt, sobald die Sonne untergeht! Wir empfehlen, lockere, helle, langärmlige Kleidung zu tragen, um sich vor Sonnenbrand zu schützen. Achten Sie darauf, bequeme, geschlossene Schuhe wie Turnschuhe oder Wanderschuhe zu tragen (Sandalen sind aus Sicherheitsgründen nicht erlaubt). Wir schenken Ihnen ein kostenloses Baumwoll-Kopftuch und eine Sicherheitsbrille, damit Ihnen bei der Quad-Fahrt kein Staub ins Gesicht fliegt.',
    loreQuote: 'Ziehen Sie sich für die Wüste in Schichten an. Sonnenschutz am Tag, kuschelige Kleidung bei Nacht.',
    highlights: ['Geschlossene Schuhe oder Stiefel erforderlich', 'Leichte langärmlige Kleidung tragen', 'Kostenloses Kopftuch & Schutzbrille']
  },
  {
    id: 'faq-3',
    category: 'seasons',
    question: 'Wann ist die beste Jahreszeit zum Tauchen im Roten Meer?',
    glyph: '𓊟',
    answer: 'Tauchen ist hier das ganze Jahr über fantastisch! Wenn Sie jedoch die absolut beste Sicht (oft über 30 Meter) und angenehm warme Wassertemperaturen (zwischen 26°C und 29°C) wünschen, empfehlen wir einen Besuch von Ende September bis November oder im Frühling von April bis Juni. Wenn Sie gezielt Hammerhai-Schulen sehen möchten, sind die heißen Sommermonate Juli und August die absolut besten Zeiten.',
    loreQuote: 'Frühling und Herbst bieten das klarste Wasser und das angenehmste Wetter.',
    highlights: ['September–November: Beste Sicht', 'Juli–August: Hammerhai-Saison', 'Wassertemp: 21°C (Winter) bis 29°C (Sommer)']
  },
  {
    id: 'faq-4',
    category: 'seasons',
    question: 'Ist die Nilkreuzfahrt in den heißen Sommermonaten komfortabel?',
    glyph: '𓊡',
    answer: 'Ja! Unsere Kreuzfahrtschiffe verfügen über eine hervorragende, moderne Klimaanlage im gesamten Schiff sowie über schöne schattige Außendecks und Swimmingpools zur Abkühlung. Während es in Luxor mittags über 40°C heiß werden kann, planen wir alle Tempelbesichtigungen für den frühen Morgen (gegen 5:30 Uhr) oder den späten Nachmittag. Auf diese Weise vermeiden Sie die Mittagshitze und sehen die Monumente in wunderschönem, goldenem Licht.',
    loreQuote: 'Mit einer intelligenten Zeitplanung umgehen wir die Mittagshitze, sodass Sie Ihre Nachmittage entspannt am Pool verbringen können.',
    highlights: ['Vollständige Klimaanlage an Bord', 'Kühle Tempeltouren am frühen Morgen', 'Entspannen am Pool während der Mittagshitze']
  },
  {
    id: 'faq-5',
    category: 'history',
    question: 'Benötige ich Tickets oder Genehmigungen, um in den Gräbern zu fotografieren?',
    glyph: '𓉐',
    answer: 'Ja, wir kümmern uns um die Vorabbuchung Ihrer Standard-Eintrittskarten, die den Zugang zu drei großen Gräbern an Orten wie dem Tal der Könige abdecken. Einige berühmte Gräber wie das von König Tutanchamun oder Seti I. erfordern zusätzliche Einzeltickets – geben Sie uns einfach 48 Stunden vor Ihrer Tour Bescheid und wir werden diese für Sie organisieren. Sie können in fast allen Gräbern kostenlos mit Ihrem Smartphone fotografieren, aber professionelle Kameras und Stative sind ohne eine teure kommerzielle Genehmigung nicht gestattet.',
    loreQuote: 'Smartphones eignen sich hervorragend, um Erinnerungen kostenlos festzuhalten, aber bitte schalten Sie den Blitz aus, um die antiken Malereien zu schützen.',
    highlights: ['Standardpässe für Sie gebucht', 'Tutanchamun erfordert Extraticket', 'Kostenlose Smartphone-Fotos (kein Blitz)']
  },
  {
    id: 'faq-6',
    category: 'history',
    question: 'Gibt es eine Kleiderordnung für den Besuch von Tempeln und antiken Stätten?',
    glyph: '𓋹',
    answer: 'Ja. Obwohl es sich um historische Stätten im Freien handelt, sind sie dennoch hoch angesehene kulturelle Wahrzeichen. Wir bitten sowohl Männer als auch Frauen höflich, respektvolle Kleidung zu tragen, die Schultern und Knie bedeckt. Ein leichtes Tuch ist sehr praktisch als Sonnenschutz, und bequeme Wanderschuhe sind für unebene Steinpfade absolut unerlässlich.',
    loreQuote: 'Kleiden Sie sich respektvoll, um die lokale Kultur zu ehren, und schützen Sie sich vor der heißen Sonne.',
    highlights: ['Schultern und Knie bedecken', 'Robuste Wanderschuhe sind ein Muss', 'Leichtes Tuch als Sonnenschutz mitbringen']
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'Ist das Leitungswasser trinkbar und wie sorge ich für ausreichende Flüssigkeitszufuhr?',
    glyph: '𓎬',
    answer: 'Bitte trinken Sie kein Leitungswasser oder Flusswasser aus dem Nil. Wir stellen in allen unseren Tourbussen, Transferfahrzeugen, Booten und Wüstencamps unbegrenzt eiskaltes Mineralwasser in Flaschen völlig kostenlos zur Verfügung. Wir empfehlen, täglich 3 bis 4 Liter Wasser zu trinken, um in der Wüste gesund zu bleiben. Unsere Reiseleiter führen auch Erste-Hilfe-Kits und Rehydrationssalze mit sich, falls Sie sich dehydriert fühlen.',
    loreQuote: 'Trinken Sie viel Mineralwasser in Flaschen, um unter der ägyptischen Sonne voller Energie zu bleiben.',
    highlights: ['Kein Leitungs- oder Flusswasser trinken', 'Unbegrenzt kostenloses Mineralwasser', 'Rehydrations-Kits auf allen Touren']
  }
];

type EnvironmentType = 'diving' | 'desert' | 'temples';
type SeasonType = 'spring_autumn' | 'summer' | 'winter';

const BASE_PACKING_DATA: Record<EnvironmentType, string[]> = {
  diving: [
    'Swimwear & swim trunks (bring 2 sets)',
    'Reef-safe biodegradable sunscreen (SPF 50+)',
    'Waterproof dry bag for boat decks',
    'Personal diving mask (prescription if needed)',
    'Physical or digital dive certification card & logbook',
    'Lightweight sandals or flip-flops'
  ],
  desert: [
    'Sturdy closed-toe sneakers or hiking boots (sandals not permitted)',
    'Lightweight, breathable long-sleeve shirts (protection from sun & dust)',
    'Polarized sunglasses with high UV protection',
    'Washable cotton headscarf / bandana (for wind protection)',
    'Moisture-wicking athletic socks',
    'High-UV lip balm & intensive moisturizer'
  ],
  temples: [
    'Modest apparel (shoulders and knees covered for sacred ruins)',
    'Wide-brim sun hat or linen cap',
    'Ultra-comfortable, supportive walking shoes',
    'Hand sanitizer & pocket wet wipes',
    'Small local cash bills (EGP coins for temple facilities)',
    'Compact travel umbrella for personal shade'
  ]
};

const BASE_PACKING_DATA_DE: Record<EnvironmentType, string[]> = {
  diving: [
    'Badebekleidung & Badehosen (bringen Sie 2 Sets mit)',
    'Riffsichere, biologisch abbaubare Sonnencreme (LSF 50+)',
    'Wasserdichte Trockentasche für Bootsdecks',
    'Eigene Tauchmaske (ggf. mit Sehstärke)',
    'Physische oder digitale Tauchzertifizierungskarte & Logbuch',
    'Leichte Sandalen oder Zehentrenner'
  ],
  desert: [
    'Robuste, geschlossene Turnschuhe oder Wanderschuhe (Sandalen nicht erlaubt)',
    'Leichte, atmungsaktive langärmlige Hemden (Schutz vor Sonne & Staub)',
    'Polarisierte Sonnenbrille mit hohem UV-Schutz',
    'Waschbares Baumwollkopftuch / Bandana (als Windschutz)',
    'Feuchtigkeitsableitende Sportsocken',
    'Lippenbalsam mit hohem UV-Schutz & intensive Feuchtigkeitscreme'
  ],
  temples: [
    'Bescheidene Kleidung (Schultern und Knie bedeckt für antike Ruinen)',
    'Breitkrempiger Sonnenhut oder Leinenkappe',
    'Besonders bequeme, unterstützende Wanderschuhe',
    'Desinfektionsmittel & feuchte Taschentücher',
    'Kleingeld in Landeswährung (EGP-Münzen für Tempelanlagen)',
    'Kompakter Taschenschirm als persönlicher Schattenspender'
  ]
};

const SEASONAL_PACKING_DATA: Record<SeasonType, string[]> = {
  spring_autumn: [
    'Light jacket or wrap for cool evening breezes',
    'Versatile layering options for high diurnal temperature swings'
  ],
  summer: [
    'Handheld personal misting fan',
    'Electrolyte rehydration powder packs',
    'UV protective cooling towel',
    'High-grade sunblock (reapply every 2 hours)'
  ],
  winter: [
    'Cozy fleece jacket or packable down coat for chilly desert nights',
    'Warm pashmina scarf or travel shawl',
    'Thermal base layer if participating in overnight stargazing camping'
  ]
};

const SEASONAL_PACKING_DATA_DE: Record<SeasonType, string[]> = {
  spring_autumn: [
    'Leichte Jacke oder ein Tuch für kühle Abendbrisen',
    'Vielseitige Optionen für Zwiebellook bei hohen Temperaturschwankungen zwischen Tag und Nacht'
  ],
  summer: [
    'Tragbarer persönlicher Sprühventilator',
    'Elektrolyt-Rehydrationspulver',
    'UV-schützendes Kühltuch',
    'Hochwertiger Sonnenschutz (alle 2 Stunden neu auftragen)'
  ],
  winter: [
    'Kuschelige Vliesjacke oder packbare Daunenjacke für kühle Wüstennächte',
    'Warmer Pashmina-Schal oder Reiseshawl',
    'Thermische Basisschicht für die Teilnahme an Camping zur Sternenbeobachtung'
  ]
};

const ETIQUETTE_DATA: Record<EnvironmentType, { dos: string[]; donts: string[] }> = {
  diving: {
    dos: [
      'Practice neutral buoyancy to keep a safe distance from fragile coral reefs.',
      'Apply reef-safe biodegradable sunscreen at least 30 minutes before entering the water.',
      'Show appreciation by tipping the boat crew (Baksheesh is customary and highly valued).'
    ],
    donts: [
      'Never touch, stand on, or kick the living coral. A single brush can destroy decades of growth.',
      'Do not collect seashells, fossilized coral pieces, or artifacts from marine national parks.',
      'Never feed or try to chase wild marine life; let them swim freely.'
    ]
  },
  desert: {
    dos: [
      'Always wear sturdy closed-toe shoes to protect against hot sand, thorns, or small desert fauna.',
      'Always ask for permission before taking photographs of Bedouin hosts, handlers, or camels.',
      'Drink water constantly, even if you do not feel thirsty; desert air evaporates sweat instantly.'
    ],
    donts: [
      'Do not litter or leave waste. Keep the pristine desert dunes perfectly untouched.',
      'Never wander off alone beyond the marked perimeter of the camp, especially after sunset.',
      'Avoid high-speed quad-biking maneuvers that kick up unnecessary dust clouds near camel routes.'
    ]
  },
  temples: {
    dos: [
      'Dress modestly by keeping both shoulders and knees covered when entering historic temples and tombs.',
      'Keep a supply of small-denomination Egyptian Pound (EGP) cash notes on hand for tipping.',
      'Carry your trash with you until you find a waste receptacle.'
    ],
    donts: [
      'Never touch, lean on, or scratch ancient carved reliefs, painted murals, or hieroglyphic pillars.',
      'Absolutely NO flash photography inside any tombs. Bright strobe light degrades historical organic pigments.',
      'Do not climb or sit on ancient stone altars, walls, ruins, or statues.'
    ]
  }
};

const ETIQUETTE_DATA_DE: Record<EnvironmentType, { dos: string[]; donts: string[] }> = {
  diving: {
    dos: [
      'Üben Sie neutrale Tarierung, um einen sicheren Abstand zu den empfindlichen Korallenriffen zu halten.',
      'Tragen Sie riffsichere, biologisch abbaubare Sonnencreme mindestens 30 Minuten vor dem Betreten des Wassers auf.',
      'Zeigen Sie Ihre Anerkennung, indem Sie der Bootsbesatzung Trinkgeld geben (Bakschisch ist üblich und sehr geschätzt).'
    ],
    donts: [
      'Niemals lebende Korallen berühren, betreten oder treten. Eine einzige Berührung kann Jahrzehnte des Wachstums zerstören.',
      'Sammeln Sie keine Muscheln, fossilen Korallenstücke oder Artefakte aus Meeresnationalparks.',
      'Füttern oder jagen Sie niemals wilde Meereslebewesen; lassen Sie sie frei schwimmen.'
    ]
  },
  desert: {
    dos: [
      'Tragen Sie immer robuste, geschlossene Schuhe zum Schutz vor heißem Sand, Dornen oder kleinen Wüstentieren.',
      'Bitten Sie immer um Erlaubnis, bevor Sie Fotos von Beduinen-Gastgebern, Kamelführern oder Kamelen machen.',
      'Trinken Sie ständig Wasser, auch wenn Sie keinen Durst verspüren; Wüstenluft verdunstet Schweiß sofort.'
    ],
    donts: [
      'Keinen Müll hinterlassen. Halten Sie die unberührten Wüstendünen vollkommen sauber.',
      'Wandern Sie niemals alleine über die markierten Grenzen des Camps hinaus, insbesondere nach Sonnenuntergang.',
      'Vermeiden Sie riskante Quad-Fahrten, die unnötige Staubwolken in der Nähe von Kamelrouten aufwirbeln.'
    ]
  },
  temples: {
    dos: [
      'Kleiden Sie sich bescheiden, indem Sie beim Betreten historischer Tempel und Gräber sowohl Schultern als auch Knie bedeckt halten.',
      'Halten Sie einen Vorrat an kleinen ägyptischen Pfund-Banknoten (EGP) für Trinkgelder bereit.',
      'Nehmen Sie Ihren Müll mit, bis Sie einen Abfalleimer finden.'
    ],
    donts: [
      'Berühren, lehnen oder kratzen Sie niemals an antiken Reliefs, gemalten Wandbildern oder hieroglyphischen Säulen.',
      'Absolut KEINE Blitzlichtfotografie in den Gräbern. Helles Blitzlicht schädigt die historischen organischen Pigmente.',
      'Klettern oder sitzen Sie nicht auf antiken Steinaltären, Mauern, Ruinen oder Statuen.'
    ]
  }
};

export const FAQ_DATA_AR: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'equipment',
    question: 'ما هي معدات الغوص التي يتم توفيرها وما الذي أحتاج لإحضاره معي؟',
    glyph: '𓆛',
    answer: 'نوفر لك جميع معدات الغوص السكوبا الأساسية، بما في ذلك أسطوانات سعة 12 لتر، وأجهزة تنظيم التنفس عالية الجودة، وسترات BCD، وبدلات الغوص (بسُمك 3 مم أو 5 مم). كل ما عليك إحضاره هو ملابس السباحة وبطاقة ترخيص الغوص الورقية أو الرقمية. إذا كنت تستخدم نظارة غوص طبية، نوصي بشدة بإحضار نظارتك الخاصة لتمتلك أفضل تجربة للتمتع بالشعاب المرجانية!',
    loreQuote: 'البحر الأحمر صافٍ ونقي للغاية، ولكن امتلاك المعدات المناسبة يضمن لك غوصاً آمناً ومريحاً.',
    highlights: ['جميع معدات الغوص الأساسية مشمولة', 'بدلات غوص 3 مم و 5 مم متوفرة', 'احضر فقط ملابس السباحة ورخصة الغوص']
  },
  {
    id: 'faq-2',
    category: 'equipment',
    question: 'ماذا يجب أن أرتدي في رحلات السفاري الصحراوية ومراقبة النجوم؟',
    glyph: '𓅓',
    answer: 'الصحراء مشمسة ودافئة جداً نهاراً، ولكنها تصبح باردة بشكل مفاجئ بمجرد غروب الشمس! نوصي بارتداء ملابس فضفاضة وخفيفة بأكمام طويلة لحماية نفسك من حروق الشمس. احرص على ارتداء أحذية مريحة ومغلقة مثل الأحذية الرياضية أو أحذية المشي (لا يُسمح بالصنادل لأسباب تتعلق بالسلامة). سنقدم لك شال قطني مجاني ونظارات واقية لحماية وجهك من الغبار أثناء قيادة البيتش باجي.',
    loreQuote: 'ارتدِ ملابس متعددة الطبقات للصحراء. الحماية من الشمس نهاراً، والطبقات الدافئة ليلاً.',
    highlights: ['أحذية مغلقة أو أحذية رياضية مطلوبة', 'ارتدِ ملابس خفيفة بأكمام طويلة', 'شال رأس ونظارة أمان مجاناً']
  },
  {
    id: 'faq-3',
    category: 'seasons',
    question: 'ما هو أفضل وقت في السنة للغوص في البحر الأحمر؟',
    glyph: '𓊟',
    answer: 'الغوص هنا ممتاز على مدار السنة! ومع ذلك، إذا كنت ترغب في أفضل مدى رؤية مطلق (غالباً ما يتجاوز 30 متراً) ودرجات حرارة مياه دافئة ولطيفة (بين 26 و 29 درجة مئوية)، فنوصي بالزيارة من أواخر سبتمبر إلى نوفمبر، أو في الربيع من أبريل إلى يونيو. إذا كنت ترغب خصيصاً في رؤية أسماك قرش المطرقة، فإن أشهر الصيف الحارة في يوليو وأغسطس هي الوقت الأمثل.',
    loreQuote: 'الربيع والخريف يقدمان أنقى مياه وأكثر طقس مريح.',
    highlights: ['سبتمبر–نوفمبر: أفضل مدى رؤية', 'يوليو–أغسطس: موسم أسماك قرش المطرقة', 'حرارة الماء: من 21 مئوية (شتاءً) إلى 29 مئوية (صيفاً)']
  },
  {
    id: 'faq-4',
    category: 'seasons',
    question: 'هل كروز النيل مريح خلال أشهر الصيف الحارة؟',
    glyph: '𓊡',
    answer: 'نعم! تتمتع سفن الكروز لدينا بتكييف هواء حديث وممتاز في جميع الأرجاء، بالإضافة إلى أسطح خارجية مظللة وحمامات سباحة لمساعدتك على الانتعاش. في حين قد تتجاوز درجات الحرارة 40 درجة مئوية ظهراً في الأقصر، فإننا نجدول جميع جولات زيارة المعابد في الصباح الباكر (حوالي الساعة 5:30 صباحاً) أو في وقت متأخر من بعد الظهيرة. بهذه الطريقة تجنب حرارة الظهيرة وتستمتع بالمعالم في ضوء ذهبي ساحر.',
    loreQuote: 'نتجنب حرارة الظهيرة بالجدولة الذكية، مما يترك لك بعد الظهيرة للاسترخاء بجانب المسبح.',
    highlights: ['تكييف كامل على متن السفينة', 'جولات معابد باردة في الصباح الباكر', 'استرخاء بجانب المسبح أثناء الذروة']
  },
  {
    id: 'faq-5',
    category: 'history',
    question: 'هل أحتاج إلى تذاكر أو تصاريح لالتقاط الصور داخل المقابر؟',
    glyph: '𓉐',
    answer: 'نعم، نحن نعتني بحجز تذاكر الدخول القياسية الخاصة بك مسبقاً، والتي تغطي دخول ثلاث مقابر رئيسية في أماكن مثل وادي الملوك. تقتضي بعض المقابر الشهيرة، مثل مقبرة الملك توت عنخ آمون أو سيتي الأول، تذاكر فردية إضافية - فقط أخبرنا قبل 48 ساعة من جولتك وسنقوم بتوفيرها لك. يمكنك التقاط الصور بهاتفك الذكي مجاناً في جميع المقابر تقريباً، ولكن لا يُسمح بالكاميرات الاحترافية والأنوال بدون تصريح تجاري مكلف.',
    loreQuote: 'الهواتف الذكية ممتازة لالتقاط الذكريات مجاناً، ولكن يرجى إيقاف الفلاش لحماية النقوش القديمة.',
    highlights: ['حجز تصاريح جولات الملوك مسبقاً', 'توت عنخ آمون يتطلب تذكرة خاصة', 'تصوير مجاني بالهاتف (بدون فلاش)']
  },
  {
    id: 'faq-6',
    category: 'history',
    question: 'هل هناك قواعد ملابس محددة لزيارة المعابد والمواقع الأثرية؟',
    glyph: '𓋹',
    answer: 'نعم. على الرغم من أنها مواقع تاريخية مفتوحة، إلا أنها تظل معالم ثقافية ذات احترام كبير. نطلب بكل لطف من الرجال والنساء ارتداء ملابس محترمة تغطي الكتفين والركبتين. إحضار شال خفيف مفيد جداً للحماية من الشمس، وأحذية المشي المريحة ضرورية تماماً للمسارات الحجرية غير المستوية.',
    loreQuote: 'ارتدِ ملابس محترمة لتكريم الثقافة المحلية، واحمِ نفسك من أشعة الشمس الساطعة.',
    highlights: ['تغطية الكتفين والركبتين', 'أحذية مشي قوية ضرورية', 'إحضار وشاح خفيف للوقاية من الشمس']
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'هل مياه الصنبور صالحة للشرب، وكيف أحافظ على رطوبة جسمي؟',
    glyph: '𓎬',
    answer: 'يرجى عدم شرب مياه الصنبور أو مياه النيل المباشرة. نحن نوفر مياه معدنية معبأة في زجاجات مثلجة وغير محدودة في جميع حافلات الجولات وسيارات التنقلات والحافلات والمخيمات الصحراوية مجاناً بالكامل. نوصي بشرب من 3 إلى 4 لترات من الماء يومياً للحفاظ على صحتك في الصحراء. يحمل مرشدو الجولات أيضاً حقائب إسعافات أولية وأملاح تعويض الجفاف تحسباً لشعورك بالجفاف.',
    loreQuote: 'اشرب الكثير من المياه المعدنية المعبأة للحفاظ على طاقتك تحت الشمس المصرية.',
    highlights: ['عدم شرب مياه الصنبور أو النيل', 'مياه معبأة مجانية وغير محدودة', 'حقائب تعويض الجفاف متوفرة في كل جولة']
  }
];

export const BASE_PACKING_DATA_AR: Record<EnvironmentType, string[]> = {
  diving: [
    'ملابس سباحة وشورتات (احضر طقمين)',
    'واقي شمس صديق للشعاب المرجانية وقابل للتحلل (SPF 50+)',
    'حقيبة مقاومة للماء لحفظ الأغراض على القارب',
    'نظارة غوص شخصية (طبية إن لزم الأمر)',
    'بطاقة وسجل ترخيص الغوص الورقي أو الرقمي',
    'صندل خفيف أو خف مائي'
  ],
  desert: [
    'أحذية رياضية قوية ومغلقة أو أحذية تسلق (الصنادل غير مسموح بها)',
    'قمصان خفيفة وبأكمام طويلة جيدة التهوية (للحماية من الشمس والغبار)',
    'نظارات شمسية قطبية مع حماية عالية من الأشعة فوق البنفسجية',
    'شال قطني قابل للغسل / بنادانا (للحماية من الرياح والأتربة)',
    'جوارب رياضية ماصة للرطوبة',
    'مرطب شفاه مع واقي شمس ومرطب بشرة مكثف'
  ],
  temples: [
    'ملابس محتشمة (كتفين وركبتين مغطاة للمواقع الأثرية)',
    'قبعة شمسية واسعة الحواف أو قبعة كتان',
    'أحذية مشي مريحة للغاية وداعمة للقدم',
    'معقم يدين ومناديل مبللة للجيب',
    'نقود ورقية محلية بفئات صغيرة (جنيهات مصرية للخدمات والخدمات)',
    'مظلة سفر صغيرة للتظليل الشخصي'
  ]
};

export const SEASONAL_PACKING_DATA_AR: Record<SeasonType, string[]> = {
  spring_autumn: [
    'سترة خفيفة أو وشاح لنسمات المساء اللطيفة',
    'خيارات ملابس متعددة للتعامل مع تقلبات الحرارة بين النهار والليل'
  ],
  summer: [
    'مروحة رزاز شخصية محمولة باليد',
    'أكياس مسحوق تعويض الجفاف والكتروليتات',
    'منشفة تبريد واقية من الأشعة فوق البنفسجية',
    'واقي شمس عالي الجودة (إعادة الاستخدام كل ساعتين)'
  ],
  winter: [
    'سترة صوفية دافئة أو معطف مبطن لليالي الصحراء الباردة',
    'وشاح باشمينا دافئ أو شال سفر',
    'ملابس حرارية داخلية إذا كنت تشارك في تخييم رصد النجوم'
  ]
};

export const ETIQUETTE_DATA_AR: Record<EnvironmentType, { dos: string[]; donts: string[] }> = {
  diving: {
    dos: [
      'مارس الطفو المحايد للحفاظ على مسافة آمنة من الشعاب المرجانية الهشة.',
      'ضع واقي الشمس الصديق للبيئة قبل 30 دقيقة على الأقل من نزول الماء.',
      'أظهر تقديرك بطاقم القارب بإعطائهم إكرامية (البقشيش عادة مقدرة جداً).'
    ],
    donts: [
      'لا تلمس أو تطأ الشعاب المرجانية الحية مطلقاً. لمسة واحدة قد تدمر عقوداً من النمو.',
      'لا تجمع الصدف أو قطع المرجان المستحاثة أو الآثار من المحميات البحرية.',
      'لا تطعم أو تطارد الكائنات البحرية البرية؛ دعها تسبح بحرية.'
    ]
  },
  desert: {
    dos: [
      'ارتدِ دائماً أحذية مغلقة لحماية قدميك من الرمال الساخنة والأشواك.',
      'اطلب الإذن دائماً قبل التقاط صور للمضيفين البدو أو الجمال.',
      'اشرب الماء باستمرار، حتى لو لم تشعر بالعطش؛ فالهواء الصحراوي يجفف العرق فوراً.'
    ],
    donts: [
      'لا تترك النفايات أو القمامة. حافظ على الكثبان الصحراوية ناصعة النقاء.',
      'لا تبتعد بمفردك خارج حدود المخيم المحددة، خاصة بعد غروب الشمس.',
      'تجنب حركات القيادة السريعة بالبيتش باجي التي تثير الغبار بالقرب من مسارات الجمال.'
    ]
  },
  temples: {
    dos: [
      'ارتدِ ملابس محتشمة تغطي الكتفين والركبتين عند دخول المعابد والمقابر.',
      'احتفظ بفئات صغيرة من الجنيه المصري معك للإكراميات والخدمات.',
      'احمل نفاياتك معك حتى تجد سلة القمامة المناسبة.'
    ],
    donts: [
      'لا تلمس أو تتكئ أو تخرب النقوش الأثرية أو الجداريات الملونة.',
      'يُمنع منعاً باتاً التصوير بالفلاش داخل المقابر؛ فالضوء الساطع يتلف الألوان الأثرية.',
      'لا تتسلق أو تجلس على المذابح الحجرية القديمة أو الجدران أو التماثيل.'
    ]
  }
};

const FAQ_DATA_PL: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'equipment',
    question: 'Jaki sprzęt do nurkowania jest zapewniany i co muszę ze sobą zabrać?',
    glyph: '𓆛',
    answer: 'Zapewniamy cały podstawowy sprzęt do nurkowania, w tym butle 12L, wysokiej jakości automaty oddechowe, kamizelki BCD oraz pianki (o grubości 3 mm lub 5 mm). Jedyne, co musisz zabrać, to strój kąpielowy oraz fizyczną lub cyfrową licencję nurkową. Jeśli używasz maski korekcyjnej, gorąco zalecamy zabranie własnej, aby w pełni podziwiać rafę koralową!',
    loreQuote: 'Morze Czerwone jest niezwykle przejrzyste, ale odpowiedni sprzęt zapewnia bezpieczne i komfortowe nurkowanie.',
    highlights: ['Podstawowy sprzęt w cenie', 'Dostępne pianki 3mm i 5mm', 'Zabierz tylko strój i licencję']
  },
  {
    id: 'faq-2',
    category: 'equipment',
    question: 'W co powinienem się ubrać na pustynne safari i oglądanie gwiazd?',
    glyph: '𓅓',
    answer: 'Pustynia jest bardzo słoneczna i ciepła w ciągu dnia, ale po zachodzie słońca robi się zaskakująco zimno! Zalecamy noszenie luźnej, lekkiej odzieży z długim rękawem, aby ochronić się przed słońcem. Upewnij się, że masz na sobie wygodne buty z zakrytymi palcami, takie jak adidasy lub buty trekkingowe (sandały są zabronione ze względów bezpieczeństwa). Otrzymasz od nas bezpłatną bawełnianą chustę na głowę i gogle ochronne, aby chronić twarz przed pyłem podczas jazdy na quadach.',
    loreQuote: 'Ubieraj się warstwowo na pustyni. Ochrona przed słońcem w dzień, ciepłe warstwy w nocy.',
    highlights: ['Wymagane zakryte buty', 'Lekka odzież z długim rękawem', 'Darmowa chusta i gogle']
  },
  {
    id: 'faq-3',
    category: 'seasons',
    question: 'Kiedy jest najlepsza pora roku na nurkowanie w Morzu Czerwonym?',
    glyph: '𓊟',
    answer: 'Nurkowanie tutaj jest świetne przez cały rok! Jeśli jednak zależy Ci na absolutnie najlepszej widoczności (często przekraczającej 30 metrów) i przyjemnie ciepłej wodzie (od 26°C do 29°C), zalecamy wizytę od końca września do listopada lub wiosną od kwietnia do czerwca. Jeśli chcesz zobaczyć ławice rekinów młotów, gorące letnie miesiące (lipiec i siepień) są na to najlepszym czasem.',
    loreQuote: 'Wiosna i jesień oferują najczystszą wodę i najbardziej komfortową pogodę.',
    highlights: ['Wrzesień–Listopad: najlepsza widoczność', 'Lipiec–Sierpień: sezon na rekiny młoty', 'Temperatura wody: od 21°C (zima) do 29°C (lato)']
  },
  {
    id: 'faq-4',
    category: 'seasons',
    question: 'Czy rejs po Nilu jest komfortowy podczas gorących letnich miesięcy?',
    glyph: '𓊡',
    answer: 'Tak! Nasze statki wycieczkowe mają doskonałą, nowoczesną klimatyzację w całym obiekcie, a także ładne, zacienione pokłady zewnętrzne i baseny, które pomogą Ci się ochłodzić. Choć w południe w Luksorze temperatura może przekraczać 40°C, wszystkie wycieczki do świątyń planujemy na wczesny poranek (około 5:30) lub późne popołudnie. Dzięki temu unikasz południowego upału i podziwiasz zabytki w pięknym złotym świetle.',
    loreQuote: 'Unikamy południowego upału dzięki mądremu planowaniu, pozostawiając popołudnia na relaks przy basenie.',
    highlights: ['Pełna klimatyzacja na pokładzie', 'Chłodne poranne zwiedzanie', 'Relaks przy basenie w południe']
  },
  {
    id: 'faq-5',
    category: 'history',
    question: 'Czy potrzebuję biletów lub pozwoleń na robienie zdjęć w grobowcach?',
    glyph: '𓉐',
    answer: 'Tak, zajmujemy się rezerwacją standardowych biletów wstępu, które obejmują wejście do trzech głównych grobowców, np. w Dolinie Królów. Niektóre słynne grobowce, jak Tutanchamona czy Setiego I, wymagają dodatkowych, indywidualnych biletów – po prostu daj nam znać 48 godzin wcześniej, a my je dla Ciebie zorganizujemy. W większości grobowców można robić zdjęcia smartfonem bezpłatnie, ale profesjonalne aparaty i statywy są zabronione bez drogiego komercyjnego pozwolenia.',
    loreQuote: 'Smartfony świetnie nadają się do bezpłatnego uwieczniania wspomnień, ale wyłącz flesz, aby chronić starożytne malowidła.',
    highlights: ['Zarezerwujemy standardowe bilety', 'Tutanchamon wymaga dodatkowego bilet', 'Darmowe zdjęcia smartfonem (bez flesza)']
  },
  {
    id: 'faq-6',
    category: 'history',
    question: 'Czy przy zwiedzaniu świątyń i starożytnych miejsc obowiązują zasady dotyczące ubioru?',
    glyph: '𓋹',
    answer: 'Tak. Mimo że są to historyczne miejsca na świeżym powietrzu, wciąż pozostają one bardzo szanowanymi zabytkami kulturowymi. Prosimy zarówno mężczyzn, jak i kobiety o noszenie skromnego ubioru zakrywającego ramiona i kolana. Lekka chusta jest bardzo przydatna do ochrony przed słońcem, a wygodne buty do chodzenia są absolutnie niezbędne na nierównych kamiennych ścieżkach.',
    loreQuote: 'Ubieraj się z szacunkiem dla lokalnej kultury i chroń się przed gorącym słońcem.',
    highlights: ['Zakryj ramiona i kolana', 'Solidne buty to podstawa', 'Zabierz lekką chustę do ochrony przed słońcem']
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'Czy woda z kranu jest bezpieczna do picia i jak dbać o nawodnienie?',
    glyph: '𓎬',
    answer: 'Prosimy nie pić wody z kranu ani wody z Nilu. Zapewniamy nieograniczoną, lodowatą, butelkowaną wodę mineralną we wszystkich naszych busach turystycznych, samochodach transferowych, łodziach i obozach pustynnych całkowicie bezpłatnie. Zalecamy picie od 3 do 4 litrów wody dziennie, aby zachować zdrowie na pustyni. Nasi przewodnicy mają ze sobą apteczki i sole nawadniające na wypadek odwodnienia.',
    loreQuote: 'Pij dużo butelkowanej wody mineralnej, aby zachować energię pod egipskim słońcem.',
    highlights: ['Nie pij wody z kranu ani z Nilu', 'Nielimitowana darmowa woda butelkowana', 'Zestawy nawadniające na każdej wycieczce']
  }
];

const BASE_PACKING_DATA_PL: Record<EnvironmentType, string[]> = {
  diving: [
    'Strój kąpielowy / kąpielówki / bikini (zabierz 2 komplety)',
    'Biodegradowalny krem z filtrem przyjazny dla rafy (SPF 50+)',
    'Wodoodporna sucha torba na pokład łodzi',
    'Własna maska do nurkowania (korekcyjna, jeśli potrzebna)',
    'Fizyczna lub cyfrowa licencja nurkowa oraz logbook',
    'Lekkie sandały lub japonki'
  ],
  desert: [
    'Solidne, zakryte buty sportowe lub trekkingowe (sandały są niedozwolone)',
    'Lekkie, przewiewne koszule z długim rękawem (ochrona przed słońcem i pyłem)',
    'Okulary przeciwsłoneczne z polaryzacją i wysokim filtrem UV',
    'Bawełniana chusta / bandana (ochrona przed wiatrem i piaskiem)',
    'Odprowadzające wilgoć skarpety sportowe',
    'Balsam do ust z filtrem UV i intensywny krem nawilżający'
  ],
  temples: [
    'Skromny ubiór (ramiona i kolana zakryte przy zwiedzaniu świątyń i grobowców)',
    'Kapelusz z szerokim rondem lub lniana czapka',
    'Niezwykle wygodne buty z dobrym wsparciem stopy',
    'Środek do dezynfekcji rąk i kieszonkowe chusteczki nawilżane',
    'Drobna gotówka (monety i małe banknoty EGP na toalety itp.)',
    'Kompaktowy parasol podróżny jako osobisty cień'
  ]
};

const SEASONAL_PACKING_DATA_PL: Record<SeasonType, string[]> = {
  spring_autumn: [
    'Lekka kurtka lub narzutka na chłodne wieczorne wiatry',
    'Uniwersalne warstwy odzieży ze względu na duże wahania temperatur między dniem a nocą (ubiór na cebulkę)'
  ],
  summer: [
    'Przenośny wiatraczek z mgiełką wodną',
    'Saszetki z elektrolitami do rozpuszczania w wodzie',
    'Ręcznik chłodzący z ochroną UV',
    'Wysokiej jakości krem z filtrem (nakładać ponownie co 2 godziny)'
  ],
  winter: [
    'Ciepła bluza polarowa lub lekka kurtka puchowa na chłodne pustynne noce',
    'Ciepły szal pashmina lub chusta podróżna',
    'Bielizna termoaktywna, jeśli planujesz nocne biwakowanie pod gwiazdami'
  ]
};

const ETIQUETTE_DATA_PL: Record<EnvironmentType, { dos: string[]; donts: string[] }> = {
  diving: {
    dos: [
      'Ćwicz neutralną pływalność, aby zachować bezpieczną odległość od delikatnych raf koralowych.',
      'Nałóż biodegradowalny krem z filtrem co najmniej 30 minut przed wejściem do wody.',
      'Okaż wdzięczność, dając napiwek załodze łodzi (Bakszysz jest zwyczajowy i bardzo ceniony).'
    ],
    donts: [
      'Nigdy nie dotykaj, nie stawaj ani nie kop żywych koralowców. Jedno dotknięcie może zniszczyć dekady wzrostu.',
      'Nie zbieraj muszli, skamieniałych kawałków koralowców ani artefaktów z morskich parków narodowych.',
      'Nigdy nie karm ani nie próbuj gonić dzikich stworzeń morskich; pozwól im pływać swobodnie.'
    ]
  },
  desert: {
    dos: [
      'Zawsze noś solidne buty z zakrytymi palcami, aby chronić się przed gorącym piaskiem, kolcami czy fauną pustynną.',
      'Zawsze pytaj o zgodę przed zrobieniem zdjęcia beduińskim gospodarzom, opiekunom zwierząt czy wielbłądom.',
      'Pij wodę regularnie, nawet jeśli nie czujesz pragnienia; suche pustynne powietrze natychmiast odparowuje pot.'
    ],
    donts: [
      'Nie śmieć. Pozostaw nieskazitelne pustynne wydmy całkowicie nietknięte.',
      'Nigdy nie oddalaj się samotnie poza oznaczony teren obozu, szczególnie po zachodzie słońca.',
      'Unikaj szybkiej jazdy na quadach, która wzbija niepotrzebne chmury kurzu w pobliżu tras wielbłądów.'
    ]
  },
  temples: {
    dos: [
      'Ubieraj się skromnie, zakrywając ramiona i kolana podczas wchodzenia do zabytkowych świątyń i grobowców.',
      'Miej przy sobie drobne banknoty funta egipskiego (EGP) na napiwki i drobne opłaty.',
      'Noś swoje śmieci ze sobą, dopóki nie znajdziesz odpowiedniego kosza.'
    ],
    donts: [
      'Nigdy nie dotykaj, nie opieraj się ani nie drap starożytnych rzeźb, malowideł ściennych ani hieroglificznych filarów.',
      'Absolutny ZAKAZ używania lamp błyskowych w grobowcach. Silne światło błyskowe niszczy zabytkowe pigmenty organiczne.',
      'Nie wspinaj się ani nie siadaj na starożytnych kamiennych ołtarzach, murach, ruinach czy posągach.'
    ]
  }
};

export default function OraclesWisdomFAQ() {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'faq' | 'advice'>('faq');
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>('diving');
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>('spring_autumn');

  const [activeCategory, setActiveCategory] = useState<'all' | 'equipment' | 'seasons' | 'history' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const currentFAQData = language === 'de' ? FAQ_DATA_DE : language === 'pl' ? FAQ_DATA_PL : language === 'ar' ? FAQ_DATA_AR : FAQ_DATA;
  const currentBasePackingData = language === 'de' ? BASE_PACKING_DATA_DE : language === 'pl' ? BASE_PACKING_DATA_PL : language === 'ar' ? BASE_PACKING_DATA_AR : BASE_PACKING_DATA;
  const currentSeasonalPackingData = language === 'de' ? SEASONAL_PACKING_DATA_DE : language === 'pl' ? SEASONAL_PACKING_DATA_PL : language === 'ar' ? SEASONAL_PACKING_DATA_AR : SEASONAL_PACKING_DATA;
  const currentEtiquetteData = language === 'de' ? ETIQUETTE_DATA_DE : language === 'pl' ? ETIQUETTE_DATA_PL : language === 'ar' ? ETIQUETTE_DATA_AR : ETIQUETTE_DATA;

  // Load / save checklist items state from localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('egypt_packing_checklist_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('egypt_packing_checklist_v1', JSON.stringify(checkedItems));
  }, [checkedItems]);

  // Combine baseline and seasonal lists to produce dynamic, context-aware packing lists
  const packingList = useMemo(() => {
    const base = currentBasePackingData[selectedEnv] || [];
    const seasonal = currentSeasonalPackingData[selectedSeason] || [];
    return [...base, ...seasonal];
  }, [selectedEnv, selectedSeason, currentBasePackingData, currentSeasonalPackingData]);

  // Calculate stats for checked list
  const checkedItemsCount = useMemo(() => {
    return packingList.filter(item => checkedItems[item]).length;
  }, [packingList, checkedItems]);

  const packingProgress = useMemo(() => {
    if (packingList.length === 0) return 0;
    return (checkedItemsCount / packingList.length) * 100;
  }, [packingList, checkedItemsCount]);

  // Retrieve context-aware etiquette rules
  const etiquetteRules = useMemo(() => {
    return currentEtiquetteData[selectedEnv] || { dos: [], donts: [] };
  }, [selectedEnv, currentEtiquetteData]);

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const resetChecklist = () => {
    const cleared = { ...checkedItems };
    packingList.forEach(item => {
      cleared[item] = false;
    });
    setCheckedItems(cleared);
  };

  // Filter items based on active category and search query
  const filteredFAQs = useMemo(() => {
    return currentFAQData.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, currentFAQData]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const categories = [
    { value: 'all', label: language === 'de' ? '𓆃 Alle Hilfen' : language === 'pl' ? '𓆃 Wszystkie porady' : '𓆃 All Help', count: currentFAQData.length },
    { value: 'equipment', label: language === 'de' ? '𓅓 Kleidung & Ausrüstung' : language === 'pl' ? '𓅓 Odzież i sprzęt' : '𓅓 Clothing & Gear', count: currentFAQData.filter(f => f.category === 'equipment').length },
    { value: 'seasons', label: language === 'de' ? '𓊟 Beste Reisezeiten' : language === 'pl' ? '𓊟 Najlepsze sezony' : '𓊟 Best Seasons', count: currentFAQData.filter(f => f.category === 'seasons').length },
    { value: 'history', label: language === 'de' ? '𓉐 Tempelregeln' : language === 'pl' ? '𓉐 Zasady świątynne' : '𓉐 Temple Rules', count: currentFAQData.filter(f => f.category === 'history').length },
    { value: 'general', label: language === 'de' ? '𓎬 Hydratation & Gesundheit' : language === 'pl' ? '𓎬 Nawodnienie i zdrowie' : '𓎬 Hydration & Health', count: currentFAQData.filter(f => f.category === 'general').length }
  ];

  return (
    <div className="bg-[#130f0a] border border-[#d4af37]/25 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden" id="oracles-wisdom-section">
      
      {/* Background Pharaonic graphics */}
      <div className="absolute right-4 top-4 text-stone-900/10 font-serif text-9xl select-none pointer-events-none">
        𓂀
      </div>
      <div className="absolute left-4 bottom-4 text-stone-900/10 font-serif text-9xl select-none pointer-events-none">
        𓋹
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.3em] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {t('faq_sub', 'Travel Help & Tips')}
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-black text-[#e6c280] uppercase tracking-wide">
            {t('faq_title', 'Frequently Asked Questions')}
          </h3>
          <p className="text-stone-400 text-xs max-w-lg mx-auto leading-relaxed">
            {t('faq_desc', 'Got questions about diving gear, desert clothing, temple passes, or staying hydrated? We have got you covered with simple, practical answers.')}
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex justify-center" id="faq-view-toggle">
          <div className="bg-[#1a1410] border border-[#d4af37]/25 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setViewMode('faq')}
              className={`px-5 py-2 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'faq'
                  ? 'bg-[#d4af37] text-stone-950 font-black shadow-md shadow-[#d4af37]/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {t('faq_tab_questions', '𓋹 Oracle FAQs')}
            </button>
            <button
              onClick={() => setViewMode('advice')}
              className={`px-5 py-2 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'advice'
                  ? 'bg-[#d4af37] text-stone-950 font-black shadow-md shadow-[#d4af37]/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {t('faq_tab_packing', '𓊟 Packing & Etiquette')}
            </button>
          </div>
        </div>

        {/* FAQ Accordion Mode */}
        {viewMode === 'faq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search Bar & Categories layout */}
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('faq_search', 'Search wisdom archive...')}
                  className="w-full bg-[#1c1611] border border-[#d4af37]/35 rounded-xl py-2.5 pl-10 pr-4 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37] placeholder:text-stone-600 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-500 hover:text-stone-300"
                  >
                    {language === 'de' ? 'Löschen' : language === 'pl' ? 'Wyczyść' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Horizontal scrollable tab buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveCategory(cat.value as any);
                        // Open the first item of the filtered list automatically
                        const items = FAQ_DATA.filter(f => cat.value === 'all' || f.category === cat.value);
                        if (items.length > 0) {
                          setExpandedId(items[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-mono transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#d4af37] text-stone-950 border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/10'
                          : 'bg-[#1a1410] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-stone-950/25 text-stone-950' : 'bg-stone-900 text-stone-500'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-3 pt-2">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-10 text-stone-500 italic text-xs border border-stone-800/80 rounded-xl bg-black/10">
                  {language === 'de' ? '𓀞 Wir konnten keine Themen finden, die Ihrer Suche entsprechen. Versuchen Sie es mit anderen Begriffen.' : language === 'pl' ? '𓀞 Nie znaleziono tematów pasujących do wyszukiwania. Spróbuj użyć innych słów kluczowych.' : '𓀞 We could not find any topics matching your search. Try searching for other keywords.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredFAQs.map((faq) => {
                    const isExpanded = expandedId === faq.id;
                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? 'border-[#d4af37] bg-[#1e150f]'
                            : 'border-stone-850 bg-[#16110c]/80 hover:border-stone-750'
                        }`}
                      >
                        
                        {/* FAQ Accordion Header */}
                        <button
                          onClick={() => toggleExpand(faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg bg-[#241c14] border border-[#d4af37]/25 w-8 h-8 rounded-full flex items-center justify-center text-[#d4af37] select-none font-serif shadow-sm">
                              {faq.glyph}
                            </span>
                            <span className={`font-serif text-sm font-bold uppercase tracking-wide transition-colors ${
                              isExpanded ? 'text-[#e6c280]' : 'text-stone-300 hover:text-stone-100'
                            }`}>
                              {faq.question}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${
                            isExpanded ? 'transform rotate-180 text-[#d4af37]' : ''
                          }`} />
                        </button>

                        {/* FAQ Accordion Body */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                              <div className="px-4 pb-4 pt-1 space-y-4 border-t border-stone-900/50">
                                
                                {/* Answer Text */}
                                <p className="text-stone-300 text-xs leading-relaxed font-sans">
                                  {faq.answer}
                                </p>

                                {/* Lore Quote snippet */}
                                {faq.loreQuote && (
                                  <div className="bg-[#2a1e14]/40 border border-[#d4af37]/15 rounded-xl p-3 text-[11px] text-[#e6c280]/90 italic relative overflow-hidden pl-8">
                                    <span className="absolute left-3 top-3.5 text-[#d4af37]/55 text-base select-none font-serif">𓂀</span>
                                    <strong className="not-italic block text-[9px] uppercase font-mono tracking-wider text-[#d4af37] mb-0.5">
                                      {language === 'de' ? 'Schneller Reisetipp:' : language === 'pl' ? 'Szybka porada:' : 'Quick Travel Tip:'}
                                    </strong>
                                    "{faq.loreQuote}"
                                  </div>
                                )}

                                {/* Highlight Bullet badges */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {faq.highlights.map((highlight, index) => (
                                    <span
                                      key={index}
                                      className="text-[9px] font-mono uppercase bg-[#140f0b] border border-stone-800 text-stone-400 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/80 animate-ping"></span>
                                      {highlight}
                                    </span>
                                  ))}
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Traveler's Advice Section */}
        {viewMode === 'advice' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pt-2"
            id="traveler-advice-panel"
          >
            {/* Introduction */}
            <div className="text-center bg-[#1c1611]/80 border border-[#d4af37]/15 rounded-xl p-4">
              <p className="text-xs text-stone-300 leading-relaxed max-w-2xl mx-auto">
                {language === 'de' 
                  ? '𓋹 Bereiten Sie Ihre Karawane mit der richtigen Ausrüstung vor und respektieren Sie die heiligen Bräuche Ägyptens. Wählen Sie Ihre Aktivität und Jahreszeit, um eine maßgeschneiderte Packliste und einen kulturellen Knigge zu erstellen.'
                  : language === 'pl'
                  ? '𓋹 Przygotuj swoją karawanę, zabierając odpowiedni sprzęt, i szanuj święte zwyczaje Egiptu. Wybierz środowisko i porę roku, aby wygenerować spersonalizowaną listę rzeczy do spakowania i przewodnik po etykiecie kulturowej.'
                  : '𓋹 Prepare your mortal caravan with the right equipment and respect the sacred ways of Egypt. Select your intended environment and season to generate a customized packing list and cultural etiquette guide.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Selectors & Dynamic Packing List Checklist */}
              <div className="md:col-span-6 space-y-6">
                
                {/* Selectors card */}
                <div className="bg-[#1a1410] border border-[#d4af37]/20 rounded-xl p-4 space-y-4">
                  <h4 className="font-serif text-xs font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#d4af37]" />
                    {language === 'de' ? '1. Reiseparameter' : language === 'pl' ? '1. Parametry podróży' : '1. Voyage Parameters'}
                  </h4>

                  {/* Environment select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">{language === 'de' ? 'Umgebung / Aktivität' : language === 'pl' ? 'Środowisko / Aktywność' : 'Environment / Activity'}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'diving', label: language === 'de' ? '𓆛 Tauchen' : language === 'pl' ? '𓆛 Nurkowanie' : '𓆛 Diving', icon: Waves },
                        { value: 'desert', label: language === 'de' ? '𓅓 Wüste' : language === 'pl' ? '𓅓 Pustynia' : '𓅓 Desert', icon: Compass },
                        { value: 'temples', label: language === 'de' ? '𓉐 Tempel' : language === 'pl' ? '𓉐 Świątynie' : '𓉐 Temples', icon: BookOpen }
                      ].map((env) => {
                        const IconComp = env.icon;
                        const isSelected = selectedEnv === env.value;
                        return (
                          <button
                            key={env.value}
                            onClick={() => setSelectedEnv(env.value as EnvironmentType)}
                            className={`py-2 px-1 rounded-lg border text-[10px] font-mono uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#e6c280]'
                                : 'bg-[#140f0c] border-stone-850 text-stone-500 hover:text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            <span>{env.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Season select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">{language === 'de' ? 'Saison / Jahreszeit' : language === 'pl' ? 'Pora roku' : 'Season'}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'spring_autumn', label: language === 'de' ? '𓊟 Frühling/Herbst' : language === 'pl' ? '𓊟 Wiosna/Jesień' : '𓊟 Spring/Fall', icon: Calendar },
                        { value: 'summer', label: language === 'de' ? '𓊡 Sommer' : language === 'pl' ? '𓊡 Lato' : '𓊡 Summer', icon: Sparkles },
                        { value: 'winter', label: language === 'de' ? '𓎬 Winter' : language === 'pl' ? '𓎬 Zima' : '𓎬 Winter', icon: Shield }
                      ].map((seas) => {
                        const IconComp = seas.icon;
                        const isSelected = selectedSeason === seas.value;
                        return (
                          <button
                            key={seas.value}
                            onClick={() => setSelectedSeason(seas.value as SeasonType)}
                            className={`py-2 px-1 rounded-lg border text-[10px] font-mono uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#e6c280]'
                                : 'bg-[#140f0c] border-stone-850 text-stone-500 hover:text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            <span>{seas.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dynamic Packing Checklist */}
                <div className="bg-[#1a1410] border border-[#d4af37]/20 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-xs font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2">
                      <Luggage className="w-4 h-4 text-[#d4af37]" />
                      {language === 'de' ? '2. Heilige Packliste' : language === 'pl' ? '2. Święta lista pakowania' : '2. Sacred Packing List'} ({checkedItemsCount}/{packingList.length})
                    </h4>
                    {checkedItemsCount > 0 && (
                      <button
                        onClick={resetChecklist}
                        className="text-[9px] font-mono uppercase text-stone-500 hover:text-[#d4af37] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> {language === 'de' ? 'Zurücksetzen' : language === 'pl' ? 'Resetuj' : 'Reset'}
                      </button>
                    )}
                  </div>

                  {/* Checklist Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-850">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-600 to-[#d4af37]"
                        style={{ width: `${packingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-stone-500 uppercase tracking-widest">
                      <span>{language === 'de' ? 'Schiff Leer' : language === 'pl' ? 'Karawana pusta' : 'Vessel Empty'}</span>
                      <span>{Math.round(packingProgress)}% {language === 'de' ? 'vorbereitet' : language === 'pl' ? 'przygotowano' : 'Prepared'}</span>
                    </div>
                  </div>

                  {/* Checked items list */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-950">
                    {packingList.map((item, idx) => {
                      const isChecked = checkedItems[item] || false;
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheckItem(item)}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#1f1913] border-[#d4af37]/30 opacity-60'
                              : 'bg-[#130f0b] border-stone-850 hover:border-[#d4af37]/15'
                          }`}
                        >
                          <button
                            type="button"
                            className="text-[#d4af37] focus:outline-none flex-shrink-0 mt-0.5"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 fill-[#d4af37]/10" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-stone-700" />
                            )}
                          </button>
                          <span className={`text-[11px] font-sans transition-colors ${isChecked ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Cultural Etiquette */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                
                <div className="bg-[#1a1410] border border-[#d4af37]/20 rounded-xl p-4 flex-grow space-y-4">
                  <div className="border-b border-[#d4af37]/15 pb-2.5">
                    <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-[0.2em] block">{language === 'de' ? 'Pharaonischer Anstand' : language === 'pl' ? 'Faraońska etykieta' : 'Pharaonic Decorum'}</span>
                    <h4 className="font-serif text-sm font-bold text-[#e6c280] uppercase tracking-wide flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#d4af37]" />
                      {language === 'de' ? '3. Kulturelle Etikette & Bräuche' : language === 'pl' ? '3. Etykieta kulturowa i zwyczaje' : '3. Cultural Etiquette & Customs'}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    
                    {/* DOs Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{language === 'de' ? "Der Pfad der Ma'at (Gebote)" : language === 'pl' ? "Droga Ma'at (Święte nakazy)" : "The Path of Ma'at (Sacred Do's)"}</span>
                      </div>
                      <div className="space-y-2">
                        {etiquetteRules.dos.map((doTip, idx) => (
                          <div key={idx} className="bg-[#141d16]/30 border border-emerald-950/40 rounded-lg p-2.5 flex gap-2.5 items-start">
                            <span className="text-emerald-500 font-serif text-[10px] mt-0.5 select-none">𓋹</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed font-sans">{doTip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DONTs Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                        <span>{language === 'de' ? "Der Pfad des Chaos (Verbote)" : language === 'pl' ? "Droga Chaosu (Święte zakazy)" : "The Path of Chaos (Sacred Don'ts)"}</span>
                      </div>
                      <div className="space-y-2">
                        {etiquetteRules.donts.map((dontTip, idx) => (
                          <div key={idx} className="bg-[#241311]/30 border border-red-950/40 rounded-lg p-2.5 flex gap-2.5 items-start">
                            <span className="text-red-500 font-serif text-[10px] mt-0.5 select-none">𓅓</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed font-sans">{dontTip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Informational Tip Banner */}
                <div className="bg-[#1e1711] border border-dashed border-[#d4af37]/20 rounded-xl p-3.5 flex gap-3 items-start">
                  <Info className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider block">{language === 'de' ? 'Allgemeiner Rat' : language === 'pl' ? 'Uniwersalna porada' : 'Universal Advice'}</span>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                      {language === 'de'
                        ? <>In Ägypten ist Gastfreundschaft ein Eckpfeiler des täglichen Lebens. Eine freundliche, geduldige Haltung und ein herzliches <span className="text-stone-200 font-serif italic">"Shukran"</span> (Danke) öffnen Ihnen auf Ihrer Reise viele Herzen und Türen.</>
                        : language === 'pl'
                        ? <>W Egipcie gościnność jest fundamentem codziennego życia. Okazywanie życzliwości, cierpliwości i wyrażanie wdzięczności ciepłym słowem <span className="text-stone-200 font-serif italic">"Shukran"</span> (Dziękuję) otworzy przed Tobą wiele serc i drzwi podczas podróży.</>
                        : <>In Egypt, hospitality is a cornerstone of daily life. Showing a friendly, patient attitude and expressing gratitude with a warm <span className="text-stone-200 font-serif italic">"Shukran"</span> (Thank you) will open many hearts and doors on your voyage.</>}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* Footer help note */}
        <div className="bg-[#1a140f] border border-[#d4af37]/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-stone-500 font-mono">
            {language === 'de'
              ? '𓋹 Benötigen Sie weitere Hilfe? Fragen Sie unseren freundlichen KI-Reiseassistenten im Chat oben!'
              : language === 'pl'
              ? '𓋹 Potrzebujesz więcej pomocy? Zapytaj naszego asystenta podróży AI na czacie powyżej!'
              : '𓋹 Need more help? Ask our friendly AI Travel Assistant in the chat above!'}
          </p>
        </div>

      </div>

    </div>
  );
}
