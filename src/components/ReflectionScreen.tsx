"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RotateCcw, CheckCircle2, Sparkles, Camera, ExternalLink, Maximize2, X } from "lucide-react";
import { AnimalDiagnosis } from "@/types";
import { createSingleShareUrl } from "@/lib/share-code";

interface ReflectionScreenProps {
  expected: string;
  actual: string;
  reflection: string;
  animalDiagnosis?: AnimalDiagnosis;
  onReset: () => void;
  isSimple: boolean;
}

export const ReflectionScreen: React.FC<ReflectionScreenProps> = ({
  expected,
  actual,
  reflection,
  animalDiagnosis,
  onReset,
  isSimple,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isQrZoomed, setIsQrZoomed] = useState<boolean>(false);

  useEffect(() => {
    const url = createSingleShareUrl(animalDiagnosis, reflection);
    setShareUrl(url);

    // 対策1: JIS規格推奨の余白（margin: 4）、完全純黒（#000000）、高解像度（360px）で認識率を最大化
    QRCode.toDataURL(url, {
      width: 360,
      margin: 4,
      errorCorrectionLevel: "L", // 誤り訂正レベルLにすることで最もシンプルなQRコードになる
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error("QR creation failed", err));
  }, [animalDiagnosis, reflection]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "center" }}>
      {/* 完了ヘッダー */}
      <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.5rem",
            background: "#ECFDF5",
            borderRadius: "var(--radius-full)",
            color: "#065F46",
            marginBottom: "0.5rem",
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 className="title" style={{ marginBottom: "0.35rem", fontSize: "1.5rem" }}>
          {isSimple ? "対話クリア！おつかれさまでした！" : "対話完了！ありがとうございました"}
        </h2>
        <p className="subtitle" style={{ margin: 0, fontSize: "0.95rem" }}>
          {isSimple
            ? "あなたの診断結果ができました！下のQRコードをスマホでよみとってね。"
            : "あなた専用の診断カードが完成しました。スマートフォンのカメラでQRコードを読み取ってご覧ください。"}
        </p>
      </div>

      {/* メイン：QRコード提示カード */}
      <div
        style={{
          background: "linear-gradient(180deg, #FFFDF9 0%, #FFF7ED 100%)",
          border: "2px solid #FED7AA",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.08)",
        }}
      >
        {/* チラ見せバッジ */}
        {animalDiagnosis && (
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
                あなたのタイプ：【{animalDiagnosis.animalEmoji} {animalDiagnosis.animalName}】
              </span>
            </div>
            {animalDiagnosis.episodeHighlight && (
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
                お話エピソード：「{animalDiagnosis.episodeHighlight}」
              </div>
            )}
          </div>
        )}

        {/* QRコード表示枠 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <div
            onClick={() => qrDataUrl && setIsQrZoomed(true)}
            role="button"
            tabIndex={0}
            aria-label="QRコードを特大表示"
            style={{
              background: "#FFFFFF",
              padding: "0.6rem",
              borderRadius: "var(--radius-md)",
              border: "2px solid #FED7AA",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "270px",
              minHeight: "270px",
              cursor: qrDataUrl ? "pointer" : "default",
              transition: "transform 0.15s ease",
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="診断結果スマホ持ち帰り用QRコード"
                style={{ width: "270px", height: "270px", display: "block" }}
              />
            ) : (
              <div style={{ padding: "3rem 1rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                QRコード生成中…
              </div>
            )}
          </div>

          {/* 特大拡大ボタン */}
          {qrDataUrl && (
            <button
              type="button"
              onClick={() => setIsQrZoomed(true)}
              className="btn btn-outline"
              style={{
                fontSize: "0.85rem",
                padding: "0.4rem 0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                borderRadius: "var(--radius-full)",
                color: "#C2410C",
                borderColor: "#FED7AA",
                background: "#FFFDF9",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Maximize2 size={15} />
              <span>タップして特大表示する</span>
            </button>
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
            <span>スマホのカメラをかざして読み取ってね！</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            「未来の性格・強み」やAIからの振り返りをスマホでゆっくり読んだりスクショ保存できます📸
          </p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#B45309", fontWeight: 600 }}>
            ※ 読み取りづらい場合はQRコードをタップするか、画面を直接カメラで撮影してもOKです！
          </p>
        </div>
      </div>

      {/* 特大QRコード表示モーダル */}
      {isQrZoomed && qrDataUrl && (
        <div
          onClick={() => setIsQrZoomed(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem 1.5rem",
              maxWidth: "380px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              aria-label="閉じる"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#F3F4F6",
                border: "none",
                borderRadius: "var(--radius-full)",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#4B5563",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "#C2410C",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                <Maximize2 size={18} />
                <span>特大QRコード</span>
              </div>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                スマートフォンのカメラを少し離してかざしてください
              </p>
            </div>

            {/* 特大QRコード画像 */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "0.6rem",
                borderRadius: "var(--radius-md)",
                border: "3px solid #FED7AA",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
              }}
            >
              <img
                src={qrDataUrl}
                alt="特大QRコード"
                style={{
                  width: "290px",
                  height: "290px",
                  maxWidth: "75vw",
                  maxHeight: "75vw",
                  display: "block",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem", fontWeight: 700 }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

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