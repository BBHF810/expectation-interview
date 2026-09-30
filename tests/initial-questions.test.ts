import { describe, it, expect } from "vitest";
import { getInitialSingleQuestion } from "@/lib/fallbacks";
import { getInitialPairQuestion } from "@/lib/pair-fallbacks";

describe("初期固定質問の選定ロジック", () => {
  describe("一人用モード (getInitialSingleQuestion)", () => {
    it("10歳以下向けにはやさしいひらがな主体の汎用オープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "under_10" });
      expect(q.question).toContain("おともだちやかぞく");
      expect(q.question).toContain("心にのこっている");
      expect(q.purpose).toBe("event");
    });

    it("一般（11〜30歳）向けには汎用的なオープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "11_30" });
      expect(q.question).toContain("身近な人との間で");
      expect(q.question).toContain("印象に残っている");
      expect(q.purpose).toBe("event");
    });

    it("31歳以上でも同じ汎用オープナーが選ばれる（介護は対話内で聞き出す）", () => {
      const q = getInitialSingleQuestion({ ageGroup: "31_plus" });
      expect(q.question).toContain("身近な人との間で");
      expect(q.purpose).toBe("event");
    });

    it("答えたくない場合も一般用オープナーが選ばれる", () => {
      const q = getInitialSingleQuestion({ ageGroup: "no_answer" });
      expect(q.question).toContain("身近な人との間で");
      expect(q.purpose).toBe("event");
    });
  });

  describe("ふたり用モード (getInitialPairQuestion)", () => {
    it("参加者名と相手名が質問文に含まれ、Aへの問いかけになる", () => {
      const q = getInitialPairQuestion({
        nameA: "たろう",
        nameB: "はなこ",
        relationship: "友だち",
        expectationType: "matched",
      });
      expect(q.question).toContain("たろうさん、まずは");
      expect(q.question).toContain("はなこさんとの間で");
      expect(q.question).toContain("期待どおり気持ちが通じ合ったり");
      expect(q.nextSpeaker).toBe("A");
      expect(q.nextSpeakerName).toBe("たろう");
    });

    it("関係性（親子、夫婦、恋人、兄弟）に応じた表現が付与される", () => {
      const qParent = getInitialPairQuestion({
        nameA: "ケン",
        nameB: "ユウ",
        relationship: "親子",
        expectationType: "mismatched",
      });
      expect(qParent.question).toContain("ケンさん、まずは親子のユウさんに対して");
      expect(qParent.question).toContain("すれ違ってしまった");

      const qSpouse = getInitialPairQuestion({
        nameA: "ソラ",
        nameB: "ウミ",
        relationship: "夫婦",
        expectationType: "neutral",
      });
      expect(qSpouse.question).toContain("ソラさん、まずはご夫婦のウミさんとの間で");

      const qLover = getInitialPairQuestion({
        nameA: "レン",
        nameB: "リン",
        relationship: "恋人",
        expectationType: "matched",
      });
      expect(qLover.question).toContain("レンさん、まずは恋人のリンさんとの間で");
    });
  });
});