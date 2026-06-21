import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VotingAnimationProps {
  isRegUnivFocused?: boolean;
  isPasswordFocused?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

type Phase = 'idle' | 'reaching' | 'inserting' | 'confirming';

const VotingAnimation: React.FC<VotingAnimationProps> = ({
  isRegUnivFocused = false,
  isPasswordFocused = false,
  isSuccess = false,
  isError = false,
}) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const cycleKey = useRef(0);

  useEffect(() => {
    if (isSuccess || isError) {
      setPhase('idle');
      return;
    }

    const idle = setTimeout(() => setPhase('reaching'), 2500);
    const reach = setTimeout(() => setPhase('inserting'), 3400);
    const insert = setTimeout(() => setPhase('confirming'), 4000);
    const confirm = setTimeout(() => {
      setPhase('idle');
      cycleKey.current = cycleKey.current + 1;
    }, 5200);

    return () => {
      clearTimeout(idle); clearTimeout(reach);
      clearTimeout(insert); clearTimeout(confirm);
    };
  }, [cycleKey.current, isSuccess, isError]);

  const glow = isSuccess ? 'success'
    : isError ? 'error'
    : isRegUnivFocused ? 'focus'
    : phase === 'confirming' ? 'confirm'
    : 'none';

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[360px] aspect-[4/3] select-none pointer-events-none"
      animate={isError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <svg viewBox="0 0 260 240" className="h-full w-full drop-shadow-[0_16px_32px_rgba(52,64,130,0.18)]">
        <defs>
          <linearGradient id="boxFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f6af5" />
            <stop offset="100%" stopColor="#5460e0" />
          </linearGradient>
          <linearGradient id="boxPanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e2235" />
            <stop offset="100%" stopColor="#151829" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="130" cy="220" rx="70" ry="9" fill="#dfe5ff" opacity="0.35" />

        {/* Glow ring */}
        {(glow === 'focus' || glow === 'confirm' || glow === 'success') && (
          <motion.ellipse
            cx="130" cy="120"
            rx="78" ry="68"
            fill={glow === 'success' ? '#22c55e' : glow === 'focus' ? '#3b82f6' : '#6366f1'}
            opacity={glow === 'success' ? 0.12 : 0.1}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {glow === 'error' && (
          <motion.ellipse
            cx="130" cy="120" rx="70" ry="60"
            fill="#ef4444" opacity="0.1"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* Box body */}
        <motion.path
          d="M 72 55 L 88 210 L 172 210 L 188 55 Z"
          fill="url(#boxFill)"
          stroke={glow === 'success' ? '#22c55e' : glow === 'error' ? '#ef4444' : '#343160'}
          strokeWidth="3"
          strokeLinejoin="round"
          animate={{
            stroke: glow === 'success' ? '#22c55e' : glow === 'error' ? '#ef4444' : '#343160',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Box inner panel */}
        <path
          d="M 92 62 Q 130 55 168 62 L 155 170 Q 130 175 105 170 Z"
          fill="url(#boxPanel)"
          opacity="0.5"
        />

        {/* Slot */}
        <rect x="118" y="48" width="24" height="10" rx="2" fill="#0f1117" stroke="#343160" strokeWidth="2" />
        <rect x="120" y="56" width="20" height="2" fill="#1e2235" />

        {/* Slot arrow hint */}
        <motion.polygon
          points="130,46 126,38 134,38"
          fill="#4f6af5"
          opacity="0.4"
          animate={phase === 'reaching' || phase === 'inserting' ? { y: [0, -2, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Display */}
        <rect x="112" y="100" width="36" height="24" rx="3" fill="#0f1117" stroke="#2d3250" strokeWidth="1.5" />
        <text x="130" y="115" textAnchor="middle" fill="#4f6af5" fontSize="7" fontWeight="bold" fontFamily="monospace">
          VOTA
        </text>

        {/* Small LEDs */}
        <AnimatePresence>
          {glow === 'confirm' || glow === 'success' ? (
            <motion.circle
              key="led-on" cx="130" cy="155" r="3"
              fill={glow === 'success' ? '#22c55e' : '#6366f1'}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.4, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ) : (
            <circle key="led-off" cx="130" cy="155" r="3" fill="#2d3250" />
          )}
        </AnimatePresence>

        {/* Decorative line */}
        <line x1="95" y1="175" x2="165" y2="175" stroke="#343160" strokeWidth="1" opacity="0.4" />

        {/* Hand + Ballot group */}
        <motion.g
          animate={{
            x: phase === 'idle' ? 60 : phase === 'reaching' ? -18 : phase === 'inserting' ? -12 : -20,
            opacity: phase === 'idle' ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 110, damping: 16 }}
        >
          {/* Arm */}
          <path d="M 225 75 Q 195 65 182 72" stroke="#f5cba7" strokeWidth="12" strokeLinecap="round" fill="none" />
          {/* Palm */}
          <circle cx="178" cy="76" r="8" fill="#f5cba7" />
          {/* Fingers */}
          <path d="M 174 69 Q 178 66 181 69" stroke="#f5cba7" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 172 83 Q 176 86 179 83" stroke="#f5cba7" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          {/* Ballot */}
          <motion.g
            animate={{
              y: phase === 'inserting' ? -20 : 0,
              opacity: phase === 'inserting' ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          >
            <rect x="180" y="56" width="22" height="36" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="184" y1="65" x2="198" y2="65" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="184" y1="72" x2="198" y2="72" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="184" y1="79" x2="198" y2="79" stroke="#e2e8f0" strokeWidth="1.5" />
            <circle cx="187" cy="65" r="1.5" fill="#cbd5e1" />
            <circle cx="187" cy="72" r="1.5" fill="#cbd5e1" />
            <circle cx="187" cy="79" r="1.5" fill="#cbd5e1" />
          </motion.g>
        </motion.g>

        {/* Success effects */}
        <AnimatePresence>
          {isSuccess && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            >
              <circle cx="130" cy="120" r="44" fill="#22c55e" opacity="0.12" />
              <path
                d="M 118 120 L 128 130 L 144 108"
                stroke="#22c55e" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Error indicator */}
        <AnimatePresence>
          {isError && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <rect x="112" y="100" width="36" height="24" rx="3" fill="#0f1117" stroke="#ef4444" strokeWidth="1.5" />
              <text x="130" y="115" textAnchor="middle" fill="#ef4444" fontSize="6" fontWeight="bold" fontFamily="monospace">
                ERROR
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Security shield on password */}
        <AnimatePresence>
          {isPasswordFocused && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 15 }}
            >
              <path
                d="M 207 56 L 213 50 C 216 50 218 53 218 56 L 218 65 C 218 72 210 77 210 77 C 210 77 202 72 202 65 L 202 56 C 202 53 204 50 207 50 Z"
                fill="#10b981" opacity="0.85"
              />
              <path d="M 208 62 L 210 64 L 214 59" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};

export default VotingAnimation;
