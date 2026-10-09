import { ExpectationType, PairAnimalDiagnosis, PairTurn } from "@/types";

export const PAIR_ANIMAL_COMBOS: PairAnimalDiagnosis[] = [
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🐱", name: "マイペースな猫ちゃん" },
    pairTitle: "お互いを引き立て合うナイスペア",
    pairCatchphrase: "正反対のテンポが心地よい絶妙なバランス",
    pairDescription: "素直に思いを伝える側と、マイペースに受け止める側で、お互いの違いを自然に楽しめている素敵なふたりです。すれ違いがあっても『まあいっか』と笑い合える軽やかさがあります。",
    futureRelationship: "違いを楽しみながらお互いの自由を尊重し合う『自律共創パートナー』",
    academicDynamic: "相補的適応型（Complementary Adaptation: 能動表出 × 自律受容）",
  },
  {
    animalA: { emoji: "🐬", name: "共感イルカ" },
    animalB: { emoji: "🐬", name: "共感イルカ" },
    pairTitle: "息ぴったり！波長が合う共感コンビ",
    pairCatchphrase: "言葉にしなくても通じ合える仲良しペア",
    pairDescription: "お互いの楽しい気持ちや嬉しい瞬間を共有し合える、とても温かい関係性です。お互いの感情のキャッチボールが自然に弾んでいます。",
    futureRelationship: "感情の波長がシンクロし、喜びも悩みも瞬時に分かち合える『共鳴ソウルメイト』",
    academicDynamic: "相互同調型（Mutual Synchrony: 高共感・即時フィードバック）",
  },
  {
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🦉", name: "見守りフクロウ" },
    pairTitle: "頼もしい安心感！見守り＆素直ペア",
    pairCatchphrase: "深い信頼と安心感で結ばれたふたり",
    pairDescription: "一歩引いて静かに見守る側と、まっすぐに気持ちをぶつける側で、お互いに深い安心感を持っています。困ったときも助け合える心強いパートナーシップです。",
    futureRelationship: "動く人と見守る人が自然に噛み合い、どんな変化も乗り越えられる『信頼の航海パートナー』",
    academicDynamic: "安定補完型（Secure Complementary: 直面行動 × 俯瞰的認知的支援）",
  },
  {
    animalA: { emoji: "🐻", name: "ぬくもりクマさん" },
    animalB: { emoji: "🐧", name: "よりそいペンギン" },
    pairTitle: "ほのぼの温かい！よりそい安心チーム",
    pairCatchphrase: "一緒にいるだけでホッとする優しい時間",
    pairDescription: "お互いに気遣い合い、相手を尊重する思いやりに溢れています。小さな日常の出来事も、ふたりにとってはかけがえのない大切な思い出になります。",
    futureRelationship: "日々の暮らしのタスクや安心感を分け合い、穏やかな日常を紡ぎ続ける『ひだまり共生チーム』",
    academicDynamic: "協調支援型（Collaborative Supportive: 相互ケア・協同行動）",
  },
  {
    animalA: { emoji: "🐿️", name: "きくばりリス" },
    animalB: { emoji: "🦊", name: "ひらめきキツネ" },
    pairTitle: "スマート連携！名探偵＆サポーターペア",
    pairCatchphrase: "先回りの気配りと機転の良さで息ぴったり",
    pairDescription: "細かい部分によく気がつく気配りと、機転を利かせて状況を動かす柔軟さが合わさった、非常に有能でテンポの良いふたりです。どんな出来事も軽やかに楽しく解決できます。",
    futureRelationship: "困難な出来事もふたりの知恵と機転で軽やかに乗り越えていく『最強のタッグパートナー』",
    academicDynamic: "戦略的相補型（Strategic Complementarity: 予見的配慮 × 状況即応）",
  },
  {
    animalA: { emoji: "🦔", name: "シャイなハリネズミ" },
    animalB: { emoji: "🐻", name: "ぬくもりクマさん" },
    pairTitle: "じんわり温まる！ゆっくり絆ペア",
    pairCatchphrase: "時間はかかっても絶対に壊れない深い信頼",
    pairDescription: "繊細で慎重な側を、どっしり構える側が優しく包み込み、ゆっくりと確かな安心感を育めるふたりです。一緒にいるほど心が安らぎ、本音を打ち明け合えます。",
    futureRelationship: "お互いの繊細さを守り合い、静かなぬくもりで寄り添い続ける『避難所のような安心パートナー』",
    academicDynamic: "保護的受容型（Protective Acceptance: 防衛的自己開示 × 感情的受容）",
  },
  {
    animalA: { emoji: "🦦", name: "陽気なラッコ" },
    animalB: { emoji: "🦌", name: "おだやかシカ" },
    pairTitle: "笑顔と癒やし！ピースフルフレンズ",
    pairCatchphrase: "ユーモアと穏やかさが調和する心地よい空気",
    pairDescription: "楽しい話題で場を明るくする側と、穏やかに微笑んで見守る側で、いつも心地よい空気が流れています。お互いに無理をせず自然体でいられる関係です。",
    futureRelationship: "どんな変化も笑い飛ばしながら、お互いのプライベートを尊重し合える『陽だまりフレンド』",
    academicDynamic: "調和共生型（Harmonious Coexistence: ポジティブ感情喚起 × 非侵襲的受容）",
  },
  {
    animalA: { emoji: "🦁", name: "頼れるライオン" },
    animalB: { emoji: "🐶", name: "素直なワンちゃん" },
    pairTitle: "熱血タッグ！前進するチャレンジペア",
    pairCatchphrase: "まっすぐな情熱と信頼で突き進むパワフルコンビ",
    pairDescription: "力強くリードする側と、まっすぐ素直に応える側で、ポジティブなエネルギーに満ちた関係です。お互いを高め合い、背中を押し合える力強さがあります。",
    futureRelationship: "お互いの背中を押し合い、新しい目標や挑戦に立ち向かい続ける『情熱の前進パートナー』",
    academicDynamic: "目標志向・能動牽引型（Goal-oriented & Assertive: 能動的リード × 高協調）",
  },
];

