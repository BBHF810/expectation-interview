import { GoogleGenAI } from "@google/genai";

const DEFAULT_PRIMARY_MODEL = "gemini-3.5-flash-lite";

export function getGeminiModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  return envModel && envModel.length > 0 ? envModel : DEFAULT_PRIMARY_MODEL;
}

export function getGeminiClient(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) {
    return null;
  }
  const apiKey = rawKey.trim();
  if (apiKey === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function getGeminiConfig(customTokens?: number) {
  const maxOutputTokens =
    customTokens ||
    Number(process.env.GEMINI_MAX_OUTPUT_TOKENS?.trim()) ||
    200;
  const temperature =
    Number(process.env.GEMINI_TEMPERATURE?.trim()) || 0.2;

  return {
    maxOutputTokens,
    temperature,
  };
}

/**
 * タイムアウト付きでGemini APIを実行する
 */
export async function generateContentWithTimeout<T>(
  apiCall: (abortSignal: AbortSignal) => Promise<T>,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await apiCall(controller.signal);
    return result;
  } finally {
    clearTimeout(timer);
  }
}