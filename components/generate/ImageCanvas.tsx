"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  SearchCheck,
  Maximize2,
  Sparkles,
  Cpu,
  Clock,
  Scan,
} from "lucide-react";
import { CyberButton } from "../ui/CyberButton";
import { useToast } from "../shared/ToastContext";

interface ImageCanvasProps {
  imageUrl: string | null;
  isGenerating: boolean;
  metadata?: {
    prompt: string;
    model: string;
    seed: number;
    aspectRatio: string;
    latencyMs: number;
    stylePreset?: string;
  } | null;
}

export function ImageCanvas({
  imageUrl,
  isGenerating,
  metadata,
}: ImageCanvasProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleTestIntegrity = () => {
    if (!imageUrl) return;

    try {
      // Store in sessionStorage so /analyze picks it up immediately
      sessionStorage.setItem("pending_forensic_image", imageUrl);
      sessionStorage.setItem(
        "pending_forensic_meta",
        JSON.stringify({
          fileName: "neural_synthesis_output.png",
          prompt: metadata?.prompt || "Neural Latent Generation",
          model: metadata?.model || "FLUX.1-schnell",
        })
      );
    } catch {
      // Fallback
    }

    toast({
      type: "threat",
      title: "TRANSFERRING TO FORENSIC ENGINE",
      message: "Target dispatched to DeepForensics suite for multi-spectral verification.",
    });

    router.push("/analyze?source=neural_generator");
  };

  const handleCopyPrompt = () => {
    if (!metadata?.prompt) return;
    navigator.clipboard.writeText(metadata.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      type: "info",
      title: "PROMPT COPIED",
      message: "Prompt string copied to system clipboard.",
    });
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `neural-synthesis-${metadata?.seed || "sample"}.png`;
    a.click();
    toast({
      type: "success",
      title: "MEDIA DOWNLOADED",
      message: "Saved generated canvas locally.",
    });
  };

  return (
    <div className="space-y-4">
      {/* High-Tech Forensic Viewport Frame */}
      <div className="relative rounded-2xl border border-slate-800 bg-charcoal-950 overflow-hidden min-h-[460px] flex items-center justify-center p-4">
        {/* Ambient background grid & scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Viewport HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyber-blue pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyber-blue pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyber-blue pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyber-blue pointer-events-none" />

        {/* Top Viewport Telemetry Bar */}
        <div className="absolute top-3 inset-x-12 flex items-center justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
          <span className="flex items-center gap-1">
            <Scan className="w-3 h-3 text-cyber-blue" />
            CANVAS: ACTIVE VIEWPORT
          </span>
          <span className="hidden sm:inline text-cyber-cyan">
            {metadata ? `SEED #${metadata.seed}` : "AWAITING INFERENCE"}
          </span>
        </div>

        {/* Loading State or Image Display */}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-2 border-t-cyber-blue border-r-cyber-cyan border-b-cyber-indigo border-l-transparent animate-spin" />
              <Sparkles className="w-8 h-8 text-cyber-blue absolute animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                Sampling Diffusion Tensors
              </h4>
              <p className="text-xs text-slate-400 font-sans max-w-xs">
                Computing reverse diffusion denoising trajectory in multi-dimensional latent space...
              </p>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="relative max-h-[460px] max-w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Neural synthesis output"
              className="max-h-[440px] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/80"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
            <Cpu className="w-12 h-12 text-slate-700" />
            <p className="text-xs font-mono">NEURAL CANVAS IDLE</p>
            <p className="text-xs text-slate-600 max-w-xs">
              Configure your prompt parameters on the console to execute high-fidelity image synthesis.
            </p>
          </div>
        )}
      </div>

      {/* Action Controls & Bridge Bar */}
      {imageUrl && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Direct Bridge: "Test Integrity" Button */}
          <div className="p-4 rounded-2xl bg-charcoal-900/90 border border-neon-red/40 shadow-xl shadow-neon-red/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-red/10 border border-neon-red/30">
                <ShieldAlert className="w-6 h-6 text-neon-red animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                  <span>DISPATCH TO DEEPFORENSICS</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-red/20 text-neon-rose border border-neon-red/30">
                    DIRECT BRIDGE
                  </span>
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Evaluate whether this newly generated output bypasses or triggers forensic detection vectors.
                </p>
              </div>
            </div>

            <CyberButton
              type="button"
              variant="threat"
              size="md"
              onClick={handleTestIntegrity}
              icon={<SearchCheck className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Test Integrity Now
            </CyberButton>
          </div>

          {/* Metadata & Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-charcoal-900/60 border border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              {metadata?.model && (
                <span className="text-slate-300">
                  MODEL: <strong className="text-cyber-cyan">{metadata.model.split(" ")[0]}</strong>
                </span>
              )}
              {metadata?.latencyMs && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyber-blue" />
                  {metadata.latencyMs}ms
                </span>
              )}
              {metadata?.aspectRatio && <span>RATIO: {metadata.aspectRatio}</span>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrompt}
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                title="Copy prompt"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-matrix-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Prompt"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                title="Download image"
              >
                <Download className="w-3.5 h-3.5 text-cyber-blue" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
