import { NextRequest, NextResponse } from "next/server";
import { getOpenAiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "nova" } = await req.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const client = getOpenAiClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI is not configured", fallbackToBrowser: true },
        { status: 503 }
      );
    }

    // OpenAI TTS API 呼び出し (tts-1, 声: nova/alloy/shimmer等)
    const response = await client.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text.slice(0, 4096),
      response_format: "mp3",
      speed: 1.05,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("OpenAI TTS error:", error);
    return NextResponse.json(
      { error: error?.message || "TTS generation failed", fallbackToBrowser: true },
      { status: 500 }
    );
  }
}
