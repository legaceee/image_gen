"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "threat" | "authentic" | "cyber" | "subtle";
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  glow = false,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-charcoal-900/70 border-slate-800/80 hover:border-slate-700/80",
    threat: "bg-charcoal-900/80 border-neon-red/30 hover:border-neon-red/60 shadow-neon-red/5",
    authentic: "bg-charcoal-900/80 border-matrix-emerald/30 hover:border-matrix-emerald/60 shadow-matrix-emerald/5",
    cyber: "bg-charcoal-900/80 border-cyber-blue/30 hover:border-cyber-blue/60 shadow-cyber-blue/5",
    subtle: "bg-charcoal-950/50 border-slate-800/50",
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-2xl shadow-black/50 overflow-hidden",
        variantStyles[variant],
        glow && "shadow-lg",
        className
      )}
      {...props}
    >
      {/* Micro grid texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
