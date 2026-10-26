import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Check, Sparkles, AlertCircle, Compass } from 'lucide-react';
import { Review, Excursion } from '../types';
import { useLanguage } from './LanguageContext';

interface ExcursionFeedbackFormProps {
  bookingId: string;
  excursionId: string;
  excursionTitle: string;
  travelerName: string;
  onFeedbackSubmitted?: () => void;
  lightTheme?: boolean;
}

const AVATARS = [
  { value: "𓁠 Cleopatra", label: "𓁠 Cleopatra the Diver" },
  { value: "𓀚 Ramses", label: "𓀚 Ramses the Nomad" },
  { value: "𓁥 Hatshepsut", label: "𓁥 Hatshepsut the Scribe" },
  { value: "𓃠 Bastet", label: "𓃠 Bastet the Explorer" },
  { value: "𓆛 Sobek", label: "𓆛 Sobek the Mariner" },
  { value: "𓅃 Horus", label: "𓅃 Horus the Speedster" },
  { value: "𓋹 Anubis", label: "𓋹 Anubis the Guardian" }
];

export default function ExcursionFeedbackForm({
  bookingId,
  excursionId,
  excursionTitle,
  travelerName,
  onFeedbackSubmitted,
  lightTheme = false,
}: ExcursionFeedbackFormProps) {
  const { language } = useLanguage();
  const [rating, setRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [author, setAuthor] = useState<string>(travelerName);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[Math.floor(Math.random() * AVATARS.length)].value);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [hasExistingReview, setHasExistingReview] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  // Check if a review already exists for this combination of author/excursion
  useEffect(() => {
    const saved = localStorage.getItem('kemet_reviews');
    if (saved) {
      try {
        const reviews: Review[] = JSON.parse(saved);
        // Look for existing review by this traveler for this excursion
        const found = reviews.find(
          (r) => r.excursionId === excursionId && (r.author.toLowerCase() === travelerName.toLowerCase() || r.author.toLowerCase() === author.toLowerCase())
        );
        if (found) {
          setExistingReview(found);
          setHasExistingReview(true);
          setRating(found.rating);
          setComment(found.comment);
          const rawAvatar = found.avatar.split(' ')[0];
          if (AVATARS.some(av => av.value === rawAvatar)) {
            setSelectedAvatar(rawAvatar);
          }
        }
      } catch (e) {
        console.error('Error parsing reviews from localStorage', e);
      }
    }
  }, [excursionId, travelerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !author.trim()) return;

    setIsSubmitting(true);

    const chosenAvatarObj = AVATARS.find(av => av.value === selectedAvatar);
    const avatarFull = `${selectedAvatar} ${chosenAvatarObj?.label.split(' ').slice(1).join(' ') || 'the Noble'}`;

    const newReview = {
      excursionId,
      author: author.trim(),
      avatar: avatarFull,
      rating,
      comment: comment.trim()
    };

    try {
      // Send to server-side API with fallback to localstorage
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const savedReview = await response.json();
        saveReviewToLocalStorage(savedReview);
      } else {
        createAndSaveFallbackReview(newReview);
      }
    } catch (err) {
      console.error("Failed to post review to API, saving locally:", err);
      createAndSaveFallbackReview(newReview);
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    setHasExistingReview(true);

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted();
    }

    // Trigger custom events so other review lists and maps sync instantly
    window.dispatchEvent(new Event('kemet_reviews_updated'));

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const createAndSaveFallbackReview = (reviewData: any) => {
    const fallbackReview: Review = {
      id: existingReview?.id || `rev-${Date.now()}`,
      ...reviewData,
      date: new Date().toISOString().split('T')[0]
    };
    saveReviewToLocalStorage(fallbackReview);
  };

  const saveReviewToLocalStorage = (finalReview: Review) => {
    const saved = localStorage.getItem('kemet_reviews');
    let reviewsList: Review[] = [];
    if (saved) {
      try {
        reviewsList = JSON.parse(saved);
      } catch (e) {
        reviewsList = [];
      }
    }

    // Update existing or append new
    const existingIndex = reviewsList.findIndex(r => r.id === finalReview.id || (r.excursionId === finalReview.excursionId && r.author.toLowerCase() === finalReview.author.toLowerCase()));
    if (existingIndex > -1) {
      reviewsList[existingIndex] = finalReview;
    } else {
      reviewsList = [finalReview, ...reviewsList];
    }

    localStorage.setItem('kemet_reviews', JSON.stringify(reviewsList));
    setExistingReview(finalReview);
    updateLocalExcursionRating(excursionId, reviewsList);
  };

  const updateLocalExcursionRating = (id: string, allReviews: Review[]) => {
    const excursionReviews = allReviews.filter(r => r.excursionId === id);
    if (excursionReviews.length === 0) return;
    
    const sum = excursionReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((sum / excursionReviews.length) * 100) / 100;

    const savedEx = localStorage.getItem('kemet_excursions');
    if (savedEx) {
      try {
        const excursions = JSON.parse(savedEx) as Excursion[];
        const updated = excursions.map(ex => {
          if (ex.id === id) {
            return { ...ex, rating: average };
          }
          return ex;
        });
        localStorage.setItem('kemet_excursions', JSON.stringify(updated));
        window.dispatchEvent(new Event('kemet_excursions_updated'));
      } catch (e) {
        console.error("Could not update local excursion rating", e);
      }
    }
  };

  // Theme-based style variables
  const textTitleClass = lightTheme ? 'text-[#3b2314] font-bold' : 'text-[#e6c280] font-bold';
  const textMutedClass = lightTheme ? 'text-[#70553d]' : 'text-stone-400';
  const borderClass = lightTheme ? 'border-[#b08e23]/30' : 'border-[#d4af37]/30';
  const bgClass = lightTheme ? 'bg-[#f7ebd3]/60' : 'bg-[#15100c]/90';
  const inputBgClass = lightTheme ? 'bg-white border-[#b08e23]/30 text-[#3b2314]' : 'bg-stone-950/60 border-stone-800 text-stone-200';
  const starActiveColor = '#d4af37';
  const starInactiveColor = lightTheme ? '#c8b6a6' : '#443c34';

  return (
    <div className={`p-4 rounded-xl border ${borderClass} ${bgClass} relative overflow-hidden transition-all duration-300`}>
      {/* Decorative Sparkle */}
      <div className="absolute top-2 right-2 text-[#d4af37]/20 select-none pointer-events-none">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-[#d4af37]" />
        <h5 className={`font-serif text-xs uppercase tracking-wider ${textTitleClass}`}>
          {language === 'de' 
            ? (hasExistingReview ? '𓍼 Ihre Bewertung aktualisieren' : '𓍼 Ausflugs-Erfahrungsberichte') 
            : language === 'pl'
            ? (hasExistingReview ? '𓍼 Zaktualizuj swoją opinię' : '𓍼 Tablica opinii o wycieczce')
            : language === 'cs'
            ? (hasExistingReview ? '𓍼 Aktualizovat své hodnocení' : '𓍼 Tabule hodnocení výletu')
            : (hasExistingReview ? '𓍼 Update Your Testimony' : '𓍼 Excursion Testimony Board')}
        </h5>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Rating Stars Selection */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-mono ${textMutedClass} mb-1.5`}>
            {language === 'de' ? 'Pharaonische Bewertung (1-5 Sterne)' : language === 'pl' ? 'Ocena faraońska (1-5 gwiazdek)' : language === 'cs' ? 'Faraonské hodnocení (1-5 hvězdiček)' : 'Pharaonic Rating (1-5 Stars)'}
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isHighlighted = hoveredStar !== null ? starValue <= hoveredStar : starValue <= rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  onMouseEnter={() => setHoveredStar(starValue)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setRating(starValue)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  title={`${starValue} Stars`}
                >
                  <Star
                    className="w-5 h-5 transition-all"
                    fill={isHighlighted ? starActiveColor : 'none'}
                    color={isHighlighted ? starActiveColor : starInactiveColor}
                    strokeWidth={1.7}
                  />
                </button>
              );
            })}
            <span className="text-[10px] font-mono text-stone-500 ml-1.5">
              {language === 'de' ? (
                rating === 5 ? '𓂀 Großartig' : rating === 4 ? '𓋹 Herrlich' : rating === 3 ? '𓏞 Günstig' : rating === 2 ? '𓆗 Mäßig' : '𓀚 Mangelhaft'
              ) : language === 'pl' ? (
                rating === 5 ? '𓂀 Wspaniale' : rating === 4 ? '𓋹 Zachwycająco' : rating === 3 ? '𓏞 Korzystnie' : rating === 2 ? '𓆗 Umiarkowanie' : '𓀚 Niezadowalająco'
              ) : language === 'cs' ? (
                rating === 5 ? '𓂀 Skvělé' : rating === 4 ? '𓋹 Nádherné' : rating === 3 ? '𓏞 Příznivé' : rating === 2 ? '𓆗 Průměrné' : '𓀚 Neuspokojivé'
              ) : (
                rating === 5 ? '𓂀 Magnificent' : rating === 4 ? '𓋹 Splendid' : rating === 3 ? '𓏞 Favorable' : rating === 2 ? '𓆗 Moderate' : '𓀚 Unsatisfying'
              )}
            </span>
          </div>
        </div>

        {/* Form Inputs (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Author Name Input */}
          <div>
            <label className={`block text-[10px] uppercase tracking-wider font-mono ${textMutedClass} mb-1`}>
              {language === 'de' ? 'Name des Schreibers/Autors' : language === 'pl' ? 'Imię pisarza/autora' : language === 'cs' ? 'Jméno písaře/autora' : 'Scribe/Author Name'}
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={language === 'de' ? 'z. B. Cleopatra, Schreiber Amenhotep' : language === 'pl' ? 'np. Kleopatra, Pisarz Amenhotep' : language === 'cs' ? 'např. Kleopatra, písař Amenhotep' : 'e.g. Cleopatra, Scribe Amenhotep'}
              className={`w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:border-[#d4af37]/60 transition-all font-sans ${inputBgClass}`}
            />
          </div>

          {/* Avatar Selector Dropdown */}
          <div>
            <label className={`block text-[10px] uppercase tracking-wider font-mono ${textMutedClass} mb-1`}>
              {language === 'de' ? 'Thematische Persona / Siegel' : language === 'pl' ? 'Tematyczna persona / Pieczęć' : language === 'cs' ? 'Tematická osobnost / pečeť' : 'Thematic Persona / Seal'}
            </label>
            <select
              value={selectedAvatar}
              onChange={(e) => setSelectedAvatar(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-md border focus:outline-none focus:border-[#d4af37]/60 transition-all font-mono ${inputBgClass}`}
            >
              {AVATARS.map((av) => (
                <option key={av.value} value={av.value} className="bg-[#140f0c] text-stone-300">
                  {av.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Testimony Comment Text Area */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-mono ${textMutedClass} mb-1`}>
            {language === 'de' ? 'Schreiben Sie Ihr Feedback (archiviert im Haus des Lebens)' : language === 'pl' ? 'Napisz swoją opinię (zarchiwizowaną w Domu Życia)' : language === 'cs' ? 'Napište svou zpětnou vazbu (archivováno v Domě života)' : 'Scribe your feedback (archived in House of Life)'}
          </label>
          <textarea
            required
            rows={2.5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === 'de' ? 'Teilen Sie Ihre göttliche Erfahrung bezüglich Sand, Korallen oder sternenklaren Tempelgewölben...' : language === 'pl' ? 'Podziel się swoim boskim doświadczeniem dotyczącym piasków, koralowców lub gwieździstych sklepień świątyń...' : language === 'cs' ? 'Podělte se o své božské zkušenosti s pískem, korály nebo hvězdnou chrámovou klenbou...' : 'Share your divine experience regarding the sands, corals, or starry temple vaults...'}
            className={`w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:border-[#d4af37]/60 transition-all font-sans resize-none ${inputBgClass}`}
            maxLength={300}
          />
          <div className="flex justify-between items-center text-[9px] text-stone-500 font-mono mt-0.5">
            <span>{language === 'de' ? 'Ägyptische Register verifiziert.' : language === 'pl' ? 'Egipskie rejestry zweryfikowane.' : language === 'cs' ? 'Egyptské registry ověřeny.' : 'Egyptian Registries verified.'}</span>
            <span>{comment.length}/300 {language === 'de' ? 'Zeichen' : language === 'pl' ? 'znaków' : language === 'cs' ? 'znaků' : 'characters'}</span>
          </div>
        </div>

        {/* Submit Button & Messages */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/20">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase font-black"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Erfahrungsbericht eingetragen!' : language === 'pl' ? 'Świadectwo zapisane!' : language === 'cs' ? 'Svědectví zapsáno!' : 'Testimony inscribed!'}</span>
              </motion.div>
            ) : hasExistingReview ? (
              <div className="flex items-center gap-1 text-[#d4af37]/60 text-[9px] font-mono">
                <AlertCircle className="w-3 h-3" />
                <span>{language === 'de' ? 'Sie haben diesen Ausflug bereits bewertet.' : language === 'pl' ? 'Oceniłeś już tę wycieczkę.' : language === 'cs' ? 'Tento výlet jste již ohodnotili.' : 'You have reviewed this excursion before.'}</span>
              </div>
            ) : (
              <span className="text-[9px] text-stone-500 font-mono italic">
                {language === 'de' ? 'Wird automatisch in den lokalen Registern gespeichert.' : language === 'pl' ? 'Zapisuje się automatycznie w lokalnych rejestrach zwojów.' : language === 'cs' ? 'Automaticky se ukládá do místních registrů svitků.' : 'Saves automatically to local scroll registries.'}
              </span>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim() || !author.trim()}
            className={`px-4 py-1.5 bg-[#d4af37] text-[#140f0c] rounded-md text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#e6c280] active:scale-95 transition-all cursor-pointer disabled:opacity-55 disabled:scale-100 disabled:pointer-events-none`}
          >
            {isSubmitting 
              ? (language === 'de' ? 'Eintragen...' : language === 'pl' ? 'Zapisywanie...' : language === 'cs' ? 'Zapisování...' : 'Inscribing...') 
              : hasExistingReview 
                ? (language === 'de' ? 'Bewertung aktualisieren 𓏞' : language === 'pl' ? 'Zaktualizuj opinię 𓏞' : language === 'cs' ? 'Aktualizovat svědectví 𓏞' : 'Update Testimony 𓏞') 
                : (language === 'de' ? 'Eintragen 𓋹' : language === 'pl' ? 'Zapisz opinię 𓋹' : language === 'cs' ? 'Zapsat svědectví 𓋹' : 'Inscribe Testimony 𓋹')}
          </button>
        </div>
      </form>
    </div>
  );
}
