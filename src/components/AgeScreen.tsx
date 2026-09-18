import React, { useState } from "react";
import { AgeGroup } from "@/types";
import { ArrowLeft, ArrowRight, AlertCircle, Check } from "lucide-react";

interface AgeScreenProps {
  onSelect: (age: AgeGroup) => void;
  onBack: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState<AgeGroup | null>(null);

  const options: Array<{ label: string; value: AgeGroup; desc?: string }> = [
    { label: "10歳以下", value: "under_10", desc: "小学生以下の方" },
    { label: "11〜30歳", value: "11_30", desc: "中高生・大学生・若者" },
    { label: "31歳以上", value: "31_plus", desc: "大人・シニアの方" },
    { label: "答えたくない", value: "no_answer", desc: "" },
  ];

  return (
    <div className="card">
      <h2 className="title">あなたの年齢層を教えてください</h2>
      <p className="subtitle">
        あなたに合わせた、話しやすい言葉づかいで質問するために使用します。
      </p>

      <div className="option-grid">
        {options.map((opt) => {
          const isCurrent = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`option-card ${isCurrent ? "selected" : ""}`}
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <span style={{ fontSize: "1.125rem" }}>{opt.label}</span>
                {opt.desc && (
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginLeft: "0.75rem" }}>
                    {opt.desc}
                  </span>
                )}
              </div>
              {isCurrent && <Check size={22} color="var(--color-primary)" />}
            </button>
          );
        })}
      </div>

      {selected === "under_10" && (
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
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
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
