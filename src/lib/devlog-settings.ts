"use client";

export const DEVLOG_VISIBLE_STORAGE_KEY = "expectation_devlog_button_visible";
export const DEVLOG_VISIBILITY_EVENT = "devlog-visibility-change";

/**
 * 画面右下の DevLog ボタンが表示設定になっているかを取得
 * （展示会・本番運用での一般来場者体験を損なわないため、デフォルトは非表示）
 */
export function getDevLogButtonVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(DEVLOG_VISIBLE_STORAGE_KEY);
    if (saved === null) {
      return false; // デフォルト非表示
    }
    return saved === "true";
  } catch {
    return false;
  }
}

/**
 * DevLog ボタンの表示・非表示を保存し、アプリ全体にイベントを通知
 */
export function setDevLogButtonVisible(visible: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEVLOG_VISIBLE_STORAGE_KEY, String(visible));
    window.dispatchEvent(
      new CustomEvent(DEVLOG_VISIBILITY_EVENT, { detail: visible })
    );
  } catch (e) {
    console.error("Failed to save DevLog button visibility setting:", e);
  }
}
