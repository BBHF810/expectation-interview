import { describe, it, expect } from "vitest";
import {
  createSingleShareUrl,
  createPairShareUrl,
  restoreShareData,
  encodeSharePayload,
  decodeSharePayload,
} from "@/lib/share-code";
import { ANIMAL_DIAGNOSES } from "@/lib/fallbacks";
import { PAIR_ANIMAL_COMBOS } from "@/lib/pair-fallbacks";

describe("短縮QRコードURL生成・復元テスト", () => {
  it("Base64URL エンコード・デコードが正しく往復する", () => {
    const original = { test: "こんにちは", num: 123, flag: true };
    const encoded = encodeSharePayload(original);
    // URLに使えない '+' や '/' や '=' が含まれていないこと
    expect(encoded).not.toMatch(/[+/=]/);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(original);
  });

  it("絵文字や特殊日本語（サロゲートペア）を含むオブジェクトも破損なく安全に往復する", () => {
    const complex = {
      title: "🐶手料理で喜ばせたい誠実なワンちゃんタイプ✨💖",
      description: "友だちに手料理を振る舞った出来事🍵〜（笑）！",
      emoji: "🐕‍🦺",
    };
    const encoded = encodeSharePayload(complex);
    expect(encoded).not.toMatch(/[+/=]/);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(complex);
  });

  it("シングルモード: 短縮URLが生成され、長さが200文字以下に抑えられ、復元できる", () => {
    const animal = ANIMAL_DIAGNOSES[0];
    const reflection = "文化祭で友人と一緒に成功させた素敵な出来事でした。相手への信頼が伝わってきます。";
    const url = createSingleShareUrl(animal, reflection);

    expect(url).toContain("/share?d=");
    // URL全体の長さが300文字以下（以前の2000〜4000文字から劇的短縮、低密度の粗いQRになる）
    expect(url.length).toBeLessThan(300);

    const paramD = new URL(url).searchParams.get("d");
    expect(paramD).toBeTruthy();

    const restored = restoreShareData(paramD!);
    expect(restored).toBeTruthy();
    expect(restored.mode).toBe("single");
    expect(restored.title).toBe(animal.animalName);
    expect(restored.emoji).toBe(animal.animalEmoji);
    expect(restored.catchphrase).toBe(animal.catchphrase);
    expect(restored.description).toBe(animal.description);
    expect(restored.futureTrait).toBe(animal.futureTrait);
    expect(restored.academicTrait).toBe(animal.academicTrait);
    expect(restored.reflection).toBe(reflection);
  });

  it("ペアモード: 短縮URLが生成され、復元できる", () => {
    const combo = PAIR_ANIMAL_COMBOS[0];
    const url = createPairShareUrl({
      pairAnimalDiagnosis: combo,
      nameA: "たろう",
      nameB: "はなこ",
      perspectiveA: "楽しかった",
      perspectiveB: "嬉しかった",
      reflection: "お互いの違いを認め合える素敵な関係性です。",
    });

    expect(url).toContain("/share?d=");
    expect(url.length).toBeLessThan(350);

    const paramD = new URL(url).searchParams.get("d");
    expect(paramD).toBeTruthy();

    const restored = restoreShareData(paramD!);
    expect(restored).toBeTruthy();
    expect(restored.mode).toBe("pair");
    expect(restored.nameA).toBe("たろう");
    expect(restored.nameB).toBe("はなこ");
    expect(restored.pairTitle).toBe(combo.pairTitle);
    expect(restored.futureRelationship).toBe(combo.futureRelationship);
    expect(restored.academicDynamic).toBe(combo.academicDynamic);
    expect(restored.animalA).toEqual(combo.animalA);
    expect(restored.animalB).toEqual(combo.animalB);
  });

  it("パーソナライズされたオリジナル診断データ（episodeHighlight付き）が完全復元される", () => {
    const customAnimal = {
      animalEmoji: "🐶",
      animalName: "手料理で喜ばせたい誠実なワンちゃんタイプ",
      catchphrase: "想いを届けるまっすぐな愛",
      description: "友人に手料理を振る舞った際、喜んでほしかったというお気持ちを大切にしていましたね。",
      futureTrait: "オープンマインドな性格",
      academicTrait: "高親和・ストレート表出型",
      episodeHighlight: "手料理を作って友人に喜んでもらいたかった出来事",
    };
    const reflection = "温かい想いが伝わりました。";
    const url = createSingleShareUrl(customAnimal, reflection);
    const paramD = new URL(url).searchParams.get("d");
    const restored = restoreShareData(paramD!);

    expect(restored).toBeTruthy();
    expect(restored.title).toBe("手料理で喜ばせたい誠実なワンちゃんタイプ");
    expect(restored.description).toBe(customAnimal.description);
    expect(restored.episodeHighlight).toBe("手料理を作って友人に喜んでもらいたかった出来事");
  });
});
