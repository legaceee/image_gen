"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ImagePlus, ScanLine, Key, Menu, X } from "lucide-react";
import { useDemoMode } from "@/components/shared/DemoModeContext";
import { ApiKeyModal } from "@/components/shared/ApiKeyModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Generate", icon: ImagePlus },
  { href: "/analyze", label: "Analyze", icon: ScanLine },
];

export function Navbar() {
  const pathname = usePathname();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [apiOpen, setApiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-ink-900 text-sm tracking-tight">AI Image Suite</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${pathname === link.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-100/60"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Demo toggle */}
              <button
                onClick={toggleDemoMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isDemoMode
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-white border-ink-200 text-ink-500 hover:text-ink-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? "bg-amber-500" : "bg-emerald-500"}`} />
                {isDemoMode ? "Demo" : "Live"}
              </button>

              {/* API Key */}
              <button
                onClick={() => setApiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-500 hover:text-brand-600 hover:border-brand-300 transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                API Key
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-100" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-ink-100 bg-white/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${pathname === link.href ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"}`}>
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 flex gap-2">
                  <button onClick={() => { toggleDemoMode(); setMenuOpen(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-1 text-center ${isDemoMode ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-ink-200 text-ink-500"}`}>
                    {isDemoMode ? "Demo Mode" : "Live Mode"}
                  </button>
                  <button onClick={() => { setApiOpen(true); setMenuOpen(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-500 flex-1 text-center">
                    API Key
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <ApiKeyModal isOpen={apiOpen} onClose={() => setApiOpen(false)} />
    </>
  );
}