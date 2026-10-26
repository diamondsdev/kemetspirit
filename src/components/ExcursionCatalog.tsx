import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldAlert, CheckCircle, Clock, MapPin, Sparkles, Filter, ChevronRight, X, User, Mail, Calendar, HelpCircle, MessageSquare, Send, ThumbsUp, PenTool, FileSpreadsheet, RefreshCw, Phone, Building } from 'lucide-react';
import { Excursion, Booking } from '../types';
import { useLanguage } from './LanguageContext';
import ReviewSystem from './ReviewSystem';
import PromotionalBanner from './PromotionalBanner';
import { getAccessToken, googleSignIn } from '../lib/firebaseAuth';

// Let's use our exact generated image paths!
export const EXCURSIONS_DATA: Excursion[] = [
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

export const EXCURSIONS_DATA_DE: Excursion[] = [
  {
    id: 'diving-1',
    title: "Ras Mohammed Königliches Korallentauchen",
    tagline: "Erforschen Sie die versunkenen Statuen des Meeresgottes Nun",
    category: 'diving',
    duration: "Ganztägig (8 Stunden)",
    price: 120,
    rating: 4.9,
    location: "Rotes Meer, Ägypten (Ras-Mohammed-Nationalpark)",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    description: "Tauchen Sie ein in das tief türkisfarbene Reich von Nun, dem Urgewässer der ägyptischen Mythologie. Dieser von Fachleuten geführte Tauchausflug führt Sie an vertikalen Korallenwänden, Hammerhai-Schutzgebieten und einem atemberaubenden, im Meeresboden ruhenden Feld aus handgemeißelten pharaonischen Steinmonumenten vorbei.",
    inclusions: [
      "Hochwertige Tauchausrüstung (Flaschen, Neoprenanzüge, Atemregler)",
      "Zwei tiefe Tauchgänge mit zertifizierten ägyptischen Ägyptologen-Tauchern",
      "Traditionelles Mittagessen auf einer Yacht, zubereitet von Beduinen",
      "Hoteltransfer ab Hurghada oder Sharm El Sheikh"
    ],
    highlights: [
      "Schwimmen Sie mit riesigen Napoleon-Fischen & Meeresschildkröten",
      "Enthüllen Sie das Unterwasser-Heiligtum von Anubis & Ramses",
      "Professionelles Unterwasservideo- und Fotopaket inklusive"
    ],
    ancientLore: "Antike Priester des Roten Meeres schrieben über 'Nun' – die Quelle allen Lebens. Sie glaubten, dass untergetauchte Steinstatuen die Geister des Ozeans besänftigten und so eine sichere Passage für die Handelskarawanen von Königin Hatschepsut in das mythische Land Punt garantierten."
  },
  {
    id: 'safari-1',
    title: "Sets Goldene Deshret-Safari",
    tagline: "Rasen Sie mit Quad-Bikes und reiten Sie Kamele über rote Dünen",
    category: 'safari',
    duration: "Halbtägig (6 Stunden)",
    price: 75,
    rating: 4.8,
    location: "Sinai-Wüste, Ägypten (Hurghada-Umgebung)",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    description: "Rasen Sie mit leistungsstarken Quad-Bikes über sanfte Sandwellen, bevor Sie in das majestätische Tempo einer traditionellen Kamelkarawane wechseln. Schließen Sie Ihre Reise in einer abgeschiedenen, von Fackeln erleuchteten Beduinen-Oase ab, wo Sie Hibiskustee, Lagerfeuergeschichten und faszinierende Himmelsbeobachtungen durch Hochleistungsteleskope im Reich von Nut genießen.",
    inclusions: [
      "Premium-Quad (ATV) und vollständige Sicherheitsausrüstung",
      "Traditioneller 30-minütiger Kamelritt bei Sonnenaufgang oder Sonnenuntergang",
      "Festmahl im Beduinen-Camp mit Fladenbrot-Backkurs",
      "Teleskop-Sternebeobachtung und Vortrag über Himmelsausrichtung durch Ägyptologen"
    ],
    highlights: [
      "Beherrschen Sie hohe Sanddünen mit 50 km/h auf dem Quad",
      "Hören Sie Beduinen-Rababa-Melodien am offenen Akazienfeuer",
      "Verfolgen Sie die Konstellation Sah (Orion) unter Anleitung unserer Sternenbeobachter"
    ],
    ancientLore: "Die rote Wüste wurde von den Pharaonen 'Deshret' genannt und von Set, dem Gott der Stürme, beherrscht. Antike Bergleute durchquerten diese Dünen unter dem Schutz der königlichen Bogenschützen, um Kupfer und Türkis im Sinai zu gewinnen. Sie markierten wichtige Felsen mit Kartuschen, um ihre sichere Rückkehr zu gewährleisten."
  },
  {
    id: 'history-1',
    title: "Pharaonische Pilgerreise nach Waset (Luxor)",
    tagline: "Öffnen Sie die Gräber im Tal der Könige & Karnak",
    category: 'history',
    duration: "Ganztägig (14 Stunden)",
    price: 180,
    rating: 4.95,
    location: "Luxor (Antikes Waset), Ägypten",
    image: "/src/assets/images/egypt_luxor_temple_1784070393047.jpg",
    description: "Durchqueren Sie die Sinai-Berge zum fruchtbaren Nil-Tal. Kommen Sie an im antiken Waset (Luxor), der Hauptstadt des Neuen Reiches. Schlendern Sie durch die riesigen Säulenhallen von Karnak, steigen Sie hinab in die bemalten königlichen Gewölbe des Tals der Könige und staunen Sie vor den kolossalen Memnonkolossen.",
    inclusions: [
      "Privater Transport in einer Luxus-Kutsche (Mercedes Minibus) von der Küste",
      "VIP-Eintrittskarten für 3 Königsgräber im Tal der Könige",
      "Geführte Besichtigung der Tempel von Karnak und Hatschepsut",
      "Traditionelles ägyptisches Mittagessen auf einer privaten Nil-Insel"
    ],
    highlights: [
      "Berühren Sie die Hieroglyphen der riesigen Hypostylhalle in Karnak",
      "Steigen Sie in die Grabkammer von Tutanchamun hinab",
      "Malerische Bootsfahrt mit einer Feluke auf dem lebensspendenden Nil bei Sonnenuntergang"
    ],
    ancientLore: "Vom Ostufer zum Westufer von Luxor überzusetzen bedeutet, den Schleier zwischen den Lebenden und den Toten zu durchschreiten. Die Pharaonen meißelten ihre Gräber tief in die Felsspalten der Berge, passend zum Untergang von Ra, um die Auferstehung in den ewigen Gefilden von Aaru zu sichern."
  },
  {
    id: 'boat-1',
    title: "Sobeks Königliche Königin-Nefertari-Kreuzfahrt",
    tagline: "Segeln Sie an der Giftun-Insel vorbei auf unserer edlen Yacht",
    category: 'boat',
    duration: "Ganztägig (7 Stunden)",
    price: 95,
    rating: 4.85,
    location: "Hurghada, Rotes Meer, Ägypten",
    image: "/src/assets/images/egypt_boat_trip_1784071711626.jpg",
    description: "Segeln Sie in absolutem Luxus auf dem schimmernden türkisfarbenen Reich von Sobek. Entspannen Sie sich auf den zweistöckigen Sonnendecks unserer königlichen Holzyacht, während wir in Richtung Giftun-Insel fahren. Schlemmen Sie bei einem frischen Meeresfrüchte-Bankett, das von Ihren privaten Bordköchen zubereitet wird, schwimmen Sie in unberührten Lagunen und schnorcheln Sie an bunten Riffen.",
    inclusions: [
      "Hochwertige Schnorchelausrüstung und Sicherheitswesten",
      "Gourmet-Meeresfrüchte und traditionelles Mezze-Buffet, an Bord zubereitet",
      "Unbegrenzt frische Säfte, ägyptischer Kaffee und Beduinen-Minztee",
      "VIP-Transfer im klimatisierten Van hin und zurück"
    ],
    highlights: [
      "Schnorcheln Sie in den glasklaren Lagunen der Giftun Orange Bay",
      "Sonnensegeln auf bequemen, goldenen Leder-Liegen",
      "Sichten Sie verspielte Delfine, die vor dem Schiffsbug tanzen"
    ],
    ancientLore: "Der Nil und die Meere wurden von Sobek, dem Schutzpatron des Wassers und der Fruchtbarkeit, bewacht. Antike ägyptische Könige ließen mit Blattgold verzierte Zedernholz-Lustboote zu Wasser, um die Wassergeister zu ehren. Sie glaubten, eine fröhliche Seereise sichere eine gute Ernte und die Gunst von Osiris."
  },
  {
    id: 'speedboat-1',
    title: "Horus' Falkenauge-Schnellbootfahrt",
    tagline: "Erleben Sie Adrenalin bei hohen Geschwindigkeiten zu geheimen Inseln",
    category: 'speedboat',
    duration: "Halbtägig (4 Stunden)",
    price: 150,
    rating: 4.9,
    location: "El Gouna & Rotes Meer Inseln, Ägypten",
    image: "/src/assets/images/egypt_speedboat_1784071721552.jpg",
    description: "Fliegen Sie über die Wellen des Roten Meeres wie der Himmelsfalke Horus. Mit diesem erstklassigen Schnellboot-Ausflug umgehen Sie die langsamen Yachten und tauchen direkt an den abgelegensten, unberührtesten Riffen des Roten Meeres auf. Gestalten Sie Ihre eigene Route, halten Sie an unbewohnten Sandbänken und erleben Sie den Rausch des schnellen Transports.",
    inclusions: [
      "Privates Luxus-Schnellboot mit professionellem Kapitän",
      "Premium-Schnorchelausrüstung und Unterwasser-Actionkameras",
      "Feine Erfrischungen und eisgekühlter Bio-Hibiskus-Elixiertrank",
      "VIP-Abholung vom Hotel mit einer privaten modernen Limousine"
    ],
    highlights: [
      "Fliegen Sie mit aufregender Geschwindigkeit über das türkisfarbene Wasser",
      "Private Zwischenstopps an einsamen Sandbänken zum ungestörten Schwimmen",
      "Erkunden Sie versteckte Korallengärten, die der breiten Öffentlichkeit unbekannt sind"
    ],
    ancientLore: "Horus, der falkenköpfige Herr der Lüfte, was berühmt für seine Schnelligkeit und seinen scharfen Blick. Pharaonische Späher benutzten wendige Schilfboote, um die Küsten mit falkenartiger Geschwindigkeit zu patrouillieren und den königlichen Tempeln Signale mittels reflektierten Lichts zu senden."
  }
];

export const EXCURSIONS_DATA_AR: Excursion[] = [
  {
    id: 'diving-1',
    title: "الغوص الملكي بين الشعاب المرجانية في رأس محمد",
    tagline: "استكشف التماثيل الغارقة لإله البحر نون",
    category: 'diving',
    duration: "يوم كامل (8 ساعات)",
    price: 120,
    rating: 4.9,
    location: "البحر الأحمر، مصر (محمية رأس محمد الوطنية)",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    description: "انغمس في أعماق مملكة نون الفيروزية، المياه الأزلية في الأساطير المصرية القديمة. تأخذك هذه الرحلة الاحترافية للغوص بجوار الجدران المرجانية العمودية، ومحميات قرش المطرقة، وحقل مذهل من التماثيل الحجرية الفرعونية المنحوتة يدوياً والمستقرة في قاع البحر.",
    inclusions: [
      "جميع معدات الغوص عالية الجودة (أسطوانات غوص، بدلات، أجهزة تنظيم تنفس)",
      "غطستان عميقتان برفقة غواصين مصريين معتمدين ومتخصصين في علم المصريات",
      "غداء طازج على متن يخت تقليدي مطبوخ بأيدي البدو البحرية",
      "خدمة التوصيل من وإلى الفندق في الغردقة أو شرم الشيخ"
    ],
    highlights: [
      "السباحة بجانب أسماك النابليون العملاقة والسلاحف البحرية",
      "كشف النقاب عن الملاذ الحجري الغارق لأنوبيس ورعمسيس",
      "حزمة تصوير وفيديو احترافية تحت الماء مجاناً"
    ],
    ancientLore: "كتب كاهن البحر الأحمر القدماء عن 'نون' - أصل كل حياة. كانوا يعتقدون أن التماثيل الحجرية المغمورة تهدئ أرواح المحيط، مما يضمن مجرى آمناً للقوافل التجارية للملكة حتشبسوت في طريقها إلى بلاد بونت الأسطورية."
  },
  {
    id: 'safari-1',
    title: "سفاري دشرت الذهبية الخاصة بسيت",
    tagline: "تسابق بالدراجات الرباعية واركب الجمال عبر الكثبان الحمراء",
    category: 'safari',
    duration: "نصف يوم (6 ساعات)",
    price: 75,
    rating: 4.8,
    location: "صحراء سيناء، مصر (ضواحي الغردقة)",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    description: "انطلق بسرعة بالدراجات الرباعية (البيتش باجي) فوق تموجات الرمال الذهبية قبل الانتقال إلى الإيقاع المهيب لقافلة الجمال التقليدية. اختتم رحلتك في واحة بدوية معزولة ومضاءة بالمشاعل، واستمتع بشرب شاي الكركديه، وقصص الأساطير حول النار، ومراقبة النجوم بالتلسكوب تحت سماء نوت الفلكية.",
    inclusions: [
      "دراجة رباعية ممتازة (ATV) مع خوذة ومعدات الأمان",
      "جولة تقليدية على ظهر الجمال لمدة 30 دقيقة عند الشروق/الغروب",
      "وليمة بدوية في مخيم معزول مع ورشة عمل لخبز العيش البديوي",
      "جلسة رصد النجوم بالتلسكوب وشرح الأبراج الفلكية مع عالم مصريات"
    ],
    highlights: [
      "تحدي أمواج الرمال العالية بسرعة 50 كم/ساعة على البيتش باجي",
      "الاستماع إلى ألحان الربابة البدوية حول نيران الحطب الشجرية",
      "تتبع كوكبة الجبار (ساه) تحت إشراف علمائنا الفلكيين"
    ],
    ancientLore: "كان الفراعنة يطلقون على الصحراء الحمراء اسم 'دشرت'، وكان يحكمها سيت إله العواصف. تعبر القوافل والمعدنون هذه الكثبان تحت حراسة رماة الملك لتأمين النحاس والفيروز من سيناء، مع تعليم الصخور بالخرطوش الضامن لعودتهم سالمين."
  },
  {
    id: 'history-1',
    title: "رحلة الفراعنة الأسطورية إلى واسط (الأقصر)",
    tagline: "اكتشف أسرار المقابر الفرعونية في وادي الملوك والكرنك",
    category: 'history',
    duration: "يوم كامل (14 ساعة)",
    price: 180,
    rating: 4.95,
    location: "الأقصر (واسط القديمة)، مصر",
    image: "/src/assets/images/egypt_luxor_temple_1784070393047.jpg",
    description: "سافر عبر سلاسل جبال سيناء والصحراء نحو وادي النيل الخصيب. صل إلى واسط (الأقصر) عاصمة الدولة الحديثة، حيث تتجول في صالات الأعمدة الضخمة بمعبد الكرنك، وتنزل إلى المقابر الملكية المزخرفة في وادي الملوك وتتأمل تمثالي ممنون الشهيرين.",
    inclusions: [
      "تنقلات خاصة بحافلة مرسيدس فاخرة ومكيفة من ساحل البحر الأحمر",
      "تذاكر VIP لدخول 3 مقابر ملكية في وادي الملوك",
      "جولة إرشادية في معبد الكرنك ومعبد حتشبسوت بالدير البحري",
      "غداء مصري تقليدي على جزيرة خاصة في نهر النيل"
    ],
    highlights: [
      "لمس الهيروغليفية في صالة الأعمدة الكبرى بـ الكرنك",
      "الدخول إلى حجرة دفن الملك توت عنخ آمون",
      "جولة نهرية ساحرة بالفلوكة عند غروب الشمس في نهر النيل"
    ],
    ancientLore: "إن العبور من الضفة الشرقية إلى الضفة الغربية للأقصر يعني عبور الحجاب بين عالم الأحياء وعالم الأموات. نحت الفراعنة مقابرهم عميقاً في شقوق الجبال لتتماشى مع غروب الشمس 'رع'، ضماناً للبعث في حقول يارو الأبدية."
  },
  {
    id: 'boat-1',
    title: "رحلة سوبك الملكية على يخت الملكة نفرتاري",
    tagline: "أبحر حول جزيرة جفتون على متن يختنا الذهبي الفاخر",
    category: 'boat',
    duration: "يوم كامل (7 ساعات)",
    price: 95,
    rating: 4.85,
    location: "الغردقة، البحر الأحمر، مصر",
    image: "/src/assets/images/egypt_boat_trip_1784071711626.jpg",
    description: "أبحر بفخامة مطلقة فوق إمبراطورية سوبك الفيروزية المتلألئة. استرخِ على أسرة الشمس المزدوجة بـ يختنا الخشبي الملكي بينما نتجه نحو جزيرة جفتون. استمتع ببوفيه مأكولات بحرية طازجة أعده طهاتنا الخصوصيون، واسبح في الممر الزجاجي والمياه الكريستالية.",
    inclusions: [
      "معدات سنوركلينج عالية الجودة وسترات نجاة",
      "بوفيه فاخر للمأكولات البحرية والمقبلات الباردة والساخنة أعدت طازجة",
      "عصائر طازجة لا محدودة، قهوة مصرية وشاي بالنعناع البدوي",
      "تنقلات VIP بكبائن مكيفة من وإلى الفندق"
    ],
    highlights: [
      "ممارسة السنوركلينج في مياه أورانج باي وجزيرة جفتون البكر",
      "الاستجمام تحت الشمس على أسرة جلدية مذهبة ومريحة",
      "مشاهدة الدلافين البرية وهي تقفز أمام مقدمة اليخت"
    ],
    ancientLore: "كان نهر النيل والبحار يحرسها سوبك، حامي المياه والخصوبة. أطلق الملوك المصريون القدماء قوارب خشبية مذهبة لتكريم أرواح المياه، معتقدين أن الرحلة البحرية المبهجة تضمن حصاداً وفيراً وبركة من أوزوريس."
  },
  {
    id: 'speedboat-1',
    title: "جولة حورس باللانش السريع إلى الجزر السرية",
    tagline: "عش مغامرة السرعة والإثارة إلى أنقى جزر البحر الأحمر",
    category: 'speedboat',
    duration: "نصف يوم (4 ساعات)",
    price: 150,
    rating: 4.9,
    location: "الجونة وجزر البحر الأحمر، مصر",
    image: "/src/assets/images/egypt_speedboat_1784071721552.jpg",
    description: "حلق فوق أمواج البحر الأحمر تماماً كـ صقر السماء حورس. بهذه الرحلة باللانش السريع الخاص تتجاوز اليخوت البطيئة لتبحر مباشرة نحو أنقى الشعاب المرجانية وأكثرها عزلة. صمم خط سيرك الخاص، وتوقف عند الجزر الرملية غير المأهولة وعش متعة الانطلاق السريع.",
    inclusions: [
      "لانش سريع فاخر وخاص مع كابتن محترف",
      "معدات غوص ونظارات سناكرز وكاميرات تصوير تحت الماء",
      "مشروبات منعشة وإكسير الكركديه المبرد بالثلج",
      "توصيل سيارة ليموزين خاصة ومكيفة من الفندق"
    ],
    highlights: [
      "الانطلاق بسرعة مذهلة فوق المياه الفيروزية الساحرة",
      "توقفات خاصة عند شواطئ رملية معزولة للسباحة الخاصة",
      "استكشاف حدائق مرجانية مخفية بعيداً عن الرحلات العامة"
    ],
    ancientLore: "حورس، سيد السماء برأس الصقر، كان مشهوراً بسرعته ورؤيته الثاقبة. كان الكشافة المصريون القدماء يستغلون الزوارق السريعة لدورية الشواطئ بسرعة الصقر وإرسال إشارات إلى المعابد الملكية عبر انعكاسات الضوء."
  }
];

export const EXCURSIONS_DATA_PL: Excursion[] = [
  {
    id: 'diving-1',
    title: "Królewskie Nurkowanie Koralowe w Ras Muhammad",
    tagline: "Odkryj zatopione posągi boga morza Nuna",
    category: 'diving',
    duration: "Pełny dzień (8 godzin)",
    price: 120,
    rating: 4.9,
    location: "Morze Czerwone, Egipt (Park Narodowy Ras Muhammad)",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    description: "Zanurz się w głębokim turkusowym królestwie Nuna, pierwotnych wodach egipskiej tradycji. Ta profesjonalna wyprawa z nurkowaniem poprowadzi Cię obok pionowych ścian koralowych, sanktuariów rekinów młotów i zapierającego dech w piersiach pola zatopionych, ręcznie rzeźbionych faraońskich kamiennych posągów spoczywających na dnie morza.",
    inclusions: [
      "Wysokiej jakości kompletny sprzęt do nurkowania (butle, pianki, automaty)",
      "Dwa głębokie nurkowania z certyfikowanymi egipskimi przewodnikami-archeologami",
      "Tradycyjny obiad na jachcie przygotowany przez morskich Beduinów",
      "Odbiór i dowóz do hotelu w Hurghadzie lub Sharm El Sheikh"
    ],
    highlights: [
      "Pływaj obok gigantycznych wargaczy napoleońskich i żółwi morskich",
      "Odkryj podwodne kamienne sanktuarium Anubisa i Ramzesa",
      "Profesjonalny pakiet zdjęć i filmów podwodnych w cenie"
    ],
    ancientLore: "Starożytni kapłani z Morza Czerwonego pisali o „Nunie” – źródle wszelkiego życia. Wierzyli oni, że zatopione kamienne posągi uspokajają duchy oceanu, zapewniając bezpieczną drogę karawanom handlowym królowej Hatszepsut płynącym do mitycznej krainy Punt."
  },
  {
    id: 'safari-1',
    title: "Złote Safari Deshret Seta",
    tagline: "Ścigaj się quadami i wędruj na wielbłądach przez czerwone wydmy",
    category: 'safari',
    duration: "Pół dnia (6 godzin)",
    price: 75,
    rating: 4.8,
    location: "Pustynia Synaj, Egipt (Obrzeża Hurghady)",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    description: "Ścigaj się wyczynowymi quadami po pofalowanym piasku przed zmianą tempa na majestatyczny krok tradycyjnej karawany wielbłądów. Zakończ swoją podróż w ustronnej, oświetlonej pochodniami oazie beduińskiej, delektując się herbatą z hibiskusa, opowieściami przy ognisku i obserwacją gwiazd przez teleskop pod niebiańskim sklepieniem bogini Nut.",
    inclusions: [
      "Wypożyczenie quada premium (ATV) i sprzętu ochronnego",
      "Tradycyjna 30-minutowa przejażdżka na wielbłądzie o wschodzie/zachodzie słońca",
      "Uczta w ustronnym obozie beduińskim z warsztatami wypieku chlebków",
      "Obserwacja gwiazd przez teleskop i wykład o konstelacjach z archeologiem"
    ],
    highlights: [
      "Pokonuj wysokie wydmy z prędkością 50 km/h na quadzie",
      "Słuchaj beduińskich melodii rababa przy płonących ogniskach",
      "Odszukaj konstelację Sah (Orion) pod okiem naszych gwiezdnych przewodników"
    ],
    ancientLore: "Czerwona pustynia była nazywana przez faraonów „Deshret”, rządzoną przez Seta, boga burz. Starożytni górnicy przemierzali te wydmy pod ochroną łuczników królewskich, aby zdobyć miedź i turkus z Synaju, znacząc skały kartuszami, aby zagwarantować sobie bezpieczny powrót."
  },
  {
    id: 'history-1',
    title: "Pielgrzymka Faraona do Waset (Luksor)",
    tagline: "Odsłoń tajemnice grobowców w Dolinie Królów i Karnaku",
    category: 'history',
    duration: "Pełny dzień (14 godzin)",
    price: 180,
    rating: 4.95,
    location: "Luksor (Starożytne Waset), Egipt",
    image: "/src/assets/images/egypt_luxor_temple_1784070393047.jpg",
    description: "Przemierzaj góry Synaju w drodze do żyznej Doliny Nilu. Przybądź do starożytnego Waset (Luksor), stolicy Nowego Państwa, gdzie będziesz wędrować po gigantycznych salach kolumnowych Karnaku, schodzić do malowanych grobowców królewskich w Dolinie Królów i podziwiać Kolosy Memnona.",
    inclusions: [
      "Prywatny transport luksusowym mikrobusem Mercedes z wybrzeża Morza Czerwonego",
      "Bilety VIP do 3 grobowców królewskich w Dolinie Królów",
      "Zwiedzanie z przewodnikiem świątyni Karnak i świątyni Hatszepsut",
      "Tradycyjny egipski obiad na prywatnej wyspie na Nilu"
    ],
    highlights: [
      "Dotknij hieroglifów w gigantycznej sali hipostylowej w Karnaku",
      "Wejdź do komory grobowej Tutanchamona",
      "Malowniczy rejs tradycyjną feluką o zachodzie słońca po życiodajnym Nilu"
    ],
    ancientLore: "Przejście ze Wschodniego Brzegu na Zachodni Brzeg Luksoru to przekroczenie granicy między światem żywych a umarłych. Faraonowie rzeźbili swoje grobowce głęboko w skalnych szczelinach, aby odpowiadały one zachodzącemu słońcu Ra, zapewniając sobie zmartwychwstanie na Polach Trzcin (Aaru)."
  },
  {
    id: 'boat-1',
    title: "Królewski Rejs Sobka na Jachcie Królowej Nefertari",
    tagline: "Żegluj wokół wyspy Giftun na pokładzie naszego złotego jachtu",
    category: 'boat',
    duration: "Pełny dzień (7 godzin)",
    price: 95,
    rating: 4.85,
    location: "Hurghada, Morze Czerwone, Egipt",
    image: "/src/assets/images/egypt_boat_trip_1784071711626.jpg",
    description: "Żegluj po mieniącym się turkusowym imperium Sobka in absolutnym luksusie. Zrelaksuj się na dwupoziomowym pokładzie słonecznym naszego królewskiego drewnianego jachtu podczas rejsu na wyspę Giftun. Rozkoszuj się świeżą ucztą z owoców morza przygotowaną przez prywatnych kucharzy na pokładzie, pływaj w krystalicznych lagunach i snurkuj wśród tętniących życiem koralowców.",
    inclusions: [
      "Wysokiej jakości sprzęt do snurkowania i kamizelki ratunkowe",
      "Wykwintny bufet z owocami morza i tradycyjnymi przystawkami (mezze) na pokładzie",
      "Nielimitowane świeże soki, egipska kawa i beduińska herbata miętowa",
      "Transfer w obie strony klimatyzowanym vanem klasy VIP"
    ],
    highlights: [
      "Snurkuj w dziewiczych lagunach wyspy Giftun (Orange Bay)",
      "Opalaj się na wygodnych, skórzanych łóżkach w złotym odcieniu",
      "Obserwuj dzikie delfiny bawiące się przy dziobie jachtu"
    ],
    ancientLore: "Nil i morza były pod opieką Sobka, patrona wody i płodności. Starożytni egipscy królowie wodowali cedrowe barki pokryte złotem, aby uczcić duchy wody, wierząc, że radosna podróż zapewni obfite plony i boską przychylność Ozyrysa."
  },
  {
    id: 'speedboat-1',
    title: "Ekspresowy Rejs Motorówką „Sokole Oko Horusa”",
    tagline: "Poczuj adrenalinę mknąc motorówką na ukryte wyspy",
    category: 'speedboat',
    duration: "Pół dnia (4 godziny)",
    price: 150,
    rating: 4.9,
    location: "El Gouna i wyspy Morza Czerwonego, Egipt",
    image: "/src/assets/images/egypt_speedboat_1784071721552.jpg",
    description: "Mknij po falach Morza Czerwonego jak święty sokół niebios Horus. Ten luksusowy rejs motorówką pozwala omijać wolne jachty i udać się prosto do najbardziej ustronnych, nienaruszonych raf wyspiarskich. Dostosuj trasę, zatrzymuj się na bezludnych mieliznach i poczuj dreszczyk emocji podczas szybkiego transportu.",
    inclusions: [
      "Prywatna szybka motorówka / luksusowy mini-jacht z profesjonalnym kapitanem",
      "Zestawy do snurkowania premium oraz podwodne kamery sportowe",
      "Wykwintne przekąski i schłodzony organiczny eliksir z hibiskusa",
      "Odbiór VIP z hotelu prywatnym, nowoczesnym sedanem"
    ],
    highlights: [
      "Leć po turkusowej wodzie z ekscytującą prędkością",
      "Prywatne postoje na bezludnych ławicach piasku na samotną kąpiel",
      "Odkryj ukryte ogrody koralowe nieznane zwykłym turystom"
    ],
    ancientLore: "Horus, sokologłowy pan niebios, słynął ze swojej niezrównanej prędkości i sokolego wzroku. Faraońscy zwiadowcy używali szybkich trzcinowych łodzi do patrolowania wybrzeża z sokolą zwinnością, komunikując się ze świątyniami za pomocą sygnałów świetlnych."
  }
];

const INITIAL_INLINE_REVIEWS = [
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
  },
  {
    id: 'rev-4',
    excursionId: 'boat-1',
    author: "Bastet the Voyager",
    avatar: "𓃠 Bastet the Explorer",
    rating: 4,
    comment: "The Queen Nefertari Cruise was splendid. Feasting on fresh red sea bass cooked onboard while watching dolphins leap at the horizon is an experience worthy of the gods. The golden loungers were exceptionally comfortable.",
    date: "2026-07-13"
  },
  {
    id: 'rev-5',
    excursionId: 'speedboat-1',
    author: "Horus the Brave",
    avatar: "𓅃 Horus the Speedster",
    rating: 5,
    comment: "Absolutely thrilling! We flew across the azure waves at breathtaking speeds. Landing on a completely isolated sandbar and diving into virgin reefs felt like entering a pristine secret dimension. Worth every golden coin!",
    date: "2026-07-14"
  }
];

