import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getOpenAiModelName } from "@/lib/openai";

describe("OpenAI モデル選択と正規化テスト", () => {
  const originalEnv = process.env.OPENAI_MODEL;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.OPENAI_MODEL = originalEnv;
    } else {
      delete process.env.OPENAI_MODEL;
    }
  });

  it("環境変数が未設定の場合はデフォルトで gpt-6.1-sol を返す", () => {
    delete process.env.OPENAI_MODEL;
    expect(getOpenAiModelName()).toBe("gpt-6.1-sol");
  });

  it("gpt6.1sol の表記揺れを gpt-6.1-sol に正規化する", () => {
    process.env.OPENAI_MODEL = "gpt6.1sol";
    expect(getOpenAiModelName()).toBe("gpt-6.1-sol");
  });

  it("gpt-6.1sol の表記揺れを gpt-6.1-sol に正規化する", () => {
    process.env.OPENAI_MODEL = "gpt-6.1sol";
    expect(getOpenAiModelName()).toBe("gpt-6.1-sol");
  });

  it("明示的に他のモデル（例: gpt-4o）が指定された場合はそのモデル名を返す", () => {
    process.env.OPENAI_MODEL = "gpt-4o";
    expect(getOpenAiModelName()).toBe("gpt-4o");
  });
});
