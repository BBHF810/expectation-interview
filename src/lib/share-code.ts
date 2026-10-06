import { AnimalDiagnosis, PairAnimalDiagnosis } from "@/types";
import { ANIMAL_DIAGNOSES } from "./fallbacks";
import { PAIR_ANIMAL_COMBOS } from "./pair-fallbacks";

export function getShareBaseUrl(): string {
  if (typeof window !== "undefined") {
    // ローカル開発・テスト時でもスマホで読むため本番ドメインへフォールバック
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "https://expectation-interview.vercel.app";
    }
    return window.location.origin;
  }
  return "https://expectation-interview.vercel.app";
}

/** Base64URL 安全エンコード */
export function encodeSharePayload(obj: any): string {
  try {
    const jsonStr = JSON.stringify(obj);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e) {
    console.error("Failed to encode share payload", e);
    return "";
  }
}

/** Base64URL デコード */
export function decodeSharePayload(str: string): any {
  try {
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) {
      b64 += "=";
    }
    const jsonStr = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to decode share payload", e);
    return null;
  }
}

/** シングル用：極小データに圧縮したURLを生成 */
export function createSingleShareUrl(animalDiagnosis?: AnimalDiagnosis, reflection: string = ""): string {
  const baseUrl = getShareBaseUrl();
  const animalName = animalDiagnosis?.animalName || "素直なワンちゃんタイプ";
  // 固定リストに含まれる場合はインデックス化してさらに短縮
  const foundIdx = ANIMAL_DIAGNOSES.findIndex((d) => d.animalName === animalName);

  const payload: any = {
    m: "s",
    r: reflection.slice(0, 160), // スマホ表示に十分な長さに最適化
  };

  if (foundIdx !== -1) {
    payload.ai = foundIdx;
  } else {
    payload.an = animalName;
    payload.ae = animalDiagnosis?.animalEmoji || "🌱";
    payload.ac = animalDiagnosis?.catchphrase || "";
    payload.ad = animalDiagnosis?.description || "";
  }

  const encoded = encodeSharePayload(payload);
  return `${baseUrl}/share?d=${encoded}`;
}

/** ペア用：極小データに圧縮したURLを生成 */
export function createPairShareUrl(params: {
  pairAnimalDiagnosis: PairAnimalDiagnosis;
  nameA: string;
  nameB: string;
  perspectiveA?: string;
  perspectiveB?: string;
  reflection: string;
}): string {
  const baseUrl = getShareBaseUrl();
  const { pairAnimalDiagnosis, nameA, nameB, perspectiveA, perspectiveB, reflection } = params;

  const foundIdx = PAIR_ANIMAL_COMBOS.findIndex(
    (c) => c.pairTitle === pairAnimalDiagnosis.pairTitle
  );

  const payload: any = {
    m: "p",
    nA: nameA.slice(0, 15),
    nB: nameB.slice(0, 15),
    r: reflection.slice(0, 160),
    pA: perspectiveA ? perspectiveA.slice(0, 70) : undefined,
    pB: perspectiveB ? perspectiveB.slice(0, 70) : undefined,
  };

  if (foundIdx !== -1) {
    payload.pi = foundIdx;
  } else {
    payload.pt = pairAnimalDiagnosis.pairTitle;
    payload.pc = pairAnimalDiagnosis.pairCatchphrase;
    payload.pd = pairAnimalDiagnosis.pairDescription;
    payload.aA = pairAnimalDiagnosis.animalA;
    payload.aB = pairAnimalDiagnosis.animalB;
  }

  const encoded = encodeSharePayload(payload);
  return `${baseUrl}/share?d=${encoded}`;
}

/** /share ページで短縮データをフル診断データに復元 */
export function restoreShareData(rawD: string): any {
  const decoded = decodeSharePayload(rawD);
  if (!decoded) return null;

  // 以前のレガシー形式（mode="single" 等の非短縮版）への後方互換
  if (decoded.mode === "single" || decoded.mode === "pair") {
    return decoded;
  }

  if (decoded.m === "s") {
    // シングルモード復元
    let animal: Partial<AnimalDiagnosis> = {};
    if (typeof decoded.ai === "number" && ANIMAL_DIAGNOSES[decoded.ai]) {
      animal = ANIMAL_DIAGNOSES[decoded.ai];
    } else {
      const match = ANIMAL_DIAGNOSES.find((d) => d.animalName === decoded.an);
      if (match) {
        animal = match;
      } else {
        animal = {
          animalName: decoded.an || "コミュニケーション診断",
          animalEmoji: decoded.ae || "🌱",
          catchphrase: decoded.ac || "",
          description: decoded.ad || "",
        };
      }
    }

    return {
      mode: "single",
      title: animal.animalName,
      emoji: animal.animalEmoji,
      catchphrase: animal.catchphrase,
      description: animal.description,
      futureTrait: animal.futureTrait,
      academicTrait: animal.academicTrait,
      reflection: decoded.r || "",
    };
  } else if (decoded.m === "p") {
    // ペアモード復元
    let combo: Partial<PairAnimalDiagnosis> = {};
    if (typeof decoded.pi === "number" && PAIR_ANIMAL_COMBOS[decoded.pi]) {
      combo = PAIR_ANIMAL_COMBOS[decoded.pi];
    } else {
      const match = PAIR_ANIMAL_COMBOS.find((c) => c.pairTitle === decoded.pt);
      if (match) {
        combo = match;
      } else {
        combo = {
          animalA: decoded.aA || { emoji: "🐰", name: "動物A" },
          animalB: decoded.aB || { emoji: "🦉", name: "動物B" },
          pairTitle: decoded.pt || `${decoded.nA} & ${decoded.nB} ペア`,
          pairCatchphrase: decoded.pc || "",
          pairDescription: decoded.pd || "",
          futureRelationship: decoded.fr,
          academicDynamic: decoded.ad,
        };
      }
    }

    return {
      mode: "pair",
      nameA: decoded.nA,
      nameB: decoded.nB,
      animalA: combo.animalA,
      animalB: combo.animalB,
      pairTitle: combo.pairTitle,
      pairCatchphrase: combo.pairCatchphrase,
      pairDescription: combo.pairDescription,
      futureRelationship: combo.futureRelationship,
      academicDynamic: combo.academicDynamic,
      perspectiveA: decoded.pA,
      perspectiveB: decoded.pB,
      reflection: decoded.r || "",
    };
  }

  return null;
}
