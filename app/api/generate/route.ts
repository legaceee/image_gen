import { NextRequest, NextResponse } from "next/server";
import { getHuggingFaceToken } from "@/lib/huggingface";
import { sleep } from "@/lib/utils";

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 832, height: 832 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3":  { width: 896, height: 672 },
  "3:4":  { width: 672, height: 896 },
};

// FLUX-optimized style enhancers - these phrases work well with FLUX diffusion
const STYLE_ENHANCERS: Record<string, { positive: string; negative: string }> = {
  "Photorealistic": {
    positive: "RAW photo, DSLR, natural lighting, sharp focus, ultra realistic, photorealistic, 85mm f/1.8 lens, professional photography",
    negative: "cartoon, anime, illustration, painting, sketch, drawing, CGI, render, blurry, low quality, watermark, text, logo, oversaturated, deformed",
  },
  "Cinematic Octane 8K": {
    positive: "cinematic photograph, film still, 35mm film, anamorphic lens, dramatic lighting, depth of field, movie scene, photorealistic, ultra detailed",
    negative: "cartoon, anime, drawing, flat lighting, blurry, watermark, low quality, text, logo",
  },
  "Cyberpunk High-Tech": {
    positive: "cyberpunk city, neon lights, rain, night scene, blade runner aesthetic, photorealistic, atmospheric, ultra detailed, cinematic",
    negative: "cartoon, anime, daytime, plain background, watermark, text, blurry, low quality",
  },
  "Forensic Raw Evidence": {
    positive: "documentary photograph, journalistic photo, raw unedited, harsh natural light, realistic, DSLR evidence photography, authentic",
    negative: "studio lighting, retouched, beauty filter, HDR, cartoon, watermark, text",
  },
  "Surreal Latent Space": {
    positive: "surreal art, dreamlike atmosphere, painterly, magical realism, vibrant colors, highly detailed, fantasy",
    negative: "photo realistic, blurry, low quality, watermark, text, simple, plain",
  },
};

async function generateViaPollinations(
  prompt: string,
  aspectRatio: string,
  stylePreset: string,
  seed: number
): Promise<{ success: boolean; base64?: string; mime?: string; error?: string }> {
  const dim = DIMENSIONS[aspectRatio] || DIMENSIONS["1:1"];
  const style = STYLE_ENHANCERS[stylePreset] || STYLE_ENHANCERS["Photorealistic"];

  // FLUX-optimized: append cinematic/realism keywords that FLUX responds well to
  const enhancedPrompt = `${prompt}, ${style.positive}`;
  const encoded = encodeURIComponent(enhancedPrompt);

  // Use model=flux (FLUX.1-schnell) on Pollinations — proven to work
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 58000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);

    if (res.ok) {
      const buf = await res.arrayBuffer();
      const base64 = Buffer.from(buf).toString("base64");
      const mime = res.headers.get("content-type") || "image/jpeg";
      return { success: true, base64, mime };
    }

    return { success: false, error: `Engine returned HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.name === "AbortError" ? "Timed out after 58s" : err.message };
  }
}

async function generateViaHuggingFace(
  prompt: string,
  stylePreset: string,
  seed: number,
  token: string
): Promise<{ success: boolean; base64?: string; mime?: string; error?: string }> {
  const modelName = process.env.HF_IMAGE_GEN_MODEL || "black-forest-labs/FLUX.1-schnell";
  const style = STYLE_ENHANCERS[stylePreset] || STYLE_ENHANCERS["Photorealistic"];
  const fullPrompt = `${prompt}, ${style.positive}`;

  const endpoints = [
    `https://api-inference.huggingface.co/models/${modelName}`,
    `https://router.huggingface.co/hf-inference/models/${modelName}`,
  ];

  const payload = {
    inputs: fullPrompt,
    parameters: {
      seed,
      negative_prompt: style.negative,
      guidance_scale: 3.5,
      num_inference_steps: 28,
    },
  };

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 40000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (res.ok) {
        const buf = await res.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        const mime = res.headers.get("content-type") || "image/jpeg";
        return { success: true, base64, mime };
      }

      try { const j = await res.json(); if (j?.error) console.warn("[HF]", j.error); } catch {}
      if (res.status === 503 || res.status === 429) continue;
      return { success: false, error: `HF returned HTTP ${res.status}` };
    } catch { continue; }
  }
  return { success: false, error: "HF endpoints unreachable" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, aspect_ratio = "1:1", style_preset = "Photorealistic", isDemo = false, guidance_scale = 7.5 } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const clientToken = req.headers.get("x-hf-token") || body.apiKey || "";
    const token = getHuggingFaceToken(clientToken) || getHuggingFaceToken(null);
    const seed = body.seed || Math.floor(Math.random() * 999_999_999);
    const t0 = Date.now();

    // Demo mode: fast offline presets
    if (isDemo) {
      await sleep(800);
      const lower = prompt.toLowerCase();
      let sampleUrl = "/samples/synthetic_portrait.svg";
      if (/city|cyber|neon|street|tokyo|night/.test(lower)) sampleUrl = "/samples/synthetic_cyberpunk.svg";
      else if (/nature|mountain|landscape|forest|photo|real/.test(lower)) sampleUrl = "/samples/authentic_camera.svg";
      return NextResponse.json({
        success: true, imageBase64: sampleUrl, isDemo: true, provider: "offline-demo",
        message: "Demo mode active. Turn off Demo Mode in the navbar for live generation.",
        metadata: { prompt, model: "Offline Demo", seed, aspectRatio: aspect_ratio, stylePreset: style_preset, latencyMs: Date.now() - t0 },
      });
    }

    // Live mode
    let result: { success: boolean; base64?: string; mime?: string; error?: string } = { success: false, error: "No provider" };
    let provider = "";
    let modelLabel = "FLUX.1 Neural Engine";

    // Try HF first (if token available)
    if (token) {
      result = await generateViaHuggingFace(prompt, style_preset, seed, token);
      if (result.success) { provider = "huggingface"; modelLabel = process.env.HF_IMAGE_GEN_MODEL || "FLUX.1-schnell"; }
    }

    // Pollinations fallback (always available)
    if (!result.success) {
      result = await generateViaPollinations(prompt, aspect_ratio, style_preset, seed);
      if (result.success) { provider = token ? "huggingface-fallback" : "pollinations-flux"; modelLabel = "FLUX.1 Neural Engine"; }
    }

    // Emergency static fallback
    if (!result.success) {
      return NextResponse.json({
        success: true, imageBase64: "/samples/synthetic_portrait.svg",
        isFallback: true, provider: "offline-emergency",
        message: `All synthesis providers failed: ${result.error}`,
        metadata: { prompt, model: "Emergency Fallback", seed, latencyMs: Date.now() - t0 },
      });
    }

    const dataUrl = `data:${result.mime};base64,${result.base64}`;
    const style = STYLE_ENHANCERS[style_preset] || STYLE_ENHANCERS["Photorealistic"];
    return NextResponse.json({
      success: true, imageBase64: dataUrl, isDemo: false, provider,
      message: `Generated: "${prompt.substring(0, 60)}${prompt.length > 60 ? "..." : ""}"`,
      metadata: {
        prompt, negative_prompt: style.negative,
        model: modelLabel, seed,
        aspectRatio: aspect_ratio, stylePreset: style_preset,
        steps: 28, guidanceScale: 3.5, latencyMs: Date.now() - t0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}