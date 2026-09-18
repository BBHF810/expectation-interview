import { ExpectationType, PairAnimalDiagnosis, PairTurn } from "@/types";

export const PAIR_ANIMAL_COMBOS: PairAnimalDiagnosis[] = [
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🐱", name: "マイペースな猫ちゃん" },
    pairTitle: "お互いを引き立て合うナイスペア",
    pairCatchphrase: "正反対のテンポが心地よい絶妙なバランス",
    pairDescription: "素直に思いを伝える側と、マイペースに受け止める側で、お互いの違いを自然に楽しめている素敵なふたりです。すれ違いがあっても『まあいっか』と笑い合える軽やかさがあります。",
  },
  {
    animalA: { emoji: "🐬", name: "共感イルカ" },
    animalB: { emoji: "🐬", name: "共感イルカ" },
    pairTitle: "息ぴったり！波長が合う共感コンビ",
    pairCatchphrase: "言葉にしなくても通じ合える仲良しペア",
    pairDescription: "お互いの楽しい気持ちや嬉しい瞬間を共有し合える、とても温かい関係性です。お互いの感情のキャッチボールが自然に弾んでいます。",
  },
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🦉", name: "見守りフクロウ" },
    pairTitle: "頼もしい安心感！見守り＆素直ペア",
    pairCatchphrase: "深い信頼と安心感で結ばれたふたり",
    pairDescription: "一歩引いて静かに見守る側と、まっすぐに気持ちをぶつける側で、お互いに深い安心感を持っています。困ったときも助け合える心強いパートナーシップです。",
  },
  {
    animalA: { emoji: "🐻", name: "ぬくもりクマさん" },
    animalB: { emoji: "🐧", name: "よりそいペンギン" },
    pairTitle: "ほのぼの温かい！よりそい安心チーム",
    pairCatchphrase: "一緒にいるだけでホッとする優しい時間",
    pairDescription: "お互いに気遣い合い、相手を尊重する思いやりに溢れています。小さな日常の出来事も、ふたりにとってはかけがえのない大切な思い出になります。",
  },
];

export function getFallbackPairQuestion(
  nameA: string,
  nameB: string,
  turnIndex: number, // 0: Aへ, 1: Bへ, 2: ふたりへ
  expectationType: ExpectationType
): { question: string; nextSpeaker: "A" | "B"; nextSpeakerName: string } {
  if (turnIndex === 0) {
    return {
      question: `${nameA}さん、ふたりであったどんな出来事ですか？そのとき${nameB}さんにどんなことを期待していましたか？`,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
    };
  } else if (turnIndex === 1) {
    return {
      question: `${nameB}さん、${nameA}さんのお話を聞いて、そのとき実際にはどう思っていたり、どうなったりしましたか？`,
      nextSpeaker: "B",
      nextSpeakerName: nameB,
    };
  } else {
    return {
      question: `その出来事を通してお互いの気持ちや関わり方について、どう思いましたか？（${nameA}さん・${nameB}さんどちらでもどうぞ）`,
      nextSpeaker: "A",
      nextSpeakerName: `${nameA}さん・${nameB}さん`,
    };
  }
}

export function getFallbackPairReflection(
  nameA: string,
  nameB: string,
  expectationType: ExpectationType,
  history: PairTurn[]
): {
  perspectiveA: string;
  perspectiveB: string;
  reflection: string;
  pairAnimalDiagnosis: PairAnimalDiagnosis;
} {
  const ansA = history.find((t) => t.speaker === "A")?.answer || "ふたりの出来事への思い";
  const ansB = history.find((t) => t.speaker === "B")?.answer || "当時の状況や受け止め";

  let reflection = "";
  if (expectationType === "matched") {
    reflection = `${nameA}さんの期待と${nameB}さんの行動がぴったり重なり、気持ちが通じ合った素敵な出来事でした。お互いの思いやりが自然に届き合っている温かい関係性が感じられます。`;
  } else if (expectationType === "mismatched") {
    reflection = `${nameA}さんが望んでいたことと、${nameB}さんの当時の状況に少しすれ違いがあった場面でした。でも、お互いに素直な気持ちを話し合えたことで、相手の新たな一面を知る大切なきっかけになりました。`;
  } else {
    reflection = `うまくいった面と違った面の両方があった場面でした。お互いの異なる受け止め方を共有し合うことで、ふたりの絆がさらに深まる温かい振り返りとなりました。`;
  }

  const diagnosis =
    expectationType === "matched"
      ? PAIR_ANIMAL_COMBOS[1]
      : expectationType === "mismatched"
      ? PAIR_ANIMAL_COMBOS[0]
      : PAIR_ANIMAL_COMBOS[2];

  return {
    perspectiveA: ansA.length > 50 ? ansA.substring(0, 47) + "..." : ansA,
    perspectiveB: ansB.length > 50 ? ansB.substring(0, 47) + "..." : ansB,
    reflection,
    pairAnimalDiagnosis: diagnosis,
  };
}