import { describe, it, expect } from "vitest";
import { getInitialSingleQuestion } from "@/lib/fallbacks";
import { getInitialPairQuestion } from "@/lib/pair-fallbacks";

describe("初期固定質問の選定ロジック", () => {
  describe("一人用モード (getInitialSingleQuestion)", () => {
    it("10歳以下向けにはやさしいひらがな主体の質問が選ばれる", () => {
      const qMatched = getInitialSingleQuestion({
        ageGroup: "under_10",
        partner: "家族",
        isCare: "no",
        expectationType: "matched",
      });
      expect(qMatched.question).toContain("「家族」といっしょにいて");
      expect(qMatched.question).toContain("うれしかった");

      const qMismatched = getInitialSingleQuestion({
        ageGroup: "under_10",
        partner: "友だち",
        isCare: "no",
        expectationType: "mismatched",
      });
      expect(qMismatched.question).toContain("「友だち」とお話ししていて");
      expect(qMismatched.question).toContain("すこしちがっちゃった");
    });

    it("31歳以上で介護ありの場合は介護サポートに関する質問が選ばれる", () => {
      const qCareMatched = getInitialSingleQuestion({
        ageGroup: "31_plus",
        partner: "家族",
        isCare: "yes",
        expectationType: "matched",
      });
      expect(qCareMatched.question).toContain("介護やサポート");
      expect(qCareMatched.question).toContain("思いが通じ合ったり");

      const qCareMismatched = getInitialSingleQuestion({
        ageGroup: "31_plus",
        partner: "家族",
        isCare: "yes",
        expectationType: "mismatched",
      });
      expect(qCareMismatched.question).toContain("介護やサポート");
      expect(qCareMismatched.question).toContain("すれ違いを感じた");
    });

    it("一般成人・若年層で期待タイプに応じた質問が選ばれる", () => {
      const qMatched = getInitialSingleQuestion({
        ageGroup: "11_30",
        partner: "パートナー",
        isCare: "no",
        expectationType: "matched",
      });
      expect(qMatched.question).toContain("「パートナー」に対して期待していて");
      expect(qMatched.question).toContain("嬉しかったり安心したり");

      const qMismatched = getInitialSingleQuestion({
        ageGroup: "11_30",
        partner: "友人",
        isCare: "no",
        expectationType: "mismatched",
      });
      expect(qMismatched.question).toContain("「友人」に対して「こうしてほしい」と期待していたのに");
      expect(qMismatched.question).toContain("すれ違い");

      const qNeutral = getInitialSingleQuestion({
        ageGroup: "11_30",
        partner: "職場の人",
        isCare: "no",
        expectationType: "neutral",
      });
      expect(qNeutral.question).toContain("「職場の人」に対して期待を抱いていたことと");
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

    it("関係性（家族、パートナー）に応じた表現が付与される", () => {
      const qFamily = getInitialPairQuestion({
        nameA: "ケン",
        nameB: "ユウ",
        relationship: "家族・きょうだい",
        expectationType: "mismatched",
      });
      expect(qFamily.question).toContain("ケンさん、まずはご家族のユウさんに対して");
      expect(qFamily.question).toContain("すれ違ってしまった");

      const qPartner = getInitialPairQuestion({
        nameA: "ソラ",
        nameB: "ウミ",
        relationship: "パートナー",
        expectationType: "neutral",
      });
      expect(qPartner.question).toContain("ソラさん、まずはパートナーのウミさんとの間で");
    });
  });
});