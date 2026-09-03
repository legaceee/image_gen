"use client";

import React from "react";

interface BadgeProps {
  label: string;
  value: string;
  variant?: "default" | "threat" | "authentic" | "neutral" | "warning";
  pulse?: boolean;
}

export function Badge({ label, value, variant = "default", pulse = false }: BadgeProps) {
  const variants = {
    default: "bg-brand-50 text-brand-700 border-brand-200",
    threat: "bg-rose-50 text-rose-600 border-rose-200",
    authentic: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-50 text-ink-500 border-ink-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const dotColors = {
    default: "bg-brand-500",
    threat: "bg-rose-500",
    authentic: "bg-emerald-500",
    neutral: "bg-ink-400",
    warning: "bg-amber-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]} ${pulse ? "animate-pulse" : ""}`} />
      <span className="uppercase tracking-wide text-[10px] font-semibold opacity-70">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </span>
  );
}