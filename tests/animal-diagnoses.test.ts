import { describe, it, expect } from "vitest";
import {
  SINGLE_ANIMAL_MASTERS,
  PAIR_ANIMAL_MASTERS,
  normalizeSingleAnimal,
  normalizePairAnimal,
  getSingleAnimalPromptOptions,
  getPairAnimalPromptOptions,
} from "@/lib/animal-diagnoses";

describe("動物診断マスターとユーティリティ", () => {
  describe("SINGLE_ANIMAL_MASTERS", () => {
    it("14種類の固定動物タイプが定義されている", () => {
      expect(SINGLE_ANIMAL_MASTERS).toHaveLength(14);
    });

    it("すべての動物タイプに判定根拠（criteria）と具体例（concreteExamples）が設定されている", () => {
      for (const animal of SINGLE_ANIMAL_MASTERS) {
        expect(animal.animalName).toBeTruthy();
        expect(animal.animalEmoji).toBeTruthy();
        expect(animal.catchphrase).toBeTruthy();
        expect(animal.criteria).toBeTruthy();
        expect(animal.criteria.length).toBeGreaterThan(10);
        expect(animal.concreteExamples.length).toBeGreaterThanOrEqual(2);
        for (const ex of animal.concreteExamples) {
          expect(ex).toBeTruthy();
        }
      }
    });

    it("プロンプト生成関数が全タイプの名称と根拠を含んでいる", () => {
      const promptText = getSingleAnimalPromptOptions();
      expect(promptText).toContain("素直なワンちゃんタイプ");
      expect(promptText).toContain("共感イルカタイプ");
      expect(promptText).toContain("判定の根拠・特徴");
    });
  });

  describe("PAIR_ANIMAL_MASTERS", () => {
    it("8種類の固定ペアタイプが定義されている", () => {
      expect(PAIR_ANIMAL_MASTERS).toHaveLength(8);
    });

    it("すべてのペアタイプに判定根拠と具体例が設定されている", () => {
      for (const pair of PAIR_ANIMAL_MASTERS) {
        expect(pair.pairTitle).toBeTruthy();
        expect(pair.animalA.name).toBeTruthy();
        expect(pair.animalB.name).toBeTruthy();
        expect(pair.criteria).toBeTruthy();
        expect(pair.criteria.length).toBeGreaterThan(10);
        expect(pair.concreteExamples.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("プロンプト生成関数がペアタイプを含んでいる", () => {
      const promptText = getPairAnimalPromptOptions();
      expect(promptText).toContain("お互いを引き立て合うナイスペア");
      expect(promptText).toContain("息ぴったり！波長が合う共感コンビ");
    });
  });

  describe("normalizeSingleAnimal", () => {
    it("完全一致の名前で正しいマスターを取得できる", () => {
      const master = normalizeSingleAnimal("共感イルカタイプ");
      expect(master.id).toBe("dolphin");
      expect(master.animalEmoji).toBe("🐬");
    });

    it("部分一致やキーワードから固定マスターに正規化できる", () => {
      const dogMaster = normalizeSingleAnimal("素直なワンちゃん");
      expect(dogMaster.id).toBe("dog");

      const catMaster = normalizeSingleAnimal("猫ちゃん");
      expect(catMaster.id).toBe("cat");

      const owlMaster = normalizeSingleAnimal("見守りフクロウ");
      expect(owlMaster.id).toBe("owl");

      const rabbitMaster = normalizeSingleAnimal("びんかんウサギタイプ");
      expect(rabbitMaster.id).toBe("rabbit");
      expect(rabbitMaster.animalName).toBe("びんかんウサギタイプ");

      // 過去表記（びかんウサギ）からの後方互換正規化
      const legacyRabbitMaster = normalizeSingleAnimal("びかんウサギ");
      expect(legacyRabbitMaster.id).toBe("rabbit");
      expect(legacyRabbitMaster.animalName).toBe("びんかんウサギタイプ");
    });

    it("未定義の名前でもデフォルトのワンちゃんタイプに安全にフォールバックする", () => {
      const fallback = normalizeSingleAnimal("宇宙人タイプ");
      expect(fallback.id).toBe("dog");
    });
  });

  describe("normalizePairAnimal", () => {
    it("完全一致で正しいペアマスターを取得できる", () => {
      const master = normalizePairAnimal("お互いを引き立て合うナイスペア");
      expect(master.id).toBe("dog_cat");
    });

    it("部分一致で正規化できる", () => {
      const master = normalizePairAnimal("ナイスペア");
      expect(master.id).toBe("dog_cat");
    });
  });
});
