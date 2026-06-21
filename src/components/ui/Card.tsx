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
    <div className={`bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-md)] overflow-hidden transition-all hover:shadow-[var(--shadow-lg)] ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          {title && <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
