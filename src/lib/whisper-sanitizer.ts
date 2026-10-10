/**
 * Whisper API の無音・低ノイズハルシネーション（幻覚）サニタイザー
 * 
 * OpenAI whisper-1 は人間の発話がない無音や微小ノイズ入力時に、
 * 学習元データ（YouTube等の動画字幕）に頻出する定番フレーズ
 * （例：「ご視聴ありがとうございました」「チャンネル登録よろしくお願いします」）
 * や、沈黙時に「あ」「はい」「お疲れ様でした」等のノイズを勝手に出力する
 * 既知のバグ・特性があります。
 * 
 * 本モジュールは、既知のハルシネーション定型フレーズを検出し、
 * 通常の回答内容を壊すことなく安全に除去・無効化します。
 */

// 既知のハルシネーション定型表現（正規表現）
const HALLUCINATION_PATTERNS = [
  // ご視聴ありがとうございました系
  /ご視聴(?:いただき)?(?:、)?(?:誠に)?ありがとうございました[。！!]*$/i,
  /^ご視聴(?:いただき)?(?:、)?(?:誠に)?ありがとうございました[。！!]*/i,
  /ご清聴(?:いただき)?(?:、)?ありがとうございました[。！!]*$/i,
  /^ご清聴(?:いただき)?(?:、)?ありがとうございました[。！!]*/i,
  /ご覧いただき(?:、)?ありがとうございました[。！!]*$/i,
  /^ご覧いただき(?:、)?ありがとうございました[。！!]*/i,
  /視聴ありがとうございました[。！!]*$/i,
  /^視聴ありがとうございました[。！!]*/i,
  /最後までご視聴いただき(?:、)?ありがとうございました[。！!]*$/i,
  
  // チャンネル登録系
  /チャンネル登録(?:と高評価)?(?:、)?よろしくお?願いします[。！!]*$/i,
  /チャンネル登録お?願いします[。！!]*$/i,
  /高評価(?:と)?チャンネル登録(?:、)?よろしくお?願いします[。！!]*$/i,
  
  // その他の定番無音ハルシネーション
  /MBCニュースでした[。！!]*$/i,
  /^字幕(?:作成|翻訳)?[：:].*$/i,
  /Thank you for watching[.!]*$/i,
  /^Thank you for watching[.!]*$/i,
  /Thanks for watching[.!]*$/i,
  /^Thanks for watching[.!]*$/i,
];

// 単体で出現した場合に「無音・沈黙時の誤出力」とみなす完全一致フレーズリスト
const FULL_MATCH_HALLUCINATIONS = [
  "ご視聴ありがとうございました",
  "ご視聴ありがとうございました。",
  "ご視聴いただきありがとうございました",
  "ご視聴いただきありがとうございました。",
  "ご視聴いただき、ありがとうございました",
  "ご視聴いただき、ありがとうございました。",
  "ご視聴ありがとうございました！",
  "ご視聴ありがとうございました!",
  "ご清聴ありがとうございました",
  "ご清聴ありがとうございました。",
  "ご覧いただきありがとうございました",
  "ご覧いただきありがとうございました。",
  "視聴ありがとうございました",
  "視聴ありがとうございました。",
  "チャンネル登録よろしくお願いします",
  "チャンネル登録よろしくお願いします。",
  "チャンネル登録をお願いします",
  "チャンネル登録をお願いします。",
  "MBCニュースでした",
  "MBCニュースでした。",
  "Thank you for watching.",
  "Thank you for watching",
  "Thanks for watching.",
  "Thanks for watching",
  "おやすみなさい",
  "おやすみなさい。",
  "お疲れ様でした",
  "お疲れ様でした。",
  "以上です",
  "以上です。",
  // 沈黙時に発生しやすい極短フィラー単体
  "あ",
  "ああ",
  "えー",
  "えっと",
  "ん",
  "うーん",
];

/**
 * Whisper の認識テキストから無音ハルシネーションを安全に除去
 * @param rawText Whisper API から返却された元のテキスト
 * @returns サニタイズされたテキスト（ハルシネーションのみの場合は空文字）
 */
export function sanitizeWhisperTranscript(rawText: string | null | undefined): string {
  if (!rawText) return "";

  let text = rawText.trim();
  if (!text) return "";

  // 1. 句読点・記号のみの場合は無音判定として空文字化
  const withoutPunctuation = text.replace(/^[。、.,!?！？\s]+|[。、.,!?！？\s]+$/g, "");
  if (!withoutPunctuation) {
    return "";
  }

  // 2. 完全一致チェック（前後の句読点を除去した上で比較）
  const normalizedText = text.replace(/[。、.,!?！？\s]/g, "");
  for (const h of FULL_MATCH_HALLUCINATIONS) {
    const normalizedH = h.replace(/[。、.,!?！？\s]/g, "");
    if (normalizedText === normalizedH) {
      return "";
    }
  }

  // 3. 文末・文頭の付着ハルシネーションを除去（通常発話の後ろにくっついた場合）
  let sanitized = text;
  for (const pattern of HALLUCINATION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "").trim();
  }

  // 除去後に残った末尾の不要な句読点・スペースを整形
  sanitized = sanitized.trim();
  if (sanitized === "。" || sanitized === "、" || sanitized === "." || sanitized === ",") {
    return "";
  }

  return sanitized;
}
