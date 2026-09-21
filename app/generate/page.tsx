"use client";

import React, { useState } from "react";
import { ImagePlus, Key, Info } from "lucide-react";
import { PromptConsole } from "@/components/generate/PromptConsole";
import { ImageCanvas } from "@/components/generate/ImageCanvas";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ApiKeyModal } from "@/components/shared/ApiKeyModal";
import { TokenQuotaBadge } from "@/components/generate/TokenQuotaBadge";
import { useToast } from "@/components/shared/ToastContext";
import { useDemoMode } from "@/components/shared/DemoModeContext";

export default function GeneratePage() {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState("");
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const STEPS = [
    "Tokenizing prompt into latent embeddings...",
    "Conditioning diffusion trajectory...",
    "Running FLUX denoising steps...",
    "Sampling Euler trajectory...",
    "Decoding RGB canvas...",
    "Finalizing output...",
  ];

  const handleGenerate = async (params: {
    prompt: string; negative_prompt?: string; aspect_ratio: string; style_preset: string; seed?: number; guidance_scale?: number;
  }) => {
    setIsGenerating(true);
    setStep(STEPS[0]);
    let idx = 0;
    const interval = setInterval(() => { idx = (idx + 1) % STEPS.length; setStep(STEPS[idx]); }, 4000);

    try {
      let clientToken = "";
      try { clientToken = localStorage.getItem("forensic_hf_api_key") || ""; } catch {}

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-hf-token": clientToken },
        body: JSON.stringify({ ...params, isDemo: isDemoMode, apiKey: clientToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Generation failed");

      setGeneratedImage(data.imageBase64);
      setMetadata(data.metadata);
      setDiagnostics(data.diagnostics);

      toast({
        type: data.isFallback ? "warning" : "success",
        title: data.isFallback ? "OFFLINE SAMPLE" : "IMAGE GENERATED",
        message: data.isFallback
          ? (data.message || "Network unavailable — showing calibrated sample.")
          : `Synthesized in ${data.metadata?.latencyMs}ms via ${data.provider}.`,
      });
    } catch (err: any) {
      toast({ type: "error", title: "GENERATION FAILED", message: err.message || "Please try again." });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setStep("");
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ImagePlus className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Module 01</span>
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Neural Synthesis Studio</h1>
          <p className="text-sm text-ink-500 mt-0.5">Type any prompt to generate a real AI image. Generation takes 10–30 seconds.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TokenQuotaBadge />
          <Badge label="Engine" value={isDemoMode ? "Demo" : "Neural Diffusion"} variant={isDemoMode ? "warning" : "authentic"} pulse={!isDemoMode} />
          <button
            onClick={() => setApiKeyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-500 hover:text-brand-600 hover:border-brand-300 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            API Key
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard className="p-5">
            <PromptConsole onGenerate={handleGenerate} isGenerating={isGenerating} generationStep={step} />
          </GlassCard>

          {/* Tips */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-ink-700">Prompt Tips for Better Results</p>
                <ul className="space-y-1 text-xs text-ink-500 leading-relaxed">
                  <li>• Be descriptive — <em className="text-ink-700">"Indian police officer in khaki uniform, photorealistic"</em></li>
                  <li>• Add lighting — <em className="text-ink-700">"soft natural light, golden hour, DSLR bokeh"</em></li>
                  <li>• Specify camera — <em className="text-ink-700">"shot on Canon EOS R5, 85mm f/1.8"</em></li>
                  <li>• Mention quality — <em className="text-ink-700">"ultra detailed, 8k resolution, sharp focus"</em></li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        <ImageCanvas
          imageUrl={generatedImage}
          isGenerating={isGenerating}
          metadata={metadata}
          diagnostics={diagnostics}
        />
      </div>

      <ApiKeyModal isOpen={apiKeyOpen} onClose={() => setApiKeyOpen(false)} />
    </div>
  );
}