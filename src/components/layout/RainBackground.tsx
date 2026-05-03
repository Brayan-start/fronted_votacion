import React from 'react';

export const RainBackground: React.FC = () => {
  // Generate a fixed number of rain drops
  const drops = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-slate-900 pointer-events-none">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Rain Drops */}
      {drops.map((_, i) => (
        <div
          key={i}
          className="absolute bg-blue-400/30 w-[1px] h-20 animate-rain"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.5 + Math.random() * 1.5}s`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.1 + Math.random() * 0.3
          }}
        ></div>
      ))}

      {/* Subtle Mist/Cloud Effect */}
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay blur-3xl animate-pulse"></div>
    </div>
  );
};
