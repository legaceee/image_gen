"use client";

import React from "react";
import { Image, Zap, Clock, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Props {
  total: number;
  topStyle: string | null;
  avgLatencyMs: number;
}

export function StatsBar({ total, topStyle, avgLatencyMs }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Image, label: "Total Generated", value: total.toString(), color: "text-brand-600", bg: "bg-brand-50" },
        { icon: Sparkles, label: "Top Style", value: topStyle || "—", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: Clock, label: "Avg Latency", value: avgLatencyMs ? `${avgLatencyMs}ms` : "—", color: "text-emerald-600", bg: "bg-emerald-50" },
      ].map(({ icon: Icon, label, value, color, bg }) => (
        <GlassCard key={label} className="p-4 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-sm font-bold ${color} truncate`}>{value}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}