import React from "react";
import Link from "next/link";
import { Cpu, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Reset Password — AI Image Suite" };

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-gradient">
        <div className="w-full max-w-md">
          <GlassCard className="p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
            <p className="font-bold text-ink-900">Invalid reset link</p>
            <p className="text-sm text-ink-500">This link is missing or malformed.</p>
            <Link href="/auth/forgot-password" className="inline-block text-sm text-brand-600 hover:underline">
              Request a new reset link
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Set new password</h1>
          <p className="text-sm text-ink-500">Choose a strong password for your account.</p>
        </div>
        <GlassCard animate className="p-6">
          <ResetPasswordForm token={token} />
        </GlassCard>
      </div>
    </div>
  );
}