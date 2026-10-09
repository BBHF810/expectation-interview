import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/openai", () => ({
  getOpenAiClient: () => ({
    audio: {
      speech: {
        create: vi.fn().mockResolvedValue({
          arrayBuffer: async () => new ArrayBuffer(100),
        }),
      },
    },
  }),
}));

import { POST } from "@/app/api/tts/route";

describe("TTS API (/api/tts)", () => {
  it("テキストが空の場合は 400 エラーを返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("リクエスト成功時、2回目の同一リクエストはキャッシュから即時返却される", async () => {
    const textToSynthesize = "キャッシュテスト用のテキストです。こんにちは！";
    const req1 = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToSynthesize, voice: "nova" }),
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    // 2回目リクエスト
    const req2 = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToSynthesize, voice: "nova" }),
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const engineHeader = res2.headers.get("X-TTS-Engine");
    expect(engineHeader).toContain("Cached");
  });
});
