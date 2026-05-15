import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-300/50 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-100/50 bg-white/30">
          {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
