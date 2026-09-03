import { NextRequest, NextResponse } from "next/server";
import { runForensicAnalysis } from "@/lib/forensicEngine";
import { detectAiWithHuggingFace, getHuggingFaceToken } from "@/lib/huggingface";
import { DEMO_PRESETS } from "@/lib/mockData";
import { sleep } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fileName = "uploaded_media.png";
    let fileSize = 1024000;
    let mimeType = "image/png";
    let imageBuffer: Buffer | undefined;
    let presetId: string | undefined;
    let isDemo = false;
    let imageBase64: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      presetId = (formData.get("presetId") as string) || undefined;
      isDemo = formData.get("isDemo") === "true";

      if (file) {
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type || "image/png";
        const arrayBuf = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      }
    } else {
      const body = await req.json();
      presetId = body.presetId;
      isDemo = Boolean(body.isDemo);
      fileName = body.fileName || "analyzed_image.png";
      fileSize = body.fileSize || 1200000;
      mimeType = body.mimeType || "image/png";
      imageBase64 = body.imageBase64;

      if (imageBase64 && imageBase64.startsWith("data:")) {
        const base64Data = imageBase64.split(",")[1];
        if (base64Data) {
          imageBuffer = Buffer.from(base64Data, "base64");
          fileSize = imageBuffer.length;
        }
      }
    }

    // Preset lookup (instant presentation mode)
    if (presetId) {
      const matched = DEMO_PRESETS.find((p) => p.id === presetId);
      if (matched) {
        await sleep(900); // Sleek forensic calculation scan time
        return NextResponse.json({
          success: true,
          report: matched.report,
          isDemo: true,
          isPreset: true,
        });
      }
    }

    // If demo mode is toggled on, check if file matches one of the sample names
    if (isDemo) {
      await sleep(1000);
      for (const preset of DEMO_PRESETS) {
        if (fileName.includes(preset.report.fileName) || preset.imagePath.includes(fileName)) {
          return NextResponse.json({
            success: true,
            report: preset.report,
            isDemo: true,
          });
        }
      }
    }

    // Check if Hugging Face token is available for live classification
    let aiProbabilityOverride: number | undefined;
    const token = getHuggingFaceToken();

    if (token && imageBuffer) {
      const hfDetection = await detectAiWithHuggingFace(imageBuffer);
      if (hfDetection.success && hfDetection.result) {
        aiProbabilityOverride = hfDetection.result.aiProbability;
      }
    }

    // Run Forensic Engine
    await sleep(700);
    const report = await runForensicAnalysis({
      fileName,
      fileSize,
      mimeType,
      buffer: imageBuffer,
      dataUrl: imageBase64,
      aiScoreOverride: aiProbabilityOverride,
    });

    return NextResponse.json({
      success: true,
      report,
      isDemo: isDemo || !token,
      isLiveInference: Boolean(token && aiProbabilityOverride !== undefined),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute forensic image integrity analysis",
      },
      { status: 500 }
    );
  }
}
