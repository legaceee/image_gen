/**
 * Professional Prompt Enhancement Engine
 * Translates basic user prompts into hyperrealistic, National Geographic / Midjourney-tier
 * photographic descriptions (similar to how ChatGPT / DALL-E 3 expands prompts internally).
 */

interface EnhanceOptions {
  stylePreset?: string;
  qualityBoost?: boolean;
}

export function enhancePromptForRealism(rawPrompt: string, stylePreset = "Photorealistic"): {
  prompt: string;
  negativePrompt: string;
  detectedSubject: string;
} {
  const clean = rawPrompt.trim();
  const lower = clean.toLowerCase();

  // Detect subject category to apply realistic optical parameters
  let subjectType: "wildlife_nature" | "portrait" | "landscape" | "cyberpunk" | "urban" | "general" = "general";

  if (/lotus|flower|plant|bird|duck|lake|river|pond|forest|animal|wildlife|dog|cat|fish|tree/.test(lower)) {
    subjectType = "wildlife_nature";
  } else if (/person|man|woman|girl|boy|police|officer|face|portrait|soldier|doctor|worker|chef/.test(lower)) {
    subjectType = "portrait";
  } else if (/mountain|sunset|sunrise|beach|ocean|desert|valley|sky|clouds|canyon/.test(lower)) {
    subjectType = "landscape";
  } else if (/cyber|neon|futuristic|sci-fi|tokyo|blade runner|robot/.test(lower)) {
    subjectType = "cyberpunk";
  } else if (/city|street|building|architecture|car|road|bridge|interior/.test(lower)) {
    subjectType = "urban";
  }

  let optics = "";
  let lighting = "";
  let details = "";

  switch (subjectType) {
    case "wildlife_nature":
      optics = "shot on Sony A1 with 70-200mm f/2.8 GM lens, sharp focus on subject, natural water ripples and reflections, shallow depth of field";
      lighting = "soft natural morning sunlight, golden hour rim lighting, realistic light refractions";
      details = "National Geographic documentary photography, hyperrealistic plumage and petal textures, award-winning nature photograph, 8k resolution";
      break;

    case "portrait":
      optics = "captured on Canon EOS R5 with 85mm f/1.4 lens, natural skin texture with subtle pores, catchlights in the eyes, sharp focus";
      lighting = "diffused directional studio lighting, gentle ambient fill, realistic specular highlights";
      details = "editorial portrait photography, Vogue / National Geographic authentic realism, true-to-life color grading, no plastic skin";
      break;

    case "landscape":
      optics = "shot on Hasselblad H6D-100c with 24mm wide angle lens, f/11 deep depth of field, incredible dynamic range";
      lighting = "dramatic golden hour sunset, atmospheric haze, realistic cloud shadows and terrain texture";
      details = "fine art landscape photography, ultra sharp detail from foreground to horizon, true natural colors, 8k UHD";
      break;

    case "cyberpunk":
      optics = "shot on 35mm anamorphic cinema lens, cinematic widescreen, realistic anamorphic lens flares";
      lighting = "neon reflections on wet pavement, volumetric rain and fog, moody high-contrast lighting";
      details = "Blade Runner 2049 cinematic still, authentic film grain, photorealistic cyberpunk realism, ultra detailed";
      break;

    case "urban":
      optics = "shot on Leica M11 with 35mm f/2 Summicron lens, sharp architectural lines, street photography perspective";
      lighting = "natural afternoon sunlight, crisp shadows, authentic ambient exposure";
      details = "architectural digest documentary photo, crisp material textures, authentic urban environment, 8k uhd";
      break;

    default:
      optics = "shot on professional full-frame DSLR with 50mm f/1.8 lens, natural perspective, sharp focus";
      lighting = "soft natural ambient lighting, true-to-life reflections";
      details = "photorealistic, National Geographic standard, authentic realistic textures, 8k resolution";
  }

  // Adjust by user-selected style preset
  if (stylePreset === "Cinematic Octane 8K") {
    details += ", cinematic movie still, 35mm film stock, Arri Alexa color science";
  } else if (stylePreset === "Forensic Raw Evidence") {
    optics = "uncompressed RAW DSLR capture, forensic documentary camera, no beauty filters";
    lighting = "harsh neutral daylight, unedited authentic lighting";
    details = "forensic photography, true evidence record, sharp unretouched textures";
  }

  const enhanced = `${clean}, ${optics}, ${lighting}, ${details}`;

  const negativePrompt =
    "cgi, 3d render, cartoon, anime, illustration, painting, drawing, plastic skin, doll, artificial, fake, oversaturated, deformed, extra limbs, bad anatomy, blurry, watermark, logo, text, copyright, low quality, artifacts";

  return {
    prompt: enhanced,
    negativePrompt,
    detectedSubject: subjectType,
  };
}