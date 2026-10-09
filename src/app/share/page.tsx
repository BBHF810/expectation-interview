"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Camera, Heart, Users } from "lucide-react";
import { restoreShareData } from "@/lib/share-code";

function ShareContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("d");

  // デバッグ用ログ出力（iPad の DevConsoleViewer で確認可能）
  React.useEffect(() => {
    if (!rawData) {
      console.warn("[SharePage] URLパラメータ 'd' が指定されていません。URL:", typeof window !== "undefined" ? window.location.href : "");
    } else {
      const result = restoreShareData(rawData);
      if (!result) {
        console.error("[SharePage] 診断データの復元に失敗しました。rawData:", rawData.slice(0, 100));
      } else {
        console.log("[SharePage] 診断データを正常に復元しました:", result.title || result.pairTitle);
      }
    }
  }, [rawData]);

  const parsedData = rawData ? restoreShareData(rawData) : null;

  if (!parsedData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          診断カードが見つかりませんでした
        </h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {!rawData
            ? "URLに診断データが含まれていません。体験完了画面のQRコードまたは「この端末でカードを開く」リンクから開いてみてください。"
            : "診断データの読み込みに問題が発生しました。QRコードをもう一度読み取ってみてください。"}
        </p>
        <div>
          <a
            href="/"
            className="btn btn-primary"
            style={{ display: "inline-flex", padding: "0.6rem 1.5rem", borderRadius: "var(--radius-full)", textDecoration: "none" }}
          >
            対話体験のトップへ
          </a>
        </div>
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
            background: "#FFF7ED",
            border: "1px solid #FFEDD5",
            color: "#C2410C",
            fontSize: "0.85rem",
            fontWeight: 700,
            padding: "0.4rem 1rem",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Sparkles size={16} color="#EA580C" />
          <span>体験記念カード</span>
        </div>
      </div>

      {/* メイン診断カード */}
      <div
        className="card"
        style={{
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          border: "2px solid #FED7AA",
          padding: "2rem 1.5rem",
          textAlign: "center",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 100%)",
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
                background: "#FFF7ED",
                border: "2px solid #FFEDD5",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.12)",
              }}
            >
              {parsedData.emoji || "🌱"}
            </div>

            <div style={{ fontSize: "0.9rem", color: "#EA580C", fontWeight: 700, marginBottom: "0.35rem" }}>
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
                  color: "#C2410C",
                  background: "#FFF7ED",
                  border: "1px solid #FFEDD5",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-block",
                  margin: "0.25rem auto 1.25rem",
                }}
              >
                “{parsedData.catchphrase}”
              </div>
            )}

            {/* 今回語ってくれたエピソードハイライト */}
            {parsedData.episodeHighlight && (
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  margin: "0 0 1.25rem",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748B", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>💬</span>
                  <span>あなたが語ってくれたエピソード</span>
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.5 }}>
                  「{parsedData.episodeHighlight}」
                </div>
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
                  border: "1px solid #F1F5F9",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  margin: "0 0 1.25rem",
                }}
              >
                {parsedData.description}
              </p>
            )}

            {/* 未来の性格・強み */}
            {parsedData.futureTrait && (
              <div
                style={{
                  textAlign: "left",
                  background: "#FFFBEB",
                  border: "1px solid #FEF3C7",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ fontWeight: 800, color: "#B45309", fontSize: "0.9rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>🔮</span>
                  <span>未来の性格・これからの強み</span>
                </div>
                <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "#78350F" }}>
                  {parsedData.futureTrait}
                </div>
              </div>
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
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#EA580C", marginTop: "0.3rem" }}>
                  {parsedData.nameA}さん
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>({parsedData.animalA?.name})</span>
                </div>
              </div>

              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F59E0B" }}>×</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3.2rem", lineHeight: 1 }}>{parsedData.animalB?.emoji || "🦉"}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#C2410C", marginTop: "0.3rem" }}>
                  {parsedData.nameB}さん
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>({parsedData.animalB?.name})</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#EA580C", fontWeight: 700, marginBottom: "0.35rem" }}>
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
                  color: "#C2410C",
                  background: "#FFF7ED",
                  border: "1px solid #FFEDD5",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-block",
                  margin: "0.25rem auto 1.25rem",
                }}
              >
                “{parsedData.pairCatchphrase}”
              </div>
            )}

            {/* ふたりが語ってくれたエピソードハイライト */}
            {parsedData.pairEpisodeHighlight && (
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  margin: "0 0 1.25rem",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748B", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>💬</span>
                  <span>ふたりが語ってくれたエピソード</span>
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.5 }}>
                  「{parsedData.pairEpisodeHighlight}」
                </div>
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
                  border: "1px solid #F1F5F9",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  margin: "0 0 1.25rem",
                }}
              >
                {parsedData.pairDescription}
              </p>
            )}

            {/* ふたりの未来の関係性タイプ */}
            {parsedData.futureRelationship && (
              <div
                style={{
                  textAlign: "left",
                  background: "#FFFBEB",
                  border: "1px solid #FEF3C7",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ fontWeight: 800, color: "#B45309", fontSize: "0.9rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>🚀</span>
                  <span>ふたりの未来の関係性</span>
                </div>
                <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "#78350F" }}>
                  {parsedData.futureRelationship}
                </div>
              </div>
            )}

            {/* ふたりの受け止めまとめ */}
            {(parsedData.perspectiveA || parsedData.perspectiveB) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                  textAlign: "left",
                }}
              >
                {parsedData.perspectiveA && (
                  <div
                    style={{
                      background: "#FFF7ED",
                      border: "1px solid #FED7AA",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#C2410C", marginBottom: "0.2rem" }}>
                      {parsedData.nameA}さんの受け止め
                    </div>
                    <div style={{ color: "var(--color-text-main)" }}>{parsedData.perspectiveA}</div>
                  </div>
                )}
                {parsedData.perspectiveB && (
                  <div
                    style={{
                      background: "#FEFCE8",
                      border: "1px solid #FEF08A",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#A16207", marginBottom: "0.2rem" }}>
                      {parsedData.nameB}さんの受け止め
                    </div>
                    <div style={{ color: "var(--color-text-main)" }}>{parsedData.perspectiveB}</div>
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
              background: "#FAF9F6",
              border: "1px solid #E2E8F0",
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

      {/* スクリーンショット案内（持ち帰り保存） */}
      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          padding: "1.25rem 1rem",
          background: "#FFFBEB",
          border: "2px dashed #FCD34D",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#92400E",
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          <Camera size={22} color="#EA580C" />
          <span>この画面をスクリーンショットして保存してね！📸</span>
        </div>
        <p style={{ margin: 0, fontSize: "0.825rem", color: "#B45309", lineHeight: 1.5 }}>
          ※ このページは展示体験の持ち帰り専用カードです。<br />
          画像として保存しておくと、後からいつでも見返すことができます。
        </p>
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
