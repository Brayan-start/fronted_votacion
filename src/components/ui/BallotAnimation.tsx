import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BallotAnimationProps {
  focusField: 'none' | 'reg_univ' | 'id_card';
  typingTotal: number;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
}

type AnimPhase = 'idle' | 'reaching' | 'sliding' | 'confirming';

const BallotAnimation: React.FC<BallotAnimationProps> = ({
  focusField,
  typingTotal,
  isSubmitting,
  isSuccess,
  isError,
}) => {
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const [errorAnim, setErrorAnim] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      setAnimPhase('reaching');
      const t1 = setTimeout(() => setAnimPhase('sliding'), 350);
      const t2 = setTimeout(() => setAnimPhase('confirming'), 900);
      const t3 = setTimeout(() => {
        if (!isSuccess) setAnimPhase('idle');
      }, 1900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (isSuccess) setAnimPhase('confirming');
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      setAnimPhase('idle');
      setErrorAnim(true);
      const t = setTimeout(() => setErrorAnim(false), 1800);
      return () => clearTimeout(t);
    } else {
      setErrorAnim(false);
    }
  }, [isError]);

  const headTilt = focusField === 'none' ? 0 : focusField === 'reg_univ' ? 9 : -6;
  const torsoLean = focusField === 'none' ? 0 : focusField === 'reg_univ' ? 2 : -1;
  const headY = focusField === 'id_card' ? 3 : 0;

  const armD = errorAnim
    ? 'M 108 150 Q 128 190 145 208'
    : animPhase === 'reaching' || animPhase === 'sliding'
      ? 'M 108 150 Q 155 148 192 162'
      : focusField === 'none'
        ? 'M 108 150 Q 138 178 162 192'
        : focusField === 'reg_univ'
          ? 'M 108 150 Q 142 167 170 180'
          : 'M 108 150 Q 134 182 155 195';

  const ballotOpacity = errorAnim ? 0.6 : animPhase === 'idle' || animPhase === 'reaching' ? 1 : 0;
  const ballotX = animPhase === 'sliding' || animPhase === 'confirming' ? 195 : 0;
  const ballotY = errorAnim ? 25 : animPhase === 'sliding' || animPhase === 'confirming' ? 92 : 0;
  const ballotRotate = errorAnim ? 18 : animPhase === 'sliding' || animPhase === 'confirming' ? 10 : 0;

  const fillChecks = Math.min(3, Math.floor(typingTotal / 34));

  return (
    <div
      className="w-full max-w-[500px] mx-auto select-none pointer-events-none"
      style={{ aspectRatio: '5/4' }}
    >
      <svg viewBox="0 0 500 400" className="w-full h-full">
        <defs>
          <linearGradient id="boxBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f6af5" />
            <stop offset="100%" stopColor="#3b4fd0" />
          </linearGradient>
          <linearGradient id="boxFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d3250" />
            <stop offset="100%" stopColor="#1a1d29" />
          </linearGradient>
          <linearGradient id="boxStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5468ff" />
            <stop offset="100%" stopColor="#343160" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde8d0" />
            <stop offset="100%" stopColor="#f5cba7" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a237e" />
            <stop offset="100%" stopColor="#0d1452" />
          </linearGradient>
          <linearGradient id="shirtHighlight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#283593" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a237e" stopOpacity="0" />
          </linearGradient>
          <filter id="glowCheck">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dropShadowPerson">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.2" />
          </filter>
          <filter id="dropShadowBox">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="dropShadowBallot">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ambient glow behind box */}
        <AnimatePresence>
          {(animPhase === 'confirming' || isSuccess) && (
            <motion.ellipse
              cx="375" cy="290" rx="85" ry="75"
              fill="#22c55e" opacity="0.1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* === BALLOT BOX (URNA) === */}
        <motion.g
          filter="url(#dropShadowBox)"
          animate={
            animPhase === 'confirming'
              ? { x: [0, -2, 2, -1, 1, 0] }
              : errorAnim
                ? { x: [0, -5, 5, -4, 4, -2, 2, 0] }
                : {}
          }
          transition={{ duration: 0.55 }}
        >
          {/* Box shadow floor */}
          <ellipse cx="375" cy="370" rx="80" ry="14" fill="#000" opacity="0.25" />

          {/* Box body */}
          <motion.path
            d="M 305 245 L 318 362 L 432 362 L 445 245 Z"
            fill="url(#boxBg)"
            stroke={animPhase === 'confirming' || isSuccess ? '#22c55e' : 'url(#boxStroke)'}
            strokeWidth="2.5"
            strokeLinejoin="round"
            animate={{
              stroke: animPhase === 'confirming' || isSuccess ? '#22c55e' : '#343160',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Box inner face (depth) */}
          <path
            d="M 318 256 Q 375 249 432 256 L 424 335 Q 375 342 326 335 Z"
            fill="url(#boxFront)"
            opacity="0.45"
          />

          {/* Top rim highlight */}
          <path
            d="M 315 248 L 435 248"
            stroke="#6b7fff"
            strokeWidth="1"
            opacity="0.3"
            fill="none"
          />

          {/* Slot */}
          <rect x="348" y="241" width="54" height="12" rx="2" fill="#0b0e14" stroke="#343160" strokeWidth="2" />
          <rect x="352" y="251" width="46" height="3" fill="#1a1d29" />

          {/* Slot arrow hint */}
          <motion.polygon
            points="375,237 369,228 381,228"
            fill="#6366f1"
            opacity="0.5"
            animate={
              animPhase === 'reaching' || animPhase === 'sliding'
                ? { y: [0, -3, 0] }
                : {}
            }
            transition={{ duration: 0.7, repeat: Infinity }}
          />

          {/* Display screen */}
          <rect x="350" y="286" width="50" height="28" rx="4" fill="#0b0e14" stroke="#2d3250" strokeWidth="1.5" />
          <text
            x="375" y="305"
            textAnchor="middle"
            fill="#6366f1"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace, sans-serif"
          >
            VOTA
          </text>

          {/* Status LED */}
          <motion.circle
            cx="375" cy="342" r="4.5"
            fill={animPhase === 'confirming' || isSuccess ? '#22c55e' : '#2d3250'}
            animate={
              animPhase === 'confirming' || isSuccess
                ? { scale: [1, 1.4, 1] }
                : {}
            }
            transition={{ duration: 0.4, repeat: animPhase === 'confirming' || isSuccess ? 4 : 0 }}
          />

          {/* Brand label */}
          <text
            x="375" y="358"
            textAnchor="middle"
            fill="#4a4f7a"
            fontSize="5"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="2"
          >
            UPEA
          </text>
        </motion.g>

        {/* === PERSON SILHOUETTE === */}
        <motion.g
          filter="url(#dropShadowPerson)"
          animate={errorAnim ? { x: [0, -5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Shadow under person */}
          <ellipse cx="100" cy="365" rx="38" ry="8" fill="#000" opacity="0.2" />

          {/* Torso */}
          <motion.g
            style={{ originX: '100px', originY: '195px' }}
            animate={{ rotate: torsoLean }}
            transition={{ type: 'spring', stiffness: 100, damping: 14 }}
          >
            {/* Body shape */}
            <path
              d="M 72 142 L 68 250 Q 68 258 78 258 L 122 258 Q 132 258 132 250 L 128 142 Q 100 130 72 142 Z"
              fill="url(#shirtGrad)"
              stroke="#3d52a0"
              strokeWidth="0.8"
              opacity="0.95"
            />
            {/* Fabric highlight */}
            <path
              d="M 76 150 L 72 250 Q 72 256 80 256 L 100 256 L 100 146 Q 88 136 76 150 Z"
              fill="url(#shirtHighlight)"
            />
            {/* Collar V-neck trim */}
            <path
              d="M 88 142 L 100 162 L 112 142"
              stroke="#5c6bc0"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.7"
            />
            {/* Collar fill */}
            <path
              d="M 88 142 L 100 162 L 112 142 Z"
              fill="#3d52a0"
              opacity="0.4"
            />

            {/* === UPEA SHIELD + TEXT === */}
            <g opacity="0.95">
              {/* Shield */}
              <g transform="translate(100, 172)">
                <path
                  d="M 0 -9 L 7 -6 L 7 3 L 0 10 L -7 3 L -7 -6 Z"
                  fill="#ffcd00"
                  stroke="#e8b800"
                  strokeWidth="0.6"
                />
                {/* Inner shield */}
                <path
                  d="M 0 -6 L 5 -4 L 5 2 L 0 7 L -5 2 L -5 -4 Z"
                  fill="#1a237e"
                />
                {/* Star */}
                <polygon
                  points="0,-3 0.6,-1 2,-1 0.8,0.2 1.2,1.6 0,0.8 -1.2,1.6 -0.8,0.2 -2,-1 -0.6,-1"
                  fill="#ffcd00"
                />
              </g>

              {/* "UPEA" text */}
              <text
                x="100" y="190"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="6"
                fontWeight="900"
                fontFamily="Arial, Helvetica, sans-serif"
                letterSpacing="0.5"
              >
                UPEA
              </text>

              {/* "INGENIERÍA DE" text */}
              <text
                x="100" y="199"
                textAnchor="middle"
                fill="#c5cae9"
                fontSize="3.8"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
                letterSpacing="0.3"
              >
                INGENIERÍA DE
              </text>

              {/* "SISTEMAS" text */}
              <text
                x="100" y="206"
                textAnchor="middle"
                fill="#c5cae9"
                fontSize="3.8"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
                letterSpacing="0.3"
              >
                SISTEMAS
              </text>
            </g>
          </motion.g>

          {/* Neck */}
          <rect x="94" y="118" width="12" height="16" rx="3" fill="url(#skinGrad)" />

          {/* Head */}
          <motion.g
            style={{ originX: '95px', originY: '122px' }}
            animate={
              errorAnim
                ? { rotate: [0, -10, 10, -8, 8, -4, 4, 0], y: [0, 1, -1, 1, -1, 0] }
                : { rotate: headTilt, y: headY }
            }
            transition={
              errorAnim
                ? { duration: 0.7, ease: 'easeInOut' }
                : { type: 'spring', stiffness: 100, damping: 14 }
            }
          >
            {/* Head shape */}
            <circle cx="95" cy="90" r="30" fill="url(#skinGrad)" stroke="#e8d5b8" strokeWidth="0.5" />
            {/* Hair */}
            <path
              d="M 65 85 Q 65 58 95 55 Q 125 58 125 85 Q 115 72 95 70 Q 75 72 65 85 Z"
              fill="#2d3250"
              opacity="0.85"
            />
            <path
              d="M 65 85 Q 70 80 80 80 Q 88 78 95 78 Q 102 78 110 80 Q 120 80 125 85"
              fill="none"
              stroke="#1a1d29"
              strokeWidth="1.5"
              opacity="0.3"
            />
            {/* Cap */}
            <g>
              {/* Cap crown */}
              <path
                d="M 66 80 Q 66 54 95 51 Q 124 54 124 80 Q 119 71 95 69 Q 71 71 66 80 Z"
                fill="#283593"
                stroke="#1a237e"
                strokeWidth="0.5"
              />
              {/* Cap highlight */}
              <path
                d="M 72 78 Q 72 58 95 55 Q 118 58 118 78"
                fill="none"
                stroke="#3d52a0"
                strokeWidth="1"
                opacity="0.35"
              />
              {/* Cap seam lines */}
              <path
                d="M 95 53 L 95 68"
                stroke="#1a237e"
                strokeWidth="0.6"
                opacity="0.4"
              />
              {/* Small "U" logo on cap */}
              <path
                d="M 91 61 Q 95 66 99 61"
                fill="none"
                stroke="#c5cae9"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* Visor (brim) */}
              <path
                d="M 67 79 Q 95 90 123 79 Q 95 83 67 79 Z"
                fill="#1a237e"
                stroke="#0d1452"
                strokeWidth="0.4"
              />
              {/* Visor highlight */}
              <path
                d="M 69 79 Q 95 88 121 79"
                fill="none"
                stroke="#3d52a0"
                strokeWidth="0.8"
                opacity="0.3"
              />
            </g>
            {/* Face features */}
            <motion.g
              initial={false}
              animate={{ opacity: focusField === 'id_card' ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Eyes */}
              <ellipse cx="83" cy="86" rx="2.5" ry="2" fill="#1a1d29" opacity="0.7" />
              <ellipse cx="107" cy="86" rx="2.5" ry="2" fill="#1a1d29" opacity="0.7" />
              {/* Nose */}
              <path d="M 95 90 L 93 96 Q 95 98 97 96 Z" fill="#e8c8a0" opacity="0.6" />
              {/* Mouth */}
              <path d="M 88 102 Q 95 106 102 102" stroke="#c9a882" strokeWidth="1.2" fill="none" opacity="0.6" />
            </motion.g>
            {/* Blush when looking down (privacy) */}
            <AnimatePresence>
              {focusField === 'id_card' && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                >
                  <circle cx="78" cy="98" r="6" fill="#e8a0a0" />
                  <circle cx="112" cy="98" r="6" fill="#e8a0a0" />
                </motion.g>
              )}
            </AnimatePresence>
          </motion.g>

          {/* === ARM === */}
          <g>
            {/* Arm shadow */}
            <motion.path
              d={
                errorAnim
                  ? 'M 112 152 Q 132 192 148 210'
                  : animPhase === 'reaching' || animPhase === 'sliding'
                    ? 'M 112 152 Q 157 152 195 166'
                    : 'M 112 152 Q 140 180 165 195'
              }
              stroke="#000"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
              opacity="0.08"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            {/* Upper arm */}
            <motion.path
              d={armD}
              stroke="url(#skinGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            {/* Arm outline */}
            <motion.path
              d={armD}
              stroke="#e8d5b8"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.15"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            {/* Hand */}
            <motion.g
              animate={
                animPhase === 'reaching' || animPhase === 'sliding'
                  ? { x: 30, y: 14 }
                  : focusField === 'none'
                    ? { x: 0, y: 0 }
                    : focusField === 'reg_univ'
                      ? { x: 8, y: -2 }
                      : { x: -5, y: 6 }
              }
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {/* Palm */}
              <circle cx="162" cy="192" r="9" fill="url(#skinGrad)" stroke="#e8d5b8" strokeWidth="0.5" />

              {/* Fingers */}
              <AnimatePresence>
                {animPhase === 'sliding' || animPhase === 'confirming' ? (
                  <motion.g
                    key="fingers-open"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                  >
                    <path d="M 155 186 Q 150 180 156 176" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 159 184 Q 155 177 162 173" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 163 184 Q 160 177 167 174" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </motion.g>
                ) : (
                  <motion.g
                    key="fingers-closed"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                  >
                    <path d="M 155 186 Q 152 183 157 181" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 159 185 Q 157 182 162 180" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 164 186 Q 162 184 167 182" stroke="url(#skinGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>
          </g>
        </motion.g>

        {/* === BALLOT (PAPELETA) === */}
        <motion.g
          filter="url(#dropShadowBallot)"
          animate={{
            x: ballotX,
            y: ballotY,
            rotate: ballotRotate,
            opacity: ballotOpacity,
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ originX: '200px', originY: '148px' }}
        >
          {/* Ballot paper with slight curve */}
          <motion.path
            d={
              animPhase === 'sliding'
                ? 'M 184 130 Q 192 128 200 130 L 200 166 L 184 166 Z'
                : 'M 184 130 L 200 130 L 200 166 L 184 166 Z'
            }
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
            animate={{
              d: animPhase === 'sliding'
                ? 'M 184 130 Q 194 128 200 130 L 200 166 L 184 166 Z'
                : 'M 184 130 L 200 130 L 200 166 L 184 166 Z',
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Header line */}
          <rect x="186" y="133" width="12" height="2.5" rx="0.5" fill="#cbd5e1" opacity="0.6" />

          {/* Checkable rows */}
          {[0, 1, 2].map((row) => {
            const y = 139 + row * 9;
            const isFilled = fillChecks > row;
            return (
              <g key={row}>
                {/* Checkbox circle */}
                <circle cx="188" cy={y + 3} r="2" fill={isFilled ? '#3b82f6' : 'none'} stroke={isFilled ? '#3b82f6' : '#cbd5e1'} strokeWidth="1" />
                {/* Check */}
                {isFilled && (
                  <path
                    d={`M 187 ${y + 3} l 1.5 1.5 l 2 -2.5`}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
                {/* Text line */}
                <rect x="192" y={y + 1.5} width="6" height="2" rx="0.5" fill="#e2e8f0" opacity={isFilled ? 0.9 : 0.4} />
              </g>
            );
          })}

          {/* Footer line */}
          <rect x="186" y="161" width="12" height="1.5" rx="0.5" fill="#e2e8f0" opacity="0.5" />
        </motion.g>

        {/* === CHECKMARK (voto registrado) === */}
        <AnimatePresence>
          {(animPhase === 'confirming' || isSuccess) && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              filter="url(#glowCheck)"
            >
              <circle cx="375" cy="305" r="46" fill="#22c55e" opacity="0.1" />
              <circle cx="375" cy="305" r="32" fill="#22c55e" opacity="0.06" />
              <path
                d="M 360 302 L 370 312 L 390 294"
                stroke="#22c55e"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* === SUCCESS PARTICLES === */}
        <AnimatePresence>
          {(animPhase === 'confirming' || isSuccess) && (
            <motion.g>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = i * 60 * (Math.PI / 180);
                return (
                  <motion.circle
                    key={i}
                    cx={375 + Math.cos(angle) * 22}
                    cy={305 + Math.sin(angle) * 22}
                    r="2.5"
                    fill="#22c55e"
                    opacity="0.7"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* === DECORATIVE DOTS === */}
        <circle cx="50" cy="280" r="2" fill="#ffffff" opacity="0.12" />
        <circle cx="170" cy="340" r="1.5" fill="#ffffff" opacity="0.1" />
        <circle cx="260" cy="375" r="2.5" fill="#ffffff" opacity="0.08" />
        <circle cx="460" cy="140" r="2" fill="#ffffff" opacity="0.12" />
        <circle cx="430" cy="80" r="1.5" fill="#ffffff" opacity="0.08" />
        <circle cx="40" cy="130" r="1.5" fill="#ffffff" opacity="0.1" />

        {/* Error X overlay */}
        <AnimatePresence>
          {errorAnim && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <circle cx="375" cy="305" r="40" fill="#ef4444" opacity="0.1" />
              <circle cx="375" cy="305" r="24" fill="#ef4444" opacity="0.06" />
              <path
                d="M 363 293 L 387 317 M 387 293 L 363 317"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default BallotAnimation;
