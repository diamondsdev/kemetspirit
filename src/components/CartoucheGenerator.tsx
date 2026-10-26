import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Download, RefreshCw, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface HieroglyphData {
  symbolName: string;
  meaning: string;
  pronunciation: string;
  // A function that renders the symbol inside a golden container
  renderSymbol: (color: string) => React.ReactNode;
}

// Map letters A-Z to authentic-inspired Egyptian Hieroglyphs
const HIEROGLYPHS_MAP: Record<string, HieroglyphData> = {
  A: {
    symbolName: "Vulture (Apep's Foe)",
    meaning: "Beginnings, Vision, Sovereignty",
    pronunciation: "Ah",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,65 C25,50 35,40 50,40 C65,40 75,50 80,65 M50,40 L50,15 L45,22 M50,15 L55,22 M30,53 L30,80 M70,53 L70,80" />
        <circle cx="50" cy="30" r="4" fill={c} />
        <path d="M40,40 C35,43 30,50 30,53" />
        <path d="M60,40 C65,43 70,50 70,53" />
      </svg>
    )
  },
  B: {
    symbolName: "Foot (Babi's Step)",
    meaning: "Action, Stability, Journeys",
    pronunciation: "Buh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M35,20 L35,65 C35,75 40,80 55,80 L75,80" strokeLinecap="round" />
        <path d="M55,80 C65,80 75,75 75,65" strokeLinecap="round" />
        <path d="M35,35 L45,35 M35,50 L45,50" />
      </svg>
    )
  },
  C: {
    symbolName: "Wicker Basket",
    meaning: "Capacity, Wisdom, Gathering",
    pronunciation: "Kuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,40 L80,40 C80,65 65,80 50,80 C35,80 20,65 20,40 Z" strokeLinejoin="round" />
        <path d="M20,40 L50,80 M80,40 L50,80 M50,40 L50,80" strokeDasharray="3,3" />
      </svg>
    )
  },
  D: {
    symbolName: "Hand of Atum",
    meaning: "Creation, Giving, Protection",
    pronunciation: "Duh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M25,60 L50,60 C55,60 75,55 80,50 C85,45 80,35 70,40 L60,45" />
        <path d="M50,43 C55,30 50,20 42,20 C35,20 38,35 43,43" />
        <path d="M43,43 C47,25 42,15 35,15 C28,15 30,30 35,43" />
        <path d="M35,43 C38,28 32,18 25,18 C18,18 20,32 27,45" />
        <path d="M27,45 C20,35 15,25 10,30 C5,35 12,45 22,50" />
      </svg>
    )
  },
  E: {
    symbolName: "Flowering Reed",
    meaning: "Life force, Breath, Spirit",
    pronunciation: "Eh/Ee",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M50,85 L50,15" />
        <path d="M50,15 C40,25 40,45 50,55" />
        <path d="M50,25 C42,32 42,48 50,55" />
        <path d="M50,75 L65,85 M50,65 L35,75" />
      </svg>
    )
  },
  F: {
    symbolName: "Horned Viper",
    meaning: "Focus, Adaptability, Defense",
    pronunciation: "Ef",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M15,65 C25,65 30,55 45,55 C60,55 65,65 80,65 C90,65 95,50 85,45 C75,40 65,48 60,48" strokeLinecap="round" />
        <path d="M85,45 L88,35 M85,45 L78,38" />
      </svg>
    )
  },
  G: {
    symbolName: "Sacred Jar Stand",
    meaning: "Purity, Refreshment, Ritual",
    pronunciation: "Guh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M30,80 L70,80" />
        <path d="M50,80 L50,45" />
        <path d="M35,45 L65,45 C75,45 75,20 65,20 L35,20 C25,20 25,45 35,45 Z" />
        <path d="M35,20 L40,10 L60,10 L65,20" />
      </svg>
    )
  },
  H: {
    symbolName: "Reed Shelter",
    meaning: "Home, Protection, Sanctuary",
    pronunciation: "Huh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <rect x="25" y="25" width="50" height="50" rx="5" />
        <path d="M40,75 L40,60 L60,60 L60,75" />
        <line x1="25" y1="50" x2="75" y2="50" />
      </svg>
    )
  },
  I: {
    symbolName: "Double Flowering Reeds",
    meaning: "Duality, Harmony, Balance",
    pronunciation: "Ee",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M40,85 L40,15" />
        <path d="M40,15 C30,25 30,45 40,55" />
        <path d="M60,85 L60,15" />
        <path d="M60,15 C50,25 50,45 60,55" />
      </svg>
    )
  },
  J: {
    symbolName: "Uraeus Cobra",
    meaning: "Divine Power, Protection, Fire",
    pronunciation: "Juh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M30,80 C45,80 50,75 50,60 C50,45 35,40 35,25 C35,15 45,15 55,20 C65,25 70,35 65,50" />
        <path d="M55,20 C58,12 68,12 70,22" />
        <circle cx="53" cy="18" r="2" fill={c} />
      </svg>
    )
  },
  K: {
    symbolName: "Basket with Handle",
    meaning: "Rulership, Containment, Authority",
    pronunciation: "Kuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,45 L80,45 C80,68 65,80 50,80 C35,80 20,68 20,45 Z" />
        <path d="M80,45 C88,45 88,30 80,30 L70,30" />
      </svg>
    )
  },
  L: {
    symbolName: "Recumbent Lion",
    meaning: "Strength, Nobility, The Sun",
    pronunciation: "Luh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,70 L80,70" />
        <path d="M20,70 C15,65 15,50 25,50 L55,50 C65,50 70,40 70,30 C75,20 85,25 80,45 C78,55 75,70 70,70" />
        <path d="M72,30 C75,25 80,25 82,32" />
        <path d="M20,70 C15,75 10,70 12,65" />
      </svg>
    )
  },
  M: {
    symbolName: "Water Waves",
    meaning: "Creation, Change, Emotion",
    pronunciation: "Muh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M15,40 L25,30 L35,40 L45,30 L55,40 L65,30 L75,40 L85,30" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15,60 L25,50 L35,60 L45,50 L55,60 L65,50 L75,60 L85,50" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  N: {
    symbolName: "Water Ripple",
    meaning: "Flow, Connection, Nourishment",
    pronunciation: "Nuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M15,50 L22,40 L29,50 L36,40 L43,50 L50,40 L57,50 L64,40 L71,50 L78,40 L85,50" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  O: {
    symbolName: "Lasso of Eternity",
    meaning: "Infinity, Order, Protection",
    pronunciation: "Oh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <circle cx="50" cy="45" r="22" />
        <path d="M35,60 L25,80 M65,60 L75,80" />
        <line x1="25" y1="80" x2="75" y2="80" />
      </svg>
    )
  },
  P: {
    symbolName: "Reed Mat",
    meaning: "Foundation, Comfort, Order",
    pronunciation: "Puh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <rect x="25" y="25" width="50" height="50" rx="4" />
        <line x1="37" y1="25" x2="37" y2="75" />
        <line x1="50" y1="25" x2="50" y2="75" />
        <line x1="62" y1="25" x2="62" y2="75" />
        <line x1="25" y1="50" x2="75" y2="50" />
      </svg>
    )
  },
  Q: {
    symbolName: "Sandy Hillside",
    meaning: "Ascent, Vision, Endurance",
    pronunciation: "Kuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M15,80 L45,40 C50,35 55,35 60,40 L85,80" strokeLinejoin="round" />
        <path d="M30,60 C40,55 50,62 60,57" />
      </svg>
    )
  },
  R: {
    symbolName: "Mouth of Ra",
    meaning: "Speech, Breath, Magic",
    pronunciation: "Ruh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,50 C35,30 65,30 80,50 C65,70 35,70 20,50 Z" strokeLinejoin="round" />
        <line x1="20" y1="50" x2="80" y2="50" />
      </svg>
    )
  },
  S: {
    symbolName: "Folded Cloth",
    meaning: "Refinement, Clothing, Health",
    pronunciation: "Suh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M35,20 L65,20 C65,20 65,55 50,60 C35,65 35,80 50,80 L65,80" strokeLinecap="round" />
        <path d="M35,20 L35,50" />
      </svg>
    )
  },
  T: {
    symbolName: "Loaf of Bread",
    meaning: "Nourishment, Offerings, Life",
    pronunciation: "Tuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M20,70 L80,70 C80,70 80,30 50,30 C20,30 20,70 20,70 Z" strokeLinejoin="round" />
        <line x1="30" y1="50" x2="70" y2="50" />
      </svg>
    )
  },
  U: {
    symbolName: "Quail Chick",
    meaning: "Youth, Growth, Messages",
    pronunciation: "Oo/Wuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <circle cx="65" cy="35" r="12" />
        <path d="M65,47 C55,50 45,45 35,55 C25,65 25,80 45,80 C65,80 77,65 77,47" />
        <path d="M75,32 L83,30" />
        <path d="M35,70 L30,80 M45,78 L45,85 M55,75 L60,85" />
      </svg>
    )
  },
  V: {
    symbolName: "Horned Viper (Royal)",
    meaning: "Sovereignty, Protection, Alertness",
    pronunciation: "Vuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M15,55 C25,55 35,65 50,65 C65,65 75,55 85,55" strokeLinecap="round" />
        <path d="M15,55 L10,48 M15,55 L22,48" strokeLinecap="round" />
        <path d="M85,55 C90,50 90,40 82,35 C75,30 70,40 65,42" />
      </svg>
    )
  },
  W: {
    symbolName: "Quail Chick (Nesting)",
    meaning: "Community, Prosperity, Wind",
    pronunciation: "Wuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <circle cx="60" cy="30" r="10" />
        <path d="M60,40 C50,43 40,40 30,50 C20,60 20,75 40,75 C60,75 70,60 70,40" />
        <path d="M30,65 L25,75 M40,73 L40,80 M50,70 L55,80" />
      </svg>
    )
  },
  X: {
    symbolName: "Crossed Scepters",
    meaning: "Rulership, Crossroads, Union",
    pronunciation: "Eks",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <line x1="25" y1="25" x2="75" y2="75" strokeLinecap="round" />
        <line x1="75" y1="25" x2="25" y2="75" strokeLinecap="round" />
        <circle cx="25" cy="25" r="5" fill={c} />
        <circle cx="75" cy="25" r="5" fill={c} />
      </svg>
    )
  },
  Y: {
    symbolName: "Sacred Feather of Ma'at",
    meaning: "Truth, Order, Cosmic Justice",
    pronunciation: "Yuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <path d="M50,85 C50,85 50,40 50,15" />
        <path d="M50,15 C65,22 70,50 60,85" />
        <path d="M50,30 L60,35 M50,45 L58,50 M50,60 L56,65" />
      </svg>
    )
  },
  Z: {
    symbolName: "Door Bolt of Sekhmet",
    meaning: "Security, Sealing, Strength",
    pronunciation: "Zuh",
    renderSymbol: (c) => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" stroke={c} strokeWidth="3" fill="none">
        <line x1="15" y1="50" x2="85" y2="50" strokeLinecap="round" />
        <line x1="35" y1="35" x2="35" y2="65" strokeLinecap="round" />
        <line x1="65" y1="35" x2="65" y2="65" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill={c} />
      </svg>
    )
  }
};

