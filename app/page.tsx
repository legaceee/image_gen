"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImagePlus, ScanLine, Sparkles, Shield, ArrowRight, Zap, Lock, BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  { icon: Zap, title: "FLUX Neural Engine", desc: "Powered by FLUX.1 diffusion model. Any prompt generates a unique, high-quality image in seconds." },
  { icon: Shield, title: "Forensic Detection", desc: "Multi-vector analysis: EXIF, noise residuals, ELA error maps, and Fourier spectrum banding." },
  { icon: Lock, title: "No Account Needed", desc: "Works out of the box — no login, no usage limits. Optionally connect your Hugging Face token." },
  { icon: BarChart3, title: "Detailed Reports", desc: "Export full forensic certificates as JSON or printable PDF for academic and professional use." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            CS Final Year Capstone
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 tracking-tight leading-tight"
        >
          AI Image{" "}
          <span className="bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-transparent">
            Generation
          </span>
          {" "}&{" "}
          <span className="bg-gradient-to-r from-rose-500 to-brand-500 bg-clip-text text-transparent">
            Detection
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto text-ink-500 text-lg leading-relaxed"
        >
          Generate photorealistic images from any text prompt, then verify whether any image is AI-generated or authentic using forensic analysis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/30 transition-all duration-200"
          >
            <ImagePlus className="w-4 h-4" />
            Generate an Image
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-ink-200 hover:border-brand-300 text-ink-700 hover:text-brand-600 font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
          >
            <ScanLine className="w-4 h-4" />
            Analyze an Image
          </Link>
        </motion.div>
      </section>

      {/* Module Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Link href="/generate" className="block h-full">
            <GlassCard hover className="p-6 h-full space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <ImagePlus className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="font-bold text-ink-900 text-xl mb-1">Neural Synthesis Studio</h2>
                <p className="text-ink-500 text-sm leading-relaxed">
                  Enter any text prompt and the FLUX diffusion model will synthesize a unique, photorealistic image. Choose aspect ratio, style presets, and download the result.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["FLUX.1 Model", "Style Presets", "HD Download", "Instant Results"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-medium">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-brand-600 text-sm font-semibold group-hover:gap-2 transition-all">
                Open Studio <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <Link href="/analyze" className="block h-full">
            <GlassCard hover className="p-6 h-full space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <ScanLine className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="font-bold text-ink-900 text-xl mb-1">Forensic Integrity Analyzer</h2>
                <p className="text-ink-500 text-sm leading-relaxed">
                  Upload any image — photo or AI-generated — and receive a forensic breakdown of 6 detection vectors including ELA, Fourier analysis, and sensor noise residuals.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ELA Analysis", "Fourier Spectrum", "PRNU Residuals", "JSON Export"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-medium">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-rose-600 text-sm font-semibold group-hover:gap-2 transition-all">
                Open Analyzer <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-center text-xl font-bold text-ink-900 mb-6">What&apos;s inside</h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={item}>
              <GlassCard className="p-5 h-full space-y-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-800 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pipeline */}
      <section>
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-center text-lg font-bold text-ink-900 mb-6">Detection Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "01", label: "Upload Image", sub: "Drag & drop or select file" },
              { step: "02", label: "SHA-256 Hash", sub: "Fingerprint & metadata extraction" },
              { step: "03", label: "Multi-Vector Analysis", sub: "ELA, PRNU, FFT, pixel lattice" },
              { step: "04", label: "AI Probability Score", sub: "0–100% synthetic likelihood" },
            ].map(({ step, label, sub }, i) => (
              <div key={step} className="relative text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-brand-500 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm shadow-brand-500/30">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-ink-800 text-sm">{label}</p>
                  <p className="text-xs text-ink-400 leading-snug mt-0.5">{sub}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-[40%] border-t border-dashed border-brand-200" />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}