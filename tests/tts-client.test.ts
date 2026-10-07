import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTtsBlob } from "@/lib/tts-client";

describe("ブラウザ側 TTS ヘルパー (fetchTtsBlob)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("VOICEVOX ボイスはブラウザから直接 127.0.0.1:50021 を呼び、成功時は VOICEVOX 音声を返す", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/audio_query")) {
        return new Response(JSON.stringify({ speedScale: 1.2 }), { status: 200 });
      }
      if (url.includes("/synthesis")) {
        return new Response(new Blob(["wav"]), { status: 200 });
      }
      throw new Error("unexpected url " + url);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTtsBlob("こんにちは", "voicevox:3");

    expect(result.engine).toBe("VOICEVOX");
    expect(fetchMock.mock.calls[0][0]).toContain("http://127.0.0.1:50021/audio_query?speaker=3");
    expect(fetchMock.mock.calls[1][0]).toContain("/synthesis?speaker=3");
    // サーバー (/api/tts) は呼ばれない
    expect(fetchMock.mock.calls.some((c) => String(c[0]).startsWith("/api/tts"))).toBe(false);
  });

  it("VOICEVOX に接続できない場合は /api/tts（OpenAI）にフォールバックする", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("http://127.0.0.1")) throw new TypeError("Failed to fetch");
      return new Response(new Blob(["mp3"]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTtsBlob("こんにちは", "voicevox:3");

    expect(result.engine).toBe("OpenAI");
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe("/api/tts");
  });

  it("OpenAI ボイスは VOICEVOX を呼ばずに /api/tts を使う", async () => {
    const fetchMock = vi.fn(async () => new Response(new Blob(["mp3"]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTtsBlob("こんにちは", "shimmer");

    expect(result.engine).toBe("OpenAI");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/tts");
  });
});
