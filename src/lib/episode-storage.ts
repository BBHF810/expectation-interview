import { CollectedEpisode } from "@/types";

const STORAGE_KEY = "expectation_episodes_data";

/**
 * ブラウザの localStorage にエピソードを保存し、サーバー側のローカルAPIにも送信
 */
export function saveEpisodeLocally(episode: CollectedEpisode): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getStoredEpisodes();
    // 重複防止（IDベース）
    const filtered = existing.filter((e) => e.id !== episode.id);
    const updated = [episode, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save episode to localStorage:", err);
  }

  // サーバーのローカル永続化エンドポイントへも非同期送信
  try {
    fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(episode),
    }).catch(() => {});
  } catch {
    // サーバーレス環境でのエラーは無視
  }
}

/**
 * 保存されているすべてのエピソードを取得
 */
export function getStoredEpisodes(): CollectedEpisode[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CollectedEpisode[];
  } catch (err) {
    console.warn("Failed to parse episodes from localStorage:", err);
    return [];
  }
}

/**
 * 保存データをすべて消去
 */
export function clearStoredEpisodes(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear episodes from localStorage:", err);
  }
}

/**
 * エピソードデータをJSONファイルとしてダウンロード
 */
export function exportEpisodesAsJson(episodes: CollectedEpisode[]): void {
  const jsonStr = JSON.stringify(episodes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, `expectation_episodes_${getTimestampString()}.json`);
}

/**
 * エピソードデータをCSVファイルとしてダウンロード（Excel用UTF-8 BOM付き）
 */
export function exportEpisodesAsCsv(episodes: CollectedEpisode[]): void {
  const headers = [
    "ID",
    "登録日時",
    "体験モード",
    "相互期待感タイプ",
    "属性A/年代",
    "属性B/相手",
    "関係性/介護有無",
    "期待していたこと(A)",
    "実際の出来事(B)",
    "振り返りまとめ",
    "診断結果",
    "質問1",
    "回答1",
    "質問2",
    "回答2",
    "質問3",
    "回答3",
    "質問4",
    "回答4",
  ];

  const rows = episodes.map((e) => {
    const isSingle = e.mode === "single";
    const expTypeLabel =
      e.expectationType === "matched"
        ? "一致(期待どおり)"
        : e.expectationType === "mismatched"
        ? "不一致(すれ違い)"
        : "どちらともいえない";

    const attrA = isSingle
      ? e.ageGroup === "under_10"
        ? "10歳以下"
        : e.ageGroup === "11_30"
        ? "11〜30歳"
        : e.ageGroup === "31_plus"
        ? "31歳以上"
        : "回答なし"
      : e.nameA || "Aさん";

    const attrB = isSingle ? e.partner || "家族" : e.nameB || "Bさん";

    const relation = isSingle
      ? e.isCare === "yes"
        ? "介護あり"
        : "介護なし"
      : e.relationship || "友だち";

    const expected = isSingle
      ? e.summary.expected || ""
      : e.summary.perspectiveA || "";

    const actual = isSingle
      ? e.summary.actual || ""
      : e.summary.perspectiveB || "";

    const t1 = e.turns[0];
    const t2 = e.turns[1];
    const t3 = e.turns[2];
    const t4 = e.turns[3];

    return [
      e.id,
      new Date(e.createdAt).toLocaleString("ja-JP"),
      isSingle ? "一人体験" : "二人体験",
      expTypeLabel,
      attrA,
      attrB,
      relation,
      expected,
      actual,
      e.summary.reflection,
      e.summary.diagnosisTitle || "",
      t1 ? `[${t1.speaker || "Q1"}] ${t1.question}` : "",
      t1 ? t1.answer : "",
      t2 ? `[${t2.speaker || "Q2"}] ${t2.question}` : "",
      t2 ? t2.answer : "",
      t3 ? `[${t3.speaker || "Q3"}] ${t3.question}` : "",
      t3 ? t3.answer : "",
      t4 ? `[${t4.speaker || "Q4"}] ${t4.question}` : "",
      t4 ? t4.answer : "",
    ].map(escapeCsvCell);
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `expectation_episodes_${getTimestampString()}.csv`);
}

function escapeCsvCell(val: string | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
  return `"${str}"`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestampString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}_${h}${min}${s}`;
}