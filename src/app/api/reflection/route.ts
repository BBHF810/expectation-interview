import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { isOpenAiConfigured, getOpenAiModelName, callOpenAiJson } from "@/lib/openai";
import { REFLECTION_SYSTEM_INSTRUCTION } from "@/lib/prompts/reflection";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackReflection, getFallbackAnimalDiagnosis } from "@/lib/fallbacks";
import { normalizeSingleAnimal } from "@/lib/animal-diagnoses";
import { logSafeRequest, generateRequestId } from "@/lib/logger";
import { AgeGroup, ExpectationType, AnimalDiagnosis } from "@/types";

const ReflectionRequestSchema = z.object({
  ageGroup: z.enum(["under_10", "11_30", "31_plus", "no_answer"]),
  age: z.number().min(1).max(120).optional(),
  partner: z.string().max(50).optional().default("相手"),
  isCare: z.enum(["yes", "no", "no_answer"]).optional().default("no"),
  expectationType: z.enum(["matched", "mismatched", "neutral"]).optional().default("neutral"),
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

const AnimalDiagnosisSchema = z.object({
  animalEmoji: z.string(),
  animalName: z.string(),
  catchphrase: z.string(),
  description: z.string(),
  futureTrait: z.string().optional(),
  academicTrait: z.string().optional(),
  episodeHighlight: z.string().optional(),
});

const GeminiReflectionOutputSchema = z.object({
  expected: z.string(),
  actual: z.string(),
  reflection: z.string(),
  closingComment: z.string().optional(),
  safetyAction: z.enum(["continue", "stop"]),
  missingInformation: z.array(z.string()),
  animalDiagnosis: AnimalDiagnosisSchema.optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const primaryModel = getGeminiModelName();
  const secondaryModel = "gemini-2.5-flash";

  let parsedData: z.infer<typeof ReflectionRequestSchema> | null = null;

  try {
    const rawBody = await req.json();
    const parsed = ReflectionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "error",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
        errorType: "INVALID_REQUEST_BODY",
      });
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    parsedData = parsed.data;
    const { ageGroup, partner, isCare, expectationType, conversationHistory } = parsedData;

    const allAnswers = conversationHistory.map((t) => t.answer).filter(Boolean);
    for (const ans of allAnswers) {
      if (checkSafetyLocally(ans) === "stop") {
        logSafeRequest({
          requestId,
          endpoint: "/api/reflection",
          status: "success",
          durationMs: Date.now() - startTime,
          model: primaryModel,
          fallbackUsed: false,
        });
        return NextResponse.json({
          expected: "",
          actual: "",
          reflection: "",
          safetyAction: "stop",
          missingInformation: [],
          animalDiagnosis: getFallbackAnimalDiagnosis(expectationType as ExpectationType, allAnswers),
          fallbackUsed: false,
        });
      }
    }

    const ai = getGeminiClient();
    const hasOpenAi = isOpenAiConfigured();

    if (!ai && !hasOpenAi) {
      const fallback = getFallbackReflection(
        expectationType as ExpectationType,
        ageGroup as AgeGroup,
        allAnswers
      );
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: true,
        errorType: "NO_API_KEY",
      });
      const fallbackSnippet = allAnswers[0] ? `『${allAnswers[0].slice(0, 18)}』とお話ししてくださり、` : "";
      const fallbackClosing =
        `お話ししてくださり、ありがとうございました！${fallbackSnippet}あなたのお気持ちや出来事がとてもよく伝わってきました。診断結果をお渡ししますね！`;
      return NextResponse.json({
        expected: fallback.expected,
        actual: fallback.actual,
        reflection: fallback.reflection,
        closingComment: fallbackClosing,
        safetyAction: "continue",
        missingInformation: [],
        animalDiagnosis: fallback.animalDiagnosis,
        fallbackUsed: true,
      });
    }

    const turnsContext = conversationHistory
      .map(
        (t, idx) =>
          `質問${idx + 1}: ${t.question}\n回答${idx + 1}: ${
            t.isSkipped ? "(回答なし・スキップ)" : t.answer
          }`
      )
      .join("\n\n");

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
上記の対話から「expected」「actual」「reflection（100〜180文字の中立的まとめ）」「closingComment（80〜120文字の温かい音声コメント）」「safetyAction」「missingInformation」「animalDiagnosis（親しみやすい動物タイプ診断）」をJSONスキーマに従って出力してください。

【最重要指示】
・closingComment、reflection、および animalDiagnosis には、参加者が話してくれた具体的な言葉やエピソード（誰とのどんな出来事か、どうしてほしかったか等）を文中で必ず直接引用・言及してください。
・「あなたのペースで話してください」「お話ししてくださりありがとうございました」のみで終わる抽象的な定型文は絶対に避けてください。`;

    const config = getGeminiConfig(300);

    let validatedData: z.infer<typeof GeminiReflectionOutputSchema> | null = null;
    let usedModel = primaryModel;

    // 1. OpenAI (GPT-4o) が設定されていれば最優先で呼び出し
    if (isOpenAiConfigured()) {
      try {
        usedModel = getOpenAiModelName();
        const openAiResult = await callOpenAiJson<any>({
          systemInstruction: `${REFLECTION_SYSTEM_INSTRUCTION}\n\n【必須出力フォーマット】以下のJSONオブジェクトを出力してください:
{
  "expected": "参加者が相手に期待していたこと",
  "actual": "実際に起きた出来事",
  "reflection": "心温まる振り返りと気づきのメッセージ",
  "closingComment": "インタビュー全体の回答を踏まえ、温かく語りかける80〜120文字の音声コメント",
  "safetyAction": "continue" | "stop",
  "missingInformation": [],
  "animalDiagnosis": {
    "animalEmoji": "動物の絵文字 (例: 🐶, 🐬)",
    "animalName": "固定動物タイプリストから選定した名前 (例: 素直なワンちゃんタイプ, 共感イルカタイプ 等。オリジナルの創作名は禁止)",
    "catchphrase": "エピソードに即したキャッチフレーズ",
    "description": "回答内容・エピソードを直接引用して解説した診断文（定型文は厳禁）",
    "futureTrait": "これからの強み・活きる性格",
    "academicTrait": "学術特性",
    "episodeHighlight": "語ってくれたエピソードのハイライト要約（例: 友人と旅行の計画で一緒に調べてほしかったこと）"
  }
}`,
          userPrompt: prompt,
          model: usedModel,
          temperature: 0.3,
          maxTokens: 500,
          timeoutMs: 9000,
        });

        const parsed = GeminiReflectionOutputSchema.safeParse(openAiResult);
        if (parsed.success) {
          validatedData = parsed.data;
        }
      } catch (openAiErr) {
        console.warn("OpenAI reflection failed, falling back to Gemini:", openAiErr);
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
              systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  expected: { type: "string" },
                  actual: { type: "string" },
                  reflection: { type: "string" },
                  closingComment: { type: "string" },
                  safetyAction: {
                    type: "string",
                    enum: ["continue", "stop"],
                  },
                  missingInformation: {
                    type: "array",
                    items: { type: "string" },
                  },
                  animalDiagnosis: {
                    type: "object",
                    properties: {
                      animalEmoji: { type: "string" },
                      animalName: { type: "string" },
                      catchphrase: { type: "string" },
                      description: { type: "string" },
                      futureTrait: { type: "string" },
                      academicTrait: { type: "string" },
                      episodeHighlight: { type: "string" },
                    },
                    required: ["animalEmoji", "animalName", "catchphrase", "description"],
                  },
                },
                required: ["expected", "actual", "reflection", "closingComment", "safetyAction", "missingInformation"],
              },
              maxOutputTokens: config.maxOutputTokens,
              temperature: config.temperature,
            },
          });
        }, 8500);
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
      const parsed = GeminiReflectionOutputSchema.safeParse(parsedJson);
      if (!parsed.success) {
        throw new Error("Gemini reflection output validation failed");
      }
      validatedData = parsed.data;
    }

    const data = validatedData;

    if (data.safetyAction === "stop") {
      logSafeRequest({
        requestId,
        endpoint: "/api/reflection",
        status: "success",
        durationMs: Date.now() - startTime,
        model: usedModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        expected: "",
        actual: "",
        reflection: "",
        safetyAction: "stop",
        missingInformation: [],
        animalDiagnosis: getFallbackAnimalDiagnosis(expectationType as ExpectationType, allAnswers),
        fallbackUsed: false,
      });
    }

    let animalDiagnosis: AnimalDiagnosis;
    if (data.animalDiagnosis) {
      const master = normalizeSingleAnimal(data.animalDiagnosis.animalName);
      const rawDesc = data.animalDiagnosis.description || master.defaultDescription;
      const firstAns = allAnswers[0]?.trim();
      const descHasQuote = rawDesc.includes("『") || rawDesc.includes("「") || (firstAns && rawDesc.includes(firstAns.slice(0, 10)));
      const finalDesc = (!descHasQuote && firstAns)
        ? `『${firstAns.slice(0, 20)}』とお話ししてくださったあなた。${rawDesc}`
        : rawDesc;

      animalDiagnosis = {
        animalEmoji: master.animalEmoji,
        animalName: master.animalName,
        catchphrase: data.animalDiagnosis.catchphrase || master.catchphrase,
        description: finalDesc,
        futureTrait: data.animalDiagnosis.futureTrait || master.futureTrait,
        academicTrait: data.animalDiagnosis.academicTrait || master.academicTrait,
        episodeHighlight: data.animalDiagnosis.episodeHighlight || (firstAns ? `『${firstAns.slice(0, 25)}』とお話ししてくださったこと` : undefined),
      };
    } else {
      animalDiagnosis = getFallbackAnimalDiagnosis(expectationType as ExpectationType, allAnswers);
    }

    logSafeRequest({
      requestId,
      endpoint: "/api/reflection",
      status: "success",
      durationMs: Date.now() - startTime,
      model: usedModel,
      fallbackUsed: false,
    });

    const firstAnsSnippet = allAnswers[0] ? `『${allAnswers[0].slice(0, 18)}』というお話、` : "";
    const closingComment =
      data.closingComment ||
      `お話ししてくださり、ありがとうございました！${firstAnsSnippet}${
        partner && partner !== "相手" ? `${partner}さんとの` : ""
      }エピソードを教えていただき、とても嬉しかったです。あなたの診断結果をお渡ししますね！`;

    return NextResponse.json({
      expected: data.expected || "（回答なし）",
      actual: data.actual || "（回答なし）",
      reflection: data.reflection,
      closingComment,
      safetyAction: "continue",
      missingInformation: data.missingInformation || [],
      animalDiagnosis,
      fallbackUsed: false,
    });
  } catch (err: any) {
    const expType = parsedData?.expectationType || "neutral";
    const ageGrp = parsedData?.ageGroup || "11_30";
    const answers = parsedData?.conversationHistory.map((t) => t.answer).filter(Boolean) || [];

    const fallback = getFallbackReflection(
      expType as ExpectationType,
      ageGrp as AgeGroup,
      answers
    );
    logSafeRequest({
      requestId,
      endpoint: "/api/reflection",
      status: "fallback",
      durationMs: Date.now() - startTime,
      model: primaryModel,
      fallbackUsed: true,
      errorType: err?.message || err?.name || "GEMINI_ERROR",
    });

    const fallbackSnippet = answers[0] ? `『${answers[0].slice(0, 18)}』とお話ししてくださり、` : "";
    const fallbackClosing =
      `お話ししてくださり、ありがとうございました！${fallbackSnippet}あなたのお気持ちや出来事がとてもよく伝わってきました。診断結果をお渡ししますね！`;

    return NextResponse.json({
      expected: fallback.expected,
      actual: fallback.actual,
      reflection: fallback.reflection,
      closingComment: fallbackClosing,
      safetyAction: "continue",
      missingInformation: [],
      animalDiagnosis: fallback.animalDiagnosis,
      fallbackUsed: true,
    });
  }
}