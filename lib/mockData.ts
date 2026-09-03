export interface VerificationCheck {
  id: string;
  name: string;
  category: "METADATA" | "PIXELS" | "FREQUENCY" | "COMPRESSION" | "RESIDUALS" | "SEMANTICS";
  status: "PASSED" | "FAILED" | "WARNING";
  score: number; // 0 (authentic) to 100 (synthetic anomaly)
  detail: string;
  forensicRationale: string;
}

export interface IntegrityReport {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  mimeType: string;
  sha256: string;
  aiProbability: number; // 0 to 100
  verdict: "SYNTHETIC_MEDIA_DETECTED" | "AUTHENTIC_CAPTURE_CONFIRMED" | "INCONCLUSIVE";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  suspectedModel: string;
  summary: string;
  verificationChecks: VerificationCheck[];
  modelSignatures: {
    model: string;
    probability: number;
  }[];
  elaHeatmapAvailable: boolean;
}

export interface DemoPreset {
  id: string;
  title: string;
  badge: string;
  badgeColor: "red" | "blue" | "emerald";
  description: string;
  imagePath: string;
  report: IntegrityReport;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "synthetic-portrait",
    title: "Preset A: Diffusion Neural Portrait",
    badge: "Synthetic (98.4%)",
    badgeColor: "red",
    description: "FLUX.1-schnell latent generation showing checkerboard grid artifacts and stripped EXIF tags.",
    imagePath: "/samples/synthetic_portrait.svg",
    report: {
      id: "REP-2026-SYNTH-891",
      timestamp: new Date().toISOString(),
      fileName: "synthetic_portrait.svg",
      fileSize: 428000,
      dimensions: { width: 1024, height: 1024 },
      mimeType: "image/svg+xml",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      aiProbability: 98.4,
      verdict: "SYNTHETIC_MEDIA_DETECTED",
      confidence: "HIGH",
      suspectedModel: "Black Forest Labs FLUX.1 / SDXL Latent Space",
      summary: "High-confidence synthetic media. Multi-spectral inspection revealed periodic checkerboard demosaicing anomalies, missing camera hardware metadata, and uniform latent noise residual distribution.",
      modelSignatures: [
        { model: "FLUX.1 / SDXL Diffusion", probability: 91.2 },
        { model: "Midjourney v6", probability: 6.4 },
        { model: "DALL-E 3", probability: 1.8 },
        { model: "Authentic Hardware Sensor", probability: 0.6 },
      ],
      elaHeatmapAvailable: true,
      verificationChecks: [
        {
          id: "chk-meta",
          name: "EXIF & Camera Hardware Header",
          category: "METADATA",
          status: "FAILED",
          score: 95,
          detail: "EXIF Stripped / Synthetic ComfyUI latent tags detected",
          forensicRationale: "Authentic digital sensors embed ISO, focal length, aperture, and sensor serial markers. Image contains synthetic pipeline signatures.",
        },
        {
          id: "chk-pixels",
          name: "Latent Grid & Pixel Artifacts",
          category: "PIXELS",
          status: "FAILED",
          score: 98,
          detail: "High-frequency 8x8 checkerboard upsampling artifacts",
          forensicRationale: "Sub-pixel deconvolution operations in latent diffusion models leave periodic checkerboard artifacts across transitional high-contrast boundaries.",
        },
        {
          id: "chk-freq",
          name: "2D Discrete Fourier Spectrum",
          category: "FREQUENCY",
          status: "FAILED",
          score: 94,
          detail: "Anomalous azimuthal spectral peaks in high frequencies",
          forensicRationale: "Real optical lenses produce smooth 1/f radial power drop-offs. AI generators introduce artificial harmonic peaks.",
        },
        {
          id: "chk-residuals",
          name: "Sensor Noise Residuals (PRNU)",
          category: "RESIDUALS",
          status: "FAILED",
          score: 96,
          detail: "Synthetic Gaussian noise distribution (No Photo-Response Non-Uniformity)",
          forensicRationale: "Real silicon CMOS wafers have unique microscopic silicon PRNU fingerprints. Image noise is purely synthetic Gaussian white noise.",
        },
        {
          id: "chk-ela",
          name: "Error Level Analysis (ELA)",
          category: "COMPRESSION",
          status: "FAILED",
          score: 92,
          detail: "Uniform compression error rate throughout subject & backdrop",
          forensicRationale: "Natural photographs show differentiated compression resistance between high-texture foreground and out-of-focus background.",
        },
        {
          id: "chk-semantics",
          name: "Biometric & Semantic Consistency",
          category: "SEMANTICS",
          status: "WARNING",
          score: 78,
          detail: "Pupil dilation symmetry variance & ear lobe edge fusion",
          forensicRationale: "Anatomical irregularities detected in micro-reflections and asymmetric iris contraction.",
        },
      ],
    },
  },
  {
    id: "authentic-camera",
    title: "Preset B: Canon EOS DSLR Capture",
    badge: "Authentic (3.8%)",
    badgeColor: "emerald",
    description: "Verified optical landscape capture with genuine CMOS sensor noise and intact Canon EXIF.",
    imagePath: "/samples/authentic_camera.svg",
    report: {
      id: "REP-2026-AUTH-104",
      timestamp: new Date().toISOString(),
      fileName: "canon_eos_landscape.jpg",
      fileSize: 3410000,
      dimensions: { width: 4000, height: 3000 },
      mimeType: "image/jpeg",
      sha256: "8f4e2a1b9c7d3e5f6a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
      aiProbability: 3.8,
      verdict: "AUTHENTIC_CAPTURE_CONFIRMED",
      confidence: "HIGH",
      suspectedModel: "Optical CMOS Sensor (Canon EOS R5)",
      summary: "Forensic analysis confirms authentic digital optical photography. Intact camera hardware telemetry, natural Poisson shot noise, and organic Bayer demosaicing curves verified.",
      modelSignatures: [
        { model: "Authentic Hardware Sensor", probability: 96.2 },
        { model: "FLUX.1 / SDXL Diffusion", probability: 2.1 },
        { model: "Midjourney v6", probability: 1.1 },
        { model: "DALL-E 3", probability: 0.6 },
      ],
      elaHeatmapAvailable: true,
      verificationChecks: [
        {
          id: "chk-meta-auth",
          name: "EXIF & Camera Hardware Header",
          category: "METADATA",
          status: "PASSED",
          score: 4,
          detail: "Intact Canon EOS R5 EXIF (RF 24-70mm f/2.8L, ISO 100, 1/500s)",
          forensicRationale: "Hardware shutter count, lens serial, maker notes, and firmware revision verified against authentic manufacturer registries.",
        },
        {
          id: "chk-pixels-auth",
          name: "Latent Grid & Pixel Artifacts",
          category: "PIXELS",
          status: "PASSED",
          score: 3,
          detail: "Zero latent grid patterns; genuine Bayer demosaicing confirmed",
          forensicRationale: "Physical Bayer array interpolation displays natural RGB interpolation curves with no synthetic upsampling checkerboards.",
        },
        {
          id: "chk-freq-auth",
          name: "2D Discrete Fourier Spectrum",
          category: "FREQUENCY",
          status: "PASSED",
          score: 5,
          detail: "Smooth 1/f natural radial power distribution verified",
          forensicRationale: "Optics and atmospheric diffraction adhere strictly to natural physical wave decay patterns.",
        },
        {
          id: "chk-residuals-auth",
          name: "Sensor Noise Residuals (PRNU)",
          category: "RESIDUALS",
          status: "PASSED",
          score: 2,
          detail: "Organic Poisson photon shot noise & physical silicon PRNU present",
          forensicRationale: "Hardware sensor defect footprint and quantum photon noise match physical optical CMOS capture.",
        },
        {
          id: "chk-ela-auth",
          name: "Error Level Analysis (ELA)",
          category: "COMPRESSION",
          status: "PASSED",
          score: 6,
          detail: "Organic edge degradation correlating with optical depth of field",
          forensicRationale: "Expected differential error rates between sharp in-focus mountain silhouettes and atmospheric haze.",
        },
        {
          id: "chk-semantics-auth",
          name: "Physical Optical & Lighting Coherence",
          category: "SEMANTICS",
          status: "PASSED",
          score: 4,
          detail: "Solar incidence angles match water surface Fresnel reflections",
          forensicRationale: "Reflections on water surface accurately mirror solar declination and geometric line-of-sight.",
        },
      ],
    },
  },
  {
    id: "synthetic-cyberpunk",
    title: "Preset C: Midjourney v6 Concept Scene",
    badge: "Synthetic (96.1%)",
    badgeColor: "red",
    description: "High-complexity futuristic environment displaying latent spatial blending and non-physical lighting.",
    imagePath: "/samples/synthetic_cyberpunk.svg",
    report: {
      id: "REP-2026-SYNTH-512",
      timestamp: new Date().toISOString(),
      fileName: "cyberpunk_neon_city.webp",
      fileSize: 1850000,
      dimensions: { width: 1536, height: 1024 },
      mimeType: "image/webp",
      sha256: "4c7a1e9b2f3d5c8e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
      aiProbability: 96.1,
      verdict: "SYNTHETIC_MEDIA_DETECTED",
      confidence: "HIGH",
      suspectedModel: "Midjourney v6 Neural Engine",
      summary: "Synthetic media detected with high confidence. Non-linear chromatic aberrations, unphysical photon reflection vectors, and latent texture hallucinations identified.",
      modelSignatures: [
        { model: "Midjourney v6", probability: 86.4 },
        { model: "FLUX.1 / SDXL Diffusion", probability: 11.2 },
        { model: "DALL-E 3", probability: 1.9 },
        { model: "Authentic Hardware Sensor", probability: 0.5 },
      ],
      elaHeatmapAvailable: true,
      verificationChecks: [
        {
          id: "chk-meta-cyber",
          name: "EXIF & Camera Hardware Header",
          category: "METADATA",
          status: "FAILED",
          score: 99,
          detail: "Empty EXIF profile with WebP synthetic container signature",
          forensicRationale: "No hardware acquisition tags or physical lens profile present.",
        },
        {
          id: "chk-pixels-cyber",
          name: "Latent Grid & Pixel Artifacts",
          category: "PIXELS",
          status: "FAILED",
          score: 93,
          detail: "Latent upscaler texture hallucination along pavement reflections",
          forensicRationale: "Repetitive microscopic procedural patterns characteristic of latent super-resolution diffusion models.",
        },
        {
          id: "chk-freq-cyber",
          name: "2D Discrete Fourier Spectrum",
          category: "FREQUENCY",
          status: "FAILED",
          score: 95,
          detail: "Artificial periodic grid harmonic peaks detected",
          forensicRationale: "Neural network convolution kernels induce subtle periodic Fourier frequency spikes.",
        },
        {
          id: "chk-residuals-cyber",
          name: "Sensor Noise Residuals (PRNU)",
          category: "RESIDUALS",
          status: "FAILED",
          score: 97,
          detail: "Absence of CMOS photo-response noise; artificial dithering detected",
          forensicRationale: "Image lacks physical sensor silicon noise fingerprints.",
        },
        {
          id: "chk-ela-cyber",
          name: "Error Level Analysis (ELA)",
          category: "COMPRESSION",
          status: "FAILED",
          score: 91,
          detail: "Anomalous high-frequency luminescence in neon edge gradients",
          forensicRationale: "Digital compression residuals reveal synthetic brightness injection without optical blur falloff.",
        },
        {
          id: "chk-semantics-cyber",
          name: "Raytraced Optical Consistency",
          category: "SEMANTICS",
          status: "WARNING",
          score: 84,
          detail: "Inconsistent photon reflection angles on wet asphalt surface",
          forensicRationale: "Reflected neon signs diverge from geometrical camera viewpoint by >18 degrees.",
        },
      ],
    },
  },
];

export const SAMPLE_PROMPTS = [
  {
    title: "Forensic Bio-Lab",
    prompt: "Cybernetic biometric analysis chamber, volumetric neon electric blue lighting, holographic forensic monitors, 8k hyperrealistic render, cinematic octane",
    category: "Forensic",
    aspectRatio: "16:9",
  },
  {
    title: "Synthetic Subject #90",
    prompt: "Close-up photorealistic portrait of an android engineer, subtle cybernetic carbon-fiber ocular implant, soft studio rim lighting, 85mm lens, f/1.8",
    category: "Portrait",
    aspectRatio: "1:1",
  },
  {
    title: "Quantum Data Center",
    prompt: "Underground cryogenic quantum mainframe facility, glowing cyan optical data conduits, dark charcoal server racks, atmospheric fog, photorealistic",
    category: "Cyberpunk",
    aspectRatio: "16:9",
  },
  {
    title: "Authentic Street Documentary",
    prompt: "Rainy Tokyo street at twilight, authentic 35mm film grain, natural neon reflections in puddles, candid photography, Leica M11 optical capture",
    category: "Photoreal",
    aspectRatio: "16:9",
  },
];
