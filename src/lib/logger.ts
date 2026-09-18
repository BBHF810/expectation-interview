import crypto from "crypto";

export interface SafeLogEntry {
  requestId: string;
  endpoint: string;
  status: "success" | "error" | "fallback";
  durationMs: number;
  model: string;
  fallbackUsed: boolean;
  errorType?: string;
}

/**
 * プライバシー保護ロガー
 * 回答本文、個人情報、プロンプト本文は一切出力しません。
 * 統計・運用に必要な最小限のメトリクスのみを出力します。
 */
export function logSafeRequest(entry: SafeLogEntry): void {
  const sanitized = {
    timestamp: new Date().toISOString(),
    requestId: entry.requestId,
    endpoint: entry.endpoint,
    status: entry.status,
    durationMs: entry.durationMs,
    model: entry.model,
    fallbackUsed: entry.fallbackUsed,
    errorType: entry.errorType || null,
  };

  // 構造化JSON形式で標準出力（回答本文は含まれない）
  console.log(JSON.stringify(sanitized));
}

export function generateRequestId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 12);
}
