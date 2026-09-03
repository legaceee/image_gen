"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Sparkles,
  SearchCheck,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Activity,
  Menu,
  X,
  Key,
} from "lucide-react";
import { useDemoMode } from "../shared/DemoModeContext";
import { TelemetryBadge } from "../ui/TelemetryBadge";
import { ApiKeyModal } from "../shared/ApiKeyModal";

export function Navbar() {
  const pathname = usePathname();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const navItems = [
    { label: "Mission Control", href: "/", icon: <Terminal className="w-4 h-4" /> },
    { label: "Neural Studio", href: "/generate", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Forensic Analyzer", href: "/analyze", icon: <SearchCheck className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-charcoal-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-charcoal-900 border border-cyber-blue/40 shadow-lg shadow-cyber-blue/10 group-hover:border-cyber-blue transition-colors">
              <Shield className="w-5 h-5 text-cyber-blue" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyber-blue animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-wider font-mono text-slate-100 group-hover:text-cyber-blue transition-colors">
                  VERILENS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-cyan">
                  v2.4-SEC
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-tight hidden sm:block">
                SYNTHETIC MEDIA FORENSIC SUITE
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-charcoal-900/60 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? "text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/40"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-lg bg-slate-800/90 border border-slate-700/80 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={isActive ? "text-cyber-blue" : "text-slate-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Telemetry, API Key & Demo Mode Control */}
          <div className="flex items-center gap-2.5">
            {/* API Key Modal Button */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-charcoal-900 text-xs font-mono text-slate-300 hover:border-cyber-blue/50 hover:text-cyber-cyan transition-all"
              title="Configure Hugging Face API Key"
            >
              <Key className="w-3.5 h-3.5 text-cyber-blue" />
              <span className="hidden sm:inline">API Key</span>
            </button>

            {/* Demo Mode Toggle (Failsafe) */}
            <div
              onClick={toggleDemoMode}
              className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all select-none ${
                isDemoMode
                  ? "bg-neon-red/10 border-neon-red/50 text-neon-rose shadow-lg shadow-neon-red/10 hover:border-neon-red"
                  : "bg-charcoal-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
              title="Toggle Demo Mode Presentation Failsafe (Shortcut: Ctrl+Shift+D)"
            >
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  {isDemoMode ? "DEMO MODE ON" : "DYNAMIC GEN"}
                </span>
                <span className="text-[8px] font-mono opacity-70 hidden sm:inline">
                  Ctrl+Shift+D
                </span>
              </div>
              {isDemoMode ? (
                <ToggleRight className="w-5 h-5 text-neon-red animate-pulse" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-cyber-blue" />
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-charcoal-800 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-charcoal-950 px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono ${
                  pathname === item.href
                    ? "bg-charcoal-800 text-cyber-blue font-bold border border-slate-700"
                    : "text-slate-400 hover:text-slate-100 hover:bg-charcoal-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setApiKeyModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono text-slate-300 hover:bg-charcoal-900"
            >
              <Key className="w-4 h-4 text-cyber-blue" />
              <span>Configure Hugging Face API Key</span>
            </button>
          </div>
        )}
      </header>

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </>
  );
}