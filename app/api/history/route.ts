import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { uploadImageToR2, generatedImageKey } from "@/lib/r2";

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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      prompt,
      negativePrompt,
      stylePreset = "Photorealistic",
      aspectRatio = "1:1",
      seed = 0,
      model = "SDXL Edge Diffusion",
      provider = "edge-neural-diffusion",
      latencyMs = 0,
      width = 768,
      height = 768,
      imageBase64,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const dbRecord = await db.generatedImage.create({
      data: {
        userId: session.user.id,
        prompt,
        negativePrompt: negativePrompt || null,
        stylePreset,
        aspectRatio,
        seed: BigInt(seed || Math.floor(Math.random() * 999_999_999)),
        model,
        provider,
        latencyMs: Math.round(latencyMs || 0),
        width: Number(width) || 768,
        height: Number(height) || 768,
      },
    });

    let storageUrl: string | null = null;
    let fileSizeBytes = 0;

    if (imageBase64 && imageBase64.length > 50) {
      const storageKey = generatedImageKey(session.user.id, dbRecord.id);
      const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      const upload = await uploadImageToR2(dataUrl, storageKey, "image/jpeg");

      if (upload) {
        storageUrl = upload.url;
        fileSizeBytes = upload.fileSizeBytes;
        await db.generatedImage.update({
          where: { id: dbRecord.id },
          data: {
            storageKey,
            storageUrl,
            fileSizeBytes,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      id: dbRecord.id,
      storageUrl,
    });
  } catch (err: any) {
    console.error("[History Save Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to save history" }, { status: 500 });
  }
}