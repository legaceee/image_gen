"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, ShieldAlert, Info } from "lucide-react";
import { PromptConsole } from "@/components/generate/PromptConsole";
import { ImageCanvas } from "@/components/generate/ImageCanvas";
import { GlassCard } from "@/components/ui/GlassCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { useToast } from "@/components/shared/ToastContext";
import { useDemoMode } from "@/components/shared/DemoModeContext";
import { sleep } from "@/lib/utils";

export default function GeneratePage() {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    "/samples/synthetic_portrait.svg"
  );
  const [metadata, setMetadata] = useState<any>({
    prompt: "Cybernetic biometric analysis chamber, volumetric neon electric blue lighting, holographic forensic monitors, 8k hyperrealistic render",
    model: "Black Forest Labs FLUX.1-schnell",
    seed: 409281,
    aspectRatio: "1:1",
    latencyMs: 1420,
    stylePreset: "Photorealistic",
  });

  const handleGenerate = async (params: {
    prompt: string;
    negative_prompt?: string;
    aspect_ratio: string;
    style_preset: string;
    seed?: number;
    guidance_scale?: number;
  }) => {
    setIsGenerating(true);
    setGenerationStep("Tokenizing textual prompt vectors...");

    // Progressive step status animation
    const stepTimer = setTimeout(() => {
      setGenerationStep("Executing latent flow-matching diffusion...");
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep("Sampling Euler ancestral trajectory...");
    }, 1200);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          isDemo: isDemoMode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Generation request failed");
      }

      setGeneratedImage(data.imageBase64);
      setMetadata(data.metadata);

      if (data.isFallback || data.isDemo) {
        toast({
          type: "info",
          title: "SYNTHESIS RENDERED (BENCHMARK)",
          message: data.message || "Rendered calibrated latent sample.",
        });
      } else {
        toast({
          type: "success",
          title: "LIVE SYNTHESIS COMPLETE",
          message: `Model: ${data.metadata?.model || "Hugging Face Inference"} completed in ${data.metadata?.latencyMs || 1500}ms.`,
        });
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: "SYNTHESIS FAILED",
        message: err.message || "Failed to reach inference pipeline",
      });
    } finally {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyber-blue" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyber-cyan">
              MODULE 01: GENERATIVE SUBSYSTEM
            </span>
          </div>
          <h1 className="text-3xl font-black font-mono tracking-tight text-slate-100">
            Neural Synthesis Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Direct interface to state-of-the-art diffusion models (FLUX.1-schnell & SDXL) with instant forensic auditing bridge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TelemetryBadge
            label="PIPELINE"
            value="FLUX.1 / SDXL"
            variant="cyber"
          />
          <TelemetryBadge
            label="STATUS"
            value={isDemoMode ? "DEMO MODE" : "LIVE HF"}
            variant={isDemoMode ? "threat" : "authentic"}
            pulse={!isDemoMode}
          />
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Console */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard variant="default" className="p-6">
            <PromptConsole
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generationStep={generationStep}
            />
          </GlassCard>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-charcoal-900/40 border border-slate-800/80 flex items-start gap-3 text-xs font-sans text-slate-400">
            <Info className="w-4 h-4 text-cyber-blue flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-slate-300">Academic Note: </span>
              Generated outputs are tagged with synthetic latents. Once rendered, click the glowing{" "}
              <strong className="text-neon-rose font-mono">"Test Integrity Now"</strong> button to observe how our multi-vector analyzer detects sub-pixel deconvolution grid patterns and stripped EXIF.
            </div>
          </div>
        </div>

        {/* Right Column: High-Tech Viewport Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <ImageCanvas
            imageUrl={generatedImage}
            isGenerating={isGenerating}
            metadata={metadata}
          />
        </div>
      </div>
    </div>
  );
}
