import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
      constructor() {}
    },
  };
});

describe("callOpenAiJson パラメータ検証テスト", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "mock-openai-key";
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ nextQuestion: "テスト質問", questionPurpose: "event", safetyAction: "continue" }),
          },
        },
      ],
    });
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("callOpenAiJson は max_tokens ではなく max_completion_tokens を送信する", async () => {
    const { callOpenAiJson } = await import("@/lib/openai");

    const result = await callOpenAiJson<{ nextQuestion: string }>({
      systemInstruction: "あなたはインタビュアーです",
      userPrompt: "質問を生成してください",
      maxTokens: 120,
      temperature: 0.2,
    });

    expect(result.nextQuestion).toBe("テスト質問");
    expect(mockCreate).toHaveBeenCalledTimes(1);

    const callArgs = mockCreate.mock.calls[0][0];
    // max_completion_tokens が設定されていること
    expect(callArgs.max_completion_tokens).toBe(120);
    // 旧パラメータ max_tokens が存在しないこと（400エラーの原因）
    expect(callArgs.max_tokens).toBeUndefined();
    expect(callArgs.temperature).toBe(0.2);
  });

  it("推論モデル（o1, o3）が指定された場合は temperature を除外する", async () => {
    const { callOpenAiJson } = await import("@/lib/openai");

    await callOpenAiJson<{ nextQuestion: string }>({
      systemInstruction: "あなたはインタビュアーです",
      userPrompt: "質問を生成してください",
      model: "o1-preview",
      maxTokens: 300,
      temperature: 0.2,
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe("o1-preview");
    expect(callArgs.max_completion_tokens).toBe(300);
    expect(callArgs.temperature).toBeUndefined();
  });
});
