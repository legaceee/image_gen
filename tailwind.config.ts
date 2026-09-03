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
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        blue: {
          50: "#EFF6FF",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
        },
        rose: {
          50: "#FFF1F2",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        emerald: {
          50: "#ECFDF5",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        glass: {
          white: "rgba(255,255,255,0.70)",
          whiteSm: "rgba(255,255,255,0.85)",
          border: "rgba(255,255,255,0.60)",
          borderSm: "rgba(99,102,241,0.15)",
        },
        surface: {
          50: "#FAFBFF",
          100: "#F0F4FF",
          200: "#E8EDFF",
        },
        ink: {
          900: "#0F172A",
          700: "#1E293B",
          500: "#475569",
          400: "#64748B",
          300: "#94A3B8",
          200: "#CBD5E1",
          100: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "surface-gradient": "linear-gradient(135deg, #F0F4FF 0%, #FAFBFF 50%, #F5F0FF 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(99,102,241,0.08), 0 2px 8px 0 rgba(0,0,0,0.04)",
        "glass-hover": "0 16px 48px 0 rgba(99,102,241,0.14), 0 4px 16px 0 rgba(0,0,0,0.06)",
        "glass-sm": "0 4px 16px 0 rgba(99,102,241,0.06), 0 1px 4px 0 rgba(0,0,0,0.04)",
        "threat": "0 8px 32px 0 rgba(244,63,94,0.12), 0 2px 8px 0 rgba(244,63,94,0.06)",
        "authentic": "0 8px 32px 0 rgba(16,185,129,0.12), 0 2px 8px 0 rgba(16,185,129,0.06)",
      },
      animation: {
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseSoft: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
export default config;