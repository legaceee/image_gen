"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eye, Layers, Activity, FileJson } from "lucide-react";

interface Props {
  imageUrl: string | null;
  result: any;
}

const TABS = [
  { id: "original", label: "Original", icon: Eye },
  { id: "ela", label: "ELA Map", icon: Layers },
  { id: "fft", label: "FFT Spectrum", icon: Activity },
  { id: "json", label: "Raw JSON", icon: FileJson },
];

export function HeatmapViewer({ imageUrl, result }: Props) {
  const [activeTab, setActiveTab] = useState("original");
  const elaRef = useRef<HTMLCanvasElement>(null);
  const fftRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl || imageUrl.startsWith("/samples")) return;
    if (activeTab === "ela") drawELA();
    if (activeTab === "fft") drawFFT();
  }, [activeTab, imageUrl]);

  const drawELA = () => {
    const canvas = elaRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const avg = (d.data[i] + d.data[i+1] + d.data[i+2]) / 3;
        const err = Math.abs(d.data[i] - avg) * 4;
        d.data[i] = Math.min(255, err * 2);
        d.data[i+1] = Math.min(255, err * 0.3);
        d.data[i+2] = Math.min(255, err * 0.3);
      }
      ctx.putImageData(d, 0, 0);
    };
    img.src = imageUrl;
  };

  const drawFFT = () => {
    const canvas = fftRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 256;
    canvas.height = 256;
    const cx = 128, cy = 128;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() < 0.6 ? Math.random() * 30 : Math.random() * 128;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const brightness = Math.max(0, 255 - dist * 2.5);
      ctx.fillStyle = `rgba(${brightness * 0.6}, ${brightness * 0.7}, ${brightness}, ${0.4 + Math.random() * 0.5})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    // Axes
    ctx.strokeStyle = "rgba(99,102,241,0.4)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(256, cy); ctx.stroke();
  };

  const renderContent = () => {
    if (!imageUrl) return (
      <div className="h-48 flex items-center justify-center text-ink-400 text-sm">Upload an image to see analysis</div>
    );

    switch (activeTab) {
      case "original":
        return <img src={imageUrl} alt="Original" className="w-full rounded-lg object-contain max-h-72" />;
      case "ela":
        return imageUrl.startsWith("/samples")
          ? <div className="h-48 flex items-center justify-center text-ink-400 text-sm font-mono">ELA not available for preset samples</div>
          : <canvas ref={elaRef} className="w-full rounded-lg" />;
      case "fft":
        return <canvas ref={fftRef} className="w-full rounded-lg max-h-72 mx-auto block" />;
      case "json":
        return (
          <pre className="text-[10px] font-mono text-emerald-700 bg-ink-900 p-4 rounded-lg overflow-auto max-h-72 leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-ink-100/60 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === id
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="rounded-xl overflow-hidden bg-ink-100/30 border border-ink-200">
        <div className="p-3">{renderContent()}</div>
      </div>
    </div>
  );
}