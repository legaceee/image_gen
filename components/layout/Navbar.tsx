"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ImagePlus, ScanLine, Key, Menu, X, User, LogOut, History, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useDemoMode } from "@/components/shared/DemoModeContext";
import { ApiKeyModal } from "@/components/shared/ApiKeyModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Generate", icon: ImagePlus },
  { href: "/analyze", label: "Analyze", icon: ScanLine },
  { href: "/history", label: "History", icon: History },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [apiOpen, setApiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAuthPage = pathname.startsWith("/auth");
  if (isAuthPage) return null;

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
                <Link key={link.href} href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${pathname === link.href ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:text-ink-900 hover:bg-ink-100/60"}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Demo toggle */}
              <button onClick={toggleDemoMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isDemoMode ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-ink-200 text-ink-500 hover:text-ink-700"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? "bg-amber-500" : "bg-emerald-500"}`} />
                {isDemoMode ? "Demo" : "Live"}
              </button>

              {/* API Key */}
              <button onClick={() => setApiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-500 hover:text-brand-600 hover:border-brand-300 transition-all">
                <Key className="w-3.5 h-3.5" /> API Key
              </button>

              {/* User menu / Sign in */}
              {session?.user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ink-200 bg-white hover:border-brand-300 transition-all">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                      {session.user.image
                        ? <img src={session.user.image} alt="" className="w-5 h-5 rounded-full" />
                        : <User className="w-3 h-3 text-brand-600" />
                      }
                    </div>
                    <span className="text-xs font-medium text-ink-700 max-w-[90px] truncate">
                      {session.user.name || "Sanika Raut"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-ink-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute right-0 top-full mt-1.5 w-48 glass-card rounded-xl py-1.5 shadow-glass z-50">
                        <div className="px-3 py-2 border-b border-ink-100">
                          <p className="text-xs font-semibold text-ink-800 truncate">{session.user.name || "Sanika Raut"}</p>
                          <p className="text-[10px] text-ink-400 truncate">{session.user.email}</p>
                        </div>
                        <Link href="/history" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors">
                          <History className="w-3.5 h-3.5" /> Generation History
                        </Link>
                        <button onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/signin"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all">
                  Sign In
                </Link>
              )}
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-ink-100 bg-white/90 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${pathname === link.href ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"}`}>
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 space-y-2">
                  {session?.user ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-brand-50 rounded-lg">
                      <span className="text-sm font-medium text-ink-700">{session.user.name || session.user.email}</span>
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-rose-600 font-medium">Sign Out</button>
                    </div>
                  ) : (
                    <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                      className="block text-center px-3 py-2 rounded-lg text-sm font-semibold bg-brand-500 text-white">
                      Sign In
                    </Link>
                  )}
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