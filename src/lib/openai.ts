import OpenAI from "openai";

const DEFAULT_OPENAI_MODEL = "gpt-4o";

export function getOpenAiModelName(): string {
  const envModel = process.env.OPENAI_MODEL?.trim();
  return envModel && envModel.length > 0 ? envModel : DEFAULT_OPENAI_MODEL;
}

export function getOpenAiClient(): OpenAI | null {
  const rawKey = process.env.OPENAI_API_KEY;
  if (!rawKey) {
    return null;
  }
  const apiKey = rawKey.trim();
  if (apiKey === "") {
    return null;
  }
  return new OpenAI({ apiKey });
}

export function isOpenAiConfigured(): boolean {
  return !!getOpenAiClient();
}

/**
 * OpenAI (GPT-4o) をJSON形式で安全に呼び出すヘルパー
 */
export async function callOpenAiJson<T>(params: {
  systemInstruction: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<T> {
  const client = getOpenAiClient();
  if (!client) {
    throw new Error("OpenAI API key is not configured");
  }

  const model = params.model || getOpenAiModelName();
  const timeoutMs = params.timeoutMs || 8500;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: params.systemInstruction },
          { role: "user", content: params.userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 500,
      },
      { signal: controller.signal }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    return JSON.parse(content) as T;
  } finally {
    clearTimeout(timer);
  }
}
