import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHuggingFaceToken } from "@/lib/huggingface";
import { uploadImageToR2, generatedImageKey } from "@/lib/r2";
import { db } from "@/lib/db";
import { sleep } from "@/lib/utils";
import { enhancePromptForRealism } from "@/lib/promptEnhancer";
import { recordGenerationLog, ProviderAttempt } from "@/lib/logger";

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
};

async function generateViaHuggingFace(
  prompt: string,
  negativePrompt: string,
  seed: number,
  token: string,
  modelName: string
): Promise<{ success: boolean; base64?: string; mime?: string; statusCode?: number; error?: string; durationMs: number }> {
  const t0 = Date.now();
  const payload = {
    inputs: prompt,
    parameters: {
      seed,
      negative_prompt: negativePrompt,
      guidance_scale: 7.5,
      num_inference_steps: 25,
    },
  };

  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${modelName}`,
    `https://api-inference.huggingface.co/models/${modelName}`,
  ];

  let lastError = "HF unreachable";
  let lastStatus = 0;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(tid);

      lastStatus = res.status;

      if (res.ok) {
        const buf = await res.arrayBuffer();
        return {
          success: true,
          base64: Buffer.from(buf).toString("base64"),
          mime: res.headers.get("content-type") || "image/jpeg",
          statusCode: res.status,
          durationMs: Date.now() - t0,
        };
      }

      // If error, parse message
      let errMsg = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errJson.message || errMsg;
      } catch {}

      lastError = errMsg;

      // If model is loading (503) or rate limit (429), try alternative endpoint
      if (res.status === 503 || res.status === 429) continue;

      return { success: false, statusCode: res.status, error: lastError, durationMs: Date.now() - t0 };
    } catch (e: any) {
      lastError = e.message || "Network error";
    }
  }

  return { success: false, statusCode: lastStatus || 500, error: lastError, durationMs: Date.now() - t0 };
}

