export interface HfGenerationParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  tokenOverride?: string | null;
}

export interface HfDetectionResult {
  aiProbability: number;
  label: string;
  rawScores: { label: string; score: number }[];
}

export function getHuggingFaceToken(customToken?: string | null): string | null {
  if (customToken && customToken.trim().length > 0) return customToken.trim();
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
  return token.trim().length > 0 ? token.trim() : null;
}

export async function generateImageWithHuggingFace(
  params: HfGenerationParams,
  modelName = process.env.HF_IMAGE_GEN_MODEL || "stabilityai/stable-diffusion-xl-base-1.0"
): Promise<{ success: boolean; imageBase64?: string; error?: string; modelUsed: string; isDeprecated?: boolean }> {
  const token = getHuggingFaceToken(params.tokenOverride);

  if (!token) {
    return {
      success: false,
      error: "HUGGINGFACE_API_KEY or HF_TOKEN is not configured",
      modelUsed: modelName,
    };
  }

  // Detect known deprecated model IDs on Hugging Face's serverless router
  if (modelName.includes("FLUX.1-schnell")) {
    return {
      success: false,
      isDeprecated: true,
      error: "Model deprecated on HF serverless tier. Automatically switched to Neural Diffusion Engine.",
      modelUsed: modelName,
    };
  }

  // List of endpoint routers to try
  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${modelName}`,
    `https://api-inference.huggingface.co/models/${modelName}`,
  ];

  const payload: Record<string, any> = {
    inputs: params.prompt,
    parameters: {},
  };

  if (params.negative_prompt) {
    payload.parameters.negative_prompt = params.negative_prompt;
  }
  if (params.seed !== undefined) {
    payload.parameters.seed = params.seed;
  }
  if (params.guidance_scale !== undefined) {
    payload.parameters.guidance_scale = params.guidance_scale;
  }

  let lastError = "";
  let isDeprecated = false;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return {
          success: true,
          imageBase64: dataUrl,
          modelUsed: modelName,
        };
      }

      let errDetail = `Status ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.error) {
          errDetail = errJson.error;
        }
      } catch {}

      if (response.status === 410 || response.status === 400 || errDetail.toLowerCase().includes("deprecated") || errDetail.toLowerCase().includes("not supported by provider")) {
        isDeprecated = true;
        lastError = "Hugging Face serverless diffusion deprecated by provider. Routed to Neural Diffusion Engine.";
        break;
      }

      lastError = errDetail;
    } catch (err: any) {
      lastError = err.message || "Network error calling Hugging Face";
    }
  }

  return {
    success: false,
    isDeprecated,
    error: lastError,
    modelUsed: modelName,
  };
}

export async function detectAiWithHuggingFace(
  imageBuffer: Buffer,
  tokenOverride?: string | null,
  modelName = process.env.HF_IMAGE_DETECT_MODEL || "umm-maybe/AI-image-detector"
): Promise<{ success: boolean; result?: HfDetectionResult; error?: string }> {
  const token = getHuggingFaceToken(tokenOverride);

  if (!token) {
    return {
      success: false,
      error: "HUGGINGFACE_API_KEY is not configured",
    };
  }

  try {
    const endpoint = `https://api-inference.huggingface.co/models/${modelName}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(imageBuffer),
    });

    if (!response.ok) {
      let errDetail = `Status ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errDetail = errJson.error;
      } catch {
        // Ignored
      }
      return { success: false, error: errDetail };
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      const items: { label: string; score: number }[] = Array.isArray(data[0]) ? data[0] : data;
      let aiScore = 0.5;
      for (const item of items) {
        const lower = (item.label || "").toLowerCase();
        if (lower.includes("artificial") || lower.includes("fake") || lower.includes("ai") || lower.includes("synthetic")) {
          aiScore = item.score;
          break;
        } else if (lower.includes("human") || lower.includes("real") || lower.includes("authentic")) {
          aiScore = 1 - item.score;
          break;
        }
      }

      return {
        success: true,
        result: {
          aiProbability: Math.round(aiScore * 1000) / 10,
          label: aiScore > 0.5 ? "SYNTHETIC" : "AUTHENTIC",
          rawScores: items,
        },
      };
    }

    return { success: false, error: "Unexpected output schema from detection model" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to reach AI detection endpoint",
    };
  }
}