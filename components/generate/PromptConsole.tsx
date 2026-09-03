"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, RefreshCw, ChevronDown, Loader2 } from "lucide-react";

const SAMPLE_PROMPTS = [
  "Indian police officer in khaki uniform, standing proudly, photorealistic",
  "Astronaut walking through a futuristic Tokyo street at night in the rain",
  "A golden retriever puppy playing in autumn leaves, DSLR photography",
  "Ancient Roman temple at sunrise, dramatic lighting, cinematic",
  "Cybersecurity analyst at multiple screens, office environment, professional",
];

const STYLE_PRESETS = [
  { label: "Photorealistic", value: "Photorealistic" },
  { label: "Cinematic", value: "Cinematic Octane 8K" },
  { label: "Cyberpunk", value: "Cyberpunk High-Tech" },
  { label: "Documentary", value: "Forensic Raw Evidence" },
  { label: "Artistic", value: "Surreal Latent Space" },
];

const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "4:3", value: "4:3" },
];

interface Props {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  generationStep: string;
}

export function PromptConsole({ onGenerate, isGenerating, generationStep }: Props) {
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [ratio, setRatio] = useState("1:1");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ prompt: prompt.trim(), negative_prompt: negative || undefined, aspect_ratio: ratio, style_preset: style });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={4}
          disabled={isGenerating}
          className="w-full px-3.5 py-3 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 resize-none transition-all"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-400 font-mono">{prompt.length} chars</span>
          <div className="flex gap-1.5">
            {SAMPLE_PROMPTS.slice(0, 2).map((p, i) => (
              <button key={i} type="button" onClick={() => setPrompt(p)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 hover:bg-brand-100 transition-colors">
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Style + Ratio row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Style</label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_PRESETS.map((s) => (
              <button key={s.value} type="button"
                onClick={() => setStyle(s.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  style === s.value
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25"
                    : "bg-white text-ink-600 border-ink-200 hover:border-brand-300 hover:text-brand-600"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Ratio</label>
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map((r) => (
              <button key={r.value} type="button"
                onClick={() => setRatio(r.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                  ratio === r.value
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-ink-600 border-ink-200 hover:border-brand-300"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced toggle */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-600 transition-colors">
        <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        Advanced options
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Negative Prompt</label>
              <input
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
                placeholder="blurry, watermark, low quality, distorted..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-ink-100/40 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <AnimatePresence>
        {isGenerating && generationStep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-100">
            <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin flex-shrink-0" />
            <span className="text-xs text-brand-700 font-medium">{generationStep}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!prompt.trim() || isGenerating}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/30"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Wand2 className="w-4 h-4" /> Generate Image</>
        )}
      </motion.button>
    </form>
  );
}