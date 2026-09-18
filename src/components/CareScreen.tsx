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

  const options: Array<{ label: string; value: CareStatus }> = [
    { label: "はい", value: "yes" },
    { label: "いいえ", value: "no" },
    { label: "答えたくない", value: "no_answer" },
  ];

  return (
    <div className="card">
      <h2 className="title">
        {isSimple ? "お世話や、介護（かいご）にかんする出来事ですか？" : "介護に関する出来事ですか？"}
      </h2>
      <p className="subtitle">
        ご家族のお世話や日常的なサポートに関する出来事かどうかをお答えください。
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
              <span>{opt.label}</span>
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
