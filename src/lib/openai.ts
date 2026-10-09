import OpenAI from "openai";

const DEFAULT_OPENAI_MODEL = "gpt-6.1-sol";

export function getOpenAiModelName(): string {
  const envModel = process.env.OPENAI_MODEL?.trim();
  if (envModel && envModel.length > 0) {
    const lower = envModel.toLowerCase();
    // gpt6.1sol, gpt-6.1sol, gpt6.1-sol などの表記揺れを公式ID "gpt-6.1-sol" に正規化
    if (lower === "gpt6.1sol" || lower === "gpt-6.1sol" || lower === "gpt6.1-sol") {
      return "gpt-6.1-sol";
    }
    return envModel;
  }
  return DEFAULT_OPENAI_MODEL;
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
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: process.env.NODE_ENV === "test",
  });
}

export function isOpenAiConfigured(): boolean {
  return !!getOpenAiClient();
}

/**
 * OpenAI (GPT-6.1 Sol) をJSON形式で安全に呼び出すヘルパー
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
    const isReasoningModel = model.startsWith("o1") || model.startsWith("o3");
    const requestPayload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [
        { role: "system", content: params.systemInstruction },
        { role: "user", content: params.userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: params.maxTokens ?? 500,
    };

    if (!isReasoningModel) {
      requestPayload.temperature = params.temperature ?? 0.3;
    }

    const response = await client.chat.completions.create(
      requestPayload,
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
