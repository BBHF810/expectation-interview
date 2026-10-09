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

export function hasCustomVoicevoxUrl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const custom = localStorage.getItem(CUSTOM_VOICEVOX_URL_KEY);
    return Boolean(custom && custom.trim() !== "");
  } catch {
    return false;
  }
}

export function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

/** ローカルPCの VOICEVOX への接続を試みるべきかを判定（Vercel等の外部環境で未設定時は不要なERR_CONNECTION_REFUSEDを防ぐ） */
export function shouldTryLocalVoicevox(): boolean {
  return isLocalEnvironment() || hasCustomVoicevoxUrl();
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

/** iPad / iOS Safari の Autoplay 制限を解除するための共通アンロック処理 */
export function unlockAudioOnUserAction(): void {
  if (typeof window === "undefined") return;
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") return;
  try {
    const dummy = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    dummy.volume = 0.01;
    const p = dummy.play();
    if (p !== undefined) {
      p.then(() => dummy.pause()).catch(() => {});
    }
  } catch {}
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
  timeoutMs = 25000
): Promise<Blob | null> {
  try {
    const startTime = Date.now();
    // 初期リクエスト（キューイング）：長文テキストでもタイムアウトしないよう十分な時間を確保
    const initRes = await fetch(
      `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
      {
        signal: getTimeoutSignal(10000),
      }
    );
    if (!initRes.ok) return null;
    const initData = await initRes.json();
    if (!initData || !initData.success) return null;

    const statusUrl = initData.audioStatusUrl;
    const mp3Url = initData.mp3DownloadUrl;
    if (!mp3Url) return null;

    // 音声生成完了まで待機ポーリング（長文質問でも10〜15秒で確実に完了するよう余裕をもったタイムアウトを設定）
    while (Date.now() - startTime < timeoutMs) {
      if (statusUrl) {
        const sRes = await fetch(statusUrl, {
          signal: getTimeoutSignal(3000),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.isAudioReady) {
            const audioRes = await fetch(mp3Url, {
              signal: getTimeoutSignal(8000),
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

      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  } catch (err) {
    console.warn("[TTS] クラウドVOICEVOXの直接取得が完了しませんでした:", err);
    return null;
  }
}

/** VOICEVOX にブラウザから接続できるかを確認（管理画面の状態表示用） */
export async function checkLocalVoicevox(force = false): Promise<{ ok: boolean; version?: string }> {
  // 明示的な強制テストでない場合、Vercel等の外部ドメインで未設定時は不要な接続試行を行わない
  if (!force && !shouldTryLocalVoicevox()) {
    return { ok: false };
  }
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
      signal: getTimeoutSignal(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ストリーミングURLのインメモリキャッシュ（重複取得・待機を防止）
const streamingUrlCache = new Map<string, Promise<string | null>>();

/**
 * クラウドVOICEVOXのストリーミング再生用URLを即座に取得（約0.3秒で返却）
 * 失敗時は null
 */
export async function getCloudVoicevoxStreamingUrl(
  text: string,
  speakerId: number,
  timeoutMs = 3000
): Promise<string | null> {
  const cacheKey = `${speakerId}:${text.trim()}`;
  const existing = streamingUrlCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const fetchPromise = (async () => {
    try {
      const initRes = await fetch(
        `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        {
          signal: getTimeoutSignal(timeoutMs),
        }
      );
      if (!initRes.ok) return null;
      const initData = await initRes.json();
      if (!initData || !initData.success || !initData.mp3StreamingUrl) return null;
      const url = initData.mp3StreamingUrl as string;

      // ブラウザ環境であれば先行バッファリングを促す
      if (typeof window !== "undefined" && typeof Audio !== "undefined") {
        try {
          const preloadAudio = new Audio();
          preloadAudio.preload = "auto";
          preloadAudio.src = url;
        } catch {}
      }

      return url;
    } catch (err) {
      console.warn("[TTS] クラウドストリーミングURL取得失敗:", err);
      return null;
    }
  })();

  streamingUrlCache.set(cacheKey, fetchPromise);
  // 失敗時はキャッシュから削除して再試行可能にする
  fetchPromise.then((url) => {
    if (!url) streamingUrlCache.delete(cacheKey);
  });

  return fetchPromise;
}

