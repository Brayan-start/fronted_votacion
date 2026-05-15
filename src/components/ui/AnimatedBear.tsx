import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBearProps {
  isHiding: boolean;
  lookAt: number; // 0 to 100 representing the position of the eyes
}

const AnimatedBear: React.FC<AnimatedBearProps> = ({ isHiding, lookAt }) => {
  // Map lookAt (0-100) to eye movement range (-4 to 4 pixels)
  const eyeX = (lookAt / 100) * 8 - 4;

  return (
    <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-2xl">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Ears */}
        <circle cx="50" cy="50" r="25" fill="#4B3621" />
        <circle cx="150" cy="50" r="25" fill="#4B3621" />
        <circle cx="50" cy="50" r="15" fill="#362419" />
        <circle cx="150" cy="50" r="15" fill="#362419" />

        {/* Head */}
        <circle cx="100" cy="110" r="80" fill="#5D4037" />

        {/* Muzzle */}
        <ellipse cx="100" cy="145" rx="35" ry="25" fill="#D7CCC8" />
        
        {/* Nose */}
        <path
          d="M90 135C90 132 93 130 100 130C107 130 110 132 110 135C110 140 105 143 100 143C95 143 90 140 90 135Z"
          fill="#212121"
        />

        {/* Eyes Group */}
        <g>
          {/* Left Eye */}
          <circle cx="65" cy="100" r="12" fill="white" />
          <motion.circle
            cx="65"
            cy="100"
            r="6"
            fill="#212121"
            animate={{ x: eyeX }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
          />

          {/* Right Eye */}
          <circle cx="135" cy="100" r="12" fill="white" />
          <motion.circle
            cx="135"
            cy="100"
            r="6"
            fill="#212121"
            animate={{ x: eyeX }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
          />
        </g>

        {/* Arms / Paws */}
        {/* Left Paw */}
        <motion.ellipse
          cx="40"
          cy="180"
          rx="25"
          ry="20"
          fill="#4B3621"
          animate={{
            y: isHiding ? -80 : 0,
            x: isHiding ? 25 : 0,
            rotate: isHiding ? 45 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />

        {/* Right Paw */}
        <motion.ellipse
          cx="160"
          cy="180"
          rx="25"
          ry="20"
          fill="#4B3621"
          animate={{
            y: isHiding ? -80 : 0,
            x: isHiding ? -25 : 0,
            rotate: isHiding ? -45 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </svg>
      
      {/* Decorative Blush */}
      <div className="absolute top-[115px] left-[55px] w-4 h-2 bg-red-400/20 rounded-full blur-[2px]"></div>
      <div className="absolute top-[115px] right-[55px] w-4 h-2 bg-red-400/20 rounded-full blur-[2px]"></div>
    </div>
  );
};

export default AnimatedBear;
