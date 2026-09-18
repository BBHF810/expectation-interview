import React from "react";
import { User, Users, Info } from "lucide-react";

interface WelcomeScreenProps {
  onStartSingle: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartSingle }) => {
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

      <h1 className="title" style={{ fontSize: "1.875rem", marginBottom: "1rem" }}>
        きたいのすれちがい、
        <br />
        AIと話してみよう
      </h1>

      <p className="subtitle" style={{ fontSize: "1.125rem", maxWidth: "540px", margin: "0 auto 2rem" }}>
        家族や友だちに「こうしてほしい」と思ったことを、
        <br />
        AIといっしょに振り返る体験です。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "420px", margin: "0 auto 2rem" }}>
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
          disabled
          className="btn btn-secondary"
          style={{ width: "100%", padding: "1rem", opacity: 0.6 }}
          aria-disabled="true"
        >
          <Users size={22} />
          ふたりで体験する（準備中）
        </button>
      </div>

      <div className="banner banner-yellow" style={{ justifyContent: "center", textAlign: "left" }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>※ これは性格や人間関係を診断するものではありません。</span>
      </div>
    </div>
  );
};
