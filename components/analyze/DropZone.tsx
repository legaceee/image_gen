"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X } from "lucide-react";

interface Props {
  onFileSelect: (file: File, dataUrl: string) => void;
  onClear?: () => void;
  selectedFile?: File | null;
}

export function DropZone({ onFileSelect, onClear, selectedFile }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setIsDragOver(false);
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onFileSelect(file, dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"] },
    maxFiles: 1,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <FileImage className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-800 truncate max-w-[180px]">{selectedFile.name}</p>
            <p className="text-xs text-ink-400">{(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}</p>
          </div>
        </div>
        {onClear && (
          <button onClick={onClear} className="p-1.5 rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragOver
          ? "border-brand-400 bg-brand-50"
          : "border-ink-200 bg-ink-100/30 hover:border-brand-300 hover:bg-brand-50/30"
      }`}
    >
      <input {...getInputProps()} />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragOver ? "bg-brand-100" : "bg-white shadow-sm"}`}>
        <Upload className={`w-5 h-5 ${isDragOver ? "text-brand-600" : "text-ink-400"}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink-700">Drop an image here</p>
        <p className="text-xs text-ink-400 mt-0.5">or click to browse · JPG, PNG, WebP supported</p>
      </div>
    </div>
  );
}