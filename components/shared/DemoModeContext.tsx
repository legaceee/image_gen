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
  // Default to false so live real dynamic image generation from text runs out of the box!
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("forensic_demo_mode");
      if (saved !== null) {
        setIsDemoMode(saved === "true");
      }
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDemoMode((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("forensic_demo_mode", String(next));
          } catch {}
          toast({
            type: next ? "warning" : "info",
            title: next ? "OFFLINE DEMO MODE" : "DYNAMIC GENERATION ACTIVE",
            message: next
              ? "Presentation Failsafe ON: Using instant offline preset samples."
              : "Dynamic Text-to-Image Generation Active: Prompts will generate live images.",
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
        type: next ? "warning" : "info",
        title: next ? "OFFLINE DEMO MODE" : "DYNAMIC GENERATION ACTIVE",
        message: next
          ? "Presentation mode enabled. Using local telemetry presets."
          : "Dynamic AI generation active. Images will be generated live from prompts.",
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