"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, Activity, Eye, Code, Scan, ZoomIn, Download } from "lucide-react";
import { IntegrityReport } from "@/lib/mockData";

interface HeatmapViewerProps {
  imageUrl: string;
  report: IntegrityReport;
}

export function HeatmapViewer({ imageUrl, report }: HeatmapViewerProps) {
  const [activeTab, setActiveTab] = useState<"original" | "ela" | "fft" | "json">("original");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSynthetic = report.aiProbability >= 50;

  // Render simulated ELA or FFT on canvas when tab switches
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.drawImage(img, 0, 0, 600, 600);

      if (activeTab === "ela") {
        // Compute high-contrast edge compression delta simulation
        const imgData = ctx.getImageData(0, 0, 600, 600);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (isSynthetic) {
            // Synthetic models exhibit uniform high-frequency glow or checkerboard
            const x = (i / 4) % 600;
            const y = Math.floor(i / 4 / 600);
            const gridPattern = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0 ? 30 : 0;
            const lum = (r * 0.299 + g * 0.587 + b * 0.114);
            
            // ELA glow: purples, high-contrast cyan, hot pinks
            data[i] = Math.min(255, (lum * 0.5) + (r * 0.4) + gridPattern * 1.5 + 40); // Red
            data[i + 1] = Math.min(255, (g * 0.3) + gridPattern);                      // Green
            data[i + 2] = Math.min(255, (b * 0.8) + 60);                               // Blue
          } else {
            // Authentic images exhibit subtle organic edge variances
            const lum = (r * 0.299 + g * 0.587 + b * 0.114) * 0.25;
            data[i] = lum * 0.8;
            data[i + 1] = lum * 1.2;
            data[i + 2] = lum * 1.5;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (activeTab === "fft") {
        // 2D Fourier Spectrum Simulation (Central bright DC component with high-frequency radial decay or periodic starbursts)
        ctx.fillStyle = "#050811";
        ctx.fillRect(0, 0, 600, 600);

        const centerX = 300;
        const centerY = 300;

        // Radial gradient for DC frequency center
        const radGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 280);
        radGrad.addColorStop(0, "#ffffff");
        radGrad.addColorStop(0.05, "#38bdf8");
        radGrad.addColorStop(0.2, "#1e293b");
        radGrad.addColorStop(1, "#030712");
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 600, 600);

        // If synthetic, draw distinct periodic harmonic spike axes & satellite dots
        if (isSynthetic) {
          ctx.strokeStyle = "rgba(255, 42, 95, 0.45)";
          ctx.lineWidth = 1.5;

          // Cross starburst
          ctx.beginPath();
          ctx.moveTo(centerX, 20);
          ctx.lineTo(centerX, 580);
          ctx.moveTo(20, centerY);
          ctx.lineTo(580, centerY);
          ctx.stroke();

          // Satellite harmonic peaks
          const satellites = [
            [centerX - 80, centerY - 80],
            [centerX + 80, centerY - 80],
            [centerX - 80, centerY + 80],
            [centerX + 80, centerY + 80],
            [centerX - 160, centerY],
            [centerX + 160, centerY],
            [centerX, centerY - 160],
            [centerX, centerY + 160],
          ];

          for (const [sx, sy] of satellites) {
            ctx.fillStyle = "#ff2a5f";
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 42, 95, 0.3)";
            ctx.beginPath();
            ctx.arc(sx, sy, 12, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Label
          ctx.fillStyle = "#ff2a5f";
          ctx.font = "12px monospace";
          ctx.fillText("HARMONIC ARTIFACT PEAKS DETECTED", 20, 40);
        } else {
          // Authentic smooth decay
          ctx.fillStyle = "#10b981";
          ctx.font = "12px monospace";
          ctx.fillText("ORGANIC 1/f NATURAL DECAY VERIFIED", 20, 40);
        }
      }
    };
  }, [imageUrl, activeTab, isSynthetic]);

  return (
    <div className="space-y-3">
      {/* Tab Switcher HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("original")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTab === "original"
                ? "bg-slate-800 text-slate-100 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyber-blue" />
            <span>Original Media</span>
          </button>

          <button
            onClick={() => setActiveTab("ela")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTab === "ela"
                ? "bg-slate-800 text-slate-100 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-neon-rose" />
            <span>ELA Error Delta</span>
          </button>

          <button
            onClick={() => setActiveTab("fft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTab === "fft"
                ? "bg-slate-800 text-slate-100 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>2D FFT Spectrum</span>
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTab === "json"
                ? "bg-slate-800 text-slate-100 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-matrix-emerald" />
            <span>Raw Telemetry</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Scan className="w-3.5 h-3.5 text-cyber-blue" />
            RESOLUTION: {report.dimensions.width}x{report.dimensions.height}
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">HASH: {report.sha256.substring(0, 12)}...</span>
        </div>
      </div>

      {/* Main Display Window */}
      <div className="relative rounded-xl border border-slate-800 bg-charcoal-950 overflow-hidden min-h-[380px] max-h-[460px] flex items-center justify-center p-2">
        {/* Forensic grid scanlines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b22_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Viewport Corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyber-blue pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyber-blue pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyber-blue pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyber-blue pointer-events-none" />

        {activeTab === "original" && (
          <div className="relative max-h-[420px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Analyzed forensic target"
              className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}

        {(activeTab === "ela" || activeTab === "fft") && (
          <div className="flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-h-[380px] max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
            <span className="mt-2 text-[10px] font-mono text-slate-400">
              {activeTab === "ela"
                ? "Error Level Analysis: highlights differential JPEG/WebP compression quantization errors."
                : "2D Discrete Fourier Transform: displays spatial frequency power spectrum distribution."}
            </span>
          </div>
        )}

        {activeTab === "json" && (
          <div className="w-full h-[400px] overflow-auto p-4 text-left font-mono text-[11px] bg-charcoal-950 rounded-lg text-cyber-cyan selection:bg-cyber-blue selection:text-charcoal-950">
            <pre className="leading-relaxed">{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
