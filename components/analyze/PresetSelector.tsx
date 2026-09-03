"use client";

import React from "react";
import { Bot, Camera } from "lucide-react";

interface Props {
  onSelect: (preset: "synthetic" | "authentic") => void;
  disabled?: boolean;
}

export function PresetSelector({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Quick Demo Presets</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelect("synthetic")}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Bot className="w-3.5 h-3.5 flex-shrink-0" />
          <div className="text-left">
            <p>FLUX Portrait</p>
            <p className="font-mono font-normal text-rose-500">~98% AI</p>
          </div>
        </button>
        <button
          onClick={() => onSelect("authentic")}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5 flex-shrink-0" />
          <div className="text-left">
            <p>Canon EOS R5</p>
            <p className="font-mono font-normal text-emerald-600">~4% AI</p>
          </div>
        </button>
      </div>
    </div>
  );
}