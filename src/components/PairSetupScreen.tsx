"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Users, Sparkles } from "lucide-react";

interface PairSetupScreenProps {
  onNext: (nameA: string, nameB: string, relationship: string) => void;
  onBack: () => void;
}

export const PairSetupScreen: React.FC<PairSetupScreenProps> = ({ onNext, onBack }) => {
  const [nameA, setNameA] = useState("Aさん");
  const [nameB, setNameB] = useState("Bさん");
  const [relationship, setRelationship] = useState("友だち");

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
    const cleanA = nameA.trim() || "Aさん";
    const cleanB = nameB.trim() || "Bさん";
    onNext(cleanA, cleanB, relationship);
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* ふたりのお名前入力 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div
            style={{
              background: "#EFF6FF",
              border: "2px solid #BFDBFE",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}
          >
            <label
              htmlFor="name-a"
              style={{
                display: "block",
                fontWeight: 700,
                color: "#1D4ED8",
                marginBottom: "0.5rem",
                fontSize: "0.95rem",
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
                padding: "0.6rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            />
          </div>

          <div
            style={{
              background: "#FEF3C7",
              border: "2px solid #FDE68A",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}
          >
            <label
              htmlFor="name-b"
              style={{
                display: "block",
                fontWeight: 700,
                color: "#B45309",
                marginBottom: "0.5rem",
                fontSize: "0.95rem",
              }}
            >
              👤 ふたりめのニックネーム
            </label>
            <input
              id="name-b"
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value.slice(0, 20))}
              placeholder="例: はなこ、はーちゃん"
              required
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* 関係性の選択 */}
        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.95rem" }}>
            ふたりのご関係
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
            {relationshipOptions.map((opt) => {
              const isSelected = relationship === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRelationship(opt)}
                  className="btn"
                  style={{
                    minHeight: "44px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.9rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-surface-subtle)",
                    color: isSelected ? "#FFFFFF" : "var(--color-text-main)",
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1rem" }}>
          <button type="button" onClick={onBack} className="btn btn-secondary">
            <ArrowLeft size={20} />
            もどる
          </button>

          <button type="submit" className="btn btn-primary" style={{ minWidth: "160px" }}>
            次へ
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};