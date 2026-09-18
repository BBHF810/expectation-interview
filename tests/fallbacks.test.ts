import { describe, it, expect } from "vitest";
import { getFallbackQuestion, getFallbackReflection, getFallbackAnimalDiagnosis, ANIMAL_DIAGNOSES } from "@/lib/fallbacks";

describe("フォールバック質問・振り返り・動物診断 (fallbacks)", () => {
  it("期待どおり(matched)の質問方針", () => {
    const q1 = getFallbackQuestion("matched", "31_plus", 0);
    const q2 = getFallbackQuestion("matched", "31_plus", 1);
    const q3 = getFallbackQuestion("matched", "31_plus", 2);

    expect(q1.question).toContain("どんな出来事でしたか？");
    expect(q2.question).toContain("どんなことを期待していましたか？");
    expect(q3.question).toContain("期待どおりになったとき、どう思いましたか？");
  });

  it("すれちがい(mismatched)の質問方針", () => {
    const q1 = getFallbackQuestion("mismatched", "11_30", 0);
    const q2 = getFallbackQuestion("mismatched", "11_30", 1);
    const q3 = getFallbackQuestion("mismatched", "11_30", 2);

    expect(q1.question).toContain("どんな出来事でしたか？");
    expect(q2.question).toContain("本当は、相手にどうしてほしかったですか？");
    expect(q3.question).toContain("なぜ、すれちがったと思いますか？");
  });

  it("10歳以下(under_10)ではやさしいひらがな主体の質問になる", () => {
    const q1 = getFallbackQuestion("mismatched", "under_10", 0);
    const q2 = getFallbackQuestion("mismatched", "under_10", 1);
    const q3 = getFallbackQuestion("mismatched", "under_10", 2);

    expect(q1.question).toContain("どんなことがあったか、おしえてくれる？");
    expect(q2.question).toContain("ほんとうは、どうしてほしかった？");
    expect(q3.question).toContain("どうしてちがっちゃったと、おもう？");
  });

  it("中立的な振り返りフォールバックが評価や診断を含まない", () => {
    const refMatched = getFallbackReflection("matched", "31_plus", ["プレゼントをもらった", "祝ってほしかった"]);
    expect(refMatched.reflection).not.toMatch(/性格|診断|悪い|相性/);
    expect(refMatched.reflection.length).toBeGreaterThanOrEqual(40);
    expect(refMatched.animalDiagnosis).toBeTruthy();
    expect(refMatched.animalDiagnosis.animalName).toBeTruthy();
  });

  it("動物エンタメ診断がポジティブな内容を返す", () => {
    const diag = getFallbackAnimalDiagnosis("matched", ["嬉しかった"]);
    expect(diag.animalEmoji).toBeTruthy();
    expect(diag.catchphrase).toBeTruthy();
    expect(diag.description.length).toBeGreaterThanOrEqual(20);
  });
});