import { ExpectationType, PairAnimalDiagnosis, PairTurn } from "@/types";
import { PAIR_ANIMAL_MASTERS, PairAnimalMaster } from "./animal-diagnoses";

export const PAIR_ANIMAL_COMBOS: PairAnimalDiagnosis[] = PAIR_ANIMAL_MASTERS.map((m) => ({
  animalA: m.animalA,
  animalB: m.animalB,
  pairTitle: m.pairTitle,
  pairCatchphrase: m.pairCatchphrase,
  pairDescription: m.defaultDescription,
  futureRelationship: m.futureRelationship,
  academicDynamic: m.academicDynamic,
}));

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

  const baseMaster: PairAnimalMaster =
    expectationType === "matched"
      ? PAIR_ANIMAL_MASTERS[1] // 共感イルカ×共感イルカ
      : expectationType === "mismatched"
      ? PAIR_ANIMAL_MASTERS[0] // ワンちゃん×猫ちゃん
      : PAIR_ANIMAL_MASTERS[2]; // ワンちゃん×フクロウ

  const highlight = `『${ansA.slice(0, 25)}』について話し合った出来事`;
  const personalizedDesc = `『${ansA.slice(0, 20)}』という場面でお互いの思いを伝え合ったおふたり。${baseMaster.defaultDescription}`;

  const diagnosis: PairAnimalDiagnosis = {
    animalA: baseMaster.animalA,
    animalB: baseMaster.animalB,
    pairTitle: baseMaster.pairTitle,
    pairCatchphrase: baseMaster.pairCatchphrase,
    pairDescription: personalizedDesc,
    futureRelationship: baseMaster.futureRelationship,
    academicDynamic: baseMaster.academicDynamic,
    pairEpisodeHighlight: highlight,
  };

  return {
    perspectiveA: ansA.length > 50 ? ansA.substring(0, 47) + "..." : ansA,
    perspectiveB: ansB.length > 50 ? ansB.substring(0, 47) + "..." : ansB,
    reflection,
    pairAnimalDiagnosis: diagnosis,
  };
}