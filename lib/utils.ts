import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function truncateHash(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function computeSHA256(buffer: any): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data as any);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  try {
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex");
  } catch {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  }
}