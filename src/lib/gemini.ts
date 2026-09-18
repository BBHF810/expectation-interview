import { GoogleGenAI } from "@google/genai";

const DEFAULT_PRIMARY_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_SECONDARY_MODEL = "gemini-2.5-flash";

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || DEFAULT_PRIMARY_MODEL;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function getGeminiConfig(customTokens?: number) {
  const maxOutputTokens = customTokens || Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 200;
  const temperature = Number(process.env.GEMINI_TEMPERATURE) || 0.2;

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
