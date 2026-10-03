export type TtsVoiceId = "nova" | "alloy" | "echo" | "onyx" | "shimmer" | "fable";

export interface TtsVoiceOption {
  id: TtsVoiceId;
  name: string;
  tagline: string;
  description: string;
  genderLabel: string;
  emoji: string;
}

export const TTS_VOICES: TtsVoiceOption[] = [
  {
    id: "nova",
    name: "Nova（ノヴァ）",
    tagline: "明るく親しみやすい標準ボイス",
    description: "ハキハキとした明るさと温かみがあり、幅広い年代に聞き取りやすいトーンです。",
    genderLabel: "女性的",
    emoji: "🌟",
  },
  {
    id: "shimmer",
    name: "Shimmer（シマー）",
    tagline: "透明感のあるクリアなボイス",
    description: "落ち着いた優しさと透明感があり、じっくり話を聴くカウンセラーのようなトーンです。",
    genderLabel: "女性的",
    emoji: "✨",
  },
  {
    id: "alloy",
    name: "Alloy（アロイ）",
    tagline: "自然でバランスの取れたニュートラルボイス",
    description: "癖がなく自然で聞きやすい、フラットで聞き疲れしないトーンです。",
    genderLabel: "ニュートラル",
    emoji: "🌿",
  },
  {
    id: "echo",
    name: "Echo（エコー）",
    tagline: "柔らかく穏やかな男性ボイス",
    description: "優しく語りかけるような穏やかさがあり、親しみやすさを感じさせるトーンです。",
    genderLabel: "男性的",
    emoji: "🍃",
  },
  {
    id: "onyx",
    name: "Onyx（オニキス）",
    tagline: "深みと安心感のある低めボイス",
    description: "落ち着いた重厚感と包容力があり、知的なマスターや研究者のようなトーンです。",
    genderLabel: "男性的",
    emoji: "☕",
  },
  {
    id: "fable",
    name: "Fable（フェイブル）",
    tagline: "温かみと表現力豊かなボイス",
    description: "物語を語るような豊かな抑揚と個性があり、ストーリーテラーのようなトーンです。",
    genderLabel: "ニュートラル",
    emoji: "📖",
  },
];

const STORAGE_KEY = "expectation_tts_voice";
export const DEFAULT_TTS_VOICE: TtsVoiceId = "nova";

export function getSavedTtsVoice(): TtsVoiceId {
  if (typeof window === "undefined") return DEFAULT_TTS_VOICE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as TtsVoiceId | null;
    if (saved && TTS_VOICES.some((v) => v.id === saved)) {
      return saved;
    }
  } catch (e) {
    // localStorage disabled/error
  }
  return DEFAULT_TTS_VOICE;
}

export function saveTtsVoice(voiceId: TtsVoiceId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, voiceId);
  } catch (e) {
    console.error("Failed to save TTS voice to localStorage", e);
  }
}
