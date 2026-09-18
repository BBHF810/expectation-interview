import React from "react";
import { RotateCcw, Heart, CheckCircle2, MessageSquareText } from "lucide-react";

interface ReflectionScreenProps {
  expected: string;
  actual: string;
  reflection: string;
  onReset: () => void;
  isSimple: boolean;
}

export const ReflectionScreen: React.FC<ReflectionScreenProps> = ({
  expected,
  actual,
  reflection,
  onReset,
  isSimple,
}) => {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.25rem" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.5rem",
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-full)",
            color: "var(--color-primary)",
            marginBottom: "0.75rem",
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 className="title" style={{ marginBottom: "0.5rem" }}>
          {isSimple ? "対話のふりかえり" : "今回の対話の振り返り"}
        </h2>
        <p className="subtitle" style={{ margin: 0 }}>
          {isSimple
            ? "お話ししてくれてありがとう！あなたのお話を整理しました。"
            : "お話しいただきありがとうございました。お答えいただいた内容を整理したまとめです。"}
        </p>
      </div>

      {/* 期待していたこと & 実際に起きたこと */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div
          style={{
            background: "var(--color-surface-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Heart size={16} />
            {isSimple ? "相手におもっていたこと" : "あなたが期待していたこと"}
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.5 }}>
            {expected || "（回答なし）"}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-surface-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#059669",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <MessageSquareText size={16} />
            {isSimple ? "じっさいに起きたこと" : "実際に起きたこと"}
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.5 }}>
            {actual || "（回答なし）"}
          </p>
        </div>
      </div>

      {/* 今回の振り返り */}
      <div
        style={{
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          border: "1px solid var(--color-primary-border)",
        }}
      >
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "0.75rem",
          }}
        >
          {isSimple ? "今回のふりかえり" : "今回の振り返り"}
        </div>
        <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "var(--color-text-main)" }}>
          {reflection}
        </p>
      </div>

      <div className="banner banner-yellow">
        <span>※ このまとめは性格診断や評価ではありません。回答いただいた内容は終了時に破棄されます。</span>
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-primary"
          style={{ minWidth: "220px", padding: "1rem 2rem" }}
        >
          <RotateCcw size={20} />
          最初からやり直す
        </button>
      </div>
    </div>
  );
};
