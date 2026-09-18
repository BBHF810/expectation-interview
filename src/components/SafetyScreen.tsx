import React from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";

interface SafetyScreenProps {
  onReset: () => void;
  isSimple: boolean;
}

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ onReset, isSimple }) => {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
      <div
        style={{
          display: "inline-flex",
          padding: "0.75rem",
          background: "var(--color-accent-pink)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-accent-pink-text)",
          marginBottom: "1.25rem",
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h2 className="title" style={{ marginBottom: "1.25rem" }}>
        {isSimple ? "たいせつなお知らせ" : "ご案内"}
      </h2>

      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.75rem",
          margin: "0 auto 2rem",
          maxWidth: "560px",
          textAlign: "left",
          lineHeight: 1.8,
          fontSize: "1.125rem",
        }}
      >
        {isSimple ? (
          <p>
            話してくれてありがとう。
            <br />
            この画面だけでは、お手伝いできないことがあります。
            <br />
            <strong>近くの大人やスタッフに話してください。</strong>
          </p>
        ) : (
          <p>
            話してくれてありがとうございます。
            <br />
            この体験では十分にお手伝いできない内容かもしれません。
            <br />
            この画面だけで解決しようとせず、
            <strong>信頼できる大人や身近な相談先、展示スタッフに話してください。</strong>
          </p>
        )}
      </div>

      <div>
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
