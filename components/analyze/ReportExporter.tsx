"use client";

import React from "react";
import { Download, Printer, ShieldCheck, Share2 } from "lucide-react";
import { IntegrityReport } from "@/lib/mockData";
import { CyberButton } from "../ui/CyberButton";
import { useToast } from "../shared/ToastContext";

interface ReportExporterProps {
  report: IntegrityReport;
}

export function ReportExporter({ report }: ReportExporterProps) {
  const { toast } = useToast();

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-audit-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: "success",
      title: "AUDIT DOSSIER EXPORTED",
      message: `Saved as forensic-audit-${report.id}.json`,
    });
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-charcoal-900/90 border border-slate-800">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-charcoal-950 border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-cyber-blue" />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-100">
            CRYPTOGRAPHIC FORENSIC DOSSIER #{report.id}
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            SHA-256 HASH VERIFIED • ZERO-KNOWLEDGE AUDIT RECORD
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CyberButton
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrintCertificate}
          icon={<Printer className="w-3.5 h-3.5 text-slate-300" />}
        >
          Print Audit
        </CyberButton>

        <CyberButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleDownloadJson}
          icon={<Download className="w-3.5 h-3.5 text-cyber-blue" />}
        >
          Export JSON
        </CyberButton>
      </div>
    </div>
  );
}
