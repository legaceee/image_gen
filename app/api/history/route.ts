import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    db.generatedImage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        prompt: true,
        stylePreset: true,
        aspectRatio: true,
        model: true,
        provider: true,
        storageUrl: true,
        fileSizeBytes: true,
        latencyMs: true,
        createdAt: true,
        _count: { select: { analysisResults: true } },
      },
    }),
    db.generatedImage.count({ where: { userId: session.user.id } }),
  ]);

  // Stats
  const [styleStats, avgLatency] = await Promise.all([
    db.generatedImage.groupBy({
      by: ["stylePreset"],
      where: { userId: session.user.id },
      _count: true,
      orderBy: { _count: { stylePreset: "desc" } },
      take: 1,
    }),
    db.generatedImage.aggregate({
      where: { userId: session.user.id },
      _avg: { latencyMs: true },
    }),
  ]);

  return NextResponse.json({
    images,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      total,
      topStyle: styleStats[0]?.stylePreset || null,
      avgLatencyMs: Math.round(avgLatency._avg.latencyMs || 0),
    },
  });
}