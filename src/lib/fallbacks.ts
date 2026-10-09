import { ExpectationType, AgeGroup, CareStatus, QuestionPurpose, AnimalDiagnosis } from "@/types";

export interface FallbackQuestion {
  question: string;
  purpose: QuestionPurpose;
}

export const FALLBACK_QUESTIONS: Record<
  ExpectationType,
  { standard: FallbackQuestion[]; simple: FallbackQuestion[] }
> = {
  matched: {
    standard: [
      { question: "どんな出来事でしたか？", purpose: "event" },
      { question: "相手に、どんなことを期待していましたか？", purpose: "expectation" },
      { question: "期待どおりになったとき、どう思いましたか？", purpose: "feeling" },
    ],
    simple: [
      { question: "どんなことがあったか、おしえてくれる？", purpose: "event" },
      { question: "あいてに、どんなことをしてほしかった？", purpose: "expectation" },
      { question: "おもったとおりになったとき、どうおもった？", purpose: "feeling" },
    ],
  },
  mismatched: {
    standard: [
      { question: "どんな出来事でしたか？", purpose: "event" },
      { question: "本当は、相手にどうしてほしかったですか？", purpose: "expectation" },
      { question: "なぜ、すれちがったと思いますか？", purpose: "reason" },
    ],
    simple: [
      { question: "どんなことがあったか、おしえてくれる？", purpose: "event" },
      { question: "ほんとうは、どうしてほしかった？", purpose: "expectation" },
      { question: "どうしてちがっちゃったと、おもう？", purpose: "reason" },
    ],
  },
  neutral: {
    standard: [
      { question: "どんな出来事でしたか？", purpose: "event" },
      { question: "どんなことを期待していましたか？", purpose: "expectation" },
      { question: "期待どおりだった部分と、違った部分はありますか？", purpose: "outcome" },
    ],
    simple: [
      { question: "どんなことがあったか、おしえてくれる？", purpose: "event" },
      { question: "どんなことをおもっていた？", purpose: "expectation" },
      { question: "おもったとおりだったところと、ちがったところはある？", purpose: "outcome" },
    ],
  },
};

