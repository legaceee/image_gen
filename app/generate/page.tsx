"use client";

import React, { useState } from "react";
import { Sparkles, Info, Key, Zap } from "lucide-react";
import { PromptConsole } from "@/components/generate/PromptConsole";
import { ImageCanvas } from "@/components/generate/ImageCanvas";
import { GlassCard } from "@/components/ui/GlassCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { ApiKeyModal } from "@/components/shared/ApiKeyModal";
import { useToast } from "@/components/shared/ToastContext";
import { useDemoMode } from "@/components/shared/DemoModeContext";

export default function GeneratePage() {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const STEPS = [
    "Tokenizing textual prompt into latent embeddings...",
    "Conditioning diffusion trajectory on semantic tokens...",
    "Executing reverse denoising through latent space...",
    "Sampling FLUX Euler trajectory (28 steps)...",
    "Decoding high-resolution RGB canvas...",
    "Finalizing synthesis output...",
  ];

  const handleGenerate = async (params: {
    prompt: string;
    negative_prompt?: string;
    aspect_ratio: string;
    style_preset: string;
    seed?: number;
    guidance_scale?: number;
  }) => {
    setIsGenerating(true);
    setGenerationStep(STEPS[0]);
    let stepIdx = 0;

    // Rotate through realistic diffusion steps
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % STEPS.length;
      setGenerationStep(STEPS[stepIdx]);
    }, 4000);

    try {
      let clientToken = "";
      try { clientToken = localStorage.getItem("forensic_hf_api_key") || ""; } catch {}

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hf-token": clientToken,
        },
        body: JSON.stringify({
          ...params,
          isDemo: isDemoMode,
          apiKey: clientToken,
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
          type: "warning",
          title: "OFFLINE BENCHMARK DISPLAYED",
          message: data.message || "Network unavailable — showing calibrated sample.",
        });
      } else {
        toast({
          type: "success",
          title: "IMAGE SYNTHESIS COMPLETE",
          message: `Generated via ${data.provider === "huggingface" ? "Hugging Face FLUX" : "FLUX Neural Engine"} in ${data.metadata?.latencyMs}ms.`,
        });
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: "SYNTHESIS FAILED",
        message: err.message || "Failed to reach inference pipeline",
      });
    } finally {
      clearInterval(stepInterval);
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
            Type any prompt to generate a real AI image. No API key required. Optionally configure Hugging Face for direct model access.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-charcoal-900 text-xs font-mono text-slate-300 hover:border-cyber-blue/50 hover:text-cyber-cyan transition-all"
          >
            <Key className="w-3.5 h-3.5 text-cyber-blue" />
            <span>HF API Key</span>
          </button>
          <TelemetryBadge
            label="ENGINE"
            value={isDemoMode ? "OFFLINE DEMO" : "FLUX LIVE"}
            variant={isDemoMode ? "threat" : "authentic"}
            pulse={!isDemoMode}
          />
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Console */}
        <div className="lg:col-span-6 space-y-5">
          <GlassCard variant="default" className="p-6">
            <PromptConsole
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generationStep={generationStep}
            />
          </GlassCard>

          {/* How it works info box */}
          <div className="p-4 rounded-xl bg-charcoal-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyber-cyan">
              <Zap className="w-3.5 h-3.5" />
              HOW TEXT-TO-IMAGE WORKS
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400 font-sans leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyber-blue font-mono font-bold flex-shrink-0">1.</span>
                <span>Type a description of any image you want (e.g. <em className="text-slate-300">"indian police officer in uniform"</em>, <em className="text-slate-300">"futuristic robot city at night"</em>)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-blue font-mono font-bold flex-shrink-0">2.</span>
                <span>Click <strong className="text-cyber-cyan font-mono">"EXECUTE NEURAL SYNTHESIS"</strong>. Generation typically takes <strong className="text-slate-200">10–30 seconds</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-rose font-mono font-bold flex-shrink-0">3.</span>
                <span>Click <strong className="text-neon-rose font-mono">"Test Integrity Now"</strong> on the result to run forensic AI detection on your newly generated image.</span>
              </li>
            </ul>
            <div className="pt-1 text-[11px] font-mono text-slate-500">
              Demo Mode off = Live AI generation. Demo Mode on (Ctrl+Shift+D) = instant offline presets.
            </div>
          </div>
        </div>

        {/* Right Column: Image Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <ImageCanvas
            imageUrl={generatedImage}
            isGenerating={isGenerating}
            metadata={metadata}
          />
        </div>
      </div>

      <ApiKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  );
}