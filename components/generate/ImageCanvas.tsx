"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ScanLine, Copy, ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

interface Props {
  imageUrl: string | null;
  isGenerating: boolean;
  metadata: any;
}

export function ImageCanvas({ imageUrl, isGenerating, metadata }: Props) {
  const router = useRouter();

  const handleDownload = () => {
    if (!imageUrl || imageUrl.startsWith("/samples")) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `ai-generated-${Date.now()}.jpg`;
    a.click();
  };

  const handleCopy = async () => {
    if (metadata?.prompt) {
      await navigator.clipboard.writeText(metadata.prompt).catch(() => {});
    }
  };

  const handleTestIntegrity = () => {
    if (!imageUrl) return;
    try {
      sessionStorage.setItem("pending_forensic_image", imageUrl);
      sessionStorage.setItem("pending_forensic_meta", JSON.stringify({
        fileName: "generated-image.jpg",
        fileSize: Math.round((imageUrl.length * 3) / 4),
        mimeType: "image/jpeg",
        source: "generator",
        prompt: metadata?.prompt,
        model: metadata?.model,
        seed: metadata?.seed,
      }));
    } catch {}
    router.push("/analyze");
  };

  return (
    <GlassCard className="p-5 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-ink-400" />
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Output Canvas</span>
        </div>
        {imageUrl && !isGenerating && (
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} title="Copy prompt"
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all">
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!imageUrl.startsWith("/samples") && (
              <button onClick={handleDownload} title="Download image"
                className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image display */}
      <div className="relative rounded-xl overflow-hidden bg-ink-100/50 flex-1 min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-50 to-white">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-brand-50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-brand-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink-700">Synthesizing...</p>
                <p className="text-xs text-ink-400 mt-0.5">FLUX diffusion in progress</p>
              </div>
            </motion.div>
          ) : imageUrl ? (
            <motion.img
              key="image"
              src={imageUrl}
              alt="Generated image"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-contain max-h-[420px]"
            />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">No image yet</p>
                <p className="text-xs text-ink-400 mt-0.5">Enter a prompt and click Generate</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metadata */}
      {metadata && !isGenerating && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Model", value: metadata.model?.split("/").pop() || metadata.model },
              { label: "Ratio", value: metadata.aspectRatio || "1:1" },
              { label: "Style", value: metadata.stylePreset },
              { label: "Latency", value: metadata.latencyMs ? `${metadata.latencyMs}ms` : "—" },
            ].map(({ label, value }) => value && (
              <div key={label} className="px-3 py-2 rounded-lg bg-ink-100/50 border border-ink-200/50">
                <p className="text-[10px] text-ink-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xs font-semibold text-ink-700 font-mono truncate mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Test integrity CTA */}
          <button
            onClick={handleTestIntegrity}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            Test Integrity — Run Forensic Analysis
          </button>
        </motion.div>
      )}
    </GlassCard>
  );
}