export const ANIMAL_DIAGNOSES: AnimalDiagnosis[] = [
  {
    animalEmoji: "🐶",
    animalName: "素直なワンちゃんタイプ",
    catchphrase: "まっすぐな信頼とピュアな心",
    description: "相手への期待を大切にして、素直な気持ちで向き合えるタイプです。お互いの思いを言葉にし合うことで、さらに強い絆が育まれます。",
    futureTrait: "感情の透明性が高く、周囲に安心感と活気をもたらすオープンマインドな性格",
    academicTrait: "高親和・ストレート表出型（Direct & Affiliative）",
  },
  {
    animalEmoji: "🐱",
    animalName: "マイペースな猫ちゃんタイプ",
    catchphrase: "心地よい距離感と自立した優しさ",
    description: "相手の領域も自分のペースも尊重できるタイプです。すれ違いが起きても『そういうこともあるよね』とお互いの違いを認め合えるしなやかさがあります。",
    futureTrait: "お互いの境界線を尊重し、過度な干渉を避けてしなやかに共存できる自立した性格",
    academicTrait: "自立志向・適応的距離感型（Autonomous & Adaptive）",
  },
  {
    animalEmoji: "🦉",
    animalName: "見守りフクロウタイプ",
    catchphrase: "深い洞察力と静かな包容力",
    description: "相手の状況や気持ちを一歩引いて客観的に見つめられるタイプです。言葉にしない期待の奥にある想いに気づく優しさを持っています。",
    futureTrait: "相手のサインを静かに察知し、必要なときに適切なサポートを届けられる思慮深い性格",
    academicTrait: "内省的・観察受容型（Reflective & Accommodating）",
  },
  {
    animalEmoji: "🐬",
    animalName: "共感イルカタイプ",
    catchphrase: "気持ちのキャッチボールを楽しむ共感力",
    description: "心と心が通じ合う温かい瞬間を何よりも愛するタイプです。楽しいこともすれ違いも、お互いを深く知るきっかけに変えていけます。",
    futureTrait: "気持ちの波長を敏感に受け止め、ポジティブな感情を分かち合えるムードメーカーな性格",
    academicTrait: "共感主導・相互同調型（Empathetic & Synchronous）",
  },
  {
    animalEmoji: "🐻",
    animalName: "ぬくもりクマさんタイプ",
    catchphrase: "どっしり構える安心感と大きな思いやり",
    description: "相手のどんな一面も大らかに受け止めようとする包容力タイプです。そばにいるだけで相手にホッとした安心感を届けられます。",
    futureTrait: "相手の感情の揺らぎをどっしりと受け止め、居場所としての絶対的な安心感を与える性格",
    academicTrait: "安定志向・情動的包容型（Secure & Supportive）",
  },
  {
    animalEmoji: "🐧",
    animalName: "よりそいペンギンタイプ",
    catchphrase: "力を合わせて歩む健気なチームワーク",
    description: "相手と一緒に同じ方向を向いて協力し合いたいと願う誠実なタイプです。小さなすれ違いも、ふたりの歩幅を合わせるための大切な一歩になります。",
    futureTrait: "目標や暮らしの課題を一緒に分担し、歩幅を合わせて前進できるチームワーク志向の性格",
    academicTrait: "協調行動・タスク共有型（Collaborative & Cooperative）",
  },
  {
    animalEmoji: "🐿️",
    animalName: "きくばりリスさんタイプ",
    catchphrase: "細やかな気配りと先回りの優しさ",
    description: "相手が困らないように先回りして準備したり、小さな変化にすぐ気づける気配り上手です。さりげない心遣いで周りを心地よく満たします。",
    futureTrait: "日常の些細なサインやニーズを敏感にキャッチし、円滑で心地よい環境を整える性格",
    academicTrait: "配慮主導・予防的サポート型（Attentive & Proactive）",
  },
  {
    animalEmoji: "🦊",
    animalName: "ひらめきキツネタイプ",
    catchphrase: "スマートな機転としなやかな適応力",
    description: "予想外のすれ違いが起きても、機転を利かせて柔軟に別の楽しさを見つけられるタイプです。どんな状況も軽やかに乗りこなす柔軟性を持っています。",
    futureTrait: "想定外の状況でも慌てず、新しい解決策や楽しい視点に素早く切り替えられる性格",
    academicTrait: "認知的柔軟性・状況適応型（Flexible & Resourceful）",
  },
  {
    animalEmoji: "🦔",
    animalName: "シャイなハリネズミタイプ",
    catchphrase: "不器用だけど純粋で深いあたたかさ",
    description: "最初は少し慎重で気持ちを出すのに時間がかかりますが、心の中には相手への純粋で温かい想いが詰まっているタイプです。時間をかけて確かな絆を育みます。",
    futureTrait: "慎重に信頼関係を深め、一度築いた絆を何よりも大切に守り抜く誠実な性格",
    academicTrait: "防衛受容・深層愛着型（Cautious & Dedicated）",
  },
  {
    animalEmoji: "🦦",
    animalName: "陽気なラッコタイプ",
    catchphrase: "笑顔とユーモアでほぐすポジティブな心",
    description: "ちょっとしたすれ違いやモヤモヤも、笑顔やユーモアでふわりと和らげてしまえるタイプです。一緒にいる空間を明るい空気で満たします。",
    futureTrait: "張り詰めた空気をポジティブにほぐし、人との関わりを楽しい遊び場に変える性格",
    academicTrait: "情動調整・ユーモア媒介型（Playful & Harmonizing）",
  },
  {
    animalEmoji: "🦌",
    animalName: "おだやかシカタイプ",
    catchphrase: "相手を尊重する静かな調和と品性",
    description: "相手の領域や気持ちに無理に踏み込まず、自然な距離感を大切にしながらそっと寄り添えるタイプです。穏やかで安心できる関係を作ります。",
    futureTrait: "相手のペースとプライベートを大切に尊重し、長続きする穏やかな調和を保つ性格",
    academicTrait: "非侵襲・調和維持型（Non-intrusive & Peaceful）",
  },
  {
    animalEmoji: "🦁",
    animalName: "頼れるライオンタイプ",
    catchphrase: "力強い情熱とブレない包容リーダーシップ",
    description: "相手を喜ばせたい、困ったときは守りたいという強い情熱とリーダーシップを持つタイプです。頼もしさで相手に前向きな勇気を届けます。",
    futureTrait: "決断力と責任感を持ち、大切な人を力強く引っ張りながら安心をもたらす性格",
    academicTrait: "能動主導・防護的コミットメント型（Assertive & Protective）",
  },
  {
    animalEmoji: "🐘",
    animalName: "しっかりゾウさんタイプ",
    catchphrase: "約束を重んじる揺るぎない信頼と誠実さ",
    description: "過去の約束やふたりで交わした言葉を大切に記憶し、相手に誠実に応え続けようとするタイプです。揺るぎない安心感で周囲を支えます。",
    futureTrait: "約束や信頼を何よりも重んじ、時間をかけて揺るぎない安心と実績を積み重ねる性格",
    academicTrait: "信義誠実・長期継続型（Consistent & Loyal）",
  },
  {
    animalEmoji: "🐇",
    animalName: "びかんウサギタイプ",
    catchphrase: "豊かな感受性と素早い思いやりのアンテナ",
    description: "相手の些細な表情や声のトーンの変化を素早く感じ取り、ピュアな優しさで応答できるタイプです。繊細だからこそ、相手の痛みに一番に寄り添えます。",
    futureTrait: "細やかな心の機微を察知し、相手の気持ちに優しく共鳴できる高い感受性を持つ性格",
    academicTrait: "高感受性・迅速応答型（Sensitive & Responsive）",
  },
];

