export type TtsVoiceId =
  | "voicevox:2"
  | "voicevox:13"
  | "voicevox:3"
  | "voicevox:8"
  | "nova"
  | "shimmer"
  | "alloy"
  | "echo"
  | "onyx"
  | "fable";

export interface TtsVoiceOption {
  id: TtsVoiceId;
  name: string;
  tagline: string;
  description: string;
  genderLabel: string;
  emoji: string;
  engine: "VOICEVOX" | "OpenAI";
}

export const TTS_VOICES: TtsVoiceOption[] = [
  // --- VOICEVOX キャラクター（日本語専用・高自然度） ---
  {
    id: "voicevox:2",
    name: "四国めたん（VOICEVOX）",
    tagline: "清楚で落ち着いた親身な女性ボイス",
    description: "上品で安心感があり、お話を引き出すインタビュアーの標準に最も適しています。",
    genderLabel: "女性的",
    emoji: "🌸",
    engine: "VOICEVOX",
  },
  {
    id: "voicevox:13",
    name: "青山龍星（VOICEVOX）",
    tagline: "知性的で落ち着いたアナウンサー風ボイス",
    description: "重厚感と温かい知性があり、研究室展示や知的なナビゲーターにぴったりです。",
    genderLabel: "男性的",
    emoji: "🎙️",
    engine: "VOICEVOX",
  },
  {
    id: "voicevox:3",
    name: "ずんだもん（VOICEVOX）",
    tagline: "親しみやすく愛嬌のあるキャラクター",
    description: "明るく親しみやすいトーンで、子どもから大人まで楽しく対話できます。",
    genderLabel: "ニュートラル",
    emoji: "🌱",
    engine: "VOICEVOX",
  },
  {
    id: "voicevox:8",
    name: "春日部つむぎ（VOICEVOX）",
    tagline: "元気で快活なフレンドリーボイス",
    description: "ハキハキとした明るさがあり、親近感のある会話を演出します。",
    genderLabel: "女性的",
    emoji: "☀️",
    engine: "VOICEVOX",
  },
  // --- OpenAI TTS（クラウド高品質・フォールバック対応） ---
  {
    id: "shimmer",
    name: "Shimmer（OpenAI HD）",
    tagline: "透明感のあるクリアなボイス",
    description: "落ち着いた優しさと透明感があり、カウンセラーのような穏やかなトーンです。",
    genderLabel: "女性的",
    emoji: "✨",
    engine: "OpenAI",
  },
  {
    id: "nova",
    name: "Nova（OpenAI HD）",
    tagline: "明るく親しみやすい標準ボイス",
    description: "ハキハキとした明るさと温かみがあり、幅広い年代に聞き取りやすいトーンです。",
    genderLabel: "女性的",
    emoji: "🌟",
    engine: "OpenAI",
  },
  {
    id: "alloy",
    name: "Alloy（OpenAI HD）",
    tagline: "フラットで聞き疲れしないニュートラルボイス",
    description: "癖がなく自然で聞きやすい、バランスの取れたトーンです。",
    genderLabel: "ニュートラル",
    emoji: "🌿",
    engine: "OpenAI",
  },
  {
    id: "echo",
    name: "Echo（OpenAI HD）",
    tagline: "柔らかく穏やかな男性ボイス",
    description: "優しく語りかけるような穏やかさがあり、親しみやすさを感じさせるトーンです。",
    genderLabel: "男性的",
    emoji: "🍃",
    engine: "OpenAI",
  },
  {
    id: "onyx",
    name: "Onyx（OpenAI HD）",
    tagline: "深みと安心感のある低音ボイス",
    description: "落ち着いた重厚感と包容力があり、知的なトーンです。",
    genderLabel: "男性的",
    emoji: "☕",
    engine: "OpenAI",
  },
  {
    id: "fable",
    name: "Fable（OpenAI HD）",
    tagline: "表現力豊かなストーリーボイス",
    description: "物語を語るような豊かな抑揚と個性のあるトーンです。",
    genderLabel: "ニュートラル",
    emoji: "📖",
    engine: "OpenAI",
  },
];

const STORAGE_KEY = "expectation_tts_voice";
export const DEFAULT_TTS_VOICE: TtsVoiceId = "voicevox:2";

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
