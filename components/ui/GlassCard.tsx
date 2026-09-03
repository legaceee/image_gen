"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "threat" | "authentic" | "elevated";
  hover?: boolean;
  animate?: boolean;
}

export function GlassCard({ children, className = "", variant = "default", hover = false, animate = false }: GlassCardProps) {
  const variantStyles = {
    default: "glass-card",
    elevated: "glass-card shadow-glass-hover",
    threat: "bg-rose-50/80 backdrop-blur-2xl border border-rose-200/60 shadow-threat",
    authentic: "bg-emerald-50/80 backdrop-blur-2xl border border-emerald-200/60 shadow-authentic",
  };

  const hoverClass = hover ? "glass-card-hover transition-all duration-300 cursor-pointer" : "";

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`rounded-2xl ${variantStyles[variant]} ${hoverClass} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`rounded-2xl ${variantStyles[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}