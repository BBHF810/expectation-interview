import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVoicevoxApiUrl, VOICEVOX_SPEAKERS, generateVoicevoxAudio } from "@/lib/voicevox";
import { POST as ttsPost } from "@/app/api/tts/route";
import { NextRequest } from "next/server";

describe("VOICEVOX 音声連携テスト", () => {
  it("デフォルトのAPI URLは http://127.0.0.1:50021 である", () => {
    expect(getVoicevoxApiUrl()).toBe("http://127.0.0.1:50021");
  });

  it("主要なスピーカー（四国めたん・青山龍星・ずんだもん・春日部つむぎ）が定義されている", () => {
    expect(VOICEVOX_SPEAKERS).toHaveLength(4);
    const ids = VOICEVOX_SPEAKERS.map((s) => s.id);
    expect(ids).toContain(2); // 四国めたん
    expect(ids).toContain(13); // 青山龍星
    expect(ids).toContain(3); // ずんだもん
    expect(ids).toContain(8); // 春日部つむぎ
  });

  it("VOICEVOXが未起動または接続不能な場合、generateVoicevoxAudio は例外を投げず null を返す", async () => {
    // 存在しないポートにアクセスしてフォールバックを確認
    process.env.VOICEVOX_API_URL = "http://127.0.0.1:59999";
    const result = await generateVoicevoxAudio("テストです", 2, 500);
    expect(result).toBeNull();
    delete process.env.VOICEVOX_API_URL;
  });

  it("/api/tts: テキストが空の場合は 400 エラーを返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    });

    const res = await ttsPost(req);
    expect(res.status).toBe(400);
  });
});
