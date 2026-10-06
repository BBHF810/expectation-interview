import { ExpectationType, PairAnimalDiagnosis, PairTurn } from "@/types";

export const PAIR_ANIMAL_COMBOS: PairAnimalDiagnosis[] = [
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🐱", name: "マイペースな猫ちゃん" },
    pairTitle: "お互いを引き立て合うナイスペア",
    pairCatchphrase: "正反対のテンポが心地よい絶妙なバランス",
    pairDescription: "素直に思いを伝える側と、マイペースに受け止める側で、お互いの違いを自然に楽しめている素敵なふたりです。すれ違いがあっても『まあいっか』と笑い合える軽やかさがあります。",
    futureRelationship: "違いを楽しみながらお互いの自由を尊重し合う『自律共創パートナー』",
    livingHint: "同じリビングにいながら別々の趣味や作業を楽しむ『心地よいゆるやかな共存』がベスト。",
    academicDynamic: "相補的適応型（Complementary Adaptation: 能動表出 × 自律受容）",
  },
  {
    animalA: { emoji: "🐬", name: "共感イルカ" },
    animalB: { emoji: "🐬", name: "共感イルカ" },
    pairTitle: "息ぴったり！波長が合う共感コンビ",
    pairCatchphrase: "言葉にしなくても通じ合える仲良しペア",
    pairDescription: "お互いの楽しい気持ちや嬉しい瞬間を共有し合える、とても温かい関係性です。お互いの感情のキャッチボールが自然に弾んでいます。",
    futureRelationship: "感情の波長がシンクロし、喜びも悩みも瞬時に分かち合える『共鳴ソウルメイト』",
    livingHint: "日常の小さな嬉しい発見をリビングで気軽にシェアし合う時間が、ふたりの最大の活力に。",
    academicDynamic: "相互同調型（Mutual Synchrony: 高共感・即時フィードバック）",
  },
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🦉", name: "見守りフクロウ" },
    pairTitle: "頼もしい安心感！見守り＆素直ペア",
    pairCatchphrase: "深い信頼と安心感で結ばれたふたり",
    pairDescription: "一歩引いて静かに見守る側と、まっすぐに気持ちをぶつける側で、お互いに深い安心感を持っています。困ったときも助け合える心強いパートナーシップです。",
    futureRelationship: "動く人と見守る人が自然に噛み合い、どんな変化も乗り越えられる『信頼の航海パートナー』",
    livingHint: "大事な相談ごとは、落ち着いた照明やあたたかい飲み物を囲んでリビングでじっくりと。",
    academicDynamic: "安定補完型（Secure Complementary: 直面行動 × 俯瞰的認知的支援）",
  },
  {
    animalA: { emoji: "🐻", name: "ぬくもりクマさん" },
    animalB: { emoji: "🐧", name: "よりそいペンギン" },
    pairTitle: "ほのぼの温かい！よりそい安心チーム",
    pairCatchphrase: "一緒にいるだけでホッとする優しい時間",
    pairDescription: "お互いに気遣い合い、相手を尊重する思いやりに溢れています。小さな日常の出来事も、ふたりにとってはかけがえのない大切な思い出になります。",
    futureRelationship: "日々の暮らしのタスクや安心感を分け合い、穏やかな日常を紡ぎ続ける『ひだまり共生チーム』",
    livingHint: "暮らしの役割分担を『お互いへのプレゼント』のように楽しむ工夫が温かい空気を生み出します。",
    academicDynamic: "協調支援型（Collaborative Supportive: 相互ケア・協同行動）",
  },
];

export function getFallbackPairQuestion(
  nameA: string,
  nameB: string,
  turnIndex: number, // 0: Q1-A, 1: Q1-B, 2: Q2-A, 3: Q2-B
  expectationType: ExpectationType
): { question: string; nextSpeaker: "A" | "B"; nextSpeakerName: string } {
  if (turnIndex <= 1) {
    // Q1: ふたりであった出来事について
    const q = `${turnIndex === 0 ? nameA : nameB}さん、ふたりであったどんな出来事ですか？そのとき${turnIndex === 0 ? nameB : nameA}さんにどんなことを期待していましたか？`;
    return {
      question: q,
      nextSpeaker: turnIndex === 0 ? "A" : "B",
      nextSpeakerName: turnIndex === 0 ? nameA : nameB,
    };
  } else {
    // Q2: そのときの気持ちについて
    const q = turnIndex === 2
      ? `${nameA}さん、その出来事を振り返って、${nameB}さんとのお互いの気持ちについてどう感じましたか？`
      : `${nameB}さん、同じ出来事を振り返って、${nameA}さんとのお互いの気持ちについてどう感じましたか？`;
    return {
      question: q,
      nextSpeaker: turnIndex === 2 ? "A" : "B",
      nextSpeakerName: turnIndex === 2 ? nameA : nameB,
    };
  }
}

/**
 * 登録情報（参加者名、相手名、関係性、期待タイプ）に応じた最初の固定質問を選定
 */
export function getInitialPairQuestion(params: {
  nameA: string;
  nameB: string;
  relationship: string;
  expectationType: ExpectationType;
}): { question: string; nextSpeaker: "A"; nextSpeakerName: string } {
  const { nameA, nameB, relationship, expectationType } = params;

  // 関係性の表現の微調整
  let relContext = "";
  if (relationship.includes("友")) {
    relContext = "友だちの";
  } else if (relationship.includes("親子")) {
    relContext = "親子の";
  } else if (relationship.includes("兄弟") || relationship.includes("きょうだい")) {
    relContext = "きょうだいの";
  } else if (relationship.includes("夫婦")) {
    relContext = "ご夫婦の";
  } else if (relationship.includes("恋人")) {
    relContext = "恋人の";
  } else if (relationship.includes("パートナー")) {
    relContext = "パートナーの";
  } else if (relationship.includes("家族")) {
    relContext = "ご家族の";
  }

  if (expectationType === "matched") {
    return {
      question: `${nameA}さん、まずは${relContext}${nameB}さんとの間で、期待どおり気持ちが通じ合ったり嬉しかった具体的な出来事を教えていただけますか？`,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
    };
  } else if (expectationType === "mismatched") {
    return {
      question: `${nameA}さん、まずは${relContext}${nameB}さんに対して「こうしてほしかった」と期待していたのに、少しすれ違ってしまった具体的な出来事を教えていただけますか？`,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
    };
  } else {
    return {
      question: `${nameA}さん、まずは${relContext}${nameB}さんとの間で印象に残っている出来事や、そのとき${nameB}さんに期待していたことについて教えていただけますか？`,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
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