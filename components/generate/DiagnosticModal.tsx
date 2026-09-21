"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, RefreshCw, AlertTriangle, CheckCircle, Clock, ShieldAlert, Cpu, Download } from "lucide-react";

interface Attempt {
  provider: string;
  model?: string;
  status: "success" | "failed" | "skipped";
  statusCode?: number;
  durationMs?: number;
  error?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  rawPrompt: string;
  enhancedPrompt: string;
  stylePreset: string;
  attempts: Attempt[];
  finalProvider: string;
  success: boolean;
  totalLatencyMs: number;
  error?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDiagnostics?: any;
}

export function DiagnosticModal({ isOpen, onClose, currentDiagnostics }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-ink-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-sm">API Diagnostics & Console Log</h3>
                <p className="text-xs text-ink-400">Live trace of image generation providers and error codes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-xs">
            {/* Latest Run Quick View if available */}
            {currentDiagnostics && (
              <div className="p-4 rounded-xl bg-ink-900 text-ink-100 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-ink-400 border-b border-ink-800 pb-2">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Most Recent Generation Attempt
                  </span>
                  <span>{currentDiagnostics.detectedSubject ? `Subject: ${currentDiagnostics.detectedSubject}` : ""}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-ink-400">Photorealistic Expanded Prompt:</p>
                  <p className="p-2 rounded bg-ink-950/60 text-ink-200 leading-relaxed font-sans text-xs">
                    {currentDiagnostics.enhancedPrompt || "No prompt details"}
                  </p>
                </div>

                {currentDiagnostics.attempts && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] text-ink-400">Provider Trace:</p>
                    <div className="space-y-1">
                      {currentDiagnostics.attempts.map((att: Attempt, idx: number) => (
                        <div
                          key={idx}
                          className={`flex items-start justify-between p-2 rounded ${
                            att.status === "success"
                              ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                              : att.status === "failed"
                              ? "bg-rose-950/40 border border-rose-800/40 text-rose-300"
                              : "bg-ink-800/40 text-ink-400"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold">{att.provider}</span>
                            {att.model && <span className="text-[10px] text-ink-400 block">{att.model}</span>}
                            {att.error && <p className="text-[10px] text-rose-400 mt-0.5 font-sans">{att.error}</p>}
                          </div>
                          <div className="text-right flex flex-col items-end gap-0.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                att.status === "success"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : att.status === "failed"
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-ink-700 text-ink-300"
                              }`}
                            >
                              {att.status} {att.statusCode ? `(${att.statusCode})` : ""}
                            </span>
                            {att.durationMs != null && (
                              <span className="text-[10px] text-ink-400">{att.durationMs}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historical Generation Logs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-800 uppercase tracking-wider text-[11px]">Server Log History (Last 50)</span>
                <span className="text-[11px] text-ink-400">{logs.length} entries recorded</span>
              </div>

              {!logs.length ? (
                <div className="text-center py-8 text-ink-400 font-sans">
                  No generation logs recorded yet. Generate an image to see provider traces here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-ink-200/80 bg-ink-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-ink-700 flex items-center gap-1.5">
                          {log.success ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-ink-500 font-mono">
                          {log.totalLatencyMs}ms · {log.finalProvider}
                        </span>
                      </div>

                      <p className="text-ink-800 font-sans text-xs line-clamp-1">
                        <span className="text-ink-400 font-mono text-[10px]">Prompt:</span> "{log.rawPrompt}"
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {log.attempts.map((a, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              a.status === "success"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.status === "failed"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-ink-100 text-ink-600"
                            }`}
                          >
                            {a.provider}: {a.status} {a.statusCode ? `(${a.statusCode})` : ""}
                          </span>
                        ))}
                      </div>

                      {log.error && (
                        <p className="text-[10px] text-rose-600 font-sans bg-rose-50 p-1.5 rounded border border-rose-100">
                          {log.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-ink-100 bg-ink-50/50">
            <span className="text-[11px] text-ink-400">Logs written to logs/generation.log</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}