"use client";

import React, { useState } from "react";
import { X, BookOpen, GitMerge, Compass, Heart, Layers, HelpCircle } from "lucide-react";

interface TheoryExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryExplanationModal: React.FC<TheoryExplanationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"theory" | "process" | "matrix">("theory");

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
          maxWidth: "760px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          padding: "1.75rem",
          background: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
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
            color: "var(--color-text-muted)",
            padding: "0.25rem",
            zIndex: 10,
          }}
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              padding: "0.5rem",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, letterSpacing: "0.05em" }}>
              コミュニケーション研究モデル・理論的背景
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "var(--color-text-main)" }}>
              診断ロジック・学術的背景（スタッフ向け解説）
            </h2>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.4rem",
            marginBottom: "1.25rem",
            background: "#F1F5F9",
            padding: "0.25rem",
            borderRadius: "var(--radius-md)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("theory")}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === "theory" ? "#FFFFFF" : "transparent",
              color: activeTab === "theory" ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: activeTab === "theory" ? "var(--shadow-sm)" : "none",
            }}
          >
            ① 期待不一致理論
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("process")}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === "process" ? "#FFFFFF" : "transparent",
              color: activeTab === "process" ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: activeTab === "process" ? "var(--shadow-sm)" : "none",
            }}
          >
            ② 3問の対話構造
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === "matrix" ? "#FFFFFF" : "transparent",
              color: activeTab === "matrix" ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: activeTab === "matrix" ? "var(--shadow-sm)" : "none",
            }}
          >
            ③ 2軸分類マトリクス
          </button>
        </div>

        {/* タブ1: 期待不一致理論 */}
        {activeTab === "theory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.925rem", lineHeight: 1.65 }}>
            <div
              style={{
                background: "var(--color-primary-light)",
                border: "1px solid var(--color-primary-border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ fontWeight: 800, color: "var(--color-primary)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <GitMerge size={18} />
                <span>期待不一致理論（Expectancy Disconfirmation Theory: Oliver, 1980）</span>
              </div>
              <p style={{ margin: 0, color: "var(--color-text-main)" }}>
                人間関係において生じる「満足」や「すれ違い」は、相手の実際の行動そのものだけでなく、<strong>事前に相手に対して無意識に抱いていた「期待（Expectations）」との差分</strong>によって決定されるという認知理論です。
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <div style={{ fontWeight: 700, color: "#166534", marginBottom: "0.2rem" }}>
                  ✨ 期待の一致（Positive Disconfirmation）
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
                  「こうしてほしい」という思いが相手の行動と重なったとき、深い安心感や感謝、信頼関係の強化が生まれます。
                </p>
              </div>

              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <div style={{ fontWeight: 700, color: "#B45309", marginBottom: "0.2rem" }}>
                  🌱 期待のすれ違い（Negative Disconfirmation）
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#B45309" }}>
                  期待が満たされなかったとき違和感が生じますが、それは<strong>お互いの価値観の違いを認識し、関係をより深めるための健全な契機</strong>でもあります。
                </p>
              </div>
            </div>

            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
              ※ 参考文献: Oliver, R. L. (1980). A Cognitive Model of the Antecedents and Consequences of Satisfaction Decisions. Journal of Marketing Research, 17(4), 460-469.
            </p>
          </div>
        )}

        {/* タブ2: 3問の対話構造 */}
        {activeTab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.925rem", lineHeight: 1.65 }}>
            <p style={{ margin: 0, color: "var(--color-text-main)" }}>
              AIインタビュアーの質問は、心理学における<strong>「認知的再構成（Cognitive Reframing）」</strong>のプロセスに沿って、わずか3問で自然に気づきが得られるよう設計されています。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  background: "#FAF9F6",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <span
                  style={{
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    flexShrink: 0,
                  }}
                >
                  Step 1
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-text-main)" }}>出来事の客観的想起（Event Retrieval）</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    感情に先立ち、「誰と、何があったのか」を言語化することで、記憶の客観的フレームを作ります。
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  background: "#FAF9F6",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <span
                  style={{
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    flexShrink: 0,
                  }}
                >
                  Step 2
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-text-main)" }}>期待と実態の差分抽出（Expectation Gap）</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    「本当はどうしてほしかったか」「何が違ったか」を深掘りし、自分の内側にあった無意識の期待に光を当てます。
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  background: "#FAF9F6",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <span
                  style={{
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    flexShrink: 0,
                  }}
                >
                  Step 3
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-text-main)" }}>感情の受容と未来の関わり方への展望（Future Reframing）</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    湧き上がった感情を肯定し、相手を責めるのではなく「これからの心地よい関わり方のヒント」として昇華します。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブ3: 2軸分類マトリクス */}
        {activeTab === "matrix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.925rem", lineHeight: 1.65 }}>
            <p style={{ margin: 0, color: "var(--color-text-main)" }}>
              動物タイプ診断は、対人相互適応理論（Burgoon et al., 1995）やアタッチメント理論をベースに、<strong>「適応志向（X軸）」×「表現スタイル（Y軸）」</strong>の2軸マトリクスから導出されています。
            </p>

            <div
              style={{
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                background: "#FAF9F6",
              }}
            >
              <div style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                ▲ 能動的・ストレート表出（Active / Direct）
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ background: "#FFFFFF", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🐶 / 🐬</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-text-main)" }}>共感・調和重視 × 能動</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>素直なワンちゃん／共感イルカ</div>
                </div>
                <div style={{ background: "#FFFFFF", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🐧</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-text-main)" }}>協調行動 × タスク共有</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>よりそいペンギン</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div style={{ background: "#FFFFFF", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🐻</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-text-main)" }}>情動包容 × 安定支援</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>ぬくもりクマさん</div>
                </div>
                <div style={{ background: "#FFFFFF", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🐱 / 🦉</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-text-main)" }}>自立・柔軟性重視 × 内省</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>マイペース猫／見守りフクロウ</div>
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary)", marginTop: "0.5rem" }}>
                ▼ 受容的・見守り（Reflective / Supportive）
              </div>
            </div>

            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
              ※ 参考文献: Burgoon, J. K., Stern, L. A., & Dillman, L. (1995). Interpersonal adaptation: Dyadic interaction patterns. Cambridge University Press.
            </p>
          </div>
        )}

        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: "0.6rem 2rem", fontSize: "0.95rem" }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
