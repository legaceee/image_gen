import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/shared/ToastContext";
import { DemoModeProvider } from "@/components/shared/DemoModeContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "VERILENS | Forensic AI Image Suite & Synthetic Media Verification",
  description:
    "Advanced cyber-forensic platform for Text-to-Image Generation and Deep Latent Integrity Detection. Academic CS Capstone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyber-blue selection:text-charcoal-950">
        <ToastProvider>
          <DemoModeProvider>
            {/* Global grid background */}
            <div className="fixed inset-0 bg-grid-cyber pointer-events-none -z-20" />
            <div className="fixed inset-0 bg-radial-gradient pointer-events-none -z-10" />

            {/* Navigation HUD */}
            <Navbar />

            {/* Main Application Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>

            {/* Academic Footer */}
            <Footer />
          </DemoModeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
