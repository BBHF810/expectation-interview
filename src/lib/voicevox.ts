/**
 * VOICEVOX Engine API 連携モジュール
 * デフォルトURL: http://127.0.0.1:50021
 */

export interface VoicevoxSpeakerOption {
  id: number;
  name: string;
  character: string;
  style: string;
  genderLabel: string;
  emoji: string;
  description: string;
}

export const VOICEVOX_SPEAKERS: VoicevoxSpeakerOption[] = [
  {
    id: 2,
    name: "四国めたん（ノーマル）",
    character: "四国めたん",
    style: "ノーマル",
    genderLabel: "女性的",
    emoji: "🌸",
    description: "落ち着いた清楚で親しみやすい女性の声。インタビュアーの標準に最適です。",
  },
  {
    id: 13,
    name: "青山龍星（ノーマル）",
    character: "青山龍星",
    style: "ノーマル",
    genderLabel: "男性的",
    emoji: "🎙️",
    description: "落ち着いた重厚感と知性のあるアナウンサー調の男性ボイスです。",
  },
  {
    id: 3,
    name: "ずんだもん（ノーマル）",
    character: "ずんだもん",
    style: "ノーマル",
    genderLabel: "ニュートラル",
    emoji: "🌱",
    description: "明るく親しみやすいキャラクターボイス。親しみやすい雰囲気に最適です。",
  },
  {
    id: 8,
    name: "春日部つむぎ（ノーマル）",
    character: "春日部つむぎ",
    style: "ノーマル",
    genderLabel: "女性的",
    emoji: "☀️",
    description: "元気で快活な明るいトーンの女性ボイスです。",
  },
];

export function getVoicevoxApiUrl(): string {
  return process.env.VOICEVOX_API_URL?.trim() || "http://127.0.0.1:50021";
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

/**
 * VOICEVOX API を呼び出して音声を合成（WAV Buffer 返却）
 * 未起動・接続不可・タイムアウト時は null を返す
 */
export async function generateVoicevoxAudio(
  text: string,
  speakerId: number = 2,
  timeoutMs: number = 3500
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const baseUrl = getVoicevoxApiUrl().replace(/\/$/, "");

  try {
    const signal = getTimeoutSignal(timeoutMs);

    // 1. audio_query 生成
    const queryUrl = `${baseUrl}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`;
    const queryRes = await fetch(queryUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!queryRes.ok) {
      console.warn(`VOICEVOX audio_query failed with status ${queryRes.status}`);
      return null;
    }

    const audioQuery = await queryRes.json();

    // 読み上げスピード調整（自然な落ち着いたテンポ 1.0）
    if (audioQuery && typeof audioQuery === "object") {
      audioQuery.speedScale = 1.0;
    }

    // 2. synthesis 音声合成
    const synthUrl = `${baseUrl}/synthesis?speaker=${speakerId}`;
    const synthRes = await fetch(synthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/wav",
      },
      body: JSON.stringify(audioQuery),
      signal,
    });

    if (!synthRes.ok) {
      console.warn(`VOICEVOX synthesis failed with status ${synthRes.status}`);
      return null;
    }

    const arrayBuffer = await synthRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: "audio/wav",
    };
  } catch (err: any) {
    // 接続拒否（未起動）、タイムアウト、Abort等の場合は安全にnullを返す
    console.warn("VOICEVOX is not available or timed out:", err?.message || err);
    return null;
  }
}

/**
 * 無料公開クラウドVOICEVOX Web API (api.tts.quest) を呼び出して音声を取得
 * Vercel上や、PCでVOICEVOXを起動していない環境でもゼロ設定で音声合成可能。
 * 未取得・タイムアウト時は null を返す
 */
export async function generateCloudVoicevoxAudio(
  text: string,
  speakerId: number = 2,
  timeoutMs: number = 15000
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const apiKey = process.env.VOICEVOX_QUEST_API_KEY?.trim();
    let url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    if (apiKey) {
      url += `&key=${encodeURIComponent(apiKey)}`;
    }

    const startTime = Date.now();
    const initRes = await fetch(url, {
      signal: getTimeoutSignal(10000),
    });
    if (!initRes.ok) return null;
    const initData = await initRes.json();
    if (!initData || !initData.success) return null;

    const statusUrl = initData.audioStatusUrl;
    const mp3Url = initData.mp3DownloadUrl;
    if (!mp3Url) return null;

    // audioStatusUrl のポーリング（ステータスが完了するまで待機）
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
              const arrayBuf = await audioRes.arrayBuffer();
              return {
                buffer: Buffer.from(arrayBuf),
                contentType: "audio/mpeg",
              };
            }
          }
          if (sData.isAudioError) {
            return null;
          }
        }
      } else {
        const audioRes = await fetch(mp3Url);
        if (audioRes.ok) {
          const arrayBuf = await audioRes.arrayBuffer();
          return {
            buffer: Buffer.from(arrayBuf),
            contentType: "audio/mpeg",
          };
        }
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    return null;
  } catch (err: any) {
    console.warn("Cloud VOICEVOX synthesis failed or timed out:", err?.message || err);
    return null;
  }
}

/**
 * クラウドVOICEVOXの即時ストリーミングURLを取得（約0.2〜0.5秒で返却）
 * 失敗時やタイムアウト時は安全に null を返す
 */
export async function getFastCloudVoicevoxStreamingUrl(
  text: string,
  speakerId: number = 3,
  timeoutMs = 1200
): Promise<string | null> {
  if (!text || text.trim() === "") return null;
  try {
    const apiKey = process.env.VOICEVOX_QUEST_API_KEY?.trim();
    let url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    if (apiKey) {
      url += `&key=${encodeURIComponent(apiKey)}`;
    }
    const res = await fetch(url, { signal: getTimeoutSignal(timeoutMs) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.success || !data.mp3StreamingUrl) return null;
    return data.mp3StreamingUrl;
  } catch {
    return null;
  }
}
