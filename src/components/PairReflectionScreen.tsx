"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RotateCcw, CheckCircle2, Sparkles, Camera, ExternalLink } from "lucide-react";
import { PairAnimalDiagnosis } from "@/types";
import { createPairShareUrl } from "@/lib/share-code";

interface PairReflectionScreenProps {
  nameA: string;
  nameB: string;
  perspectiveA: string;
  perspectiveB: string;
  reflection: string;
  pairAnimalDiagnosis: PairAnimalDiagnosis;
  onReset: () => void;
}

export const PairReflectionScreen: React.FC<PairReflectionScreenProps> = ({
  nameA,
  nameB,
  perspectiveA,
  perspectiveB,
  reflection,
  pairAnimalDiagnosis,
  onReset,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    const url = createPairShareUrl({
      pairAnimalDiagnosis,
      nameA,
      nameB,
      perspectiveA,
      perspectiveB,
      reflection,
    });
    setShareUrl(url);

    // ドットが大きく粗く、スマホカメラで一瞬で読み取れる設定
    QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: "L", // 誤り訂正レベルLにすることで最もシンプルなQRコードになる
      color: {
        dark: "#1C1917",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error("QR creation failed", err));
  }, [pairAnimalDiagnosis, nameA, nameB, perspectiveA, perspectiveB, reflection]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "center" }}>
      {/* 完了ヘッダー */}
      <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.5rem",
            background: "#FFF7ED",
            borderRadius: "var(--radius-full)",
            color: "#C2410C",
            marginBottom: "0.5rem",
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 className="title" style={{ marginBottom: "0.35rem", fontSize: "1.5rem" }}>
          ふたりでお話ししてくれてありがとう！🎉
        </h2>
        <p className="subtitle" style={{ margin: 0, fontSize: "0.95rem" }}>
          {nameA}さん、{nameB}さん、ふたりの診断カードが完成しました！スマートフォンのカメラでQRコードを読み取ってご覧ください。
        </p>
      </div>

      {/* メイン：QRコード提示カード */}
      <div
        style={{
          background: "linear-gradient(135deg, #FFFDF9 0%, #FFF7ED 50%, #FEF3C7 100%)",
          border: "2px solid #FED7AA",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.1)",
        }}
      >
        {/* チラ見せバッジ */}
        <div
          style={{
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
              gap: "0.4rem",
              padding: "0.4rem 1.1rem",
              background: "#FFFFFF",
              border: "1px solid #FED7AA",
              borderRadius: "var(--radius-full)",
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#C2410C",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Sparkles size={16} color="#EA580C" />
            <span>
              ふたりのペア：【{pairAnimalDiagnosis.animalA.emoji} × {pairAnimalDiagnosis.animalB.emoji} {pairAnimalDiagnosis.pairTitle}】
            </span>
          </div>
          {pairAnimalDiagnosis.pairEpisodeHighlight && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "#475569",
                background: "#FFFFFF",
                border: "1px dashed #CBD5E1",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-md)",
                maxWidth: "360px",
                lineHeight: 1.4,
              }}
            >
              お話エピソード：「{pairAnimalDiagnosis.pairEpisodeHighlight}」
            </div>
          )}
        </div>

        {/* QRコード表示枠 */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "2px solid #FED7AA",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "260px",
            minHeight: "260px",
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="ふたりの診断結果スマホ持ち帰り用QRコード"
              style={{ width: "260px", height: "260px", display: "block" }}
            />
          ) : (
            <div style={{ padding: "3rem 1rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              QRコード生成中…
            </div>
          )}
        </div>

        {/* 読み取り案内 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#1C1917",
            }}
          >
            <Camera size={20} color="#EA580C" />
            <span>ふたりのスマホでカメラをかざして読み取ってね！</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            「ふたりの未来の関係性」やAIからのメッセージをお手元のスマホで確認・スクショ保存できます📸
          </p>
        </div>

        {/* 混雑緩和バッジ */}
      </div>

      {/* フッターアクション */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", marginTop: "0.25rem" }}>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-primary"
          style={{
            minWidth: "260px",
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: 800,
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
          }}
        >
          <RotateCcw size={20} />
          体験終了（次の人へ・最初に戻る）
        </button>

        {shareUrl && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                textDecoration: "underline",
              }}
            >
              <span>この端末でカードを開く</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};