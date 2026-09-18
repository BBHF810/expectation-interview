import { ExpectationType, AgeGroup, QuestionPurpose, AnimalDiagnosis } from "@/types";

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
  },
  {
    animalEmoji: "🐱",
    animalName: "マイペースな猫ちゃんタイプ",
    catchphrase: "心地よい距離感と自立した優しさ",
    description: "相手の領域も自分のペースも尊重できるタイプです。すれ違いが起きても『そういうこともあるよね』とお互いの違いを認め合えるしなやかさがあります。",
  },
  {
    animalEmoji: "🦉",
    animalName: "見守りフクロウタイプ",
    catchphrase: "深い洞察力と静かな包容力",
    description: "相手の状況や気持ちを一歩引いて客観的に見つめられるタイプです。言葉にしない期待の奥にある想いに気づく優しさを持っています。",
  },
  {
    animalEmoji: "🐬",
    animalName: "共感イルカタイプ",
    catchphrase: "気持ちのキャッチボールを楽しむ共感力",
    description: "心と心が通じ合う温かい瞬間を何よりも愛するタイプです。楽しいこともすれ違いも、お互いを深く知るきっかけに変えていけます。",
  },
  {
    animalEmoji: "🐻",
    animalName: "ぬくもりクマさんタイプ",
    catchphrase: "どっしり構える安心感と大きな思いやり",
    description: "相手のどんな一面も大らかに受け止めようとする包容力タイプです。そばにいるだけで相手にホッとした安心感を届けられます。",
  },
  {
    animalEmoji: "🐧",
    animalName: "よりそいペンギンタイプ",
    catchphrase: "力を合わせて歩む健気なチームワーク",
    description: "相手と一緒に同じ方向を向いて協力し合いたいと願う誠実なタイプです。小さなすれ違いも、ふたりの歩幅を合わせるための大切な一歩になります。",
  },
];

export function getFallbackAnimalDiagnosis(
  type: ExpectationType,
  answers: string[]
): AnimalDiagnosis {
  const combined = answers.join(" ");
  if (type === "matched") {
    if (combined.includes("嬉し") || combined.includes("楽")) {
      return ANIMAL_DIAGNOSES[3]; // 共感イルカ
    }
    return ANIMAL_DIAGNOSES[0]; // 素直なワンちゃん
  } else if (type === "mismatched") {
    if (combined.includes("時間") || combined.includes("忙し")) {
      return ANIMAL_DIAGNOSES[1]; // 猫ちゃん
    }
    return ANIMAL_DIAGNOSES[2]; // 見守りフクロウ
  } else {
    if (combined.includes("手伝") || combined.includes("一緒")) {
      return ANIMAL_DIAGNOSES[5]; // よりそいペンギン
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
      ? "おたがいのきもちがぴったり合って、とてもうれしいじかんになりましたね。相手にたいする素直なおもいが、しっかり伝わったたいせつな出来事です。"
      : "相手への期待と実際の行動が重なり、気持ちが通じ合った場面でした。互いの意図が自然に伝わった温かいやり取りの記録です。";
  } else if (type === "mismatched") {
    reflection = isSimple
      ? "思っていたこととすこしちがって、おどろいたり悲しかったりしたかもしれません。でも、相手にこうしてほしいとおもったきもちは、とても自然なことです。"
      : "相手に望んでいたことと実際の行動にすれ違いが生じた場面でした。期待を抱くことも、お互いの受け止め方に差が生まれることも、人と人との関わりにおいて自然なことです。";
  } else {
    reflection = isSimple
      ? "うまくいったところも、すこしちがったところもあったようですね。相手との関わりの中で、いろいろな感じかたをしたたいせつな出来事です。"
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