import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CollectedEpisode } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "episodes.json");

// インメモリのフォールバックキャッシュ（サーバーレス環境等で書き込み不可の場合）
let memoryEpisodes: CollectedEpisode[] = [];

function loadEpisodesFromFile(): CollectedEpisode[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content) as CollectedEpisode[];
    }
  } catch (err) {
    console.warn("Could not read episodes file, falling back to memory:", err);
  }
  return memoryEpisodes;
}

function saveEpisodesToFile(episodes: CollectedEpisode[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(episodes, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("Could not write episodes to file (likely read-only filesystem on serverless):", err);
    return false;
  }
}

export async function GET() {
  const episodes = loadEpisodesFromFile();
  return NextResponse.json({
    episodes,
    total: episodes.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const episode: CollectedEpisode = await req.json();

    if (!episode || !episode.id || !episode.mode) {
      return NextResponse.json({ error: "Invalid episode data" }, { status: 400 });
    }

    const currentList = loadEpisodesFromFile();
    const filtered = currentList.filter((e) => e.id !== episode.id);
    const updated = [episode, ...filtered];

    memoryEpisodes = updated;
    const fileSaved = saveEpisodesToFile(updated);

    return NextResponse.json({
      success: true,
      id: episode.id,
      savedToFile: fileSaved,
      total: updated.length,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save episode" }, { status: 500 });
  }
}

export async function DELETE() {
  memoryEpisodes = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  } catch (err) {
    console.warn("Could not delete episodes file:", err);
  }
  return NextResponse.json({ success: true, message: "All episodes cleared" });
}