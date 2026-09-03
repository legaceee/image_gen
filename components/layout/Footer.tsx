import React from "react";
import { Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white/50 backdrop-blur-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-ink-700">AI Image Suite</span>
          </div>
          <p className="text-xs text-ink-400 text-center">
            Final-Year Capstone — Computer Science · Text-to-Image Generation & Synthetic Media Verification
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-400 font-mono">C2PA</span>
            <span className="text-xs text-ink-400 font-mono">PRNU</span>
            <span className="text-xs text-ink-400 font-mono">ELA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}