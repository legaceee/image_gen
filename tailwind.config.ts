import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#06090f",
          900: "#0a0e17",
          850: "#0f1422",
          800: "#151c2e",
          700: "#1e2942",
          600: "#2d3b5b",
        },
        cyber: {
          blue: "#00f0ff",
          cyan: "#38bdf8",
          indigo: "#6366f1",
          sky: "#0284c7",
        },
        neon: {
          red: "#ff2a5f",
          rose: "#f43f5e",
          crimson: "#e11d48",
          darkRed: "#9f1239",
        },
        matrix: {
          emerald: "#10b981",
          teal: "#14b8a6",
          green: "#22c55e",
        },
        amber: {
          warning: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
        "scanline": "scanline 8s linear infinite",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite alternate",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        glowPulse: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
