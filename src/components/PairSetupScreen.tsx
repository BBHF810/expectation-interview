"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Users, Sparkles } from "lucide-react";

interface PairSetupScreenProps {
  initialNameA?: string;
  initialNameB?: string;
  initialRelationship?: string;
  onNext: (nameA: string, nameB: string, relationship: string) => void;
  onBack: () => void;
}

export const PairSetupScreen: React.FC<PairSetupScreenProps> = ({
  initialNameA = "たかし",
  initialNameB = "まさこ",
  initialRelationship = "友だち",
  onNext,
  onBack,
}) => {
  const [nameA, setNameA] = useState(initialNameA);
  const [nameB, setNameB] = useState(initialNameB);
  const [relationship, setRelationship] = useState(initialRelationship);
  const [customRelationship, setCustomRelationship] = useState("");

  const relationshipOptions = [
    "友だち",
    "親子",
    "兄弟",
    "夫婦",
    "恋人",
    "その他",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanA = nameA.trim() || "たかし";
    const cleanB = nameB.trim() || "まさこ";
    const finalRelationship = relationship === "その他"
      ? (customRelationship.trim() || "その他")
      : relationship;
    onNext(cleanA, cleanB, finalRelationship);
  };

  return (
    <div className="card">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.5rem",
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-full)",
            color: "var(--color-primary)",
            marginBottom: "0.5rem",
          }}
        >
          <Users size={30} />
        </div>
        <h2 className="title" style={{ marginBottom: "0.4rem" }}>
          ふたりのことを教えてください
        </h2>
        <p className="subtitle" style={{ margin: 0 }}>
          AIインタビュアーがふたりに呼びかけるニックネームと、ふたりの関係性を設定します。
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ふたりのお名前入力 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div
            style={{
              background: "#EFF6FF",
              border: "2px solid #BFDBFE",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <label
              htmlFor="name-a"
              style={{
                display: "block",
                fontWeight: 700,
                color: "#1D4ED8",
                marginBottom: "0.5rem",
                fontSize: "1rem",
              }}
            >
              👤 ひとりめのニックネーム
            </label>
            <input
              id="name-a"
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value.slice(0, 20))}
              placeholder="例: たろう、あーちゃん"
              required
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "1.05rem",
                fontWeight: 600,
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>

          <div
            style={{
              background: "#FEF3C7",
              border: "2px solid #FDE68A",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <label
              htmlFor="name-b"
              style={{
                display: "block",
                fontWeight: 700,
                color: "#B45309",
                marginBottom: "0.5rem",
                fontSize: "1rem",
              }}
            >
              👤 ふたりめのニックネーム
            </label>
            <input
              id="name-b"
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value.slice(0, 20))}
              placeholder="例: はなこ、いっちゃん"
              required
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "1.05rem",
                fontWeight: 600,
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>
        </div>

        {/* ふたりの関係性 */}
        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            🤝 ふたりの関係性
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            {relationshipOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRelationship(opt)}
                className={`btn ${relationship === opt ? "btn-primary" : "btn-outline"}`}
                style={{
                  padding: "0.6rem 0.5rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {relationship === "その他" && (
            <div style={{ marginTop: "0.75rem" }}>
              <input
                type="text"
                value={customRelationship}
                onChange={(e) => setCustomRelationship(e.target.value.slice(0, 20))}
                placeholder="例: 先輩と後輩、同僚、サークルの仲間"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          )}
        </div>

        {/* 案内バナー */}
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            color: "#166534",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Sparkles size={18} color="#16A34A" style={{ flexShrink: 0 }} />
          <span>
            設定したニックネームでAIが対話を進行し、最後におふたりの関係性診断をお届けします。
          </span>
        </div>

        {/* ナビゲーションボタン */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={onBack} className="btn btn-secondary">
            <ArrowLeft size={20} />
            もどる
          </button>

          <button
            type="submit"
            disabled={!nameA.trim() || !nameB.trim()}
            className="btn btn-primary"
            style={{ minWidth: "160px" }}
          >
            次へ（年齢入力へ）
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};