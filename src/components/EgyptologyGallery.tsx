import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, X, BookOpen, Compass, MapPin, Camera, Upload, Heart, RefreshCw, Check, Loader2, Image } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  location: string;
  image: string;
  description: string;
  ancientLore: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: "The Gates of the Red Sea (Kemet Coast)",
    location: "Suez Gulf Coast, Red Sea",
    image: "/src/assets/images/egypt_red_sea_hero_1784070351173.jpg",
    description: "The spectacular convergence of pure desert dunes with the rich turquoise tides of the Red Sea. In the distance, an ancient obelisk sentinel watches over the trade vessels.",
    ancientLore: "The Pharaohs knew the Red Sea as 'Yam Suph' or 'The Sea of Reeds'. They sent royal expeditionary fleets of cedarwood ships from these very shorelines to load copper, gold, and exotic wild animals from the southern empires."
  },
  {
    id: 'gal-2',
    title: "Submerged Pharaoh Shrines of Nun",
    location: "Ras Mohammed Seabed",
    image: "/src/assets/images/egypt_sea_diving_1784070366165.jpg",
    description: "Centuries-old stone statues representing the guardians of the afterlife, resting amongst vibrant red anemones and bustling coral reefs.",
    ancientLore: "Egyptian maritime commanders believed that placing stone effigies of the gods on the sea floor would protect sails from sudden winds. Today, scuba divers swim with turtles around these silent underwater pharaonic sentinels."
  },
  {
    id: 'gal-3',
    title: "Caravans of Set's Wild Sands",
    location: "Sinai Mountain Desert",
    image: "/src/assets/images/egypt_desert_safari_1784070379685.jpg",
    description: "Explorers crossing the vast, high-contrast sand ridges of the Hurghada desert, with ancient ruins popping up from the sandy floor under a brilliant gold sunset.",
    ancientLore: "The Sinai desert has always been a place of powerful spiritual transformations and trials. Nomadic Bedouins and Pharaonic caravans shared these mountain paths, using the stars of Orion and Sirius to cross the dry dunes safely."
  },
  {
    id: 'gal-4',
    title: "Sunset Columns of the Karnak Temple",
    location: "East Bank, Luxor (Waset)",
    image: "/src/assets/images/egypt_luxor_temple_1784070393047.jpg",
    description: "The massive, awe-inspiring Hypostyle Hall containing 134 sandstone columns standing tall under a majestic orange sunset.",
    ancientLore: "Built to represent the primordial forest where the sun god Ra first rose from the lotus flower, these columns are covered in deep hieroglyphic inscriptions tracing the royal lineage and victories of Ramses the Great."
  }
];

