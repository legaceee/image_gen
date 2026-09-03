"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
  Scan,
  Cpu,
  Layers,
} from "lucide-react";
import { DropZone } from "@/components/analyze/DropZone";
import { CircularGauge } from "@/components/analyze/CircularGauge";
import { ForensicGrid } from "@/components/analyze/ForensicGrid";
import { HeatmapViewer } from "@/components/analyze/HeatmapViewer";
import { PresetSelector } from "@/components/analyze/PresetSelector";
import { ReportExporter } from "@/components/analyze/ReportExporter";
import { GlassCard } from "@/components/ui/GlassCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { useToast } from "@/components/shared/ToastContext";
import { useDemoMode } from "@/components/shared/DemoModeContext";
import { DEMO_PRESETS, DemoPreset, IntegrityReport } from "@/lib/mockData";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const [activePresetId, setActivePresetId] = useState<string | null>("synthetic-portrait");
  const [selectedImage, setSelectedImage] = useState<string>("/samples/synthetic_portrait.svg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<IntegrityReport | null>(DEMO_PRESETS[0].report);

  // Check if image was passed from Generator via sessionStorage or query params
  useEffect(() => {
    try {
      const pendingImage = sessionStorage.getItem("pending_forensic_image");
      if (pendingImage) {
        setSelectedImage(pendingImage);
        setActivePresetId(null);
        sessionStorage.removeItem("pending_forensic_image");
        sessionStorage.removeItem("pending_forensic_meta");

        // Automatically initiate audit for the transferred image
        runAnalysis({
          dataUrl: pendingImage,
          fileName: "neural_synthesis_target.png",
          fileSize: 450000,
          mimeType: "image/png",
        });

        toast({
          type: "threat",
          title: "TARGET ACQUIRED FROM GENERATOR",
          message: "Initiated multi-spectral forensic audit on generated canvas.",
        });
      }
    } catch {
      // Ignored
    }
  }, []);

  const runAnalysis = async (params: {
    file?: File;
    dataUrl?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    presetId?: string;
  }) => {
    setIsAnalyzing(true);

    try {
      let response: Response;

      if (params.file) {
        const formData = new FormData();
        formData.append("image", params.file);
        if (params.presetId) formData.append("presetId", params.presetId);
        formData.append("isDemo", String(isDemoMode));

        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: params.dataUrl,
            fileName: params.fileName,
            fileSize: params.fileSize,
            mimeType: params.mimeType,
            presetId: params.presetId,
            isDemo: isDemoMode,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Forensic analysis failed");
      }

      setReport(data.report);

      const isSynthetic = data.report.aiProbability >= 50;
      toast({
        type: isSynthetic ? "threat" : "authentic",
        title: isSynthetic ? "SYNTHETIC ANOMALY CONFIRMED" : "AUTHENTIC CAPTURE CONFIRMED",
        message: isSynthetic
          ? `AI Probability: ${data.report.aiProbability}% (${data.report.suspectedModel})`
          : `Authenticity Validated (${data.report.aiProbability}% Anomaly Score)`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "ANALYSIS PIPELINE ERROR",
        message: err.message || "Failed to process target media",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setSelectedImage(preset.imagePath);
    runAnalysis({
      dataUrl: preset.imagePath,
      fileName: preset.report.fileName,
      fileSize: preset.report.fileSize,
      mimeType: preset.report.mimeType,
      presetId: preset.id,
    });
  };

  const handleImageUploaded = (data: {
    file?: File;
    dataUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    sha256: string;
  }) => {
    setActivePresetId(null);
    setSelectedImage(data.dataUrl);
    runAnalysis({
      file: data.file,
      dataUrl: data.dataUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });
  };

  const handleClear = () => {
    setSelectedImage("");
    setReport(null);
    setActivePresetId(null);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SearchCheck className="w-5 h-5 text-neon-rose" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-neon-rose">
              MODULE 02: FORENSIC AUDIT SUBSYSTEM
            </span>
          </div>
          <h1 className="text-3xl font-black font-mono tracking-tight text-slate-100">
            DeepForensics Integrity Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Multi-spectral synthetic media detection, EXIF verification, and sub-pixel deconvolution lattice inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TelemetryBadge
            label="ANALYZER"
            value="ACTIVE"
            variant="threat"
            pulse
          />
          <TelemetryBadge
            label="ENGINE"
            value={isDemoMode ? "DEMO PRESETS" : "LIVE DETECTION"}
            variant={isDemoMode ? "threat" : "authentic"}
          />
        </div>
      </div>

      {/* Preset Fast Selector */}
      <PresetSelector
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
        isAnalyzing={isAnalyzing}
      />

      {/* Upload Zone & Ingestion */}
      <GlassCard variant="default" className="p-4 sm:p-6">
        <DropZone
          onImageSelected={handleImageUploaded}
          selectedPreview={selectedImage}
          onClear={handleClear}
          isAnalyzing={isAnalyzing}
        />
      </GlassCard>

      {/* Forensic Dashboard Output */}
      {report && (
        <div className="space-y-6">
          {/* Top Verdict Strip */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              report.aiProbability >= 50
                ? "bg-neon-red/10 border-neon-red/40 text-slate-100 shadow-xl shadow-neon-red/5"
                : "bg-matrix-emerald/10 border-matrix-emerald/40 text-slate-100 shadow-xl shadow-matrix-emerald/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  report.aiProbability >= 50
                    ? "bg-neon-red/20 border-neon-red text-neon-red"
                    : "bg-matrix-emerald/20 border-matrix-emerald text-matrix-emerald"
                }`}
              >
                {report.aiProbability >= 50 ? (
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-mono font-black tracking-wide uppercase">
                  {report.verdict.replace(/_/g, " ")}
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {report.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">MODEL ATTRIBUTION:</span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-charcoal-950 border border-slate-700 text-slate-200">
                {report.suspectedModel}
              </span>
            </div>
          </div>

          {/* Grid Layout: Gauge + Multi-Layer Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Circular Progress Gauge & Model Signatures */}
            <div className="lg:col-span-5 space-y-6">
              <GlassCard
                variant={report.aiProbability >= 50 ? "threat" : "authentic"}
                className="p-6 flex flex-col items-center justify-center text-center"
              >
                <CircularGauge
                  score={report.aiProbability}
                  verdict={report.verdict}
                  confidence={report.confidence}
                />

                {/* Architecture Probabilities Breakdown */}
                <div className="w-full mt-6 pt-4 border-t border-slate-800 space-y-2.5 text-left">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Neural Architecture Attribution Matrix
                  </h4>
                  <div className="space-y-2">
                    {report.modelSignatures.map((sig, idx) => (
                      <div key={idx} className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between text-slate-300 text-[11px]">
                          <span>{sig.model}</span>
                          <span className="font-bold text-slate-100">{sig.probability}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-charcoal-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0
                                ? report.aiProbability >= 50
                                  ? "bg-neon-red"
                                  : "bg-matrix-emerald"
                                : "bg-slate-700"
                            }`}
                            style={{ width: `${sig.probability}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right Col: Interactive Forensic Viewers */}
            <div className="lg:col-span-7 space-y-6">
              <GlassCard variant="default" className="p-4 sm:p-6">
                <HeatmapViewer imageUrl={selectedImage} report={report} />
              </GlassCard>
            </div>
          </div>

          {/* Verification Checks Grid */}
          <GlassCard variant="default" className="p-6">
            <ForensicGrid
              checks={report.verificationChecks}
              suspectedModel={report.suspectedModel}
            />
          </GlassCard>

          {/* Cryptographic Dossier Exporter */}
          <ReportExporter report={report} />
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-cyber-blue">INITIALIZING FORENSIC ENVIRONMENT...</div>}>
      <AnalyzeContent />
    </Suspense>
  );
}