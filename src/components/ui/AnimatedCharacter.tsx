import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedCharacterProps {
  isHiding?: boolean;
  isCovering?: boolean;
  mousePos: { x: number; y: number };
  isSuccess?: boolean;
  isError?: boolean;
}

const confetti = [
  { x: -102, y: -120, rotate: -34, color: '#ff7aa8' },
  { x: -64, y: -152, rotate: 22, color: '#ffc857' },
  { x: -28, y: -132, rotate: -12, color: '#7dd3fc' },
  { x: 28, y: -156, rotate: 38, color: '#8b5cf6' },
  { x: 72, y: -124, rotate: -26, color: '#34d399' },
  { x: 112, y: -148, rotate: 18, color: '#fb7185' },
  { x: -128, y: -72, rotate: 12, color: '#60a5fa' },
  { x: 126, y: -74, rotate: -42, color: '#fbbf24' },
];

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  isHiding = false,
  isCovering = false,
  mousePos,
  isSuccess = false,
  isError = false,
}) => {
  const eyeX = Math.max(-7, Math.min(7, (mousePos.x - 0.5) * 18));
  const eyeY = Math.max(-5, Math.min(5, (mousePos.y - 0.42) * 14));

  return (
    <motion.div
      className="relative mx-auto h-[280px] w-[340px] select-none pointer-events-none"
      animate={
        isError
          ? { x: [0, -8, 8, -6, 6, 0] }
          : isSuccess
            ? { y: [0, -8, 0] }
            : { y: [0, -5, 0] }
      }
      transition={
        isError
          ? { duration: 0.42 }
          : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <svg viewBox="0 0 340 280" className="h-full w-full drop-shadow-[0_28px_35px_rgba(52,64,130,0.18)]">
        <defs>
          <linearGradient id="paperBody2" x1="68" y1="38" x2="265" y2="228" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6b7cff" />
            <stop offset="1" stopColor="#7462e8" />
          </linearGradient>
          <linearGradient id="belly2" x1="104" y1="89" x2="236" y2="211" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff6df" />
            <stop offset="1" stopColor="#ffe1b5" />
          </linearGradient>
          <clipPath id="faceClip">
            <path d="M80 141C80 99 112 75 170 75C228 75 260 99 260 141C260 185 228 210 170 210C112 210 80 185 80 141Z" />
          </clipPath>
        </defs>

        <motion.ellipse
          cx="170"
          cy="248"
          rx="92"
          ry="15"
          fill="#dfe5ff"
          animate={{ scaleX: isHiding || isCovering ? 0.88 : 1 }}
        />

        <motion.path
          d="M84 92C65 60 74 37 102 49C115 55 121 69 121 69"
          fill="#ffcf5b"
          stroke="#343160"
          strokeWidth="7"
          strokeLinejoin="round"
          animate={isError ? { rotate: [-4, 6, -3] } : { rotate: 0 }}
          style={{ transformOrigin: '115px 85px' }}
        />
        <motion.path
          d="M256 92C275 60 266 37 238 49C225 55 219 69 219 69"
          fill="#ffcf5b"
          stroke="#343160"
          strokeWidth="7"
          strokeLinejoin="round"
          animate={isError ? { rotate: [4, -6, 3] } : { rotate: 0 }}
          style={{ transformOrigin: '225px 85px' }}
        />

        <motion.path
          d="M75 141C75 89 109 63 170 63C231 63 265 89 265 141C265 195 231 228 170 228C109 228 75 195 75 141Z"
          fill="url(#paperBody2)"
          stroke="#343160"
          strokeWidth="7"
          animate={
            isSuccess
              ? { scale: [1, 1.04, 1], y: [0, -9, 0] }
              : isCovering
                ? { scale: [1, 1.02, 1] }
                : undefined
          }
          style={{ transformOrigin: '170px 148px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        <path
          d="M99 146C99 109 122 90 170 90C218 90 241 109 241 146C241 185 217 210 170 210C123 210 99 185 99 146Z"
          fill="url(#belly2)"
          stroke="#343160"
          strokeWidth="5"
        />

        <motion.g
          animate={{
            opacity: isHiding ? 0.18 : isCovering ? 0.08 : 1,
            scale: isCovering ? 0.7 : 1,
          }}
        >
          <circle cx="131" cy="142" r="19" fill="#ffffff" stroke="#343160" strokeWidth="5" />
          <circle cx="209" cy="142" r="19" fill="#ffffff" stroke="#343160" strokeWidth="5" />
          <motion.circle
            cx="131"
            cy="142"
            r="8"
            fill="#343160"
            animate={{
              x: isSuccess ? 0 : eyeX,
              y: isSuccess ? -1 : eyeY,
              scaleY: isSuccess ? 0.45 : isCovering ? 0.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 230, damping: 18 }}
          />
          <motion.circle
            cx="209"
            cy="142"
            r="8"
            fill="#343160"
            animate={{
              x: isSuccess ? 0 : eyeX,
              y: isSuccess ? -1 : eyeY,
              scaleY: isSuccess ? 0.45 : isCovering ? 0.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 230, damping: 18 }}
          />
        </motion.g>

        <circle cx="115" cy="168" r="10" fill="#ff8fb2" opacity="0.55" />
        <circle cx="225" cy="168" r="10" fill="#ff8fb2" opacity="0.55" />

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.path
              key="happy"
              d="M140 174C152 191 188 191 200 174"
              stroke="#343160"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformOrigin: '170px 185px' }}
            />
          ) : isError ? (
            <motion.path
              key="sad"
              d="M148 188C158 176 182 176 192 188"
              stroke="#343160"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.path
              key="soft"
              d="M152 180C160 186 180 186 188 180"
              stroke="#343160"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <motion.path
          d="M86 181C59 181 47 197 47 214"
          stroke="#6b7cff"
          strokeWidth="20"
          strokeLinecap="round"
          animate={
            isHiding
              ? { d: 'M82 190C91 157 104 142 126 139' }
              : isCovering
                ? { d: 'M70 170C55 152 48 130 50 110' }
                : isSuccess
                  ? { d: 'M88 178C58 151 44 123 53 102' }
                  : { d: 'M86 181C59 181 47 197 47 214' }
          }
          transition={{ type: 'spring', stiffness: 160, damping: 17 }}
        />
        <motion.circle
          cx="47"
          cy="214"
          r="18"
          fill="#ffe4c5"
          stroke="#343160"
          strokeWidth="6"
          animate={
            isHiding
              ? { cx: 122, cy: 139, scale: 0.96 }
              : isCovering
                ? { cx: 50, cy: 110, scale: 1.05 }
                : isSuccess
                  ? { cx: 53, cy: 102, scale: 1 }
                  : { cx: 47, cy: 214, scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 160, damping: 17 }}
        />

        <motion.path
          d="M254 181C281 181 293 197 293 214"
          stroke="#6b7cff"
          strokeWidth="20"
          strokeLinecap="round"
          animate={
            isHiding
              ? { d: 'M258 190C249 157 236 142 214 139' }
              : isCovering
                ? { d: 'M270 170C285 152 292 130 290 110' }
                : isSuccess
                  ? { d: 'M252 178C282 151 296 123 287 102' }
                  : { d: 'M254 181C281 181 293 197 293 214' }
          }
          transition={{ type: 'spring', stiffness: 160, damping: 17 }}
        />
        <motion.circle
          cx="293"
          cy="214"
          r="18"
          fill="#ffe4c5"
          stroke="#343160"
          strokeWidth="6"
          animate={
            isHiding
              ? { cx: 218, cy: 139, scale: 0.96 }
              : isCovering
                ? { cx: 290, cy: 110, scale: 1.05 }
                : isSuccess
                  ? { cx: 287, cy: 102, scale: 1 }
                  : { cx: 293, cy: 214, scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 160, damping: 17 }}
        />
      </svg>

      <AnimatePresence>
        {isSuccess && (
          <div className="absolute inset-0">
            {confetti.map((piece, index) => (
              <motion.span
                key={`${piece.color}-${index}`}
                className="absolute left-1/2 top-1/2 h-3 w-5 rounded-sm"
                style={{ backgroundColor: piece.color }}
                initial={{ x: 0, y: 0, rotate: 0, scale: 0.3, opacity: 0 }}
                animate={{
                  x: piece.x,
                  y: piece.y,
                  rotate: piece.rotate,
                  scale: [0.5, 1, 0.7],
                  opacity: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.15, delay: index * 0.03, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedCharacter;
