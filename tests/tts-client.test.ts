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

  it("ローカルVOICEVOXが未接続でも、クラウドVOICEVOX APIが利用可能な場合は VOICEVOX (Cloud) 音声を返す", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("http://127.0.0.1")) throw new TypeError("Failed to connect to local");
      if (url.includes("api.tts.quest/v3/voicevox/synthesis")) {
        return new Response(
          JSON.stringify({
            success: true,
            audioStatusUrl: "https://audio.tts.quest/status.json",
            mp3DownloadUrl: "https://audio.tts.quest/audio.mp3",
          }),
          { status: 200 }
        );
      }
      if (url.includes("audio.tts.quest/status.json")) {
        return new Response(JSON.stringify({ isAudioReady: true }), { status: 200 });
      }
      if (url.includes("audio.tts.quest/audio.mp3")) {
        return new Response(new Blob(["cloud-mp3"]), { status: 200 });
      }
      throw new Error("unexpected url " + url);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTtsBlob("こんにちは", "voicevox:3");

    expect(result.engine).toBe("VOICEVOX (Cloud)");
    expect(fetchMock.mock.calls.some((c) => String(c[0]).includes("api.tts.quest"))).toBe(true);
    // /api/tts は呼ばれない
    expect(fetchMock.mock.calls.some((c) => String(c[0]).startsWith("/api/tts"))).toBe(false);
  });

  it("ローカルもクラウドも失敗した場合は /api/tts（OpenAI）にフォールバックする", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("http://127.0.0.1")) throw new TypeError("Failed to fetch local");
      if (url.includes("api.tts.quest")) throw new TypeError("Failed to fetch cloud");
      if (url.startsWith("/api/tts")) {
        return new Response(new Blob(["openai-mp3"]), {
          status: 200,
          headers: { "X-TTS-Engine": "OpenAI-TTS-HD" },
        });
      }
      throw new Error("unexpected url " + url);
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

  it("prefetchStreamingUrl はストリーミングURLを取得し、2回目以降はキャッシュから即時返却してfetchを重複実行しない", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("api.tts.quest/v3/voicevox/synthesis")) {
        return new Response(
          JSON.stringify({
            success: true,
            mp3StreamingUrl: "https://audio.tts.quest/streaming-123.mp3",
          }),
          { status: 200 }
        );
      }
      throw new Error("unexpected url: " + url);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { prefetchStreamingUrl, fetchPlayableTts } = await import("@/lib/tts-client");
    const testText = "テスト先行プリフェッチ質問";
    const url1 = await prefetchStreamingUrl(testText, "voicevox:3");

    expect(url1).toBe("https://audio.tts.quest/streaming-123.mp3");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 2回目（fetchPlayableTts 経由）: キャッシュが再利用され、追加fetchは発生しない
    const playable = await fetchPlayableTts(testText, "voicevox:3");
    expect(playable.src).toBe("https://audio.tts.quest/streaming-123.mp3");
    expect(playable.engine).toBe("VOICEVOX (Cloud)");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
