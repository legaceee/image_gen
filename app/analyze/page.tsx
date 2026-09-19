"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ScanLine, Hash, FileImage, Clock, RefreshCw, AlertCircle, Lock, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { CircularGauge } from "@/components/analyze/CircularGauge";
import { ForensicGrid } from "@/components/analyze/ForensicGrid";
import { HeatmapViewer } from "@/components/analyze/HeatmapViewer";
import { DropZone } from "@/components/analyze/DropZone";
import { PresetSelector } from "@/components/analyze/PresetSelector";
import { ReportExporter } from "@/components/analyze/ReportExporter";
import { useToast } from "@/components/shared/ToastContext";
import { computeSHA256, formatBytes } from "@/lib/utils";
import type { ForensicMetrics } from "@/lib/forensicEngine";

const SYNTHETIC_PRESET = {
  fileName: "FLUX_synthetic_portrait_v3.jpg",
  fileSize: 1_872_540,
  mimeType: "image/jpeg",
  imageUrl: "/samples/synthetic_portrait.svg",
  fromGenerator: true,
};
const AUTHENTIC_PRESET = {
  fileName: "IMG_4821_Canon_EOS_R5.jpg",
  fileSize: 8_243_712,
  mimeType: "image/jpeg",
  imageUrl: "/samples/authentic_camera.svg",
  fromGenerator: false,
};

