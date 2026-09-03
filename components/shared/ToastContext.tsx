"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ShieldCheck, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info" | "threat" | "authentic";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const isThreat = t.type === "threat" || t.type === "error";
            const isAuthentic = t.type === "authentic" || t.type === "success";

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto relative p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 overflow-hidden ${
                  isThreat
                    ? "bg-charcoal-900/90 border-neon-red/40 text-slate-100 shadow-neon-red/10"
                    : isAuthentic
                    ? "bg-charcoal-900/90 border-matrix-emerald/40 text-slate-100 shadow-matrix-emerald/10"
                    : t.type === "warning"
                    ? "bg-charcoal-900/90 border-amber-warning/40 text-slate-100 shadow-amber-warning/10"
                    : "bg-charcoal-900/90 border-cyber-blue/40 text-slate-100 shadow-cyber-blue/10"
                }`}
              >
                {/* Subtle top scanline */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] ${
                    isThreat
                      ? "bg-gradient-to-r from-neon-red via-neon-rose to-neon-crimson"
                      : isAuthentic
                      ? "bg-gradient-to-r from-matrix-emerald via-matrix-teal to-cyber-blue"
                      : "bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-indigo"
                  }`}
                />

                <div className="flex-shrink-0 mt-0.5">
                  {t.type === "threat" && <ShieldAlert className="w-5 h-5 text-neon-red animate-pulse" />}
                  {t.type === "authentic" && <ShieldCheck className="w-5 h-5 text-matrix-emerald" />}
                  {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-matrix-emerald" />}
                  {t.type === "error" && <AlertTriangle className="w-5 h-5 text-neon-red" />}
                  {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-warning" />}
                  {t.type === "info" && <Info className="w-5 h-5 text-cyber-blue" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold tracking-wide font-mono uppercase text-slate-100">
                    {t.title}
                  </h4>
                  {t.message && (
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                      {t.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-100 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
