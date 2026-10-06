import { describe, it, expect, beforeEach } from "vitest";
import { TTS_VOICES, DEFAULT_TTS_VOICE, getSavedTtsVoice, saveTtsVoice } from "@/lib/tts-voices";

describe("TTS ボイス定義と設定の永続化テスト", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("VOICEVOX（4種）とOpenAI（6種）の合計10種類が定義されている", () => {
    expect(TTS_VOICES).toHaveLength(10);
    const ids = TTS_VOICES.map((v) => v.id);
    expect(ids).toContain("voicevox:2");
    expect(ids).toContain("voicevox:13");
    expect(ids).toContain("voicevox:3");
    expect(ids).toContain("voicevox:8");
    expect(ids).toContain("nova");
    expect(ids).toContain("shimmer");
  });

  it("初期状態ではデフォルトボイス（voicevox:2 四国めたん）を返す", () => {
    expect(getSavedTtsVoice()).toBe(DEFAULT_TTS_VOICE);
    expect(getSavedTtsVoice()).toBe("voicevox:2");
  });

  it("saveTtsVoice で保存したボイスが getSavedTtsVoice で正しく取得できる", () => {
    saveTtsVoice("shimmer");
    expect(getSavedTtsVoice()).toBe("shimmer");

    saveTtsVoice("voicevox:13");
    expect(getSavedTtsVoice()).toBe("voicevox:13");
  });

  it("不正なボイスIDがlocalStorageに入っていた場合はデフォルトのvoicevox:2にフォールバックする", () => {
    localStorage.setItem("expectation_tts_voice", "invalid-voice-id");
    expect(getSavedTtsVoice()).toBe("voicevox:2");
  });
});
