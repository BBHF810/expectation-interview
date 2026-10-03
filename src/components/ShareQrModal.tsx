"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X, Smartphone, Sparkles, Check, Copy } from "lucide-react";

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  title = "診断結果カードをスマホに持ち帰る",
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation failed", err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: "0.25rem",
          }}
          aria-label="閉じる"
        >
          <X size={22} />
        </button>

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.75rem",
          }}
        >
          <Smartphone size={26} />
        </div>

        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 1.25rem" }}>
          スマートフォンのカメラでQRコードを読み取ると、診断結果カードをスマホで保存・シェアできます！
        </p>

        {/* QRコード画像表示 */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "2px solid #E2E8F0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            marginBottom: "1rem",
          }}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="スマホ持ち帰り用QRコード" style={{ width: "220px", height: "220px", display: "block" }} />
          ) : (
            <div style={{ width: "220px", height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              QRコード生成中…
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", width: "100%", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: "0.85rem", padding: "0.5rem" }}
          >
            {isCopied ? <Check size={16} color="green" /> : <Copy size={16} />}
            {isCopied ? "URLをコピーしました" : "リンクをコピー"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: 1, fontSize: "0.85rem", padding: "0.5rem" }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
