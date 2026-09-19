"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Props { token: string; }

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Reset failed"); return; }

    setDone(true);
    setTimeout(() => router.push("/auth/signin?reset=true"), 2000);
  };

  if (done) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-ink-900">Password updated!</p>
        <p className="text-sm text-ink-500">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
            required placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
            required placeholder="Re-enter new password" autoComplete="new-password"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
        </div>
      </div>
      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Set New Password"}
      </motion.button>
    </form>
  );
}