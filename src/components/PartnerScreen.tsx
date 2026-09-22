import React, { useState } from "react";
import { PartnerType } from "@/types";
import { ArrowLeft, ArrowRight, Check, Users } from "lucide-react";

interface PartnerScreenProps {
  onSelect: (partnerLabel: string) => void;
  onBack: () => void;
  isSimple: boolean;
}

export const PartnerScreen: React.FC<PartnerScreenProps> = ({ onSelect, onBack, isSimple }) => {
  const [type, setType] = useState<PartnerType | null>(null);
  const [customName, setCustomName] = useState("");

  const options: Array<{ label: string; value: PartnerType; hint: string }> = [
    {
      label: "友だち",
      value: "friend",
      hint: isSimple ? "学校の友だち など" : "友人・知人 など",
    },
    {
      label: isSimple ? "おやこ" : "親子",
      value: "parent_child",
      hint: isSimple ? "お父さん・お母さん など" : "親・子ども など",
    },
    {
      label: isSimple ? "きょうだい" : "兄弟",
      value: "sibling",
      hint: isSimple ? "お兄ちゃん・妹 など" : "兄弟姉妹 など",
    },
    {
      label: "夫婦",
      value: "spouse",
      hint: "夫・妻 など",
    },
    {
      label: "恋人",
      value: "lover",
      hint: isSimple ? "たいせつな人 など" : "お付き合いしている方 など",
    },
    {
      label: "その他",
      value: "other",
      hint: "先生・同僚・先輩 など",
    },
  ];

  const handleNext = () => {
    if (!type) return;
    if (type === "other") {
      onSelect(customName.trim() || "その他の方");
    } else {
      const match = options.find((o) => o.value === type);
      onSelect(match ? match.label : "相手");
    }
  };

  return (
    <div className="card">
      <h2 className="title">
        {isSimple ? "だれとの出来事を話しますか？" : "だれとの出来事を振り返りますか？"}
      </h2>
      <p className="subtitle">
        思い浮かべる相手をひとり選んでください。
      </p>

      <div className="option-grid">
        {options.map((opt) => {
          const isCurrent = type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`option-card ${isCurrent ? "selected" : ""}`}
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <span style={{ fontSize: "1.125rem", fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginLeft: "0.75rem" }}>
                  （{opt.hint}）
                </span>
              </div>
              {isCurrent && <Check size={22} color="var(--color-primary)" />}
            </button>
          );
        })}
      </div>

      {type === "other" && (
        <div style={{ margin: "1rem 0 1.5rem" }}>
          <label htmlFor="custom-partner" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            {isSimple ? "相手のよびかた（任意）" : "相手の呼び方・関係性（任意・50文字以内）"}
          </label>
          <input
            id="custom-partner"
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value.slice(0, 50))}
            placeholder="例：先生、職場の先輩、いとこ など"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--color-border)",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1.5rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!type}
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