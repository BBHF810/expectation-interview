import React, { useState } from "react";
import { AgeGroup, ageToAgeGroup } from "@/types";
import { ArrowLeft, ArrowRight, AlertCircle, Delete, Plus, Minus } from "lucide-react";

interface AgeScreenProps {
  onSelect: (age: number | null, ageGroup: AgeGroup) => void;
  onBack: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ onSelect, onBack }) => {
  const [age, setAge] = useState<number | null>(20); // 来場者に最も多い20歳をデフォルトにして連打負担を軽減
  const [noAnswer, setNoAnswer] = useState(false);

  // 年代クイック選択
  const handleQuickAge = (targetAge: number) => {
    setNoAnswer(false);
    setAge(targetAge);
  };

  // テンキー入力
  const handleKeypadPress = (num: number) => {
    setNoAnswer(false);
    if (age === null) {
      setAge(num);
    } else {
      const newStr = `${age}${num}`;
      const parsed = parseInt(newStr, 10);
      if (parsed <= 120) {
        setAge(parsed);
      }
    }
  };

  // 1文字削除
  const handleBackspace = () => {
    setNoAnswer(false);
    if (age === null) return;
    const str = age.toString();
    if (str.length <= 1) {
      setAge(null);
    } else {
      setAge(parseInt(str.slice(0, -1), 10));
    }
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

      {/* 年代クイックジャンプボタン */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem", textAlign: "center" }}>
          タップして年代をすばやく選択：
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {quickDecades.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => handleQuickAge(d.age)}
              className="btn btn-outline"
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.9rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-primary-border)",
                backgroundColor: !noAnswer && age !== null && Math.floor(age / 10) === Math.floor(d.age / 10)
                  ? "var(--color-primary-light)"
                  : "#FFFFFF",
                fontWeight: 600,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 年齢表示 & 増減コントロール */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          margin: "1rem 0",
        }}
      >
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="btn btn-secondary"
          style={{
            width: "52px",
            height: "52px",
            padding: 0,
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="年齢を1歳減らす"
        >
          <Minus size={24} />
        </button>

        {/* 年齢数値表示枠（ズレのないFlexboxレイアウト） */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0.4rem",
            minWidth: "150px",
            height: "72px",
            padding: "0.5rem 1rem",
            background: noAnswer ? "var(--color-surface-subtle)" : "#FFFFFF",
            border: `2px solid ${
              noAnswer ? "var(--color-border)" : age !== null ? "var(--color-primary)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-md)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: noAnswer ? "var(--color-text-muted)" : "var(--color-text-main)",
              lineHeight: 1,
            }}
          >
            {noAnswer ? "未回答" : age ?? "--"}
          </span>
          {!noAnswer && (
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
            width: "52px",
            height: "52px",
            padding: 0,
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="年齢を1歳増やす"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* タブレット・スマホでも押しやすい画面内テンキー */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          maxWidth: "280px",
          margin: "1rem auto 1.5rem",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="btn"
            style={{
              height: "48px",
              fontSize: "1.25rem",
              fontWeight: 700,
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-main)",
            }}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setNoAnswer(false);
            setAge(null);
          }}
          className="btn"
          style={{
            height: "48px",
            fontSize: "0.85rem",
            fontWeight: 600,
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
          }}
        >
          クリア
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress(0)}
          className="btn"
          style={{
            height: "48px",
            fontSize: "1.25rem",
            fontWeight: 700,
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-main)",
          }}
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="btn"
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
          }}
          aria-label="1文字消去"
        >
          <Delete size={20} />
        </button>
      </div>

      {/* 答えたくないボタン */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={handleNoAnswer}
          className={`option-card ${noAnswer ? "selected" : ""}`}
          style={{
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            fontSize: "0.95rem",
            margin: "0 auto",
          }}
        >
          答えたくない
        </button>
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
