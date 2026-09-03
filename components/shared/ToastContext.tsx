"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; type: ToastType; title: string; message: string; }
interface ToastContextValue { toast: (opts: Omit<Toast, "id">) => void; }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const STYLES = {
  success: "bg-white border-emerald-400 text-emerald-800",
  error:   "bg-white border-rose-400 text-rose-800",
  warning: "bg-white border-amber-400 text-amber-800",
  info:    "bg-white border-brand-400 text-brand-800",
};
const ICON_COLORS = { success: "text-emerald-500", error: "text-rose-500", warning: "text-amber-500", info: "text-brand-500" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t.slice(-3), { ...opts, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type];
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-l-4 shadow-glass backdrop-blur-sm ${STYLES[t.type]}`}>
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide">{t.title}</p>
                  <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{t.message}</p>
                </div>
                <button onClick={() => dismiss(t.id)} className="p-0.5 opacity-50 hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}