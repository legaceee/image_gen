"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost" | "threat" | "authentic";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function Button({ children, onClick, type = "button", variant = "primary", size = "md", disabled, loading, className = "", icon }: ButtonProps) {
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/30",
    secondary: "bg-white/80 hover:bg-white text-ink-700 border border-ink-200 hover:border-brand-300 hover:text-brand-600 shadow-sm",
    ghost: "bg-transparent hover:bg-ink-100/60 text-ink-600 hover:text-ink-900",
    threat: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/25 hover:shadow-md hover:shadow-rose-500/30",
    authentic: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/25",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-sm rounded-xl gap-2.5",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}