export function getFallbackAnimalDiagnosis(
  type: ExpectationType,
  answers: string[]
): AnimalDiagnosis {
  const combined = answers.join(" ");
  if (type === "matched") {
    if (combined.includes("笑") || combined.includes("楽し") || combined.includes("ユーモア")) {
      return ANIMAL_DIAGNOSES[9]; // 陽気なラッコ
    }
    if (combined.includes("嬉し") || combined.includes("通じ")) {
      return ANIMAL_DIAGNOSES[3]; // 共感イルカ
    }
    if (combined.includes("守") || combined.includes("引") || combined.includes("頑張")) {
      return ANIMAL_DIAGNOSES[11]; // 頼れるライオン
    }
    return ANIMAL_DIAGNOSES[0]; // 素直なワンちゃん
  } else if (type === "mismatched") {
    if (combined.includes("気遣") || combined.includes("準備") || combined.includes("先")) {
      return ANIMAL_DIAGNOSES[6]; // きくばりリス
    }
    if (combined.includes("我慢") || combined.includes("言えな") || combined.includes("不安") || combined.includes("緊張")) {
      return ANIMAL_DIAGNOSES[8]; // シャイなハリネズミ
    }
    if (combined.includes("時間") || combined.includes("忙し") || combined.includes("マイペース")) {
      return ANIMAL_DIAGNOSES[1]; // 猫ちゃん
    }
    if (combined.includes("どうして") || combined.includes("なぜ") || combined.includes("考え")) {
      return ANIMAL_DIAGNOSES[2]; // 見守りフクロウ
    }
    return ANIMAL_DIAGNOSES[7]; // ひらめきキツネ
  } else {
    if (combined.includes("約束") || combined.includes("信") || combined.includes("待")) {
      return ANIMAL_DIAGNOSES[12]; // しっかりゾウ
    }
    if (combined.includes("静か") || combined.includes("距離") || combined.includes("そっと")) {
      return ANIMAL_DIAGNOSES[10]; // おだやかシカ
    }
    if (combined.includes("手伝") || combined.includes("一緒") || combined.includes("協力")) {
      return ANIMAL_DIAGNOSES[5]; // よりそいペンギン
    }
    if (combined.includes("気配") || combined.includes("優し") || combined.includes("気付")) {
      return ANIMAL_DIAGNOSES[13]; // びかんウサギ
    }
    return ANIMAL_DIAGNOSES[4]; // ぬくもりクマ
  }
}

export function getFallbackQuestion(
  type: ExpectationType,
  ageGroup: AgeGroup,
  turnIndex: number
): FallbackQuestion {
  const isSimple = ageGroup === "under_10";
  const list = isSimple
    ? FALLBACK_QUESTIONS[type].simple
    : FALLBACK_QUESTIONS[type].standard;
  const clampedIndex = Math.min(Math.max(turnIndex, 0), 2);
  return list[clampedIndex];
}

/**
 * 相手の選択肢（関係性）を質問文で自然に呼びかける名詞に変換
 */
export function formatPartnerReferral(partner: string, isSimple: boolean = false): string {
  if (!partner) return isSimple ? "あいての人" : "相手の方";
  if (partner === "友だち" || partner === "友達") return isSimple ? "お友だち" : "お友だち";
  if (partner === "親子" || partner === "おやこ") return isSimple ? "お父さんやお母さん、お子さん" : "親御さん・お子さん";
  if (partner === "兄弟" || partner === "きょうだい") return isSimple ? "きょうだい" : "ご兄弟・ご姉妹";
  if (partner === "夫婦") return isSimple ? "パートナー" : "夫・妻（配偶者）の方";
  if (partner === "恋人") return isSimple ? "たいせつな人" : "恋人（パートナー）の方";
  if (partner === "家族") return isSimple ? "かぞく" : "ご家族";
  if (partner === "その他") return isSimple ? "あいての人" : "お相手の方";
  return partner;
}

/**
 * 年齢グループおよび実年齢に応じた汎用的オープナー質問を返す
 * 14歳以下の場合は子ども向けモードの質問文を返す
 */
