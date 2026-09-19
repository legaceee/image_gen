import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata = { title: "Create Account — AI Image Suite" };

export default function SignUpPage() {
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasGitHub = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Create your account</h1>
          <p className="text-sm text-ink-500">Start generating and analyzing AI images</p>
        </div>

        <GlassCard animate className="p-6 space-y-5">
          <SignUpForm />

          {(hasGoogle || hasGitHub) && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-200" /></div>
                <div className="relative flex justify-center text-xs text-ink-400">
                  <span className="px-3 bg-white/70 backdrop-blur-sm rounded">or continue with</span>
                </div>
              </div>
              <OAuthButtons hasGoogle={hasGoogle} hasGitHub={hasGitHub} />
            </>
          )}

          <p className="text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}