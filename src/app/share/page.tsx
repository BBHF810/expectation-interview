"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Camera, Heart, Users, Home } from "lucide-react";
import { restoreShareData } from "@/lib/share-code";

function ShareContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("d");

  const parsedData = rawData ? restoreShareData(rawData) : null;

  if (!parsedData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <h2>診断カードが見つかりませんでした</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          QRコードをもう一度読み取ってみてください。
        </p>
      </div>
    );
  }

  const isPair = parsedData.mode === "pair";

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1rem 0.5rem" }}>
      {/* 記念ヘッダーバッジ */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            color: "#1D4ED8",
            fontSize: "0.85rem",
            fontWeight: 700,
            padding: "0.35rem 0.85rem",
            borderRadius: "var(--radius-full)",
          }}
        >
          <Sparkles size={16} />
          <span>工大祭展示・体験記念カード</span>
        </div>
      </div>

      {/* メイン診断カード */}
      <div
        className="card"
        style={{
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "2px solid var(--color-primary-border)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        }}
      >
        {/* 動物アバター */}
        {!isPair ? (
          <>
            <div
              style={{
                width: "100px",
                height: "100px",
                margin: "0 auto 1.25rem",
                background: "var(--color-primary-light)",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)",
              }}
            >
              {parsedData.emoji || "🌱"}
            </div>

            <div style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
              あなたのコミュニケーションタイプ
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem", color: "var(--color-text-main)" }}>
              {parsedData.title}
            </h1>

            {parsedData.catchphrase && (
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#0369A1",
                  background: "#E0F2FE",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-block",
                  margin: "0.5rem auto 1.25rem",
                }}
              >
                “{parsedData.catchphrase}”
              </div>
            )}

            {parsedData.description && (
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-main)",
                  textAlign: "left",
                  background: "#FFFFFF",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #E2E8F0",
                  margin: "0 0 1.5rem",
                }}
              >
                {parsedData.description}
              </p>
            )}
          </>
        ) : (
          <>
            {/* ペア動物表示 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1.25rem",
                margin: "0.5rem 0 1.25rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3.2rem", lineHeight: 1 }}>{parsedData.animalA?.emoji || "🐰"}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1D4ED8", marginTop: "0.3rem" }}>
                  {parsedData.nameA}さん
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>({parsedData.animalA?.name})</span>
                </div>
              </div>

              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F59E0B" }}>×</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3.2rem", lineHeight: 1 }}>{parsedData.animalB?.emoji || "🦉"}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#B45309", marginTop: "0.3rem" }}>
                  {parsedData.nameB}さん
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>({parsedData.animalB?.name})</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#D97706", fontWeight: 700, marginBottom: "0.35rem" }}>
              ふたりの相性・関係性タイプ
            </div>

            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: "0 0 0.5rem", color: "var(--color-text-main)" }}>
              {parsedData.pairTitle || `${parsedData.nameA} & ${parsedData.nameB} ペア`}
            </h1>

            {parsedData.pairCatchphrase && (
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#B45309",
                  background: "#FEF3C7",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-block",
                  margin: "0.5rem auto 1.25rem",
                }}
              >
                “{parsedData.pairCatchphrase}”
              </div>
            )}

            {parsedData.pairDescription && (
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-main)",
                  textAlign: "left",
                  background: "#FFFFFF",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #E2E8F0",
                  margin: "0 0 1.5rem",
                }}
              >
                {parsedData.pairDescription}
              </p>
            )}

            {/* ふたりの受け止めまとめ */}
            {(parsedData.perspectiveA || parsedData.perspectiveB) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                {parsedData.perspectiveA && (
                  <div
                    style={{
                      background: "#EFF6FF",
                      border: "1px solid #DBEAFE",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1D4ED8", marginBottom: "0.2rem" }}>
                      {parsedData.nameA}さんの受け止め
                    </div>
                    <div>{parsedData.perspectiveA}</div>
                  </div>
                )}
                {parsedData.perspectiveB && (
                  <div
                    style={{
                      background: "#FFFBEB",
                      border: "1px solid #FEF3C7",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#B45309", marginBottom: "0.2rem" }}>
                      {parsedData.nameB}さんの受け止め
                    </div>
                    <div>{parsedData.perspectiveB}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 振り返りエピソード */}
        {parsedData.reflection && (
          <div
            style={{
              textAlign: "left",
              background: "#F1F5F9",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              color: "var(--color-text-main)",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
              📖 今回の対話のまとめ
            </div>
            {parsedData.reflection}
          </div>
        )}
      </div>

      {/* スクリーンショット案内 */}
      <div
        style={{
          marginTop: "1.25rem",
          textAlign: "center",
          padding: "0.85rem",
          background: "#FEF9C3",
          border: "1px solid #FDE047",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "#854D0E",
          fontSize: "0.9rem",
          fontWeight: 700,
        }}
      >
        <Camera size={20} />
        <span>この画面をスクリーンショットして保存してね！📸</span>
      </div>

      {/* トップページへ戻る導線 */}
      <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            textDecoration: "underline",
            padding: "0.5rem 1rem",
          }}
        >
          <Home size={16} />
          <span>展示トップページへ（もう一度体験する）</span>
        </a>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "3rem" }}>読み込み中…</div>}>
      <ShareContent />
    </Suspense>
  );
}
