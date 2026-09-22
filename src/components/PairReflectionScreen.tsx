import React from "react";
import { RotateCcw, CheckCircle2, Sparkles, Heart, MessageSquareText } from "lucide-react";
import { PairAnimalDiagnosis } from "@/types";

interface PairReflectionScreenProps {
  nameA: string;
  nameB: string;
  perspectiveA: string;
  perspectiveB: string;
  reflection: string;
  pairAnimalDiagnosis: PairAnimalDiagnosis;
  onReset: () => void;
}

export const PairReflectionScreen: React.FC<PairReflectionScreenProps> = ({
  nameA,
  nameB,
  perspectiveA,
  perspectiveB,
  reflection,
  pairAnimalDiagnosis,
  onReset,
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
        <h2 className="title" style={{ marginBottom: "0.4rem" }}>
          ふたりの対話の振り返り
        </h2>
        <p className="subtitle" style={{ margin: 0 }}>
          {nameA}さん、{nameB}さん、ふたりでお話ししてくれてありがとうございました！
        </p>
      </div>

      {/* 🎪 ふたりの動物ペアエンタメ診断カード */}
      <div
        style={{
          background: "linear-gradient(135deg, #FEF9C3 0%, #EFF6FF 50%, #FCE7F3 100%)",
          border: "2px solid #FDE047",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem 1.5rem",
          boxShadow: "var(--shadow-md)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.3rem 1rem",
            background: "#F59E0B",
            color: "#FFFFFF",
            borderRadius: "var(--radius-full)",
            fontSize: "0.9rem",
            fontWeight: 800,
            marginBottom: "1rem",
            boxShadow: "0 2px 6px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Sparkles size={18} />
          工大祭名物！ふたりの動物ペア診断
        </div>

        {/* 2匹の動物並び */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            margin: "0.5rem 0 1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{pairAnimalDiagnosis.animalA.emoji}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1D4ED8", marginTop: "0.25rem" }}>
              {nameA}さん
              <br />
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>({pairAnimalDiagnosis.animalA.name})</span>
            </div>
          </div>

          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F59E0B" }}>×</div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{pairAnimalDiagnosis.animalB.emoji}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#B45309", marginTop: "0.25rem" }}>
              {nameB}さん
              <br />
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>({pairAnimalDiagnosis.animalB.name})</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1E293B", marginBottom: "0.35rem" }}>
          称号: 「{pairAnimalDiagnosis.pairTitle}」
        </h3>

        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "1rem" }}>
          〜 {pairAnimalDiagnosis.pairCatchphrase} 〜
        </div>

        <p
          style={{
            fontSize: "1rem",
            color: "#334155",
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: "0 auto",
            textAlign: "left",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
          }}
        >
          {pairAnimalDiagnosis.pairDescription}
        </p>

        <div style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "0.875rem" }}>
          📸 ふたりの記念にぜひ画面を写真で撮ってくださいね！
        </div>
      </div>

      {/* それぞれの視点 */}
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
              color: "#1D4ED8",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Heart size={16} />
            {nameA}さんから見た思い
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 }}>
            {perspectiveA || "（回答なし）"}
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
              color: "#B45309",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <MessageSquareText size={16} />
            {nameB}さんから見た受け止め
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 }}>
            {perspectiveB || "（回答なし）"}
          </p>
        </div>
      </div>

      {/* ふたりへの振り返りメッセージ */}
      <div
        style={{
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          border: "1px solid var(--color-primary-border)",
        }}
      >
        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.5rem" }}>
          AIからふたりへのメッセージ
        </div>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--color-text-main)", margin: 0 }}>
          {reflection}
        </p>
      </div>

      {/* 診断のエンタメ性 & 研究活用の明示 */}
      <div
        style={{
          background: "#F8FAFC",
          border: "1px solid #CBD5E1",
          borderRadius: "var(--radius-md)",
          padding: "1.1rem 1.25rem",
          fontSize: "0.875rem",
          color: "#334155",
          lineHeight: 1.6,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "#D97706", flexShrink: 0 }}>
            【診断について】
          </span>
          <span>
            ふたりの動物ペア診断は本展示企画用のお楽しみエンタメコンテンツです。医学・心理学・相性の厳密な診断ではありません。
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>
            【研究への活用】
          </span>
          <span>
            本体験で収集された対話・エピソードデータは、個人を特定できない統計・分析データとして「相互期待感の一致・不一致」に関する学術研究に活用させていただきます。
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
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