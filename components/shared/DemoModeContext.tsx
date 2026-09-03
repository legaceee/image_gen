"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./ToastContext";

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Default to TRUE for presentation reliability!
  const { toast } = useToast();

  useEffect(() => {
    // Check saved state in localStorage if exists
    try {
      const saved = localStorage.getItem("forensic_demo_mode");
      if (saved !== null) {
        setIsDemoMode(saved === "true");
      }
    } catch {
      // Ignored
    }

    // Keyboard shortcut listener: Ctrl+Shift+D or Cmd+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDemoMode((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("forensic_demo_mode", String(next));
          } catch {}
          toast({
            type: next ? "info" : "warning",
            title: next ? "DEMO MODE ENGAGED" : "LIVE CLOUD INFERENCE ACTIVE",
            message: next
              ? "Presentation Failsafe ON: Instant local benchmark responses enabled."
              : "Live Mode: External API endpoints will be queried (requires API keys).",
          });
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toast]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("forensic_demo_mode", String(next));
      } catch {}
      toast({
        type: next ? "info" : "warning",
        title: next ? "DEMO MODE ACTIVE" : "LIVE INFERENCE ACTIVE",
        message: next
          ? "Presentation mode enabled. Using local high-fidelity telemetry presets."
          : "Live API mode enabled. External Hugging Face routes will be queried.",
      });
      return next;
    });
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    try {
      localStorage.setItem("forensic_demo_mode", String(enabled));
    } catch {}
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
