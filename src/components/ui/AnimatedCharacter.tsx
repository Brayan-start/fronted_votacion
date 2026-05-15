import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCharacterProps {
  isHiding: boolean;
  mousePos: { x: number; y: number };
  isSuccess: boolean;
  isError: boolean;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ isHiding, mousePos, isSuccess, isError }) => {
  // Movement range for eyes
  // We calculate the delta from the center of the character (0.5, 0.5)
  const eyeX = (mousePos.x - 0.5) * 15;
  const eyeY = (mousePos.y - 0.5) * 10;

  const colors = {
    primary: '#4F46E5', // Indigo
    secondary: '#818CF8', // Light Indigo
    accent: '#F472B6', // Pink blush
    eyes: '#1E293B',
    white: '#FFFFFF'
  };

  return (
    <div className="relative w-64 h-56 mx-auto mb-[-30px] z-10 select-none pointer-events-none">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Decorative Ears/Horns */}
        <motion.path
          d="M60 50C60 50 45 30 35 45C25 60 40 70 40 70"
          stroke={colors.primary}
          strokeWidth="12"
          strokeLinecap="round"
          animate={isError ? { rotate: [-5, 5, -5] } : { rotate: 0 }}
        />
        <motion.path
          d="M140 50C140 50 155 30 165 45C175 60 160 70 160 70"
          stroke={colors.primary}
          strokeWidth="12"
          strokeLinecap="round"
          animate={isError ? { rotate: [5, -5, 5] } : { rotate: 0 }}
        />

        {/* Main Body/Face */}
        <motion.rect
          x="40"
          y="50"
          width="120"
          height="130"
          rx="50"
          fill={colors.primary}
          animate={
            isSuccess ? { scale: [1, 1.05, 1], y: [0, -10, 0] } : 
            isError ? { x: [0, -5, 5, -5, 5, 0] } : 
            { y: [0, -4, 0] }
          }
          transition={{
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            default: { type: "spring", stiffness: 300 }
          }}
        />

        {/* Inner Face Area */}
        <rect x="55" y="65" width="90" height="80" rx="35" fill={colors.secondary} opacity="0.3" />

        {/* Eyes Section */}
        <g>
          {/* Blush */}
          <motion.circle 
            cx="65" cy="115" r="8" fill={colors.accent} opacity="0.4" 
            animate={{ opacity: isSuccess ? 0.8 : 0.4, scale: isSuccess ? 1.2 : 1 }}
          />
          <motion.circle 
            cx="135" cy="115" r="8" fill={colors.accent} opacity="0.4" 
            animate={{ opacity: isSuccess ? 0.8 : 0.4, scale: isSuccess ? 1.2 : 1 }}
          />

          {/* Left Eye */}
          <circle cx="75" cy="100" r="14" fill={colors.white} />
          <motion.circle
            cx="75"
            cy="100"
            r="7"
            fill={colors.eyes}
            animate={{ 
              x: isHiding ? 0 : eyeX, 
              y: isHiding ? -5 : eyeY,
              scaleY: isHiding ? 0.1 : 1 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          {/* Right Eye */}
          <circle cx="125" cy="100" r="14" fill={colors.white} />
          <motion.circle
            cx="125"
            cy="100"
            r="7"
            fill={colors.eyes}
            animate={{ 
              x: isHiding ? 0 : eyeX, 
              y: isHiding ? -5 : eyeY,
              scaleY: isHiding ? 0.1 : 1 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </g>

        {/* Mouth */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.path
              key="success-mouth"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              d="M85 135C85 135 100 145 115 135"
              stroke={colors.white}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : isError ? (
            <motion.path
              key="error-mouth"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              d="M90 140C90 140 100 135 110 140"
              stroke={colors.white}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <motion.circle
              key="neutral-mouth"
              cx="100"
              cy="135"
              r="3"
              fill={colors.white}
              animate={{ scaleX: isHiding ? 2 : 1 }}
            />
          )}
        </AnimatePresence>

        {/* Hands / Arms */}
        {/* Left Hand */}
        <motion.path
          d="M30 160C30 160 40 170 55 165"
          stroke={colors.primary}
          strokeWidth="15"
          strokeLinecap="round"
          animate={isHiding ? { 
            d: "M60 140C60 140 65 110 75 95",
          } : { 
            d: "M30 160C30 160 40 170 55 165",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        />

        {/* Right Hand */}
        <motion.path
          d="M170 160C170 160 160 170 145 165"
          stroke={colors.primary}
          strokeWidth="15"
          strokeLinecap="round"
          animate={isHiding ? { 
            d: "M140 140C140 140 135 110 125 95",
          } : { 
            d: "M170 160C170 160 160 170 145 165",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        />
      </svg>

      {/* Confetti-like effect for success */}
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: i % 2 === 0 ? colors.accent : colors.secondary,
                left: '50%',
                top: '50%'
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * -200],
                scale: [1, 0],
                opacity: [1, 0]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedCharacter;
