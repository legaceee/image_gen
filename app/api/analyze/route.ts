import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runForensicAnalysis } from "@/lib/forensicEngine";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in to analyze images." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fileName = "unknown.jpg", fileSize = 0, mimeType = "image/jpeg", imageBase64, fromGenerator = false, width = 0, height = 0 } = body;

    // Optionally try HF AI image detector if token is present
    const token = req.headers.get("x-hf-token") || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    
    let hfProbability: number | null = null;
    
    if (token && imageBase64 && !imageBase64.startsWith("/samples")) {
      try {
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": mimeType || "image/jpeg" },
          body: bytes,
          signal: controller.signal,
        });
        clearTimeout(tid);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.label && data[0]?.score != null) {
            const aiLabel = data.find((d: any) => d.label?.toLowerCase().includes("artificial") || d.label?.toLowerCase() === "ai");
            if (aiLabel) hfProbability = Math.round(aiLabel.score * 100);
          }
        }
      } catch {
        // HF model unavailable — use local engine
      }
    }

    const engineResult = runForensicAnalysis(fileName, fileSize, mimeType, fromGenerator, width, height);

    // If HF gave us a real result, blend it with our local engine (60% HF, 40% local)
    const finalProbability = hfProbability != null
      ? Math.round(hfProbability * 0.6 + engineResult.syntheticProbability * 0.4)
      : engineResult.syntheticProbability;

    let verdict: "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE" = engineResult.verdict;
    let confidence = engineResult.confidence;
    if (hfProbability != null) {
      if (finalProbability >= 75) { verdict = "SYNTHETIC"; confidence = "HIGH"; }
      else if (finalProbability <= 35) { verdict = "AUTHENTIC"; confidence = "HIGH"; }
      else { verdict = "INCONCLUSIVE"; confidence = "MEDIUM"; }
    }

    return NextResponse.json({
      success: true,
      result: {
        ...engineResult,
        syntheticProbability: finalProbability,
        verdict,
        confidence,
        hfModelUsed: hfProbability != null,
        hfProbability,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Analysis failed" }, { status: 500 });
  }
}