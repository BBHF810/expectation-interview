import React, { useState } from "react";
import { PartnerType } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Smile,
  Baby,
  Users,
  House,
  Heart,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

interface PartnerScreenProps {
  onSelect: (partnerLabel: string) => void;
  onBack: () => void;
  isSimple: boolean;
}

export const PartnerScreen: React.FC<PartnerScreenProps> = ({ onSelect, onBack, isSimple }) => {
  const [type, setType] = useState<PartnerType | null>(null);
  const [customName, setCustomName] = useState("");

  const options: Array<{ label: string; value: PartnerType; hint?: string; icon: LucideIcon }> = [
    {
      label: "友だち",
      value: "friend",
      icon: Smile,
    },
    {
      label: isSimple ? "おやこ" : "親子",
      value: "parent_child",
      icon: Baby,
    },
    {
      label: isSimple ? "きょうだい" : "兄弟",
      value: "sibling",
      icon: Users,
    },
    {
      label: "夫婦",
      value: "spouse",
      icon: House,
    },
    {
      label: "恋人",
      value: "lover",
      icon: Heart,
    },
    {
      label: "その他",
      value: "other",
      hint: "先生・同僚・先輩 など",
      icon: MoreHorizontal,
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
          const IconComponent = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`option-card ${isCurrent ? "selected" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-full)",
                    background: isCurrent ? "var(--color-primary)" : "var(--color-primary-light)",
                    color: isCurrent ? "#FFFFFF" : "var(--color-primary)",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <div>
                  <span style={{ fontSize: "1.125rem", fontWeight: 600 }}>{opt.label}</span>
                  {opt.hint && (
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginLeft: "0.6rem" }}>
                      （{opt.hint}）
                    </span>
                  )}
                </div>
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