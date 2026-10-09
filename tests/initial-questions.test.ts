import { describe, it, expect } from "vitest";
import { getInitialSingleQuestion, getSmartFallbackQuestion } from "@/lib/fallbacks";
import { getInitialPairQuestion } from "@/lib/pair-fallbacks";

describe("初期固定質問の選定ロジック", () => {
  describe("一人用モード (getInitialSingleQuestion)", () => {
    it("10歳以下向けには子どもを主語にして『やってほしいこと』『喜ばれること』を聞くオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "under_10" });
      expect(q.question).toContain("おともだちやかぞく");
      expect(q.question).toContain("きみが");
      expect(q.question).toContain("やってほしいな");
      expect(q.question).toContain("よろこんでくれるかな");
      expect(q.purpose).toBe("event");
    });

    it("一般（11〜30歳）向けには汎用的なオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30" });
      expect(q.question).toContain("身近な人");
      expect(q.question).toContain("友だち・家族・恋人");
      expect(q.question).toContain("印象に残っている");
      expect(q.purpose).toBe("event");
    });

    it("31歳以上でも同じ汎用オープナーが選ばれる（介護は対話内で聞き出す）", () => {
      const q = getInitialSingleQuestion({ ageGroup: "31_plus" });
      expect(q.question).toContain("身近な人");
      expect(q.question).toContain("友だち・家族・恋人");
      expect(q.purpose).toBe("event");
    });

    it("答えたくない場合も一般用オープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "no_answer" });
      expect(q.question).toContain("身近な人");
      expect(q.question).toContain("友だち・家族・恋人");
      expect(q.purpose).toBe("event");
    });

    it("14歳以下の場合は子ども向けオープナーが選ばれ、『出来事』という言葉を含まない", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30", age: 14 });
      expect(q.question).toContain("やってほしいな");
      expect(q.question).not.toContain("出来事");
    });

    it("15歳以上の場合は一般向けオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30", age: 15 });
      expect(q.question).toContain("身近な人");
    });

    it("一致事例（matched）を事前選択した場合、嬉しかったこと・心に残っている出来事を聞くオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30", expectationType: "matched" });
      expect(q.question).toContain("嬉しかったこと");
      expect(q.question).toContain("心に残っている出来事");
    });

    it("不一致事例（mismatched）を事前選択した場合、モヤッとした・すれ違った出来事を聞くオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30", expectationType: "mismatched" });
      expect(q.question).toContain("思っていたのと違ってモヤッとした");
      expect(q.question).toContain("すれ違った");
    });

    it("14歳以下で一致事例（matched）を事前選択した場合、子ども向けに『うれしいな』『きもちが通じ合った』を聞くオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "under_10", age: 10, expectationType: "matched" });
      expect(q.question).toContain("うれしいな");
      expect(q.question).toContain("きもちが通じ合った");
      expect(q.question).not.toContain("出来事");
    });
  });

  describe("ふたり用モード (getInitialPairQuestion)", () => {
    it("参加者名への呼びかけを含み、指定のエピソード想起質問になる", () => {
      const q = getInitialPairQuestion({
        nameA: "たろう",
        nameB: "はなこ",
        relationship: "友だち",
        expectationType: "matched",
      });
      expect(q.question).toBe(
        "たろうさん、お互いに笑いあった出来事や勘違いしていた出来事など、何か２人の間に起きたエピソードを教えてください。（些細な出来事でも構いません）"
      );
      expect(q.nextSpeaker).toBe("A");
      expect(q.nextSpeakerName).toBe("たろう");
    });

    it("敬称（さん・ちゃん・くん）が既に含まれる場合は重複しない", () => {
      const qChan = getInitialPairQuestion({
        nameA: "ユウちゃん",
        nameB: "ケンくん",
        relationship: "きょうだい",
        expectationType: "mismatched",
      });
      expect(qChan.question).toBe(
        "ユウちゃん、お互いに笑いあった出来事や勘違いしていた出来事など、何か２人の間に起きたエピソードを教えてください。（些細な出来事でも構いません）"
      );
    });
  });

  describe("動的フォールバック質問 (getSmartFallbackQuestion)", () => {
    it("1問目で嬉しいエピソードを答えた場合、2問目で期待通りだったか・期待を超えてきたかを聞く質問が選ばれる", () => {
      const q = getSmartFallbackQuestion(["プレゼントをもらってすごく嬉しかった！"], false);
      expect(q).toContain("思い描いていた期待どおりでしたか？ それとも想像を超えて嬉しかったですか？");
      expect(q).not.toContain("本当はどうしてほしかった");
    });

    it("1問目で不一致・すれ違いを答えた場合、2問目で本当はどうしてほしかったかを聞く質問が選ばれる", () => {
      const q = getSmartFallbackQuestion(["約束をドタキャンされて悲しかった"], false);
      expect(q).toContain("どんな風にしてほしかったですか？");
    });

    it("子ども向け(isSimple: true)ではやさしいひらがな主体の質問が選ばれる（期待通りか・期待を超えたか）", () => {
      const qPos = getSmartFallbackQuestion(["みんなで遊んですごく楽しかった"], true);
      expect(qPos).toContain("おもっていたとおりだった？ それとも、おもっていたよりもずっとすごかった？");

      const qNeg = getSmartFallbackQuestion(["おもちゃをとられて怒った"], true);
      expect(qNeg).toContain("ほんとうは、どうしてほしかった？");
    });
  });
});