"use client";

import React, { useState } from "react";
import { X, Lightbulb, CheckCircle2, HeartHandshake, Sparkles, BookOpen } from "lucide-react";

interface ConceptExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptExplanationModal: React.FC<ConceptExplanationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"matched" | "mismatched">("matched");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "720px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          padding: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "0.25rem",
            zIndex: 10,
          }}
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* タイトル */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div
            style={{
              backgroundColor: "rgba(14, 165, 233, 0.12)",
              color: "var(--primary-color)",
              padding: "0.5rem",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
              マンガでわかる「相互期待感」
            </h2>
            <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-muted)" }}>
              期待が通じ合った瞬間と、ちょっぴりすれ違った瞬間の具体例
            </p>
          </div>
        </div>

        {/* タブ切り替えボタン */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("matched")}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "0.5rem",
              border: activeTab === "matched" ? "2px solid #059669" : "1px solid var(--border-color)",
              backgroundColor: activeTab === "matched" ? "#ecfdf5" : "#f8fafc",
              color: activeTab === "matched" ? "#065f46" : "var(--text-muted)",
              fontWeight: activeTab === "matched" ? 700 : 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <CheckCircle2 size={18} color={activeTab === "matched" ? "#059669" : "#94a3b8"} />
            1. 期待どおり（一致）
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mismatched")}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "0.5rem",
              border: activeTab === "mismatched" ? "2px solid #dc2626" : "1px solid var(--border-color)",
              backgroundColor: activeTab === "mismatched" ? "#fef2f2" : "#f8fafc",
              color: activeTab === "mismatched" ? "#991b1b" : "var(--text-muted)",
              fontWeight: activeTab === "mismatched" ? 700 : 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <HeartHandshake size={18} color={activeTab === "mismatched" ? "#dc2626" : "#94a3b8"} />
            2. すれ違い（不一致）
          </button>
        </div>

        {/* タブ1: 一致マンガ */}
        {activeTab === "matched" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "1px solid #a7f3d0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#f0fdf4",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/matched-comic.jpg"
                alt="お互いの期待が一致したエピソードのマンガ"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                color: "#065f46",
              }}
            >
              <strong>💡 このマンガのポイント（期待の一致）</strong>
              <ul style={{ margin: "0.25rem 0 0 1.25rem", padding: 0 }}>
                <li><strong>抱いた期待:</strong> 「文化祭の看板作り、誰か手伝ってくれたらいいな…」</li>
                <li><strong>実際の出来事:</strong> 友人が笑顔で駆け寄って手伝ってくれた！</li>
                <li><strong>受け止め:</strong> 言葉にしなくても思いが通じ合い、息ぴったりで最高の思い出に！</li>
              </ul>
            </div>
          </div>
        )}

        {/* タブ2: 不一致マンガ */}
        {activeTab === "mismatched" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "1px solid #fecaca",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#fff1f2",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mismatched-comic.jpg"
                alt="お互いの期待がすれ違ったエピソードのマンガ"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                color: "#991b1b",
              }}
            >
              <strong>💡 このマンガのポイント（期待のすれ違い）</strong>
              <ul style={{ margin: "0.25rem 0 0 1.25rem", padding: 0 }}>
                <li><strong>抱いた期待:</strong> 「休日に遊びに誘ってくれるかな…」と連絡を待っていた。</li>
                <li><strong>相手の状況:</strong> 相手はテスト勉強に集中していて、誘う余裕がなかった。</li>
                <li><strong>受け止め:</strong> ちょっぴり寂しかったけれど、悪気があったわけではなくお互いの状況の違い。</li>
              </ul>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ minWidth: "160px", padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}
          >
            閉じて体験にもどる
          </button>
        </div>
      </div>
    </div>
  );
};