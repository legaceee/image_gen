"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, RefreshCw, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsBar } from "@/components/history/StatsBar";
import { ImageCard } from "@/components/history/ImageCard";

interface HistoryImage {
  id: string;
  prompt: string;
  stylePreset: string;
  aspectRatio: string;
  model: string;
  storageUrl: string | null;
  latencyMs: number | null;
  createdAt: string;
  _count: { analysisResults: number };
}

interface HistoryData {
  images: HistoryImage[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: { total: number; topStyle: string | null; avgLatencyMs: number };
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?page=${p}&limit=20`);
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(page); }, [page, fetchHistory]);

  const handleDelete = (id: string) => {
    if (data) {
      setData(d => d ? { ...d, images: d.images.filter(img => img.id !== id), stats: { ...d.stats, total: d.stats.total - 1 } } : d);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Your Library</span>
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Generation History</h1>
          <p className="text-sm text-ink-500 mt-0.5">All images you have generated, stored securely.</p>
        </div>
        <button onClick={() => fetchHistory(page)} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-500 hover:text-brand-600 hover:border-brand-300 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {data?.stats && (
        <StatsBar total={data.stats.total} topStyle={data.stats.topStyle} avgLatencyMs={data.stats.avgLatencyMs} />
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-ink-100/60 animate-pulse" />
          ))}
        </div>
      ) : !data?.images.length ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-brand-300" />
          </div>
          <div>
            <p className="font-semibold text-ink-700">No images yet</p>
            <p className="text-sm text-ink-400 mt-1">Images you generate will appear here automatically.</p>
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.images.map((img, i) => (
              <motion.div key={img.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ImageCard image={img} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}
                className="p-2 rounded-xl border border-ink-200 bg-white text-ink-500 hover:text-brand-600 disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-ink-600 font-medium">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages || loading}
                className="p-2 rounded-xl border border-ink-200 bg-white text-ink-500 hover:text-brand-600 disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}