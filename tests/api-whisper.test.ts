import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/whisper/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/openai", () => ({
  getOpenAiClient: vi.fn(),
}));

describe("Whisper API (/api/whisper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("OpenAIクライアントが利用できない場合は500エラーを返す", async () => {
    const { getOpenAiClient } = await import("@/lib/openai");
    vi.mocked(getOpenAiClient).mockReturnValue(null);

    const formData = new FormData();
    formData.append("file", new Blob(["audio-data"], { type: "audio/webm" }), "audio.webm");

    const req = new NextRequest("http://localhost:3000/api/whisper", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("OpenAI API key is not configured");
  });

  it("fileが送信されなかった場合は400エラーを返す", async () => {
    const { getOpenAiClient } = await import("@/lib/openai");
    const mockOpenAi = {
      audio: {
        transcriptions: {
          create: vi.fn(),
        },
      },
    } as any;
    vi.mocked(getOpenAiClient).mockReturnValue(mockOpenAi);

    const formData = new FormData();

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Audio file is required");
  });

  it("正常な音声ファイルを受け取った場合、Whisperによる文字起こし結果を返す", async () => {
    const { getOpenAiClient } = await import("@/lib/openai");
    const mockCreate = vi.fn().mockResolvedValue({ text: "こんにちは、お元気ですか" });
    const mockOpenAi = {
      audio: {
        transcriptions: {
          create: mockCreate,
        },
      },
    } as any;
    vi.mocked(getOpenAiClient).mockReturnValue(mockOpenAi);

    const formData = new FormData();
    formData.append("file", new Blob(["dummy-audio-bytes"], { type: "audio/webm" }), "speech.webm");

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBe("こんにちは、お元気ですか");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "whisper-1",
        language: "ja",
        temperature: 0,
        prompt: expect.stringContaining("文字起こし"),
      })
    );
  });

  it("「ご視聴ありがとうございました」などの無音ハルシネーションは空文字にサニタイズされる", async () => {
    const { getOpenAiClient } = await import("@/lib/openai");
    const mockCreate = vi.fn().mockResolvedValue({ text: "ご視聴ありがとうございました。" });
    const mockOpenAi = {
      audio: {
        transcriptions: {
          create: mockCreate,
        },
      },
    } as any;
    vi.mocked(getOpenAiClient).mockReturnValue(mockOpenAi);

    const formData = new FormData();
    formData.append("file", new Blob(["dummy-audio-bytes"], { type: "audio/webm" }), "speech.webm");

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    // ハルシネーション単体は空文字として返却される
    expect(data.text).toBe("");
  });

  it("回答末尾にハルシネーションが付着した場合、正常な発話部分のみが残る", async () => {
    const { getOpenAiClient } = await import("@/lib/openai");
    const mockCreate = vi.fn().mockResolvedValue({ text: "友達と一緒に遊んで楽しかったです。ご視聴ありがとうございました。" });
    const mockOpenAi = {
      audio: {
        transcriptions: {
          create: mockCreate,
        },
      },
    } as any;
    vi.mocked(getOpenAiClient).mockReturnValue(mockOpenAi);

    const formData = new FormData();
    formData.append("file", new Blob(["dummy-audio-bytes"], { type: "audio/webm" }), "speech.webm");

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBe("友達と一緒に遊んで楽しかったです。");
  });
});

describe("sanitizeWhisperTranscript ヘルパー関数テスト", () => {
  it("各種ハルシネーションパターンを正しく除去する", async () => {
    const { sanitizeWhisperTranscript } = await import("@/lib/whisper-sanitizer");

    expect(sanitizeWhisperTranscript("ご視聴ありがとうございました")).toBe("");
    expect(sanitizeWhisperTranscript("ご視聴ありがとうございました。")).toBe("");
    expect(sanitizeWhisperTranscript("ご視聴いただきありがとうございました！")).toBe("");
    expect(sanitizeWhisperTranscript("チャンネル登録よろしくお願いします。")).toBe("");
    expect(sanitizeWhisperTranscript("MBCニュースでした")).toBe("");
    expect(sanitizeWhisperTranscript("Thank you for watching.")).toBe("");
    expect(sanitizeWhisperTranscript("。")).toBe("");
    expect(sanitizeWhisperTranscript("")).toBe("");

    // 正常な発話はそのまま維持される
    expect(sanitizeWhisperTranscript("昨日は家族で旅行に行きました。")).toBe("昨日は家族で旅行に行きました。");
    expect(sanitizeWhisperTranscript("映画を視聴しました")).toBe("映画を視聴しました");

    // 末尾付着パターンの除去
    expect(sanitizeWhisperTranscript("楽しかった思い出です。ご視聴ありがとうございました")).toBe("楽しかった思い出です。");
  });
});
