import React, { useState } from "react";
import { CareStatus } from "@/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface CareScreenProps {
  onSelect: (status: CareStatus) => void;
  onBack: () => void;
  isSimple: boolean;
}

export const CareScreen: React.FC<CareScreenProps> = ({ onSelect, onBack, isSimple }) => {
  const [selected, setSelected] = useState<CareStatus | null>(null);

  const options: Array<{ label: string; hint: string; value: CareStatus }> = [
    { label: "いいえ", hint: "ふだんの日常や思い出の出来事", value: "no" },
    { label: "はい", hint: "ご家族のサポートや介護に関係する出来事", value: "yes" },
    { label: "答えない", hint: "どちらでもよい・未回答", value: "no_answer" },
  ];

  return (
    <div className="card">
      <h2 className="title">
        {isSimple ? "お世話や、介護（かいご）にかんする出来事ですか？" : "振り返る出来事について（任意）"}
      </h2>
      <p className="subtitle">
        {isSimple
          ? "お父さんやお母さん、おじいちゃん・おばあちゃんのお手伝いのお話なら「はい」をえらんでね。"
          : "もしご家族などの日常サポートや介護に関係するお話でしたら教えてください。ふだんの出来事や思い出であれば「いいえ」のままで大丈夫です。"}
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
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginLeft: "0.6rem" }}>
                  （{opt.hint}）
                </span>
              </div>
              {isCurrent && <Check size={22} color="var(--color-primary)" />}
            </button>
          );
        })}
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
          次へ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
