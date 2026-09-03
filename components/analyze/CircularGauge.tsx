"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  probability: number;
  verdict: "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE";
  confidence: string;
  isLoading?: boolean;
}

export function CircularGauge({ probability, verdict, confidence, isLoading }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (isLoading) { setDisplayed(0); return; }
    let current = 0;
    const target = probability;
    const step = target / 60;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayed(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [probability, isLoading]);

  const strokeDashoffset = circumference - (displayed / 100) * circumference;

  const colors = {
    SYNTHETIC: { stroke: "#F43F5E", text: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", label: "AI Generated" },
    AUTHENTIC: { stroke: "#10B981", text: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", label: "Authentic" },
    INCONCLUSIVE: { stroke: "#6366F1", text: "text-brand-500", bg: "bg-brand-50", border: "border-brand-200", label: "Inconclusive" },
  };

  const c = colors[verdict];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          {/* Background track */}
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          {/* Progress arc */}
          <motion.circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: isLoading ? circumference : strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <div className="w-6 h-6 rounded-full border-2 border-brand-300 border-t-brand-500 animate-spin" />
          ) : (
            <>
              <span className={`text-3xl font-extrabold font-mono ${c.text}`}>{displayed}%</span>
              <span className="text-xs text-ink-400 font-medium mt-0.5">synthetic</span>
            </>
          )}
        </div>
      </div>

      {/* Verdict badge */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-2 rounded-xl ${c.bg} border ${c.border} text-center`}>
          <p className={`text-sm font-bold ${c.text}`}>{c.label}</p>
          <p className="text-xs text-ink-400 mt-0.5">{confidence} confidence</p>
        </motion.div>
      )}
    </div>
  );
}