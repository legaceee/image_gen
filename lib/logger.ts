import fs from "fs";
import path from "path";

export interface ProviderAttempt {
  provider: string;
  model?: string;
  status: "success" | "failed" | "skipped";
  statusCode?: number;
  durationMs?: number;
  error?: string;
  headers?: Record<string, string>;
}

export interface GenerationLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  rawPrompt: string;
  enhancedPrompt: string;
  stylePreset: string;
  aspectRatio: string;
  seed: number;
  attempts: ProviderAttempt[];
  finalProvider: string;
  success: boolean;
  totalLatencyMs: number;
  imageSizeBytes?: number;
  storageUrl?: string;
  error?: string;
}

// Global in-memory log buffer (persists across requests in runtime)
const globalForLogs = globalThis as unknown as { generationLogs?: GenerationLogEntry[] };
if (!globalForLogs.generationLogs) {
  globalForLogs.generationLogs = [];
}

const MAX_IN_MEMORY_LOGS = 50;

export function recordGenerationLog(entry: GenerationLogEntry) {
  // Store in memory
  globalForLogs.generationLogs!.unshift(entry);
  if (globalForLogs.generationLogs!.length > MAX_IN_MEMORY_LOGS) {
    globalForLogs.generationLogs!.pop();
  }

  // Format single log line for server output
  const summaryLine = `[${entry.timestamp}] PROMPT="${entry.rawPrompt.substring(0, 40)}" | FINAL=${entry.finalProvider} | SUCCESS=${entry.success} | TIME=${entry.totalLatencyMs}ms | ATTEMPTS=${entry.attempts.map(a => `${a.provider}:${a.status}(${a.statusCode || "-"})`).join(", ")}`;

  console.log(`[AI_IMAGE_LOG] ${summaryLine}`);

  // Try appending to local logs/generation.log if filesystem is writable
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, "generation.log");
    const jsonLine = JSON.stringify(entry) + "\n";
    fs.appendFileSync(logFilePath, jsonLine, "utf8");
  } catch (fsErr) {
    // Read-only filesystem on Vercel / serverless edge is expected and safe
  }
}

export function getRecentGenerationLogs(): GenerationLogEntry[] {
  return globalForLogs.generationLogs || [];
}