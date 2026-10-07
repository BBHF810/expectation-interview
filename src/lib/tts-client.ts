/**
 * ブラウザ側の音声取得ヘルパー
 *
 * VOICEVOX は「展示PC（ブラウザを開いているPC）」上で動くため、
 * サーバー（Vercel）からは到達できない。VOICEVOX ボイス選択時は
 * ブラウザから直接 127.0.0.1:50021 を呼び出し、失敗時のみ /api/tts（OpenAI）へフォールバックする。
 */

export type TtsEngineUsed = "VOICEVOX" | "OpenAI";

const CUSTOM_VOICEVOX_URL_KEY = "expectation_voicevox_url";
export const DEFAULT_VOICEVOX_URL = "http://127.0.0.1:50021";

export function getBrowserVoicevoxUrl(): string {
  if (typeof window !== "undefined") {
    try {
      const custom = localStorage.getItem(CUSTOM_VOICEVOX_URL_KEY);
      if (custom && custom.trim() !== "") {
        return custom.trim().replace(/\/$/, "");
      }
    } catch {}
  }
  return (process.env.NEXT_PUBLIC_VOICEVOX_URL || DEFAULT_VOICEVOX_URL).replace(/\/$/, "");
}

export function saveBrowserVoicevoxUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!url || url.trim() === "" || url.trim() === DEFAULT_VOICEVOX_URL) {
      localStorage.removeItem(CUSTOM_VOICEVOX_URL_KEY);
    } else {
      localStorage.setItem(CUSTOM_VOICEVOX_URL_KEY, url.trim().replace(/\/$/, ""));
    }
  } catch {}
}

export function isMixedContentRisk(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:" && getBrowserVoicevoxUrl().startsWith("http://");
}

function parseVoicevoxSpeaker(voice: string): number | null {
  if (!voice.startsWith("voicevox:")) return null;
  const id = parseInt(voice.split(":")[1], 10);
  return Number.isNaN(id) ? null : id;
}

/** ブラウザから手元の VOICEVOX で音声合成。失敗時は null */
export async function synthesizeWithLocalVoicevox(
  text: string,
  speakerId: number,
  timeoutMs = 5000
): Promise<Blob | null> {
  const baseUrl = getBrowserVoicevoxUrl();
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    const queryRes = await fetch(
      `${baseUrl}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`,
      { method: "POST", signal }
    );
    if (!queryRes.ok) return null;
    const audioQuery = await queryRes.json();
    audioQuery.speedScale = 1.0;

    const synthRes = await fetch(`${baseUrl}/synthesis?speaker=${speakerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/wav" },
      body: JSON.stringify(audioQuery),
      signal,
    });
    if (!synthRes.ok) return null;
    return await synthRes.blob();
  } catch (err) {
    // 未起動・CORS拒否・ローカルネットワークアクセス拒否・タイムアウト
    console.warn("[TTS] VOICEVOX に接続できませんでした。OpenAI 音声にフォールバックします:", err);
    return null;
  }
}

/** VOICEVOX にブラウザから接続できるかを確認（管理画面の状態表示用） */
export async function checkLocalVoicevox(): Promise<{ ok: boolean; version?: string }> {
  try {
    const res = await fetch(`${getBrowserVoicevoxUrl()}/version`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { ok: false };
    return { ok: true, version: String(await res.json()) };
  } catch {
    return { ok: false };
  }
}

/**
 * 指定ボイスで音声 Blob を取得する。
 * VOICEVOX ボイス → ブラウザから直接 VOICEVOX、失敗時は /api/tts（OpenAI）
 * OpenAI ボイス → /api/tts
 * どちらも失敗した場合は例外を投げる（呼び出し側でブラウザ標準音声にフォールバック）
 */
export async function fetchTtsBlob(
  text: string,
  voice: string
): Promise<{ blob: Blob; engine: TtsEngineUsed }> {
  const speakerId = parseVoicevoxSpeaker(voice);
  if (speakerId !== null) {
    const blob = await synthesizeWithLocalVoicevox(text, speakerId);
    if (blob) return { blob, engine: "VOICEVOX" };
  }

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) throw new Error("TTS API unavailable");
  return { blob: await res.blob(), engine: "OpenAI" };
}
