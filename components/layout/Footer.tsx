"use client";

import React from "react";
import Link from "next/link";
import { Shield, GitFork, Cpu, Award, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-charcoal-950/90 text-slate-400 font-sans text-xs py-10 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#00f0ff05,transparent_50%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/60">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-blue" />
              <span className="text-sm font-mono font-bold text-slate-200 tracking-wider">
                VERILENS FORENSIC AI SUITE
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A state-of-the-art synthetic media verification and generation research platform.
              Investigating deep generative model fingerprinting, discrete Fourier anomalies,
              sub-pixel deconvolution lattices, and hardware PRNU integrity.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                Next.js 14 App Router
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                Hugging Face Inference API
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                Framer Motion
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                Tailwind CSS
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Core Modules
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-cyber-blue transition-colors">
                  System Overview
                </Link>
              </li>
              <li>
                <Link href="/generate" className="hover:text-cyber-blue transition-colors">
                  Neural Synthesis Studio
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="hover:text-cyber-blue transition-colors">
                  DeepForensics Integrity Engine
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  C2PA Provenance Manifest (v2.1)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Academic Compliance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-cyber-blue" />
                <span>CS Capstone Research Project</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-matrix-emerald" />
                <span>Zero-Retention Image Policy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Client & Server Heuristics</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <p>© 2026 Synthetic Media Verification Suite. Final-Year Computer Science Capstone.</p>
          <div className="flex items-center gap-4">
            <span className="text-matrix-emerald flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-matrix-emerald animate-ping" />
              FORENSIC TELEMETRY ACTIVE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
