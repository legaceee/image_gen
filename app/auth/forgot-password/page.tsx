import React from "react";
import Link from "next/link";
import { Cpu, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot Password — AI Image Suite" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Forgot password?</h1>
          <p className="text-sm text-ink-500">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <GlassCard animate className="p-6 space-y-5">
          <ForgotPasswordForm />
          <Link href="/auth/signin" className="flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}