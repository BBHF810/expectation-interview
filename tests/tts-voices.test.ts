import { describe, it, expect, beforeEach } from "vitest";
import { TTS_VOICES, DEFAULT_TTS_VOICE, getSavedTtsVoice, saveTtsVoice } from "@/lib/tts-voices";

describe("TTS ボイス定義と設定の永続化テスト", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("6種類のOpenAI公式ボイスがすべて定義されている", () => {
    expect(TTS_VOICES).toHaveLength(6);
    const ids = TTS_VOICES.map((v) => v.id);
    expect(ids).toContain("nova");
    expect(ids).toContain("shimmer");
    expect(ids).toContain("alloy");
    expect(ids).toContain("echo");
    expect(ids).toContain("onyx");
    expect(ids).toContain("fable");
  });

  it("初期状態ではデフォルトボイス（nova）を返す", () => {
    expect(getSavedTtsVoice()).toBe(DEFAULT_TTS_VOICE);
    expect(getSavedTtsVoice()).toBe("nova");
  });

  it("saveTtsVoice で保存したボイスが getSavedTtsVoice で正しく取得できる", () => {
    saveTtsVoice("shimmer");
    expect(getSavedTtsVoice()).toBe("shimmer");

    saveTtsVoice("onyx");
    expect(getSavedTtsVoice()).toBe("onyx");
  });

  it("不正なボイスIDがlocalStorageに入っていた場合はデフォルトのnovaにフォールバックする", () => {
    localStorage.setItem("expectation_tts_voice", "invalid-voice-id");
    expect(getSavedTtsVoice()).toBe("nova");
  });
});
