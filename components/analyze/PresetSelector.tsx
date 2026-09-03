"use client";

import React from "react";
import { Sparkles, ShieldCheck, ShieldAlert, Cpu } from "lucide-react";
import { DEMO_PRESETS, DemoPreset } from "@/lib/mockData";

interface PresetSelectorProps {
  onSelectPreset: (preset: DemoPreset) => void;
  activePresetId?: string | null;
  isAnalyzing?: boolean;
}

export function PresetSelector({
  onSelectPreset,
  activePresetId,
  isAnalyzing = false,
}: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyber-blue" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Rapid Demonstration Presets (Offline Academic Verification)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-neon-rose uppercase tracking-widest hidden sm:inline">
          1-CLICK EVALUATION
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEMO_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isSynthetic = preset.report.aiProbability >= 50;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={isAnalyzing}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${
                isActive
                  ? isSynthetic
                    ? "bg-neon-red/10 border-neon-red shadow-lg shadow-neon-red/10"
                    : "bg-matrix-emerald/10 border-matrix-emerald shadow-lg shadow-matrix-emerald/10"
                  : "bg-charcoal-900/60 border-slate-800 hover:border-slate-700 hover:bg-charcoal-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700/80 bg-charcoal-950 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.imagePath}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-100 line-clamp-1">
                      {preset.title.split(":")[1] || preset.title}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.report.suspectedModel.split(" ")[0]}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isSynthetic
                      ? "bg-neon-red/15 border border-neon-red/40 text-neon-rose"
                      : "bg-matrix-emerald/15 border border-matrix-emerald/40 text-matrix-emerald"
                  }`}
                >
                  {isSynthetic ? <ShieldAlert className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                  {preset.badge}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
