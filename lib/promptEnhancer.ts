/**
 * Professional Photorealism & Anti-Watermark Prompt Engine
 * Uses authentic 35mm film and optical camera terminology (Kodak Portra, Leica, Hasselblad)
 * while strictly banning "8k", "hyperrealistic", "CGI", and watermark triggers.
 */

export function enhancePromptForRealism(rawPrompt: string, stylePreset = "Photorealistic"): {
  prompt: string;
  negativePrompt: string;
  detectedSubject: string;
} {
  const clean = rawPrompt.trim();
  const lower = clean.toLowerCase();

  // Categorize subject
  let subjectType: "wildlife_nature" | "portrait" | "landscape" | "cyberpunk" | "urban" | "general" = "general";

  if (/lotus|flower|plant|bird|duck|lake|river|pond|forest|animal|wildlife|dog|cat|fish|tree|garden/.test(lower)) {
    subjectType = "wildlife_nature";
  } else if (/person|man|woman|girl|boy|police|officer|face|portrait|soldier|doctor|worker|chef|human/.test(lower)) {
    subjectType = "portrait";
  } else if (/mountain|sunset|sunrise|beach|ocean|desert|valley|sky|clouds|canyon|sea/.test(lower)) {
    subjectType = "landscape";
  } else if (/cyber|neon|futuristic|sci-fi|tokyo|blade runner|robot/.test(lower)) {
    subjectType = "cyberpunk";
  } else if (/city|street|building|architecture|car|road|bridge|interior|house/.test(lower)) {
    subjectType = "urban";
  }

  let optics = "";
  let lighting = "";
  let textures = "";

  switch (subjectType) {
    case "wildlife_nature":
      optics = "candid documentary photograph, shot on Sony A1 with 70-200mm f/2.8 GM lens at 135mm, f/2.8 shallow depth of field";
      lighting = "natural diffused morning light, gentle sun reflections on water ripples, realistic ambient illumination";
      textures = "authentic organic petal and feather textures, subtle natural film grain, unretouched real-life documentary photography";
      break;

    case "portrait":
      optics = "genuine candid portrait, shot on Canon EOS R5 with 85mm f/1.4 lens, optical depth of field";
      lighting = "natural soft window daylight, authentic specular reflections in eyes, gentle ambient exposure";
      textures = "real human skin texture with pores and subtle fine details, unposed, natural unretouched colors, no plastic airbrushing";
      break;

    case "landscape":
      optics = "panoramic landscape photograph, shot on Hasselblad H6D with 28mm wide lens, f/8 deep aperture";
      lighting = "authentic golden hour sunlight, natural atmospheric haze, realistic terrain shadows";
      textures = "sharp organic details from foreground to horizon, uncompressed natural color palette, documentary quality";
      break;

    case "cyberpunk":
      optics = "cinematic photograph, shot on 35mm anamorphic lens, realistic shallow depth of field";
      lighting = "realistic neon sign reflections on wet street pavement, moody atmospheric mist";
      textures = "authentic 35mm film stock, cinematic grain, photorealistic nighttime atmosphere";
      break;

    case "urban":
      optics = "street documentary photograph, shot on Leica M11 with 35mm f/2 lens, natural eye-level perspective";
      lighting = "soft afternoon sunlight, authentic ambient city exposure, natural shadows";
      textures = "authentic brick, concrete and asphalt textures, unretouched street photography";
      break;

    default:
      optics = "candid 35mm film photograph, shot on DSLR with 50mm f/1.8 lens, natural optical perspective";
      lighting = "soft natural daylight, realistic shadows and light falloff";
      textures = "authentic real-world textures, subtle film grain, natural color tones";
  }

  // Adjust by style preset
  if (stylePreset === "Cinematic Octane 8K") {
    textures += ", cinematic film still, Arri Alexa 35mm camera, natural cinema color science";
  } else if (stylePreset === "Forensic Raw Evidence") {
    optics = "forensic documentary photograph, uncompressed RAW sensor capture, harsh neutral daylight, unretouched";
    textures = "forensic photographic evidence, raw optical detail, unaltered real-world textures";
  }

  // Strictly enforce no watermark in the positive prompt
  const enhanced = `${clean}, ${optics}, ${lighting}, ${textures}, clean photograph, no watermark, no text`;

  // Comprehensive negative prompt targeting CGI, plastic look, and watermarks/logos
  const negativePrompt =
    "watermark, text, logo, signature, letters, words, copyright, stamp, url, trademark, bottom corner logo, artist name, watermark text, 3d render, cgi, digital illustration, digital painting, video game, anime, cartoon, airbrushed, plastic skin, plastic textures, glossy, smooth, fake, oversaturated, artificial glow, surreal, stylized, distorted, uncanny, deformed, extra limbs, blur, low quality, artifacts";

  return {
    prompt: enhanced,
    negativePrompt,
    detectedSubject: subjectType,
  };
}