import { NextRequest, NextResponse } from "next/server";
import { getHuggingFaceToken } from "@/lib/huggingface";
import { sleep } from "@/lib/utils";

// Optimal dimensions - 768px avoids Pollinations rate limits on large sizes
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 768, height: 768 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3":  { width: 896, height: 672 },
  "3:4":  { width: 672, height: 896 },
};

const STYLE_ENHANCERS: Record<string, string> = {
  "Photorealistic":       "photorealistic, professional photograph, sharp focus, high quality, detailed",
  "Cyberpunk High-Tech":  "cyberpunk, neon lights, futuristic city, dark atmosphere, cinematic lighting",
  "Cinematic Octane 8K":  "cinematic, dramatic lighting, film quality, epic scene, ultra detailed",
  "Forensic Raw Evidence":"documentary photograph, forensic evidence, raw unedited, realistic",
  "Surreal Latent Space": "surreal, dreamlike, vibrant colors, fantasy, artistic masterpiece",
};

async function generateViaPollinations(
  prompt: string,
  aspectRatio: string,
  stylePreset: string,
  seed: number
): Promise<{ success: boolean; base64?: string; mime?: string; error?: string }> {
  const dim = DIMENSIONS[aspectRatio] || DIMENSIONS["1:1"];
  const enhancer = STYLE_ENHANCERS[stylePreset] || "high quality, detailed";
  const fullPrompt = `${prompt}, ${enhancer}`;
  const encoded = encodeURIComponent(fullPrompt);

  // Note: no 'enhance' param - causes 429 on busy servers; deterministic seed + nologo is sufficient
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString("base64");
      const mime = res.headers.get("content-type") || "image/jpeg";
      return { success: true, base64, mime };
    }

    return { success: false, error: `HTTP ${res.status} from generation engine` };
  } catch (err: any) {
    return { success: false, error: err.name === "AbortError" ? "Synthesis timed out (55s)" : err.message };
  }
}

async function generateViaHuggingFace(
  prompt: string,
  stylePreset: string,
  seed: number,
  token: string,
  negative?: string
): Promise<{ success: boolean; base64?: string; mime?: string; error?: string }> {
  const modelName = process.env.HF_IMAGE_GEN_MODEL || "black-forest-labs/FLUX.1-schnell";
  const enhancer = STYLE_ENHANCERS[stylePreset] || "high quality, detailed";
  const fullPrompt = `${prompt}, ${enhancer}`;

  const endpoints = [
    `https://api-inference.huggingface.co/models/${modelName}`,
    `https://router.huggingface.co/hf-inference/models/${modelName}`,
  ];

  const payload = {
    inputs: fullPrompt,
    parameters: { seed, ...(negative ? { negative_prompt: negative } : {}) },
  };

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString("base64");
        const mime = res.headers.get("content-type") || "image/jpeg";
        return { success: true, base64, mime };
      }

      let errMsg = `HTTP ${res.status}`;
      try { const j = await res.json(); if (j?.error) errMsg = j.error; } catch {}
      if (res.status === 503 || res.status === 429) continue; // warming up - try next
      return { success: false, error: errMsg };
    } catch {
      continue; // network error — try next endpoint
    }
  }
  return { success: false, error: "Hugging Face endpoints unreachable" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      negative_prompt,
      aspect_ratio = "1:1",
      style_preset = "Photorealistic",
      isDemo = false,
      guidance_scale = 7.5,
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const clientToken = req.headers.get("x-hf-token") || body.apiKey || "";
    const token = getHuggingFaceToken(clientToken) || getHuggingFaceToken(null);
    const seed = body.seed || Math.floor(Math.random() * 999999999);
    const startTime = Date.now();

    // === DEMO MODE: instant offline presets ===
    if (isDemo) {
      await sleep(900);
      const lower = prompt.toLowerCase();
      let sampleUrl = "/samples/synthetic_portrait.svg";
      if (lower.includes("city") || lower.includes("cyber") || lower.includes("neon") || lower.includes("street")) {
        sampleUrl = "/samples/synthetic_cyberpunk.svg";
      } else if (lower.includes("nature") || lower.includes("mountain") || lower.includes("landscape") || lower.includes("forest")) {
        sampleUrl = "/samples/authentic_camera.svg";
      }
      return NextResponse.json({
        success: true,
        imageBase64: sampleUrl,
        isDemo: true,
        provider: "offline-demo",
        message: "Offline demonstration preset active. Toggle Demo Mode off for live AI image generation.",
        metadata: { prompt, model: "FLUX.1 [Offline Preset]", seed, aspectRatio: aspect_ratio, stylePreset: style_preset, latencyMs: Date.now() - startTime },
      });
    }

    // === LIVE MODE: HF first, Pollinations fallback ===
    let result: { success: boolean; base64?: string; mime?: string; error?: string } = { success: false, error: "No provider" };
    let provider = "";
    let modelLabel = "FLUX.1 Neural Diffusion Engine";

    // 1. Hugging Face (if token available and reachable)
    if (token) {
      result = await generateViaHuggingFace(prompt, style_preset, seed, token, negative_prompt);
      if (result.success) {
        provider = "huggingface";
        modelLabel = process.env.HF_IMAGE_GEN_MODEL || "black-forest-labs/FLUX.1-schnell";
      }
    }

    // 2. Pollinations FLUX engine (primary if HF unavailable, fallback otherwise)
    if (!result.success) {
      result = await generateViaPollinations(prompt, aspect_ratio, style_preset, seed);
      if (result.success) {
        provider = token ? "huggingface-fallback" : "pollinations-flux";
        modelLabel = "FLUX.1 Neural Diffusion Engine";
      }
    }

    // 3. Emergency static fallback (network completely down)
    if (!result.success) {
      return NextResponse.json({
        success: true,
        imageBase64: "/samples/synthetic_portrait.svg",
        isFallback: true,
        isDemo: false,
        provider: "offline-emergency",
        message: `Generation unavailable (${result.error}). Showing offline benchmark.`,
        metadata: { prompt, model: "Emergency Fallback", seed, aspectRatio: aspect_ratio, latencyMs: Date.now() - startTime },
      });
    }

    const dataUrl = `data:${result.mime};base64,${result.base64}`;
    return NextResponse.json({
      success: true,
      imageBase64: dataUrl,
      isDemo: false,
      provider,
      message: `Synthesized: "${prompt.substring(0, 60)}${prompt.length > 60 ? "..." : ""}"`,
      metadata: {
        prompt,
        negative_prompt: negative_prompt || "blurry, low quality, deformed, watermark",
        model: modelLabel,
        seed,
        aspectRatio: aspect_ratio,
        stylePreset: style_preset,
        sampler: "FLUX Flow Matching / Euler",
        steps: 28,
        guidanceScale: guidance_scale,
        latencyMs: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}