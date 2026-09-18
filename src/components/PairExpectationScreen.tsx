import React, { useState } from "react";
import { ExpectationType } from "@/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface PairExpectationScreenProps {
  nameA: string;
  nameB: string;
  onSelect: (exp: ExpectationType) => void;
  onBack: () => void;
}

export const PairExpectationScreen: React.FC<PairExpectationScreenProps> = ({
  nameA,
  nameB,
  onSelect,
  onBack,
}) => {
  const [selected, setSelected] = useState<ExpectationType | null>(null);

  return (
    <div className="card">
      <h2 className="title">
        ふたりの間であった最近の出来事について
      </h2>
      <p className="subtitle">
        一緒に出かけたこと、手伝ったこと、連絡のやりとりなど、ふたりの出来事を1つ思い浮かべてみてください。
        <br />
        <strong>そのとき、お互いの期待や気持ちは近かったですか？</strong>
      </p>

      {/* 具体例カード */}
      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          margin: "1rem 0 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ fontSize: "0.9rem" }}>
          💡 <strong>ぴったり合っていた例</strong>：
          「ここに行きたいなと思っていたら、相手も同じ場所を提案してくれた」
        </div>
        <div style={{ fontSize: "0.9rem" }}>
          💡 <strong>すれちがった例</strong>：
          「こうしてくれるかなと期待していたけれど、相手には伝わっていなかった」
        </div>
      </div>

      <div className="option-grid">
        <button
          type="button"
          onClick={() => setSelected("matched")}
          className={`option-card ${selected === "matched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>ぴったり合っていた</span>
          {selected === "matched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("mismatched")}
          className={`option-card ${selected === "mismatched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>少しすれちがった</span>
          {selected === "mismatched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("neutral")}
          className={`option-card ${selected === "neutral" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <span>どちらともいえない・両方あった</span>
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
          ふたりで開始
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};