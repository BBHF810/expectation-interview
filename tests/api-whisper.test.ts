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
      })
    );
  });
});