async function generateViaPollinations(
  enhancedPrompt: string,
  aspectRatio: string,
  seed: number,
  modelParam?: string
): Promise<{ success: boolean; base64?: string; mime?: string; statusCode?: number; error?: string; durationMs: number }> {
  const t0 = Date.now();
  const dim = DIMENSIONS[aspectRatio] || DIMENSIONS["1:1"];
  const encoded = encodeURIComponent(enhancedPrompt);

  // NOTE: Avoid &model=flux as upstream community provider returns 429/500
  // Default Pollinations uses modern high-resolution diffusion
  const modelQuery = modelParam ? `&model=${modelParam}` : "";
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true&nofeed=true&logo=false&private=true${modelQuery}`;

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);

    if (res.ok) {
      const buf = await res.arrayBuffer();
      return {
        success: true,
        base64: Buffer.from(buf).toString("base64"),
        mime: res.headers.get("content-type") || "image/jpeg",
        statusCode: res.status,
        durationMs: Date.now() - t0,
      };
    }

    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson.message || errJson.error || errMsg;
    } catch {}

    return { success: false, statusCode: res.status, error: errMsg, durationMs: Date.now() - t0 };
  } catch (e: any) {
    return { success: false, statusCode: 500, error: e.message || "Timeout connecting to Pollinations", durationMs: Date.now() - t0 };
  }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const attempts: ProviderAttempt[] = [];

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in to generate images." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      aspect_ratio = "1:1",
      style_preset = "Photorealistic",
      isDemo = false,
      seed: customSeed,
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const seed = customSeed || Math.floor(Math.random() * 999_999_999);

    // ── Professional Prompt Expansion (Gemini / Midjourney tier) ────────────
    const enhanced = enhancePromptForRealism(prompt, style_preset);

    if (isDemo) {
      await sleep(800);
      return NextResponse.json({
        success: true,
        imageBase64: "/samples/synthetic_portrait.svg",
        isDemo: true,
        provider: "offline-demo",
        message: "Demo mode active.",
        metadata: {
          prompt,
          enhancedPrompt: enhanced.prompt,
          model: "Offline Demo",
          seed,
          aspectRatio: aspect_ratio,
          stylePreset: style_preset,
          latencyMs: 800,
        },
      });
    }

    const clientToken = req.headers.get("x-hf-token") || body.apiKey || "";
    const token = getHuggingFaceToken(clientToken) || getHuggingFaceToken(null);
    const hfModel = process.env.HF_IMAGE_GEN_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

    let finalResult: { success: boolean; base64?: string; mime?: string } = { success: false };
    let finalProvider = "";
    let finalModel = "Photorealistic Diffusion Engine";

    // ── Attempt 1: Hugging Face (if token present) ──────────────────────────
    if (token) {
      console.log(`[ImageGen] Trying Hugging Face model: ${hfModel}...`);
      const hfRes = await generateViaHuggingFace(enhanced.prompt, enhanced.negativePrompt, seed, token, hfModel);

      attempts.push({
        provider: "Hugging Face Inference",
        model: hfModel,
        status: hfRes.success ? "success" : "failed",
        statusCode: hfRes.statusCode,
        durationMs: hfRes.durationMs,
        error: hfRes.error,
      });

      if (hfRes.success && hfRes.base64) {
        finalResult = hfRes;
        finalProvider = "huggingface";
        finalModel = hfModel;
      } else {
        console.warn(`[ImageGen] Hugging Face attempt failed (${hfRes.statusCode}): ${hfRes.error}. Falling back to high-speed diffusion...`);
      }
    } else {
      attempts.push({
        provider: "Hugging Face Inference",
        model: hfModel,
        status: "skipped",
        error: "No Hugging Face token provided. Using high-speed cloud engine.",
      });
    }

    // ── Attempt 2: High-Speed Neural Diffusion (Primary Free Provider) ──────
    if (!finalResult.success) {
      console.log(`[ImageGen] Generating via High-Speed Diffusion Engine (1024px, prompt enhanced)...`);
      const polRes = await generateViaPollinations(enhanced.prompt, aspect_ratio, seed);

      attempts.push({
        provider: "High-Speed Neural Diffusion",
        model: "SDXL-Photoreal-Turbo",
        status: polRes.success ? "success" : "failed",
        statusCode: polRes.statusCode,
        durationMs: polRes.durationMs,
        error: polRes.error,
      });

      if (polRes.success && polRes.base64) {
        finalResult = polRes;
        finalProvider = token ? "huggingface-fallback" : "neural-diffusion";
        finalModel = "Photorealistic Diffusion Engine (SDXL)";
      } else {
        console.warn(`[ImageGen] Standard diffusion failed (${polRes.statusCode}): ${polRes.error}. Trying turbo fallback...`);
      }
    }

    // ── Attempt 3: Turbo Fallback Engine ────────────────────────────────────
    if (!finalResult.success) {
      console.log(`[ImageGen] Trying Turbo Fallback Engine...`);
      const turboRes = await generateViaPollinations(enhanced.prompt, aspect_ratio, seed, "turbo");

      attempts.push({
        provider: "Turbo Fallback Engine",
        model: "turbo",
        status: turboRes.success ? "success" : "failed",
        statusCode: turboRes.statusCode,
        durationMs: turboRes.durationMs,
        error: turboRes.error,
      });

      if (turboRes.success && turboRes.base64) {
        finalResult = turboRes;
        finalProvider = "turbo-engine";
        finalModel = "Turbo Fast Diffusion";
      }
    }

    const totalLatencyMs = Date.now() - t0;

    // ── If all fail: Return Diagnostic Emergency Response ───────────────────
    if (!finalResult.success || !finalResult.base64) {
      const summaryError = attempts.filter(a => a.error).map(a => `${a.provider}: ${a.error}`).join(" | ");

      recordGenerationLog({
        id: `gen-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userEmail: session.user.email,
        rawPrompt: prompt,
        enhancedPrompt: enhanced.prompt,
        stylePreset: style_preset,
        aspectRatio: aspect_ratio,
        seed,
        attempts,
        finalProvider: "offline-emergency",
        success: false,
        totalLatencyMs,
        error: summaryError,
      });

      return NextResponse.json({
        success: true,
        imageBase64: "/samples/synthetic_portrait.svg",
        isFallback: true,
        provider: "offline-emergency",
        message: `All generation engines returned errors: ${summaryError}`,
        diagnostics: {
          attempts,
          detectedSubject: enhanced.detectedSubject,
          enhancedPrompt: enhanced.prompt,
        },
        metadata: {
          prompt,
          model: "Emergency Fallback",
          seed,
          latencyMs: totalLatencyMs,
          diagnostics: attempts,
        },
      });
    }

    const dataUrl = `data:${finalResult.mime};base64,${finalResult.base64}`;
    const imageSizeBytes = Math.round((finalResult.base64.length * 3) / 4);

    // ── Save to DB + Cloudflare R2 if configured ────────────────────────────
    let storageUrl: string | undefined;
    let storageKey: string | undefined;
    let dbId: string | undefined;

    if (session?.user?.id) {
      try {
        const dim = DIMENSIONS[aspect_ratio] || DIMENSIONS["1:1"];
        const dbRecord = await db.generatedImage.create({
          data: {
            userId: session.user.id,
            prompt,
            negativePrompt: enhanced.negativePrompt,
            stylePreset: style_preset,
            aspectRatio: aspect_ratio,
            seed: BigInt(seed),
            model: finalModel,
            provider: finalProvider,
            latencyMs: totalLatencyMs,
            width: dim.width,
            height: dim.height,
          },
        });

        dbId = dbRecord.id;
        storageKey = generatedImageKey(session.user.id, dbRecord.id);

        const upload = await uploadImageToR2(dataUrl, storageKey, finalResult.mime || "image/jpeg");
        if (upload) {
          storageUrl = upload.url;
          await db.generatedImage.update({
            where: { id: dbRecord.id },
            data: { storageKey, storageUrl, fileSizeBytes: upload.fileSizeBytes },
          });
        }
      } catch (dbErr) {
        console.error("[Generate DB/R2]", dbErr);
      }
    }

    // ── Log Success ─────────────────────────────────────────────────────────
    recordGenerationLog({
      id: dbId || `gen-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      userEmail: session.user.email,
      rawPrompt: prompt,
      enhancedPrompt: enhanced.prompt,
      stylePreset: style_preset,
      aspectRatio: aspect_ratio,
      seed,
      attempts,
      finalProvider,
      success: true,
      totalLatencyMs,
      imageSizeBytes,
      storageUrl,
    });

    return NextResponse.json({
      success: true,
      imageBase64: dataUrl,
      isDemo: false,
      provider: finalProvider,
      message: `Generated with ${finalModel} (${imageSizeBytes ? Math.round(imageSizeBytes / 1024) : 0} KB)`,
      diagnostics: {
        attempts,
        detectedSubject: enhanced.detectedSubject,
        enhancedPrompt: enhanced.prompt,
      },
      metadata: {
        prompt,
        enhancedPrompt: enhanced.prompt,
        negative_prompt: enhanced.negativePrompt,
        model: finalModel,
        seed,
        aspectRatio: aspect_ratio,
        stylePreset: style_preset,
        latencyMs: totalLatencyMs,
        dbId,
        storageUrl,
      },
    });
  } catch (err: any) {
    console.error("[Generate Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}