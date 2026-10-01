import React from "react";
import { User, Users, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStartSingle: () => void;
  onStartPair: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSingle,
  onStartPair,
}) => {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.75rem" }}>
      <div
        style={{
          display: "inline-flex",
          padding: "0.75rem",
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-primary)",
          marginBottom: "1.25rem",
        }}
      >
        <span style={{ fontSize: "2.25rem" }}>🌱</span>
      </div>

      <h1 className="title" style={{ fontSize: "1.875rem", marginBottom: "0.75rem", lineHeight: 1.35 }}>
        AIと楽しくおしゃべり！
        <br />
        <span style={{ color: "var(--color-primary)" }}>あなたのコミュニケーション診断</span>
      </h1>

      <p className="subtitle" style={{ fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
        身近な人との最近の出来事をAIとお話ししてみませんか？
        <br />
        対話の最後にお互いの気持ちの通い合い方を<strong>【かわいい動物タイプ】</strong>で楽しく診断します！
        <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          ⏱️ 所要時間：約3分（質問は3つだけ）
        </span>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
        <button
          type="button"
          onClick={onStartSingle}
          className="btn btn-primary"
          style={{ width: "100%", padding: "1.1rem 1rem", fontSize: "1.15rem", borderRadius: "var(--radius-md)" }}
          aria-label="ひとりで体験するを開始"
        >
          <User size={24} />
          ひとりで体験する
        </button>

        <button
          type="button"
          onClick={onStartPair}
          className="btn btn-secondary"
          style={{
            width: "100%",
            padding: "1.1rem 1rem",
            fontSize: "1.15rem",
            border: "2px solid var(--color-primary-border)",
            backgroundColor: "#EFF6FF",
            color: "var(--color-primary)",
            fontWeight: 700,
            borderRadius: "var(--radius-md)",
          }}
          aria-label="ふたりで体験するを開始"
        >
          <Users size={24} />
          ふたりで体験する
        </button>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          background: "var(--color-surface-subtle)",
          padding: "0.4rem 0.85rem",
          borderRadius: "var(--radius-full)",
        }}
      >
        <Sparkles size={16} color="var(--color-primary)" />
        <span>工大祭特別企画・体験型ブース</span>
      </div>
    </div>
  );
};