import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && <label className="text-sm font-semibold text-[var(--text-secondary)] ml-1">{label}</label>}
      <input
        className={`px-4 py-2.5 bg-[var(--bg-input)] backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-[var(--border-color)] hover:border-white/20'}
          disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-tertiary)] w-full text-[var(--text-primary)]`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-400 ml-1">{error}</span>}
    </div>
  );
};
