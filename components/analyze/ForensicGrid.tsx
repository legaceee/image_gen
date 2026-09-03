"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Grid,
  Activity,
  Cpu,
  Layers,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VerificationCheck } from "@/lib/mockData";

interface ForensicGridProps {
  checks: VerificationCheck[];
  suspectedModel: string;
}

export function ForensicGrid({ checks, suspectedModel }: ForensicGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "METADATA":
        return <FileCode className="w-4 h-4 text-cyber-blue" />;
      case "PIXELS":
        return <Grid className="w-4 h-4 text-neon-red" />;
      case "FREQUENCY":
        return <Activity className="w-4 h-4 text-cyber-cyan" />;
      case "RESIDUALS":
        return <Cpu className="w-4 h-4 text-amber-warning" />;
      case "COMPRESSION":
        return <Layers className="w-4 h-4 text-cyber-indigo" />;
      case "SEMANTICS":
      default:
        return <Eye className="w-4 h-4 text-matrix-emerald" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-matrix-emerald/10 border border-matrix-emerald/40 text-matrix-emerald">
            <CheckCircle2 className="w-3 h-3" />
            CLEAN / PASS
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neon-red/10 border border-neon-red/40 text-neon-rose">
            <XCircle className="w-3 h-3" />
            ANOMALY DETECTED
          </span>
        );
      case "WARNING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-warning/10 border border-amber-warning/40 text-amber-300">
            <AlertTriangle className="w-3 h-3" />
            SUSPICIOUS
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            Forensic Verification Vector Analysis
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Individual telemetry pipelines analyzing sensor physics, spectral decay, and latent markers.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-slate-400">SOURCE ATTRIBUTION:</span>
          <p className="text-xs font-mono font-bold text-cyber-cyan">{suspectedModel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((chk) => {
          const isExpanded = expandedId === chk.id;
          const isFailed = chk.status === "FAILED";

          return (
            <motion.div
              key={chk.id}
              layout
              className={`p-3.5 rounded-xl border transition-all ${
                isFailed
                  ? "bg-charcoal-900/80 border-neon-red/30 hover:border-neon-red/60"
                  : chk.status === "PASSED"
                  ? "bg-charcoal-900/80 border-matrix-emerald/30 hover:border-matrix-emerald/60"
                  : "bg-charcoal-900/80 border-amber-warning/30 hover:border-amber-warning/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-charcoal-950 border border-slate-800">
                    {getCategoryIcon(chk.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-100">
                      {chk.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                      VECTOR: {chk.category}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(chk.status)}</div>
              </div>

              {/* Detail outcome banner */}
              <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-charcoal-950/60 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Finding: </span>
                <span className={isFailed ? "text-neon-rose font-medium" : "text-slate-200"}>
                  {chk.detail}
                </span>
              </div>

              {/* Progress metric bar */}
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Synthetic Anomaly Probability</span>
                  <span className={isFailed ? "text-neon-rose font-bold" : "text-matrix-emerald font-bold"}>
                    {chk.score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-charcoal-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFailed
                        ? "bg-gradient-to-r from-amber-500 via-neon-rose to-neon-red"
                        : "bg-gradient-to-r from-cyber-blue to-matrix-emerald"
                    }`}
                    style={{ width: `${chk.score}%` }}
                  />
                </div>
              </div>

              {/* Forensic Rationale toggle */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : chk.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyber-blue transition-colors"
                >
                  <Info className="w-3 h-3" />
                  <span>{isExpanded ? "Hide Forensic Rationale" : "View Forensic Rationale"}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expanded rationale */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2.5 rounded-lg bg-charcoal-950 border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed"
                >
                  <p className="font-mono text-[9px] text-cyber-cyan uppercase tracking-wider mb-1">
                    SCIENTIFIC EXPLANATION:
                  </p>
                  {chk.forensicRationale}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
