import React, { useState } from "react";
import { ExpectationType } from "@/types";
import { ArrowLeft, ArrowRight, Check, Sparkles, HelpCircle } from "lucide-react";

interface ExpectationScreenProps {
  onSelect: (exp: ExpectationType) => void;
  onBack: () => void;
  isSimple: boolean;
}

export const ExpectationScreen: React.FC<ExpectationScreenProps> = ({ onSelect, onBack, isSimple }) => {
  const [selected, setSelected] = useState<ExpectationType | null>(null);

  return (
    <div className="card">
      <h2 className="title">
        {isSimple
          ? "おもっていたことと、じっさいに起きたことは近かったですか？"
          : "あなたの期待と、実際に起きたことは近かったですか？"}
      </h2>
      <p className="subtitle">
        相手に「こうしてほしい」「こうしてくれるかな」と思ったことと、その後の出来事を振り返ってみてください。
      </p>

      {/* 具体例表示カード */}
      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          margin: "1rem 0 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span
            style={{
              padding: "0.2rem 0.5rem",
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            期待どおりの例
          </span>
          <span style={{ fontSize: "0.95rem" }}>
            「話を聞いてほしいと思っていたら、相手が時間をつくってくれた」
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span
            style={{
              padding: "0.2rem 0.5rem",
              background: "var(--color-accent-pink)",
              color: "var(--color-accent-pink-text)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            すれ違いの例
          </span>
          <span style={{ fontSize: "0.95rem" }}>
            「手伝ってほしいと思っていたけれど、相手にはその気持ちが伝わっていなかった」
          </span>
        </div>
      </div>

      <div className="option-grid">
        <button
          type="button"
          onClick={() => setSelected("matched")}
          className={`option-card ${selected === "matched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>期待どおりだった</span>
          {selected === "matched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("mismatched")}
          className={`option-card ${selected === "mismatched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>すれちがった</span>
          {selected === "mismatched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("neutral")}
          className={`option-card ${selected === "neutral" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>どちらともいえない</span>
          {selected === "neutral" && <Check size={22} color="var(--color-primary)" />}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1.5rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          インタビューへ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