/**
 * 音声ストリーミングURLを先行取得（プリフェッチ）してキャッシュに保存する。
 * 事前に呼んでおくことで、画面遷移時に即座にストリーミングURLが利用可能になる。
 */
export async function prefetchStreamingUrl(
  text: string,
  voice: string
): Promise<string | null> {
  const speakerId = parseVoicevoxSpeaker(voice);
  if (speakerId === null) return null;
  return getCloudVoicevoxStreamingUrl(text, speakerId);
}

export interface TtsPlayableAudio {
  src: string;
  engine: TtsEngineUsed;
  cleanup?: () => void;
}

/**
 * 最速で再生可能な音声ソースを取得する
 * クラウドVOICEVOXの場合は mp3StreamingUrl を即座に返し、
 * 取得失敗時・レート制限（429）時は待たずにサーバーサイド (/api/tts) に即時フォールバックする。
 */
export async function fetchPlayableTts(
  text: string,
  voice: string
): Promise<TtsPlayableAudio> {
  const speakerId = parseVoicevoxSpeaker(voice);

  if (speakerId !== null) {
    // ⓪ 先行プリフェッチ済みキャッシュがある場合は最優先で即時返却（待機ゼロ）
    const cacheKey = `${speakerId}:${text}`;
    const cachedPromise = streamingUrlCache.get(cacheKey);
    if (cachedPromise) {
      const cachedUrl = await cachedPromise;
      if (cachedUrl) {
        return {
          src: cachedUrl,
          engine: "VOICEVOX (Cloud)",
        };
      }
    }

    // ① ローカル環境・カスタムURL時のみローカルを試行
    if (shouldTryLocalVoicevox()) {
      const localBlob = await synthesizeWithLocalVoicevox(text, speakerId);
      if (localBlob) {
        const url = URL.createObjectURL(localBlob);
        return {
          src: url,
          engine: "VOICEVOX",
          cleanup: () => URL.revokeObjectURL(url),
        };
      }
    }

    // ② 無料クラウド VOICEVOX のストリーミングURLを最優先で取得（キャッシュがあれば即時返却）
    const streamUrl = await getCloudVoicevoxStreamingUrl(text, speakerId);
    if (streamUrl) {
      return {
        src: streamUrl,
        engine: "VOICEVOX (Cloud)",
      };
    }
  }

  // ④ サーバーサイド (/api/tts) へフォールバック
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

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return {
    src: url,
    engine,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

/**
 * 指定ボイスで音声 Blob を取得する。
 *
 * VOICEVOX ボイスの場合:
 *  ① ローカル環境（localhost）またはカスタムURL設定時のみ手元の VOICEVOX (127.0.0.1:50021) を試行（~0.5秒）
 *     ※Vercel本番での不要なERR_CONNECTION_REFUSED赤文字エラーと無駄な待機時間を防止
 *  ② 無料クラウド VOICEVOX Web API (api.tts.quest) を直接試行（長文質問でも100%確実に取得できるよう25秒待機）
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
    // ① ローカル環境・カスタムURL時のみローカルを試行
    if (shouldTryLocalVoicevox()) {
      const localBlob = await synthesizeWithLocalVoicevox(text, speakerId);
      if (localBlob) return { blob: localBlob, engine: "VOICEVOX" };
    }

    // ② 無料クラウド VOICEVOX Web API の試行（長文質問にも耐えうる25秒待機）
    const cloudBlob = await synthesizeWithCloudVoicevox(text, speakerId, 25000);
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