interface CatalogProps {
  onAddBooking: (booking: Booking) => void;
  excursions?: Excursion[];
  onRequestAuth?: (reason: string) => void;
}

export default function ExcursionCatalog({ onAddBooking, excursions, onRequestAuth }: CatalogProps) {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'diving' | 'safari' | 'history' | 'boat' | 'speedboat'>('all');
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Expanded card reviews state
  const [expandedReviewsId, setExpandedReviewsId] = useState<string | null>(null);

  // Reviews List State
  const [reviews, setReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem('kemet_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_INLINE_REVIEWS;
      }
    }
    return INITIAL_INLINE_REVIEWS;
  });

  // Inline Review Form State
  const [inlineAuthor, setInlineAuthor] = useState<string>("");
  const [inlineComment, setInlineComment] = useState<string>("");
  const [inlineRating, setInlineRating] = useState<number>(5);
  const [inlineAvatar, setInlineAvatar] = useState<string>("𓁠 Cleopatra");
  const [inlineSuccessId, setInlineSuccessId] = useState<string | null>(null);
  const [hoveredInlineStar, setHoveredInlineStar] = useState<number | null>(null);

  // Synchronize reviews from localStorage and server
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
          localStorage.setItem('kemet_reviews', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch reviews inside ExcursionCatalog:", err);
      }
    };
    fetchReviews();

    const syncReviews = () => {
      const saved = localStorage.getItem('kemet_reviews');
      if (saved) {
        try {
          setReviews(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('kemet_reviews_updated', syncReviews);
    return () => {
      window.removeEventListener('kemet_reviews_updated', syncReviews);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Booking Form State
  const [travelerName, setTravelerName] = useState<string>("");
  const [travelerEmail, setTravelerEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [sameWhatsapp, setSameWhatsapp] = useState<boolean>(true);
  const [hotelName, setHotelName] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("07:30 AM");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [requests, setRequests] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number } | null>(null);
  const [promoError, setPromoError] = useState<string>("");

  // Pre-fill user details when booking modal opens or user logs in
  useEffect(() => {
    const savedUserStr = localStorage.getItem('kemet_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.name && !travelerName) setTravelerName(u.name);
        if (u.email && !travelerEmail) setTravelerEmail(u.email);
        if (u.phone && !phoneNumber) setPhoneNumber(u.phone);
        if (u.whatsapp && !whatsappNumber) setWhatsappNumber(u.whatsapp);
        if (u.hotelName && !hotelName) setHotelName(u.hotelName);
        if (u.roomNumber && !roomNumber) setRoomNumber(u.roomNumber);
      } catch (e) {}
    }
  }, [isBookingOpen]);

  // Handle Promo Code Application (Requires User Registration / Login)
  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");

    const savedUserStr = localStorage.getItem('kemet_user');
    if (!savedUserStr) {
      if (onRequestAuth) {
        onRequestAuth("Registration is required to apply promotional discount codes and claim voucher rewards.");
      } else {
        alert("Registration is required to apply promotional discount codes.");
      }
      return;
    }

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    const promoRates: Record<string, number> = {
      'SOLSTICERA15': 15,
      'FLOODHAPI20': 20,
      'OSIRISMYSTERY10': 10,
      'REBIRTHSHEMU15': 15,
      'PHARAOH25': 25,
      'MAS20': 20
    };

    if (promoRates[code]) {
      setAppliedPromo({ code, discountPct: promoRates[code] });
      setPromoError("");
    } else {
      setPromoError("Invalid promotional scroll code. Try SOLSTICERA15, PHARAOH25, or FLOODHAPI20.");
    }
  };

  // Compare Excursions State
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Google Sheet Sync State
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [syncSheetMessage, setSyncSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const performAutoSyncGoogleSheet = React.useCallback(async () => {
    setIsSyncingSheet(true);
    try {
      let token = await getAccessToken().catch(() => null);

      const res = await fetch('/api/excursions/fetch-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          spreadsheetId: '1Ms9LU8f20q3wX5fNaw8JqkIbB_QlDmeAN8ZEIdTFKKc',
          accessToken: token || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.excursions) && data.excursions.length > 0) {
          localStorage.setItem('kemet_excursions', JSON.stringify(data.excursions));
          window.dispatchEvent(new Event('kemet_excursions_updated'));
        }
      }
    } catch (err: any) {
      console.warn("Silent background Google Sheet auto-sync notice:", err);
    } finally {
      setIsSyncingSheet(false);
    }
  }, []);

  // Run Auto-Sync on mount & periodically
  useEffect(() => {
    performAutoSyncGoogleSheet();
    const interval = setInterval(() => {
      performAutoSyncGoogleSheet();
    }, 45000); // Auto sync every 45 seconds
    return () => clearInterval(interval);
  }, [performAutoSyncGoogleSheet]);

  const handleToggleCompare = (exId: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(exId)) {
        return prev.filter(id => id !== exId);
      }
      if (prev.length >= 2) {
        return [prev[1], exId];
      }
      return [...prev, exId];
    });
  };

  const getDifficultyAndGear = (exId: string, lang: string) => {
    const data: Record<string, Record<string, { difficulty: string; gear: string }>> = {
      'diving-1': {
        en: { difficulty: "Moderate / Challenging", gear: "Scuba Tanks, Regulator, Wetsuit, Fins, Mask" },
        de: { difficulty: "Mittel / Anspruchsvoll", gear: "Sauerstoffflaschen, Atemregler, Neoprenanzug, Flossen, Maske" },
        pl: { difficulty: "Średni / Wyzywający", gear: "Butle tlenowe, regulator, pianka, płetwy, maska" },
        cs: { difficulty: "Střední / Náročné", gear: "Kyslíkové láhve, regulátor, neopren, ploutve, maska" },
        ar: { difficulty: "متوسط / متقدم", gear: "أسطوانات غوص، منظم تنفس، بدلة غوص، زعانف، نظارة غوص" }
      },
      'safari-1': {
        en: { difficulty: "Moderate (Active)", gear: "ATV Quad Bike, Helmet, Safety Goggles, Desert Scarf" },
        de: { difficulty: "Mittel (Aktiv)", gear: "ATV-Quad, Helm, Schutzbrille, Wüstenschal" },
        pl: { difficulty: "Średni (Aktywny)", gear: "Quad ATV, kask, gogle ochronne, chusta pustynna" },
        cs: { difficulty: "Střední (Aktivní)", gear: "Čtyřkolka, helma, ochranné brýle, pouštní šátek" },
        ar: { difficulty: "متوسط (نشط)", gear: "بيتش باجي رباعي، خوذة، نظارات واقية، شال صحراوي" }
      },
      'history-1': {
        en: { difficulty: "Easy / Moderate (Walking)", gear: "Lux Mercedes Coach, VIP Tomb Passes, Cold Mineral Water" },
        de: { difficulty: "Leicht / Mittel (Gehen)", gear: "Luxus-Mercedes-Kutsche, VIP-Grabpässe, kaltes Mineralwasser" },
        pl: { difficulty: "Łatwy / Średni (Chodzenie)", gear: "Luksusowy autokar Mercedes, bilety VIP do grobowców, zimna woda mineralna" },
        cs: { difficulty: "Snadné / Střední (Chůze)", gear: "Luxusní autobus Mercedes, VIP vstupenky do hrobek, studená minerální voda" },
        ar: { difficulty: "سهل / متوسط (مشي)", gear: "حافلة مرسيدس فاخرة، تصاريح VIP للمقابر، مياه معدنية باردة" }
      },
      'boat-1': {
        en: { difficulty: "Easy (Leisurely)", gear: "High-Quality Snorkeling Kit, Fins, Life Vest, Towel" },
        de: { difficulty: "Leicht (Gemütlich)", gear: "Hochwertiges Schnorchelset, Flossen, Schwimmweste, Handtuch" },
        pl: { difficulty: "Łatwy (Rekreacyjny)", gear: "Wysokiej jakości zestaw do snorkelingu, płetwy, kamizelka, ręcznik" },
        cs: { difficulty: "Snadné (Pohodové)", gear: "Kvalitní šnorchlovací sada, ploutve, záchranná vesta, ručník" },
        ar: { difficulty: "سهل (استجمام)", gear: "معدات سنوركلينج ممتازة، زعانف، سترة نجاة، منشفة" }
      },
      'speedboat-1': {
        en: { difficulty: "Moderate (Adrenaline)", gear: "Snorkeling Kits, Underwater Action Camera, Premium Life Vest" },
        de: { difficulty: "Mittel (Adrenalin)", gear: "Schnorchelsets, Unterwasser-Actionkamera, Premium-Schwimmweste" },
        pl: { difficulty: "Średni (Adrenalina)", gear: "Zestaw do snorkelingu, podwodna kamera sportowa, kamizelka premium" },
        cs: { difficulty: "Střední (Adrenalin)", gear: "Šnorchlovací sada, podvodní akční kamera, prémiová vesta" },
        ar: { difficulty: "متوسط (إثارة وشغف)", gear: "معدات سنوركلينج، كاميرة تصوير تحت الماء، سترة نجاة فاخرة" }
      }
    };
    
    const siteData = data[exId] || {
      en: { difficulty: "Moderate", gear: "Standard Safety Gear & Snorkeling Kits" },
      de: { difficulty: "Mittel", gear: "Sicherheitsausrüstung & Schnorchelsets" },
      pl: { difficulty: "Średni", gear: "Standardowy sprzęt ochronny i zestawy do snorkelingu" },
      cs: { difficulty: "Střední", gear: "Standardní bezpečnostní výbava a šnorchly" }
    };
    return siteData[lang] || siteData['en'];
  };

  // Interactive Feedback & Rating States
  const [ratingExcursion, setRatingExcursion] = useState<Excursion | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackAuthor, setFeedbackAuthor] = useState<string>("");
  const [feedbackAvatar, setFeedbackAvatar] = useState<string>("𓁠 Cleopatra");
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [hoveredFeedbackStar, setHoveredFeedbackStar] = useState<number | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingExcursion || !feedbackAuthor.trim() || !feedbackComment.trim()) return;

    // Map the selected avatar to its full name
    const avatarLabels: Record<string, string> = {
      "𓁠 Cleopatra": "Cleopatra the Diver",
      "𓀚 Ramses": "Ramses the Nomad",
      "𓁥 Hatshepsut": "Hatshepsut the Scribe",
      "𓃠 Bastet": "Bastet the Explorer",
      "𓆛 Sobek": "Sobek the Mariner",
      "𓅃 Horus": "Horus the Speedster",
      "𓋹 Anubis": "Anubis the Guardian"
    };
    const avatarFull = `${feedbackAvatar} ${avatarLabels[feedbackAvatar] || 'the Noble'}`;

    const newReview = {
      id: `rev-${Date.now()}`,
      excursionId: ratingExcursion.id,
      author: feedbackAuthor,
      avatar: avatarFull,
      rating: feedbackRating,
      comment: feedbackComment,
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Save to kemet_reviews in localStorage
    const savedReviewsStr = localStorage.getItem('kemet_reviews');
    let allReviews = [];
    if (savedReviewsStr) {
      try {
        allReviews = JSON.parse(savedReviewsStr);
      } catch (err) {
        allReviews = [];
      }
    }
    allReviews = [newReview, ...allReviews];
    localStorage.setItem('kemet_reviews', JSON.stringify(allReviews));

    // 2. Recalculate average rating for this excursion
    const excursionReviews = allReviews.filter((r: any) => r.excursionId === ratingExcursion.id);
    const sum = excursionReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const average = Math.round((sum / excursionReviews.length) * 100) / 100;

    // 3. Update the excursion rating in kemet_excursions
    const savedExStr = localStorage.getItem('kemet_excursions');
    if (savedExStr) {
      try {
        const localExcursions = JSON.parse(savedExStr);
        const updatedExcursions = localExcursions.map((ex: any) => {
          if (ex.id === ratingExcursion.id) {
            return { ...ex, rating: average };
          }
          return ex;
        });
        localStorage.setItem('kemet_excursions', JSON.stringify(updatedExcursions));
      } catch (err) {
        console.error("Could not update excursion rating", err);
      }
    }

    // 4. Dispatch events to trigger app state updates & golden scarab celebration!
    window.dispatchEvent(new Event('kemet_reviews_updated'));
    window.dispatchEvent(new Event('kemet_excursions_updated'));
    window.dispatchEvent(new Event('kemet_celebrate'));

    // 5. Show success overlay and close
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setRatingExcursion(null);
      setFeedbackAuthor("");
      setFeedbackComment("");
      setFeedbackRating(5);
    }, 2200);
  };

  const handleInlineFeedbackSubmit = async (e: React.FormEvent, exId: string) => {
    e.preventDefault();
    if (!inlineAuthor.trim() || !inlineComment.trim()) return;

    const avatarLabels: Record<string, string> = {
      "𓁠 Cleopatra": "Cleopatra the Diver",
      "𓀚 Ramses": "Ramses the Nomad",
      "𓁥 Hatshepsut": "Hatshepsut the Scribe",
      "𓃠 Bastet": "Bastet the Explorer",
      "𓆛 Sobek": "Sobek the Mariner",
      "𓅃 Horus": "Horus the Speedster",
      "𓋹 Anubis": "Anubis the Guardian"
    };
    const avatarFull = `${inlineAvatar} ${avatarLabels[inlineAvatar] || 'the Noble'}`;

    const newReview = {
      id: `rev-${Date.now()}`,
      excursionId: exId,
      author: inlineAuthor,
      avatar: avatarFull,
      rating: inlineRating,
      comment: inlineComment,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excursionId: exId,
          author: inlineAuthor,
          avatar: avatarFull,
          rating: inlineRating,
          comment: inlineComment
        })
      });
    } catch (err) {
      console.error("Failed to post inline review to database:", err);
    }

    const savedReviewsStr = localStorage.getItem('kemet_reviews');
    let allReviews = [];
    if (savedReviewsStr) {
      try {
        allReviews = JSON.parse(savedReviewsStr);
      } catch (err) {
        allReviews = [];
      }
    }
    allReviews = [newReview, ...allReviews];
    localStorage.setItem('kemet_reviews', JSON.stringify(allReviews));
    setReviews(allReviews);

    // Recalculate average rating for this excursion
    const excursionReviews = allReviews.filter((r: any) => r.excursionId === exId);
    const sum = excursionReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const average = Math.round((sum / excursionReviews.length) * 100) / 100;

    const savedExStr = localStorage.getItem('kemet_excursions');
    if (savedExStr) {
      try {
        const localExcursions = JSON.parse(savedExStr);
        const updatedExcursions = localExcursions.map((ex: any) => {
          if (ex.id === exId) {
            return { ...ex, rating: average };
          }
          return ex;
        });
        localStorage.setItem('kemet_excursions', JSON.stringify(updatedExcursions));
      } catch (err) {
        console.error("Could not update excursion rating locally", err);
      }
    }

    window.dispatchEvent(new Event('kemet_reviews_updated'));
    window.dispatchEvent(new Event('kemet_excursions_updated'));
    window.dispatchEvent(new Event('kemet_celebrate'));

    setInlineSuccessId(exId);
    setInlineAuthor("");
    setInlineComment("");
    setInlineRating(5);

    setTimeout(() => {
      setInlineSuccessId(null);
    }, 2500);
  };

  const activeCatalog = React.useMemo(() => {
    const rawCatalog = excursions && excursions.length > 0 ? excursions : EXCURSIONS_DATA;
    if (language === 'de') {
      return rawCatalog.map(ex => {
        const deEx = EXCURSIONS_DATA_DE.find(item => item.id === ex.id);
        if (deEx) {
          return {
            ...ex,
            title: deEx.title,
            tagline: deEx.tagline,
            duration: deEx.duration,
            location: deEx.location,
            description: deEx.description,
            inclusions: deEx.inclusions,
            highlights: deEx.highlights,
            ancientLore: deEx.ancientLore
          };
        }
        return ex;
      });
    } else if (language === 'pl') {
      return rawCatalog.map(ex => {
        const plEx = EXCURSIONS_DATA_PL.find(item => item.id === ex.id);
        if (plEx) {
          return {
            ...ex,
            title: plEx.title,
            tagline: plEx.tagline,
            duration: plEx.duration,
            location: plEx.location,
            description: plEx.description,
            inclusions: plEx.inclusions,
            highlights: plEx.highlights,
            ancientLore: plEx.ancientLore
          };
        }
        return ex;
      });
    } else if (language === 'ar') {
      return rawCatalog.map(ex => {
        const arEx = EXCURSIONS_DATA_AR.find(item => item.id === ex.id);
        if (arEx) {
          return {
            ...ex,
            title: arEx.title,
            tagline: arEx.tagline,
            duration: arEx.duration,
            location: arEx.location,
            description: arEx.description,
            inclusions: arEx.inclusions,
            highlights: arEx.highlights,
            ancientLore: arEx.ancientLore
          };
        }
        return ex;
      });
    }
    return rawCatalog;
  }, [excursions, language]);

  const filteredExcursions = activeCatalog.filter(
    ex => filter === 'all' || ex.category === filter
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName || !travelerEmail || !bookingDate || !selectedExcursion) return;

    const baseCost = selectedExcursion.price * guests;
    const discountPct = appliedPromo ? appliedPromo.discountPct : 0;
    const discountAmount = Math.round((baseCost * discountPct) / 100);
    const totalCost = baseCost - discountAmount;
    const activeWhatsapp = sameWhatsapp ? phoneNumber : (whatsappNumber || phoneNumber);

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      excursionId: selectedExcursion.id,
      excursionTitle: selectedExcursion.title,
      travelerName,
      travelerEmail,
      phoneNumber,
      whatsappNumber: activeWhatsapp,
      hotelName,
      roomNumber,
      pickupTime,
      date: bookingDate,
      numberOfGuests: guests,
      totalCost,
      promoCodeUsed: appliedPromo ? appliedPromo.code : undefined,
      discountAmount,
      specialRequests: requests,
      status: 'Pending Oracle Approval',
      createdAt: new Date().toISOString()
    };

    onAddBooking(newBooking);
    setSuccessMsg(true);

    // Formulate a detailed WhatsApp message
    const message = `𓂀 Kemet Tours - Powered by Mas International Agency - EXPEDITION BOOKING 𓂀

Greetings Scribe! I have inscribed a new caravan passage:

𓋹 Expedition: ${selectedExcursion.title}
𓀚 Traveler Name: ${travelerName}
✉ Messenger Email: ${travelerEmail}
📱 Phone Number: ${phoneNumber || "N/A"}
💬 WhatsApp Number: ${activeWhatsapp || "N/A"}
🏨 Hotel Name: ${hotelName || "To be provided"} (Room: ${roomNumber || "N/A"})
⏰ Preferred Pickup Time: ${pickupTime || "07:30 AM"}
📅 Departure Date: ${bookingDate}
👥 Caravan Size: ${guests} Nobles
🏷 Promo Code: ${appliedPromo ? `${appliedPromo.code} (${appliedPromo.discountPct}% OFF - Saved $${discountAmount})` : "None"}
💰 Total Tribute: $${totalCost} Gold Coins ${appliedPromo ? `(Discounted from $${baseCost})` : ""}
✍ Special Requests: ${requests || "None"}

Please seal my booking with the High Priest approval!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201202181834?text=${encodedMessage}`;

    setTimeout(() => {
      setSuccessMsg(false);
      setIsBookingOpen(false);
      // Reset form
      setTravelerName("");
      setTravelerEmail("");
      setPhoneNumber("");
      setWhatsappNumber("");
      setHotelName("");
      setRoomNumber("");
      setBookingDate("");
      setGuests(2);
      setRequests("");
      setPromoCodeInput("");
      setAppliedPromo(null);

      // Redirect the traveler to WhatsApp Chat
      window.open(whatsappUrl, '_blank') || (window.location.href = whatsappUrl);
    }, 2000);
  };

  return (
    <div className="space-y-10" id="excursions-section">
      
      {/* Title */}
      <div className="text-center">
        <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">{t('cat_subtitle', 'Sacred Offerings')}</span>
        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#e6c280] uppercase mt-1">
          {t('cat_title', 'Available Expeditions')}
        </h2>
        <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
          {t('cat_desc', 'Enlist in our premium curated experiences along the Nile, desert dunes, and aquatic depths.')}
        </p>
      </div>

      {/* Promotional Seasonal Discount Banner */}
      <PromotionalBanner />

      {/* Filter Tabs & Comparison Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#15100a] border border-[#d4af37]/20 p-4 rounded-2xl">
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {[
            { key: 'all', label: t('cat_all', '𓆃 All Expeditions') },
            { key: 'diving', label: t('cat_diving', '𓆛 Coral Diving') },
            { key: 'safari', label: t('cat_safari', '𓅓 Desert Safari') },
            { key: 'history', label: t('cat_history', '𓉐 Luxor History') },
            { key: 'boat', label: t('cat_boat', '𓊟 Boat Trips') },
            { key: 'speedboat', label: t('cat_speedboat', '𓊡 Speedboats') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#bfa030] text-[#140f0a] font-bold shadow-lg shadow-[#d4af37]/15'
                  : 'bg-[#1a140f] border border-[#d4af37]/20 text-[#e6c280]/70 hover:text-[#f3e5c8] hover:bg-[#281e14]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => {
              setIsComparisonMode(!isComparisonMode);
              if (isComparisonMode) {
                setSelectedCompareIds([]);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border ${
              isComparisonMode
                ? 'bg-[#d4af37] text-[#140f0a] border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/15'
                : 'bg-[#1c140d]/80 border-[#d4af37]/35 text-[#e6c280] hover:bg-[#261b11] hover:border-[#d4af37]/60'
            }`}
          >
            <span>⚖</span>
            <span>{language === 'de' ? 'Ausflüge vergleichen' : language === 'pl' ? 'Porównaj wycieczki' : 'Compare Excursions'}</span>
            {isComparisonMode && (
              <span className="bg-[#140f0a] text-[#d4af37] text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                {selectedCompareIds.length}/2
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <AnimatePresence>
        {syncSheetMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
              syncSheetMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>{syncSheetMessage.text}</span>
            </div>
            <button 
              onClick={() => setSyncSheetMessage(null)}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Board Panel */}
      <AnimatePresence>
        {isComparisonMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#1f160f] border border-[#d4af37]/40 rounded-2xl shadow-xl relative"
          >
            <div className="p-5 border-b border-[#d4af37]/20 bg-[#16100a] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">⚖</span>
                <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider">
                  {language === 'de' ? 'Ausflugsvergleichs-Tafel' : language === 'pl' ? 'Tablica porównania wycieczek' : 'Expedition Comparison Board'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsComparisonMode(false);
                  setSelectedCompareIds([]);
                }}
                className="text-stone-400 hover:text-white text-xs font-mono uppercase tracking-widest bg-stone-800/40 hover:bg-stone-800/80 px-2 py-1 rounded cursor-pointer"
              >
                {language === 'de' ? 'Schließen' : language === 'pl' ? 'Zamknij' : 'Close'}
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedCompareIds.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm italic">
                  {language === 'de' 
                    ? '𓀚 Bitte wählen Sie unten zwei Ausflüge aus, um einen direkten Vergleich zu sehen.' 
                    : language === 'pl' 
                    ? '𓀚 Wybierz poniżej dwie wycieczki, aby zobaczyć bezpośrednie porównanie.' 
                    : '𓀚 Please select two excursions below to see a side-by-side comparison.'}
                </div>
              ) : selectedCompareIds.length === 1 ? (
                <div className="text-center py-8 text-stone-400 text-sm italic space-y-3">
                  <div>
                    {language === 'de'
                      ? '𓀚 Eine Expedition ausgewählt. Wählen Sie eine zweite, um sie zu vergleichen:'
                      : language === 'pl'
                      ? '𓀚 Wybrano jedną ekspedycję. Wybierz drugą, aby porównać:'
                      : '𓀚 One expedition selected. Choose a second to compare side-by-side:'}
                  </div>
                  <div className="inline-block bg-[#16100a] border border-[#d4af37]/30 px-4 py-2 rounded-xl text-xs text-[#e6c280] font-serif uppercase">
                    {activeCatalog.find(e => e.id === selectedCompareIds[0])?.title}
                  </div>
                </div>
              ) : (() => {
                const ex1 = activeCatalog.find(e => e.id === selectedCompareIds[0]);
                const ex2 = activeCatalog.find(e => e.id === selectedCompareIds[1]);
                if (!ex1 || !ex2) return null;

                const gearInfo1 = getDifficultyAndGear(ex1.id, language);
                const gearInfo2 = getDifficultyAndGear(ex2.id, language);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#d4af37]/15">
                    {/* Excursion 1 */}
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <img 
                          src={ex1.image} 
                          alt={ex1.title} 
                          className="w-24 h-20 object-cover rounded-xl border border-[#d4af37]/20 flex-shrink-0" 
                        />
                        <div>
                          <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider bg-[#140f0a] px-2 py-0.5 rounded-full border border-[#d4af37]/10">
                            {ex1.category.toUpperCase()}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase mt-1">
                            {ex1.title}
                          </h4>
                          <span className="text-xs font-mono text-amber-100/70">{ex1.tagline}</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Dauer' : language === 'pl' ? 'Czas' : 'Duration'}</span>
                          <span className="col-span-2 text-stone-200">{ex1.duration}</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Bewertung' : language === 'pl' ? 'Ocena' : 'Rating'}</span>
                          <span className="col-span-2 text-[#d4af37] font-bold flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            <span>{ex1.rating ? ex1.rating.toFixed(1) : '0.0'} ({reviews.filter((r: any) => r.excursionId === ex1.id).length})</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Tribut' : language === 'pl' ? 'Cena' : 'Price'}</span>
                          <span className="col-span-2 text-amber-400 font-bold">${ex1.price} Gold</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Schwierigkeit' : language === 'pl' ? 'Trudność' : 'Difficulty'}</span>
                          <span className="col-span-2 text-stone-200">{gearInfo1.difficulty}</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Ausrüstung' : language === 'pl' ? 'Sprzęt' : 'Included Gear'}</span>
                          <span className="col-span-2 text-stone-200">{gearInfo1.gear}</span>
                        </div>
                        <div className="space-y-1.5 pt-2">
                          <h5 className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                            {language === 'de' ? 'Inbegriffene Leistungen' : language === 'pl' ? 'W cenie' : 'Sacred Inclusions'}
                          </h5>
                          <ul className="text-xs text-stone-300 space-y-1 pl-4 list-disc">
                            {ex1.inclusions.slice(0, 3).map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={() => {
                            setSelectedExcursion(ex1);
                            setIsBookingOpen(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wide py-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer text-center"
                        >
                          {language === 'de' ? 'Buchen' : language === 'pl' ? 'Zarezerwuj' : 'Book Now'}
                        </button>
                        <button
                          onClick={() => setSelectedExcursion(ex1)}
                          className="px-4 bg-[#140f0a] border border-[#d4af37]/20 text-[#e6c280] font-mono text-xs uppercase py-2 rounded-xl hover:bg-stone-900 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Excursion 2 */}
                    <div className="space-y-4 md:pl-6 pt-6 md:pt-0">
                      <div className="flex gap-4 items-start">
                        <img 
                          src={ex2.image} 
                          alt={ex2.title} 
                          className="w-24 h-20 object-cover rounded-xl border border-[#d4af37]/20 flex-shrink-0" 
                        />
                        <div>
                          <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider bg-[#140f0a] px-2 py-0.5 rounded-full border border-[#d4af37]/10">
                            {ex2.category.toUpperCase()}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase mt-1">
                            {ex2.title}
                          </h4>
                          <span className="text-xs font-mono text-amber-100/70">{ex2.tagline}</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Dauer' : language === 'pl' ? 'Czas' : 'Duration'}</span>
                          <span className="col-span-2 text-stone-200">{ex2.duration}</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Bewertung' : language === 'pl' ? 'Ocena' : 'Rating'}</span>
                          <span className="col-span-2 text-[#d4af37] font-bold flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            <span>{ex2.rating ? ex2.rating.toFixed(1) : '0.0'} ({reviews.filter((r: any) => r.excursionId === ex2.id).length})</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Tribut' : language === 'pl' ? 'Cena' : 'Price'}</span>
                          <span className="col-span-2 text-amber-400 font-bold">${ex2.price} Gold</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Schwierigkeit' : language === 'pl' ? 'Trudność' : 'Difficulty'}</span>
                          <span className="col-span-2 text-stone-200">{gearInfo2.difficulty}</span>
                        </div>
                        <div className="grid grid-cols-3 text-xs border-b border-[#d4af37]/10 pb-2 font-mono">
                          <span className="text-stone-500 uppercase">{language === 'de' ? 'Ausrüstung' : language === 'pl' ? 'Sprzęt' : 'Included Gear'}</span>
                          <span className="col-span-2 text-stone-200">{gearInfo2.gear}</span>
                        </div>
                        <div className="space-y-1.5 pt-2">
                          <h5 className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                            {language === 'de' ? 'Inbegriffene Leistungen' : language === 'pl' ? 'W cenie' : 'Sacred Inclusions'}
                          </h5>
                          <ul className="text-xs text-stone-300 space-y-1 pl-4 list-disc">
                            {ex2.inclusions.slice(0, 3).map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={() => {
                            setSelectedExcursion(ex2);
                            setIsBookingOpen(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wide py-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer text-center"
                        >
                          {language === 'de' ? 'Buchen' : language === 'pl' ? 'Zarezerwuj' : 'Book Now'}
                        </button>
                        <button
                          onClick={() => setSelectedExcursion(ex2)}
                          className="px-4 bg-[#140f0a] border border-[#d4af37]/20 text-[#e6c280] font-mono text-xs uppercase py-2 rounded-xl hover:bg-stone-900 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Excursions */}
      {isLoading ? (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="bg-[#1a140f] border border-[#d4af37]/15 rounded-2xl overflow-hidden shadow-xl flex flex-col relative group"
              id={`excursion-skeleton-${index}`}
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

              {/* Image Thumbnail Skeleton */}
              <div className="h-56 bg-[#211a13]/80 relative flex items-center justify-center overflow-hidden">
                {/* Floating animated hieroglyphs */}
                <motion.span 
                  animate={{ 
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.15, 0.45, 0.15],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6, 
                    ease: "easeInOut",
                    delay: index * 0.4 
                  }}
                  className="text-[#d4af37] text-6xl font-serif select-none"
                >
                  {index % 3 === 0 ? '𓋹' : index % 3 === 1 ? '𓂀' : '𓅃'}
                </motion.span>
                <div className="absolute top-4 left-4 w-24 h-5 bg-[#140f0a]/60 rounded-full border border-stone-850 animate-pulse" />
                <div className="absolute bottom-4 right-4 w-16 h-7 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-lg animate-pulse" />
              </div>

              {/* Content Skeleton */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-[#1a140f]/90">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <div className="w-24 h-3.5 bg-[#211a13] rounded-md animate-pulse" />
                    <div className="w-10 h-3.5 bg-[#211a13] rounded-md animate-pulse" />
                  </div>

                  <div className="w-11/12 h-5 bg-[#211a13] rounded-md animate-pulse" />
                  <div className="w-2/3 h-3.5 bg-[#211a13]/80 rounded-md animate-pulse" />
                  
                  <div className="space-y-2 pt-2">
                    <div className="w-full h-3 bg-[#211a13]/60 rounded-md animate-pulse" />
                    <div className="w-full h-3 bg-[#211a13]/60 rounded-md animate-pulse" />
                    <div className="w-5/6 h-3 bg-[#211a13]/60 rounded-md animate-pulse" />
                  </div>
                </div>

                {/* Ancient Lore Snippet Skeleton */}
                <div className="bg-[#211a13]/40 border border-[#d4af37]/10 rounded-xl p-3.5 h-[68px] flex flex-col justify-between relative overflow-hidden">
                  <div className="w-28 h-3.5 bg-[#211a13] rounded-md animate-pulse" />
                  <div className="w-full h-2.5 bg-[#211a13]/50 rounded-md animate-pulse" />
                </div>

                {/* Buttons Skeleton */}
                <div className="flex gap-2.5 pt-2">
                  <div className="flex-1 h-9 bg-[#211a13]/60 rounded-xl animate-pulse" />
                  <div className="flex-1 h-9 bg-[#d4af37]/10 rounded-xl animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExcursions.map((ex, index) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: 'easeOut' }}
              className="bg-[#1a140f] border border-[#d4af37]/25 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-[#d4af37]/85 hover:shadow-[0_0_22px_rgba(212,175,55,0.22)] transition-all duration-300 hover:-translate-y-1.5"
              id={`excursion-card-${ex.id}`}
            >
              {/* Image Thumbnail with Overlay */}
              <div className="h-56 overflow-hidden relative">
                <img
                  src={ex.image}
                  alt={ex.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-transparent to-transparent"></div>
                
                {/* Category & Rating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                  <span className="bg-[#140f0a]/85 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                    {ex.category === 'diving' ? (language === 'de' ? '𓆛 Tauchen' : language === 'pl' ? '𓆛 Nurkowanie' : '𓆛 Diving') : ex.category === 'safari' ? (language === 'de' ? '𓅓 Safari' : language === 'pl' ? '𓅓 Safari' : '𓅓 Safari') : ex.category === 'history' ? (language === 'de' ? '𓉐 Geschichte' : language === 'pl' ? '𓉐 Historia' : '𓉐 History') : ex.category === 'boat' ? (language === 'de' ? '𓊟 Bootsfahrt' : language === 'pl' ? '𓊟 Rejs statkiem' : '𓊟 Boat Trip') : (language === 'de' ? '𓊡 Schnellboot' : language === 'pl' ? '𓊡 Motorówka' : '𓊡 Speedboat')}
                  </span>
                  
                  {ex.rating >= 4.9 && (
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-sans font-extrabold rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-stone-950 text-stone-950" />
                      <span>{language === 'de' ? 'Beliebt' : language === 'pl' ? 'Popularne' : 'Popular'}</span>
                    </span>
                  )}
                </div>

                {/* Compare Checkbox Selection Overlay */}
                {isComparisonMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleToggleCompare(ex.id);
                    }}
                    className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center gap-1.5 z-10 shadow-lg ${
                      selectedCompareIds.includes(ex.id)
                        ? 'bg-[#d4af37] text-[#140f0a] border-[#d4af37] font-bold'
                        : 'bg-[#140f0a]/95 text-[#e6c280] border-[#d4af37]/40 hover:border-[#d4af37]'
                    }`}
                  >
                    <span>{selectedCompareIds.includes(ex.id) ? '✓' : '⚖'}</span>
                    <span>{selectedCompareIds.includes(ex.id) ? (language === 'de' ? 'Ausgewählt' : language === 'pl' ? 'Wybrano' : 'Selected') : (language === 'de' ? 'Vergleichen' : language === 'pl' ? 'Porównaj' : 'Compare')}</span>
                  </button>
                )}

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-[#d4af37] text-[#140f0a] font-mono font-bold px-3 py-1 rounded-lg text-sm shadow-md">
                  ${ex.price} <span className="text-xs font-normal">{language === 'de' ? '/ Person' : language === 'pl' ? '/ os.' : '/ noble'}</span>
                </div>
              </div>

              {/* Content info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> {ex.duration}
                    </span>
                    {/* Interactive Golden Star Rating Widget */}
                    <div 
                      className="flex items-center gap-1.5 cursor-pointer group/rating relative"
                      title={language === 'de' ? 'Feedback eintragen (Klicken zum Bewerten)' : language === 'pl' ? 'Zostaw opinię (Kliknij, aby ocenić)' : 'Inscribe thy feedback (Click to Rate)'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRatingExcursion(ex);
                        setFeedbackRating(Math.round(ex.rating) || 5);
                      }}
                    >
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const isFilled = num <= Math.round(ex.rating);
                          return (
                            <Star
                              key={num}
                              className={`w-3.5 h-3.5 transition-all duration-200 ${
                                isFilled 
                                  ? 'text-[#d4af37] fill-current group-hover/rating:text-amber-300 group-hover/rating:scale-110' 
                                  : 'text-stone-700 group-hover/rating:text-stone-500'
                              }`}
                              style={{ transitionDelay: `${num * 25}ms` }}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[#d4af37] font-mono font-bold text-xs group-hover/rating:text-amber-200 ml-0.5 transition-colors">
                        {ex.rating ? ex.rating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-stone-500 text-[10px] font-mono group-hover/rating:text-stone-400 transition-colors">
                        ({reviews.filter((r: any) => r.excursionId === ex.id).length})
                      </span>
                      
                      {/* Floating tooltip invitation */}
                      <span className="pointer-events-none opacity-0 group-hover/rating:opacity-100 transition-opacity duration-300 text-[9px] font-mono text-[#140f0a] uppercase tracking-widest absolute -top-8 right-0 bg-gradient-to-r from-[#d4af37] to-[#f3e5c8] px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20 border border-[#d4af37]/30">
                        {language === 'de' ? '✍ Bewerten' : language === 'pl' ? '✍ Oceń podróż' : '✍ Rate Journey'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#e6c280] group-hover:text-amber-200 transition-colors uppercase tracking-wide">
                    {ex.title}
                  </h3>
                  
                  <p className="text-xs italic text-stone-400">{ex.tagline}</p>
                  
                  <p className="text-stone-300 text-xs leading-relaxed pt-2 line-clamp-3">
                    {ex.description}
                  </p>
                </div>

                {/* Ancient Lore Snippet button */}
                <div className="bg-[#241a10] border border-[#d4af37]/15 rounded-xl p-3.5 text-[11px] text-[#e6c280]/80 italic relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#d4af37]/5 rounded-bl-2xl"></div>
                  <strong className="font-serif text-[#d4af37] not-italic block mb-0.5 uppercase tracking-widest text-[10px]">
                    {language === 'de' ? '𓋹 Pharaonische Sage:' : language === 'pl' ? '𓋹 Faraońska opowieść:' : '𓋹 Pharaonic Lore:'}
                  </strong>
                  "{ex.ancientLore.slice(0, 115)}..."
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedExcursion(ex);
                        setIsBookingOpen(false); // just detail view
                      }}
                      className="flex-1 bg-[#221c14] hover:bg-[#32281d] border border-[#d4af37]/30 text-[#e6c280] font-mono text-[11px] uppercase tracking-widest py-2.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      {language === 'de' ? 'Details ansehen' : language === 'pl' ? 'Zobacz szczegóły' : 'View Details'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExcursion(ex);
                        setIsBookingOpen(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e5c250] hover:to-[#c5a02e] text-[#140f0a] font-serif font-bold text-xs uppercase tracking-wide py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-[#d4af37]/10 cursor-pointer"
                    >
                      {language === 'de' ? 'Expedition buchen' : language === 'pl' ? 'Zarezerwuj ekspedycję' : 'Book Expedition'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const msg = `𓂀 Kemet Tours - Powered by Mas international Agency - EXPEDITION INQUIRY 𓂀\n\nGreetings Scribe! I am interested in embarking on the beautiful "${ex.title}" (${ex.duration}) expedition. Can you please tell me more about availability and itineraries?`;
                      const url = `https://wa.me/201202181834?text=${encodeURIComponent(msg)}`;
                      window.open(url, '_blank') || (window.location.href = url);
                    }}
                    className="w-full bg-[#140f0a] hover:bg-emerald-950/15 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-[10px] font-mono uppercase tracking-widest py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="text-emerald-400 text-xs">𓍢</span> {language === 'de' ? 'Auf WhatsApp anfragen' : language === 'pl' ? 'Zapytaj na WhatsApp' : 'Inquire on WhatsApp'} (+201202181834)
                  </button>
                </div>

                {/* Collapsible Reviews & Comments Accordion */}
                <div className="pt-2.5 border-t border-stone-800/60">
                  <button
                    onClick={() => setExpandedReviewsId(expandedReviewsId === ex.id ? null : ex.id)}
                    className="w-full text-center text-[10px] font-mono text-[#d4af37]/80 hover:text-[#d4af37] flex items-center justify-center gap-1.5 py-1.5 hover:bg-[#d4af37]/5 rounded-lg transition-all border border-dashed border-[#d4af37]/25 cursor-pointer uppercase tracking-widest"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>
                      {expandedReviewsId === ex.id 
                        ? (language === 'de' ? 'Bewertungen ausblenden' : language === 'pl' ? 'Ukryj opinie' : 'Hide Reviews') 
                        : `${language === 'de' ? 'Bewertungen lesen & schreiben' : language === 'pl' ? 'Czytaj i pisz opinie' : 'Read & Write Reviews'} (${reviews.filter((r: any) => r.excursionId === ex.id).length})`}
                    </span>
                  </button>
 
                  <AnimatePresence>
                    {expandedReviewsId === ex.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3 space-y-4"
                      >
                        {/* List of existing reviews for this specific excursion */}
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                          {reviews.filter((r: any) => r.excursionId === ex.id).length === 0 ? (
                            <p className="text-[10px] italic text-stone-500 text-center py-2">
                              {language === 'de' ? 'Noch keine Erfahrungsberichte eingetragen. Seien Sie der Erste!' : language === 'pl' ? 'Brak zarejestrowanych opinii podróżników. Bądź pierwszy!' : 'No travelers have inscribed testimony yet. Be the first!'}
                            </p>
                          ) : (
                            reviews.filter((r: any) => r.excursionId === ex.id).map((r: any) => (
                              <div key={r.id} className="bg-[#120d09]/80 border border-stone-850 rounded-xl p-2.5 space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-serif font-bold text-[#e6c280]">{r.author}</span>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                      <Star key={i} className="w-2.5 h-2.5 fill-current text-amber-500" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[10px] text-stone-300 leading-normal italic">
                                  "{r.comment}"
                                </p>
                                <span className="text-[8px] font-mono text-stone-500 block text-right">
                                  {r.date}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
 
                        {/* Inline Review Form */}
                        <div className="border-t border-[#d4af37]/15 pt-3 space-y-3 bg-[#110c08]/50 p-3 rounded-xl border border-stone-850">
                          {inlineSuccessId === ex.id ? (
                            <div className="text-center py-4 space-y-1.5">
                              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                              <p className="text-xs font-serif font-semibold text-emerald-400 uppercase tracking-wider">
                                {language === 'de' ? 'Erfahrungsbericht eingetragen!' : language === 'pl' ? 'Opinia została zarejestrowana!' : 'Testimony Inscribed!'}
                              </p>
                              <p className="text-[9px] font-mono text-stone-400">
                                {language === 'de' ? 'Ihre Bewertung wurde im Hauptbuch gespeichert.' : language === 'pl' ? 'Twoja recenzja została zapisana w księdze.' : 'Thy review has been saved in the ledger.'}
                              </p>
                            </div>
                          ) : (
                            <form onSubmit={(e) => handleInlineFeedbackSubmit(e, ex.id)} className="space-y-2.5">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#e6c280] flex items-center gap-1.5 font-bold">
                                <PenTool className="w-3 h-3 text-[#d4af37]" /> {language === 'de' ? 'Bewertung schreiben' : language === 'pl' ? 'Napisz recenzję' : 'Write Review'}
                              </h4>
 
                              {/* Star Picker */}
                              <div className="flex items-center justify-between bg-stone-950/40 p-1.5 rounded-lg border border-stone-850">
                                <span className="text-[9px] font-mono text-stone-400 uppercase">{language === 'de' ? 'Bewertung' : language === 'pl' ? 'Ocena' : 'Rating'}</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => setInlineRating(num)}
                                      onMouseEnter={() => setHoveredInlineStar(num)}
                                      onMouseLeave={() => setHoveredInlineStar(null)}
                                      className="cursor-pointer transition-transform hover:scale-110 focus:outline-none text-stone-600"
                                    >
                                      <Star
                                        className={`w-4 h-4 transition-colors ${
                                          num <= (hoveredInlineStar ?? inlineRating)
                                            ? 'text-amber-400 fill-current drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]'
                                            : 'text-stone-800'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
 
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  required
                                  placeholder={language === 'de' ? 'Ihr Name' : language === 'pl' ? 'Twoje imię' : 'Thy Name'}
                                  value={inlineAuthor}
                                  onChange={(e) => setInlineAuthor(e.target.value)}
                                  className="w-full bg-stone-950/40 border border-[#d4af37]/20 rounded-lg p-2 text-stone-200 text-[10px] focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
 
                                <select
                                  value={inlineAvatar}
                                  onChange={(e) => setInlineAvatar(e.target.value)}
                                  className="w-full bg-stone-950/40 border border-[#d4af37]/20 rounded-lg p-1.5 text-stone-200 text-[10px] focus:outline-none focus:border-[#d4af37] transition-colors"
                                >
                                  <option value="𓁠 Cleopatra">𓁠 Cleopatra</option>
                                  <option value="𓀚 Ramses">𓀚 Ramses</option>
                                  <option value="𓁥 Hatshepsut">𓁥 Hatshepsut</option>
                                  <option value="𓃠 Bastet">𓃠 Bastet</option>
                                  <option value="𓆛 Sobek">𓆛 Sobek</option>
                                  <option value="𓅃 Horus">𓅃 Horus</option>
                                  <option value="𓋹 Anubis">𓋹 Anubis</option>
                                </select>
                              </div>
 
                              <textarea
                                required
                                rows={2}
                                placeholder={language === 'de' ? 'Teilen Sie Details zu Ihrem Ausflug...' : language === 'pl' ? 'Podziel się szczegółami swojej wycieczki...' : 'Share details of your excursion...'}
                                value={inlineComment}
                                onChange={(e) => setInlineComment(e.target.value)}
                                className="w-full bg-stone-950/40 border border-[#d4af37]/20 rounded-lg p-2 text-stone-200 text-[10px] focus:outline-none focus:border-[#d4af37] transition-colors leading-relaxed"
                              />
 
                              <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#d4af37]/15 to-[#b08e23]/15 hover:from-[#d4af37]/30 hover:to-[#b08e23]/30 border border-[#d4af37]/35 text-[#e6c280] rounded-lg py-1.5 text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 font-bold"
                              >
                                <Send className="w-3 h-3 text-[#d4af37]" /> {language === 'de' ? 'Bewertung abschicken' : language === 'pl' ? 'Wyślij opinię' : 'Submit Review'}
                              </button>
                            </form>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details & Booking Modal */}
      <AnimatePresence>
        {selectedExcursion && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedExcursion(null);
                  setIsBookingOpen(false);
                }}
                aria-label="Close excursion details"
                className="absolute top-4 right-4 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success Message Banner */}
              {successMsg && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6">
                  <CheckCircle className="text-[#d4af37] w-16 h-16 mb-4 animate-bounce" />
                  <h4 className="font-serif text-2xl font-bold text-[#e6c280] uppercase tracking-wider">
                    Expedition Inscribed!
                  </h4>
                  <p className="text-stone-300 text-sm mt-2 max-w-md">
                    By the grace of Ra, your booking requests have been logged inside the sacred ledger. Prepare thy bags, noble traveler!
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <span className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></span>
                    <p className="text-stone-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                      Redirecting to WhatsApp chat...
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Core Contents */}
              {!isBookingOpen ? (
                // VIEW DETAILS CONTENT
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={selectedExcursion.image}
                      alt={selectedExcursion.title}
                      className="w-full md:w-1/2 h-56 object-cover rounded-xl border border-[#d4af37]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-3 md:w-1/2">
                      <span className="text-xs font-mono text-[#d4af37] uppercase tracking-widest block">
                        Excursion Dossier
                      </span>
                      <h3 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wide">
                        {selectedExcursion.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#d4af37]" /> {selectedExcursion.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[#d4af37]" /> {selectedExcursion.duration}
                        </span>
                        <button
                          onClick={() => {
                            setRatingExcursion(selectedExcursion);
                            setFeedbackRating(Math.round(selectedExcursion.rating) || 5);
                          }}
                          className="flex items-center gap-1 text-[#d4af37] hover:text-amber-300 transition-colors cursor-pointer bg-stone-900/50 border border-[#d4af37]/20 rounded-md px-2 py-0.5"
                          title="Click to Rate this Journey"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{selectedExcursion.rating ? selectedExcursion.rating.toFixed(1) : '0.0'}</span>
                        </button>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed">
                        {selectedExcursion.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights & Inclusions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
                    <div className="space-y-2.5">
                      <h4 className="font-serif text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#d4af37]" /> {language === 'de' ? 'Highlights des Tages' : language === 'pl' ? 'Atrakcje dnia' : 'Highlights of the Day'}
                      </h4>
                      <ul className="space-y-1.5 text-stone-300 text-xs list-disc list-inside">
                        {selectedExcursion.highlights.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-serif text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {language === 'de' ? 'Königliche Inklusivleistungen' : language === 'pl' ? 'Królewskie świadczenia' : 'Royal Inclusions'}
                      </h4>
                      <ul className="space-y-1.5 text-stone-300 text-xs list-disc list-inside">
                        {selectedExcursion.inclusions.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ancient Egypt Lore Deep Dive */}
                  <div className="bg-[#1f1914] border border-[#d4af37]/35 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-3 right-4 font-serif text-stone-700/40 text-4xl select-none pointer-events-none">
                      𓋹
                    </div>
                    <h4 className="font-serif text-[#d4af37] font-extrabold uppercase text-sm mb-1">
                      {language === 'de' ? 'Geheimnisse des alten Ägyptens' : language === 'pl' ? 'Tajemnice starożytnego Egiptu' : 'Ancient Egyptian Mysteries'}
                    </h4>
                    <p className="text-stone-300 text-xs leading-relaxed italic">
                      {selectedExcursion.ancientLore}
                    </p>
                  </div>

                  {/* Reviews & Testimonials specifically for this excursion */}
                  <div className="space-y-4 pt-4 border-t border-stone-800">
                    <h4 className="font-serif text-[#e6c280] font-bold uppercase text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#d4af37] fill-current" />
                      {language === 'de' ? 'Erfahrungsberichte von Entdeckern' : language === 'pl' ? 'Świadectwa i opinie odkrywców' : 'Explorer Witness Testimonies'}
                    </h4>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      {language === 'de' ? 'Lesen Sie, was andere edle Reisende über diese spezielle Karawanenpassage geschrieben haben, oder hinterlassen Sie unten Ihr eigenes Siegel der Anerkennung.' : language === 'pl' ? 'Przeczytaj, co inni szlachetni podróżnicy napisali o tej trasie, lub zostaw poniżej własną pieczęć aprobaty.' : 'Read what preceding noble travelers have inscribed about this specific caravan passage, or leave your own seal of approval below.'}
                    </p>
                    <ReviewSystem excursionId={selectedExcursion.id} />
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-800">
                    <div>
                      <span className="text-stone-500 text-xs uppercase tracking-widest block font-mono">{language === 'de' ? 'Gesamtpreis' : language === 'pl' ? 'Cena całkowita' : 'Total Rate'}</span>
                      <strong className="text-3xl font-mono text-[#d4af37]">${selectedExcursion.price}</strong>
                      <span className="text-stone-400 text-xs font-normal"> {language === 'de' ? ' / Person' : language === 'pl' ? ' / osoba' : ' / person'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const msg = `𓂀 Kemet Tours - Powered by Mas international Agency - EXPEDITION DOSSIER INQUIRY 𓂀\n\nGreetings Scribe! I was reviewing the beautiful details of "${selectedExcursion.title}" (${selectedExcursion.duration}) located in "${selectedExcursion.location}". Can you please advise me on availability, customization options, and seasonal discounts?`;
                          const url = `https://wa.me/201202181834?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank') || (window.location.href = url);
                        }}
                        className="bg-emerald-950/25 hover:bg-emerald-900/35 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono text-xs uppercase tracking-widest py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-emerald-400 text-xs">𓍢</span> {language === 'de' ? 'Auf WhatsApp anfragen' : language === 'pl' ? 'Zapytaj na WhatsApp' : 'Inquire on WhatsApp'}
                      </button>
                      <button
                        onClick={() => setIsBookingOpen(true)}
                        className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e5c250] hover:to-[#c5a02e] text-[#140f0a] font-serif font-black text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-[#d4af37]/20 cursor-pointer text-center"
                      >
                        {language === 'de' ? 'Expedition jetzt buchen' : language === 'pl' ? 'Zarezerwuj ekspedycję teraz' : 'Book Expedition Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // BOOKING FORM CONTENT
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-widest block">{language === 'de' ? 'Expeditionen-Buchungsbuch' : language === 'pl' ? 'Księga rezerwacji ekspedycji' : 'Expedition Booking Ledger'}</span>
                    <h3 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wider mt-1">
                      {language === 'de' ? 'Königliche Passage anfordern' : language === 'pl' ? 'Poproś o królewskie przejście' : 'Request Royal Passage'}
                    </h3>
                    <p className="text-stone-400 text-xs">
                      {language === 'de' ? 'In die Expedition eintragen' : language === 'pl' ? 'Zapisz się na ekspedycję' : 'Enlist in the expedition'}: {selectedExcursion.title} (${selectedExcursion.price} {language === 'de' ? 'pro Person' : language === 'pl' ? 'za osobę' : 'per person'})
                    </p>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#d4af37]" /> {language === 'de' ? 'Name des Reisenden' : language === 'pl' ? 'Imię i nazwisko' : 'Traveler Name'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={travelerName}
                          onChange={(e) => setTravelerName(e.target.value)}
                          placeholder="Queen Nefertari / Ramses Smith"
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-name"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={travelerEmail}
                          onChange={(e) => setTravelerEmail(e.target.value)}
                          placeholder="your.email@domain.com"
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-email"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+20 120 218 1834"
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-phone"
                        />
                      </div>

                      {/* WhatsApp Number */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
                          </label>
                          <label className="text-[10px] text-stone-400 flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sameWhatsapp}
                              onChange={(e) => setSameWhatsapp(e.target.checked)}
                              className="accent-[#d4af37]"
                            />
                            Same as phone
                          </label>
                        </div>
                        {!sameWhatsapp && (
                          <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+20 120 218 1834"
                            className="w-full bg-[#1c1611] border border-emerald-500/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            id="booking-whatsapp"
                          />
                        )}
                      </div>

                      {/* Hotel Name */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#d4af37]" /> Hotel Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={hotelName}
                          onChange={(e) => setHotelName(e.target.value)}
                          placeholder="e.g. Steigenberger Alcazar / Sunrise Resort"
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-hotel"
                        />
                      </div>

                      {/* Room Number & Pickup Time */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#d4af37]" /> Room # *
                          </label>
                          <input
                            type="text"
                            required
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g. 402"
                            className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                            id="booking-room"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#d4af37]" /> Pickup Time
                          </label>
                          <select
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                            id="booking-time"
                          >
                            <option value="05:30 AM">05:30 AM (Early Sunrise)</option>
                            <option value="07:30 AM">07:30 AM (Standard Morning)</option>
                            <option value="09:00 AM">09:00 AM (Late Morning)</option>
                            <option value="01:30 PM">01:30 PM (Afternoon Desert)</option>
                            <option value="04:00 PM">04:00 PM (Sunset Cruise)</option>
                          </select>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> {language === 'de' ? 'Abreisedatum' : language === 'pl' ? 'Data wyjazdu' : 'Departure Date'} *
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-date"
                        />
                      </div>

                      {/* Guests */}
                      <div className="space-y-1">
                        <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#d4af37]" /> {language === 'de' ? 'Größe der Karawane (Gäste)' : language === 'pl' ? 'Wielkość karawany (liczba gości)' : 'Size of Caravan (Guests)'} *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={25}
                          required
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full bg-[#1c1611] border border-[#d4af37]/40 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                          id="booking-guests"
                        />
                      </div>
                    </div>

                    {/* Promo Code Input */}
                    <div className="bg-[#18120d] border border-[#d4af37]/30 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono uppercase text-[#d4af37] tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Promocode Scroll (Requires Registration)
                        </span>
                        {appliedPromo && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                            ✓ {appliedPromo.code} ({appliedPromo.discountPct}% OFF)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder="e.g. SOLSTICERA15 or PHARAOH25"
                          className="flex-1 bg-[#0c0907] border border-[#d4af37]/30 rounded-lg px-3 py-1.5 text-stone-200 text-xs uppercase font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromoCode}
                          className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37] text-[#d4af37] px-4 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider font-bold transition-all cursor-pointer"
                        >
                          Apply Code
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[10px] text-red-400 font-mono">{promoError}</p>
                      )}
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-1">
                      <label className="text-stone-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" /> {language === 'de' ? 'Besondere Wünsche eintragen' : language === 'pl' ? 'Wpisz życzenia specjalne' : 'Inscribe Special Requests'}
                      </label>
                      <textarea
                        value={requests}
                        onChange={(e) => setRequests(e.target.value)}
                        placeholder={language === 'de' ? "Diätwünsche, Zimmernummern für die Abholung, körperliche Einschränkungen..." : language === 'pl' ? "Wymagania dietetyczne, numery pokoi do odbioru, ograniczenia ruchowe..." : "Dietary requests, pick-up room numbers, physical constraints..."}
                        rows={3}
                        className="w-full bg-[#1c1611] border border-[#d4af37]/30 rounded-lg p-3 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                        id="booking-requests"
                      />
                    </div>

                    {/* Price calculation summary */}
                    <div className="bg-[#241a12] border border-[#d4af37]/20 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-400 font-mono uppercase">
                        <span>Base Price (${selectedExcursion.price} × {guests} guests):</span>
                        <span>${selectedExcursion.price * guests}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between items-center text-emerald-400 font-mono font-bold">
                          <span>Promo Discount ({appliedPromo.code} - {appliedPromo.discountPct}%):</span>
                          <span>-${Math.round(((selectedExcursion.price * guests) * appliedPromo.discountPct) / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-[#d4af37]/20">
                        <span className="text-[#e6c280] font-serif uppercase tracking-wider font-bold">Total Tribute:</span>
                        <strong className="text-xl font-mono text-[#d4af37]">
                          ${(selectedExcursion.price * guests) - (appliedPromo ? Math.round(((selectedExcursion.price * guests) * appliedPromo.discountPct) / 100) : 0)}
                        </strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(false)}
                        className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer"
                      >
                        {language === 'de' ? 'Zurück' : language === 'pl' ? 'Wstecz' : language === 'cs' ? 'Zpět' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        className="bg-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest px-8 py-2.5 rounded-lg shadow-md shadow-[#d4af37]/15 cursor-pointer hover:bg-amber-300"
                        id="submit-passage-btn"
                      >
                        {language === 'de' ? 'Passage-Anfrage abschicken' : language === 'pl' ? 'Wyślij prośbę o przejście' : language === 'cs' ? 'Odeslat žádost o plavbu' : 'Submit Passage Inscription'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pharaonic Feedback Tablet (Interactive Rating Widget Modal) */}
      <AnimatePresence>
        {ratingExcursion && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#140f0c] border-2 border-[#d4af37] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative p-6 md:p-8"
            >
              {/* Decorative Horus Eye background */}
              <div className="absolute top-2 right-4 text-stone-900/25 font-serif text-6xl select-none pointer-events-none">
                𓂀
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setRatingExcursion(null)}
                className="absolute top-4 right-4 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {feedbackSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="inline-flex bg-gradient-to-br from-[#d4af37] to-amber-500 p-4 rounded-full border border-[#d4af37]/35 shadow-lg animate-bounce">
                    <Sparkles className="w-8 h-8 text-[#140f0a]" />
                  </div>
                  <h4 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wider">
                    {language === 'de' ? 'Feedback eingetragen!' : language === 'pl' ? 'Opinia została zapisana!' : language === 'cs' ? 'Zpětná vazba uložena!' : 'Feedback Inscribed!'}
                  </h4>
                  <p className="text-stone-300 text-xs max-w-sm mx-auto leading-relaxed">
                    {language === 'de' ? 'Durch die ewige Weisheit von Thoth wurde Ihre heilige Bewertung auf die dauerhaften Tafeln von Kemet eingraviert. Mögen die Götter Ihre Reisen segnen!' : language === 'pl' ? 'Dzięki wiecznej mądrości Thota Twoja święta opinia została wyryta na trwałych tablicach Kemet. Niech bogowie błogosławią Twoje podróże!' : language === 'cs' ? 'Díky věčné moudrosti Thovta bylo vaše posvátné hodnocení vyryto na trvalé tabulky Kemetu. Nechť bohové žehnají vašim cestám!' : 'By the eternal wisdom of Thoth, your sacred review has been etched onto the permanent tablets of Kemet. May the gods bless your travels!'}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-400 animate-pulse uppercase tracking-widest pt-2">
                    {language === 'de' ? '𓋹 Himmlische Mittelwerte abgleichen...' : language === 'pl' ? '𓋹 Dopasowywanie niebiańskich średnich...' : language === 'cs' ? '𓋹 Slaďování nebeských průměrů...' : '𓋹 Aligning Celestial Averages...'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.2em] block">{language === 'de' ? 'Feedback-Tafel beschriften' : language === 'pl' ? 'Zapisz tablicę opinii' : language === 'cs' ? 'Zapsat tabulku zpětné vazby' : 'Inscribe Feedback Tablet'}</span>
                    <h3 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wide">
                      {ratingExcursion.title}
                    </h3>
                    <p className="text-stone-400 text-xs">
                      {language === 'de' ? 'Teilen Sie Ihren echten Reisebericht und bewerten Sie diese Reise' : language === 'pl' ? 'Podziel się swoim prawdziwym świadectwem z podróży i oceń tę wyprawę' : language === 'cs' ? 'Podělte se o své skutečné svědectví z cesty a ohodnoťte tuto plavbu' : 'Share your genuine traveler testimony & rate this voyage'}
                    </p>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    {/* Interactive Star Picker */}
                    <div className="bg-[#1b1511] border border-[#d4af37]/20 rounded-2xl p-4 text-center space-y-2">
                      <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                        {language === 'de' ? 'Wählen Sie die heilige Bewertung' : language === 'pl' ? 'Wybierz świętą ocenę' : language === 'cs' ? 'Vyberte posvátné hodnocení' : 'Select Sacred Rating'}
                      </label>
                      <div className="flex justify-center gap-3 py-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFeedbackRating(num)}
                            onMouseEnter={() => setHoveredFeedbackStar(num)}
                            onMouseLeave={() => setHoveredFeedbackStar(null)}
                            className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                            title={`${num} Star${num > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-8 h-8 transition-all ${
                                num <= (hoveredFeedbackStar ?? feedbackRating) 
                                  ? 'text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                  : 'text-stone-800 border-stone-900'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-stone-500 text-[11px] font-mono uppercase tracking-widest block h-4">
                        {language === 'de' ? (
                          feedbackRating === 5 ? "👑 Würdig der Götter!" :
                          feedbackRating === 4 ? "✨ Herrliche Karawanenreise!" :
                          feedbackRating === 3 ? "👍 Zufriedenstellende Ausrichtung" :
                          feedbackRating === 2 ? "⚠️ Deshret Sandstürme" :
                          "❌ Verloren im Duat!"
                        ) : language === 'pl' ? (
                          feedbackRating === 5 ? "👑 Godne bogów!" :
                          feedbackRating === 4 ? "✨ Wspaniała podróż karawaną!" :
                          feedbackRating === 3 ? "👍 Satysfakcjonująca harmonia" :
                          feedbackRating === 2 ? "⚠️ Burze piaskowe Deshret" :
                          "❌ Zagubiony w Duat!"
                        ) : language === 'cs' ? (
                          feedbackRating === 5 ? "👑 Hodno bohů!" :
                          feedbackRating === 4 ? "✨ Nádherná cesta karavanou!" :
                          feedbackRating === 3 ? "👍 Uspokojivý soulad" :
                          feedbackRating === 2 ? "⚠️ Písečné bouře Deshretu" :
                          "❌ Ztracen v Duatu!"
                        ) : (
                          feedbackRating === 5 ? "👑 Worthy of the Gods!" :
                          feedbackRating === 4 ? "✨ Splendid Caravan Journey!" :
                          feedbackRating === 3 ? "👍 Satisfactory Alignment" :
                          feedbackRating === 2 ? "⚠️ Deshret Dust Storms" :
                          "❌ Lost in the Duat!"
                        )} ({feedbackRating} {language === 'de' ? '/ 5 Sterne' : language === 'pl' ? '/ 5 Gwiazdek' : language === 'cs' ? '/ 5 Hvězdiček' : '/ 5 Stars'})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                          {language === 'de' ? 'Ihr edler Name' : language === 'pl' ? 'Twoje szlachetne imię' : language === 'cs' ? 'Vaše ušlechtilé jméno' : 'Your Noble Name'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={language === 'de' ? "z.B. Cleopatra Schmidt" : language === 'pl' ? "np. Kleopatra Kowalska" : language === 'cs' ? "např. Kleopatra Nováková" : "e.g. Cleopatra Johnson"}
                          value={feedbackAuthor}
                          onChange={(e) => setFeedbackAuthor(e.target.value)}
                          className="w-full bg-[#1c1611] border border-[#d4af37]/35 rounded-xl p-2.5 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                        />
                      </div>

                      {/* Avatar */}
                      <div className="space-y-1">
                        <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                          {language === 'de' ? 'Pharaonische Persona' : language === 'pl' ? 'Faraońska persona' : language === 'cs' ? 'Faraonská osobnost' : 'Pharaonic Persona'}
                        </label>
                        <select
                          value={feedbackAvatar}
                          onChange={(e) => setFeedbackAvatar(e.target.value)}
                          className="w-full bg-[#1c1611] border border-[#d4af37]/35 rounded-xl p-2.5 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                        >
                          <option value="𓁠 Cleopatra">{language === 'de' ? '𓁠 Cleopatra die Taucherin' : language === 'pl' ? '𓁠 Kleopatra Nurkini' : language === 'cs' ? '𓁠 Kleopatra potápěčka' : '𓁠 Cleopatra the Diver'}</option>
                          <option value="𓀚 Ramses">{language === 'de' ? '𓀚 Ramses der Nomade' : language === 'pl' ? '𓀚 Ramzes Nomada' : language === 'cs' ? '𓀚 Ramesse nomád' : '𓀚 Ramses the Nomad'}</option>
                          <option value="𓁥 Hatshepsut">{language === 'de' ? '𓁥 Hatschepsut die Schreiberin' : language === 'pl' ? '𓁥 Hatszepsut Pisarka' : language === 'cs' ? '𓁥 Hatšepsut písařka' : '𓁥 Hatshepsut the Scribe'}</option>
                          <option value="𓃠 Bastet">{language === 'de' ? '𓃠 Bastet die Entdeckerin' : language === 'pl' ? '𓃠 Bastet Odkrywczyni' : language === 'cs' ? '𓃠 Bastet objevitelka' : '𓃠 Bastet the Explorer'}</option>
                          <option value="𓆛 Sobek">{language === 'de' ? '𓆛 Sobek der Seefahrer' : language === 'pl' ? '𓆛 Sobek Żeglarz' : language === 'cs' ? '𓆛 Sobek mořeplavec' : '𓆛 Sobek the Mariner'}</option>
                          <option value="𓅃 Horus">{language === 'de' ? '𓅃 Horus der Flieger' : language === 'pl' ? '𓅃 Horus Szybki' : language === 'cs' ? '𓅃 Horus letec' : '𓅃 Horus the Speedster'}</option>
                          <option value="𓋹 Anubis">{language === 'de' ? '𓋹 Anubis der Wächter' : language === 'pl' ? '𓋹 Anubis Strażnik' : language === 'cs' ? '𓋹 Anup strážce' : '𓋹 Anubis the Guardian'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1">
                      <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                        {language === 'de' ? 'Zeugenbericht' : language === 'pl' ? 'Zeznanie świadka' : language === 'cs' ? 'Svědectví cestovatele' : 'Witness Testimony'}
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder={language === 'de' ? "Schreiben Sie Ihre Bewertung... (z. B. Das Korallenriff war fantastisch!)" : language === 'pl' ? "Napisz swoją opinię... (np. Rafa koralowa była niesamowita, a przewodnik bardzo pomocny!)" : language === 'cs' ? "Napište své hodnocení... (např. Korálový útes byl úžasný, průvodce velmi ochotný!)" : "Write thy feedback... (e.g., The coral reef was mindblowing, the guide was very informative!)"}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full bg-[#1c1611] border border-[#d4af37]/35 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors leading-relaxed"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRatingExcursion(null)}
                        className="flex-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        {language === 'de' ? 'Tafel verwerfen' : language === 'pl' ? 'Odrzuć tabliczkę' : language === 'cs' ? 'Zahodit tabulku' : 'Banish Tablet'}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#e5c250] hover:to-[#c5a02e] text-[#140f0a] font-bold py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === 'de' ? 'Erfahrungsbericht eintragen' : language === 'pl' ? 'Zapisz świadectwo' : language === 'cs' ? 'Zapsat svědectví' : 'Inscribe Testimony'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
