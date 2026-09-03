"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sliders, ChevronDown, ChevronUp, Wand2, Ratio, Layers } from "lucide-react";
import { SAMPLE_PROMPTS } from "@/lib/mockData";
import { CyberButton } from "../ui/CyberButton";

interface PromptConsoleProps {
  onGenerate: (params: {
    prompt: string;
    negative_prompt?: string;
    aspect_ratio: string;
    style_preset: string;
    seed?: number;
    guidance_scale?: number;
  }) => void;
  isGenerating: boolean;
  generationStep?: string;
}

export function PromptConsole({
  onGenerate,
  isGenerating,
  generationStep,
}: PromptConsoleProps) {
  const [prompt, setPrompt] = useState(
    "Cybernetic biometric analysis chamber, volumetric neon electric blue lighting, holographic forensic monitors, 8k hyperrealistic render"
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low resolution, deformed, extra fingers, cartoon, distorted"
  );
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [stylePreset, setStylePreset] = useState("Photorealistic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  const stylePresets = [
    { label: "Photorealistic", value: "Photorealistic", icon: "📸" },
    { label: "Cyberpunk", value: "Cyberpunk High-Tech", icon: "⚡" },
    { label: "Cinematic", value: "Cinematic Octane 8K", icon: "🎬" },
    { label: "Forensic Evidence", value: "Forensic Raw Evidence", icon: "🔬" },
    { label: "Surreal Latent", value: "Surreal Latent Space", icon: "🌌" },
  ];

  const aspectRatios = [
    { label: "1:1 Square", value: "1:1", icon: "▢" },
    { label: "16:9 Landscape", value: "16:9", icon: "▭" },
    { label: "9:16 Portrait", value: "9:16", icon: "▯" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({
      prompt,
      negative_prompt: negativePrompt,
      aspect_ratio: aspectRatio,
      style_preset: stylePreset,
      seed,
      guidance_scale: guidanceScale,
    });
  };

  const handleApplySample = (sample: (typeof SAMPLE_PROMPTS)[0]) => {
    setPrompt(sample.prompt);
    if (sample.aspectRatio) setAspectRatio(sample.aspectRatio);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sample Prompt Shortcuts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-cyber-blue" />
            SYNTHESIS PROMPT PRESETS:
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">1-CLICK POPULATE</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="px-2.5 py-1 rounded-lg bg-charcoal-900 border border-slate-800 hover:border-cyber-blue/50 hover:bg-charcoal-800 text-[11px] font-mono text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span className="text-cyber-blue">#{sample.category}</span>
              <span className="text-slate-400">{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Neural Synthesis Directive
        </label>
        <div className="relative rounded-2xl border border-slate-800 bg-charcoal-900/90 focus-within:border-cyber-blue focus-within:ring-1 focus-within:ring-cyber-blue/50 transition-all p-3 shadow-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={3}
            placeholder="Describe the desired image scene with lighting, textures, and camera parameters..."
            className="w-full bg-transparent border-0 text-slate-100 text-sm font-sans placeholder:text-slate-600 focus:outline-none focus:ring-0 resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
            <span>TOKENS: ~{Math.ceil(prompt.length / 4)}</span>
            <span>{prompt.length} CHARS</span>
          </div>
        </div>
      </div>

      {/* Style & Aspect Ratio Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Style Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
            STYLE PRESET
          </label>
          <div className="flex flex-wrap gap-1.5">
            {stylePresets.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setStylePreset(style.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  stylePreset === style.value
                    ? "bg-cyber-blue/15 border border-cyber-blue text-cyber-cyan font-bold shadow-sm shadow-cyber-blue/20"
                    : "bg-charcoal-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-charcoal-800"
                }`}
              >
                <span>{style.icon}</span>
                <span>{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Ratio className="w-3.5 h-3.5 text-cyber-blue" />
            CANVAS ASPECT RATIO
          </label>
          <div className="flex gap-1.5">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setAspectRatio(ratio.value)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                  aspectRatio === ratio.value
                    ? "bg-cyber-blue/15 border border-cyber-blue text-cyber-cyan font-bold shadow-sm shadow-cyber-blue/20"
                    : "bg-charcoal-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-charcoal-800"
                }`}
              >
                <span>{ratio.icon}</span>
                <span>{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Parameters Accordion */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyber-blue transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Advanced Latent Hyperparameters</span>
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-3 p-3 rounded-xl bg-charcoal-950 border border-slate-800"
          >
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Negative Prompt (Artifact suppression)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full bg-charcoal-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyber-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Guidance Scale (CFG): {guidanceScale}</label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                  className="w-full accent-cyber-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Latent Seed (Optional)</label>
                <input
                  type="number"
                  placeholder="Random"
                  value={seed || ""}
                  onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-charcoal-900 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyber-blue"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pulsing Gradient Generation Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={`w-full relative group overflow-hidden py-4 px-6 rounded-2xl font-mono text-sm font-bold tracking-wider transition-all select-none flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isGenerating
              ? "bg-charcoal-900 border border-cyber-blue/40 text-cyber-blue"
              : "bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-indigo text-charcoal-950 shadow-xl shadow-cyber-blue/20 hover:shadow-cyber-blue/40 hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {/* Pulsing gradient backdrop animation during generation */}
          {isGenerating ? (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.2),transparent)] animate-scanline" />
              <div className="w-5 h-5 rounded-full border-2 border-cyber-blue border-t-transparent animate-spin" />
              <span className="animate-pulse">{generationStep || "Synthesizing Latent Space..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-charcoal-950 group-hover:rotate-12 transition-transform" />
              <span>EXECUTE NEURAL SYNTHESIS</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
