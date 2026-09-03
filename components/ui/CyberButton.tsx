"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "threat" | "authentic" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  className?: string;
}

export function CyberButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  icon,
  className,
  disabled,
  ...props
}: CyberButtonProps) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2 font-medium",
    lg: "px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold",
    xl: "px-8 py-4 text-lg rounded-2xl gap-3 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-indigo text-charcoal-950 font-bold shadow-lg shadow-cyber-blue/20 hover:shadow-cyber-blue/40 border border-cyber-cyan/50",
    secondary:
      "bg-charcoal-800/90 text-slate-100 border border-slate-700/80 hover:border-cyber-blue/50 hover:bg-charcoal-700/80 shadow-md",
    threat:
      "bg-gradient-to-r from-neon-red via-neon-rose to-neon-crimson text-white font-bold shadow-lg shadow-neon-red/30 hover:shadow-neon-red/50 border border-neon-rose/50",
    authentic:
      "bg-gradient-to-r from-matrix-emerald via-matrix-teal to-cyan-500 text-charcoal-950 font-bold shadow-lg shadow-matrix-emerald/30 hover:shadow-matrix-emerald/50 border border-matrix-emerald/50",
    outline:
      "bg-transparent text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40",
    ghost:
      "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-charcoal-800/60",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center tracking-wide transition-colors cursor-pointer select-none font-sans disabled:opacity-50 disabled:cursor-not-allowed",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{loadingText || "Processing..."}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
