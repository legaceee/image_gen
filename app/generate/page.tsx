"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, ShieldAlert, Info, Key } from "lucide-react";
import { PromptConsole } from "@/components/generate/PromptConsole";
import { ImageCanvas } from "@/components/generate/ImageCanvas";
import { GlassCard } from "@/components/ui/GlassCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { ApiKeyModal } from "@/components/shared/ApiKeyModal";
import { useToast } from "@/components/shared/ToastContext";
import { useDemoMode } from "@/components/shared/DemoModeContext";
import { sleep } from "@/lib/utils";

export default function GeneratePage() {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    "/samples/synthetic_portrait.svg"
  );
  const [metadata, setMetadata] = useState<any>({
    prompt: "Cybernetic biometric analysis chamber, volumetric neon electric blue lighting, holographic forensic monitors, 8k hyperrealistic render",
    model: "Neural Latent Diffusion Synthesizer",
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
      setGenerationStep("Conditioning latent diffusion trajectory...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep("Executing reverse denoising steps...");
    }, 2800);

    const stepTimer3 = setTimeout(() => {
      setGenerationStep("Decoding high-resolution RGB canvas...");
    }, 4500);

    try {
      let clientToken = "";
      try {
        clientToken = localStorage.getItem("forensic_hf_api_key") || "";
      } catch {}

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

      toast({
        type: "success",
        title: "IMAGE SYNTHESIS COMPLETE",
        message: data.message || `Rendered from text prompt: "${params.prompt.substring(0, 45)}..."`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "SYNTHESIS FAILED",
        message: err.message || "Failed to reach inference pipeline",
      });
    } finally {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
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
            Dynamic Text-to-Image Generation engine with instant forensic auditing bridge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-charcoal-900 text-xs font-mono text-slate-300 hover:border-cyber-blue/50 hover:text-cyber-cyan transition-all"
            title="Configure Hugging Face API Key"
          >
            <Key className="w-3.5 h-3.5 text-cyber-blue" />
            <span>API Key</span>
          </button>

          <TelemetryBadge
            label="STATUS"
            value={isDemoMode ? "OFFLINE DEMO" : "DYNAMIC AI"}
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
              <span className="font-mono font-bold text-slate-300">Live Synthesis: </span>
              Type any creative text prompt and click <strong className="text-cyber-cyan font-mono">"EXECUTE NEURAL SYNTHESIS"</strong> to generate a custom image. Once generated, click the glowing{" "}
              <strong className="text-neon-rose font-mono">"Test Integrity Now"</strong> button to send the new image directly to DeepForensics for multi-spectral analysis.
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

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
}