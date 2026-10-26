import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Check, ShieldCheck, X, Settings, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: true,
  updatedAt: new Date().toISOString()
};

const CONSENT_STORAGE_KEY = 'kemet_cookie_consent_v1';

// Helper to write a standard browser cookie
export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

// Helper to read a standard browser cookie
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

interface CookieConsentManagerProps {
  forceOpenTrigger?: boolean;
  onCloseTrigger?: () => void;
}

export default function CookieConsentManager({ forceOpenTrigger, onCloseTrigger }: CookieConsentManagerProps) {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Check if user has already given consent
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        setShowBanner(false);
      } else {
        // Show banner if no consent stored yet
        setShowBanner(true);
      }
    } catch (err) {
      setShowBanner(true);
    }
  }, []);

  // Handle external trigger (e.g., clicking "Cookie Settings" in footer)
  useEffect(() => {
    if (forceOpenTrigger) {
      setShowSettingsModal(true);
      setShowBanner(false);
    }
  }, [forceOpenTrigger]);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      const updated = { ...prefs, updatedAt: new Date().toISOString() };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
      setCookie('kemet_cookie_consent', JSON.stringify(updated));
      setCookie('kemet_analytics_allowed', updated.analytics ? 'true' : 'false');
      setCookie('kemet_marketing_allowed', updated.marketing ? 'true' : 'false');
      setPreferences(updated);
      setShowBanner(false);
      setShowSettingsModal(false);

      setSavedSuccessAlert(true);
      setTimeout(() => setSavedSuccessAlert(false), 3000);

      if (onCloseTrigger) {
        onCloseTrigger();
      }
    } catch (e) {
      console.error('Failed to save cookie consent', e);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveCustomPreferences = () => {
    saveConsent(preferences);
  };

  // Plain, easy-to-understand translations
  const t = (key: string, fallback: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: {
        de: 'Wir schätzen Ihre Privatsphäre & Cookies',
        pl: 'Dbamy o Twoją prywatność i pliki cookie',
        ar: 'نحن نهتم بخصوصيتك وملفات الكوكيز',
        cs: 'Vážíme si vašeho soukromí a cookies',
        en: 'We Care About Your Privacy & Cookies'
      },
      desc: {
        de: 'Wir verwenden Cookies, um Ihre Anmeldung zu speichern, die Website schneller zu machen und Ihnen die besten Ausflüge in Ägypten zu zeigen. Sie können jederzeit entscheiden, welche Cookies Sie zulassen möchten.',
        pl: 'Używamy plików cookie, aby zapamiętać Twoje logowanie, przyspieszyć działanie strony i pokazywać najlepsze wycieczki w Egipcie. W każdej chwili możesz wybrać swoje ustawienia.',
        ar: 'نستخدم ملفات الكوكيز لحفظ تسجيل دخولك وتنسيق الموقع وإظهار أفضل الرحلات في مصر. يمكنك تحديد التفضيلات في أي وقت.',
        cs: 'Používáme soubory cookie k zapamatování vašeho přihlášení, zrychlení webu a zobrazení nejlepších výletů v Egyptě. Svá nastavení můžete kdykoli změnit.',
        en: 'We use cookies to save your login, make our website run faster, and show you the best Egypt tours. You can choose which cookies to allow at any time.'
      },
      acceptAll: {
        de: 'Alle Cookies Akzeptieren',
        pl: 'Zaakceptuj Wszystkie',
        ar: 'قبول جميع الكوكيز',
        cs: 'Příjmout Vše',
        en: 'Accept All Cookies'
      },
      essentialOnly: {
        de: 'Nur Notwendige Cookies',
        pl: 'Tylko Niezbędne',
        ar: 'الكوكيز الضرورية فقط',
        cs: 'Pouze Nezbytné',
        en: 'Necessary Cookies Only'
      },
      customize: {
        de: 'Einstellungen Anpassen',
        pl: 'Dostosuj Ustawienia',
        ar: 'تخصيص الخيارات',
        cs: 'Upravit Nastavení',
        en: 'Customize Options'
      },
      modalTitle: {
        de: 'Cookie-Einstellungen Verwalten',
        pl: 'Zarządzaj Plikami Cookie',
        ar: 'إدارة إعدادات الكوكيز',
        cs: 'Spravovat Nastavení Cookies',
        en: 'Manage Cookie Settings'
      },
      essentialTitle: {
        de: '1. Notwendige Cookies (Immer Aktiv)',
        pl: '1. Niezbędne Pliki Cookie (Zawsze Aktywne)',
        ar: '1. الكوكيز الأساسية (تعمل دائماً)',
        cs: '1. Nezbytné Cookies (Vždy Aktivní)',
        en: '1. Essential Cookies (Always Active)'
      },
      essentialDesc: {
        de: 'Diese Cookies werden benötigt, damit die Website richtig funktioniert. Sie speichern Ihre Sprache, Ihre Anmeldung und Ihre Buchungen.',
        pl: 'Te pliki cookie są potrzebne, aby strona działała prawidłowo. Zapamiętują Twój język, logowanie i rezerwacje.',
        ar: 'هذه الكوكيز ضرورية لعمل الموقع بشكل صحيح. تحفظ لغتك وتطبيقات الحجز وتحديد الحساب.',
        cs: 'Tyto cookies jsou potřebné pro správne fungování webu. Ukládají váš jazyk, přihlášení a rezervace.',
        en: 'These cookies are needed for the website to work correctly. They remember your language, login, and active bookings.'
      },
      analyticsTitle: {
        de: '2. Analyse-Cookies (Empfohlen)',
        pl: '2. Analityczne Pliki Cookie (Zalecane)',
        ar: '2. كوكيز التحليلات (موصى بها)',
        cs: '2. Analytické Cookies (Doporučeno)',
        en: '2. Analytics Cookies (Recommended)'
      },
      analyticsDesc: {
        de: 'Helfen uns zu verstehen, wie Besucher unsere Website nutzen, damit wir Fehler beheben und die Tour-Angebote verbessern können.',
        pl: 'Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony, co pozwala nam naprawiać błędy i ulepszać ofertę wycieczek.',
        ar: 'تساعدنا في فهم كيفية استخدام الزوار للموقع حتى نتمكن من تحسين الرحلات وحل أي مشكلات.',
        cs: 'Pomáhají nam pochopit, jak návštěvníci používají náš web, abychom mohli zlepšovat nabídky výletů.',
        en: 'Help us see how visitors use our website so we can fix bugs, speed up loading, and improve tour offers.'
      },
      marketingTitle: {
        de: '3. Marketing & Rabatt-Cookies',
        pl: '3. Marketingowe Pliki Cookie',
        ar: '3. كوكيز التسويق والعروض',
        cs: '3. Marketingové Cookies',
        en: '3. Marketing & Offer Cookies'
      },
      marketingDesc: {
        de: 'Erinnern sich an Ihre Lieblingsausflüge und zeigen Ihnen passende 30%-Aktionscodes und Rabatte.',
        pl: 'Zapamiętują Twoje ulubione wycieczki i pokazują odpowiednie kody rabatowe 30%.',
        ar: 'تتذكر رحلاتك المفضلة وتُظهر لك كود الخصم 30% والعروض المناسبة.',
        cs: 'Pamatují si vaše oblíbené výlety a zobrazují relevantní 30% slevové kódy.',
        en: 'Remember your favorite tours and help display relevant 30% discount codes and special deals.'
      },
      savePreferences: {
        de: 'Meine Auswahl Speichern',
        pl: 'Zapisz Moje Wybory',
        ar: 'حفظ تفضيلاتي',
        cs: 'Uložit Mé Volby',
        en: 'Save My Choices'
      },
      savedNotice: {
        de: 'Cookie-Einstellungen erfolgreich gespeichert!',
        pl: 'Ustawienia plików cookie zostały zapisane!',
        ar: 'تم حفظ تفضيلات الكوكيز بنجاح!',
        cs: 'Nastavení cookies bylo úspěšně uloženo!',
        en: 'Cookie preferences saved successfully!'
      }
    };

    return translations[key]?.[language] || translations[key]?.['en'] || fallback;
  };

  return (
    <>
      {/* Toast alert on successful save */}
      <AnimatePresence>
        {savedSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[250] bg-[#14100c] border border-emerald-500/50 text-stone-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-sans"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{t('savedNotice', 'Cookie preferences saved successfully!')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM BANNER FOR INITIAL VISIT */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6 bg-[#0f0c09]/95 backdrop-blur-md border-t-2 border-[#d4af37]/60 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] text-stone-200"
          >
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-start gap-3.5 max-w-3xl">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase tracking-wide flex items-center gap-2">
                    {t('title', 'We Care About Your Privacy & Cookies')}
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans">
                    {t('desc', 'We use simple cookies to remember your login, keep the site running fast, and show you the best Egypt tours.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowBanner(false);
                    setShowSettingsModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-700 bg-[#1a140f] hover:bg-[#281f18] text-stone-300 hover:text-[#d4af37] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{t('customize', 'Customize Options')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptEssentialOnly}
                  className="px-4 py-2.5 rounded-xl border border-[#d4af37]/40 bg-[#1e1711] hover:bg-[#2d2219] text-[#e6c280] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t('essentialOnly', 'Necessary Cookies Only')}
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>{t('acceptAll', 'Accept All Cookies')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOMIZATION SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-[#14100c] border border-[#d4af37]/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative space-y-6 text-stone-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#e6c280] uppercase tracking-wider">
                      {t('modalTitle', 'Manage Cookie Settings')}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Choose which non-essential cookies you allow us to collect.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    if (onCloseTrigger) onCloseTrigger();
                  }}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toggles List */}
              <div className="space-y-4">
                {/* 1. Essential Cookies */}
                <div className="bg-[#1b1510] border border-stone-800 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="font-serif text-sm font-bold text-[#e6c280]">
                        {t('essentialTitle', '1. Essential Cookies (Always Active)')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">
                      {t('essentialDesc', 'These cookies are needed for the website to work correctly. They remember your language, login, and active bookings.')}
                    </p>
                  </div>
                  <div className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-1">
                    Always On
                  </div>
                </div>

                {/* 2. Analytics Cookies */}
                <div className="bg-[#1b1510] border border-stone-800 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-serif text-sm font-bold text-[#e6c280]">
                      {t('analyticsTitle', '2. Analytics Cookies (Recommended)')}
                    </span>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">
                      {t('analyticsDesc', 'Help us see how visitors use our website so we can fix bugs, speed up loading, and improve tour offers.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 mt-1 ${
                      preferences.analytics ? 'bg-[#d4af37]' : 'bg-stone-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#14100c] transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Marketing & Offer Cookies */}
                <div className="bg-[#1b1510] border border-stone-800 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-serif text-sm font-bold text-[#e6c280]">
                      {t('marketingTitle', '3. Marketing & Offer Cookies')}
                    </span>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">
                      {t('marketingDesc', 'Remember your favorite tours and help display relevant 30% discount codes and special deals.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 mt-1 ${
                      preferences.marketing ? 'bg-[#d4af37]' : 'bg-stone-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#14100c] transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end border-t border-stone-800">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2.5 rounded-xl border border-[#d4af37]/40 bg-[#1e1711] hover:bg-[#2d2219] text-[#e6c280] font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  {t('acceptAll', 'Accept All Cookies')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveCustomPreferences}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>{t('savePreferences', 'Save My Choices')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cookie settings can still be opened via footer link or trigger */}
    </>
  );
}
