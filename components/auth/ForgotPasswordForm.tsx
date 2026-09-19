"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError("Request failed. Please try again.");
  };

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-ink-900">Check your email</p>
        <p className="text-sm text-ink-500">If <strong>{email}</strong> has an account, a reset link has been sent. Check your spam folder too.</p>
        <p className="text-xs text-ink-400">The link expires in 1 hour.</p>
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
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="sanika.raut@example.com"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
        </div>
      </div>
      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
      </motion.button>
    </form>
  );
}