import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { REFLECTION_SYSTEM_INSTRUCTION } from "@/lib/prompts/reflection";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackReflection } from "@/lib/fallbacks";
import { logSafeRequest, generateRequestId } from "@/lib/logger";
import { AgeGroup, ExpectationType } from "@/types";

const ReflectionRequestSchema = z.object({
  ageGroup: z.enum(["under_10", "11_30", "31_plus", "no_answer"]),
  partner: z.string().max(50),
  isCare: z.enum(["yes", "no", "no_answer"]),
  expectationType: z.enum(["matched", "mismatched", "neutral"]),
  conversationHistory: z.array(
    z.object({
      question: z.string().max(300),
      answer: z.string().max(500),
      questionPurpose: z.string().optional(),
      isSkipped: z.boolean().optional(),
      skipReason: z.enum(["dont_know", "no_answer"]).optional(),
    })
  ).max(3),
});

const GeminiReflectionOutputSchema = z.object({
  expected: z.string(),
  actual: z.string(),
  reflection: z.string(),
  safetyAction: z.enum(["continue", "stop"]),
  missingInformation: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const modelName = getGeminiModelName();

  try {
    const rawBody = await req.json();
    const parsed = ReflectionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "error",
        durationMs: Date.now() - startTime,
        model: modelName,
        fallbackUsed: false,
        errorType: "INVALID_REQUEST_BODY",
      });
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { ageGroup, partner, isCare, expectationType, conversationHistory } = parsed.data;

    // 回答群の安全性チェック（ローカル判定）
    const allAnswers = conversationHistory.map(t => t.answer).filter(Boolean);
    for (const ans of allAnswers) {
      if (checkSafetyLocally(ans) === "stop") {
        logSafeRequest({
          requestId,
          endpoint: "/api/reflection",
          status: "success",
          durationMs: Date.now() - startTime,
          model: modelName,
          fallbackUsed: false,
        });
        return NextResponse.json({
          expected: "",
          actual: "",
          reflection: "",
          safetyAction: "stop",
          missingInformation: [],
          fallbackUsed: false,
        });
      }
    }

    const ai = getGeminiClient();

    // APIキーがない場合は固定振り返りへフォールバック
    if (!ai) {
      const fallback = getFallbackReflection(expectationType as ExpectationType, ageGroup as AgeGroup, allAnswers);
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: modelName,
        fallbackUsed: true,
        errorType: "NO_API_KEY",
      });
      return NextResponse.json({
        expected: fallback.expected,
        actual: fallback.actual,
        reflection: fallback.reflection,
        safetyAction: "continue",
        missingInformation: [],
        fallbackUsed: true,
      });
    }

    const turnsContext = conversationHistory.map((t, idx) =>
      `質問${idx + 1}: ${t.question}\n回答${idx + 1}: ${t.isSkipped ? "(回答なし・スキップ)" : t.answer}`
    ).join("\n\n");

    const prompt = `【対話データ】
- 年齢層: ${ageGroup === "under_10" ? "10歳以下（ひらがな多めのやさしい表現にすること）" : ageGroup}
- 相手: ${partner}
- 介護関連: ${isCare}
- 事前選択: ${
      expectationType === "matched"
        ? "期待どおりだった"
        : expectationType === "mismatched"
        ? "すれちがった"
        : "どちらともいえない"
    }

【インタビュー記録】
${turnsContext}

【依頼】
上記の対話から「expected」「actual」「reflection（100〜180文字の中立的まとめ）」「safetyAction」「missingInformation」をJSONスキーマに従って出力してください。
評価や性格診断、アドバイスは絶対に含めず、客観的で温かみのある整理にとどめてください。`;

    const config = getGeminiConfig(300);

    try {
      const response = await generateContentWithTimeout(async () => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                expected: { type: "string" },
                actual: { type: "string" },
                reflection: { type: "string" },
                safetyAction: {
                  type: "string",
                  enum: ["continue", "stop"],
                },
                missingInformation: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["expected", "actual", "reflection", "safetyAction", "missingInformation"],
            },
            maxOutputTokens: config.maxOutputTokens,
            temperature: config.temperature,
          },
        });
      }, 8000);

      const rawText = response.text || "";
      const parsedJson = JSON.parse(rawText);
      const validatedOutput = GeminiReflectionOutputSchema.safeParse(parsedJson);

      if (!validatedOutput.success) {
        throw new Error("Gemini reflection output validation failed");
      }

      const data = validatedOutput.data;

      // safetyAction が stop の場合
      if (data.safetyAction === "stop") {
        logSafeRequest({
          requestId,
          endpoint: "/api/reflection",
          status: "success",
          durationMs: Date.now() - startTime,
          model: modelName,
          fallbackUsed: false,
        });
        return NextResponse.json({
          expected: "",
          actual: "",
          reflection: "",
          safetyAction: "stop",
          missingInformation: [],
          fallbackUsed: false,
        });
      }

      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "success",
        durationMs: Date.now() - startTime,
        model: modelName,
        fallbackUsed: false,
      });

      return NextResponse.json({
        expected: data.expected || "（回答なし）",
        actual: data.actual || "（回答なし）",
        reflection: data.reflection,
        safetyAction: "continue",
        missingInformation: data.missingInformation || [],
        fallbackUsed: false,
      });
    } catch (err: any) {
      // フォールバック
      const fallback = getFallbackReflection(expectationType as ExpectationType, ageGroup as AgeGroup, allAnswers);
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: modelName,
        fallbackUsed: true,
        errorType: err?.name || "GEMINI_ERROR",
      });

      return NextResponse.json({
        expected: fallback.expected,
        actual: fallback.actual,
        reflection: fallback.reflection,
        safetyAction: "continue",
        missingInformation: [],
        fallbackUsed: true,
      });
    }
  } catch (error: any) {
    logSafeRequest({
      requestId,
      endpoint: "/api/reflection",
      status: "error",
      durationMs: Date.now() - startTime,
      model: modelName,
      fallbackUsed: false,
      errorType: "SERVER_ERROR",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
