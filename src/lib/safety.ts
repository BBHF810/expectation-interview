import { SafetyAction } from "@/types";

/**
 * センシティブな内容（自傷・他害・深刻な暴力・虐待等）を検知するアプリケーション側安全チェック。
 * 単純な単語単体（例：「死ぬほど笑った」などの慣用表現）による誤検知を避けつつ、
 * 深刻なSOSシグナルや被害を示唆する表現を安全側（stop）に倒します。
 */
export function checkSafetyLocally(text: string): SafetyAction {
  if (!text || typeof text !== "string") {
    return "continue";
  }

  const normalized = text.toLowerCase().replace(/\s+/g, "");

  // 自傷・希死念慮関連パターン
  const selfHarmPatterns = [
    /死にたい/,
    /消えたい/,
    /消えてしまいたい/,
    /いなくなりたい/,
    /自傷/,
    /リストカット/,
    /リスカ/,
    /首をつ/,
    /飛び降/,
    /生きていたくない/,
    /命を絶/,
    /自殺/,
  ];

  // 深刻な暴力・虐待・脅迫関連パターン
  const violencePatterns = [
    /殴られて/,
    /殴られた/,
    /蹴られた/,
    /暴力を受/,
    /虐待/,
    /殺してやる/,
    /殺したい/,
    /殺される/,
    /首を絞め/,
    /閉じ込められた/,
    /逃げられない/,
    /助けて.+痛い/,
  ];

  for (const pattern of selfHarmPatterns) {
    if (pattern.test(normalized)) {
      return "stop";
    }
  }

  for (const pattern of violencePatterns) {
    if (pattern.test(normalized)) {
      return "stop";
    }
  }

  return "continue";
}
