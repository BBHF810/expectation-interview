import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { INTERVIEWER_SYSTEM_INSTRUCTION } from "@/lib/prompts/interviewer";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackQuestion, getInitialSingleQuestion } from "@/lib/fallbacks";
import { logSafeRequest, generateRequestId } from "@/lib/logger";
import { AgeGroup, CareStatus, ExpectationType } from "@/types";

const InterviewRequestSchema = z.object({
  ageGroup: z.enum(["under_10", "11_30", "31_plus", "no_answer"]),
  partner: z.string().max(50),
  isCare: z.enum(["yes", "no", "no_answer"]),
  expectationType: z.enum(["matched", "mismatched", "neutral"]),
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

    // 1問目（対話履歴なし）は属性に応じた初期固定質問を即時返却
    if (historyCount === 0) {
      const initialQ = getInitialSingleQuestion({
        ageGroup: ageGroup as AgeGroup,
        partner,
        isCare: isCare as CareStatus,
        expectationType: expectationType as ExpectationType,
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

    if (!ai) {
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
- 話す相手: ${partner}
- 介護に関する出来事か: ${isCare}
- 期待と結果の認識: ${
      expectationType === "matched"
        ? "期待どおりだった"
        : expectationType === "mismatched"
        ? "すれちがった"
        : "どちらともいえない"
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
    let usedModel = primaryModel;

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
    const validatedOutput = GeminiInterviewOutputSchema.safeParse(parsedJson);

    if (!validatedOutput.success) {
      throw new Error("Gemini output schema validation failed");
    }

    const data = validatedOutput.data;

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