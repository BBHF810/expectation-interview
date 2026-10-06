import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { isOpenAiConfigured, getOpenAiModelName, callOpenAiJson } from "@/lib/openai";
import { PAIR_REFLECTION_SYSTEM_INSTRUCTION } from "@/lib/prompts/pair-reflection";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackPairReflection, PAIR_ANIMAL_COMBOS } from "@/lib/pair-fallbacks";
import { logSafeRequest, generateRequestId } from "@/lib/logger";
import { ExpectationType } from "@/types";

const PairTurnSchema = z.object({
  questionNumber: z.number(),
  speaker: z.enum(["A", "B"]),
  speakerName: z.string().max(30),
  question: z.string().max(300),
  answer: z.string().max(500),
  isSkipped: z.boolean().optional(),
});

const PairReflectionRequestSchema = z.object({
  nameA: z.string().min(1).max(30),
  nameB: z.string().min(1).max(30),
  relationship: z.string().max(50),
  expectationType: z.enum(["matched", "mismatched", "neutral"]),
  conversationHistory: z.array(PairTurnSchema).max(6),
});

const PairAnimalDiagnosisSchema = z.object({
  animalA: z.object({ emoji: z.string(), name: z.string() }),
  animalB: z.object({ emoji: z.string(), name: z.string() }),
  pairTitle: z.string(),
  pairCatchphrase: z.string(),
  pairDescription: z.string(),
  futureRelationship: z.string().optional(),
  livingHint: z.string().optional(),
  academicDynamic: z.string().optional(),
});

