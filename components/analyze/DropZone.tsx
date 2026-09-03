"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileImage, Hash, FileCheck, X, RefreshCw } from "lucide-react";
import { computeSHA256, formatBytes, truncateHash } from "@/lib/utils";
import { CyberButton } from "../ui/CyberButton";

interface DropZoneProps {
  onImageSelected: (data: {
    file?: File;
    dataUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    sha256: string;
  }) => void;
  selectedPreview?: string | null;
  onClear?: () => void;
  isAnalyzing?: boolean;
}

export function DropZone({
  onImageSelected,
  selectedPreview,
  onClear,
  isAnalyzing = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP, AVIF, SVG).");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const sha256 = await computeSHA256(arrayBuffer);
    setHash(sha256);
    setFileDetails({ name: file.name, size: file.size, type: file.type || "image/png" });

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageSelected({
        file,
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "image/png",
        sha256,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg,.webp,.png,.jpg,.jpeg,.avif"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {!selectedPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
            isDragOver
              ? "border-cyber-blue bg-cyber-blue/10 scale-[1.01]"
              : "border-slate-800 bg-charcoal-900/50 hover:border-slate-700 hover:bg-charcoal-900/80"
          }`}
        >
          {/* Radar Sweep Effect */}
          <div className="w-16 h-16 rounded-2xl bg-charcoal-950 border border-slate-800 flex items-center justify-center shadow-lg relative group">
            <UploadCloud className="w-8 h-8 text-cyber-blue group-hover:scale-110 transition-transform" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold font-mono text-slate-100">
              Drag & Drop Forensic Target Image
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              Supports PNG, JPG, WEBP, AVIF, SVG. Maximum file size 30MB.
              Automatic SHA-256 fingerprinting on intake.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CyberButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Local Files
            </CyberButton>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-800 bg-charcoal-900/80 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-700/80 bg-charcoal-950 flex-shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreview}
                alt="Selected target"
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-cyber-blue animate-spin" />
                </div>
              )}
            </div>

            {/* Target telemetry stats */}
            <div className="flex-1 min-w-0 space-y-1.5 text-left w-full sm:w-auto">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-200 truncate">
                  {fileDetails?.name || "Target Image Loaded"}
                </span>
                {onClear && (
                  <button
                    onClick={onClear}
                    disabled={isAnalyzing}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title="Clear selected target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Size: {fileDetails ? formatBytes(fileDetails.size) : "Cached"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-matrix-emerald" />
                  <span>MIME: {fileDetails?.type || "image/*"}</span>
                </div>
              </div>

              {hash && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-charcoal-950 px-2 py-1 rounded border border-slate-800/80">
                  <Hash className="w-3 h-3 text-cyber-blue flex-shrink-0" />
                  <span className="truncate">SHA-256: {hash}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