export default function AnalyzePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ForensicMetrics | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Read image bridged from generator
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pending_forensic_image");
      const meta = sessionStorage.getItem("pending_forensic_meta");
      if (pending && meta) {
        sessionStorage.removeItem("pending_forensic_image");
        sessionStorage.removeItem("pending_forensic_meta");
        const m = JSON.parse(meta);
        setImageUrl(pending);
        const syntheticFile = new File([], m.fileName || "generated.jpg", { type: m.mimeType || "image/jpeg" });
        Object.defineProperty(syntheticFile, "size", { value: m.fileSize || 0 });
        setSelectedFile(syntheticFile);
        setTimeout(() => runAnalysis({ fileName: m.fileName, fileSize: m.fileSize, mimeType: m.mimeType, imageUrl: pending, fromGenerator: m.source === "generator" }), 400);
      }
    } catch {}
  }, []);

  const runAnalysis = useCallback(async (params: {
    fileName: string; fileSize: number; mimeType: string; imageUrl: string; fromGenerator?: boolean;
  }) => {
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/analyze");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    let sha = "";
    if (params.imageUrl && !params.imageUrl.startsWith("/samples")) {
      try {
        const base64 = params.imageUrl.includes(",") ? params.imageUrl.split(",")[1] : params.imageUrl;
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        sha = await computeSHA256(bytes);
        setFileHash(sha);
      } catch { sha = "hash-unavailable"; }
    } else {
      sha = params.fromGenerator ? "synthetic-preset-sha256" : "authentic-preset-sha256";
      setFileHash(sha);
    }

    try {
      let clientToken = "";
      try { clientToken = localStorage.getItem("forensic_hf_api_key") || ""; } catch {}

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-hf-token": clientToken },
        body: JSON.stringify({
          fileName: params.fileName,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          fromGenerator: params.fromGenerator || false,
          imageBase64: params.imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");

      setResult(data.result);
      setAnalysisId(data.result.analysisId);

      const verdict = data.result.verdict;
      toast({
        type: verdict === "SYNTHETIC" ? "error" : verdict === "AUTHENTIC" ? "success" : "warning",
        title: `VERDICT: ${verdict}`,
        message: `${data.result.syntheticProbability}% synthetic probability · ${data.result.confidence} confidence`,
      });
    } catch (err: any) {
      toast({ type: "error", title: "ANALYSIS FAILED", message: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const handleFileSelect = async (file: File, dataUrl: string) => {
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/analyze");
      return;
    }
    setSelectedFile(file);
    setImageUrl(dataUrl);
    setResult(null);
    setFileHash(null);
    await runAnalysis({ fileName: file.name, fileSize: file.size, mimeType: file.type, imageUrl: dataUrl });
  };

  const handlePreset = async (type: "synthetic" | "authentic") => {
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/analyze");
      return;
    }
    const p = type === "synthetic" ? SYNTHETIC_PRESET : AUTHENTIC_PRESET;
    setImageUrl(p.imageUrl);
    setResult(null);
    setFileHash(type === "synthetic" ? "a3f9c12d...preset" : "b7e1d45c...preset");
    const f = new File([], p.fileName, { type: p.mimeType });
    setSelectedFile(f);
    await runAnalysis({ fileName: p.fileName, fileSize: p.fileSize, mimeType: p.mimeType, imageUrl: p.imageUrl, fromGenerator: p.fromGenerator });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setResult(null);
    setFileHash(null);
    setAnalysisId(null);
  };

  const verdict = result?.verdict;

  return (
    <div className="space-y-6 py-2">
      {/* Auth Banner if not signed in */}
      {!session?.user && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-brand-50/90 border border-brand-200/80 text-brand-900">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Sign In Required</p>
              <p className="text-xs text-brand-700">You must be signed in to upload and analyze images with the forensic engine.</p>
            </div>
          </div>
          <Link
            href="/auth/signin?callbackUrl=/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-sm flex-shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In to Analyze
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Module 02</span>
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Forensic Integrity Analyzer</h1>
          <p className="text-sm text-ink-500 mt-0.5">Upload any image to detect whether it is AI-generated or authentic.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {verdict && (
            <Badge
              label="Verdict"
              value={verdict}
              variant={verdict === "SYNTHETIC" ? "threat" : verdict === "AUTHENTIC" ? "authentic" : "default"}
              pulse={isAnalyzing}
            />
          )}
          {analysisId && (
            <span className="text-xs font-mono text-ink-400">{analysisId}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Upload + Gauge */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-5 space-y-4">
            {/* Upload */}
            <div>
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Upload Image</p>
              <DropZone onFileSelect={handleFileSelect} onClear={handleClear} selectedFile={selectedFile} />
            </div>

            {/* File metadata */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 text-xs font-mono text-ink-500 border-t border-ink-100 pt-3">
                  {[
                    { label: "File", value: selectedFile.name },
                    { label: "Size", value: formatBytes(selectedFile.size) },
                    { label: "Type", value: selectedFile.type || "image/jpeg" },
                    { label: "SHA-256", value: fileHash ? fileHash.substring(0, 20) + "..." : "computing..." },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-ink-400">{label}</span>
                      <span className="text-ink-700 truncate max-w-[140px] text-right">{value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Presets */}
            <div className="border-t border-ink-100 pt-3">
              <PresetSelector onSelect={handlePreset} disabled={isAnalyzing} />
            </div>
          </GlassCard>

          {/* Gauge */}
          <GlassCard className="p-5 flex flex-col items-center">
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-4">AI Probability Score</p>
            <CircularGauge
              probability={result?.syntheticProbability ?? 0}
              verdict={result?.verdict ?? "INCONCLUSIVE"}
              confidence={result?.confidence ?? "—"}
              isLoading={isAnalyzing}
            />
            {result && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-ink-500 text-center mt-3 leading-relaxed">
                {result.checksummary}
              </motion.p>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Checks + Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Forensic checks grid */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">6-Vector Analysis</p>
              {isAnalyzing && (
                <div className="flex items-center gap-1.5 text-xs text-brand-600">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>
            {!result && !isAnalyzing ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-brand-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-500">Upload an image to run forensic analysis</p>
                  <p className="text-xs text-ink-400 mt-0.5">Or use the preset samples to see a demo</p>
                </div>
              </div>
            ) : (
              <ForensicGrid checks={result?.checks ?? []} isLoading={isAnalyzing} />
            )}
          </GlassCard>

          {/* Visual Inspector */}
          {(imageUrl || isAnalyzing) && (
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Visual Inspector</p>
                {result && <ReportExporter result={result} fileName={selectedFile?.name || "analysis"} />}
              </div>
              <HeatmapViewer imageUrl={imageUrl} result={result} />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}