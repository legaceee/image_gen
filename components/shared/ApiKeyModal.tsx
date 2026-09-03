"use client";

import React, { useState, useEffect } from "react";
import { Key, Check, ShieldCheck, X, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { CyberButton } from "../ui/CyberButton";
import { useToast } from "./ToastContext";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("forensic_hf_api_key");
      if (stored) {
        setSavedKey(stored);
        setKey(stored);
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = key.trim();
    try {
      if (trimmed) {
        localStorage.setItem("forensic_hf_api_key", trimmed);
        setSavedKey(trimmed);
        toast({
          type: "success",
          title: "API KEY CONFIGURED",
          message: "Hugging Face Inference token saved for text-to-image and detection.",
        });
      } else {
        localStorage.removeItem("forensic_hf_api_key");
        setSavedKey(null);
        toast({
          type: "info",
          title: "API KEY REMOVED",
          message: "Switched to Built-In Free Real AI Generation Engine.",
        });
      }
    } catch {}
    onClose();
  };

  const handleClear = () => {
    setKey("");
    try {
      localStorage.removeItem("forensic_hf_api_key");
      setSavedKey(null);
    } catch {}
    toast({
      type: "info",
      title: "DEFAULTING TO ZERO-AUTH AI ENGINE",
      message: "Free dynamic AI text-to-image generation is active.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-charcoal-950 p-6 shadow-2xl space-y-5 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-cyber-blue/40 text-cyber-blue">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wide">
              API Credentials & Cloud Engine
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Configure Hugging Face access or run on the built-in free AI generation engine.
            </p>
          </div>
        </div>

        {/* Free mode callout */}
        <div className="p-3.5 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-sans text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-mono font-bold text-cyber-cyan text-[11px] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Config Dynamic Mode (Active)</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Even without an API key, our built-in engine dynamically generates a real, unique AI image from your text prompts.
          </p>
        </div>

        {/* Hugging Face Token input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <label className="text-slate-300 font-bold">Hugging Face Access Token (Optional)</label>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-cyber-blue hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Get Free Token</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-charcoal-900 border border-slate-800 focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none"
          />

          <p className="text-[10px] font-mono text-slate-500">
            {savedKey
              ? `Currently configured: ${savedKey.substring(0, 6)}...${savedKey.substring(savedKey.length - 4)}`
              : "No custom token provided — using free built-in inference."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          {savedKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-mono text-neon-rose hover:underline"
            >
              Clear Saved Token
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <CyberButton variant="outline" size="sm" onClick={onClose}>
              Cancel
            </CyberButton>
            <CyberButton variant="primary" size="sm" onClick={handleSave}>
              Save Settings
            </CyberButton>
          </div>
        </div>
      </div>
    </div>
  );
}