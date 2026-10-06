import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { isOpenAiConfigured, getOpenAiModelName, callOpenAiJson } from "@/lib/openai";
import { INTERVIEWER_SYSTEM_INSTRUCTION } from "@/lib/prompts/interviewer";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackQuestion, getInitialSingleQuestion } from "@/lib/fallbacks";
import { logSafeRequest, generateRequestId } from "@/lib/logger";
import { AgeGroup, CareStatus, ExpectationType } from "@/types";

const InterviewRequestSchema = z.object({
  ageGroup: z.enum(["under_10", "11_30", "31_plus", "no_answer"]),
  age: z.number().min(1).max(120).optional(),
  partner: z.string().max(50).optional(),
  isCare: z.enum(["yes", "no", "no_answer"]).optional(),
  expectationType: z.enum(["matched", "mismatched", "neutral"]).optional(),
  conversationHistory: z.array(
    z.object({
      question: z.string().max(300),
      answer: z.string().max(500),
      questionPurpose: z.enum(["event", "expectation", "outcome", "reason", "communication", "feeling"]).optional(),
      isSkipped: z.boolean().optional(),
      skipReason: z.enum(["dont_know", "no_answer"]).optional(),
    })
  ).max(3),
});

const GeminiInterviewOutputSchema = z.object({
  nextQuestion: z.string().min(1).max(80),
  questionPurpose: z.enum(["event", "expectation", "outcome", "reason", "communication", "feeling"]),
  safetyAction: z.enum(["continue", "stop"]),
  detectedPartner: z.string().optional(),
  detectedExpectationType: z.enum(["matched", "mismatched", "neutral"]).optional(),
  detectedIsCare: z.enum(["yes", "no"]).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const primaryModel = getGeminiModelName();
  const secondaryModel = "gemini-2.5-flash";

  let parsedData: z.infer<typeof InterviewRequestSchema> | null = null;

  try {
    const rawBody = await req.json();
    const parsed = InterviewRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
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
    const historyCount = conversationHistory.length;

    if (historyCount >= 3) {
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        questionPurpose: "feeling",
        progress: 3,
        isComplete: true,
        safetyAction: "continue",
        fallbackUsed: false,
      });
    }

    const latestAnswer = historyCount > 0 ? conversationHistory[historyCount - 1].answer : "";
    if (latestAnswer && checkSafetyLocally(latestAnswer) === "stop") {
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        questionPurpose: "feeling",
        progress: historyCount,
        isComplete: true,
        safetyAction: "stop",
        fallbackUsed: false,
      });
    }

    // 1問目（対話履歴なし）は年齢に応じた初期汎用質問を即時返却
    if (historyCount === 0) {
      const initialQ = getInitialSingleQuestion({
        ageGroup: ageGroup as AgeGroup,
      });
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: initialQ.question,
        questionPurpose: initialQ.purpose,
        progress: 1,
        isComplete: false,
        safetyAction: "continue",
        fallbackUsed: false,
      });
    }

    const nextQuestionIndex = historyCount;
    const nextProgress = nextQuestionIndex + 1;

    const ai = getGeminiClient();
    const hasOpenAi = isOpenAiConfigured();

    if (!ai && !hasOpenAi) {
      const fallback = getFallbackQuestion(expectationType as ExpectationType, ageGroup as AgeGroup, nextQuestionIndex);
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: true,
        errorType: "NO_API_KEY",
      });
      return NextResponse.json({
        nextQuestion: fallback.question,
        questionPurpose: fallback.purpose,
        progress: nextProgress,
        isComplete: false,
        safetyAction: "continue",
        fallbackUsed: true,
      });
    }

    const pastTurnsContext = conversationHistory
      .map(
        (t, idx) =>
          `質問${idx + 1} (${t.questionPurpose || "未定"}): ${t.question}\n回答${idx + 1}: ${
            t.isSkipped ? "(スキップ)" : t.answer
          }`
      )
      .join("\n\n");

    const usedPurposes = conversationHistory.map((t) => t.questionPurpose).filter(Boolean);

    const userPrompt = `【参加者情報】
- 年齢層: ${ageGroup === "under_10" ? "10歳以下（やさしいひらがな主体の表現にすること）" : ageGroup}
- 話す相手: ${partner || "（未特定 — 回答から推察してください）"}
- 介護に関する出来事か: ${isCare || "（未特定 — 回答から推察してください）"}
- 期待と結果の認識: ${
      expectationType === "matched"
        ? "期待どおりだった"
        : expectationType === "mismatched"
        ? "すれちがった"
        : expectationType === "neutral"
        ? "どちらともいえない"
        : "（未特定 — 回答から推察してください）"
    }

【これまでの対話履歴】
${pastTurnsContext ? pastTurnsContext : "(まだ対話はありません)"}

【指示】
現在は ${nextProgress} 問目の質問を生成してください（全3問中）。
直前の回答者の言葉や気持ちに温かく寄り添いながら、自然な対話として次の質問を作成してください。
${
  usedPurposes.length > 0
    ? `すでに質問した目的: [${usedPurposes.join(", ")}]。これらとは異なる目的で質問を作成してください。`
    : ""
}
質問は80文字以内、1つの疑問文のみで簡潔に作成してください。
センシティブな兆候があれば safetyAction を "stop" にしてください。
必ず指定されたJSONフォーマットのみを出力してください。`;

    const config = getGeminiConfig(150);

    let validatedData: z.infer<typeof GeminiInterviewOutputSchema> | null = null;
    let usedModel = primaryModel;

    // 1. OpenAI (GPT-4o) が設定されていれば最優先で呼び出し
    if (isOpenAiConfigured()) {
      try {
        usedModel = getOpenAiModelName();
        const openAiResult = await callOpenAiJson<any>({
          systemInstruction: `${INTERVIEWER_SYSTEM_INSTRUCTION}\n\n【必須出力フォーマット】以下のキーを持つJSONを出力してください:
- nextQuestion: 80文字以内の次の質問文
- questionPurpose: "event" | "expectation" | "outcome" | "reason" | "communication" | "feeling" のいずれか
- safetyAction: "continue" または "stop"
- detectedPartner (任意): 相手との関係性
- detectedExpectationType (任意): "matched" | "mismatched" | "neutral"
- detectedIsCare (任意): "yes" | "no"`,
          userPrompt,
          model: usedModel,
          temperature: 0.3,
          maxTokens: 250,
          timeoutMs: 8000,
        });

        const parsed = GeminiInterviewOutputSchema.safeParse(openAiResult);
        if (parsed.success) {
          validatedData = parsed.data;
        }
      } catch (openAiErr) {
        console.warn("OpenAI API call failed, falling back to Gemini:", openAiErr);
        validatedData = null;
      }
    }

    // 2. OpenAI が未設定、または失敗した場合は Gemini を呼び出し
    if (!validatedData) {
      if (!ai) {
        throw new Error("No AI API keys configured");
      }

      const callModel = async (modelToUse: string) => {
        return await generateContentWithTimeout(async () => {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: userPrompt,
            config: {
              systemInstruction: INTERVIEWER_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  nextQuestion: { type: "string" },
                  questionPurpose: {
                    type: "string",
                    enum: ["event", "expectation", "outcome", "reason", "communication", "feeling"],
                  },
                  safetyAction: {
                    type: "string",
                    enum: ["continue", "stop"],
                  },
                  detectedPartner: { type: "string" },
                  detectedExpectationType: {
                    type: "string",
                    enum: ["matched", "mismatched", "neutral"],
                  },
                  detectedIsCare: {
                    type: "string",
                    enum: ["yes", "no"],
                  },
                },
                required: ["nextQuestion", "questionPurpose", "safetyAction"],
              },
              maxOutputTokens: config.maxOutputTokens,
              temperature: config.temperature,
            },
          });
        }, 7000);
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
      const parsed = GeminiInterviewOutputSchema.safeParse(parsedJson);
      if (!parsed.success) {
        throw new Error("Gemini output schema validation failed");
      }
      validatedData = parsed.data;
    }

    const data = validatedData;

    if (data.safetyAction === "stop") {
      logSafeRequest({
        requestId,
        endpoint: "/api/interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: usedModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        questionPurpose: data.questionPurpose,
        progress: nextProgress,
        isComplete: true,
        safetyAction: "stop",
        fallbackUsed: false,
        detectedPartner: data.detectedPartner,
        detectedExpectationType: data.detectedExpectationType,
        detectedIsCare: data.detectedIsCare,
      });
    }

    let cleanQuestion = data.nextQuestion.replace(/[\r\n]+/g, " ").trim();
    if (cleanQuestion.length > 80) {
      cleanQuestion = cleanQuestion.substring(0, 77) + "？";
    }

    logSafeRequest({
      requestId,
      endpoint: "/api/interview",
      status: "success",
      durationMs: Date.now() - startTime,
      model: usedModel,
      fallbackUsed: false,
    });

    return NextResponse.json({
      nextQuestion: cleanQuestion,
      questionPurpose: data.questionPurpose,
      progress: nextProgress,
      isComplete: false,
      safetyAction: "continue",
      fallbackUsed: false,
      detectedPartner: data.detectedPartner,
      detectedExpectationType: data.detectedExpectationType,
      detectedIsCare: data.detectedIsCare,
    });
  } catch (err: any) {
    const expType = parsedData?.expectationType || "neutral";
    const ageGrp = parsedData?.ageGroup || "11_30";
    const turnIdx = parsedData?.conversationHistory.length || 0;

    const fallback = getFallbackQuestion(expType as ExpectationType, ageGrp as AgeGroup, turnIdx);
    logSafeRequest({
      requestId,
      endpoint: "/api/interview",
      status: "fallback",
      durationMs: Date.now() - startTime,
      model: primaryModel,
      fallbackUsed: true,
      errorType: err?.message || err?.name || "GEMINI_ERROR",
    });

    return NextResponse.json({
      nextQuestion: fallback.question,
      questionPurpose: fallback.purpose,
      progress: turnIdx + 1,
      isComplete: false,
      safetyAction: "continue",
      fallbackUsed: true,
    });
  }
}