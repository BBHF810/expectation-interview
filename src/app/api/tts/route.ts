import { NextRequest, NextResponse } from "next/server";
import { getOpenAiClient } from "@/lib/openai";
import { generateVoicevoxAudio, generateCloudVoicevoxAudio } from "@/lib/voicevox";
import { stripFurigana } from "@/components/FuriganaText";

// サーバーサイド・インメモリ音声キャッシュ（固定質問等の再生成待機ゼロ化）
const ttsAudioCache = new Map<string, { buffer: Buffer; contentType: string; engine: string }>();
const MAX_CACHE_SIZE = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "voicevox:2", voicevoxSpeaker } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 読み上げ前にふりがなカッコ書き等を完全に除去し二重読みを防止
    const cleanText = stripFurigana(text.trim());
    if (!cleanText) {
      return NextResponse.json({ error: "Valid text is required" }, { status: 400 });
    }

    // 0. キャッシュヒット判定（同一テキスト・ボイスは0msで返却）
    const cacheKey = `${voice}:${voicevoxSpeaker ?? ""}:${cleanText}`;
    const cached = ttsAudioCache.get(cacheKey);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Content-Length": cached.buffer.length.toString(),
          "X-TTS-Engine": `${cached.engine}-Cached`,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 1. VOICEVOX の呼び出しを最優先で試行
    // スピーカーID決定（voicevoxSpeaker 指定、または voice が "voicevox:XX" 形式の場合）
    let speakerId = 2; // デフォルト: 四国めたん（ノーマル）
    const isVoicevoxPreferred =
      typeof voicevoxSpeaker === "number" ||
      (typeof voice === "string" && voice.startsWith("voicevox:"));

    if (typeof voicevoxSpeaker === "number") {
      speakerId = voicevoxSpeaker;
    } else if (typeof voice === "string" && voice.startsWith("voicevox:")) {
      const parsedId = parseInt(voice.split(":")[1], 10);
      if (!isNaN(parsedId)) {
        speakerId = parsedId;
      }
    }

    // ① 自前/ローカル VOICEVOX URL が設定されている場合は優先実行
    let voicevoxResult =
      isVoicevoxPreferred && process.env.VOICEVOX_API_URL
        ? await generateVoicevoxAudio(cleanText, speakerId, 4000)
        : null;

    let engineHeader = "VOICEVOX";

    // ② 無料クラウドVOICEVOX Web API (tts.quest) をサーバー側で十分に時間をかけて実行（最大15秒）
    if (!voicevoxResult && isVoicevoxPreferred) {
      voicevoxResult = await generateCloudVoicevoxAudio(cleanText, speakerId, 15000);
      if (voicevoxResult) {
        engineHeader = "VOICEVOX-Cloud";
      }
    }

    if (voicevoxResult) {
      if (ttsAudioCache.size >= MAX_CACHE_SIZE) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, {
        buffer: voicevoxResult.buffer,
        contentType: voicevoxResult.contentType,
        engine: engineHeader,
      });

      return new NextResponse(new Uint8Array(voicevoxResult.buffer), {
        status: 200,
        headers: {
          "Content-Type": voicevoxResult.contentType,
          "Content-Length": voicevoxResult.buffer.length.toString(),
          "X-TTS-Engine": engineHeader,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // VOICEVOXが指定されているが取得できなかった場合、途中で声が切り替わるのを防ぐため、
    // 勝手に別の声（OpenAI）に差し替えずにリトライを促すエラーを返す
    if (isVoicevoxPreferred) {
      return NextResponse.json(
        { error: "VOICEVOX engine temporarily busy. Please retry.", voice },
        { status: 503 }
      );
    }

    // 2. OpenAI ボイスが指定されている場合のみ OpenAI TTS を実行
    const client = getOpenAiClient();
    if (!client) {
      return NextResponse.json(
        { error: "No TTS engine available", voice },
        { status: 503 }
      );
    }

    let openAiVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "shimmer";
    if (["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice)) {
      openAiVoice = voice as any;
    }

    // tts-1-hd にアップグレード & speed: 1.0 で落ち着いたトーン
    const response = await client.audio.speech.create({
      model: "tts-1-hd",
      voice: openAiVoice,
      input: cleanText.slice(0, 4096),
      response_format: "mp3",
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    if (ttsAudioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, {
      buffer,
      contentType: "audio/mpeg",
      engine: "OpenAI-TTS-HD",
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "X-TTS-Engine": "OpenAI-TTS-HD",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      { error: error?.message || "TTS generation failed", fallbackToBrowser: true },
      { status: 500 }
    );
  }
}
