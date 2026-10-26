import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: string;
  x: number; // Starting X percentage (near center)
  y: number; // Starting Y percentage (near center)
  angle: number; // Angle of trajectory
  distance: number; // Distance of trajectory
  rotate: number; // Final spin rotation
  scale: number; // Particle size scale
  delay: number; // Animation stagger delay
  symbol: string; // The character or rune (scarab or gold dust)
  color: string; // Tailored gold color tone
}

interface ScarabCelebrationProps {
  triggerCount: number;
}

export default function ScarabCelebration({ triggerCount }: ScarabCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (triggerCount === 0) return;

    // Golden & Royal color palette
    const goldColors = [
      'text-[#d4af37]', // Imperial Gold
      'text-[#f3e5c8]', // Alabaster White
      'text-[#ffdf7a]', // Radiant Gold
      'text-[#e6c280]', // Warm Ochre
      'text-[#9a7b1c]'  // Bronze Gold
    ];

    // Sacred Egyptian and celebratory symbols
    const symbols = [
      '𓆣', // Golden Scarab (Main symbol)
      '𓆣', // Duplicate for higher probability
      '𓋹', // Ankh (Key of Life)
      '𓂀', // Eye of Horus (Protection)
      '✨', // Sparkle
      '🌟', // Star
      '⭐', // Mini star
    ];

    // Generate a burst of 35 particles
    const newParticles: Particle[] = Array.from({ length: 35 }).map((_, index) => {
      const id = `${Date.now()}-${index}-${Math.random()}`;
      const angle = Math.random() * Math.PI * 2; // Random 360 degree direction
      const distance = 100 + Math.random() * 250; // Random distance to fly outward (px)
      const rotate = (Math.random() - 0.5) * 720; // Massive spin
      const scale = 0.5 + Math.random() * 1.5; // Random size
      const delay = Math.random() * 0.15; // Small stagger delay
      
      // High chance of being a scarab
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];

      return {
        id,
        x: 50 + (Math.random() - 0.5) * 6, // Concentrated around center X
        y: 45 + (Math.random() - 0.5) * 6, // Concentrated around center Y
        angle,
        distance,
        rotate,
        scale,
        delay,
        symbol,
        color
      };
    });

    // Append new particles to state
    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after animation finishes (3 seconds)
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 3000);

    return () => clearTimeout(timer);
  }, [triggerCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          // Calculate X and Y translation offsets from angle & distance
          const tx = Math.cos(p.angle) * p.distance;
          const ty = Math.sin(p.angle) * p.distance - 60; // Extra drift upwards

          return (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                x: `calc(${p.x}vw + ${tx}px)`,
                y: `calc(${p.y}vh + ${ty}px)`,
                scale: p.scale,
                opacity: [0, 1, 1, 0], // Quick fade-in, show, then fade out
                rotate: p.rotate,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 2.2,
                delay: p.delay,
                ease: [0.1, 0.8, 0.3, 1], // Custom overshoot bezier
              }}
              className={`absolute select-none font-serif text-3xl font-black filter drop-shadow-[0_0_12px_rgba(212,175,55,0.7)] ${p.color}`}
            >
              {p.symbol}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
