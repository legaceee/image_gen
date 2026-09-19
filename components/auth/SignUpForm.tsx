"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    setSuccess(true);
    // Auto sign in after successful registration
    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (signInRes?.ok) {
      router.push("/generate");
      router.refresh();
    } else {
      router.push("/auth/signin?registered=true");
    }
  };

  const pwStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> Account created! Signing you in...
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="text" value={form.name} onChange={set("name")} required placeholder="John Doe"
            autoComplete="name" minLength={2} maxLength={60}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com"
            autoComplete="email"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
            required placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password && (
          <div className="flex gap-1 mt-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? (pwStrength <= 1 ? "bg-rose-400" : pwStrength <= 2 ? "bg-amber-400" : pwStrength <= 3 ? "bg-brand-400" : "bg-emerald-400") : "bg-ink-200"}`} />
            ))}
          </div>
        )}
      </div>

      <motion.button type="submit" disabled={loading || success} whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account"}
      </motion.button>
    </form>
  );
}