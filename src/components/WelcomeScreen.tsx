import React from "react";
import { User, Users, Info } from "lucide-react";

interface WelcomeScreenProps {
  onStartSingle: () => void;
  onStartPair: () => void;
  onOpenConceptExplanation: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSingle,
  onStartPair,
  onOpenConceptExplanation,
}) => {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
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
        <span style={{ fontSize: "2rem" }}>🌱</span>
      </div>

      <h1 className="title" style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        きたいのすれちがい、
        <br />
        AIと話してみよう
      </h1>

      <p className="subtitle" style={{ fontSize: "1.05rem", maxWidth: "540px", margin: "0 auto 1.5rem" }}>
        身近な人に対して「こうしてほしかった」「きっとこうしてくれるだろう」と思ったことを、
        AIといっしょに振り返る工大祭の体験型エピソード収集ブースです。
      </p>

      {/* 相互期待感とは？の解説ボタン */}
      <div style={{ marginBottom: "1.75rem" }}>
        <button
          type="button"
          onClick={onOpenConceptExplanation}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "rgba(14, 165, 233, 0.08)",
            color: "#0284c7",
            border: "1px solid #bae6fd",
            borderRadius: "2rem",
            padding: "0.45rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>📖</span>
          <span>マンガでわかる「相互期待感の一致・不一致」</span>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxWidth: "420px", margin: "0 auto 2rem" }}>
        <button
          type="button"
          onClick={onStartSingle}
          className="btn btn-primary"
          style={{ width: "100%", padding: "1rem" }}
          aria-label="ひとりで体験するを開始"
        >
          <User size={22} />
          ひとりで体験する
        </button>

        <button
          type="button"
          onClick={onStartPair}
          className="btn btn-secondary"
          style={{
            width: "100%",
            padding: "1rem",
            border: "2px solid var(--color-primary-border)",
            backgroundColor: "#EFF6FF",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
          aria-label="ふたりで体験するを開始"
        >
          <Users size={22} />
          ふたりで体験する
        </button>
      </div>

      <div className="banner banner-yellow" style={{ justifyContent: "center", textAlign: "left" }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>※ これは性格や人間関係を診断するものではありません。</span>
      </div>
    </div>
  );
};