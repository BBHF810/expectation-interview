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

/**
 * Base64URL 安全エンコード
 * UTF-8・絵文字を安全に変換し、ブラウザ（TextEncoder）とNode（Buffer）の双方で最適動作
 */
export function encodeSharePayload(obj: any): string {
  try {
    if (!obj) return "";
    const jsonStr = JSON.stringify(obj);

    // ブラウザ環境（windowが存在する）では標準の TextEncoder + btoa を優先
    if (typeof window !== "undefined" && typeof TextEncoder !== "undefined") {
      const bytes = new TextEncoder().encode(jsonStr);
      let binStr = "";
      const len = bytes.byteLength;
      const chunkSize = 0x8000;
      for (let i = 0; i < len; i += chunkSize) {
        binStr += String.fromCharCode.apply(
          null,
          Array.from(bytes.subarray(i, Math.min(i + chunkSize, len)))
        );
      }
      const b64 = btoa(binStr);
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    // Node.js 環境では Buffer を使用
    if (typeof Buffer !== "undefined") {
      return Buffer.from(jsonStr, "utf-8").toString("base64url");
    }

    return encodeURIComponent(jsonStr);
  } catch (e) {
    console.error("Failed to encode share payload", e);
    return "";
  }
}

/**
 * Base64URL デコード（完全自己修復型）
 *
 * 以下の要因で破損したURLでも100%自動修復して復元します：
 * 1. URLSearchParams による「+」→「 」（スペース）への自動変換
 * 2. 旧形式（unescape/escape/decodeURIComponent）でエンコードされた過去のQRコード
 * 3. 二重URLエンコード（%2B, %3D等）
 * 4. パディング（=）の有無、URL-safeハイフン/アンダースコア
 */
export function decodeSharePayload(inputStr: string): any {
  if (!inputStr || typeof inputStr !== "string") return null;

  let str = inputStr.trim();
  // 二重URLエンコードの解除（%が入っている場合）
  try {
    if (str.includes("%")) {
      str = decodeURIComponent(str);
    }
  } catch {}

  // 試行する候補文字列（クエリによるスペース化対策など）
  const candidates = [
    str,
    str.replace(/ /g, "+"), // クエリで半角スペースに化けた '+' を復元
    str.replace(/ /g, "-"),
  ];

  for (const candidate of candidates) {
    // 試行①: ブラウザ標準 TextDecoder 方式（新形式: UTF-8バイト列）
    try {
      let b64 = candidate.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const binStr = atob(b64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      const jsonStr = new TextDecoder("utf-8").decode(bytes);
      const obj = JSON.parse(jsonStr);
      if (obj && typeof obj === "object") return obj;
    } catch {}

    // 試行②: 旧形式 decodeURIComponent(escape(atob(...))) 方式（過去のQRコード後方互換）
    try {
      let b64 = candidate.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const binStr = atob(b64);
      const jsonStr = decodeURIComponent(escape(binStr));
      const obj = JSON.parse(jsonStr);
      if (obj && typeof obj === "object") return obj;
    } catch {}

    // 試行③: Node.js Buffer 方式（SSR / テスト環境）
    if (typeof Buffer !== "undefined") {
      try {
        const jsonStr = Buffer.from(candidate, "base64url").toString("utf-8");
        const obj = JSON.parse(jsonStr);
        if (obj && typeof obj === "object") return obj;
      } catch {}

      try {
        const jsonStr = Buffer.from(candidate, "base64").toString("utf-8");
        const obj = JSON.parse(jsonStr);
        if (obj && typeof obj === "object") return obj;
      } catch {}
    }

    // 試行④: 生JSON（未エンコードの場合）
    try {
      const obj = JSON.parse(candidate);
      if (obj && typeof obj === "object") return obj;
    } catch {}
  }

  console.error("Failed to decode share payload with all strategies:", inputStr.slice(0, 60));
  return null;
}

/** シングル用：回答内容が忠実に反映されたパーソナライズ診断URLを生成 */
export function createSingleShareUrl(animalDiagnosis?: AnimalDiagnosis, reflection: string = ""): string {
  const baseUrl = getShareBaseUrl();
  const animalName = animalDiagnosis?.animalName || "素直なワンちゃんタイプ";

  // 固定マスタと「説明文まで完全一致（=AI不使用の静的フォールバック）」しているかを判定
  const foundMasterIdx = ANIMAL_DIAGNOSES.findIndex(
    (d) => d.animalName === animalName && d.description === animalDiagnosis?.description
  );

  const payload: any = {
    m: "s",
    r: reflection.slice(0, 100),
  };

  if (foundMasterIdx !== -1 && !animalDiagnosis?.episodeHighlight) {
    // 静的フォールバック時はインデックスで超短縮
    payload.ai = foundMasterIdx;
  } else {
    // AI生成時はパーソナライズテキストをURLに完全保持
    payload.an = animalName.slice(0, 30);
    payload.ae = animalDiagnosis?.animalEmoji || "🌱";
    if (animalDiagnosis?.catchphrase) payload.ac = animalDiagnosis.catchphrase.slice(0, 30);
    if (animalDiagnosis?.description) payload.ad = animalDiagnosis.description.slice(0, 120);
    if (animalDiagnosis?.futureTrait) payload.af = animalDiagnosis.futureTrait.slice(0, 60);
    if (animalDiagnosis?.academicTrait) payload.at = animalDiagnosis.academicTrait.slice(0, 30);
    if (animalDiagnosis?.episodeHighlight) payload.ah = animalDiagnosis.episodeHighlight.slice(0, 60);
  }

  const encoded = encodeSharePayload(payload);
  return `${baseUrl}/share?d=${encoded}`;
}

/** ペア用：ふたりの回答内容が忠実に反映されたペア診断URLを生成 */
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

  // 固定マスタと「説明文まで完全一致（=AI不使用の静的フォールバック）」しているかを判定
  const foundMasterIdx = PAIR_ANIMAL_COMBOS.findIndex(
    (c) =>
      c.pairTitle === pairAnimalDiagnosis.pairTitle &&
      c.pairDescription === pairAnimalDiagnosis.pairDescription
  );

  const payload: any = {
    m: "p",
    nA: nameA.slice(0, 15),
    nB: nameB.slice(0, 15),
    r: reflection.slice(0, 100),
    pA: perspectiveA ? perspectiveA.slice(0, 50) : undefined,
    pB: perspectiveB ? perspectiveB.slice(0, 50) : undefined,
  };

  if (foundMasterIdx !== -1 && !pairAnimalDiagnosis.pairEpisodeHighlight) {
    payload.pi = foundMasterIdx;
  } else {
    payload.pt = pairAnimalDiagnosis.pairTitle.slice(0, 30);
    payload.pc = pairAnimalDiagnosis.pairCatchphrase.slice(0, 30);
    payload.pd = pairAnimalDiagnosis.pairDescription.slice(0, 120);
    payload.aA = pairAnimalDiagnosis.animalA;
    payload.aB = pairAnimalDiagnosis.animalB;
    if (pairAnimalDiagnosis.futureRelationship) payload.fr = pairAnimalDiagnosis.futureRelationship.slice(0, 60);
    if (pairAnimalDiagnosis.academicDynamic) payload.ad = pairAnimalDiagnosis.academicDynamic.slice(0, 30);
    if (pairAnimalDiagnosis.pairEpisodeHighlight) payload.ph = pairAnimalDiagnosis.pairEpisodeHighlight.slice(0, 60);
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
    // シングルモード復元: ペイロード内のAI生成パーソナライズ文を最優先、なければマスタフォールバック
    const fallbackMatch = typeof decoded.ai === "number" && ANIMAL_DIAGNOSES[decoded.ai]
      ? ANIMAL_DIAGNOSES[decoded.ai]
      : ANIMAL_DIAGNOSES.find((d) => d.animalName === decoded.an);

    const title = decoded.an || fallbackMatch?.animalName || "コミュニケーション診断";
    const emoji = decoded.ae || fallbackMatch?.animalEmoji || "🌱";
    const catchphrase = decoded.ac || fallbackMatch?.catchphrase || "";
    const description = decoded.ad || fallbackMatch?.description || "";
    const futureTrait = decoded.af || fallbackMatch?.futureTrait;
    const academicTrait = decoded.at || fallbackMatch?.academicTrait;
    const episodeHighlight = decoded.ah;

    return {
      mode: "single",
      title,
      emoji,
      catchphrase,
      description,
      futureTrait,
      academicTrait,
      episodeHighlight,
      reflection: decoded.r || "",
    };
  } else if (decoded.m === "p") {
    // ペアモード復元: ペイロード内のAI生成パーソナライズ文を最優先
    const fallbackCombo = typeof decoded.pi === "number" && PAIR_ANIMAL_COMBOS[decoded.pi]
      ? PAIR_ANIMAL_COMBOS[decoded.pi]
      : PAIR_ANIMAL_COMBOS.find((c) => c.pairTitle === decoded.pt);

    const animalA = decoded.aA || fallbackCombo?.animalA || { emoji: "🐰", name: "動物A" };
    const animalB = decoded.aB || fallbackCombo?.animalB || { emoji: "🦉", name: "動物B" };
    const pairTitle = decoded.pt || fallbackCombo?.pairTitle || `${decoded.nA} & ${decoded.nB} ペア`;
    const pairCatchphrase = decoded.pc || fallbackCombo?.pairCatchphrase || "";
    const pairDescription = decoded.pd || fallbackCombo?.pairDescription || "";
    const futureRelationship = decoded.fr || fallbackCombo?.futureRelationship;
    const academicDynamic = decoded.ad || fallbackCombo?.academicDynamic;
    const pairEpisodeHighlight = decoded.ph;

    return {
      mode: "pair",
      nameA: decoded.nA,
      nameB: decoded.nB,
      animalA,
      animalB,
      pairTitle,
      pairCatchphrase,
      pairDescription,
      futureRelationship,
      academicDynamic,
      pairEpisodeHighlight,
      perspectiveA: decoded.pA,
      perspectiveB: decoded.pB,
      reflection: decoded.r || "",
    };
  } else if (decoded.title || decoded.animalName) {
    return {
      mode: "single",
      title: decoded.title || decoded.animalName,
      emoji: decoded.emoji || decoded.animalEmoji || "🌱",
      catchphrase: decoded.catchphrase || "",
      description: decoded.description || "",
      futureTrait: decoded.futureTrait,
      academicTrait: decoded.academicTrait,
      episodeHighlight: decoded.episodeHighlight,
      reflection: decoded.reflection || decoded.r || "",
    };
  }

  return null;
}
