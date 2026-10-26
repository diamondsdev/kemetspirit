import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, MapPin, Compass, BookOpen, Info, Sparkles, ExternalLink, Anchor, ChevronRight, Search, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface SiteData {
  id: string;
  name: string;
  ancientName: string;
  glyph: string;
  coordinates: { x: number; y: number }; // SVG Map Coordinates
  region: string;
  facts: string[];
  lore: string;
  relatedExcursionId?: string;
  relatedExcursionName?: string;
}

export default function AncientSitesMap() {
  const { language } = useLanguage();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('luxor-waset');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [ancientSites, setAncientSites] = useState<SiteData[]>([]);

  // Fetch ancient sites dynamically from the backend JSON database on mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('/api/ancient-sites');
        if (response.ok) {
          const data = await response.json();
          setAncientSites(data);
        }
      } catch (err) {
        console.error("Failed to load ancient sites from database server:", err);
      }
    };
    fetchSites();
  }, []);

  // Translate sites dynamically
  const localizedSites = useMemo(() => {
    if (language === 'de') {
      return [
        {
          id: 'giza-pyramids',
          name: "Gizeh-Plateau",
          ancientName: "Achet Chufu",
          glyph: "𓉴",
          coordinates: { x: 265, y: 140 },
          region: "Unterägypten",
          facts: [
            "Heimat der Großen Pyramide von Gizeh, dem ältesten der sieben Weltwunder der Antike.",
            "Bewacht von der kolossalen Großen Sphinx von Gizeh, die aus einem einzigen Kalksteinrücken gemeißelt wurde.",
            "Die Pyramiden waren mit absoluter Präzision astronomisch auf den Oriongürtel ausgerichtet."
          ],
          lore: "Den Alten bekannt als 'Achet Chufu' (Der Horizont des Cheops), galt dieses Plateau als kosmische Startrampe. Es erlaubte der Seele des Pharaos, in die nördlichen zirkumpolaren Sterne aufzufahren und sich den unsterblichen Göttern im Jenseits anzuschließen.",
          relatedExcursionId: undefined,
          relatedExcursionName: "Individuelle Kairo-Erweiterung (Fragen Sie unseren KI-Assistenten!)"
        },
        {
          id: 'luxor-waset',
          name: "Luxor (Karnak & Tal der Könige)",
          ancientName: "Waset",
          glyph: "𓉐",
          coordinates: { x: 308, y: 350 },
          region: "Oberägypten",
          facts: [
            "Waset war das Machtzentrum des Neuen Reiches, gewidmet dem höchsten Sonnenschöpfer Amun-Ra.",
            "Beherbergt Karnak, den größten jemals von Menschenhand errichteten Tempelkomplex.",
            "Beherbergt das Tal der Könige, wo die Pharaonen in verzierten Felsengräbern versiegelt wurden."
          ],
          lore: "Die Überquerung vom Ostufer (Sonnenaufgang/Lebende) zum Westufer (Sonnenuntergang/Gräber) von Luxor bedeutet, den mystischen Schleier zu durchdringen. Die Königsgräber sind tief in die Kalksteinpyramide von Al-Qurn gemeißelt und ahmen Ras nächtliche Reise in die Unterwelt nach.",
          relatedExcursionId: "history-1",
          relatedExcursionName: "Pilgerfahrt des Pharaos nach Waset (Luxor)"
        },
        {
          id: 'ras-mohammed',
          name: "Ras-Mohammed-Naturschutzgebiet",
          ancientName: "Nuns Tiefseebecken",
          glyph: "𓆛",
          coordinates: { x: 382, y: 205 },
          region: "Rotes Meer & Sinai",
          facts: [
            "Ein geschützter Meeres-Nationalpark an der äußersten Spitze der Sinai-Halbinsel.",
            "Bietet spektakuläre vertikale Korallenwände, die über 1.000 Meter tief in das Meer abfallen.",
            "Heimat lebendiger Ökosysteme mit Riesen-Lippfischen, Meeresschildkröten und Hammerhaien."
          ],
          lore: "Antike Seefahrer und Priester von Hathor betrachteten die warmen Strömungen von Ras Mohammed als physische Manifestationen von Nun – dem Urabgrund, aus dem alles Leben hervorging. Unterwasser-Monumente wurden an den Küsten hinterlassen, um die Meeresgeister zu besänftigen.",
          relatedExcursionId: "diving-1",
          relatedExcursionName: "Königliches Korallentauchen in Ras Mohammed"
        },
        {
          id: 'hurghada-coast',
          name: "Hurghada-Dünen & Deshret",
          ancientName: "Sets Deshret-Küste",
          glyph: "𓅓",
          coordinates: { x: 370, y: 238 },
          region: "Rotes Meer & Östliche Wüste",
          facts: [
            "Eine majestätische Grenze, an der die goldenen Berge der Östlichen Wüste auf das Rote Meer treffen.",
            "Berühmt für rollende Wüstendünen, Beduinen-Oasen und raue Gebirgspässe.",
            "Idealer Ort für schnelle Quad-Expeditionen und langsame Kamelritte im Sonnenuntergang."
          ],
          lore: "Dieses rote Wüstenland wurde von den Pharaonen 'Deshret' (Das rote Land) genannt, gefürchtet und doch respektiert als das chaotische Reich von Set, dem Gott der Stürme. Antike Bergleute durchquerten diese rauen Länder, um Gold und Türkis für Tempelopfer zu sammeln.",
          relatedExcursionId: "safari-1",
          relatedExcursionName: "Sets Goldene Deshret-Safari"
        },
        {
          id: 'giftun-island',
          name: "Giftun-Insel (Orange Bay)",
          ancientName: "Sobeks Türkisreich",
          glyph: "𓍢",
          coordinates: { x: 388, y: 242 },
          region: "Rote-Meer-Inseln",
          facts: [
            "Ein geschütztes Naturschutzgebiet, berühmt für feine weiße Sandstrände und kristallklares Wasser.",
            "Umgeben von flachen, kreisförmigen Lagunen voller farbenfroher Korallen.",
            "Delfinschulen werden regelmäßig beim Spielen an den unberührten flachen Sandbänken gesichtet."
          ],
          lore: "In der Antike war das Segeln um die Inseln des Roten Meeres der Ehrung von Sobek, dem Krokodilgott der Wasserwege, gewidmet. Mit Blattgold verzierte Zedernholz-Lustschiffe ruderten durch diese türkisfarbenen Gewässer, um die Gunst der Götter zu erlangen.",
          relatedExcursionId: "boat-1",
          relatedExcursionName: "Sobeks Königliche Königin-Nefertari-Kreuzfahrt"
        },
        {
          id: 'el-gouna',
          name: "El Gouna & Nördliche Inseln",
          ancientName: "Horus-Lagune",
          glyph: "𓅃",
          coordinates: { x: 362, y: 218 },
          region: "Rote-Meer-Lagunen",
          facts: [
            "Ein atemberaubendes Netzwerk aus flachen türkisfarbenen Kanälen, Lagunen und Sandinseln.",
            "Umgeben von geheimen, unberichten Korallengärten abseits der überfüllten öffentlichen Plätze.",
            "Bietet tiefblaues Wasser für rasante Erkundungen mit luxuriösen Schnellbooten."
          ],
          lore: "Der Falkengott Horus, symbolisch für Schnelligkeit und göttliche Sicht, patrouillierte angeblich vom Himmel aus über den Gewässern des Roten Meeres. Pharaonische Späher segelten mit schnellen Papyrusbooten durch diese Lagunen und gaben Spiegelsignale, um die Grenzen im Landesinneren zu schützen.",
          relatedExcursionId: "speedboat-1",
          relatedExcursionName: "Horus' Falkenauge-Schnellbootfahrt"
        }
      ];
    }

    if (language === 'pl') {
      return [
        {
          id: 'giza-pyramids',
          name: "Płaskowyż Giza",
          ancientName: "Akhet Khufu",
          glyph: "𓉴",
          coordinates: { x: 265, y: 140 },
          region: "Dolny Egipt",
          facts: [
            "Dom Wielkiej Piramidy w Gizie, najstarszego z siedmiu cudów starożytnego świata.",
            "Strzeżony przez kolosalnego Wielkiego Sfinksa z Gizy, wykutego z jednego grzbietu wapiennego.",
            "Piramidy zostały astronomicznie dopasowane z absolutną precyzją do Pasa Oriona."
          ],
          lore: "Znany starożytnym jako „Akhet Khufu” (Horyzont Chufu), ten płaskowyż był uważany za kosmiczną platformę startową. Pozwalał on duszy Faraona wstąpić do północnych gwiazd okołobiegunowych, dołączając do nieśmiertelnych bogów w zaświatach.",
          relatedExcursionId: undefined,
          relatedExcursionName: "Niestandardowe rozszerzenie Kairu (Zgłoś prośbę przez Wyrocznię Pisarza!)"
        },
        {
          id: 'luxor-waset',
          name: "Luksor (Karnak i Dolina Królów)",
          ancientName: "Waset",
          glyph: "𓉐",
          coordinates: { x: 308, y: 350 },
          region: "Górny Egipt",
          facts: [
            "Waset było potęgą Nowego Państwa, poświęconą najwyższemu stwórcy słońca Amonowi-Ra.",
            "Obejmuje Karnak, największy kompleks świątynny, jaki kiedykolwiek zbudowano ludzkimi rękami.",
            "Mieści Dolinę Królów, gdzie faraonowie spoczywali zapieczętowani w zdobionych grobowcach skalnych."
          ],
          lore: "Przejście ze Wschodniego Brzegu (wschód słońca/życie) na Zachodni Brzeg (zachód słońca/grobowce) Luksoru to przekroczenie mistycznej zasłony. Grobowce królewskie są wyrzeźbione głęboko w wapiennej piramidzie Al-Qurn, naśladując nocną podróż Ra do podziemi.",
          relatedExcursionId: "history-1",
          relatedExcursionName: "Pielgrzymka Faraona do Waset (Luksor)"
        },
        {
          id: 'ras-mohammed',
          name: "Sanktuarium Ras Muhammad",
          ancientName: "Głęboki Basin Nun",
          glyph: "𓆛",
          coordinates: { x: 382, y: 205 },
          region: "Morze Czerwone i Synaj",
          facts: [
            "Chroniony morski park narodowy położony na samym krańcu Półwyspu Synaj.",
            "Posiada spektakularne pionowe ściany koralowe opadające ponad 1000 metrów w głąb morza.",
            "Dom tętniących życiem ekosystemów z wargaczami garbogłowymi, żółwiami morskimi i żarłaczami młotami."
          ],
          lore: "Starożytni żeglarze i kapłani Hathor uważali ciepłe prądy Ras Muhammad za fizyczną manifestację Nun — pierwotnej otchłani, z której wyłoniło się całe życie. Na brzegach pozostawiano zatopione pomniki, aby przebłagać duchy morskie.",
          relatedExcursionId: "diving-1",
          relatedExcursionName: "Królewskie nurkowanie koralowe w Ras Muhammad"
        },
        {
          id: 'hurghada-coast',
          name: "Wydmy Hurghady i Deshret",
          ancientName: "Wybrzeże Deshret Seta",
          glyph: "𓅓",
          coordinates: { x: 370, y: 238 },
          region: "Morze Czerwone i Pustynia Wschodnia",
          facts: [
            "Majestatyczna granica, na której złote góry Pustyni Wschodniej spotykają się z brzegiem Morza Czerwonego.",
            "Słynie z ruchomych wydm pustynnych, oaz beduińskich i surowych przełęczy górskich.",
            "Idealne miejsce na szybkie wyprawy quadami i powolne przejażdżki na wielbłądach o zachodzie słońca."
          ],
          lore: "Ta czerwona pustynna ziemia była nazywana przez faraonów „Deshret” (Czerwona Ziemia), budząc lęk, ale i szacunek jako chaotyczna domena Seta, boga burz. Starożytni górnicy przemierzali te surowe ziemie, aby zbierać złoto i turkus na ofiary świątynne.",
          relatedExcursionId: "safari-1",
          relatedExcursionName: "Złote Safari Deshret Seta"
        },
        {
          id: 'giftun-island',
          name: "Wyspa Giftun (Orange Bay)",
          ancientName: "Turkusowe Królestwo Sobka",
          glyph: "𓍢",
          coordinates: { x: 388, y: 242 },
          region: "Wyspy Morza Czerwonego",
          facts: [
            "Chroniony rezerwat przyrody, słynący z miękkiego białego piasku i przezroczystej, krystalicznej wody.",
            "Otoczony płytkimi, kolistymi lagunami tętniącymi życiem kolorowych koralowców.",
            "Stada delfinów są regularnie widywane podczas zabawy w pobliżu nieskazitelnych płytkich ławic piaszczystych."
          ],
          lore: "W starożytności żeglowanie wokół wysp Morza Czerwonego było poświęcone czci Sobka, krokodylego pana dróg wodnych. Cedrowe statki wycieczkowe zdobione płatkami złota pływały po tych turkusowych wodach, aby zdobyć boską przychylność.",
          relatedExcursionId: "boat-1",
          relatedExcursionName: "Królewski Rejs Królowej Nefertari dla Sobka"
        },
        {
          id: 'el-gouna',
          name: "El Gouna i Wyspy Północne",
          ancientName: "Laguna Horusa",
          glyph: "𓅃",
          coordinates: { x: 362, y: 218 },
          region: "Laguny Morza Czerwonego",
          facts: [
            "Zapierająca dech w piersiach sieć płytkich turkusowych kanałów, lagun i piaszczystych wysp.",
            "Otoczona sekretnymi, nienaruszonymi ogrodami koralowymi z dala od zatłoczonych miejsc publicznych.",
            "Oferuje głębokie błękitne wody idealne do szybkich eksploracji luksusowymi motorówkami."
          ],
          lore: "Mówiono, że bog sokół Horus, symbol prędkości i boskiego wzroku, patroluje wody Morza Czerwonego z niebios. Faraońscy zwiadowcy żeglowali szybkimi łodziami papirusowymi przez te laguny, wysyłając sygnały lustrzane, aby chronić granice śródlądowe.",
          relatedExcursionId: "speedboat-1",
          relatedExcursionName: "Rejs Motorówką Sokole Oko Horusa"
        }
      ];
    }

    if (language === 'cs') {
      return [
        {
          id: 'giza-pyramids',
          name: "Plošina v Gíze",
          ancientName: "Achet Chufu",
          glyph: "𓉴",
          coordinates: { x: 265, y: 140 },
          region: "Dolní Egypt",
          facts: [
            "Domov Velké pyramidy v Gíze, nejstaršího ze sedmi divů starověkého světa.",
            "Střežen kolosální Velkou sfingou v Gíze, vytesanou z jediného vápencového hřebene.",
            "Pyramidy byly astronomicky zarovnány s absolutní přesností podle Orionova pásu."
          ],
          lore: "Starověkým lidem známá jako 'Achet Chufu' (Chufuův obzor). Tato plošina byla považována za kosmickou startovací rampu, která umožňovala duši faraona vystoupit k severním hvězdám a připojit se k nesmrtelným bohům v posmrtném životě.",
          relatedExcursionId: undefined,
          relatedExcursionName: "Vlastní rozšíření do Káhiry (vyžádejte si u Orákula!)"
        },
        {
          id: 'luxor-waset',
          name: "Luxor (Karnak a Údolí králů)",
          ancientName: "Vaset",
          glyph: "𓉐",
          coordinates: { x: 308, y: 350 },
          region: "Horní Egypt",
          facts: [
            "Vaset byl mocenským centrem Nové říše, zasvěceným nejvyššímu slunečnímu stvořiteli Amon-Ra.",
            "Představuje Karnak, největší náboženský chrámový komplex, jaký kdy byl postaven lidskou rukou.",
            "Nachází se zde Údolí králů, kde byli faraoni zpečetěni v bohatě zdobených hrobkách."
          ],
          lore: "Přejít z Východního břehu (východ slunce/živí) na Západní břeh (západ slunce/hrobky) v Luxoru znamená překročit mystický závoj. Královské hrobky jsou vytesány hluboko do vápencové pyramidy Al-Qurn, což napodobuje noční cestu boha Ra do podsvětí.",
          relatedExcursionId: "history-1",
          relatedExcursionName: "Faraonská pouť do Vasetu (Luxor)"
        },
        {
          id: 'ras-mohammed',
          name: "Rezervace Ras Mohammed",
          ancientName: "Hlubinná pánev boha Nuna",
          glyph: "𓆛",
          coordinates: { x: 382, y: 205 },
          region: "Rudé moře a Sinaj",
          facts: [
            "Chráněný mořský národní park nacházející se na samotném cípu Sinajského poloostrova.",
            "Představuje velkolepé vertikální korálové stěny klesající přes 1000 metrů do hlubokého moře.",
            "Domov živých ekosystémů pyskounů obrovských, mořských želv a kladivounů."
          ],
          lore: "Starověcí mořeplavci a kněží bohyně Hathor považovali teplé proudy u Ras Mohammed za fyzické projevy Nuna – prvotní propasti, z níž vzešel veškerý život. Na pobřeží se nechávaly potopené monumenty pro usmíření mořských duchů.",
          relatedExcursionId: "diving-1",
          relatedExcursionName: "Královské potápění u korálů v Ras Mohammed"
        },
        {
          id: 'hurghada-coast',
          name: "Duny v Hurghadě a Deshret",
          ancientName: "Setovo pobřeží Deshret",
          glyph: "𓅓",
          coordinates: { x: 370, y: 238 },
          region: "Rudé moře a Východní poušť",
          facts: [
            "Majestátní hranice, kde se zlaté hory Východní pouště setkávají s pobřežím Rudého moře.",
            "Slavné pro pohyblivé pouštní duny, beduínské oázy a drsné horské průsmyky.",
            "Ideální místo pro rychlé expedice na čtyřkolkách a pomalé vyjížďky na velbloudech při západu slunce."
          ],
          lore: "Tato červená pouštní země byla faraony nazývána 'Deshret' (Červená země). Byla obávaná, ale zároveň respektovaná jako chaotická doména Seta, boha bouří. Starověcí horníci křižovali tyto drsné kraje, aby získali zlato a tyrkys jako chrámové dary.",
          relatedExcursionId: "safari-1",
          relatedExcursionName: "Setovo zlaté pouštní safari Deshret"
        },
        {
          id: 'giftun-island',
          name: "Ostrov Giftun (Orange Bay)",
          ancientName: "Sobekova tyrkysová říše",
          glyph: "𓍢",
          coordinates: { x: 388, y: 242 },
          region: "Ostrovy Rudého moře",
          facts: [
            "Chráněná přírodní rezervace slavná svým jemným bílým pískem a průzračnou křišťálovou vodou.",
            "Obklopen mělkými kruhovými lagunami překypujícími barevnými korály.",
            "V blízkosti panenských písčin jsou pravidelně pozorovány skupinky hravých delfínů."
          ],
          lore: "Ve starověku bylo plavení kolem ostrovů Rudého moře zasvěceno uctívání Sobeka, krokodýlího pána vodních cest. Cedrové výletní lodě zdobené plátkovým zlatem se plavily těmito tyrkysovými vodami k získání božské přízně.",
          relatedExcursionId: "boat-1",
          relatedExcursionName: "Sobekova královská plavba královny Nefertari"
        },
        {
          id: 'el-gouna',
          name: "El Gouna a severní ostrovy",
          ancientName: "Horova laguna",
          glyph: "𓅃",
          coordinates: { x: 362, y: 218 },
          region: "Laguny Rudého moře",
          facts: [
            "Úchvatná síť mělkých tyrkysových kanálů, lagun a písečných ostrovů.",
            "Obklopen tajnými, nedotčenými mořskými zahradami daleko od přeplněných veřejných míst.",
            "Nabízí hluboké modré vody ideální pro rychlé plavby luxusními motorovými čluny."
          ],
          lore: "Sokolí bůh Horus, symbol rychlosti a božského zraku, prý patroloval nad vodami Rudého moře z nebes. Faraonští zvědové se plavili na rychlých papyrusových člunech těmito lagunami a vysílali zrcadlové signály na ochranu vnitrozemských hranic.",
          relatedExcursionId: "speedboat-1",
          relatedExcursionName: "Horova rychlá plavba se sokolím okem"
        }
      ];
    }

    if (language === 'ar') {
      return [
        {
          id: 'giza-pyramids',
          name: "هضبة الجيزة",
          ancientName: "أخت خوفو",
          glyph: "𓉴",
          coordinates: { x: 265, y: 140 },
          region: "مصر السفلى",
          facts: [
            "موطن الهرم الأكبر بالجيزة، أقدم عجائب الدنيا السبع في العالم القديم.",
            "محروسة بواسطة أبو الهول الضخم، المنحوت من صخرة جيرية واحدة.",
            "تمت محاذاة الأهرامات فلكياً بدقة مطلقة مع حزام أوريون (الجبار)."
          ],
          lore: "عرفها القدماء باسم 'أخت خوفو' (أفق خوفو)، وكانت تعتبر منصة انطلاق كونية تسمح لروح فرعون بالصعود إلى النجوم الشمالية الخالدة والانضمام إلى الآلهة.",
          relatedExcursionId: undefined,
          relatedExcursionName: "امتداد القاهرة المخصص (اسأل مساعد الذكاء الاصطناعي!)"
        },
        {
          id: 'luxor-waset',
          name: "الأقصر (الكرنك ووادي الملوك)",
          ancientName: "واسط",
          glyph: "𓉐",
          coordinates: { x: 308, y: 350 },
          region: "مصر العليا",
          facts: [
            "كانت واسط مركز قوة الدولة الحديثة، المكرسة لآمون رع إله الشمس.",
            "تضم الكرنك، أكبر مجمع معابد صممه وشيده البشر في التاريخ.",
            "تحتوي على وادي الملوك حيث دفن الفراعنة في مقابر صخرية مزخرفة."
          ],
          lore: "العبور من البر الشرقي (الشروق/الأحياء) إلى البر الغربي (الغروب/المقابر) بالأقصر يرمز لعبور الستار الأسطوري. مقابر الملوك منحوتة في جبل القرنة الهرمي محاكية رحلة رع الليلية.",
          relatedExcursionId: "history-1",
          relatedExcursionName: "رحلة الحج الفرعونية إلى واسط (الأقصر)"
        },
        {
          id: 'ras-mohammed',
          name: "محمية رأس محمد البحرية",
          ancientName: "حوض نون العميق",
          glyph: "𓆛",
          coordinates: { x: 382, y: 205 },
          region: "البحر الأحمر وسيناء",
          facts: [
            "محمية بحرية وطنية تقع في أقصى جنوب شبه جزيرة سيناء.",
            "تتميز بجدران مرجانية رأسية مذهلة تنحدر لأكثر من 1000 متر في أعماق البحر.",
            "موطن لأنظمة بيئية نابضة بالحياة تضم أسماك النابليون والسلاحف وأسماك القرش."
          ],
          lore: "اعتبر البحارة القدماء وحراس حتحور التيارات الدافئة لـ رأس محمد تجسيداً لـ نون - المياه الأولى التي انبثقت منها الحياة.",
          relatedExcursionId: "diving-1",
          relatedExcursionName: "غوص المرجان الملكي في رأس محمد"
        },
        {
          id: 'hurghada-coast',
          name: "كثبان الغردقة و دشرت",
          ancientName: "ساحل دشرت الخاص بست",
          glyph: "𓅓",
          coordinates: { x: 370, y: 238 },
          region: "البحر الأحمر والصحراء الشرقية",
          facts: [
            "حدود مهيبة حيث تلتقي جبال الصحراء الشرقية الذهبية بشواطئ البحر الأحمر.",
            "تتميز بالكثبان الصحراوية المتموجة والواحات البدوية والممرات الجبلية الوعرة.",
            "مثالية لمغامرات البيتش باجي السريعة وجولات ركوب الجمال عند الغروب."
          ],
          lore: "أطلق الفراعنة على هذه الأرض الصحراوية الحمراء اسم 'دشرت' (الأرض الحمراء)، حيث خضعوا لرهبة وجمال إقليم ست، إله العواصف والرمال.",
          relatedExcursionId: "safari-1",
          relatedExcursionName: "سفاري دشرت الذهبية مع ست"
        },
        {
          id: 'giftun-island',
          name: "جزيرة جفتون (أورانج باي)",
          ancientName: "مملكة سوبك الفيروزية",
          glyph: "𓍢",
          coordinates: { x: 388, y: 242 },
          region: "جزر البحر الأحمر",
          facts: [
            "محمية طبيعية تشتهر برمالها البيضاء الناعمة ومياهها الكريستالية الشفافة.",
            "محاطة ببحيرات شاطئية ضحلة تعج بالشعاب المرجانية الملونة.",
            "تُشاهد مجموعات الدلافين بانتظام وهي تسبح بالقرب من الشواطئ البكر."
          ],
          lore: "كان الإبحار حول جزر البحر الأحمر مكرساً لـ سوبك، إله الممرات المائية. كانت سفن الأرز المزخرفة بصفائح الذهب تبحر في هذه المياه الفيروزية لنيل البركة الإلهية.",
          relatedExcursionId: "boat-1",
          relatedExcursionName: "كروز الملكة نفرتاري الفاخر المكرس لسوبك"
        },
        {
          id: 'el-gouna',
          name: "الجونة والجزر الشمالية",
          ancientName: "بحيرة حورس",
          glyph: "𓅃",
          coordinates: { x: 362, y: 218 },
          region: "بحيرات البحر الأحمر",
          facts: [
            "شبكة ساحرة من القنوات المائية الفيروزية والبحيرات الشاطئية والجزر الرملية.",
            "محاطة بحدائق مرجانية بكر بعيدة عن المناطق المزدحمة.",
            "توفر مياه زرقاء عميقة مثالية لجولات القوارب السريعة الفاخرة."
          ],
          lore: "كان يُقال إن حورس، إله الصقر ورمز السرعة والرؤية الثاقبة، يحرس مياه البحر الأحمر من السماء.",
          relatedExcursionId: "speedboat-1",
          relatedExcursionName: "رحلة القارب السريع عين حورس"
        }
      ];
    }

    return ancientSites;
  }, [language, ancientSites]);

  const selectedSite = useMemo(() => {
    return localizedSites.find(site => site.id === selectedSiteId) || localizedSites[0] || {
      id: '',
      name: 'Loading site...',
      ancientName: '',
      glyph: '𓋹',
      region: '',
      facts: [],
      lore: '',
      coordinates: { x: 0, y: 0 }
    };
  }, [localizedSites, selectedSiteId]);

  // Filter sites based on search
  const filteredSites = useMemo(() => {
    return localizedSites.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.ancientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localizedSites, searchQuery]);

  const handleScrollToExcursion = (excursionId: string) => {
    const el = document.getElementById(`excursion-card-${excursionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief glow highlight
      el.classList.add('ring-4', 'ring-[#d4af37]', 'ring-offset-2', 'ring-offset-stone-900');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[#d4af37]', 'ring-offset-2', 'ring-offset-stone-900');
      }, 3000);
    } else {
      // Fallback: scroll to excursions list
      const catalogEl = document.getElementById('excursions-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScrollToScribe = () => {
    const el = document.getElementById('scribe-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-[#14100c] border-2 border-[#d4af37]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
      id="ancient-sites-map-wrapper"
    >
      {/* Visual Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_0.7px,transparent_0.7px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em] flex items-center justify-center gap-1.5">
          <Map className="w-3.5 h-3.5" />
          {language === 'de' ? '𓉶 Kemet Geographie-Führer 𓋹' : language === 'pl' ? '𓉶 Przewodnik geograficzny Kemet 𓋹' : language === 'cs' ? '𓉶 Geografický průvodce Kemetu 𓋹' : '𓉶 Kemet Geography Guide 𓋹'}
        </span>
        <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] uppercase">
          {language === 'de' ? 'Interaktive Karte der antiken Stätten' : language === 'pl' ? 'Interaktywna mapa starożytnych miejsc' : language === 'cs' ? 'Interaktivní mapa starobylých míst' : 'Interactive Ancient Sites Map'}
        </h2>
        <p className="text-stone-400 text-xs max-w-xl mx-auto leading-relaxed">
          {language === 'de' 
            ? 'Durchqueren Sie das Land der Pharaonen. Klicken Sie auf die golden leuchtenden Ruinen oder Korallenriffe, um mythologische Überlieferungen, kurze Fakten und unsere direkten Reiseangebote zu entdecken.'
            : language === 'pl'
            ? 'Przemierzaj krainę faraonów. Kliknij złote, świecące ruiny lub rafy koralowe, aby odkryć mitologiczne opowieści, ciekawe fakty i nasze bezpośrednie oferty wycieczek.'
            : language === 'cs'
            ? 'Projděte zemi faraonů. Kliknutím na zlatě zářící ruiny nebo korálové útesy objevíte mytologické legendy, zajímavá fakta a naše přímé nabídky výletů.'
            : 'Traverse the land of the Pharaohs. Click on the golden glowing ruins or coral reefs to discover mythological lore, quick facts, and our direct travel excursions.'}
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Interactive Map Display (7/12 width) */}
        <div className="lg:col-span-7 bg-[#0f0c09] border border-[#d4af37]/20 rounded-2xl p-4 flex flex-col justify-between relative min-h-[400px] md:min-h-[500px]">
          
          {/* Compass Rose Accent */}
          <div className="absolute top-4 left-4 text-[#d4af37]/15 pointer-events-none">
            <Compass className="w-24 h-24 stroke-1 animate-[spin_120s_infinite_linear]" />
          </div>

          {/* Scale of Miles Accent */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 font-mono text-[8px] text-stone-600 pointer-events-none select-none">
            <div className="flex items-center gap-1">
              <span className="w-8 h-[1px] bg-stone-700"></span>
              <span>{language === 'de' ? '100 km' : language === 'pl' ? '100 km' : language === 'cs' ? '100 km' : '100 Km'}</span>
            </div>
            <span>{language === 'de' ? 'Maßstab Sinai & Niltal' : language === 'pl' ? 'Skala Synaju i Doliny Nilu' : language === 'cs' ? 'Měřítko Sinaje a údolí Nilu' : 'Sinai & Nile Valley Scale'}</span>
          </div>

          {/* Egyptology Legends Overlay */}
          <div className="absolute bottom-4 right-4 bg-[#14100c]/80 border border-[#d4af37]/15 rounded-lg p-2 space-y-1.5 text-[8.5px] font-mono text-stone-400 pointer-events-none select-none backdrop-blur-sm z-10">
            <div className="text-[#d4af37] uppercase tracking-wider font-bold mb-0.5 border-b border-[#d4af37]/15 pb-0.5">{language === 'de' ? 'Kartenlegende' : language === 'pl' ? 'Legenda mapy' : language === 'cs' ? 'Legenda mapy' : 'Map Legend'}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{language === 'de' ? 'Antikes Grab / Ruine' : language === 'pl' ? 'Starożytny grobowiec / Ruiny' : language === 'cs' ? 'Starověká hrobka / Ruiny' : 'Ancient Tomb / Ruin'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>{language === 'de' ? 'Rotes Meer Tauchriff' : language === 'pl' ? 'Rafa koralowa Morza Czerwonego' : language === 'cs' ? 'Potápěčský útes Rudého moře' : 'Red Sea Diving Reef'}</span>
            </div>
          </div>

          {/* Map Search bar */}
          <div className="relative max-w-xs z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'de' ? 'Heilige Stätten suchen...' : language === 'pl' ? 'Szukaj świętych miejsc...' : language === 'cs' ? 'Hledat posvátná místa...' : 'Search sacred sites...'}
              className="w-full bg-[#14100c]/90 border border-[#d4af37]/30 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] placeholder:text-stone-600 font-sans"
            />
          </div>

          {/* SVG MAP WRAPPER */}
          <div className="w-full h-full flex items-center justify-center py-4 relative" id="egypt-svg-map-container">
            <svg
              viewBox="0 0 600 500"
              className="w-full max-w-[550px] h-auto text-[#d4af37]/40 select-none"
              style={{ maxHeight: '460px' }}
            >
              {/* Regional Outline - Egypt Borders (abstract representation) */}
              <rect x="10" y="10" width="580" height="480" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" className="opacity-20" />
              
              {/* Mediterranean Sea outline */}
              <path d="M 10,50 Q 150,55 300,50 T 590,45" fill="none" stroke="#2563eb" strokeWidth="1.5" className="opacity-15" />
              <text x="120" y="35" className="fill-stone-600 font-serif text-[10px] tracking-[0.25em] uppercase opacity-40">{language === 'de' ? 'Mittelmeer' : language === 'pl' ? 'Morze Śródziemne' : language === 'cs' ? 'Středozemní moře' : 'Mediterranean Sea'}</text>

              {/* The Nile Delta & River Path (Life of Egypt) */}
              <path
                d="M 290,480 
                   L 290,440 
                   Q 295,400 300,380 
                   Q 335,365 330,345 
                   T 298,325 
                   Q 280,260 282,210 
                   T 272,145 
                   Q 265,130 250,110 
                   L 220,50 
                   M 250,110 Q 260,95 280,50
                   M 250,110 Q 285,95 330,50"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="opacity-40 animate-pulse"
              />
              {/* Nile River glow outline */}
              <path
                d="M 290,480 
                   L 290,440 
                   Q 295,400 300,380 
                   Q 335,365 330,345 
                   T 298,325 
                   Q 280,260 282,210 
                   T 272,145 
                   Q 265,130 250,110 
                   L 220,50 
                   M 250,110 Q 260,95 280,50
                   M 250,110 Q 285,95 330,50"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="opacity-60"
              />
              <text x="210" y="300" transform="rotate(-78 210 300)" className="fill-[#0284c7] font-serif text-[9px] tracking-[0.15em] uppercase opacity-50">{language === 'de' ? 'Iteru (Der Nil)' : language === 'pl' ? 'Iteru (Nil)' : language === 'cs' ? 'Iteru (Nil)' : 'Iteru (The Nile)'}</text>

              {/* Red Sea & Gulf of Suez & Gulf of Aqaba */}
              {/* Gulf of Suez path */}
              <path d="M 315,145 L 382,205" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" className="opacity-35" />
              {/* Gulf of Aqaba path */}
              <path d="M 425,140 L 382,205" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" className="opacity-35" />
              {/* Red Sea Proper */}
              <path d="M 382,205 Q 430,280 495,380 T 580,480" fill="none" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" className="opacity-25" />
              <path d="M 382,205 Q 430,280 495,380 T 580,480" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" className="opacity-45 animate-pulse" />
              <text x="450" y="330" transform="rotate(50 450 330)" className="fill-teal-700 font-serif text-[9px] tracking-[0.2em] uppercase opacity-55">{language === 'de' ? 'Das Rote Meer' : language === 'pl' ? 'Morze Czerwone' : language === 'cs' ? 'Rudé moře' : 'The Red Sea'}</text>

              {/* Sinai Peninsula Label */}
              <text x="365" y="150" className="fill-stone-600 font-serif text-[8.5px] tracking-[0.2em] uppercase opacity-60">{language === 'de' ? 'Sinai-Wüste' : language === 'pl' ? 'Pustynia Synaj' : language === 'cs' ? 'Sinajská poušť' : 'Sinai Desert'}</text>

              {/* Nubian Desert Label */}
              <text x="140" y="440" className="fill-stone-700 font-serif text-[9px] tracking-[0.3em] uppercase opacity-35">{language === 'de' ? 'Westliche Wüste' : language === 'pl' ? 'Pustynia Zachodnia' : language === 'cs' ? 'Západní poušť' : 'Western Desert'}</text>
              <text x="430" y="450" className="fill-stone-700 font-serif text-[9px] tracking-[0.3em] uppercase opacity-35">{language === 'de' ? 'Östliche Wüste' : language === 'pl' ? 'Pustynia Wschodnia' : language === 'cs' ? 'Východní poušť' : 'Eastern Desert'}</text>

              {/* Map Sites Grid Layers */}
              {filteredSites.map((site) => {
                const isSelected = selectedSite.id === site.id;
                const isHovered = hoveredSite === site.id;
                const isDiving = site.id === 'ras-mohammed' || site.id === 'giftun-island' || site.id === 'el-gouna';
                const pulseColor = isDiving ? 'bg-teal-500' : 'bg-amber-500';
                
                return (
                  <g
                    key={site.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedSiteId(site.id)}
                    onMouseEnter={() => setHoveredSite(site.id)}
                    onMouseLeave={() => setHoveredSite(null)}
                  >
                    {/* Glowing outer halo ring */}
                    <circle
                      cx={site.coordinates.x}
                      cy={site.coordinates.y}
                      r={isSelected ? 18 : isHovered ? 14 : 9}
                      fill="none"
                      stroke={isDiving ? "#14b8a6" : "#d4af37"}
                      strokeWidth={isSelected ? 1.5 : isHovered ? 1.2 : 0.8}
                      className="transition-all duration-300 opacity-40 group-hover:opacity-100"
                    />

                    {/* Ripple animation circle */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={site.coordinates.x}
                        cy={site.coordinates.y}
                        r={26}
                        fill="none"
                        stroke={isDiving ? "#2dd4bf" : "#fbbf24"}
                        strokeWidth="0.5"
                        className="animate-ping opacity-15"
                      />
                    )}

                    {/* Core Point marker */}
                    <circle
                      cx={site.coordinates.x}
                      cy={site.coordinates.y}
                      r={isSelected ? 6.5 : 4.5}
                      fill={isDiving ? "#0d9488" : "#b45309"}
                      stroke={isDiving ? "#2dd4bf" : "#f59e0b"}
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />

                    {/* Site Hieroglyphic Glyph indicator label on map */}
                    <text
                      x={site.coordinates.x}
                      y={site.coordinates.y - 18}
                      className={`text-[12px] font-serif transition-all duration-300 text-center select-none ${
                        isSelected ? 'fill-[#e6c280] font-black' : isHovered ? 'fill-stone-200' : 'fill-stone-500'
                      }`}
                      textAnchor="middle"
                    >
                      {site.glyph}
                    </text>

                    {/* Label tooltip (Always visible when selected or hovered, styled elegantly) */}
                    {(isSelected || isHovered) && (
                      <g className="transition-all duration-300">
                        <rect
                          x={site.coordinates.x - 70}
                          y={site.coordinates.y + 12}
                          width="140"
                          height="22"
                          rx="4"
                          fill="#14100c"
                          stroke={isDiving ? "#14b8a6" : "#d4af37"}
                          strokeWidth="0.8"
                          className="opacity-95 shadow-lg"
                        />
                        <text
                          x={site.coordinates.x}
                          y={site.coordinates.y + 26}
                          className="fill-[#e6c280] font-serif text-[7.5px] font-bold uppercase tracking-wider text-center"
                          textAnchor="middle"
                        >
                          {site.name.split(' (')[0]}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick instructions */}
          <div className="text-center md:text-left text-[10px] font-mono text-stone-500 italic pb-1">
            {language === 'de' 
              ? '𓋹 Tipp: Bewegen Sie den Mauszeiger über einen Standort-Marker oben, um die Geographie Ägyptens zu entdecken!' 
              : language === 'pl'
              ? '𓋹 Wskazówka: Najedź lub stuknij dowolny znacznik lokalizacji powyżej, aby poznać geografię Egiptu!'
              : language === 'cs'
              ? '𓋹 Tip: Najeďte myší nebo klepněte na jakýkoli bod na mapě výše a objevte geografii Egypta!'
              : '𓋹 Tip: Hover or tap any location marker above to discover the geography of Egypt!'}
          </div>

        </div>

        {/* Right Column: Site Detail Display Card & Quick list (5/12 width) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* List sidebar fallback for accessibility and small screen tap targets */}
          <div className="bg-[#1a1410] border border-[#d4af37]/25 rounded-2xl p-4 space-y-3">
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block">{language === 'de' ? 'Wählen Sie eine Stätte aus der Schriftrolle' : language === 'pl' ? 'Wybierz miejsce ze zwoju' : language === 'cs' ? 'Vyberte místo ze svitku' : 'Choose Site from Scroll-roll'}</span>
            
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-950">
              {filteredSites.map((site) => {
                const isSelected = selectedSite.id === site.id;
                return (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`py-2 px-3.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#d4af37] text-stone-950 font-bold border-[#d4af37]'
                        : 'bg-[#120f0c] border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span>{site.glyph}</span>
                    <span>{site.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rich Papyrus Site Details Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSite.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1c1510] border-2 border-[#d4af37]/25 rounded-2xl p-5 md:p-6 flex-grow space-y-5 relative overflow-hidden flex flex-col justify-between"
              id="selected-site-detail-card"
            >
              {/* Papyrus decorative side borders */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#d4af37]/30 via-transparent to-[#d4af37]/30" />
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-[#d4af37]/30 via-transparent to-[#d4af37]/30" />
              
              <div className="space-y-4">
                {/* Site Header */}
                <div className="border-b border-[#d4af37]/15 pb-3.5 flex items-start gap-3">
                  <span className="text-3xl bg-[#261d15] border border-[#d4af37]/30 w-12 h-12 rounded-full flex items-center justify-center text-[#d4af37] shadow-inner select-none font-serif">
                    {selectedSite.glyph}
                  </span>
                  <div className="space-y-0.5 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono uppercase bg-amber-950/40 text-[#d4af37] border border-amber-900/40 px-2 py-0.5 rounded">
                        {selectedSite.region}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-[#e6c280] uppercase tracking-wide">
                      {selectedSite.name}
                    </h3>
                    <p className="text-[10px] font-mono text-[#d4af37]/75 italic uppercase tracking-wider">
                      {language === 'de' ? 'Antiker Titel:' : language === 'pl' ? 'Starożytny tytuł:' : language === 'cs' ? 'Starověký titul:' : 'Ancient Title:'} <span className="font-serif text-stone-200">{selectedSite.ancientName}</span>
                    </p>
                  </div>
                </div>

                {/* Mythological Lore Section */}
                <div className="bg-[#241a12]/50 border border-[#d4af37]/10 rounded-xl p-3.5 space-y-1 relative">
                  <span className="absolute top-3.5 right-4 font-serif text-[#d4af37]/10 text-3xl select-none">𓂀</span>
                  <strong className="text-[9.5px] font-mono uppercase text-[#e6c280] tracking-widest block flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
                    {language === 'de' ? 'Pharaonische Legenden & Mythen' : language === 'pl' ? 'Faraońskie legendy i mity' : language === 'cs' ? 'Faraonské legendy a mýty' : 'Pharaonic Lore & Myth'}
                  </strong>
                  <p className="text-stone-300 text-[11px] leading-relaxed font-sans italic">
                    "{selectedSite.lore}"
                  </p>
                </div>

                {/* Archaeological Facts */}
                <div className="space-y-2.5">
                  <strong className="text-[9.5px] font-mono uppercase text-stone-400 tracking-widest block flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#d4af37]" />
                    {language === 'de' ? 'Historische Fakten & Architektur' : language === 'pl' ? 'Fakty historyczne i architektura' : language === 'cs' ? 'Historická fakta a architektura' : 'Historical Facts & Architecture'}
                  </strong>
                  <ul className="space-y-2 text-[11px] text-stone-300 font-sans leading-relaxed">
                    {selectedSite.facts.map((fact, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start pl-1">
                        <span className="text-[#d4af37] font-mono text-[9px] mt-1 select-none">𓋹</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Excursion Link */}
              <div className="pt-4 border-t border-[#d4af37]/15">
                {selectedSite.relatedExcursionId ? (
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-mono text-stone-500 uppercase tracking-widest block">{language === 'de' ? 'Verfügbares Ausflugsangebot:' : language === 'pl' ? 'Dostępna oferta wycieczek:' : language === 'cs' ? 'Dostupná nabídka výletů:' : 'Available Excursion Offering:'}</span>
                    <button
                      onClick={() => handleScrollToExcursion(selectedSite.relatedExcursionId!)}
                      className="w-full bg-gradient-to-r from-amber-950/30 via-[#d4af37]/10 to-amber-950/30 hover:via-[#d4af37]/20 border border-[#d4af37]/45 hover:border-[#d4af37] text-[#e6c280] py-3 px-4 rounded-xl text-xs font-serif font-black uppercase tracking-widest flex items-center justify-between transition-all duration-300 cursor-pointer shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
                        {language === 'de' ? 'Buchen: ' : language === 'pl' ? 'Zarezerwuj: ' : language === 'cs' ? 'Rezervovat: ' : 'Book '}{selectedSite.relatedExcursionName?.split(' (')[0]}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-mono text-stone-500 uppercase tracking-widest block">{language === 'de' ? 'Spezielle maßgeschneiderte Expedition:' : language === 'pl' ? 'Specjalna spersonalizowana ekspedycja:' : language === 'cs' ? 'Speciální expedice na míru:' : 'Special Custom Expedition:'}</span>
                    <button
                      onClick={handleScrollToScribe}
                      className="w-full bg-[#140f0c] hover:bg-[#201812] border border-stone-800 hover:border-stone-700 text-stone-300 py-3 px-4 rounded-xl text-xs font-serif font-bold uppercase tracking-widest flex items-center justify-between transition-all duration-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-[11px] font-mono">
                        <Anchor className="w-4 h-4 text-[#d4af37]" />
                        {language === 'de' ? 'Maßgeschneiderten Reiseplan vom KI-Reiseleiter anfordern' : language === 'pl' ? 'Poproś o spersonalizowany plan od przewodnika AI' : language === 'cs' ? 'Vyžádat si plán na míru od AI průvodce' : 'Request Custom Itinerary from AI Guide'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </motion.div>
  );
}