export default function EgyptologyGallery() {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Community Photos Board States
  const [communityPhotos, setCommunityPhotos] = useState<any[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(true);

  // Gallery Image Upload State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Form Submission States
  const [authorName, setAuthorName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Reactions / Likes States
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('kemet_photo_likes');
    return saved ? JSON.parse(saved) : {
      'photo-seed-1': 24,
      'photo-seed-2': 18,
      'photo-seed-3': 42
    };
  });
  const [myLikedPhotos, setMyLikedPhotos] = useState<string[]>(() => {
    const saved = localStorage.getItem('kemet_my_likes');
    return saved ? JSON.parse(saved) : [];
  });

  // Load scenery gallery skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Community Photos
  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/community-photos');
      if (res.ok) {
        const data = await res.json();
        setCommunityPhotos(data);
      }
    } catch (err) {
      console.error("Failed to fetch community photos:", err);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Process standard file upload click
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit traveler photo to public board
  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage || !authorName.trim() || !caption.trim()) return;

    setIsSubmittingPhoto(true);
    try {
      const res = await fetch('/api/community-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          caption: caption.trim(),
          author: authorName.trim(),
          location: locationName.trim() || "Kemet Coast"
        })
      });

      if (res.ok) {
        const newPhoto = await res.json();
        setCommunityPhotos(prev => [newPhoto, ...prev]);
        setCapturedImage(null);
        setAuthorName('');
        setCaption('');
        setLocationName('');
        // Trigger golden scarab celebration
        window.dispatchEvent(new Event('kemet_celebrate'));
      } else {
        const errData = await res.json();
        console.error("Server rejected photo:", errData.error);
      }
    } catch (err) {
      console.error("Failed to save public photo:", err);
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  // Like Toggle
  const handleLikePhoto = (photoId: string) => {
    let newLikes = { ...likes };
    let newMyLiked = [...myLikedPhotos];

    if (newMyLiked.includes(photoId)) {
      newMyLiked = newMyLiked.filter(id => id !== photoId);
      newLikes[photoId] = Math.max(0, (newLikes[photoId] || 1) - 1);
    } else {
      newMyLiked.push(photoId);
      newLikes[photoId] = (newLikes[photoId] || 0) + 1;
    }

    setLikes(newLikes);
    setMyLikedPhotos(newMyLiked);
    localStorage.setItem('kemet_photo_likes', JSON.stringify(newLikes));
    localStorage.setItem('kemet_my_likes', JSON.stringify(newMyLiked));
  };

  return (
    <div className="space-y-12" id="immersive-gallery">
      {/* Title */}
      <div className="text-center">
        <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.25em]">Sights of Kemet</span>
        <h2 className="font-serif text-3xl font-extrabold text-[#e6c280] uppercase mt-1">
          Immersive Desert & Reef Galleries
        </h2>
        <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
          Step into the visual majesty of the Red Sea coast and desert ruins. Explore high-fidelity scenery captured under the golden sun of Ra.
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-[#1a1410] border border-[#d4af37]/10 rounded-2xl overflow-hidden shadow-lg animate-pulse"
              id={`gallery-skeleton-${index}`}
            >
              {/* Image container skeleton */}
              <div className="h-64 bg-[#211a13] relative flex items-center justify-center">
                <span className="text-[#d4af37]/15 text-4xl font-serif">𓅃</span>
              </div>

              {/* Content Preview info skeleton */}
              <div className="p-4 space-y-2">
                <div className="w-20 h-3 bg-[#211a13] rounded-md" />
                <div className="w-3/4 h-4 bg-[#211a13]/80 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className="bg-[#1a1410] border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-lg group relative cursor-pointer"
              onClick={() => setActiveItem(item)}
              id={`gallery-thumb-${item.id}`}
            >
              {/* Image container */}
              <div className="h-64 relative overflow-hidden">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  initial={{ scale: 1.08 }}
                  whileHover={{ scale: 1.15, y: -6 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full h-full object-cover origin-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-transparent to-transparent opacity-80 pointer-events-none"></div>
                
                {/* View Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#140f0a]/40 backdrop-blur-[2px] transition-all duration-300">
                  <div className="bg-[#d4af37] text-[#140f0a] p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Eye className="w-5 h-5 text-[#140f0a]" />
                  </div>
                </div>
              </div>

              {/* Content Preview info */}
              <div className="p-4 relative">
                <div className="flex items-center gap-1 text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-[#d4af37]" /> {item.location.split(',')[0]}
                </div>
                <h4 className="font-serif text-[#e6c280] text-sm font-bold uppercase tracking-wider mt-1 truncate">
                  {item.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* DIVINE CHRONICLES: PUBLIC TRAVEL BOARD SECTION */}
      {/* ========================================================= */}
      <div className="border-t border-stone-800 pt-12 space-y-8" id="travelers-chronicles-board">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-[#d4af37] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
            𓆗 Divine Chronicles 𓆗
          </span>
          <h3 className="font-serif text-2xl font-black text-[#e6c280] uppercase tracking-wide">
            Public Travel Board
          </h3>
          <p className="text-stone-400 text-xs max-w-lg mx-auto">
            Immortalize your journey under Ra's sky. Select or drag & drop an expedition photo from your gallery to pin to our community board.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: PHOTO INSCRIBER FORM & GALLERY UPLOADER */}
          <div className="lg:col-span-5 bg-[#17120e] border border-[#d4af37]/25 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-8xl font-serif select-none pointer-events-none">
              𓂀
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-[#e6c280] uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#d4af37]" /> Upload Voyage Photo
              </h4>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Choose a photo from your device's photo gallery to share on our board.
              </p>
            </div>

            {/* Gallery Upload Box / Drag & Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative h-64 rounded-2xl overflow-hidden border flex flex-col items-center justify-center transition-all ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-950/20' 
                  : capturedImage 
                    ? 'border-emerald-500/40 bg-stone-900' 
                    : 'border-[#d4af37]/20 bg-stone-950/60'
              }`}
            >
              {capturedImage ? (
                /* Captured Image Preview and Redo trigger */
                <div className="w-full h-full relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured voyage preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <label className="bg-stone-900/95 border border-stone-800 hover:border-[#d4af37]/40 text-[#e6c280] font-mono text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-[#d4af37]" /> Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <div className="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </div>
                </div>
              ) : (
                /* Empty / Upload State */
                <div className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto text-[#d4af37]">
                    <Image className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-stone-200 font-medium font-serif uppercase tracking-wider">
                      Select Photo from Gallery
                    </p>
                    <p className="text-[10px] text-stone-400 max-w-xs mx-auto">
                      Click below to choose an image file from your photo library, or drop it here directly.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <label className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg">
                      <Upload className="w-4 h-4" />
                      <span>Choose Photo from Gallery</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Traveler & Expedition details form */}
            <form onSubmit={handleSubmitPhoto} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-400">Traveler Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scribe Sophia"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-stone-950/80 border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-400">Expedition Site</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharm El Sheikh"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-stone-950/80 border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-400">Voyage Inscription (Caption)</label>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder="Share a short historical testimony or review of your visual journey..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-stone-950/80 border border-[#d4af37]/25 rounded-xl p-3 text-stone-200 text-xs focus:outline-none focus:border-[#d4af37] transition-colors leading-relaxed"
                />
                <span className="text-[8px] font-mono text-stone-500 text-right block">
                  {caption.length}/180 characters limit
                </span>
              </div>

              <button
                type="submit"
                disabled={!capturedImage || isSubmittingPhoto}
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08e23] disabled:from-stone-850 disabled:to-stone-900 disabled:text-stone-500 text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:cursor-not-allowed shadow-md shadow-[#d4af37]/5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#140f0a]" />
                    <span>Sealing Testimony...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Inscribe to Community Board</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE COMMUNITY PHOTO BOARD GRID */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">
                Ledger Entries ({communityPhotos.length} Tours)
              </span>
              <button 
                onClick={fetchPhotos}
                className="text-stone-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                title="Refresh Board"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingPhotos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-[#1a1410] rounded-2xl border border-stone-850 animate-pulse" />
                ))}
              </div>
            ) : communityPhotos.length === 0 ? (
              <div className="text-center py-16 bg-[#17120e]/40 rounded-2xl border border-dashed border-[#d4af37]/15">
                <Image className="w-10 h-10 text-stone-600 mx-auto mb-2 animate-bounce" />
                <p className="font-serif text-sm text-stone-400">The Travel Board is currently unscribed.</p>
                <p className="text-[10px] text-stone-500">Be the first to share an image above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin">
                <AnimatePresence>
                  {communityPhotos.map((photo) => {
                    const isLiked = myLikedPhotos.includes(photo.id);
                    const count = likes[photo.id] || 0;
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#120e0a] border border-[#d4af37]/15 rounded-2xl overflow-hidden shadow-md group relative flex flex-col justify-between"
                      >
                        {/* Image Canvas */}
                        <div className="h-44 relative overflow-hidden bg-stone-900">
                          <motion.img 
                            src={photo.image} 
                            alt={photo.caption} 
                            initial={{ scale: 1.08 }}
                            whileHover={{ scale: 1.15, y: -4 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="w-full h-full object-cover origin-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-transparent to-transparent opacity-90 pointer-events-none" />

                          {/* Interactive Sparkle Reaction Button */}
                          <button
                            onClick={() => handleLikePhoto(photo.id)}
                            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isLiked 
                                ? 'bg-amber-500/20 text-amber-300 border-[#d4af37]/55' 
                                : 'bg-stone-900/75 text-stone-400 border-stone-800 hover:text-[#d4af37] hover:border-[#d4af37]/35'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-current text-amber-400' : ''}`} />
                            <span className="text-[10px] font-mono font-bold">{count}</span>
                          </button>

                          {/* Pin details overlay */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                            <span className="text-[10px] font-serif font-black text-[#e6c280] bg-[#140f0a]/60 px-2.5 py-1 rounded-md border border-[#d4af37]/10 truncate max-w-[150px]">
                              {photo.author}
                            </span>
                            <span className="text-[8px] font-mono text-stone-400 bg-stone-950/70 px-2 py-1 rounded border border-stone-850 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-[#d4af37]" /> {photo.location}
                            </span>
                          </div>
                        </div>

                        {/* Caption Context */}
                        <div className="p-3 bg-[#17120e] flex-1 flex flex-col justify-between space-y-2">
                          <p className="text-[10.5px] text-stone-300 leading-relaxed italic">
                            "{photo.caption}"
                          </p>
                          <div className="flex items-center justify-between border-t border-stone-850/60 pt-2 text-[8px] font-mono text-stone-500">
                            <span>📜 Travel Log</span>
                            <span>{new Date(photo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Theater Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#16110d] border border-[#d4af37]/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col lg:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md border border-stone-800 text-stone-400 hover:text-white p-2.5 rounded-full transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Large Image Side */}
              <div className="lg:w-3/5 h-64 lg:h-[480px] relative">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden"></div>
              </div>

              {/* Content Side */}
              <div className="lg:w-2/5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Compass className="w-3.5 h-3.5 text-[#d4af37]" /> {activeItem.location}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#e6c280] uppercase tracking-wide leading-snug">
                      {activeItem.title}
                    </h3>
                  </div>

                  <p className="text-stone-300 text-xs leading-relaxed">
                    {activeItem.description}
                  </p>

                  {/* Lore Inscription box */}
                  <div className="bg-[#241c14] border-l-2 border-[#d4af37] rounded-r-xl p-4 space-y-1">
                    <span className="font-serif text-[10px] font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Scribe's Historical Lore
                    </span>
                    <p className="text-stone-400 text-xs italic leading-relaxed">
                      "{activeItem.ancientLore}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 flex justify-end">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="bg-[#d4af37] text-[#140f0a] font-serif font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Return to Gallery
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
