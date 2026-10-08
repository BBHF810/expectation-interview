import React, { useState } from "react";
import { AgeGroup, ageToAgeGroup } from "@/types";
import { ArrowLeft, ArrowRight, AlertCircle, Plus, Minus } from "lucide-react";

interface AgeScreenProps {
  onSelect: (age: number | null, ageGroup: AgeGroup) => void;
  onBack: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ onSelect, onBack }) => {
  const [age, setAge] = useState<number | null>(null);
  const [noAnswer, setNoAnswer] = useState(false);

  // 年代クイック選択
  const handleQuickAge = (targetAge: number) => {
    setNoAnswer(false);
    setAge(targetAge);
  };

  const handleStep = (delta: number) => {
    setNoAnswer(false);
    setAge((prev) => {
      const current = prev ?? 20;
      return Math.min(Math.max(current + delta, 1), 120);
    });
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

  const quickDecades = [
    { label: "10代以下", age: 10 },
    { label: "10代", age: 18 },
    { label: "20代", age: 21 },
    { label: "30代", age: 35 },
    { label: "40代", age: 45 },
    { label: "50代〜", age: 55 },
  ];

  return (
    <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h2 className="title" style={{ textAlign: "center" }}>あなたの年齢を教えてください</h2>
      <p className="subtitle" style={{ textAlign: "center" }}>
        あなたに合わせた、話しやすい言葉づかいで質問するために使用します。
      </p>

      {/* 年代ボタン選択 */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "0.6rem", textAlign: "center" }}>
          年代をタップして選択：
        </div>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", maxWidth: "460px", margin: "0 auto" }}>
          {quickDecades.map((d) => {
            const isSelected =
              !noAnswer &&
              age !== null &&
              (d.label === "10代以下"
                ? age <= 10
                : d.label === "50代〜"
                ? age >= 50
                : Math.floor(age / 10) === Math.floor(d.age / 10));

            return (
              <button
                key={d.label}
                type="button"
                onClick={() => handleQuickAge(d.age)}
                className={`btn ${isSelected ? "btn-primary" : "btn-outline"}`}
                style={{
                  padding: "0.55rem 1.1rem",
                  fontSize: "1rem",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  boxShadow: isSelected ? "0 2px 8px rgba(37, 99, 235, 0.25)" : "none",
                }}
              >
                {d.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleNoAnswer}
            className={`btn ${noAnswer ? "btn-primary" : "btn-outline"}`}
            style={{
              padding: "0.55rem 1.1rem",
              fontSize: "1rem",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              color: noAnswer ? "#FFFFFF" : "var(--color-text-muted)",
              borderColor: noAnswer ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            答えない
          </button>
        </div>
      </div>

      {/* 年齢数値表示 & ＋／− 微調整コントロール */}
      <div
        style={{
          background: "#F8FAFC",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: "1.75rem",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textAlign: "center", marginBottom: "0.5rem" }}>
          {age !== null
            ? "＋ / − ボタンで1歳ずつ調整できます"
            : "上の年代を選ぶか、＋ / − で年齢を設定してください"}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="btn btn-secondary"
            style={{
              width: "56px",
              height: "56px",
              padding: 0,
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
            }}
            aria-label="年齢を1歳減らす"
          >
            <Minus size={26} />
          </button>

          {/* 年齢数値表示枠 */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.4rem",
              minWidth: "160px",
              height: "76px",
              padding: "0.5rem 1.25rem",
              background: noAnswer ? "var(--color-surface-subtle)" : "#FFFFFF",
              border: `2px solid ${
                noAnswer
                  ? "var(--color-border)"
                  : age !== null
                  ? "var(--color-primary)"
                  : "var(--color-border)"
              }`,
              borderRadius: "var(--radius-md)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            <span
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: noAnswer
                  ? "var(--color-text-muted)"
                  : age !== null
                  ? "var(--color-text-main)"
                  : "#94A3B8",
                lineHeight: 1,
              }}
            >
              {noAnswer ? "未回答" : age ?? "--"}
            </span>
            {!noAnswer && age !== null && (
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                }}
              >
                歳
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            className="btn btn-secondary"
            style={{
              width: "56px",
              height: "56px",
              padding: 0,
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
            }}
            aria-label="年齢を1歳増やす"
          >
            <Plus size={26} />
          </button>
        </div>
      </div>

      {age !== null && !noAnswer && currentAgeGroup === "under_10" && (
        <div className="banner banner-yellow" style={{ marginBottom: "1.25rem" }}>
          <AlertCircle size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>10さい以下のお子さまへ：</strong>
            <br />
            ほご者の方や、ブースのスタッフといっしょに体験してみてくださいね。
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
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
          次へ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
