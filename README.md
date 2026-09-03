# VERILENS — AI Image Suite (Synthetic Media Verification & Generation)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.18-magenta.svg)](https://framer.com/motion)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Inference%20API-yellow.svg)](https://huggingface.co/)
[![Forensic Standard](https://img.shields.io/badge/Forensics-C2PA%20%2F%20PRNU-00f0ff.svg)](#)

> **Final-Year Computer Science Capstone Project**: A high-end cybersecurity-grade web application featuring **Text-to-Image Generation** (FLUX.1-schnell & SDXL) and **Multi-Spectral Image Integrity Detection** (evaluating latent deconvolution lattices, 2D Fourier transform banding, Error Level Analysis (ELA), and sensor noise residuals).

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js v22.19.0)
- npm 9+ (tested on npm 10.9.3)

### Running Development Server
```bash
cd c:\ml_capstone\ai-image-suite
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 2. API Key Configuration

To connect live cloud inference:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Insert your free Hugging Face User Access Token (with "read" permissions from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)):
   ```env
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```

### Zero-Configuration Presentation Failsafe
- **No API key? No internet? No problem.** The application includes an intelligent fallback mechanism and high-fidelity local benchmarks.
- **Demo Mode Shortcut**: Press `Ctrl+Shift+D` anywhere in the app to toggle between live cloud API and offline demo presets.
- Presets feature authentic Canon EOS DSLR captures vs FLUX/Midjourney synthetic portraits with realistic multi-vector forensic telemetry.

---

## 3. Core Architecture & Features

### Module 1: Neural Synthesis Studio (`/generate`)
- **Prompt Console**: Supports positive/negative prompt conditioning, style presets (Photorealistic, Cyberpunk, Cinematic, Forensic Evidence), and aspect ratio selectors.
- **Pulsing Loading State**: High-tech synthesis timeline indicating tokenization, reverse diffusion trajectory, and latent tensor sampling.
- **Direct Bridge**: Integrated glowing **"Test Integrity Now"** button passes newly synthesized images directly to the forensic auditor in 1 click.

### Module 2: DeepForensics Integrity Engine (`/analyze`)
- **Radial Probability Gauge**: Large animated circular gauge calculating synthetic probability (Neon Crimson for AI > 50%, Cyber Blue/Matrix Emerald for Authentic).
- **Forensic Verification Vectors Grid**:
  1. *Metadata & Hardware Telemetry*: EXIF serial tag inspection vs stripped synthetic headers.
  2. *Pixel Lattice Artifacts*: 8x8 checkerboards left by sub-pixel transposed convolution layers.
  3. *2D Discrete Fourier Spectrum*: High-frequency harmonic spikes vs natural 1/f decay.
  4. *Sensor Noise Residuals (PRNU)*: Silicon Photo-Response Non-Uniformity vs Gaussian white noise.
  5. *Error Level Analysis (ELA)*: Differential JPEG/WebP compression quantization delta.
  6. *Geometric & Optical Coherence*: Raytracing vector alignment and Fresnel reflection angles.
- **Multi-Layer Inspector**:
  - *Original Media*: Visual canvas with HUD crosshairs.
  - *ELA Error Delta*: Real-time canvas compression delta visualization.
  - *2D FFT Spectrum*: Fourier frequency space harmonic analysis.
  - *Raw Telemetry*: Academic-grade JSON audit output with SHA-256 verification.
- **Export Dossier**: Download JSON certificate or generate printable forensic audit.

---

## 4. UI/UX Design System
- **Theme**: Deep charcoal dark mode (`#06090f`, `#0d121f`) with electric cyan (`#00f0ff`) and neon crimson (`#ff2a5f`) accents.
- **Components**: Glassmorphism cards with `backdrop-blur-xl`, micro-grid textures, and Framer Motion micro-spring button interactions.
- **Typography**: Clean technical sans-serif paired with monospace fonts for hashes, seeds, and confidence intervals.
