import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'de' | 'pl' | 'cs' | 'ar';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation & Bottom Bar
  nav_tours: { en: '𓆛 Tours & Excursions', de: '𓆛 Touren & Ausflüge', pl: '𓆛 Wycieczki i wyprawy', cs: '𓆛 Výlety a exkurze', ar: '𓆛 جولات ورحلات' },
  nav_map: { en: '𓉶 Ancient Map', de: '𓉶 Antike Karte', pl: '𓉶 Starożytna mapa', cs: '𓉶 Starověká mapa', ar: '𓉶 الخريطة القديمة' },
  nav_ai_planner: { en: '𓋹 AI Travel Planner', de: '𓋹 KI-Reiseplaner', pl: '𓋹 Planer podróży AI', cs: '𓋹 Plánovač cest s AI', ar: '𓋹 مخطط السفر بالذكاء الاصطناعي' },
  nav_gallery: { en: '𓅓 Photo Gallery', de: '𓅓 Fotogalerie', pl: '𓅓 Galeria zdjęć', cs: '𓅓 Fotogalerie', ar: '𓅓 معرض الصور' },
  nav_cartouche: { en: '𓉐 Name Translator', de: '𓉐 Namensübersetzer', pl: '𓉐 Tłumacz imion', cs: '𓉐 Překladač jmen', ar: '𓉐 مترجم الأسماء' },
  nav_faq: { en: '𓇚 Questions & Answers', de: '𓇚 Fragen & Antworten', pl: '𓇚 Pytania i odpowiedzi', cs: '𓇚 Otázky a odpovědi', ar: '𓇚 الأسئلة والإجابات' },
  nav_bookings: { en: '𓎬 My Bookings', de: '𓎬 Meine Buchungen', pl: '𓎬 Moje rezerwacje', cs: '𓎬 Moje rezervace', ar: '𓎬 حجوزاتي' },
  nav_traveler: { en: '𓀚 Traveler View', de: '𓀚 Reisenden-Ansicht', pl: '𓀚 Widok podróżnika', cs: '𓀚 Pohled cestovatele', ar: '𓀚 عرض المسافر' },
  nav_admin: { en: '𓋹 Admin Dashboard', de: '𓋹 Admin-Dashboard', pl: '𓋹 Panel administratora', cs: '𓋹 Administrační panel', ar: '𓋹 لوحة التحكم' },
  mob_expeditions: { en: 'Expeditions', de: 'Expeditionen', pl: 'Wyprawy', cs: 'Expedice', ar: 'الرحلات' },
  mob_faqs: { en: 'FAQs', de: 'FAQs', pl: 'FAQ', cs: 'Časté dotazy', ar: 'الأسئلة' },
  mob_oracle: { en: 'Oracle', de: 'Orakel', pl: 'Wyrocznia', cs: 'Orákulum', ar: 'المستشار' },
  mob_cartouche: { en: 'Cartouche', de: 'Kartusche', pl: 'Kartusz', cs: 'Kartuše', ar: 'الخرطوشة' },
  mob_bookings: { en: 'Bookings', de: 'Buchungen', pl: 'Rezerwacje', cs: 'Rezervace', ar: 'الحجوزات' },

  // Hero Section
  hero_sub: { en: 'Experience Ancient Egypt', de: 'Erlebe das Alte Ägypten', pl: 'Doświadcz Starożytnego Egiptu', cs: 'Zažijte starověký Egypt', ar: 'استكشف مصر القديمة' },
  hero_title: { en: 'Kemet Tours', de: 'Kemet Touren', pl: 'Kemet Tours', cs: 'Kemet Tours', ar: 'جولات كيميت' },
  hero_powered: { en: 'Powered by Mas international Agency', de: 'Unterstützt von der Mas international Agency', pl: 'Wspierane przez Mas international Agency', cs: 'S podporou Mas international Agency', ar: 'مدعوم من وكالة ماس الدولية' },
  hero_desc: { en: 'Explore world-class Red Sea coral reefs, experience desert quad and camel safaris, and discover the historic temples and tombs of Luxor with our personalized travel planner.', de: 'Erkunden Sie erstklassige Korallenriffe im Roten Meer, erleben Sie Wüsten-Quad- und Kamelsafaris und entdecken Sie die historischen Tempel und Gräber von Luxor mit unserem personalisierten Reiseplaner.', pl: 'Odkrywaj światowej klasy rafy koralowe Morza Czerwonego, weź udział w pustynnych safari na quadach i wielbłądach oraz odkrywaj historyczne świątynie i grobowce Luksoru dzięki naszemu spersonalizowanemu planerowi podróży.', cs: 'Prozkoumejte prvotřídní korálové útesy Rudého moře, zažijte pouštní safari na čtyřkolkách a velbloudech a objevte historické chrámy a hrobky v Luxoru s naším personalizovaným plánovačem cest.', ar: 'استكشف الشعاب المرجانية العالمية في البحر الأحمر، وعش تجربة سفاري الرباعيات والجمال في الصحراء، واكتشف المعابد والمقابر التاريخية في الأقصر عبر مخطط السفر المخصص لدينا.' },
  hero_explore: { en: 'Explore Tours', de: 'Touren Erkunden', pl: 'Przeglądaj wycieczki', cs: 'Prozkoumat výlety', ar: 'استكشف الجولات' },
  hero_chat_ai: { en: 'Chat with AI Assistant', de: 'Mit KI-Assistent Chatten', pl: 'Rozmawiaj z asystentem AI', cs: 'Chatovat s asistentem AI', ar: 'تحدث مع مساعد الذكاء الاصطناعي' },

  // FAQ Page / Scribe's Sanctuary (App.tsx)
  archive: { en: '𓇚 Egyptian Archives 𓇚', de: '𓇚 Ägyptisches Archiv 𓇚', pl: '𓇚 Egipskie archiwa 𓇚', cs: '𓇚 Egyptské archivy 𓇚', ar: '𓇚 الأرشيف المصري 𓇚' },
  sanctuary_title: { en: "The Scribes' Sanctuary", de: 'Heiligtum der Schreiber', pl: 'Sanktuarium Pisarzy', cs: 'Svatyně písařů', ar: 'ملاذ الكتبة' },
  sanctuary_desc: { en: 'Access critical travel wisdom and sacred records here.', de: 'Greifen Sie hier auf wichtiges Reisewissen und heilige Aufzeichnungen zu.', pl: 'Uzyskaj dostęp do kluczowej mądrości podróżniczej i świętych zapisów tutaj.', cs: 'Zde najdete klíčovou cestovatelskou moudrost a posvátné záznamy.', ar: 'احصل على حكمة السفر القيمة والسجلات المقدسة هنا.' },
  back_to_sanctuary: { en: '← Back to Sanctuary', de: '← Zurück zur Hauptseite', pl: '← Powrót do Sanktuarium', cs: '← Zpět do svatyně', ar: '← العودة إلى الملاذ' },
  safety_title: { en: 'Sacred Nile & Desert Safety', de: 'Heiliger Nil & Wüstensicherheit', pl: 'Bezpieczeństwo na świętym Nilu i pustyni', cs: 'Bezpečnost na posvátném Nilu a v poušti', ar: 'سلامة النيل المقدس والصحراء' },
  safety_water: { en: 'Water Wisdom', de: 'Wasser-Weisheit', pl: 'Mądrość wody', cs: 'Moudrost vody', ar: 'حكمة المياه' },
  safety_water_desc: { en: 'Standard tap water is not fit for consumption. Please enjoy the abundant, complimentary ice-cold bottled mineral water provided across all tours and camps.', de: 'Leitungswasser ist nicht trinkbar. Bitte genießen Sie das reichliche, kostenlose eiskalte Mineralwasser in Flaschen, das auf allen Touren und in den Camps angeboten wird.', pl: 'Zwykła woda z kranu nie nadaje się do spożycia. Zapraszamy do korzystania z obfitej, bezpłatnej, lodowatej butelkowanej wody mineralnej, dostępnej podczas wszystkich wycieczek i w obozach.', cs: 'Běžná voda z kohoutku není pitná. Vychutnejte si dostatek bezplatné ledové balené minerální vody poskytované na všech výletech a v kempech.', ar: 'مياه الصنبور العادية غير صالحة للشرب. يرجى الاستمتاع بالمياه المعدنية المعبأة المثلجة والمجانية المتوفرة في جميع الجولات والمخيمات.' },
  safety_garb: { en: 'Desert Garb', de: 'Wüstenkleidung', pl: 'Strój pustynny', cs: 'Pouštní oděv', ar: 'ملابس الصحراء' },
  safety_garb_desc: { en: 'When riding quad bikes or hiking sand dunes, wear secure closed-toe shoes and wraps. The sun evaporates heat instantly, but temperatures drop rapidly after twilight.', de: 'Tragen Sie bei Quad-Fahrten oder Dünenwanderungen geschlossene Schuhe und Decken. Die Sonne verdunstet die Hitze sofort, aber die Temperaturen sinken nach der Dämmerung rapide.', pl: 'Podczas jazdy na quadach lub wędrówek po wydmach noś zakryte buty i chusty. Słońce błyskawicznie nagrzewa powietrze, ale temperatury gwałtownie spadają po zmierzchu.', cs: 'Při jízdě na čtyřkolkách nebo turistice na písečných dunách noste pevnou uzavřenou obuv a šátky. Slunce vyzařuje teplo okamžitě, ale teploty po soumraku rychle klesají.', ar: 'عند قيادة الدراجات الرباعية أو تسلق الكثبان الرملية، ارتدي أحذية مغلقة وشيلاناً واقية. تتسامى حرارة الشمس فوراً لكن درجات الحرارة تنخفض بسرعة بعد الغسق.' },
  safety_cultural: { en: 'Cultural Respect', de: 'Kultureller Respekt', pl: 'Szacunek dla kultury', cs: 'Kulturní respekt', ar: 'الاحترام الثقافي' },
  safety_cultural_desc: { en: 'Cover shoulders and knees when visiting ancient shrines, and always request permission before capturing memories of Bedouin hosts.', de: 'Bedecken Sie Schultern und Knie beim Besuch antiker Schreine und bitten Sie immer um Erlaubnis, bevor Sie Fotos von Beduinen-Gastgebern machen.', pl: 'Zakrywaj ramiona i kolana podczas odwiedzania starożytnych świątyń i zawsze pytaj o zgodę przed robieniem zdjęć beduińskim gospodarzom.', cs: 'Při návštěvě starověkých svatyní si zakryjte ramena a kolena a před fotografováním beduínských hostitelů vždy požádejte o svolení.', ar: 'غط الكتفين والركبتين عند زيارة المزارات القديمة، واطلب الإذن دائماً قبل التقاط صور لأبناء البدو المضيفين.' },
  diving_title: { en: 'Diving & Historical Passes', de: 'Tauchen & Historische Pässe', pl: 'Nurkowanie i przepustki historyczne', cs: 'Potápění a historické vstupenky', ar: 'الغوص والتصاريح التاريخية' },
  diving_coral: { en: 'Corals of Sobek', de: 'Sobeks Korallen', pl: 'Korale Sobka', cs: 'Sobekovy korály', ar: 'شعاب سوبك المرجانية' },
  diving_coral_desc: { en: 'Use strictly reef-safe biodegradable sunscreen. Never stand on, touch, or handle corals as it damages sensitive living systems.', de: 'Verwenden Sie ausschließlich riffsichere, biologisch abbaubare Sonnencreme. Betreten, berühren oder hantieren Sie niemals mit Korallen, da dies empfindliche lebende Systeme beschädigt.', pl: 'Używaj wyłącznie biodegradowalnych filtrów przeciwsłonecznych bezpiecznych dla raf. Nigdy nie stawaj na koralowcach, nie dotykaj ich ani ich nie zrywaj, ponieważ niszczy to wrażliwe żywe ekosystemy.', cs: 'Používejte výhradně biologicky odbouratelný opalovací krém bezpečný pro útesy. Nikdy nestoupejte na korály, nedotýkejte se jich ani s nimi nemanipulujte, protože to poškozuje citlivé živé ekosystemy.', ar: 'استخدم حصراً واقي شمس صديقاً للبيئة وقابلاً للتحلل. لا تقف مطلقاً على الشعاب المرجانية أو تلمسها حيث يضر ذلك بالأنظمة الحية الحساسة.' },
  diving_passes: { en: 'Valley Passes', de: 'Pässe fürs Tal', pl: 'Przepustki do Doliny', cs: 'Vstupenky do údolí', ar: 'تصاريح وادي الملوك' },
  diving_passes_desc: { en: 'Standard entry tickets are included and allow entry into 3 major tombs. Specialty tombs like Tutankhamun can be booked through your guide 48 hours in advance.', de: 'Standard-Eintrittskarten sind inbegriffen und ermöglichen den Zugang zu 3 großen Gräbern. Spezialgräber wie das von Tutanchamun können 48 Stunden im Voraus über Ihren Guide gebucht werden.', pl: 'Standardowe bilety wstępu są wliczone w cenę i umożliwiają wejście do 3 głównych grobowców. Grobowce specjalne, takie jak Tutanchamon, można zarezerwować u przewodnika z 48-godzinnym wyprzedzeniem.', cs: 'Standardní vstupenky jsou zahrnuty v ceně a umožňují vstup do 3 hlavních hrobek. Speciální hrobky jako Tutanchamon lze rezervovat prostřednictvím vašeho průvodce 48 hodin předem.', ar: 'تذاكر الدخول القياسية مشمولة وتسمح بدخول 3 مقابر رئيسية. يمكن حجز المقابر الخاصة مثل توت عنخ آمون من خلال مرشدك قبل 48 ساعة.' },
  diving_photo: { en: 'Pharaonic Photography', de: 'Pharaonische Fotografie', pl: 'Fotografia faraońska', cs: 'Faraonská fotografie', ar: 'التصوير الفرعوني' },
  diving_photo_desc: { en: 'Smartphone photos are free inside tombs, but professional DSLR cameras/tripods are strictly banned without commercial licenses.', de: 'Smartphone-Fotos in den Gräbern sind kostenlos, aber professionelle DSLR-Kameras/Stative sind ohne kommerzielle Lizenz strengstens verboten.', pl: 'Zdjęcia smartfonem wewnątrz grobowców są bezpłatne, ale profesjonalne lustrzanki i statywy są surowo zabronione bez licencji komercyjnych.', cs: 'Fotografování chytrým telefonem je uvnitř hrobek zdarma, ale profesionální zrcadlovky/stativy jsou bez komerční licence přísně zakázány.', ar: 'التصوير بالهاتف المحمول مجاني داخل المقابر، لكن الكاميرات الاحترافية والثلاثيات ممنوعة تماماً بدون تراخيص تجارية.' },

  // Excursion Catalog
  cat_subtitle: { en: 'Sacred Offerings', de: 'Heilige Angebote', pl: 'Święte dary', cs: 'Posvátné nabídky', ar: 'القرابين المقدسة' },
  cat_title: { en: 'Available Expeditions', de: 'Verfügbare Expeditionen', pl: 'Dostępne wyprawy', cs: 'Dostupné expedice', ar: 'الرحلات الاستكشافية المتاحة' },
  cat_desc: { en: 'Enlist in our premium curated experiences along the Nile, desert dunes, and aquatic depths.', de: 'Melden Sie sich für unsere erstklassigen Erlebnisse entlang des Nils, der Wüstendünen und der Wassertiefen an.', pl: 'Zapisz się na nasze starannie zaplanowane, wyjątkowe wycieczki wzdłuż Nilu, pustynnych wydm i morskich głębin.', cs: 'Přihlaste se k našim prvotřídním zážitkům podél Nilu, v pouštních dunách a vodních hlubinách.', ar: 'انضم إلى تجاربنا المنسقة الفاخرة عبر النيل والكثبان الصحراوية والأعماق البحرية.' },
  cat_all: { en: '𓆃 All Expeditions', de: '𓆃 Alle Expeditionen', pl: '𓆛 Wszystkie wyprawy', cs: '𓆃 Všechny expedice', ar: '𓆃 جميع الرحلات' },
  cat_diving: { en: '𓆛 Diving & Sea', de: '𓆛 Tauchen & Meer', pl: '𓆛 Nurkowanie i morze', cs: '𓆛 Potápění a moře', ar: '𓆛 الغوص والبحر' },
  cat_safari: { en: '𓃗 Desert Safari', de: '𓃗 Wüstensafari', pl: '𓃗 Pustynne safari', cs: '𓃗 Pouštní safari', ar: '𓃗 سفاري الصحراء' },
  cat_history: { en: '𓉐 Luxor History', de: '𓉐 Luxor-Geschichte', pl: '𓉐 Historia Luksoru', cs: '𓉐 Historie Luxoru', ar: '𓉐 تاريخ الأقصر' },
  cat_boat: { en: '𓊟 Private Boat', de: '𓊟 Private Boote', pl: '𓊟 Prywatna łódź', cs: '𓊟 Soukromá loď', ar: '𓊟 قوارب خاصة' },
  cat_speedboat: { en: '𓆛 Speedboat', de: '𓆛 Schnellboote', pl: '𓆛 Motorówka', cs: '𓆛 Motorový člun', ar: '𓆛 قوارب سريعة' },
  cat_search_placeholder: { en: 'Search expeditions by name, location, or ancient lore...', de: 'Suchen Sie Expeditionen nach Name, Ort oder antiker Überlieferung...', pl: 'Szukaj wypraw według nazwy, lokalizacji lub starożytnej wiedzy...', cs: 'Hledat expedice podle názvu, místa nebo starověkých legend...', ar: 'ابحث عن الرحلات باسمها أو موقعها أو أسطورتها القديمة...' },
  cat_duration: { en: 'Duration', de: 'Dauer', pl: 'Czas trwania', cs: 'Doba trvání', ar: 'المدة' },
  cat_price_from: { en: 'Price', de: 'Preis', pl: 'Cena', cs: 'Cena', ar: 'السعر' },
  cat_ancient_lore: { en: 'Ancient Lore & Wisdom', de: 'Antike Überlieferung & Weisheit', pl: 'Starożytna mądrość i wierzenia', cs: 'Starověké legendy a moudrost', ar: 'الأسطورة والحكمة القديمة' },
  cat_highlights: { en: 'Sacred Highlights', de: 'Heilige Highlights', pl: 'Święte atrakcje', cs: 'Hlavní body programu', ar: 'أبرز المعالم المقدسة' },
  cat_inclusions: { en: 'What is Included', de: 'Was inbegriffen ist', pl: 'Co zawiera cena', cs: 'Co je zahrnuto v ceně', ar: 'المشتملات' },
  cat_enlist: { en: 'Enlist in Expedition', de: 'Für Expedition anmelden', pl: 'Zapisz się na wyprawę', cs: 'Zapsat se na expedici', ar: 'الانضمام للرحلة' },
  cat_reviews: { en: 'Traveler Reviews', de: 'Reisenden-Berichte', pl: 'Opinie podróżników', cs: 'Hodnocení cestovatelů', ar: 'تقييمات المسافرين' },
  cat_rating: { en: 'Rating', de: 'Bewertung', pl: 'Ocena', cs: 'Hodnocení', ar: 'التقييم' },
  cat_book_now: { en: 'Book This Expedition', de: 'Diese Expedition buchen', pl: 'Zarezerwuj tę wyprawę', cs: 'Rezervovat tuto expedici', ar: 'حجز هذه الرحلة' },
  cat_unfold_lore: { en: 'Unfold Ancient Scroll Lore', de: 'Antike Schriftrolle entfalten', pl: 'Rozwiń starożytny zwój wiedzy', cs: 'Rozvinout svitek starověké moudrosti', ar: 'فتح مخطوطة الأسطورة القديمة' },
  cat_fold_lore: { en: 'Roll Up Ancient Scroll', de: 'Antike Schriftrolle einrollen', pl: 'Zwiń starożytny zwój', cs: 'Svinout starověký svitek', ar: 'طي المخطوطة القديمة' },

  // Booking Card/Form Dialog
  form_header: { en: 'Initiate Sacred Booking Scroll', de: 'Heilige Buchungsrolle initiieren', pl: 'Rozpocznij święty zwój rezerwacji', cs: 'Zahájit posvátný svitek rezervace', ar: 'بدء مخطوطة الحجز المقدسة' },
  form_name: { en: 'Your Name (Scribe Sign)', de: 'Ihr Name (Unterschrift des Schreibers)', pl: 'Twoje imię (podpis pisarza)', cs: 'Vaše jméno (podpis písaře)', ar: 'اسمك (توقيع الكاتب)' },
  form_email: { en: 'Your Email (Sacred Inbox)', de: 'Ihre E-Mail (Heiliger Posteingang)', pl: 'Twój e-mail (święta skrzynka odbiorcza)', cs: 'Váš e-mail (posvátná schránka)', ar: 'بريدك الإلكتروني (البريد المقدس)' },
  form_date: { en: 'Expedition Date', de: 'Expeditionsdatum', pl: 'Data wyprawy', cs: 'Datum expedice', ar: 'تاريخ الرحلة' },
  form_guests: { en: 'Number of Guests', de: 'Anzahl der Gäste', pl: 'Liczba gości', cs: 'Počet hostů', ar: 'عدد الضيوف' },
  form_special: { en: 'Special Requests / Offerings to the Gods', de: 'Besondere Wünsche / Opfergaben an die Götter', pl: 'Specjalne życzenia / dary dla bogów', cs: 'Zvláštní požadavky / dary bohům', ar: 'طلبات خاصة / قرابين للآلهة' },
  form_submit: { en: 'Seal Booking & Consult Oracle', de: 'Buchung versiegeln & Orakel befragen', pl: 'Przypieczętuj rezerwację i skonsultuj się z Wyrocznią', cs: 'Zpečetit rezervaci a poradit se s Orákulem', ar: 'ختم الحجز واستشارة المستشار' },
  form_close: { en: 'Close', de: 'Schließen', pl: 'Zamknij', cs: 'Zavřít', ar: 'إغلاق' },

  // AI Scribe Oracle
  oracle_subtitle: { en: 'Artificial Intelligence', de: 'Künstliche Intelligenz', pl: 'Sztuczna inteligencja', cs: 'Umělá inteligence', ar: 'الذكاء الاصطناعي' },
  oracle_title: { en: 'AI Travel Guide & Assistant', de: 'KI-Reiseplaner & Assistent', pl: 'Przewodnik i asystent podróży AI', cs: 'AI cestovní průvodce a asistent', ar: 'مرشد ومساعد السفر بالذكاء الاصطناعي' },
  oracle_desc: { en: 'Ask our AI helper any questions or generate a custom day-by-day travel plan.', de: 'Fragen Sie unseren KI-Assistenten alles oder erstellen Sie einen maßgeschneiderten Reiseplan.', pl: 'Zadaj naszemu pomocnikowi AI dowolne pytanie lub wygeneruj spersonalizowany plan podróży dzień po dniu.', cs: 'Zeptejte se našeho AI pomocníka na jakékoli otázky nebo si vygenerujte vlastní denní plán cesty.', ar: 'اسأل مساعدنا الذکی أي سؤال أو أنشئ خطة سفر مخصصة يوماً بيوم.' },
  oracle_placeholder: { en: 'Ask the Scribe about Egypt, excursions, or custom itineraries...', de: 'Fragen Sie den Schreiber nach Ägypten, Ausflügen oder maßgeschneiderten Reiseplänen...', pl: 'Zapytaj pisarza o Egipt, wycieczki lub spersonalizowane plany podróży...', cs: 'Zeptejte se písaře na Egypt, výlety nebo vlastní itineráře...', ar: 'اسأل الكاتب عن مصر، الرحلات، أو خطط السفر المخصصة...' },
  oracle_send: { en: 'Consult Scribe', de: 'Schreiber befragen', pl: 'Skonsultuj się z pisarzem', cs: 'Poradit se s písařem', ar: 'استشارة الكاتب' },
  oracle_suggest_btn1: { en: '☀️ Generate 5-Day Desert & Sea Itinerary', de: '☀️ 5-tägigen Wüsten- und Meeres-Reiseplan erstellen', pl: '☀️ Wygeneruj 5-dniowy plan podróży po pustyni i morzu', cs: '☀️ Vygenerovat 5denní pouštní a mořský itinerář', ar: '☀️ إنشاء برنامج 5 أيام للصحراء والبحر' },
  oracle_suggest_btn2: { en: '𓆛 Best coral reefs to dive in Hurghada?', de: '𓆛 Beste Korallenriffe zum Tauchen in Hurghada?', pl: '𓆛 Najlepsze rafy koralowe do nurkowania w Hurghadzie?', cs: '𓆛 Nejlepší korálové útesy k potápění v Hurghadě?', ar: '𓆛 أفضل الشعاب المرجانية للغوص في الغردقة؟' },
  oracle_suggest_btn3: { en: '𓉐 Historical significance of Valley of the Kings', de: '𓉐 Historische Bedeutung des Tals der Könige', pl: '𓉐 Historyczne znaczenie Doliny Królów', cs: '𓉐 Historický význam Údolí králů', ar: '𓉐 الأهمية التاريخية لوادي الملوك' },

  // Cartouche Generator
  cart_subtitle: { en: 'Egyptian Cartouche', de: 'Ägyptische Kartusche', pl: 'Egipski kartusz', cs: 'Egyptská kartuše', ar: 'الخرطوشة المصرية' },
  cart_title: { en: 'Egyptian Name Translator', de: 'Ägyptischer Namensübersetzer', pl: 'Egipski tłumacz imion', cs: 'Egyptský překladač jmen', ar: 'مترجم الأسماء المصرية' },
  cart_desc: { en: 'Translate your name into ancient Egyptian hieroglyphic symbols inside a beautiful protective cartouche.', de: 'Übersetzen Sie Ihren Namen in altägyptische Hieroglyphen in einer wunderschönen, schützenden Kartusche.', pl: 'Przetłumacz swoje imię na starożytne egipskie symbole hieroglificzne wewnątrz pięknego, ochronnego kartusza.', cs: 'Přeložte své jméno do staroegyptských hieroglyfických symbolů uvnitř krásné ochranné kartuše.', ar: 'ترجم اسمك إلى رموز هيروغليفية مصرية قديمة داخل خرطوشة ملكية واقية وجميلة.' },
  cart_placeholder: { en: 'Enter your name (A-Z characters)...', de: 'Geben Sie Ihren Namen ein (A-Z Zeichen)...', pl: 'Wpisz swoje imię (litery A-Z)...', cs: 'Zadejte své jméno (znaky A-Z)...', ar: 'أدخل اسمك (بالحروف الإنجليزية A-Z)...' },
  cart_btn: { en: 'Translate to Hieroglyphs', de: 'In Hieroglyphen übersetzen', pl: 'Przetłumacz na hieroglify', cs: 'Přeložit do hieroglyfů', ar: 'الترجمة إلى الهيروغليفية' },
  cart_key_guide: { en: 'Hieroglyphic Symbol Guide', de: 'Hieroglyphen-Symbolführer', pl: 'Przewodnik po symbolach hieroglificznych', cs: 'Průvodce hieroglyfickými symboly', ar: 'دليل الرموز الهيروغليفية' },

  // Booking Ledger & Reviews Section
  book_section_sub: { en: 'My Bookings', de: 'Meine Buchungen', pl: 'Moje rezerwacje', cs: 'Moje rezervace', ar: 'حجوزاتي' },
  book_section_title: { en: 'Your Bookings & Reviews', de: 'Ihre Bookings & Bewertungen', pl: 'Twoje rezerwacje i opinie', cs: 'Vaše rezervace a hodnocení', ar: 'حجوزاتك وتقييماتك' },
  book_section_desc: { en: 'View your pending or confirmed bookings, and read reviews from other travelers.', de: 'Sehen Sie Ihre ausstehenden oder bestätigten Buchungen und lesen Sie Bewertungen anderer Reisender.', pl: 'Zobacz swoje oczekujące lub potwierdzone rezerwacje i przeczytaj opinie innych podróżników.', cs: 'Zobrazte své čekající nebo potvrzené rezervace a přečtěte si hodnocení ostatních cestovatelů.', ar: 'اعرض حجوزاتك المعلقة أو المؤكدة واقرأ تقييمات المسافرين الآخرين.' },
  book_no_bookings: { en: 'No sacred expeditions booked yet. Visit the Available Expeditions section above to book your first journey.', de: 'Noch keine heiligen Expeditionen gebucht. Besuchen Sie den Abschnitt „Verfügbare Expeditionen“ oben, um Ihre erste Reise zu buchen.', pl: 'Nie zarezerwowano jeszcze żadnych świętych wypraw. Odwiedź sekcję Dostępne wyprawy powyżej, aby zarezerwować swoją pierwszą podróż.', cs: 'Zatím nejsou rezervovány žádné posvátné expedice. Chcete-li si rezervovat svou první cestu, navštivte výše uvedenou sekci Dostupné expedice.', ar: 'لم يتم حجز أي رحلات مقدسة بعد. تفضل بزيارة قسم الرحلات المتاحة أعلاه لحجز رحلتك الأولى.' },
  book_cancel: { en: 'Cancel Pending Scroll', de: 'Ausstehende Buchung stornieren', pl: 'Anuluj oczekujący zwój', cs: 'Zrušit čekající rezervaci', ar: 'إلغاء المخطوطة المعلقة' },
  book_confirmed_label: { en: 'Confirmed by High Priest', de: 'Vom Hohenpriester bestätigt', pl: 'Potwierdzone przez Arcykapłana', cs: 'Potvrzeno veleknězem', ar: 'مؤكد من الكاهن الأكبر' },
  book_pending_label: { en: 'Pending Oracle Approval', de: 'Wartet auf Freigabe des Orakels', pl: 'Oczekiwanie na zatwierdzenie przez Wyrocznią', cs: 'Čeká na schválení Orákulem', ar: 'في انتظار موافقة المستشار' },
  book_completed_label: { en: 'Completed', de: 'Abgeschlossen', pl: 'Zakończono', cs: 'Dokončeno', ar: 'مكتمل' },
  book_total_cost: { en: 'Total Cost', de: 'Gesamtkosten', pl: 'Całkowity koszt', cs: 'Celkové náklady', ar: 'التكلفة الإجمالية' },
  book_date: { en: 'Date', de: 'Datum', pl: 'Data', cs: 'Datum', ar: 'التاريخ' },
  book_guests: { en: 'Guests', de: 'Gäste', pl: 'Goście', cs: 'Hosté', ar: 'الضيوف' },
  book_write_review: { en: 'Write a Review', de: 'Eine Bewertung schreiben', pl: 'Napisz opinię', cs: 'Napsat hodnocení', ar: 'كتابة تقييم' },
  book_submitted_reviews: { en: 'Submitted Reviews', de: 'Eingereichte Bewertungen', pl: 'Przesłane opinie', cs: 'Odeslaná hodnocení', ar: 'التقييمات المقدمة' },
  book_add_rating: { en: 'Rate Expedition', de: 'Expedition bewerten', pl: 'Oceń wyprawę', cs: 'Ohodnotit expedici', ar: 'تقييم الرحلة' },
  book_review_comment: { en: 'Your Review Comment', de: 'Ihr Bewertungskommentar', pl: 'Twój komentarz do opinii', cs: 'Váš komentář k hodnocení', ar: 'تعليق تقييمك' },
  book_submit_review: { en: 'Submit Review', de: 'Bewertung abschicken', pl: 'Prześlij opinię', cs: 'Odeslat hodnocení', ar: 'إرسال التقييم' },

  // FAQ Component (Inner FAQ)
  faq_sub: { en: 'Travel Help & Tips', de: 'Reisehilfe & Tipps', pl: 'Pomoc i wskazówki podróżnicze', cs: 'Pomoc a tipy na cesty', ar: 'نصائح ومساعدة السفر' },
  faq_title: { en: 'Frequently Asked Questions', de: 'Häufig gestellte Fragen', pl: 'Najczęściej zadawane pytania', cs: 'Časté dotazy', ar: 'الأسئلة الشائعة' },
  faq_desc: { en: 'Got questions about diving gear, desert clothing, temple passes, or staying hydrated? We have got you covered with simple, practical answers.', de: 'Haben Sie Fragen zu Tauchausrüstung, Wüstenkleidung, Tempelpässen oder Flüssigkeitszufuhr? Wir haben einfache, praktische Antworten für Sie.', pl: 'Masz pytania dotyczące sprzętu do nurkowania, odzieży pustynnej, przepustek do świątyń lub nawodnienia? Mamy dla Ciebie proste, praktyczne odpowiedzi.', cs: 'Máte dotazy ohledně potápěčské výstroje, oblečení do pouště, vstupenek do chrámů nebo hydratace? Nabízíme vám jednoduché a praktické Antworten für Sie.', ar: 'لديك أسئلة حول معدات الغوص، ملابس الصحراء، تصاريح المعابد، أو شرب الماء؟ نوفر لك إجابات بسيطة وعملية.' },
  faq_tab_questions: { en: '𓋹 Oracle FAQs', de: '𓋹 Orakel-FAQs', pl: '𓋹 FAQ Wyroczni', cs: '𓋹 FAQ Orákula', ar: '𓋹 أسئلة المستشار' },
  faq_tab_packing: { en: '𓊟 Packing & Etiquette', de: '𓊟 Packliste & Etikette', pl: '𓊟 Pakowanie i etykieta', cs: '𓊟 Balení a etiketa', ar: '𓊟 قائمة الأمتعة والآداب' },
  faq_search: { en: 'Search wisdom archive...', de: 'Weisheitsarchiv durchsuchen...', pl: 'Przeszukaj archiwum mądrości...', cs: 'Prohledat archiv moudrosti...', ar: 'البحث في أرشيف الحكمة...' },
  faq_select_env: { en: 'Select Environment:', de: 'Umgebung wählen:', pl: 'Wybierz środowisko:', cs: 'Vyberte prostředí:', ar: 'اختر البيئة:' },
  faq_select_season: { en: 'Select Season:', de: 'Jahreszeit wählen:', pl: 'Wybierz porę roku:', cs: 'Vyberte roční období:', ar: 'اختر الموسم:' },
  faq_packing_title: { en: 'Interactive Packing Checklist', de: 'Interaktive Packliste', pl: 'Interaktive lista rzeczy do spakowania', cs: 'Interaktivní kontrolní seznam balení', ar: 'قائمة الأمتعة التفاعلية' },
  faq_etiquette_title: { en: 'Cultural Etiquette & Guidelines', de: 'Kulturelle Etikette & Richtlinien', pl: 'Kulturalna etykieta i wskazówki', cs: 'Kulturní etiketa a pravidla', ar: 'الآداب والتوجيهات الثقافية' },
  faq_progress: { en: 'Packed', de: 'Gepackt', pl: 'Spakowane', cs: 'Zabaleno', ar: 'تم تجهيزه' },
  faq_reset: { en: 'Reset Checklist', de: 'Checkliste zurücksetzen', pl: 'Zresetuj listę', cs: 'Resetovat kontrolní seznam', ar: 'إعادة ضبط القائمة' },

  // Admin Dashboard Translations
  admin_clearance: {
    en: 'Staff Only • High Priest Clearance',
    de: 'Nur Mitarbeiter • Freigabe für Hohepriester',
    pl: 'Tylko dla personelu • Uprawnienia Arcykapłana',
    cs: 'Pouze pro zaměstnance • Povolení velekněze',
    ar: 'للموظفين فقط • تصريح الكاهن الأكبر'
  },
  admin_title: {
    en: 'Royal Scribe Admin Dashboard',
    de: 'Königliches Scribe Admin-Dashboard',
    pl: 'Królewski Panel Administratora Pisarza',
    cs: 'Administrátorský panel královského písaře',
    ar: 'لوحة تحكم الكاتب الملكي'
  },
  admin_label_dashboard: {
    en: '📊 Command Dashboard',
    de: '📊 Befehls-Dashboard',
    pl: '📊 Panel sterowania',
    cs: '📊 Velící panel',
    ar: '📊 لوحة القيادة'
  },
  admin_label_caravans: {
    en: '𓎬 Caravan Ledger',
    de: '𓎬 Karawanenbuch',
    pl: '𓎬 Księga Karawan',
    cs: '𓎬 Kniha karavan',
    ar: '𓎬 دفتر القوافل'
  },
  admin_label_nobles: {
    en: '𓀚 Traveler CRM',
    de: '𓀚 Reisende-CRM',
    pl: '𓀚 CRM Podróżnych',
    cs: '𓀚 CRM cestovatelů',
    ar: '𓀚 إدارة علاقات المسافرين'
  },
  admin_label_offerings: {
    en: '𓆛 Offerings Catalog',
    de: '𓆛 Angebote-Katalog',
    pl: '𓆛 Katalog Ofert',
    cs: '𓆛 Katalog nabídek',
    ar: '𓆛 كتالوج العروض'
  },
  admin_label_testimonies: {
    en: '𓁠 Review Moderation',
    de: '𓁠 Bewertungsmoderation',
    pl: '𓁠 Moderacja Opinii',
    cs: '𓁠 Moderování recenzí',
    ar: '𓁠 إدارة التقييمات'
  },
  admin_label_oracle: {
    en: '𓋹 Oracle Lead Logs',
    de: '𓋹 Orakel-Lead-Protokolle',
    pl: '𓋹 Logi Leadów Orakulum',
    cs: '𓋹 Protokoly kontaktů Orákula',
    ar: '𓋹 سجلات استشارات المستشار'
  },
  admin_label_subscribers: {
    en: '𓇚 Imperial Scrolls',
    de: '𓇚 Kaiserliche Schriftrollen',
    pl: '𓇚 Cesarskie Zwoje',
    cs: '𓇚 Císařské svitky',
    ar: '𓇚 المخطوطات الإمبراطورية'
  },
  admin_desc_dashboard: {
    en: 'Financial & Lead funnels',
    de: 'Finanz- & Leadtrichter',
    pl: 'Lejki finansowe i potencjalnych klientów',
    cs: 'Finanční a konverzní trychtýře',
    ar: 'المسارات المالية واستفسارات العملاء'
  },
  admin_active_bookings: {
    en: 'active bookings',
    de: 'aktive Buchungen',
    pl: 'aktywne rezerwacje',
    cs: 'aktivních rezervací',
    ar: 'حجوزات نشطة'
  },
  admin_traveler_cards: {
    en: 'traveler cards',
    de: 'Reisekarten',
    pl: 'kart podróżnych',
    cs: 'karet cestovatelů',
    ar: 'بطاقات المسافرين'
  },
  admin_active_trips: {
    en: 'active trips',
    de: 'aktive Touren',
    pl: 'aktywne wycieczki',
    cs: 'aktivních výletů',
    ar: 'رحلات نشطة'
  },
  admin_desc_testimonies: {
    en: 'Verify traveler testimonies',
    de: 'Reiseberichte überprüfen',
    pl: 'Weryfikuj świadectwa podróżnych',
    cs: 'Ověřit svědectví cestovatelů',
    ar: 'التحقق من تقييمات المسافرين'
  },
  admin_desc_oracle: {
    en: 'Inspect recent chats',
    de: 'Letzte Chats einsehen',
    pl: 'Przeglądaj ostatnie czaty',
    cs: 'Prohlédnout nedávné chaty',
    ar: 'فحص المحادثات الأخيرة'
  },
  admin_newsletter_signups: {
    en: 'newsletter signups',
    de: 'Newsletter-Anmeldungen',
    pl: 'zapisów na newsletter',
    cs: 'odběrów newsletteru',
    ar: 'اشتراكات النشرة الإخبارية'
  },
  admin_label_sheets: {
    en: '𓇛 Google Sheets Sync',
    de: '𓇛 Google Sheets-Sync',
    pl: '𓇛 Synchronizacja Sheets',
    cs: '𓇛 Synchronizace Sheets',
    ar: '𓇛 مزامنة جداول بيانات جوجل'
  },
  admin_desc_sheets: {
    en: 'Sync divine ledgers',
    de: 'Heilige Bücher abgleichen',
    pl: 'Zsynchronizuj księgi',
    cs: 'Synchronizovat knihy',
    ar: 'مزامنة السجلات المقدسة'
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kemet_language') as Language) || 'en';
  });

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kemet_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
