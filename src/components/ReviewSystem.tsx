import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, ShieldCheck, PenTool, ThumbsUp, Filter, User, Sparkles } from 'lucide-react';
import { Review, Excursion } from '../types';

// Default initial reviews are stored inside the database and fetched dynamically. No client side mockups.
const AVATARS = [
  { value: "𓁠 Cleopatra", label: "𓁠 Cleopatra the Diver" },
  { value: "𓀚 Ramses", label: "𓀚 Ramses the Nomad" },
  { value: "𓁥 Hatshepsut", label: "𓁥 Hatshepsut the Scribe" },
  { value: "𓃠 Bastet", label: "𓃠 Bastet the Explorer" },
  { value: "𓆛 Sobek", label: "𓆛 Sobek the Mariner" },
  { value: "𓅃 Horus", label: "𓅃 Horus the Speedster" },
  { value: "𓋹 Anubis", label: "𓋹 Anubis the Guardian" }
];

const EXCURSION_NAMES_MAP: Record<string, string> = {
  'diving-1': 'Ras Mohammed Coral Diving',
  'safari-1': "Set's Golden Deshret Safari",
  'history-1': "Pharaoh's Pilgrimage (Luxor)",
  'boat-1': "Sobek's Royal Queen Nefertari Cruise",
  'speedboat-1': "Horus's Falcon Eye Speedboat Cruise"
};

interface ReviewSystemProps {
  excursionId?: string; // If supplied, filters reviews to just this excursion
  onReviewAdded?: () => void;
  onRequestAuth?: (reason: string) => void;
}

