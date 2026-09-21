"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Coins, CheckCircle, AlertCircle, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TokenQuotaBadge() {
  const [data, setData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuota = async () => {
    setLoading(true);
    try {
      let clientToken = "";
      try { clientToken = localStorage.getItem("forensic_hf_api_key") || ""; } catch {}
      const res = await fetch("/api/tokens", {
        headers: { "x-hf-token": clientToken },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const isHfActive = data?.huggingFace?.valid;
  const hfPlan = data?.huggingFace?.plan || "Free Community";
  const totalCount = data?.stats?.totalGenerated ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white hover:border-brand-300 text-ink-700 transition-all shadow-sm"
      >
        <Coins className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold">{isHfActive ? "HF Token Active" : "Free Cloud Engine"}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
          Unlimited
        </span>
        <ChevronDown className="w-3 h-3 text-ink-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-card p-4 shadow-xl z-50 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-2">
              <span className="font-bold text-ink-900">API Tokens & Quota</span>
              <span className="text-[10px] text-ink-400 font-mono">{loading ? "Refreshing..." : "Live Status"}</span>
            </div>

            {/* Hugging Face Status */}
            <div className="p-2.5 rounded-xl bg-ink-50/60 border border-ink-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-700">Hugging Face Token</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isHfActive
                      ? "bg-emerald-100 text-emerald-800"
                      : data?.huggingFace?.configured
                      ? "bg-rose-100 text-rose-800"
                      : "bg-ink-200 text-ink-600"
                  }`}
                >
                  {isHfActive ? "Connected" : data?.huggingFace?.configured ? "Auth Error" : "Optional"}
                </span>
              </div>
              <p className="text-[11px] text-ink-500">
                {isHfActive
                  ? `User: ${data.huggingFace.username} (${hfPlan})`
                  : data?.huggingFace?.error || "Using built-in high-speed diffusion fallback."}
              </p>
            </div>

            {/* Free Diffusion Engine */}
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-emerald-900">High-Speed Engine</span>
                <span className="text-[10px] font-bold text-emerald-700">100% Free</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Zero rate limits. Uses professional prompt expansion to deliver Midjourney & Gemini-tier realism.
              </p>
            </div>

            {/* User Lifetime Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-white border border-ink-100 text-center">
                <p className="text-[10px] text-ink-400">Total Generated</p>
                <p className="text-sm font-bold text-ink-800 font-mono">{totalCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-ink-100 text-center">
                <p className="text-[10px] text-ink-400">Today</p>
                <p className="text-sm font-bold text-brand-600 font-mono">{data?.stats?.generatedToday ?? 0}</p>
              </div>
            </div>

            <button
              onClick={() => { fetchQuota(); setIsOpen(false); }}
              className="w-full py-1.5 rounded-lg text-center font-medium text-[11px] text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}