"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TelemetryBadgeProps {
  label: string;
  value?: string | number;
  icon?: ReactNode;
  variant?: "neutral" | "threat" | "authentic" | "cyber" | "warning";
  className?: string;
  pulse?: boolean;
}

export function TelemetryBadge({
  label,
  value,
  icon,
  variant = "neutral",
  className,
  pulse = false,
}: TelemetryBadgeProps) {
  const variantStyles = {
    neutral: "bg-charcoal-800/80 border-slate-700/70 text-slate-300",
    threat: "bg-neon-red/10 border-neon-red/40 text-neon-rose",
    authentic: "bg-matrix-emerald/10 border-matrix-emerald/40 text-matrix-emerald",
    cyber: "bg-cyber-blue/10 border-cyber-blue/40 text-cyber-cyan",
    warning: "bg-amber-warning/10 border-amber-warning/40 text-amber-300",
  };

  const dotColors = {
    neutral: "bg-slate-400",
    threat: "bg-neon-red",
    authentic: "bg-matrix-emerald",
    cyber: "bg-cyber-blue",
    warning: "bg-amber-warning",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono tracking-tight font-medium backdrop-blur-md",
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColors[variant]
            )}
          />
          <span
            className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[variant])}
          />
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-slate-400 font-sans">{label}</span>
      {value !== undefined && <span className="font-bold text-slate-100">{value}</span>}
    </div>
  );
}
