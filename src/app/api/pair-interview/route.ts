import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { PAIR_INTERVIEWER_SYSTEM_INSTRUCTION } from "@/lib/prompts/pair-interviewer";
import { checkSafetyLocally } from "@/lib/safety";
import { getFallbackPairQuestion, getInitialPairQuestion } from "@/lib/pair-fallbacks";
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

const PairInterviewRequestSchema = z.object({
  nameA: z.string().min(1).max(30),
  nameB: z.string().min(1).max(30),
  relationship: z.string().max(50),
  expectationType: z.enum(["matched", "mismatched", "neutral"]),
  currentTurnSpeaker: z.enum(["A", "B"]),
  conversationHistory: z.array(PairTurnSchema).max(3),
});

const GeminiPairInterviewOutputSchema = z.object({
  nextQuestion: z.string().min(1).max(80),
  nextSpeaker: z.enum(["A", "B"]),
  safetyAction: z.enum(["continue", "stop"]),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const primaryModel = getGeminiModelName();
  const secondaryModel = "gemini-2.5-flash";

  let parsedData: z.infer<typeof PairInterviewRequestSchema> | null = null;

  try {
    const rawBody = await req.json();
    const parsed = PairInterviewRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-interview",
        status: "error",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
        errorType: "INVALID_REQUEST_BODY",
      });
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    parsedData = parsed.data;
    const { nameA, nameB, relationship, expectationType, currentTurnSpeaker, conversationHistory } = parsedData;
    const historyCount = conversationHistory.length;

    if (historyCount >= 3) {
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        nextSpeaker: "A",
        nextSpeakerName: nameA,
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
        endpoint: "/api/pair-interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        nextSpeaker: "A",
        nextSpeakerName: nameA,
        progress: historyCount,
        isComplete: true,
        safetyAction: "stop",
        fallbackUsed: false,
      });
    }

    // 1問目（対話履歴なし）は参加者名・関係性・期待に応じた初期固定質問を即時返却
    if (historyCount === 0) {
      const initialQ = getInitialPairQuestion({
        nameA,
        nameB,
        relationship,
        expectationType: expectationType as ExpectationType,
      });
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: initialQ.question,
        nextSpeaker: initialQ.nextSpeaker,
        nextSpeakerName: initialQ.nextSpeakerName,
        progress: 1,
        isComplete: false,
        safetyAction: "continue",
        fallbackUsed: false,
      });
    }

    const nextProgress = historyCount + 1;
    const ai = getGeminiClient();

    if (!ai) {
      const fallback = getFallbackPairQuestion(nameA, nameB, historyCount, expectationType as ExpectationType);
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-interview",
        status: "fallback",
        durationMs: Date.now() - startTime,
        model: primaryModel,
        fallbackUsed: true,
        errorType: "NO_API_KEY",
      });
      return NextResponse.json({
        nextQuestion: fallback.question,
        nextSpeaker: fallback.nextSpeaker,
        nextSpeakerName: fallback.nextSpeakerName,
        progress: nextProgress,
        isComplete: false,
        safetyAction: "continue",
        fallbackUsed: true,
      });
    }

    const turnsContext = conversationHistory
      .map(
        (t, idx) =>
          `質問${idx + 1}（${t.speakerName}さんへ）: ${t.question}\n回答${idx + 1}: ${
            t.isSkipped ? "(スキップ)" : t.answer
          }`
      )
      .join("\n\n");

    const expectedNextSpeaker = historyCount === 0 ? "A" : historyCount === 1 ? "B" : "A";
    const expectedSpeakerName = expectedNextSpeaker === "A" ? nameA : nameB;

    const userPrompt = `【参加ペア情報】
- 参加者Aのお名前: ${nameA}
- 参加者Bのお名前: ${nameB}
- ふたりの関係性: ${relationship}
- 事前選択した期待と結果: ${
      expectationType === "matched"
        ? "ぴったり合っていた"
        : expectationType === "mismatched"
        ? "少しすれちがった"
        : "どちらともいえない"
    }

【これまでの対話履歴】
${turnsContext ? turnsContext : "(まだ対話はありません)"}

【指示】
現在は ${nextProgress} 問目の質問を作成してください（全3問中）。
${
  historyCount === 0
    ? `まずは【${nameA}さん】に対して、ふたりであった出来事や、そのとき【${nameB}さん】に期待していたことについて尋ねてください。`
    : historyCount === 1
    ? `直前の【${nameA}さん】のお話を受けて、次は【${nameB}さん】に対して、そのときどう思っていたか、または実際どうだったかをやさしく尋ねてください。`
    : `ふたりの対話を受けて、出来事を通してお互いの気持ちについてどう感じたか、まとめの問いかけを行ってください。`
}
質問文の冒頭には「${expectedSpeakerName}さん、」と呼びかけを入れてください。
質問は80文字以内、1つの疑問文で簡潔にしてください。
必ず指定されたJSONスキーマに従って出力してください。`;

    const config = getGeminiConfig(160);

    const callModel = async (modelToUse: string) => {
      return await generateContentWithTimeout(async () => {
        return await ai.models.generateContent({
          model: modelToUse,
          contents: userPrompt,
          config: {
            systemInstruction: PAIR_INTERVIEWER_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                nextQuestion: { type: "string" },
                nextSpeaker: {
                  type: "string",
                  enum: ["A", "B"],
                },
                safetyAction: {
                  type: "string",
                  enum: ["continue", "stop"],
                },
              },
              required: ["nextQuestion", "nextSpeaker", "safetyAction"],
            },
            maxOutputTokens: config.maxOutputTokens,
            temperature: config.temperature,
          },
        });
      }, 7500);
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
    const validatedOutput = GeminiPairInterviewOutputSchema.safeParse(parsedJson);

    if (!validatedOutput.success) {
      throw new Error("Gemini pair interview schema validation failed");
    }

    const data = validatedOutput.data;

    if (data.safetyAction === "stop") {
      logSafeRequest({
        requestId,
        endpoint: "/api/pair-interview",
        status: "success",
        durationMs: Date.now() - startTime,
        model: usedModel,
        fallbackUsed: false,
      });
      return NextResponse.json({
        nextQuestion: "",
        nextSpeaker: data.nextSpeaker,
        nextSpeakerName: data.nextSpeaker === "A" ? nameA : nameB,
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

    const nextSpeaker = data.nextSpeaker || expectedNextSpeaker;
    const nextSpeakerName = nextSpeaker === "A" ? nameA : nameB;

    logSafeRequest({
      requestId,
      endpoint: "/api/pair-interview",
      status: "success",
      durationMs: Date.now() - startTime,
      model: usedModel,
      fallbackUsed: false,
    });

    return NextResponse.json({
      nextQuestion: cleanQuestion,
      nextSpeaker,
      nextSpeakerName,
      progress: nextProgress,
      isComplete: false,
      safetyAction: "continue",
      fallbackUsed: false,
    });
  } catch (err: any) {
    const nameA = parsedData?.nameA || "参加者1";
    const nameB = parsedData?.nameB || "参加者2";
    const expType = parsedData?.expectationType || "neutral";
    const turnIdx = parsedData?.conversationHistory.length || 0;

    const fallback = getFallbackPairQuestion(nameA, nameB, turnIdx, expType as ExpectationType);

    logSafeRequest({
      requestId,
      endpoint: "/api/pair-interview",
      status: "fallback",
      durationMs: Date.now() - startTime,
      model: primaryModel,
      fallbackUsed: true,
      errorType: err?.message || err?.name || "GEMINI_ERROR",
    });

    return NextResponse.json({
      nextQuestion: fallback.question,
      nextSpeaker: fallback.nextSpeaker,
      nextSpeakerName: fallback.nextSpeakerName,
      progress: turnIdx + 1,
      isComplete: false,
      safetyAction: "continue",
      fallbackUsed: true,
    });
  }
}