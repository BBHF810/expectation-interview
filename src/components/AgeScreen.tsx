import React, { useState } from "react";
import { AgeGroup, ageToAgeGroup } from "@/types";
import { ArrowLeft, ArrowRight, AlertCircle, Plus, Minus } from "lucide-react";

interface AgeScreenProps {
  title?: string;
  subtitle?: string;
  initialAge?: number | null;
  onSelect: (age: number | null, ageGroup: AgeGroup) => void;
  onBack: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({
  title = "あなたの年齢を教えてください",
  subtitle = "あなたに合わせた、話しやすい言葉づかいで質問するために使用します。",
  initialAge = null,
  onSelect,
  onBack,
}) => {
  const [age, setAge] = useState<number | null>(initialAge);
  const [noAnswer, setNoAnswer] = useState(false);

  // 年代クイック選択
  const handleQuickAge = (item: { label: string; age: number }) => {
    setNoAnswer(false);
    if (item.label === "30代以上") {
      setAge(35);
      // 30代以上を選択した場合は細かい年齢調整をスキップして即次へ進む
      onSelect(35, "31_plus");
      return;
    }
    setAge(item.age);
  };

  const handleStep = (delta: number) => {
    setNoAnswer(false);
    setAge((prev) => {
      const current = prev ?? 15;
      // 30歳以上に達した場合は30で止める
      const next = current + delta;
      return Math.min(Math.max(next, 1), 29);
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
      if (age >= 30) {
        onSelect(35, "31_plus");
      } else {
        onSelect(age, ageToAgeGroup(age));
      }
    }
  };

  const canProceed = noAnswer || age !== null;
  const currentAgeGroup = noAnswer ? "no_answer" : (age !== null && age >= 30 ? "31_plus" : ageToAgeGroup(age));

  // 年代選択項目（〜9歳: 5, 10代: 15, 20代: 25, 30代以上: 35）
  const quickDecades = [
    { label: "〜9歳", age: 5 },
    { label: "10代", age: 15 },
    { label: "20代", age: 25 },
    { label: "30代以上", age: 35 },
  ];

  return (
    <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h2 className="title" style={{ textAlign: "center" }}>{title}</h2>
      <p className="subtitle" style={{ textAlign: "center" }}>
        {subtitle}
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
              (d.label === "〜9歳"
                ? age <= 9
                : d.label === "10代"
                ? age >= 10 && age <= 19
                : d.label === "20代"
                ? age >= 20 && age <= 29
                : age >= 30);

            return (
              <button
                key={d.label}
                type="button"
                onClick={() => handleQuickAge(d)}
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
            ? age >= 30
              ? "30代以上は細かい調整は不要です"
              : "＋ / − ボタンで1歳ずつ調整できます"
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
            disabled={age !== null && age >= 30}
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
              opacity: age !== null && age >= 30 ? 0.4 : 1,
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
                fontSize: age !== null && age >= 30 ? "1.85rem" : "2.75rem",
                fontWeight: 800,
                color: noAnswer
                  ? "var(--color-text-muted)"
                  : age !== null
                  ? "var(--color-text-main)"
                  : "#94A3B8",
                lineHeight: 1,
              }}
            >
              {noAnswer ? "未回答" : age !== null && age >= 30 ? "30歳以上" : age ?? "--"}
            </span>
            {!noAnswer && age !== null && age < 30 && (
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
            disabled={age !== null && age >= 30}
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
              opacity: age !== null && age >= 30 ? 0.4 : 1,
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
