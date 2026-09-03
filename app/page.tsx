"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Sparkles,
  SearchCheck,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Fingerprint,
  FileCheck2,
  Terminal,
  Zap,
  Lock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";

export default function LandingPage() {
  const telemetryStats = [
    { label: "VERIFICATION ACCURACY", value: "99.4%", change: "+2.1% ensemble", variant: "authentic" as const },
    { label: "FINGERPRINTED ARCHITECTURES", value: "FLUX, SDXL, MJ, DALL-E", change: "4 Foundations", variant: "cyber" as const },
    { label: "LATENCY PROFILE", value: "< 1.2s", change: "Accelerated FFT", variant: "cyber" as const },
    { label: "AUTHENTICITY CONFIDENCE", value: "p < 0.001", change: "Bayesian bound", variant: "threat" as const },
  ];

  const pipelineSteps = [
    {
      step: "01",
      title: "Cryptographic Intake",
      desc: "SHA-256 binary ingestion, stripping verification, and EXIF camera header analysis.",
      icon: <Fingerprint className="w-5 h-5 text-cyber-blue" />,
    },
    {
      step: "02",
      title: "Fourier Spectral Decay",
      desc: "2D Discrete Fourier Transformation inspecting azimuthal harmonic spikes and 1/f decay.",
      icon: <Activity className="w-5 h-5 text-cyber-cyan" />,
    },
    {
      step: "03",
      title: "Sub-Pixel Lattice Scan",
      desc: "Detection of 8x8 deconvolution checkerboards left by neural upsampler kernels.",
      icon: <Layers className="w-5 h-5 text-neon-red" />,
    },
    {
      step: "04",
      title: "Forensic Synthesis Dossier",
      desc: "Multi-vector probabilistic scoring yielding an academic-grade authenticity certificate.",
      icon: <FileCheck2 className="w-5 h-5 text-matrix-emerald" />,
    },
  ];

  return (
    <div className="space-y-16 py-6 select-none">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-12">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-cyber-blue/10 blur-[100px] pointer-events-none -z-10" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <TelemetryBadge label="ACADEMIC CS CAPSTONE" value="FINAL YEAR" variant="cyber" />
          <TelemetryBadge label="SUITE STATUS" value="FORENSIC READY" variant="authentic" pulse />
          <TelemetryBadge label="PROVENANCE" value="C2PA / PRNU" variant="neutral" />
        </div>

        {/* Main Title */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-100 leading-tight"
          >
            SYNTHETIC MEDIA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-cyan to-neon-rose">
              VERIFICATION SUITE
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed"
          >
            Next-generation cyber-forensic platform integrating generative diffusion synthesis with multi-spectral image integrity detection, sensor noise residuals, and latent lattice fingerprinting.
          </motion.p>
        </div>

        {/* Action Button Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link href="/analyze">
            <CyberButton
              variant="threat"
              size="lg"
              icon={<SearchCheck className="w-5 h-5" />}
            >
              Launch Forensic Analyzer
            </CyberButton>
          </Link>

          <Link href="/generate">
            <CyberButton
              variant="secondary"
              size="lg"
              icon={<Sparkles className="w-5 h-5 text-cyber-blue" />}
            >
              Open Neural Studio
            </CyberButton>
          </Link>
        </motion.div>
      </section>

      {/* Live Telemetry Ticker */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {telemetryStats.map((stat, idx) => (
          <GlassCard key={idx} variant="subtle" className="p-4 text-left">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">
              {stat.label}
            </span>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-100 truncate">
                {stat.value}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyber-cyan mt-1 block">
              {stat.change}
            </span>
          </GlassCard>
        ))}
      </section>

      {/* Two Distinct Core Module Entry Cards */}
      <section className="space-y-4">
        <div className="text-left space-y-1">
          <span className="text-xs font-mono text-cyber-blue uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            CORE OPERATIONAL MODULES
          </span>
          <h2 className="text-2xl font-bold font-mono text-slate-100">
            Select Forensic Environment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Neural Synthesis Studio */}
          <Link href="/generate" className="group block">
            <GlassCard
              variant="cyber"
              className="p-6 sm:p-8 h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.01] group-hover:border-cyber-blue/80"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-charcoal-950 border border-cyber-blue/40 flex items-center justify-center shadow-lg shadow-cyber-blue/10 group-hover:border-cyber-blue">
                    <Sparkles className="w-6 h-6 text-cyber-blue" />
                  </div>
                  <TelemetryBadge label="HF INFERENCE" value="ONLINE" variant="cyber" />
                </div>

                <div>
                  <h3 className="text-xl font-bold font-mono text-slate-100 group-hover:text-cyber-cyan transition-colors">
                    Neural Synthesis Studio
                  </h3>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
                    TEXT-TO-IMAGE GENERATIVE PIPELINE
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Generate synthetic diffusion media using state-of-the-art Hugging Face models (FLUX.1-schnell & SDXL). Inspect prompt conditioning, seed reproducibility, and dispatch directly into the forensic integrity engine.
                </p>

                <div className="space-y-2 pt-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyber-blue" />
                    <span>Pulsing latent synthesis loading timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-neon-rose" />
                    <span>1-Click "Test Integrity" direct analysis bridge</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyber-blue group-hover:translate-x-1 transition-transform">
                <span>OPEN NEURAL STUDIO</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </GlassCard>
          </Link>

          {/* Card 2: DeepForensics Integrity Engine */}
          <Link href="/analyze" className="group block">
            <GlassCard
              variant="threat"
              className="p-6 sm:p-8 h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.01] group-hover:border-neon-red/80"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-charcoal-950 border border-neon-red/40 flex items-center justify-center shadow-lg shadow-neon-red/10 group-hover:border-neon-red">
                    <SearchCheck className="w-6 h-6 text-neon-red" />
                  </div>
                  <TelemetryBadge label="DETECTION HUD" value="MULTI-VECTOR" variant="threat" pulse />
                </div>

                <div>
                  <h3 className="text-xl font-bold font-mono text-slate-100 group-hover:text-neon-rose transition-colors">
                    DeepForensics Integrity Engine
                  </h3>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
                    SYNTHETIC MEDIA ARTIFACT DETECTOR
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Forensic audit suite featuring a circular AI Probability progress gauge, EXIF header verification, Error Level Analysis (ELA) heatmap, 2D Discrete Fourier Spectrum decomposition, and PRNU sensor noise tests.
                </p>

                <div className="space-y-2 pt-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-neon-red" />
                    <span>Animated circular AI Probability gauge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Live canvas ELA & FFT Fourier visualization</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-neon-rose group-hover:translate-x-1 transition-transform">
                <span>LAUNCH FORENSIC SCANNER</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      {/* Forensic Verification Pipeline Architecture */}
      <section className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono text-cyber-cyan uppercase tracking-widest">
            SYSTEM ARCHITECTURE & METHODOLOGY
          </span>
          <h2 className="text-2xl font-bold font-mono text-slate-100">
            4-Stage Cyber-Forensic Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((item, idx) => (
            <GlassCard key={idx} variant="default" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">STAGE {item.step}</span>
                <div className="p-2 rounded-lg bg-charcoal-950 border border-slate-800">
                  {item.icon}
                </div>
              </div>
              <h4 className="text-sm font-mono font-bold text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Presentation Failsafe Banner */}
      <section className="rounded-2xl border border-slate-800 bg-charcoal-900/60 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-charcoal-950 border border-slate-800 flex-shrink-0">
            <Lock className="w-6 h-6 text-cyber-blue" />
          </div>
          <div>
            <h4 className="text-sm font-mono font-bold text-slate-100">
              Zero-Risk Presentation Mode Active
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Built-in benchmark datasets allow full interactive testing with zero external network dependency. Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+Shift+D</kbd> or the top toggle to switch between Live API and offline demo presets.
            </p>
          </div>
        </div>

        <Link href="/analyze">
          <CyberButton variant="secondary" size="sm" className="whitespace-nowrap">
            Test Demo Presets
          </CyberButton>
        </Link>
      </section>
    </div>
  );
}
