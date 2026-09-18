"use client";

import React from "react";
import { X, Lightbulb, CheckCircle2, HelpCircle, HeartHandshake, Sparkles } from "lucide-react";

interface ConceptExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptExplanationModal: React.FC<ConceptExplanationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
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
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "1.75rem",
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
          }}
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              backgroundColor: "rgba(14, 165, 233, 0.12)",
              color: "var(--primary-color)",
              padding: "0.6rem",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <Lightbulb size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
              「相互期待感」とは？
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              身近な人とのかかわりの中で生まれる「思い」と「出来事」
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(248, 250, 252, 0.8)",
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--border-color)",
            marginBottom: "1.5rem",
            lineHeight: 1.65,
            fontSize: "0.925rem",
            color: "var(--text-main)",
          }}
        >
          <p style={{ margin: 0, marginBottom: "0.5rem" }}>
            私たちは普段、家族や友人、大切な人に対して、言葉にしなくても
            <strong>「こうしてほしいな」「きっとこうしてくれるだろう」</strong>
            という期待（想い）を抱いて過ごしています。
          </p>
          <p style={{ margin: 0 }}>
            この展示では、その期待が<strong>「ぴったり通じ合った瞬間」</strong>や、少し<strong>「すれ違ってしまった瞬間」</strong>のリアルなエピソードを振り返り、人とのつながりの温かさや多様な感じ方をみんなで集めています。
          </p>
        </div>

        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={18} color="#0284c7" />
          具体エピソードの例
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* 一致（マッチ）の例 */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "rgba(236, 253, 245, 0.7)",
              border: "1px solid #a7f3d0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <CheckCircle2 size={20} color="#059669" />
              <strong style={{ color: "#065f46", fontSize: "0.95rem" }}>
                1. 期待どおりだった（一致した）エピソード
              </strong>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#047857", lineHeight: 1.6, paddingLeft: "1.75rem" }}>
              <p style={{ margin: 0, marginBottom: "0.3rem" }}>
                <strong>【友人との例】</strong>「文化祭の看板作りで、大変なところを手伝ってくれるかなと思っていたら、自分から『ここ塗るよ！』と手伝ってくれて、息ぴったりで完成できてすごく嬉しかった。」
              </p>
              <p style={{ margin: 0 }}>
                <strong>【家族との例】</strong>「テストを頑張った日に、お母さんがショートケーキを買ってきてお祝いしてくれた。」
              </p>
            </div>
          </div>

          {/* 不一致（すれ違い）の例 */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "rgba(254, 242, 242, 0.7)",
              border: "1px solid #fecaca",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <HeartHandshake size={20} color="#dc2626" />
              <strong style={{ color: "#991b1b", fontSize: "0.95rem" }}>
                2. 少しすれ違った（不一致だった）エピソード
              </strong>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#b91c1c", lineHeight: 1.6, paddingLeft: "1.75rem" }}>
              <p style={{ margin: 0, marginBottom: "0.3rem" }}>
                <strong>【友人との例】</strong>「休日に一緒に遊びに行こうと連絡を待っていたが、相手はテスト勉強に集中していて返信がなく、『もっと早く言ってほしかったな』と少し寂しくなった。」
              </p>
              <p style={{ margin: 0 }}>
                <strong>【家族・介護の例】</strong>「疲れているときに声をかけてほしかったけれど、相手も自分のことで忙しくてすれ違ってしまった。」
              </p>
            </div>
          </div>

          {/* どちらともいえない例 */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "rgba(241, 245, 249, 0.8)",
              border: "1px solid #cbd5e1",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <HelpCircle size={20} color="#475569" />
              <strong style={{ color: "#334155", fontSize: "0.95rem" }}>
                3. どちらともいえない（両面あった）エピソード
              </strong>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.6, paddingLeft: "1.75rem" }}>
              <p style={{ margin: 0 }}>
                「プレゼントを渡したら喜んではくれたけれど、本人が本当に欲しかったものとは少し違っていたようで、嬉しさと少し申し訳なさが半々だった。」
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ minWidth: "160px", padding: "0.75rem 1.5rem" }}
          >
            理解できた・閉じる
          </button>
        </div>
      </div>
    </div>
  );
};