export function getFallbackPairQuestion(
  nameA: string,
  nameB: string,
  turnIndex: number, // 0: Q1-A, 1: Q1-B, 2: Q2-A, 3: Q2-B
  expectationType: ExpectationType
): { question: string; nextSpeaker: "A" | "B"; nextSpeakerName: string } {
  if (turnIndex === 0) {
    // ターン1: Aさん・出来事の想起
    const initial = getInitialPairQuestion({ nameA, nameB, relationship: "", expectationType });
    return {
      question: initial.question,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
    };
  } else if (turnIndex === 1) {
    // ターン2: Bさん・当時の状況や受け止め
    return {
      question: `${nameB}さん、${nameA}さんのお話を聞いて、そのとき${nameB}さんはどんな状況だったり、どう思っていましたか？`,
      nextSpeaker: "B",
      nextSpeakerName: nameB,
    };
  } else if (turnIndex === 2) {
    // ターン3: Aさん・相手への期待（本当はどうしてほしかったか）の深掘り
    let q = `${nameA}さん、そのとき、本当は${nameB}さんにどんな風にしてほしかったと思っていましたか？`;
    if (expectationType === "matched") {
      q = `${nameA}さん、そのとき、${nameB}さんにどんなことを期待していましたか？（${nameB}さんのどんな対応が嬉しかったですか？）`;
    }
    return {
      question: q,
      nextSpeaker: "A",
      nextSpeakerName: nameA,
    };
  } else {
    // ターン4: Bさん・相手の期待を聞いての受け止めと気持ち
    return {
      question: `${nameB}さん、${nameA}さんのそのお気持ちを聞いてみて、どう感じますか？ 今${nameA}さんに伝えたいことはありますか？`,
      nextSpeaker: "B",
      nextSpeakerName: nameB,
    };
  }
}

/**
 * 登録情報（参加者名）に応じたふたりモードの最初の質問
 */
export function getInitialPairQuestion(params: {
  nameA: string;
  nameB?: string;
  relationship?: string;
  expectationType?: ExpectationType;
}): { question: string; nextSpeaker: "A"; nextSpeakerName: string } {
  const { nameA } = params;

  const displayNameA =
    nameA.endsWith("さん") || nameA.endsWith("ちゃん") || nameA.endsWith("くん")
      ? nameA
      : `${nameA}さん`;

  return {
    question: `${displayNameA}、お互いに笑いあった出来事や勘違いしていた出来事など、何か２人の間に起きたエピソードを教えてください。（些細な出来事でも構いません）`,
    nextSpeaker: "A",
    nextSpeakerName: nameA,
  };
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