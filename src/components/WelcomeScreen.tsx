import React from "react";
import { User, Users, Sparkles, BookOpen } from "lucide-react";

interface WelcomeScreenProps {
  onStartSingle: () => void;
  onStartPair: () => void;
  onOpenTheory?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSingle,
  onStartPair,
  onOpenTheory,
}) => {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.75rem" }}>
      {/* 研究室・展示バッジ */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            color: "var(--color-primary)",
            fontWeight: 700,
            background: "#FFF7ED",
            border: "1px solid #FFEDD5",
            padding: "0.35rem 0.9rem",
            borderRadius: "var(--radius-full)",
          }}
        >
          <Sparkles size={15} color="var(--color-primary)" />
          <span>工大祭2026 ｜ みらいリビングラボ 特別企画</span>
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          padding: "0.75rem",
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-primary)",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "2.25rem" }}>🛋️</span>
      </div>

      <h1 className="title" style={{ fontSize: "1.875rem", marginBottom: "0.75rem", lineHeight: 1.35 }}>
        AIに話して見つける、
        <br />
        <span style={{ color: "var(--color-primary)" }}>すれ違いのカタチ</span>
      </h1>

      <p className="subtitle" style={{ fontSize: "1.025rem", maxWidth: "520px", margin: "0 auto 1.75rem", lineHeight: 1.6 }}>
        身近な人との最近の出来事やちょっとしたすれ違いをAIとお話ししてみませんか？
        <br />
        対話の最後にお互いの気持ちの受け止めや未来の関係性を<strong>【かわいい動物タイプ】</strong>で楽しく診断します！
        <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          ⏱️ 所要時間：約3分（質問は3つだけ）
        </span>
      </p>

      {/* 体験開始ボタン群 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto 1.75rem" }}>
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
            border: "2px solid #FED7AA",
            backgroundColor: "#FFF7ED",
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

      {/* 論文ベースの学術解説ボタン */}
      {onOpenTheory && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={onOpenTheory}
            style={{
              background: "none",
              border: "1px dashed var(--color-primary-border)",
              color: "var(--color-primary)",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <BookOpen size={16} />
            <span>📘 診断ロジック・研究背景を見る（論文ベース）</span>
          </button>
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
        東京科学大学 中谷桃子研究室（大岡山 西9号館 W9-201）
      </div>
    </div>
  );
};