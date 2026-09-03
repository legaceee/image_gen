"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, X, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; }

export function ApiKeyModal({ isOpen, onClose }: Props) {
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try { setToken(localStorage.getItem("forensic_hf_api_key") || ""); } catch {}
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      if (token.trim()) localStorage.setItem("forensic_hf_api_key", token.trim());
      else localStorage.removeItem("forensic_hf_api_key");
    } catch {}
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const handleClear = () => {
    setToken("");
    try { localStorage.removeItem("forensic_hf_api_key"); } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card rounded-2xl p-6 m-4 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Key className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm">Hugging Face API Key</h3>
                    <p className="text-xs text-ink-400">Optional — enables FLUX direct model access</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Token input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Access Token</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-ink-100/40 border border-ink-200 text-sm font-mono text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-ink-400 leading-relaxed">
                  Get your token at{" "}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer"
                    className="text-brand-600 hover:underline">huggingface.co/settings/tokens</a>
                  {" "}(needs "Read" access). Not required — app works without it using the FLUX engine.
                </p>
              </div>

              {/* Current status */}
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                token ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-ink-100 border border-ink-200 text-ink-500"
              }`}>
                {token ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-ink-400" />}
                {token ? "Token configured — will use Hugging Face FLUX when reachable" : "No token — using FLUX via Pollinations engine (fully functional)"}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleClear}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-ink-200 bg-white text-ink-600 hover:text-rose-600 hover:border-rose-200 transition-all">
                  Clear
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all flex items-center justify-center gap-2">
                  {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Token"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}