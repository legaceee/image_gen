import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientToken = req.headers.get("x-hf-token") || "";
  const hfToken = clientToken || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";

  let hfStatus = {
    configured: !!hfToken,
    valid: false,
    username: null as string | null,
    plan: "Free Tier",
    rateLimitRemaining: "Standard Community Quota",
    error: null as string | null,
  };

  if (hfToken) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("https://huggingface.co/api/whoami-v2", {
        headers: { Authorization: `Bearer ${hfToken}` },
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        hfStatus = {
          configured: true,
          valid: true,
          username: data.name || data.fullname || "Hugging Face User",
          plan: data.isPro ? "PRO" : "Free Community",
          rateLimitRemaining: "Active (Refreshes Hourly)",
          error: null,
        };
      } else {
        hfStatus = {
          configured: true,
          valid: false,
          username: null,
          plan: "Unknown",
          rateLimitRemaining: "0",
          error: `Hugging Face token rejected (HTTP ${res.status})`,
        };
      }
    } catch (e: any) {
      hfStatus.error = "Hugging Face network timeout (using High-Speed Free Engine)";
    }
  }

  // Count user generation stats from database
  let userStats = {
    totalGenerated: 0,
    generatedToday: 0,
  };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount] = await Promise.all([
      db.generatedImage.count({ where: { userId: session.user.id } }),
      db.generatedImage.count({ where: { userId: session.user.id, createdAt: { gte: today } } }),
    ]);

    userStats = { totalGenerated: total, generatedToday: todayCount };
  } catch (err) {
    // Database query fallback
  }

  return NextResponse.json({
    success: true,
    huggingFace: hfStatus,
    stats: userStats,
    fallbackEngine: {
      name: "High-Speed Neural Engine",
      status: "Operational",
      quota: "Unlimited Free",
    },
  });
}