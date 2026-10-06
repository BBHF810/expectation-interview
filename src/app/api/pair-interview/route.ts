import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient, getGeminiModelName, getGeminiConfig, generateContentWithTimeout } from "@/lib/gemini";
import { isOpenAiConfigured, getOpenAiModelName, callOpenAiJson } from "@/lib/openai";
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
  conversationHistory: z.array(PairTurnSchema).max(4),
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

    if (historyCount >= 4) {
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
        progress: 2,
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

    const questionNumber = Math.floor(historyCount / 2) + 1; // Q1 or Q2
    const nextProgress = questionNumber;
    const ai = getGeminiClient();
    const hasOpenAi = isOpenAiConfigured();

    if (!ai && !hasOpenAi) {
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
          `質問${Math.floor(idx / 2) + 1}-${t.speaker}（${t.speakerName}さんへ）: ${t.question}\n回答: ${
            t.isSkipped ? "(スキップ)" : t.answer
          }`
      )
      .join("\n\n");

    // Q2生成時（historyCount===2）はAが先に回答するのでnextSpeakerはA
    const expectedNextSpeaker = "A";
    const expectedSpeakerName = nameA;

    const userPrompt = `【参加ペア情報】
- 参加者Aのニックネーム: ${nameA}
- 参加者Bのニックネーム: ${nameB}
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
これは全2問のインタビューです。各質問に対してAとBの二人がそれぞれ回答します。
現在は ${questionNumber} 問目の質問を作成してください。
${
  historyCount === 2
    ? `質問1で${nameA}さんと${nameB}さんが同じ質問に答えました。次は質問2として、ふたりの対話を踏まえ、出来事を通してお互いの気持ちや関わり方について掘り下げる質問を作ってください。`
    : `${nameA}さんと${nameB}さんに対して、ふたりであった出来事や、そのとき相手に期待していたことについて尋ねてください。`
}
質問文の冒頭には「${expectedSpeakerName}さん、」と呼びかけを入れてください（AとBの両方がこの質問に回答します）。
質問は80文字以内、1つの疑問文で簡潔にしてください。
必ず指定されたJSONスキーマに従って出力してください。`;

    const config = getGeminiConfig(160);

    let validatedData: z.infer<typeof GeminiPairInterviewOutputSchema> | null = null;
    let usedModel = primaryModel;

    // 1. OpenAI (GPT-4o) が設定されていれば最優先で呼び出し
    if (isOpenAiConfigured()) {
      try {
        usedModel = getOpenAiModelName();
        const openAiResult = await callOpenAiJson<any>({
          systemInstruction: `${PAIR_INTERVIEWER_SYSTEM_INSTRUCTION}\n\n【必須出力フォーマット】以下のJSONを出力してください:
{
  "nextQuestion": "80文字以内の次の質問文（冒頭に${expectedSpeakerName}さん、を含める）",
  "nextSpeaker": "${expectedNextSpeaker}",
  "safetyAction": "continue" | "stop"
}`,
          userPrompt,
          model: usedModel,
          temperature: 0.3,
          maxTokens: 250,
          timeoutMs: 8000,
        });

        const parsed = GeminiPairInterviewOutputSchema.safeParse(openAiResult);
        if (parsed.success) {
          validatedData = parsed.data;
        }
      } catch (openAiErr) {
        console.warn("OpenAI pair-interview failed, falling back to Gemini:", openAiErr);
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
      const parsed = GeminiPairInterviewOutputSchema.safeParse(parsedJson);
      if (!parsed.success) {
        throw new Error("Gemini pair interview schema validation failed");
      }
      validatedData = parsed.data;
    }

    const data = validatedData;

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

    const nextSpeaker = "A" as const;
    const nextSpeakerName = nameA;

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