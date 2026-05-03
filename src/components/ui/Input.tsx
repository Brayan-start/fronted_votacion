import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <input
        className={`px-4 py-2.5 bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus-glow transition-all duration-300
          ${error ? 'border-red-500' : 'border-slate-200'}
          disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400 w-full`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-500 ml-1">{error}</span>}
    </div>
  );
};
