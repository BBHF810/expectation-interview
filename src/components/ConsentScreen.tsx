import React, { useState } from "react";
import { Check, ShieldCheck, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

interface ConsentScreenProps {
  onConsent: () => void;
  onBack: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsent, onBack }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="card">
      <h2 className="title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ShieldCheck color="var(--color-primary)" size={28} />
        体験をはじめる前にお読みください
      </h2>

      <p className="subtitle">
        この体験では、Googleの生成AI（Gemini API）を利用して対話を行います。
        安心して体験いただくために、以下の内容をご確認ください。
      </p>

      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          fontSize: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>AIが対話をつくります：</strong>
            入力した内容は、AIが次の質問や最後の振り返りを作成するために使われます。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>外部AIサービスへの送信：</strong>
            入力内容は安全な通信を通じて外部の生成AIサービス（Google Gemini）へ送信されます。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "#e11d48", fontWeight: "bold" }}>●</span>
          <span>
            <strong>個人情報は入力しないでください：</strong>
            お名前、住所、電話番号、学校名などの個人を特定できる情報は書かないようにお願いします。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>研究へのデータ活用について：</strong>
            お話しいただいたエピソードは、お名前や住所などの個人が特定されない形で、「相互期待感（人と人との気持ちや期待の通い合い）」に関する学術研究・分析に大切に活用させていただきます。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>いつでも終了できます：</strong>
            体験の途中でも、いつでも「終了」や「やり直す」ボタンを押してやめることができます。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>診断結果はお楽しみコンテンツです：</strong>
            最後の動物診断などは工大祭展示用のお楽しみエンタメコンテンツです。医学・心理学的な厳密な診断ではありません。
          </span>
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "1rem 1.25rem",
          background: agreed ? "var(--color-primary-light)" : "var(--color-surface)",
          border: agreed ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          marginBottom: "1.5rem",
          transition: "all 0.15s ease",
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{
            width: "22px",
            height: "22px",
            accentColor: "var(--color-primary)",
            cursor: "pointer",
          }}
          aria-label="説明を読み、AIを使った体験を始めます"
        />
        <span style={{ fontWeight: 600, fontSize: "1.0625rem" }}>
          説明を読み、AIを使った体験を始めます
        </span>
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={onConsent}
          disabled={!agreed}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          次へ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
