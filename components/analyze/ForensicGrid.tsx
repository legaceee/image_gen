"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import type { ForensicCheck } from "@/lib/forensicEngine";

interface Props {
  checks: ForensicCheck[];
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  PASS:    { icon: CheckCircle,    color: "text-emerald-500", bg: "bg-emerald-50",  border: "border-emerald-200", label: "Pass" },
  FAIL:    { icon: XCircle,        color: "text-rose-500",    bg: "bg-rose-50",     border: "border-rose-200",    label: "Fail" },
  WARNING: { icon: AlertTriangle,  color: "text-amber-500",   bg: "bg-amber-50",    border: "border-amber-200",   label: "Warn" },
  SKIPPED: { icon: MinusCircle,    color: "text-ink-300",     bg: "bg-ink-50",      border: "border-ink-200",     label: "Skip" },
};

export function ForensicGrid({ checks, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-ink-100/60 animate-pulse border border-ink-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {checks.map((check, i) => {
        const cfg = STATUS_CONFIG[check.status];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={check.shortName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-ink-100 hover:shadow-glass-sm transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{check.icon}</span>
                <span className="text-xs font-bold text-ink-700 uppercase tracking-wide">{check.shortName}</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.border} ${cfg.color} border`}>
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            </div>

            <p className="text-[11px] text-ink-400 leading-snug">{check.name}</p>

            {/* Score bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-ink-400">Confidence</span>
                <span className="text-[10px] font-mono font-bold text-ink-600">{check.score}%</span>
              </div>
              <div className="h-1 rounded-full bg-ink-100 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    check.status === "PASS" ? "bg-emerald-400" :
                    check.status === "FAIL" ? "bg-rose-400" :
                    check.status === "WARNING" ? "bg-amber-400" : "bg-ink-300"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${check.score}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              </div>
            </div>

            <p className="text-[11px] text-ink-500 leading-relaxed line-clamp-3">{check.detail}</p>
          </motion.div>
        );
      })}
    </div>
  );
}