import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/shared/ToastContext";
import { DemoModeProvider } from "@/components/shared/DemoModeContext";
import { SessionProvider } from "@/components/shared/SessionProvider";

export const metadata: Metadata = {
  title: "AI Image Suite",
  description: "Text-to-Image Generation & Synthetic Media Verification — CS Capstone Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <DemoModeProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
                  {children}
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </DemoModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}