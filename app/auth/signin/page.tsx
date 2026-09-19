import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata = { title: "Sign In — AI Image Suite" };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; registered?: string; reset?: string };
}) {
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasGitHub = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const callbackUrl = searchParams.callbackUrl || "/generate";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-gradient">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-ink-500">Sign in to your AI Image Suite account</p>
        </div>

        <GlassCard animate className="p-6 space-y-5">
          {searchParams.registered && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              Account created! Sign in below.
            </div>
          )}
          {searchParams.reset && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              Password updated. Sign in with your new password.
            </div>
          )}

          <SignInForm callbackUrl={callbackUrl} />

          {(hasGoogle || hasGitHub) && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ink-200" />
                </div>
                <div className="relative flex justify-center text-xs text-ink-400 bg-transparent">
                  <span className="px-3 bg-white/70 backdrop-blur-sm rounded">or continue with</span>
                </div>
              </div>
              <OAuthButtons callbackUrl={callbackUrl} hasGoogle={hasGoogle} hasGitHub={hasGitHub} />
            </>
          )}

          <p className="text-center text-sm text-ink-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Sign up free
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}