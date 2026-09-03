"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

interface CircularGaugeProps {
  score: number; // 0 to 100
  verdict: string;
  confidence: string;
  size?: number;
}

export function CircularGauge({
  score,
  verdict,
  confidence,
  size = 280,
}: CircularGaugeProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    // Smooth count up animation
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayedScore(score);
        clearInterval(timer);
      } else {
        setDisplayedScore(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const isSynthetic = score >= 50;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass = isSynthetic
    ? "text-neon-red drop-shadow-[0_0_16px_rgba(255,42,95,0.6)]"
    : "text-matrix-emerald drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]";

  const strokeColor = isSynthetic ? "#ff2a5f" : "#10b981";

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Outer ambient glow */}
      <div
        className={`absolute w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isSynthetic ? "bg-neon-red" : "bg-matrix-emerald"
        }`}
      />

      {/* SVG Radial Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#151c2e"
            strokeWidth={strokeWidth}
          />

          {/* Calibrated Tick Marks */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 12}
            fill="none"
            stroke="#1e2942"
            strokeWidth="2"
            strokeDasharray="2 6"
          />

          {/* Animated Foreground Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Telemetry Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1">
            AI PROBABILITY
          </span>
          <div className="flex items-baseline gap-0.5">
            <span
              className={`text-5xl font-black font-mono tracking-tighter ${
                isSynthetic ? "text-neon-rose" : "text-matrix-emerald"
              }`}
            >
              {displayedScore.toFixed(1)}
            </span>
            <span className="text-xl font-mono font-bold text-slate-400">%</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-charcoal-950/80 border border-slate-700/60 text-[10px] font-mono">
            {isSynthetic ? (
              <>
                <ShieldAlert className="w-3 h-3 text-neon-red" />
                <span className="text-neon-rose font-bold">SYNTHETIC MEDIA</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-matrix-emerald" />
                <span className="text-matrix-emerald font-bold">AUTHENTIC CAPTURE</span>
              </>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">
            CONFIDENCE: <strong className="text-slate-200">{confidence}</strong>
          </span>
        </div>
      </div>

      {/* Metric explanation subtext */}
      <p className="mt-3 text-xs text-slate-400 font-mono text-center max-w-xs">
        {isSynthetic
          ? "Deep latent space signatures and sub-pixel checkerboard patterns detected."
          : "Natural sensor photon shot noise and physical CMOS Bayer demosaicing validated."}
      </p>
    </div>
  );
}
