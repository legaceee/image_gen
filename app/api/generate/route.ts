import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHuggingFaceToken } from "@/lib/huggingface";
import { uploadImageToR2, generatedImageKey } from "@/lib/r2";
import { db } from "@/lib/db";
import { sleep } from "@/lib/utils";

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 832, height: 832 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3": { width: 896, height: 672 },
  "3:4": { width: 672, height: 896 },
};

const STYLE_ENHANCERS: Record<string, { positive: string; negative: string }> = {
  "Photorealistic": {
    positive: "RAW photo, DSLR, natural lighting, sharp focus, ultra realistic, photorealistic, 85mm f/1.8 lens, professional photography",
    negative: "cartoon, anime, illustration, painting, sketch, blurry, low quality, watermark, text, logo, deformed",
  },
  "Cinematic Octane 8K": {
    positive: "cinematic photograph, film still, 35mm film, anamorphic lens, dramatic lighting, depth of field, photorealistic",
    negative: "cartoon, anime, drawing, flat lighting, blurry, watermark, text",
  },
  "Cyberpunk High-Tech": {
    positive: "cyberpunk city, neon lights, rain, night scene, blade runner aesthetic, photorealistic, cinematic",
    negative: "cartoon, anime, daytime, plain background, watermark, blurry",
  },
  "Forensic Raw Evidence": {
    positive: "documentary photograph, journalistic photo, raw unedited, harsh natural light, realistic, authentic",
    negative: "studio lighting, retouched, beauty filter, HDR, cartoon, watermark",
  },
  "Surreal Latent Space": {
    positive: "surreal art, dreamlike atmosphere, painterly, magical realism, vibrant colors, highly detailed, fantasy",
    negative: "photo realistic, blurry, low quality, watermark, text",
  },
};

async function generateViaPollinations(prompt: string, aspectRatio: string, stylePreset: string, seed: number) {
  const dim = DIMENSIONS[aspectRatio] || DIMENSIONS["1:1"];
  const style = STYLE_ENHANCERS[stylePreset] || STYLE_ENHANCERS["Photorealistic"];
  const encoded = encodeURIComponent(`${prompt}, ${style.positive}`);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true&model=flux`;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 58000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(tid);

  if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
  const buf = await res.arrayBuffer();
  return { success: true, base64: Buffer.from(buf).toString("base64"), mime: res.headers.get("content-type") || "image/jpeg" };
}

async function generateViaHuggingFace(prompt: string, stylePreset: string, seed: number, token: string) {
  const modelName = process.env.HF_IMAGE_GEN_MODEL || "black-forest-labs/FLUX.1-schnell";
  const style = STYLE_ENHANCERS[stylePreset] || STYLE_ENHANCERS["Photorealistic"];
  const payload = { inputs: `${prompt}, ${style.positive}`, parameters: { seed, negative_prompt: style.negative, guidance_scale: 3.5, num_inference_steps: 28 } };

  for (const endpoint of [`https://api-inference.huggingface.co/models/${modelName}`, `https://router.huggingface.co/hf-inference/models/${modelName}`]) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 40000);
      const res = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) { const buf = await res.arrayBuffer(); return { success: true, base64: Buffer.from(buf).toString("base64"), mime: res.headers.get("content-type") || "image/jpeg" }; }
      if (res.status === 503 || res.status === 429) continue;
      return { success: false, error: `HF HTTP ${res.status}` };
    } catch { continue; }
  }
  return { success: false, error: "HF unreachable" };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { prompt, aspect_ratio = "1:1", style_preset = "Photorealistic", isDemo = false, guidance_scale = 7.5 } = body;

    if (!prompt?.trim()) return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });

    const clientToken = req.headers.get("x-hf-token") || body.apiKey || "";
    const token = getHuggingFaceToken(clientToken) || getHuggingFaceToken(null);
    const seed = body.seed || Math.floor(Math.random() * 999_999_999);
    const t0 = Date.now();

    if (isDemo) {
      await sleep(800);
      return NextResponse.json({ success: true, imageBase64: "/samples/synthetic_portrait.svg", isDemo: true, provider: "offline-demo", message: "Demo mode active.",
        metadata: { prompt, model: "Offline Demo", seed, aspectRatio: aspect_ratio, stylePreset: style_preset, latencyMs: 800 } });
    }

    let result: any = { success: false };
    let provider = "";
    let modelLabel = "FLUX.1 Neural Engine";

    if (token) {
      result = await generateViaHuggingFace(prompt, style_preset, seed, token);
      if (result.success) { provider = "huggingface"; modelLabel = process.env.HF_IMAGE_GEN_MODEL || "FLUX.1-schnell"; }
    }

    if (!result.success) {
      result = await generateViaPollinations(prompt, aspect_ratio, style_preset, seed);
      if (result.success) { provider = token ? "huggingface-fallback" : "pollinations-flux"; modelLabel = "FLUX.1 Neural Engine"; }
    }

    if (!result.success) {
      return NextResponse.json({ success: true, imageBase64: "/samples/synthetic_portrait.svg", isFallback: true, provider: "offline-emergency",
        message: `Generation failed: ${result.error}`, metadata: { prompt, model: "Emergency Fallback", seed, latencyMs: Date.now() - t0 } });
    }

    const dataUrl = `data:${result.mime};base64,${result.base64}`;
    const latencyMs = Date.now() - t0;

    // Save to DB + R2 if user is authenticated
    let storageUrl: string | undefined;
    let storageKey: string | undefined;
    let dbId: string | undefined;

    if (session?.user?.id) {
      try {
        // Create DB record first to get the ID for the R2 key
        const dim = DIMENSIONS[aspect_ratio] || DIMENSIONS["1:1"];
        const dbRecord = await db.generatedImage.create({
          data: {
            userId: session.user.id,
            prompt,
            negativePrompt: (STYLE_ENHANCERS[style_preset] || STYLE_ENHANCERS["Photorealistic"]).negative,
            stylePreset: style_preset,
            aspectRatio: aspect_ratio,
            seed: BigInt(seed),
            model: modelLabel,
            provider,
            latencyMs,
            width: dim.width,
            height: dim.height,
          },
        });

        dbId = dbRecord.id;
        storageKey = generatedImageKey(session.user.id, dbRecord.id);

        // Upload to R2
        const upload = await uploadImageToR2(dataUrl, storageKey, result.mime);
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

    const style = STYLE_ENHANCERS[style_preset] || STYLE_ENHANCERS["Photorealistic"];
    return NextResponse.json({
      success: true, imageBase64: dataUrl, isDemo: false, provider,
      message: `Generated: "${prompt.substring(0, 60)}${prompt.length > 60 ? "..." : ""}"`,
      metadata: { prompt, negative_prompt: style.negative, model: modelLabel, seed, aspectRatio: aspect_ratio, stylePreset: style_preset, steps: 28, guidanceScale: 3.5, latencyMs, dbId, storageUrl },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}