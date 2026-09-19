"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, ScanLine, Trash2, Calendar, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  image: {
    id: string;
    prompt: string;
    stylePreset: string;
    aspectRatio: string;
    model: string;
    storageUrl: string | null;
    latencyMs: number | null;
    createdAt: string;
    _count: { analysisResults: number };
  };
  onDelete: (id: string) => void;
}

export function ImageCard({ image, onDelete }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/history/${image.id}`, { method: "DELETE" });
    onDelete(image.id);
  };

  const handleAnalyze = () => {
    if (image.storageUrl) {
      sessionStorage.setItem("pending_forensic_image", image.storageUrl);
      sessionStorage.setItem("pending_forensic_meta", JSON.stringify({
        fileName: `history-${image.id}.jpg`, fileSize: 0, mimeType: "image/jpeg", source: "history",
      }));
      router.push("/analyze");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden group hover:shadow-glass-hover transition-all duration-300">
      {/* Image preview */}
      <div className="aspect-square bg-ink-100/60 relative overflow-hidden">
        {image.storageUrl ? (
          <img src={image.storageUrl} alt={image.prompt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-400" />
            </div>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {image.storageUrl && (
            <>
              <button onClick={handleAnalyze}
                className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-white transition-all" title="Analyze integrity">
                <ScanLine className="w-4 h-4" />
              </button>
              <a href={image.storageUrl} download
                className="p-2 rounded-xl bg-white/90 text-brand-600 hover:bg-white transition-all" title="Download">
                <Download className="w-4 h-4" />
              </a>
            </>
          )}
          <button onClick={handleDelete} disabled={deleting}
            className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-white transition-all disabled:opacity-50" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs font-medium text-ink-800 line-clamp-2 leading-relaxed">{image.prompt}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-medium">
            {image.stylePreset}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-ink-400">
            <Calendar className="w-3 h-3" />
            {new Date(image.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </div>
        </div>
        {image.latencyMs && (
          <p className="text-[10px] text-ink-400 font-mono">{image.latencyMs}ms · {image.model.split("/").pop()}</p>
        )}
      </div>
    </motion.div>
  );
}