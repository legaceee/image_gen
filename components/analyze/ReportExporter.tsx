"use client";

import React from "react";
import { Download, Printer } from "lucide-react";

interface Props {
  result: any;
  fileName: string;
}

export function ReportExporter({ result, fileName }: Props) {
  const handleJsonExport = () => {
    const report = { title: "AI Image Forensic Certificate", generatedAt: new Date().toISOString(), source: fileName, ...result };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-cert-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex gap-2">
      <button onClick={handleJsonExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-600 hover:text-brand-600 hover:border-brand-300 transition-all">
        <Download className="w-3.5 h-3.5" />
        Export JSON
      </button>
      <button onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-ink-200 bg-white text-ink-600 hover:text-ink-900 transition-all">
        <Printer className="w-3.5 h-3.5" />
        Print
      </button>
    </div>
  );
}