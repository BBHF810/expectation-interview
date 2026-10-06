"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RotateCcw, CheckCircle2, Sparkles, Smartphone, Camera, Copy, Check, Lock, ExternalLink } from "lucide-react";
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
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const url = createSingleShareUrl(animalDiagnosis, reflection);
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
  }, [animalDiagnosis, reflection]);

  const handleCopy = () => {
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
        )}

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
              alt="診断結果スマホ持ち帰り用QRコード"
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
            <span>スマホのカメラをかざして読み取ってね！</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            「未来の性格・強み」やAIからの振り返りをスマホでゆっくり読んだりスクショ保存できます📸
          </p>
        </div>

        {/* プライバシー＆混雑緩和バッジ */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.775rem",
            color: "#78716C",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid #E7E5E4",
          }}
        >
          <Lock size={12} />
          <span>周りの人に見られず、安心してプライベートにご覧いただけます</span>
        </div>
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
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                textDecoration: "underline",
              }}
            >
              {isCopied ? (
                <>
                  <Check size={14} color="#166534" />
                  <span style={{ color: "#166534", fontWeight: 700 }}>リンクをコピーしました！</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>QRが読めない場合はリンクをコピー</span>
                </>
              )}
            </button>
            <span style={{ color: "var(--color-border)" }}>|</span>
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