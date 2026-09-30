import React, { useState } from "react";
import { AgeGroup, ageToAgeGroup } from "@/types";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

interface AgeScreenProps {
  onSelect: (age: number | null, ageGroup: AgeGroup) => void;
  onBack: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ onSelect, onBack }) => {
  const [age, setAge] = useState<number | null>(null);
  const [noAnswer, setNoAnswer] = useState(false);

  const handleAgeChange = (value: string) => {
    setNoAnswer(false);
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setAge(null);
    } else {
      setAge(Math.min(Math.max(num, 1), 120));
    }
  };

  const handleNoAnswer = () => {
    setNoAnswer(true);
    setAge(null);
  };

  const handleNext = () => {
    if (noAnswer) {
      onSelect(null, "no_answer");
    } else if (age !== null) {
      onSelect(age, ageToAgeGroup(age));
    }
  };

  const canProceed = noAnswer || age !== null;
  const currentAgeGroup = noAnswer ? "no_answer" : ageToAgeGroup(age);

  return (
    <div className="card">
      <h2 className="title">あなたの年齢を教えてください</h2>
      <p className="subtitle">
        あなたに合わせた、話しやすい言葉づかいで質問するために使用します。
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          margin: "1.5rem 0",
        }}
      >
        {/* 年齢数値入力 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setNoAnswer(false);
              setAge((prev) => Math.max((prev ?? 20) - 1, 1));
            }}
            className="btn btn-secondary"
            style={{
              width: "52px",
              height: "52px",
              padding: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="年齢を1歳減らす"
          >
            −
          </button>

          <div style={{ position: "relative" }}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={noAnswer ? "" : (age ?? "")}
              onChange={(e) => handleAgeChange(e.target.value)}
              onFocus={() => setNoAnswer(false)}
              placeholder="--"
              style={{
                width: "100px",
                height: "64px",
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                border: `2px solid ${
                  noAnswer ? "var(--color-border)" : age !== null ? "var(--color-primary)" : "var(--color-border)"
                }`,
                outline: "none",
                color: noAnswer ? "var(--color-text-muted)" : "var(--color-text)",
                background: noAnswer ? "var(--color-surface-subtle)" : "#fff",
                transition: "all 0.15s ease",
                MozAppearance: "textfield",
              }}
              aria-label="年齢を入力"
            />
            <span
              style={{
                position: "absolute",
                right: "-32px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              歳
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setNoAnswer(false);
              setAge((prev) => Math.min((prev ?? 20) + 1, 120));
            }}
            className="btn btn-secondary"
            style={{
              width: "52px",
              height: "52px",
              padding: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="年齢を1歳増やす"
          >
            ＋
          </button>
        </div>

        {/* 答えないオプション */}
        <button
          type="button"
          onClick={handleNoAnswer}
          className={`option-card ${noAnswer ? "selected" : ""}`}
          style={{
            maxWidth: "280px",
            padding: "0.75rem 1.5rem",
            textAlign: "center",
          }}
        >
          答えたくない
        </button>
      </div>

      {age !== null && !noAnswer && currentAgeGroup === "under_10" && (
        <div className="banner banner-yellow" style={{ marginBottom: "1.5rem" }}>
          <AlertCircle size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>10さい以下のお子さまへ：</strong>
            <br />
            ほご者の方や、ブースのスタッフといっしょに体験してみてくださいね。
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          インタビューへ
          <ArrowRight size={20} />
        </button>
      </div>

      {/* number input spinnerを非表示にするCSS */}
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};