const HIEROGLYPHS_RAW_PATHS: Record<string, string> = {
  A: `<path d="M20,65 C25,50 35,40 50,40 C65,40 75,50 80,65 M50,40 L50,15 L45,22 M50,15 L55,22 M30,53 L30,80 M70,53 L70,80" stroke-width="3" fill="none" stroke="#d4af37" /><circle cx="50" cy="30" r="4" fill="#d4af37" /><path d="M40,40 C35,43 30,50 30,53" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M60,40 C65,43 70,50 70,53" stroke-width="3" fill="none" stroke="#d4af37" />`,
  B: `<path d="M35,20 L35,65 C35,75 40,80 55,80 L75,80" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M55,80 C65,80 75,75 75,65" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,35 L45,35 M35,50 L45,50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  C: `<path d="M20,40 L80,40 C80,65 65,80 50,80 C35,80 20,65 20,40 Z" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M20,40 L50,80 M80,40 L50,80 M50,40 L50,80" stroke-dasharray="3,3" stroke-width="3" fill="none" stroke="#d4af37" />`,
  D: `<path d="M25,60 L50,60 C55,60 75,55 80,50 C85,45 80,35 70,40 L60,45" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,43 C55,30 50,20 42,20 C35,20 38,35 43,43" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M43,43 C47,25 42,15 35,15 C28,15 30,30 35,43" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,43 C38,28 32,18 25,18 C18,18 20,32 27,45" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M27,45 C20,35 15,25 10,30 C5,35 12,45 22,50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  E: `<path d="M50,85 L50,15" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,15 C40,25 40,45 50,55" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,25 C42,32 42,48 50,55" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,75 L65,85 M50,65 L35,75" stroke-width="3" fill="none" stroke="#d4af37" />`,
  F: `<path d="M15,65 C25,65 30,55 45,55 C60,55 65,65 80,65 C90,65 95,50 85,45 C75,40 65,48 60,48" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M85,45 L88,35 M85,45 L78,38" stroke-width="3" fill="none" stroke="#d4af37" />`,
  G: `<path d="M30,80 L70,80" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,80 L50,45" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,45 L65,45 C75,45 75,20 65,20 L35,20 C25,20 25,45 35,45 Z" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,20 L40,10 L60,10 L65,20" stroke-width="3" fill="none" stroke="#d4af37" />`,
  H: `<rect x="25" y="25" width="50" height="50" rx="5" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M40,75 L40,60 L60,60 L60,75" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="25" y1="50" x2="75" y2="50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  I: `<line x1="40" y1="85" x2="40" y2="15" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M40,15 C30,25 30,45 40,55" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="60" y1="85" x2="60" y2="15" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M60,15 C50,25 50,45 60,55" stroke-width="3" fill="none" stroke="#d4af37" />`,
  J: `<path d="M30,80 C45,80 50,75 50,60 C50,45 35,40 35,25 C35,15 45,15 55,20 C65,25 70,35 65,50" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M55,20 C58,12 68,12 70,22" stroke-width="3" fill="none" stroke="#d4af37" /><circle cx="53" cy="18" r="2" fill="#d4af37" />`,
  K: `<path d="M20,45 L80,45 C80,68 65,80 50,80 C35,80 20,68 20,45 Z" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M80,45 C88,45 88,30 80,30 L70,30" stroke-width="3" fill="none" stroke="#d4af37" />`,
  L: `<path d="M20,70 L80,70" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M20,70 C15,65 15,50 25,50 L55,50 C65,50 70,40 70,30 C75,20 85,25 80,45 C78,55 75,70 70,70" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M72,30 C75,25 80,25 82,32" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M20,70 C15,75 10,70 12,65" stroke-width="3" fill="none" stroke="#d4af37" />`,
  M: `<path d="M15,40 L25,30 L35,40 L45,30 L55,40 L65,30 L75,40 L85,30" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M15,60 L25,50 L35,60 L45,50 L55,60 L65,50 L75,60 L85,50" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" />`,
  N: `<path d="M15,50 L22,40 L29,50 L36,40 L43,50 L50,40 L57,50 L64,40 L71,50 L78,40 L85,50" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" />`,
  O: `<circle cx="50" cy="45" r="22" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,60 L25,80 M65,60 L75,80" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="25" y1="80" x2="75" y2="80" stroke-width="3" fill="none" stroke="#d4af37" />`,
  P: `<rect x="25" y="25" width="50" height="50" rx="4" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="37" y1="25" x2="37" y2="75" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="50" y1="25" x2="50" y2="75" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="62" y1="25" x2="62" y2="75" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="25" y1="50" x2="75" y2="50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  Q: `<path d="M15,80 L45,40 C50,35 55,35 60,40 L85,80" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M30,60 C40,55 50,62 60,57" stroke-width="3" fill="none" stroke="#d4af37" />`,
  R: `<path d="M20,50 C35,30 65,30 80,50 C65,70 35,70 20,50 Z" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="20" y1="50" x2="80" y2="50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  S: `<path d="M35,20 L65,20 C65,20 65,55 50,60 C35,65 35,80 50,80 L65,80" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,20 L35,50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  T: `<path d="M20,70 L80,70 C80,70 80,30 50,30 C20,30 20,70 20,70 Z" stroke-linejoin="round" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="30" y1="50" x2="70" y2="50" stroke-width="3" fill="none" stroke="#d4af37" />`,
  U: `<circle cx="65" cy="35" r="12" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M65,47 C55,50 45,45 35,55 C25,65 25,80 45,80 C65,80 77,65 77,47" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M75,32 L83,30" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M35,70 L30,80 M45,78 L45,85 M55,75 L60,85" stroke-width="3" fill="none" stroke="#d4af37" />`,
  V: `<path d="M15,55 C25,55 35,65 50,65 C65,65 75,55 85,55" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M15,55 L10,48 M15,55 L22,48" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M85,55 C90,50 90,40 82,35 C75,30 70,40 65,42" stroke-width="3" fill="none" stroke="#d4af37" />`,
  W: `<circle cx="60" cy="30" r="10" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M60,40 C50,43 40,40 30,50 C20,60 20,75 40,75 C60,75 70,60 70,40" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M30,65 L25,75 M40,73 L40,80 M50,70 L55,80" stroke-width="3" fill="none" stroke="#d4af37" />`,
  X: `<line x1="25" y1="25" x2="75" y2="75" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="75" y1="25" x2="25" y2="75" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><circle cx="25" cy="25" r="5" fill="#d4af37" /><circle cx="75" cy="25" r="5" fill="#d4af37" />`,
  Y: `<path d="M50,85 C50,85 50,40 50,15" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,15 C65,22 70,50 60,85" stroke-width="3" fill="none" stroke="#d4af37" /><path d="M50,30 L60,35 M50,45 L58,50 M50,60 L56,65" stroke-width="3" fill="none" stroke="#d4af37" />`,
  Z: `<line x1="15" y1="50" x2="85" y2="50" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="35" y1="35" x2="35" y2="65" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><line x1="65" y1="35" x2="65" y2="65" stroke-linecap="round" stroke-width="3" fill="none" stroke="#d4af37" /><circle cx="50" cy="50" r="4" fill="#d4af37" />`
};

