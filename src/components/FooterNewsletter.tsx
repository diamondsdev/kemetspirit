import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, X, Ticket, Compass, ChevronRight, Check, AlertCircle, Send } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { getAccessToken } from '../lib/firebaseAuth';

interface Subscriber {
  id: string;
  email: string;
  interests: string[];
  signupDate: string;
  promoCode: string;
}

export default function FooterNewsletter() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [assignedPromo, setAssignedPromo] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [welcomeSent, setWelcomeSent] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if already subscribed previously
  useEffect(() => {
    const saved = localStorage.getItem('kemet_current_subscriber');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasSubscribed(true);
        setAssignedPromo(parsed.promoCode);
        setEmail(parsed.email);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Real-time email validation
  const validateEmailFormat = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError(
        language === 'de' ? 'E-Mail-Adresse ist erforderlich' :
        language === 'pl' ? 'Adres e-mail jest wymagany' :
        language === 'ar' ? 'البريد الإلكتروني مطلوب' :
        'Email address is required'
      );
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(
        language === 'de' ? 'Ungültiges E-Mail-Format (z. B. name@beispiel.com)' :
        language === 'pl' ? 'Nieprawidłowy format e-mail (np. name@beispiel.com)' :
        language === 'ar' ? 'صيغة البريد الإلكتروني غير صالحة (مثال: traveler@domain.com)' :
        'Invalid email format (e.g. traveler@domain.com)'
      );
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setApiError(null);
    if (!isTouched) setIsTouched(true);
    validateEmailFormat(val);
  };

  const executeSubscription = async (targetInterests: string[]) => {
    setIsSubmitting(true);
    setApiError(null);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          interests: targetInterests.length > 0 ? targetInterests : ['all'],
          accessToken: accessToken || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Subscription failed. Please verify your email.');
        setIsSubmitting(false);
        return;
      }

      const promo = data.promoCode || `RAMSES-${Math.floor(1000 + Math.random() * 9000)}-30`;
      const subscriberData: Subscriber = {
        id: data.signup?.id || `sub-${Date.now()}`,
        email: trimmedEmail,
        interests: targetInterests.length > 0 ? targetInterests : ['all'],
        signupDate: new Date().toISOString().split('T')[0],
        promoCode: promo
      };

      // Save locally
      const existingSignups = localStorage.getItem('kemet_newsletter_signups');
      let signupsList = [];
      if (existingSignups) {
        try {
          signupsList = JSON.parse(existingSignups);
        } catch (e) {
          signupsList = [];
        }
      }
      signupsList = signupsList.filter((s: any) => s.email.toLowerCase() !== trimmedEmail);
      signupsList.unshift(subscriberData);
      localStorage.setItem('kemet_newsletter_signups', JSON.stringify(signupsList));
      localStorage.setItem('kemet_current_subscriber', JSON.stringify(subscriberData));

      // Dispatch real-time update event so Admin Dashboard updates instantly
      window.dispatchEvent(new Event('kemet_subscribers_updated'));

      setAssignedPromo(promo);
      setWelcomeSent(data.welcomeEmailSent || false);
      setHasSubscribed(true);
      setIsSubmitting(false);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Newsletter submission error:", err);
      setApiError(err.message || 'Server connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    if (!validateEmailFormat(email)) return;

    // Direct submission or optional interest modal
    setIsModalOpen(true);
  };

  const handleDirectSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTouched(true);
    if (!validateEmailFormat(email)) return;

    executeSubscription(selectedInterests);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubscription(selectedInterests);
  };

  const handleResetSubscription = () => {
    localStorage.removeItem('kemet_current_subscriber');
    setHasSubscribed(false);
    setAssignedPromo('');
    setEmail('');
    setSelectedInterests([]);
    setEmailError(null);
    setApiError(null);
    setIsTouched(false);
  };

  const copyPromoCode = () => {
    if (assignedPromo) {
      navigator.clipboard.writeText(assignedPromo);
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2500);
    }
  };

  const INTEREST_OPTIONS = language === 'de' ? [
    { value: 'diving', label: '𓆛 Gerätetauchen', desc: 'Korallenriffe und Meeresschutzgebiete' },
    { value: 'boat', label: '𓊟 Yacht- & Bootsausflüge', desc: 'Insel-Luxuskreuzfahrten und Schnorcheln' },
    { value: 'speedboat', label: '𓊡 Schnellbootausflüge', desc: 'Insel-Hopping mit Highspeed' },
    { value: 'safari', label: '𓅓 Wüstensafaris', desc: 'Quad-Rennen und Sternenbeobachtung' },
    { value: 'history', label: '𓉐 Historisches Luxor', desc: 'Antike Tempel und Gräberführungen' }
  ] : language === 'pl' ? [
    { value: 'diving', label: '𓆛 Nurkowanie', desc: 'Rafy koralowe i rezerwaty morskie' },
    { value: 'boat', label: '𓊟 Rejsy jachtem i łodzią', desc: 'Luksusowe rejsy na wyspy i snorkeling' },
    { value: 'speedboat', label: '𓊡 Wycieczki motorówką', desc: 'Szybkie przemieszczanie się między wyspami' },
    { value: 'safari', label: '𓅓 Pustynne safari', desc: 'Wyścigi quadów i obserwacja gwiazd' },
    { value: 'history', label: '𓉐 Historyczny Luksor', desc: 'Starożytne świątynie i zwiedzanie grobowców' }
  ] : language === 'ar' ? [
    { value: 'diving', label: '𓆛 غوص السكوبا', desc: 'الشعاب المرجانية والمحميات البحرية' },
    { value: 'boat', label: '𓊟 رحلات اليخوت والقوارب', desc: 'رحلات الجزر الفاخرة والسنوركلينج' },
    { value: 'speedboat', label: '𓊡 رحلات القوارب السريعة', desc: 'تنقل بين الجزر بسرعة فائقة' },
    { value: 'safari', label: '𓅓 سفاري الصحراء', desc: 'سباق الدراجات الرباعية ومراقبة النجوم' },
    { value: 'history', label: '𓉐 الأقصر التاريخية', desc: 'جولات المعابد والمقابر القديمة' }
  ] : [
    { value: 'diving', label: '𓆛 Scuba Diving', desc: 'Coral reefs and marine reserves' },
    { value: 'boat', label: '𓊟 Yacht & Boat Trips', desc: 'Island luxury cruises and snorkeling' },
    { value: 'speedboat', label: '𓊡 Speedboat Excursions', desc: 'High-speed island hopping tours' },
    { value: 'safari', label: '𓅓 Desert Safaris', desc: 'Quad bike racing and stargazing' },
    { value: 'history', label: '𓉐 Historical Luxor', desc: 'Ancient temples and tomb tours' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
      id="imperial-newsletter-container"
    >
      
      {/* 1. NEWSLETTER SIGNUP BANNER (FOOTER STYLE) */}
      <div className="bg-[#130f0a] border border-[#d4af37]/25 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
        
        {/* Subtle Hieroglyphic background element */}
        <div className="absolute right-0 bottom-0 text-stone-950/20 font-serif text-8xl select-none pointer-events-none transform translate-y-6 translate-x-6">
          𓎬
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Header Texts */}
          <div className="md:col-span-7 space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-[0.25em] flex items-center gap-1.5 justify-center md:justify-start">
              <Sparkles className="w-3 h-3 text-[#d4af37] animate-pulse" />
              {language === 'de' ? 'Sonderangebote & Reisedeals' : language === 'pl' ? 'Oferty specjalne i promocje' : language === 'ar' ? 'العروض الخاصة وعروض السفر' : 'Special Offers & Travel Deals'}
            </span>
            <h3 className="font-serif text-xl md:text-2xl font-black text-[#e6c280] uppercase tracking-wide">
              {language === 'de' ? 'Reiserabatte & Neuigkeiten' : language === 'pl' ? 'Zniżki podróżnicze i aktualności' : language === 'ar' ? 'خصومات السفر والتحديثات' : 'Travel Discount & Updates'}
            </h3>
            <p className="text-stone-400 text-xs leading-relaxed max-w-md">
              {language === 'de' ? (
                <>Geben Sie unten Ihre E-Mail-Adresse ein, um den Newsletter zu abonnieren und einen <span className="text-[#d4af37] font-semibold">30% Rabattcode</span> sowie ein Begrüßungstemplate zu erhalten.</>
              ) : language === 'pl' ? (
                <>Wpisz swój adres e-mail poniżej, aby zapisać się i otrzymać <span className="text-[#d4af37] font-semibold">kod rabatowy 30%</span> oraz powitalną wiadomość.</>
              ) : language === 'ar' ? (
                <>أدخل بريدك الإلكتروني أدناه للاشتراك والحصول على رسالة الترحيب ورابط <span className="text-[#d4af37] font-semibold">خصم 30%</span> للاستخدام في رحلتك القادمة.</>
              ) : (
                <>Enter your email below to subscribe, receive a welcome email template, and unlock <span className="text-[#d4af37] font-semibold">30% Off</span> travel discount promo codes stored in your admin portal.</>
              )}
            </p>
          </div>
 
          {/* Action Input / Status */}
          <div className="md:col-span-5 w-full">
            {!hasSubscribed ? (
              <form onSubmit={handleInitialSubmit} className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      emailError && isTouched ? 'text-amber-400' : 'text-stone-500'
                    }`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => {
                        setIsTouched(true);
                        validateEmailFormat(email);
                      }}
                      placeholder={language === 'de' ? "Geben Sie Ihre E-Mail-Adresse ein..." : language === 'pl' ? "Wpisz swój adres e-mail..." : language === 'ar' ? "أدخل بريدك الإلكتروني..." : "Enter your email address..."}
                      className={`w-full bg-[#1c1611] border rounded-xl py-2.5 pl-10 pr-3 text-stone-200 text-xs focus:outline-none transition-all placeholder:text-stone-600 ${
                        emailError && isTouched 
                          ? 'border-amber-500/70 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50' 
                          : 'border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                      }`}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#d4af37] to-[#bca03b] hover:from-[#e2be4c] hover:to-[#cca73d] text-stone-950 font-mono text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        {language === 'de' ? 'Abonnieren' : language === 'pl' ? 'Zapisz się' : language === 'ar' ? 'اشترك الآن' : 'Subscribe'} 
                        <ChevronRight className="w-3 h-3 stroke-[3px]" />
                      </>
                    )}
                  </button>
                </div>

                {/* Real-time Validation Error Display */}
                {emailError && isTouched && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-amber-400 text-[11px] font-mono pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </motion.div>
                )}

                {/* Server API Error Display */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-red-400 text-[11px] font-mono pl-1 bg-red-950/40 p-2 rounded-lg border border-red-800/40"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                    <span>{apiError}</span>
                  </motion.div>
                )}
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#211a13]/90 border border-[#d4af37]/40 rounded-xl p-4 text-center sm:text-left space-y-2 relative shadow-lg"
              >
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center text-[11px] text-emerald-400 font-bold">
                    ✓
                  </div>
                  <span className="font-serif text-[#e6c280] font-bold text-xs uppercase tracking-wider">
                    {language === 'de' ? 'Abonnement Bestätigt!' : language === 'pl' ? 'Subskrypcja Potwierdzona!' : language === 'ar' ? 'تم تأكيد الاشتراك!' : 'Subscription Confirmed!'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-300 leading-normal">
                  {welcomeSent ? (
                    <span className="text-emerald-400 font-mono text-[10px] block mb-1 flex items-center gap-1">
                      <Send className="w-3 h-3" /> {language === 'ar' ? 'تم إرسال قالب البريد الإلكتروني الترحيبي إلى ' : 'Welcome email template dispatched to '} <strong className="text-stone-200">{email}</strong>!
                    </span>
                  ) : (
                    <span>{language === 'ar' ? 'تم تسجيل بريدك الإلكتروني ' : 'Your email '}<strong className="text-stone-200">{email}</strong>{language === 'ar' ? ' في سجل لوحة الإدارة!' : ' has been registered into the admin dashboard ledger!'}</span>
                  )}
                  {language === 'de' ? 'Ihr aktiver 30% Rabattcode lautet:' : language === 'pl' ? 'Twój aktywny kod rabatowy 30% to:' : language === 'ar' ? 'رمز الخصم 30% الخاص بك هو:' : 'Your active 30% discount promo code:'}
                </p>

                <div className="flex items-center justify-between bg-black/60 border border-[#d4af37]/40 rounded-lg p-2 font-mono text-xs text-[#d4af37] select-all">
                  <span className="font-bold tracking-widest">{assignedPromo}</span>
                  <button 
                    onClick={copyPromoCode}
                    className="text-[10px] bg-[#2a1f15] hover:bg-[#3d2e1f] text-[#e6c280] px-2 py-1 rounded border border-[#d4af37]/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Ticket className="w-3 h-3 text-[#d4af37]" />
                    <span>{copiedPromo ? (language === 'de' ? 'Kopiert!' : language === 'pl' ? 'Skopiowano!' : 'Copied!') : (language === 'de' ? 'Kopieren' : language === 'pl' ? 'Kopiuj' : 'Copy')}</span>
                  </button>
                </div>

                <button 
                  onClick={handleResetSubscription}
                  className="text-[9px] font-mono text-stone-500 hover:text-stone-300 uppercase tracking-widest block mx-auto sm:ml-0 underline cursor-pointer transition-colors"
                >
                  {language === 'de' ? 'E-Mail-Adresse ändern / Erneut abonnieren' : language === 'pl' ? 'Zmień adres e-mail / Zapisz się ponownie' : language === 'ar' ? 'تغيير البريد الإلكتروني / الاشتراك ببريد آخر' : 'Change Email / Subscribe Another Address'}
                </button>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* 2. PREFERENCE SELECTION MODAL DIALOG (WITHOUT ACCOUNT TYPE / TIER SELECTION) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#16110c] border-2 border-[#d4af37] rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl z-10"
            >
              
              {/* Pharaonic Header Banner */}
              <div className="bg-gradient-to-b from-[#1c150e] to-[#120e0a] border-b border-[#d4af37]/20 p-5 text-center relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-2xl mb-1 text-[#d4af37]">𓂀</div>
                <h3 className="font-serif text-lg md:text-xl font-extrabold text-[#e6c280] uppercase tracking-widest">
                  {language === 'de' ? 'Reiseinteressen anpassen' : language === 'pl' ? 'Dostosuj swoje zainteresowania' : language === 'ar' ? 'تخصيص اهتمامات السفر' : 'Customize Travel Interests'}
                </h3>
                <p className="text-stone-400 text-xs mt-1 font-mono">
                  {language === 'de' ? 'Anmeldung für:' : language === 'pl' ? 'Subskrypcja dla:' : language === 'ar' ? 'الاشتراك بـ:' : 'Subscribing:'} <span className="text-[#d4af37] font-semibold">{email}</span>
                </p>
              </div>

              {/* Questionnaire (NO ACCOUNT TYPE OR TIER SELECTION) */}
              <form onSubmit={handleFinalSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                
                {/* Category checkmarks */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider block font-bold">
                      {language === 'de' ? 'Wählen Sie Ihre bevorzugten Aktivitäten' : language === 'pl' ? 'Wybierz swoje ulubione zajęcia' : language === 'ar' ? 'اختر أنشطتك المفضلة' : 'Select Your Preferred Travel Interests'}
                    </label>
                    <p className="text-stone-400 text-[11px] leading-relaxed">
                      {language === 'de' ? 'An welchen Arten von Ausflügen sind Sie interessiert?' : language === 'pl' ? 'Jakimi rodzajami wycieczek się interesujesz?' : language === 'ar' ? 'ما هي أنواع الرحلات التي تهتم بالحصول على خصومات عليها؟' : 'Which types of excursions are you interested in receiving discounts for?'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {INTEREST_OPTIONS.map((item) => {
                      const isSelected = selectedInterests.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleInterest(item.value)}
                          className={`w-full flex items-center justify-between text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#e6c280]'
                              : 'bg-[#1a1410] border-stone-800/80 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold font-serif block">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-stone-500 block leading-none">
                              {item.desc}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#d4af37] border-[#d4af37] text-stone-950' : 'border-stone-700 bg-[#120d09]'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="bg-[#1d1611] border border-[#d4af37]/15 rounded-xl p-3 flex gap-3 items-center">
                  <div className="text-lg text-[#d4af37] select-none">𓋹</div>
                  <p className="text-[10px] text-stone-400 leading-relaxed">
                    {language === 'de' ? 'Ihre E-Mail-Adresse wird sicher im Admin-Dashboard gespeichert. Sie erhalten das Willkommens-Template und exklusive 30%-Gutscheincodes.' : language === 'pl' ? 'Twój adres e-mail zostanie bezpiecznie zapisany w panelu administracyjnym. Otrzymasz powitalny szablon i ekskluzywne kody rabatowe 30%.' : language === 'ar' ? 'سيتم حفظ بريدك الإلكتروني بأمان في لوحة التحكم. ستتلقى قالب البريد الترحيبي ورموز الخصم الحصرية بنسبة 30%.' : 'Your email will be securely stored inside the Admin Dashboard. You will receive the welcome email template and exclusive 30% discount promo codes.'}
                  </p>
                </div>

                {/* Submission CTA */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectSubscribe}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#241a11] hover:bg-[#38281a] text-[#e6c280] font-mono text-xs uppercase font-bold tracking-wider py-3 rounded-xl border border-[#d4af37]/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {language === 'de' ? 'Direkt Abonnieren' : language === 'pl' ? 'Zapisz się od razu' : language === 'ar' ? 'تخطي واشترك' : 'Skip & Subscribe'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b29330] hover:from-[#e2be4c] hover:to-[#c3a133] text-stone-950 font-mono text-xs uppercase font-bold tracking-widest py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                        {language === 'de' ? 'Wird gespeichert...' : language === 'pl' ? 'Zapisywanie...' : language === 'ar' ? 'جاري الاشتراك...' : 'Subscribing...'}
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        {language === 'de' ? 'Abonnement Bestätigen' : language === 'pl' ? 'Potwierdź subskrypcję' : language === 'ar' ? 'تأكيد الاشتراك' : 'Confirm Subscription'}
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