export function getInitialSingleQuestion(params: {
  ageGroup: AgeGroup;
  age?: number | null;
}): FallbackQuestion {
  const { ageGroup, age } = params;

  // 14歳以下の場合は子ども向け
  const isSimple = age !== undefined && age !== null ? age <= 14 : ageGroup === "under_10";

  if (isSimple) {
    return {
      question:
        "おともだちやかぞくに対して、きみが「これをやってほしいな」とおもったことや、「これをしたらよろこんでくれるかな」とおもったことはあるかな？ だれとの、どんなことだったかおしえてね。",
      purpose: "event",
    };
  }

  // 15歳以上（11_30, 31_plus, no_answer）は共通（身近な人の具体例と感情の手がかり入り）
  return {
    question:
      "身近な人（友だち・家族・恋人・職場の仲間など）とのやり取りで、「思っていたのと違ってモヤッとしたこと」や「期待以上に嬉しかったこと」など、印象に残っている出来事はありますか？ 誰とのどんな場面でしたか？",
    purpose: "event",
  };
}

/**
 * 回答内容からポジティブ/一致（嬉しかったこと）か、ネガティブ/不一致（すれ違い）かを判定して
 * 適切なフォールバック質問を返す
 */
export function getSmartFallbackQuestion(
  previousAnswers: string[],
  isSimple: boolean
): string {
  const lastAns = previousAnswers[previousAnswers.length - 1] || "";
  const turnIndex = previousAnswers.length; // 1: Q2, 2: Q3

  // 一致・ポジティブの判定キーワード
  const isPositive = /嬉し|うれし|楽|よかっ|良かっ|助かっ|ありがと|感謝|プレゼント|祝|笑顔|優し|やさし|安心|成功|褒め|ほめ/.test(lastAns);

  if (turnIndex === 1) {
    if (isPositive) {
      return isSimple
        ? "あいての人の、どんなことばや行動がうれしかった？"
        : "相手の方の、どんな言葉や行動が特に嬉しかったですか？";
    } else {
      return isSimple
        ? "ほんとうは、どうしてほしかった？"
        : "そのとき、相手の方にはどんな風にしてほしかったですか？";
    }
  }

  // turnIndex === 2
  if (isPositive) {
    return isSimple
      ? "そのあと、あいての人とどんなお話をした？"
      : "その出来事のあと、相手の方とはどのようなやり取りがありましたか？";
  } else {
    return isSimple
      ? "どうおもったか、おしえてくれる？"
      : "その出来事を通じて、どんなお気持ちになりましたか？";
  }
}

export function getFallbackReflection(
  type: ExpectationType,
  ageGroup: AgeGroup,
  answers: string[]
): {
  expected: string;
  actual: string;
  reflection: string;
  animalDiagnosis: AnimalDiagnosis;
} {
  const isSimple = ageGroup === "under_10";

  let expected = answers[1] || answers[0] || (isSimple ? "相手への思い" : "相手への期待");
  let actual = answers[0] || answers[2] || (isSimple ? "起きたこと" : "実際の出来事");

  if (expected.length > 50) {
    expected = expected.substring(0, 47) + "...";
  }
  if (actual.length > 50) {
    actual = actual.substring(0, 47) + "...";
  }

  let reflection = "";
  if (type === "matched") {
    reflection = isSimple
      ? "おたがいのきもちがぴったり合って、とてもうれしいじかんになりましたね。相手にたいする素直なおもいが、しっかり伝わったたいせつなことです。"
      : "相手への期待と実際の行動が重なり、気持ちが通じ合った場面でした。互いの意図が自然に伝わった温かいやり取りの記録です。";
  } else if (type === "mismatched") {
    reflection = isSimple
      ? "思っていたこととすこしちがって、おどろいたり悲しかったりしたかもしれません。でも、相手にこうしてほしいとおもったきもちは、とても自然なことです。"
      : "相手に望んでいたことと実際の行動にすれ違いが生じた場面でした。期待を抱くことも、お互いの受け止め方に差が生まれることも、人と人との関わりにおいて自然なことです。";
  } else {
    reflection = isSimple
      ? "うまくいったところも、すこしちがったところもあったようですね。相手との関わりの中で、いろいろな感じかたをしたたいせつなことです。"
      : "期待がかなった面と、予想とは異なった面の両方があった出来事でした。状況や相手の受け止め方によって多様な側面が見えた場面です。";
  }

  const animalDiagnosis = getFallbackAnimalDiagnosis(type, answers);

  return {
    expected,
    actual,
    reflection,
    animalDiagnosis,
  };
}