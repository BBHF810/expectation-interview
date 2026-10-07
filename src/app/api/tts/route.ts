import { NextRequest, NextResponse } from "next/server";
import { getOpenAiClient } from "@/lib/openai";
import { generateVoicevoxAudio } from "@/lib/voicevox";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "voicevox:2", voicevoxSpeaker } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
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

    // VOICEVOX は通常ブラウザ側（src/lib/tts-client.ts）で直接呼び出す。
    // サーバー（Vercel）からは展示PCの 127.0.0.1 に届かないため、
    // VOICEVOX_API_URL が明示的に設定されている場合（ローカル実行・自前サーバー）のみここで試行する。
    const voicevoxResult =
      isVoicevoxPreferred && process.env.VOICEVOX_API_URL
        ? await generateVoicevoxAudio(text, speakerId, 2500)
        : null;

    if (voicevoxResult) {
      return new NextResponse(new Uint8Array(voicevoxResult.buffer), {
        status: 200,
        headers: {
          "Content-Type": voicevoxResult.contentType,
          "Content-Length": voicevoxResult.buffer.length.toString(),
          "X-TTS-Engine": "VOICEVOX",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 2. VOICEVOX が未起動・接続不可の場合は OpenAI TTS にフォールバック
    const client = getOpenAiClient();
    if (!client) {
      return NextResponse.json(
        { error: "No TTS engine available", fallbackToBrowser: true },
        { status: 503 }
      );
    }

    // OpenAIボイスの決定（VOICEVOX設定からフォールバックした場合は上品で自然な "shimmer" または "nova"）
    let openAiVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "shimmer";
    if (typeof voice === "string" && !voice.startsWith("voicevox:")) {
      if (["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice)) {
        openAiVoice = voice as any;
      }
    }

    // tts-1-hd にアップグレード & speed: 1.0 で落ち着いたトーン
    const response = await client.audio.speech.create({
      model: "tts-1-hd",
      voice: openAiVoice,
      input: text.slice(0, 4096),
      response_format: "mp3",
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

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
