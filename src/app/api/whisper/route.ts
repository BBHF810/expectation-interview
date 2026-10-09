import { NextRequest, NextResponse } from "next/server";
import { getOpenAiClient } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAiClient();
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    const transcript = await openai.audio.transcriptions.create({
      file: file as any,
      model: "whisper-1",
      language: "ja",
    });

    return NextResponse.json({ text: transcript.text });
  } catch (error: any) {
    console.error("[api/whisper] Error transcribing audio:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
