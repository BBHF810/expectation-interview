/**
 * ブラウザ側の音声取得ヘルパー
 *
 * VOICEVOX は「展示PC（ブラウザを開いているPC）」上で動くため、
 * サーバー（Vercel）からは到達できない。VOICEVOX ボイス選択時は
 * ブラウザから直接 127.0.0.1:50021 を呼び出し、失敗時のみ /api/tts（OpenAI）へフォールバックする。
 */

export type TtsEngineUsed = "VOICEVOX" | "VOICEVOX (Cloud)" | "OpenAI";

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

function getTimeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
    return undefined;
  }
  if (typeof AbortController === "undefined") return undefined;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/** ブラウザから手元の VOICEVOX で音声合成。失敗時は null */
export async function synthesizeWithLocalVoicevox(
  text: string,
  speakerId: number,
  timeoutMs = 2000
): Promise<Blob | null> {
  const baseUrl = getBrowserVoicevoxUrl();
  try {
    const signal = getTimeoutSignal(timeoutMs);

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
    // 未起動・CORS拒否・Mixed Content遮断・タイムアウト等
    return null;
  }
}

/** ブラウザから無料公開クラウド VOICEVOX Web API (api.tts.quest) で音声合成。失敗時は null */
export async function synthesizeWithCloudVoicevox(
  text: string,
  speakerId: number,
  timeoutMs = 8000
): Promise<Blob | null> {
  try {
    const startTime = Date.now();
    const initRes = await fetch(
      `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
      {
        signal: getTimeoutSignal(3000),
      }
    );
    if (!initRes.ok) return null;
    const initData = await initRes.json();
    if (!initData || !initData.success) return null;

    const statusUrl = initData.audioStatusUrl;
    const mp3Url = initData.mp3DownloadUrl;
    if (!mp3Url) return null;

    while (Date.now() - startTime < timeoutMs) {
      if (statusUrl) {
        const sRes = await fetch(statusUrl, {
          signal: getTimeoutSignal(2000),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.isAudioReady) {
            const audioRes = await fetch(mp3Url, {
              signal: getTimeoutSignal(4000),
            });
            if (audioRes.ok) {
              return await audioRes.blob();
            }
          }
          if (sData.isAudioError) {
            return null;
          }
        }
      } else {
        const audioRes = await fetch(mp3Url);
        if (audioRes.ok) {
          return await audioRes.blob();
        }
      }

      await new Promise((r) => setTimeout(r, 400));
    }
    return null;
  } catch (err) {
    console.warn("[TTS] クラウドVOICEVOXの直接取得が完了しませんでした:", err);
    return null;
  }
}

/** VOICEVOX にブラウザから接続できるかを確認（管理画面の状態表示用） */
export async function checkLocalVoicevox(): Promise<{ ok: boolean; version?: string }> {
  try {
    const res = await fetch(`${getBrowserVoicevoxUrl()}/version`, {
      signal: getTimeoutSignal(2000),
    });
    if (!res.ok) return { ok: false };
    return { ok: true, version: String(await res.json()) };
  } catch {
    return { ok: false };
  }
}

/** クラウドVOICEVOX Web APIが稼働しているかを確認 */
export async function checkCloudVoicevox(): Promise<boolean> {
  try {
    const res = await fetch("https://api.tts.quest/v3/voicevox/synthesis?text=%E3%81%82&speaker=3", {
      signal: getTimeoutSignal(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 指定ボイスで音声 Blob を取得する。
 *
 * VOICEVOX ボイスの場合:
 *  ① 手元のローカル VOICEVOX (127.0.0.1:50021) を試行（~0.5秒）
 *  ② 未起動・Mixed Content時は クラウドVOICEVOX Web API (api.tts.quest) を直接試行（ゼロ設定）
 *  ③ クラウドAPIが混雑・障害時は サーバー /api/tts (OpenAI TTS-1-HD) にフォールバック
 *
 * OpenAI ボイスの場合:
 *  直接 /api/tts を呼び出す
 */
export async function fetchTtsBlob(
  text: string,
  voice: string
): Promise<{ blob: Blob; engine: TtsEngineUsed }> {
  const speakerId = parseVoicevoxSpeaker(voice);

  if (speakerId !== null) {
    // ① ローカル VOICEVOX の試行
    const localBlob = await synthesizeWithLocalVoicevox(text, speakerId);
    if (localBlob) return { blob: localBlob, engine: "VOICEVOX" };

    // ② 無料クラウド VOICEVOX Web API の試行（Vercel上・スマホ・ゼロ設定対応）
    const cloudBlob = await synthesizeWithCloudVoicevox(text, speakerId);
    if (cloudBlob) return { blob: cloudBlob, engine: "VOICEVOX (Cloud)" };
  }

  // ③ サーバーサイド (/api/tts) へフォールバック
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) throw new Error("TTS API unavailable");

  const engineHeader = res.headers.get("X-TTS-Engine");
  let engine: TtsEngineUsed = "OpenAI";
  if (engineHeader === "VOICEVOX") {
    engine = "VOICEVOX";
  } else if (engineHeader === "VOICEVOX-Cloud") {
    engine = "VOICEVOX (Cloud)";
  }

  return { blob: await res.blob(), engine };
}