const GeminiPairReflectionOutputSchema = z.object({
  perspectiveA: z.string(),
  perspectiveB: z.string(),
  reflection: z.string(),
  safetyAction: z.enum(["continue", "stop"]),
  pairAnimalDiagnosis: PairAnimalDiagnosisSchema.optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const primaryModel = getGeminiModelName();
  const secondaryModel = "gemini-2.5-flash";

  let parsedData: z.infer<typeof PairReflectionRequestSchema> | null = null;

  try {
    const rawBody = await req.json();
    const parsed = PairReflectionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-reflection",
        status: "error",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
        errorType: "INVALID_REQUEST_BODY",
      });
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    parsedData = parsed.data;
    const { nameA, nameB, relationship, expectationType, conversationHistory } = parsedData;

    const allAnswers = conversationHistory.map((t) => t.answer).filter(Boolean);
    for (const ans of allAnswers) {
      if (checkSafetyLocally(ans) === "stop") {
        logSafeRequest({
          requestId,
          endpoint: "/api/pair-reflection",
          status: "success",
          durationMs: Date.now() - startTime,
          model: primaryModel,
          fallbackUsed: false,
        });
        return NextResponse.json({
          perspectiveA: "",
          perspectiveB: "",
          reflection: "",
          pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
          safetyAction: "stop",
          fallbackUsed: false,
        });
      }
    }

    const ai = getGeminiClient();
    const hasOpenAi = isOpenAiConfigured();

    if (!ai && !hasOpenAi) {
      const fallback = getFallbackPairReflection(nameA, nameB, expectationType as ExpectationType, conversationHistory);
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-reflection",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: true,
        errorType: "NO_API_KEY",
      });
      return NextResponse.json({
        perspectiveA: fallback.perspectiveA,
        perspectiveB: fallback.perspectiveB,
        reflection: fallback.reflection,
        pairAnimalDiagnosis: fallback.pairAnimalDiagnosis,
        safetyAction: "continue",
        fallbackUsed: true,
      });
    }

    const turnsContext = conversationHistory
      .map(
        (t, idx) =>
          `質問${idx + 1}（${t.speakerName}さん）: ${t.question}\n回答${idx + 1}: ${
            t.isSkipped ? "(スキップ)" : t.answer
          }`
      )
      .join("\n\n");

    const prompt = `【ふたりの情報】
- 参加者A: ${nameA}
- 参加者B: ${nameB}
- 関係性: ${relationship}
- 事前選択: ${
      expectationType === "matched"
        ? "ぴったり合っていた"
        : expectationType === "mismatched"
        ? "少しすれちがった"
        : "どちらともいえない"
    }

【インタビュー記録】
${turnsContext}

【依頼】
ふたりのやり取りから、
1. perspectiveA: ${nameA}さんから見た期待・思い
2. perspectiveB: ${nameB}さんから見た受け止め・状況
3. reflection: ふたりへの温かい中立的なメッセージ（100〜180文字程度）
4. pairAnimalDiagnosis: ふたりの関わり方を2匹の動物に例えるお楽しみエンタメ診断
5. safetyAction: "continue" | "stop"
をJSONスキーマに従って出力してください。`;

    const config = getGeminiConfig(300);

    let validatedData: z.infer<typeof GeminiPairReflectionOutputSchema> | null = null;
    let usedModel = primaryModel;

    // 1. OpenAI (GPT-4o) が設定されていれば最優先で呼び出し
    if (isOpenAiConfigured()) {
      try {
        usedModel = getOpenAiModelName();
        const openAiResult = await callOpenAiJson<any>({
          systemInstruction: `${PAIR_REFLECTION_SYSTEM_INSTRUCTION}\n\n【必須出力フォーマット】以下のJSONを出力してください:
{
  "perspectiveA": "${nameA}さんの思いや期待のまとめ",
  "perspectiveB": "${nameB}さんの受け止めや状況のまとめ",
  "reflection": "ふたりの通い合いを温かく見守る振り返りメッセージ",
  "safetyAction": "continue" | "stop",
  "pairAnimalDiagnosis": {
    "animalA": { "emoji": "絵文字", "name": "動物タイプ名" },
    "animalB": { "emoji": "絵文字", "name": "動物タイプ名" },
    "pairTitle": "ペアタイトル (例: 寄り添いイルカ＆見守りフクロウ)",
    "pairCatchphrase": "ふたりのキャッチコピー",
    "pairDescription": "ふたりの関係性の魅力や特徴についての温かい解説"
  }
}`,
          userPrompt: prompt,
          model: usedModel,
          temperature: 0.3,
          maxTokens: 500,
          timeoutMs: 9000,
        });

        const parsed = GeminiPairReflectionOutputSchema.safeParse(openAiResult);
        if (parsed.success) {
          validatedData = parsed.data;
        }
      } catch (openAiErr) {
        console.warn("OpenAI pair-reflection failed, falling back to Gemini:", openAiErr);
        validatedData = null;
      }
    }

    // 2. OpenAI が未設定または失敗した場合は Gemini を呼び出し
    if (!validatedData) {
      if (!ai) {
        throw new Error("No AI API keys configured");
      }

      const callModel = async (modelToUse: string) => {
        return await generateContentWithTimeout(async () => {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction: PAIR_REFLECTION_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  perspectiveA: { type: "string" },
                  perspectiveB: { type: "string" },
                  reflection: { type: "string" },
                  safetyAction: {
                    type: "string",
                    enum: ["continue", "stop"],
                  },
                  pairAnimalDiagnosis: {
                    type: "object",
                    properties: {
                      animalA: {
                        type: "object",
                        properties: { emoji: { type: "string" }, name: { type: "string" } },
                        required: ["emoji", "name"],
                      },
                      animalB: {
                        type: "object",
                        properties: { emoji: { type: "string" }, name: { type: "string" } },
                        required: ["emoji", "name"],
                      },
                      pairTitle: { type: "string" },
                      pairCatchphrase: { type: "string" },
                      pairDescription: { type: "string" },
                      futureRelationship: { type: "string" },
                      livingHint: { type: "string" },
                      academicDynamic: { type: "string" },
                    },
                    required: ["animalA", "animalB", "pairTitle", "pairCatchphrase", "pairDescription"],
                  },
                },
                required: ["perspectiveA", "perspectiveB", "reflection", "safetyAction"],
              },
              maxOutputTokens: config.maxOutputTokens,
              temperature: config.temperature,
            },
          });
        }, 9000);
      };

      let response: any = null;
      usedModel = primaryModel;

      try {
        response = await callModel(primaryModel);
      } catch (err: any) {
        try {
          usedModel = secondaryModel;
          response = await callModel(secondaryModel);
        } catch (retryErr: any) {
          throw err;
        }
      }

      const rawText = response.text || "";
      const parsedJson = JSON.parse(rawText);
      const parsed = GeminiPairReflectionOutputSchema.safeParse(parsedJson);
      if (!parsed.success) {
        throw new Error("Gemini pair reflection schema validation failed");
      }
      validatedData = parsed.data;
    }

    const data = validatedData;

    if (data.safetyAction === "stop") {
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-reflection",
        status: "success",
        durationMs: Date.now() - startTime,
        model: usedModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        perspectiveA: "",
        perspectiveB: "",
        reflection: "",
        pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
        safetyAction: "stop",
        fallbackUsed: false,
      });
    }

    const pairAnimalDiagnosis =
      data.pairAnimalDiagnosis ||
      getFallbackPairReflection(nameA, nameB, expectationType as ExpectationType, conversationHistory).pairAnimalDiagnosis;

    logSafeRequest({
      requestId,
      endpoint: "/api/pair-reflection",
      status: "success",
      durationMs: Date.now() - startTime,
      model: usedModel,
      fallbackUsed: false,
    });

    return NextResponse.json({
      perspectiveA: data.perspectiveA,
      perspectiveB: data.perspectiveB,
      reflection: data.reflection,
      pairAnimalDiagnosis,
      safetyAction: "continue",
      fallbackUsed: false,
    });
  } catch (err: any) {
    const nameA = parsedData?.nameA || "参加者1";
    const nameB = parsedData?.nameB || "参加者2";
    const expType = parsedData?.expectationType || "neutral";
    const history = parsedData?.conversationHistory || [];

    const fallback = getFallbackPairReflection(nameA, nameB, expType as ExpectationType, history);

    logSafeRequest({
      requestId,
      endpoint: "/api/pair-reflection",
      status: "fallback",
      durationMs: Date.now() - startTime,
      model: primaryModel,
      fallbackUsed: true,
      errorType: err?.message || err?.name || "GEMINI_ERROR",
    });

    return NextResponse.json({
      perspectiveA: fallback.perspectiveA,
      perspectiveB: fallback.perspectiveB,
      reflection: fallback.reflection,
      pairAnimalDiagnosis: fallback.pairAnimalDiagnosis,
      safetyAction: "continue",
      fallbackUsed: true,
    });
  }
}