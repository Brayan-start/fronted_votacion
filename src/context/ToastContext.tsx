import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3500;

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-900/90 dark:bg-emerald-900/90 light:bg-emerald-50',
    border: 'border-emerald-700 dark:border-emerald-700 light:border-emerald-200',
    icon: 'text-emerald-400 dark:text-emerald-400 light:text-emerald-600',
    text: 'text-emerald-100 dark:text-emerald-100 light:text-emerald-900',
  },
  error: {
    bg: 'bg-red-900/90 dark:bg-red-900/90 light:bg-red-50',
    border: 'border-red-700 dark:border-red-700 light:border-red-200',
    icon: 'text-red-400 dark:text-red-400 light:text-red-600',
    text: 'text-red-100 dark:text-red-100 light:text-red-900',
  },
  warning: {
    bg: 'bg-amber-900/90 dark:bg-amber-900/90 light:bg-amber-50',
    border: 'border-amber-700 dark:border-amber-700 light:border-amber-200',
    icon: 'text-amber-400 dark:text-amber-400 light:text-amber-600',
    text: 'text-amber-100 dark:text-amber-100 light:text-amber-900',
  },
  info: {
    bg: 'bg-blue-900/90 dark:bg-blue-900/90 light:bg-blue-50',
    border: 'border-blue-700 dark:border-blue-700 light:border-blue-200',
    icon: 'text-blue-400 dark:text-blue-400 light:text-blue-600',
    text: 'text-blue-100 dark:text-blue-100 light:text-blue-900',
  },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const colors = colorMap[toast.type];
  const Icon = iconMap[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl min-w-[320px] max-w-md ${colors.bg} ${colors.border}`}
    >
      <Icon size={22} className={`shrink-0 mt-0.5 ${colors.icon}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${colors.text}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-xs mt-1 opacity-80 ${colors.text}`}>{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors ${colors.text}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
