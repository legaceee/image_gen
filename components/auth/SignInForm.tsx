"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

interface Props { callbackUrl?: string; }

export function SignInForm({ callbackUrl = "/generate" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com" autoComplete="email"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Password</label>
          <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type={showPw ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)}
            required placeholder="••••••••" autoComplete="current-password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
      </motion.button>
    </form>
  );
}