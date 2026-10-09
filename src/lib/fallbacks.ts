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

import { SINGLE_ANIMAL_MASTERS, SingleAnimalMaster } from "./animal-diagnoses";

export const ANIMAL_DIAGNOSES: AnimalDiagnosis[] = SINGLE_ANIMAL_MASTERS.map((m) => ({
  animalEmoji: m.animalEmoji,
  animalName: m.animalName,
  catchphrase: m.catchphrase,
  description: m.defaultDescription,
  futureTrait: m.futureTrait,
  academicTrait: m.academicTrait,
}));

export function getFallbackAnimalDiagnosis(
  type: ExpectationType,
  answers: string[]
): AnimalDiagnosis {
  const combined = answers.join(" ");
  let master: SingleAnimalMaster = SINGLE_ANIMAL_MASTERS[0]; // デフォルト: 素直なワンちゃん

  if (type === "matched") {
    if (combined.includes("笑") || combined.includes("楽し") || combined.includes("ユーモア")) {
      master = SINGLE_ANIMAL_MASTERS[9]; // 陽気なラッコ
    } else if (combined.includes("嬉し") || combined.includes("通じ")) {
      master = SINGLE_ANIMAL_MASTERS[3]; // 共感イルカ
    } else if (combined.includes("守") || combined.includes("引") || combined.includes("頑張")) {
      master = SINGLE_ANIMAL_MASTERS[11]; // 頼れるライオン
    } else {
      master = SINGLE_ANIMAL_MASTERS[0]; // 素直なワンちゃん
    }
  } else if (type === "mismatched") {
    if (combined.includes("気遣") || combined.includes("準備") || combined.includes("先")) {
      master = SINGLE_ANIMAL_MASTERS[6]; // きくばりリス
    } else if (combined.includes("我慢") || combined.includes("言えな") || combined.includes("不安") || combined.includes("緊張")) {
      master = SINGLE_ANIMAL_MASTERS[8]; // シャイなハリネズミ
    } else if (combined.includes("時間") || combined.includes("忙し") || combined.includes("マイペース")) {
      master = SINGLE_ANIMAL_MASTERS[1]; // 猫ちゃん
    } else if (combined.includes("どうして") || combined.includes("なぜ") || combined.includes("考え")) {
      master = SINGLE_ANIMAL_MASTERS[2]; // 見守りフクロウ
    } else {
      master = SINGLE_ANIMAL_MASTERS[7]; // ひらめきキツネ
    }
  } else {
    if (combined.includes("約束") || combined.includes("信") || combined.includes("待")) {
      master = SINGLE_ANIMAL_MASTERS[12]; // しっかりゾウ
    } else if (combined.includes("静か") || combined.includes("距離") || combined.includes("そっと")) {
      master = SINGLE_ANIMAL_MASTERS[10]; // おだやかシカ
    } else if (combined.includes("手伝") || combined.includes("一緒") || combined.includes("協力")) {
      master = SINGLE_ANIMAL_MASTERS[5]; // よりそいペンギン
    } else if (combined.includes("気配") || combined.includes("優し") || combined.includes("気付")) {
      master = SINGLE_ANIMAL_MASTERS[13]; // びかんウサギ
    } else {
      master = SINGLE_ANIMAL_MASTERS[4]; // ぬくもりクマ
    }
  }

  const firstAns = answers[0]?.trim();
  const episodeDesc = firstAns
    ? `『${firstAns.slice(0, 22)}』とお話ししてくださったあなた。${master.defaultDescription}`
    : master.defaultDescription;

  return {
    animalEmoji: master.animalEmoji,
    animalName: master.animalName,
    catchphrase: master.catchphrase,
    description: episodeDesc,
    futureTrait: master.futureTrait,
    academicTrait: master.academicTrait,
    episodeHighlight: firstAns ? `『${firstAns.slice(0, 25)}』とお話ししてくださったこと` : undefined,
  };
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