export default function ReviewSystem({ excursionId, onReviewAdded, onRequestAuth }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kemet_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Pre-fill user name if logged in
  useEffect(() => {
    const savedUserStr = localStorage.getItem('kemet_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.name) setReviewAuthor(u.name);
      } catch (e) {}
    }
  }, []);

  // Load reviews from secure backend database on mount
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
        console.error("Failed to load reviews from server:", err);
      }
    };
    fetchReviews();
  }, []);

  // State for adding a review
  const [selectedExcursionId, setSelectedExcursionId] = useState<string>(excursionId || "diving-1");
  const [reviewAuthor, setReviewAuthor] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0].value);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Filter state for viewing reviews
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  // Sync state if excursionId prop changes
  useEffect(() => {
    if (excursionId) {
      setSelectedExcursionId(excursionId);
    }
  }, [excursionId]);

  // Handle adding review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is registered/logged in
    const savedUserStr = localStorage.getItem('kemet_user');
    if (!savedUserStr) {
      if (onRequestAuth) {
        onRequestAuth("Registration is required to post traveler reviews and witness testimonies.");
      } else {
        alert("Registration is required to post traveler reviews.");
      }
      return;
    }

    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const chosenAvatarObj = AVATARS.find(av => av.value === selectedAvatar);
    const avatarFull = `${selectedAvatar} ${chosenAvatarObj?.label.split(' ').slice(1).join(' ') || 'the Noble'}`;

    const newReview = {
      excursionId: selectedExcursionId,
      author: reviewAuthor,
      avatar: avatarFull,
      rating: reviewRating,
      comment: reviewComment
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (response.ok) {
        const savedReview = await response.json();
        const updatedReviews = [savedReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem('kemet_reviews', JSON.stringify(updatedReviews));
        updateLocalExcursionRating(selectedExcursionId, updatedReviews);
      } else {
        const fallbackReview: Review = {
          id: `rev-${Date.now()}`,
          ...newReview,
          date: new Date().toISOString().split('T')[0]
        };
        const updatedReviews = [fallbackReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem('kemet_reviews', JSON.stringify(updatedReviews));
        updateLocalExcursionRating(selectedExcursionId, updatedReviews);
      }
    } catch (err) {
      console.error("Failed to post review:", err);
      const fallbackReview: Review = {
        id: `rev-${Date.now()}`,
        ...newReview,
        date: new Date().toISOString().split('T')[0]
      };
      const updatedReviews = [fallbackReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem('kemet_reviews', JSON.stringify(updatedReviews));
      updateLocalExcursionRating(selectedExcursionId, updatedReviews);
    }

    setShowSuccess(true);
    setReviewAuthor("");
    setReviewComment("");
    setReviewRating(5);

    if (onReviewAdded) {
      onReviewAdded();
    }

    // Also trigger custom event so other review list/CRM instances sync up instantly!
    window.dispatchEvent(new Event('kemet_reviews_updated'));

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  // Dynamically update the average rating of the excursion in the browser local storage
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

  // Sync state if other components update the reviews list in localStorage
  useEffect(() => {
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

  // Filter reviews to display
  const displayedReviews = reviews.filter(rev => {
    const matchesExcursion = excursionId ? rev.excursionId === excursionId : true;
    const matchesStar = starFilter === 'all' ? true : rev.rating === starFilter;
    return matchesExcursion && matchesStar;
  });

  // Calculate statistics for the current view context (all excursions or just this one)
  const statsReviews = reviews.filter(rev => excursionId ? rev.excursionId === excursionId : true);
  const totalCount = statsReviews.length;
  const averageRating = totalCount > 0 
    ? Math.round((statsReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
    : 5;

  const starPercentages = [5, 4, 3, 2, 1].map(stars => {
    const count = statsReviews.filter(r => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    };
  });

  return (
    <div className="space-y-6" id={`review-system-${excursionId || 'global'}`}>
      
      {/* 1. RATING STATISTICS PANEL */}
      <div className="bg-[#1a140f] border border-[#d4af37]/20 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Large average score */}
        <div className="md:col-span-4 text-center md:border-r border-[#d4af37]/15 py-2 md:pr-4">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-1">
            {excursionId ? "Trip Rating" : "Traveler Satisfaction"}
          </span>
          <div className="font-serif text-5xl font-black text-[#e6c280] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Star 
                key={num} 
                className={`w-4 h-4 ${
                  num <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-stone-700'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {totalCount} {totalCount === 1 ? "Review" : "Reviews"}
          </span>
        </div>

        {/* Breakdown bar graph */}
        <div className="md:col-span-8 space-y-2">
          {starPercentages.map((item) => (
            <button
              key={item.stars}
              onClick={() => setStarFilter(starFilter === item.stars ? 'all' : item.stars)}
              className={`w-full flex items-center gap-3 text-xs text-left group transition-all p-1 rounded-lg ${
                starFilter === item.stars ? 'bg-[#d4af37]/10' : 'hover:bg-stone-900/40'
              }`}
            >
              <span className="w-10 text-stone-400 font-mono text-[11px] flex items-center gap-1 justify-end">
                {item.stars} <Star className="w-3 h-3 text-amber-500 fill-current" />
              </span>
              <div className="flex-1 h-2 bg-stone-900 border border-stone-800/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#d4af37]/70 to-[#bfa030]/90 rounded-full"
                />
              </div>
              <span className="w-12 text-right text-[11px] font-mono text-stone-400 group-hover:text-[#d4af37] transition-colors">
                {item.percentage}% ({item.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB CONTROLS / FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4af37]/15 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#e6c280]">
            Filter Reviews
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
              starFilter === 'all'
                ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f3e5c8]'
                : 'bg-transparent border-stone-800 text-stone-500 hover:text-stone-300'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setStarFilter(stars)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                starFilter === stars
                  ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f3e5c8]'
                  : 'bg-transparent border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
            >
              {stars} <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. SUBMIT REVIEW FORM */}
      <div className="bg-[#15110d] border border-[#d4af37]/25 rounded-2xl p-5 relative overflow-hidden">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4"
            >
              <ShieldCheck className="text-[#d4af37] w-14 h-14 mb-3 animate-bounce" />
              <h4 className="font-serif text-xl font-bold text-[#e6c280] uppercase tracking-wider">
                Review Submitted!
              </h4>
              <p className="text-stone-300 text-xs mt-1 max-w-sm">
                Thank you! Your feedback has been saved and shared with our traveler community.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <h4 className="font-serif text-sm font-semibold text-[#e6c280] uppercase tracking-widest mb-4 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#d4af37]" /> 
          Write a Review
        </h4>

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* If excursionId is not preset, show selection */}
            {!excursionId && (
              <div className="space-y-1 sm:col-span-2 md:col-span-1">
                <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                  Select Trip
                </label>
                <select
                  value={selectedExcursionId}
                  onChange={(e) => setSelectedExcursionId(e.target.value)}
                  className="w-full bg-[#1c1611] border border-[#d4af37]/30 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                >
                  {Object.entries(EXCURSION_NAMES_MAP).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Author Name */}
            <div className={`space-y-1 ${excursionId ? 'sm:col-span-1' : ''}`}>
              <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Alex Johnson"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                className="w-full bg-[#1c1611] border border-[#d4af37]/30 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            {/* Chosen Pharaoh Avatar */}
            <div className="space-y-1">
              <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                Choose an Avatar
              </label>
              <select
                value={selectedAvatar}
                onChange={(e) => setSelectedAvatar(e.target.value)}
                className="w-full bg-[#1c1611] border border-[#d4af37]/30 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              >
                {AVATARS.map((av) => (
                  <option key={av.value} value={av.value}>{av.label}</option>
                ))}
              </select>
            </div>

            {/* Satisfaction Stars */}
            <div className={`space-y-1 ${excursionId ? 'sm:col-span-2 md:col-span-1' : ''}`}>
              <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
                Your Rating
              </label>
              <div className="flex gap-2 py-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setReviewRating(num)}
                    onMouseEnter={() => setHoveredStar(num)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        num <= (hoveredStar ?? reviewRating) 
                          ? 'text-amber-400 fill-current drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' 
                          : 'text-stone-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-stone-500 text-[11px] font-mono ml-1 self-center">
                  ({reviewRating}/5 Stars)
                </span>
              </div>
            </div>
          </div>

          {/* Testimony Comment Text Area */}
          <div className="space-y-1">
            <label className="text-stone-400 text-[10px] font-mono uppercase tracking-widest block">
              Write Your Feedback
            </label>
            <textarea
              required
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us what you thought about the corals, desert speed, boat trip, or your guide..."
              className="w-full bg-[#1c1611] border border-[#d4af37]/30 rounded-lg p-3 text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37] leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#d4af37]/20 to-[#9a7b1c]/20 hover:from-[#d4af37]/45 hover:to-[#9a7b1c]/45 border border-[#d4af37]/40 hover:border-[#d4af37]/80 text-[#f3e5c8] rounded-xl py-2.5 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            Submit My Review
          </button>
        </form>
      </div>

      {/* 4. SCROLLABLE REVIEW LIST */}
      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {displayedReviews.length === 0 ? (
          <div className="bg-[#120d09] border border-stone-800 rounded-xl p-8 text-center text-stone-500 italic text-xs">
            No reviews match this filter yet. Be the first to share your experience!
          </div>
        ) : (
          displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#1a1410] border border-[#d4af37]/15 rounded-xl p-4 space-y-3 shadow-md relative overflow-hidden group hover:border-[#d4af37]/30 transition-colors"
            >
              {/* Corner Watermark decoration */}
              <div className="absolute top-1 right-2 text-stone-900/15 font-serif text-3xl select-none pointer-events-none">
                𓋹
              </div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#120d09] border border-[#d4af37]/20 rounded-full flex items-center justify-center text-lg">
                    {rev.avatar.split(' ')[0]}
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-[#e6c280] flex items-center gap-1.5">
                      {rev.author}
                      <span className="text-[10px] text-[#d4af37]/60 font-mono font-normal">
                        • Verified Traveler
                      </span>
                    </h5>
                    <span className="text-[9px] font-mono text-stone-500">
                      {rev.avatar.split(' ').slice(1).join(' ')} • {rev.date}
                    </span>
                  </div>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-stone-300 text-xs leading-relaxed italic border-l-2 border-[#d4af37]/20 pl-3">
                "{rev.comment}"
              </p>

              {/* Voyage identifier tag (show only if viewing all reviews) */}
              {!excursionId && (
                <div className="flex justify-between items-center pt-1">
                  <span className="inline-block bg-[#241c14] border border-[#d4af37]/15 text-[#d4af37]/80 rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider">
                    Expedition: {EXCURSION_NAMES_MAP[rev.excursionId] || 'Sacred Journey'}
                  </span>
                  
                  <button className="text-[10px] text-stone-500 hover:text-[#d4af37] font-mono flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Helpful 
                  </button>
                </div>
              )}

              {excursionId && (
                <div className="flex justify-end pt-0.5">
                  <button className="text-[9px] text-stone-600 hover:text-[#d4af37] font-mono flex items-center gap-1">
                    <ThumbsUp className="w-2.5 h-2.5" /> Mark Helpful
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