interface SavedCartouche {
  id: string;
  name: string;
  date: string;
}

export default function CartoucheGenerator() {
  const { t, language } = useLanguage();
  const [name, setName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryCartouche = params.get('cartouche');
      if (queryCartouche) {
        return queryCartouche.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
      }
    }
    return "KEMET";
  });
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeSymbol, setActiveSymbol] = useState<HieroglyphData | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);
  const [savedCartouches, setSavedCartouches] = useState<SavedCartouche[]>(() => {
    const local = localStorage.getItem('kemet_saved_cartouches');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);

  useEffect(() => {
    if (cleanName) {
      setIsGlowing(true);
      const timer = setTimeout(() => {
        setIsGlowing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cleanName]);

  const generateCartoucheSVG = (nameString: string) => {
    const chars = nameString.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8).split('');
    const N = chars.length;
    if (N === 0) return "";
    
    const itemHeight = 70;
    const gap = 15;
    const topPadding = 90;
    const bottomPadding = 90;
    const H = topPadding + N * (itemHeight + gap) - gap + bottomPadding;
    
    let glyphsMarkup = "";
    chars.forEach((char, index) => {
      const rawPath = HIEROGLYPHS_RAW_PATHS[char] || "";
      const yOffset = topPadding + index * (itemHeight + gap);
      glyphsMarkup += `
      <!-- Letter ${char} -->
      <g transform="translate(70, ${yOffset})">
        <g transform="scale(1)">
          ${rawPath}
        </g>
        <text x="50" y="88" fill="#a8a29e" font-family="'Courier New', monospace" font-size="11" text-anchor="middle" font-weight="bold">${char}</text>
      </g>`;
    });

    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 ${H}" width="240" height="${H}">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2d2116"/>
      <stop offset="100%" stop-color="#14100c"/>
    </radialGradient>
  </defs>
  
  <!-- Solid Dark Background -->
  <rect width="240" height="${H}" fill="#14100c"/>
  <rect x="5" y="5" width="230" height="${H - 10}" fill="url(#bg-grad)" stroke="#d4af37" stroke-width="1" opacity="0.3"/>
  
  <!-- Outer Double Golden Border (Cartouche loop) -->
  <rect x="40" y="30" width="160" height="${H - 75}" rx="80" fill="none" stroke="#d4af37" stroke-width="6"/>
  <rect x="46" y="36" width="148" height="${H - 87}" rx="74" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="none"/>
  
  <!-- Loop Top Detail -->
  <rect x="112" y="15" width="16" height="4" fill="#d4af37" rx="1"/>

  <!-- Cartouche Horizontal Royal Base Bar -->
  <rect x="45" y="${H - 52}" width="150" height="12" fill="#d4af37" rx="2"/>
  <rect x="65" y="${H - 36}" width="110" height="4" fill="#d4af37" rx="1"/>

  <!-- Hieroglyphics list -->
  ${glyphsMarkup}
  
  <!-- Royal Legend Watermark text -->
  <text x="120" y="${H - 12}" fill="#b08e23" font-family="'Georgia', serif" font-size="10" letter-spacing="2" text-anchor="middle" opacity="0.8">𓍹 ROYAL DECREE 𓍺</text>
</svg>`;
  };

  const downloadPNG = (nameString: string) => {
    const svgContent = generateCartoucheSVG(nameString);
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const chars = nameString.split('');
      const N = chars.length;
      const itemHeight = 70;
      const gap = 15;
      const topPadding = 90;
      const bottomPadding = 90;
      const H = topPadding + N * (itemHeight + gap) - gap + bottomPadding;

      const scale = 2;
      canvas.width = 240 * scale;
      canvas.height = H * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#14100c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        try {
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `kemet_cartouche_${nameString}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error("Failed to export as PNG, falling back to SVG", err);
          const svgLink = document.createElement('a');
          svgLink.href = url;
          svgLink.download = `kemet_cartouche_${nameString}.svg`;
          document.body.appendChild(svgLink);
          svgLink.click();
          document.body.removeChild(svgLink);
        }
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      console.error("Failed to load SVG image for PNG export");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleSave = (format: 'png' | 'svg') => {
    if (!cleanName) return;

    if (format === 'svg') {
      const svgContent = generateCartoucheSVG(cleanName);
      if (!svgContent) return;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kemet_cartouche_${cleanName}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      downloadPNG(cleanName);
    }

    const isDuplicate = savedCartouches.some(sc => sc.name === cleanName);
    if (!isDuplicate) {
      const newSavedItem: SavedCartouche = {
        id: `cart-${Date.now()}`,
        name: cleanName,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      };
      const updated = [newSavedItem, ...savedCartouches];
      setSavedCartouches(updated);
      localStorage.setItem('kemet_saved_cartouches', JSON.stringify(updated));
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const loadSavedCartouche = (savedName: string) => {
    setName(savedName);
  };

  const deleteSavedCartouche = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedCartouches.filter(sc => sc.id !== id);
    setSavedCartouches(updated);
    localStorage.setItem('kemet_saved_cartouches', JSON.stringify(updated));
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?cartouche=${encodeURIComponent(cleanName)}`;
    }
    return `https://kemet-tours.agency/?cartouche=${encodeURIComponent(cleanName)}`;
  };

  const copySacredLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareTwitter = () => {
    const text = `𓂀 I have inscribed my name into a sacred golden cartouche at Kemet Tours! Check out my pharaonic royal seal here:`;
    const url = getShareUrl();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = `𓂀 I have inscribed my name into a sacred golden cartouche at Kemet Tours! Check out my pharaonic royal seal here: ${getShareUrl()}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="bg-[#16120e] border border-[#d4af37]/35 rounded-2xl p-8 md:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] relative overflow-hidden" id="cartouche-creator">
      {/* Decorative Ancient Egyptian Hieroglyphic Border Ribbon around the component */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-[#1b1410] border-b border-[#d4af37]/20 flex items-center justify-around text-[10px] text-[#d4af37]/30 font-serif select-none pointer-events-none px-4">
        <span>𓋹</span><span>𓂀</span><span>𓆗</span><span>𓅃</span><span>𓏛</span><span>𓉐</span><span>𓆛</span><span>𓊹</span><span>𓎛</span><span>𓍼</span><span>𓅓</span><span>𓍢</span><span>𓉴</span><span>𓆣</span><span>𓆃</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#1b1410] border-t border-[#d4af37]/20 flex items-center justify-around text-[10px] text-[#d4af37]/30 font-serif select-none pointer-events-none px-4">
        <span>𓆃</span><span>𓆣</span><span>𓉴</span><span>𓍢</span><span>𓅓</span><span>𓍼</span><span>𓎛</span><span>𓊹</span><span>𓆛</span><span>𓉐</span><span>𓏛</span><span>𓅃</span><span>𓆗</span><span>𓂀</span><span>𓋹</span>
      </div>
      <div className="absolute left-0 top-5 bottom-5 w-5 bg-[#1b1410]/60 border-r border-[#d4af37]/20 flex flex-col items-center justify-around text-[10px] text-[#d4af37]/30 font-serif select-none pointer-events-none py-2">
        <span>𓋹</span><span>𓂀</span><span>𓆗</span><span>𓅃</span><span>𓏛</span><span>𓉐</span><span>𓆛</span><span>𓊹</span><span>𓎛</span>
      </div>
      <div className="absolute right-0 top-5 bottom-5 w-5 bg-[#1b1410]/60 border-l border-[#d4af37]/20 flex flex-col items-center justify-around text-[10px] text-[#d4af37]/30 font-serif select-none pointer-events-none py-2">
        <span>𓎛</span><span>𓊹</span><span>𓆛</span><span>𓉐</span><span>𓏛</span><span>𓅃</span><span>𓆗</span><span>𓂀</span><span>𓋹</span>
      </div>

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="text-center mb-8 mt-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-[#d4af37] w-5 h-5 animate-pulse" />
          <h3 className="font-serif text-2xl font-bold tracking-wider text-[#e6c280] uppercase">
            {language === 'de' ? 'Hieroglyphen-Namensübersetzer' : language === 'pl' ? 'Tłumacz egipskich imion' : language === 'cs' ? 'Překladač jmen do hieroglyfů' : 'Hieroglyphic Name Translator'}
          </h3>
          <Sparkles className="text-[#d4af37] w-5 h-5 animate-pulse" />
        </div>
        <p className="text-stone-400 text-sm max-w-lg mx-auto">
          {language === 'de'
            ? 'Übersetzen Sie Ihren Namen in altägyptische Hieroglyphen. Im alten Ägypten wurden königliche Namen zum Schutz in einer ovalen goldenen Schleife – Kartusche genannt – geschrieben. Tragen Sie Ihren Namen ein:'
            : language === 'pl'
            ? 'Przetłumacz swoje imię na starożytne egipskie hieroglify. W starożytnym Egipcie imiona królewskie zapisywano wewnątrz owalnej złotej pętli zwanej kartuszem dla ochrony. Wpisz swoje imię poniżej:'
            : language === 'cs'
            ? 'Přeložte své jméno do starověkých egyptských hieroglyfů. Ve starověkém Egyptě se královská jména pro ochranu zapisovala do oválné zlaté smyčky zvané kartuše. Zadejte své jméno níže:'
            : 'Translate your name into ancient Egyptian hieroglyphs. In ancient Egypt, royal names were written inside an oval golden loop called a cartouche for protection. Enter your name below to see it:'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4">
        {/* Input & Info Side */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-1.5">
              {language === 'de' ? 'Namen eingeben (Max. 8 Buchstaben)' : language === 'pl' ? 'Wpisz imię (Maks. 8 liter)' : language === 'cs' ? 'Zadejte jméno (max. 8 písmen)' : 'Enter Name (Max 8 letters)'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'de' ? 'Z.B. RAMSES' : language === 'pl' ? 'Np. RAMZES' : language === 'cs' ? 'Např. RAMSES' : 'E.g., RAMSES'}
                maxLength={8}
                className="w-full bg-[#201a14] border border-[#d4af37]/40 rounded-lg py-2.5 px-4 text-[#f3e5c8] font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
                id="cartouche-name-input"
              />
              {name && (
                <button
                  onClick={() => setName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#d4af37] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Legend Details */}
          <div className="bg-[#1f1913] border border-[#d4af37]/15 rounded-xl p-4 min-h-[140px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeSymbol ? (
                <motion.div
                  key={activeSymbol.symbolName}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 text-center lg:text-left"
                >
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <Info className="w-4 h-4 text-[#d4af37]" />
                    <span className="font-serif text-[#e6c280] font-semibold text-base">
                      {activeSymbol.symbolName}
                    </span>
                  </div>
                  <p className="text-stone-300 text-sm">
                     <strong className="text-stone-500">{language === 'de' ? 'Bedeutung:' : language === 'pl' ? 'Znaczenie:' : language === 'cs' ? 'Význam:' : 'Meaning:'}</strong> {activeSymbol.meaning}
                  </p>
                  <p className="text-[#d4af37]/80 text-xs font-mono uppercase tracking-wider">
                    {language === 'de' ? 'Phonetischer Laut:' : language === 'pl' ? 'Dźwięk fonetyczny:' : language === 'cs' ? 'Fonetický zvuk:' : 'Phonetic sound:'} "{activeSymbol.pronunciation}"
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-stone-500 text-sm italic"
                >
                  {language === 'de'
                    ? 'Fahren Sie mit der Maus über ein Hieroglyphenzeichen oder tippen Sie darauf, um dessen Bedeutung und Aussprache zu erfahren.'
                    : language === 'pl'
                    ? 'Najedź kursorem lub dotknij dowolnego hieroglifu wewnątrz kartusza, aby poznać jego znaczenie i dźwięk fonetyczny.'
                    : language === 'cs'
                    ? 'Najetím myší nebo klepnutím na jakýkoli hieroglyf uvnitř kartuše se dozvíte jeho význam a fonetický zvuk.'
                    : 'Hover or tap on any hieroglyph inside your cartouche to learn its meaning and phonetic sound.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Split Download Buttons Grid */}
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSave('png')}
                disabled={!cleanName}
                className={`flex items-center justify-center gap-1.5 bg-gradient-to-r ${
                  isSaved
                    ? 'from-emerald-500/20 to-teal-600/20 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'from-[#d4af37]/25 to-[#9a7b1c]/25 hover:from-[#d4af37]/40 hover:to-[#9a7b1c]/40 border-[#d4af37]/60 text-[#f3e5c8]'
                } border rounded-xl py-2.5 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="font-mono uppercase text-[10px] tracking-wider">{language === 'de' ? 'PNG Speichern' : language === 'pl' ? 'Zapisz PNG' : language === 'cs' ? 'Uložit PNG' : 'Save PNG Image'}</span>
              </button>

              <button
                onClick={() => handleSave('svg')}
                disabled={!cleanName}
                className="flex items-center justify-center gap-1.5 bg-[#120e0a] hover:bg-[#1a1410] border border-[#d4af37]/35 text-stone-300 rounded-xl py-2.5 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 text-[#e6c280]/75" />
                <span className="font-mono uppercase text-[10px] tracking-wider">{language === 'de' ? 'SVG Speichern' : language === 'pl' ? 'Zapisz SVG' : language === 'cs' ? 'Uložit SVG' : 'Save SVG File'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsShareOpen(true)}
              disabled={!cleanName}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#e6c280]/15 via-[#d4af37]/15 to-[#e6c280]/15 hover:from-[#e6c280]/30 hover:via-[#d4af37]/30 hover:to-[#e6c280]/30 border border-[#d4af37]/45 hover:border-[#d4af37] text-[#f3e5c8] rounded-xl py-2.5 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-mono uppercase text-[10px] tracking-wider">{language === 'de' ? 'Als Papyrus teilen' : language === 'pl' ? 'Udostępnij jako papirus' : language === 'cs' ? 'Sdílet jako papyrus' : 'Share as Papyrus Scroll'}</span>
            </button>

            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-[10px] text-emerald-400 font-mono uppercase tracking-widest bg-emerald-500/10 py-1 rounded border border-emerald-500/25"
              >
                𓍼 Royal Decree Saved successfully! 𓍼
              </motion.div>
            )}
          </div>
        </div>

        {/* Visual Cartouche Side */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center py-8 px-6 bg-[#1a130f] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#322318]/50 via-[#16100c] to-[#0e0a08] border border-[#d4af37]/25 rounded-3xl relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden min-h-[480px]">
          {/* Ancient Egypt themed backgrounds & App Name overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(#d4af37_0.6px,transparent_0.6px)] [background-size:12px_12px] opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#d4af37]/30 via-transparent to-[#d4af37]/30" />
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-[#d4af37]/30 via-transparent to-[#d4af37]/30" />
          
          <div className="absolute top-4 left-4 text-stone-850/25 text-3xl select-none pointer-events-none font-serif flex flex-col gap-2">
            <span>𓋹</span>
            <span>𓂀</span>
            <span>𓆗</span>
          </div>

          {/* Gold-foil Pharaoh's Official Seal Badge next to cartouche container */}
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-gradient-to-br from-[#ffe89e] via-[#d4af37] to-[#8c6507] border-2 border-amber-200 text-stone-950 font-serif text-[9px] font-black py-2 px-3 rounded-full shadow-[0_6px_15px_rgba(212,175,55,0.4)] select-none z-20 flex items-center gap-1.5 uppercase tracking-widest border-double cursor-help hover:scale-110 hover:rotate-3 transition-all duration-300"
            title="Authentic Royal Seal of the Scribes"
          >
            <span className="text-sm">𓂀</span>
            <span className="font-mono text-[8px] tracking-normal font-bold">
              {language === 'de' ? 'Siegel des Pharaos' : language === 'pl' ? 'Pieczęć Faraona' : language === 'cs' ? 'Pečeť faraona' : "Pharaoh's Seal"}
            </span>
          </motion.div>
 
          <div className="text-center mb-6 space-y-1 z-10 select-none">
            <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-[0.25em] block animate-pulse">
              {language === 'de' ? '𓂀 Heiliges Königssiegel 𓂀' : language === 'pl' ? '𓂀 Święta Pieczęć Królewska 𓂀' : language === 'cs' ? '𓂀 Posvátná královská pečeť 𓂀' : '𓂀 Sacred Royal Seal 𓂀'}
            </span>
            <h4 className="font-serif text-lg font-black text-[#e6c280] tracking-widest uppercase">
              Kemet Tours
            </h4>
            <p className="text-[8px] font-mono text-stone-500 uppercase tracking-widest">
              Powered by Mas international Agency
            </p>
          </div>

          <div className="relative z-10">
            {/* Golden Oval Royal Frame with subtle magic glowing triggers */}
            <div className={`border-[6px] border-[#d4af37] bg-[#221a12] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2d2116] to-[#14100c] rounded-full px-8 py-10 min-w-[160px] max-w-[280px] flex flex-col items-center gap-4 relative border-double transition-all duration-1000 ${
              isGlowing 
                ? 'shadow-[0_0_60px_rgba(212,175,55,0.65)] border-[#ffd54f]' 
                : 'shadow-[0_0_40px_rgba(212,175,55,0.15)]'
            }`}>
              {/* Cartouche Horizontal Royal Base Bar */}
              <div className="absolute bottom-0 h-4 w-4/5 bg-gradient-to-r from-[#ffe89e] via-[#d4af37] to-[#8c6507] border-t-2 border-amber-200 rounded-full select-none pointer-events-none"></div>

              {/* Render Glyph list */}
              {cleanName.length > 0 ? (
                <div className="flex flex-col items-center gap-3.5 py-4 w-full">
                  {cleanName.split('').map((char, index) => {
                    const data = HIEROGLYPHS_MAP[char];
                    if (!data) return null;
 
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          filter: isGlowing ? "drop-shadow(0 0 10px rgba(212,175,55,0.85)) brightness(1.2)" : "drop-shadow(0 0 0px rgba(0,0,0,0))"
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 15,
                          delay: index * 0.12 
                        }}
                        className="group relative cursor-pointer p-1.5 rounded-lg hover:bg-[#d4af37]/10 transition-colors flex flex-col items-center w-full max-w-[80px]"
                        onMouseEnter={() => setActiveSymbol(data)}
                        onMouseLeave={() => setActiveSymbol(null)}
                        whileHover={{ scale: 1.15 }}
                      >
                        {/* Glow Background */}
                        <div className="absolute inset-0 bg-[#d4af37]/0 group-hover:bg-[#d4af37]/5 rounded-lg blur-md transition-all"></div>
                        
                        {/* Symbol Render */}
                        {data.renderSymbol("#d4af37")}
 
                        <span className="text-[10px] font-mono text-stone-500 tracking-wider group-hover:text-[#e6c280] transition-colors mt-0.5">
                          {char}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-stone-600 font-mono text-xs uppercase tracking-widest">
                  {language === 'de' ? 'Namen eingeben' : language === 'pl' ? 'Wpisz imię' : language === 'cs' ? 'Zadejte jméno' : 'Enter a name'}
                </div>
              )}
            </div>
            
            {/* Cartouche Side Ribbons for extra elegance */}
            <div className="hidden sm:block absolute -left-12 top-1/2 -translate-y-1/2 text-stone-600/30 text-6xl font-serif select-none pointer-events-none">
              𓋹
            </div>
            <div className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2 text-stone-600/30 text-6xl font-serif select-none pointer-events-none">
              𓅃
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Archive Gallery (Saved Cartouches) */}
      {savedCartouches.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#d4af37]/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-[#d4af37]">𓍼</span>
            <h4 className="font-serif text-sm uppercase tracking-wider text-[#e6c280]">
              {language === 'de' ? 'Königliches Archiv eingetragener Siegel' : language === 'pl' ? 'Królewskie Archiwum Zapisanych Pieczęci' : language === 'cs' ? 'Královský archiv zapsaných pečetí' : 'Royal Archives of Inscribed Seals'} ({savedCartouches.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {savedCartouches.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => loadSavedCartouche(item.name)}
                whileHover={{ scale: 1.02 }}
                className="bg-[#201a14]/60 border border-stone-800 hover:border-[#d4af37]/40 px-3 py-2.5 rounded-lg cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#d4af37]/5 rounded-full pointer-events-none transition-all group-hover:bg-[#d4af37]/15"></div>
                <div className="text-stone-300 font-mono text-xs font-bold tracking-wider truncate mb-1">
                  𓍹 {item.name} 𓍺
                </div>
                <div className="flex items-center justify-between mt-1 text-[9px] text-stone-500 font-mono">
                  <span>{item.date}</span>
                  <button
                    onClick={(e) => deleteSavedCartouche(e, item.id)}
                    className="text-stone-600 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                    title={language === 'de' ? 'Siegel auflösen' : language === 'pl' ? 'Rozpuść pieczęć' : language === 'cs' ? 'Rozpustit pečeť' : 'Dissolve seal'}
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Share as Papyrus Modal Overlay */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#f2e6cf] border-8 border-double border-[#b38b3f] rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(212,175,55,0.45)] text-center relative overflow-hidden text-[#4a2e16] bg-[radial-gradient(#d4af37_0.4px,transparent_0.4px)] [background-size:12px_12px]"
            >
              {/* Top Wooden Rod Roll Simulation (Ancient Scroll vibe) */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#8a5d2e] via-[#c69a5a] to-[#8a5d2e] border-b border-[#5a3b1c] flex items-center justify-between px-4">
                <div className="w-3 h-3 rounded-full bg-[#5a3b1c]"></div>
                <div className="w-3 h-3 rounded-full bg-[#5a3b1c]"></div>
              </div>

              {/* Egyptian Ornamentations */}
              <div className="text-xl text-[#b38b3f] font-serif select-none pointer-events-none tracking-widest mt-4 mb-2">
                {language === 'de' ? '𓋹 𓂀 𓆗 HEILIGES KÖNIGLICHES DEKRET 𓆗 𓂀 𓋹' : language === 'pl' ? '𓋹 𓂀 𓆗 ŚWIĘTY DEKRET KRÓLEWSKI 𓆗 𓂀 𓋹' : language === 'cs' ? '𓋹 𓂀 𓆗 POSVÁTNÝ KRÁLOVSKÝ DEKRET 𓆗 𓂀 𓋹' : '𓋹 𓂀 𓆗 SACRED ROYAL DECREE 𓆗 𓂀 𓋹'}
              </div>

              <div className="border border-[#b38b3f]/35 p-4 rounded-xl bg-[#faf3e3]/75 space-y-4 my-4 shadow-inner relative">
                {/* Vintage stamp */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full border-2 border-red-800/25 flex items-center justify-center text-red-800/35 font-serif text-[10px] uppercase font-black tracking-tighter rotate-12 select-none pointer-events-none">
                  {language === 'de' ? 'Schreiber OK' : language === 'pl' ? 'Zatwierdzone przez Pisarza' : language === 'cs' ? 'Schváleno písařem' : 'Scribe OK'}
                </div>

                <p className="font-serif text-[#5c3c21] leading-relaxed text-sm">
                  {language === 'de' ? (
                    <>
                      Es sei in allen Ecken des Königreichs kundgetan, dass der Reisende{' '}
                      <strong className="text-[#8c6020] uppercase font-mono tracking-wider font-bold">
                        {cleanName}
                      </strong>{' '}
                      in die Ewige Kartusche von <strong>Kemet Tours</strong> eingetragen wurde.
                    </>
                  ) : language === 'pl' ? (
                    <>
                      Niech będzie wiadome we wszystkich zakątkach Królestwa, że podróżnik{' '}
                      <strong className="text-[#8c6020] uppercase font-mono tracking-wider font-bold">
                        {cleanName}
                      </strong>{' '}
                      został wpisany do Wiecznej Kartuszy <strong>Kemet Tours</strong>.
                    </>
                  ) : language === 'cs' ? (
                    <>
                      Nechť je známo ve všech koutech království, že cestovatel{' '}
                      <strong className="text-[#8c6020] uppercase font-mono tracking-wider font-bold">
                        {cleanName}
                      </strong>{' '}
                      byl zapsán do Věčné kartuše <strong>Kemet Tours</strong>.
                    </>
                  ) : (
                    <>
                      Let it be known to all corners of the Kingdom that the traveler{' '}
                      <strong className="text-[#8c6020] uppercase font-mono tracking-wider font-bold">
                        {cleanName}
                      </strong>{' '}
                      has been inscribed upon the Eternal Cartouche of <strong>Kemet Tours</strong>.
                    </>
                  )}
                </p>

                <p className="text-[11px] text-stone-600 font-mono italic">
                  {language === 'de'
                    ? '"Geschrieben unter der himmlischen Gunst von Osiris, Ra und Isis, wobei die Buchstaben des Westens mit den Hieroglyphen des Ostens übereinstimmen."'
                    : language === 'pl'
                    ? '"Napisane pod niebiańską przychylnością Ozyrysa, Re i Izydy, dopasowując litery Zachodu do hieroglifów Wschodu."'
                    : language === 'cs'
                    ? '"Napsáno pod nebeskou přízní Osirida, Rea a Isidy, spojující písmena Západu s hieroglyfy Východu."'
                    : '"Written under the celestial favor of Osiris, Ra, and Isis, matching the letters of the West with the hieroglyphs of the East."'}
                </p>

                <div className="flex items-center justify-center gap-1 text-[10px] text-[#b38b3f]/90 font-mono tracking-widest uppercase">
                  <span>{language === 'de' ? '𓂀 Status: Ewiges Siegel Registriert 𓂀' : language === 'pl' ? '𓂀 Status: Wieczna Pieczęć Zarejestrowana 𓂀' : language === 'cs' ? '𓂀 Stav: Věčná pečeť zaregistrována 𓂀' : '𓂀 Status: Eternal Seal Registered 𓂀'}</span>
                </div>
              </div>

              {/* Sharing link input field */}
              <div className="space-y-2 text-left mb-6">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#634832] font-semibold">
                  {language === 'de' ? 'Heiliger Direktlink zu Ihrer Kartusche' : language === 'pl' ? 'Święty bezpośredni link do Twojego kartusza' : language === 'cs' ? 'Posvátný přímý odkaz na vaši kartuši' : 'Sacred Direct Link to your Cartouche'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 bg-[#fffbf2] border border-[#b38b3f]/40 text-[#4a2e16] rounded-xl px-3 py-2 text-xs font-mono select-all focus:outline-none focus:border-[#b38b3f] shadow-inner"
                  />
                  <button
                    onClick={copySacredLink}
                    className="bg-[#b38b3f] hover:bg-[#8e6b2c] text-[#fbf5e6] px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'de' ? 'Kopiert!' : language === 'pl' ? 'Skopiowano!' : language === 'cs' ? 'Zkopírováno!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'de' ? 'Kopieren' : language === 'pl' ? 'Skopiuj' : language === 'cs' ? 'Zkopírovat' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Buttons Grid */}
              <div className="space-y-3 mb-6">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#634832] font-bold">
                  {language === 'de' ? 'Dem modernen Reich verkünden' : language === 'pl' ? 'Obwieść współczesnemu królestwu' : language === 'cs' ? 'Oznámit moderní říši' : 'Proclaim to the Modern Realm'}
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={shareTwitter}
                    className="bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/30 text-[#1a7bb8] rounded-xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="font-mono text-[10px] font-bold uppercase">Twitter / X</span>
                  </button>
                  <button
                    onClick={shareWhatsApp}
                    className="bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 text-[#1b9a45] rounded-xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="font-mono text-[10px] font-bold uppercase">WhatsApp</span>
                  </button>
                  <button
                    onClick={shareFacebook}
                    className="bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/30 text-[#145dbf] rounded-xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="font-mono text-[10px] font-bold uppercase">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsShareOpen(false)}
                className="w-full bg-[#4a2e16] hover:bg-[#341f0e] text-[#faf3e3] font-serif font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {language === 'de' ? '𓏛 Ritus des Übergangs abschließen 𓏛' : language === 'pl' ? '𓏛 Ukończ rytuał przejścia 𓏛' : language === 'cs' ? '𓏛 Dokončit rituál průchodu 𓏛' : '𓏛 Complete Rite of Passage 𓏛'}
              </button>

              {/* Bottom Wooden Rod Roll Simulation */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#8a5d2e] via-[#c69a5a] to-[#8a5d2e] border-t border-[#5a3b1c] flex items-center justify-between px-4">
                <div className="w-3 h-3 rounded-full bg-[#5a3b1c]"></div>
                <div className="w-3 h-3 rounded-full bg-[#5a3b1c]"></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
