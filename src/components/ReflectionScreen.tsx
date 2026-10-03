import React, { useState } from "react";
import { RotateCcw, Heart, CheckCircle2, MessageSquareText, Sparkles, Share2, Smartphone } from "lucide-react";
import { AnimalDiagnosis } from "@/types";
import { ShareQrModal } from "./ShareQrModal";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const shareData = {
      mode: "single",
      title: animalDiagnosis?.animalName || "コミュニケーション診断",
      emoji: animalDiagnosis?.animalEmoji || "🌱",
      catchphrase: animalDiagnosis?.catchphrase || "",
      description: animalDiagnosis?.description || "",
      reflection,
    };
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      return `${window.location.origin}/share?d=${encoded}`;
    } catch (e) {
      return window.location.href;
    }
  };
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.25rem" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.5rem",
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-full)",
            color: "var(--color-primary)",
            marginBottom: "0.75rem",
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 className="title" style={{ marginBottom: "0.5rem" }}>
          {isSimple ? "対話のふりかえり" : "今回の対話の振り返り"}
        </h2>
        <p className="subtitle" style={{ margin: 0 }}>
          {isSimple
            ? "お話ししてくれてありがとう！あなたのお話を整理しました。"
            : "お話しいただきありがとうございました。お答えいただいた内容を整理したまとめです。"}
        </p>
      </div>

      {/* 動物に例えるエンタメ関係性診断カード（広告・記念用） */}
      {animalDiagnosis && (
        <div
          style={{
            background: "linear-gradient(135deg, #FEF9C3 0%, #EFF6FF 100%)",
            border: "2px solid #FDE047",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-md)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.85rem",
              background: "#F59E0B",
              color: "#FFFFFF",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 800,
              marginBottom: "0.75rem",
              boxShadow: "0 2px 6px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Sparkles size={16} />
            工大祭お楽しみエンタメ診断
          </div>

          <div style={{ fontSize: "3.75rem", margin: "0.25rem 0", lineHeight: 1 }}>
            {animalDiagnosis.animalEmoji}
          </div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#1E293B",
              marginBottom: "0.35rem",
            }}
          >
            あなたの関わり方は「{animalDiagnosis.animalName}」
          </h3>

          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              marginBottom: "0.875rem",
            }}
          >
            〜 {animalDiagnosis.catchphrase} 〜
          </div>

          <p
            style={{
              fontSize: "1.05rem",
              color: "#334155",
              lineHeight: 1.6,
              maxWidth: "540px",
              margin: "0 auto",
              textAlign: "left",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "0.875rem 1.25rem",
              borderRadius: "var(--radius-md)",
            }}
          >
            {animalDiagnosis.description}
          </p>

          <div
            style={{
              fontSize: "0.8rem",
              color: "#64748B",
              marginTop: "0.75rem",
            }}
          >
            📸 画面を写真に撮って記念にシェアしてみてくださいね！
          </div>
        </div>
      )}

      {/* 期待していたこと & 実際に起きたこと */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div
          style={{
            background: "var(--color-surface-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Heart size={16} />
            {isSimple ? "相手におもっていたこと" : "あなたが期待していたこと"}
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.5 }}>
            {expected || "（回答なし）"}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-surface-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#059669",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <MessageSquareText size={16} />
            {isSimple ? "じっさいに起きたこと" : "実際に起きたこと"}
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.5 }}>
            {actual || "（回答なし）"}
          </p>
        </div>
      </div>

      {/* 今回の振り返り */}
      <div
        style={{
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          border: "1px solid var(--color-primary-border)",
        }}
      >
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "0.75rem",
          }}
        >
          {isSimple ? "今回のふりかえり" : "今回の振り返り"}
        </div>
        <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "var(--color-text-main)" }}>
          {reflection}
        </p>
      </div>

      {/* 診断のエンタメ性 & 研究活用の明示 */}
      <div
        style={{
          background: "#F8FAFC",
          border: "1px solid #CBD5E1",
          borderRadius: "var(--radius-md)",
          padding: "1.1rem 1.25rem",
          fontSize: "0.875rem",
          color: "#334155",
          lineHeight: 1.6,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "#D97706", flexShrink: 0 }}>
            【診断について】
          </span>
          <span>
            {isSimple
              ? "動物診断は工大祭のお楽しみエンタメコンテンツです。医学・心理学的な診断ではありません。"
              : "動物診断は本展示企画用のお楽しみエンタメコンテンツです。医学・心理学・性格の厳密な診断ではありません。"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>
            【研究への活用】
          </span>
          <span>
            {isSimple
              ? "お話しいただいたエピソードは、だれが書いたかわからない形にして「期待や気持ちの一致・不一致」についての研究に大切に使わせていただきます。"
              : "本体験で収集された対話・エピソードデータは、個人を特定できない統計・分析データとして「相互期待感の一致・不一致」に関する学術研究に活用させていただきます。"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="btn"
          style={{
            minWidth: "240px",
            padding: "0.9rem 1.5rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
            color: "#FFFFFF",
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
          }}
        >
          <Smartphone size={20} />
          結果をスマホに持ち帰る（QR）
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          style={{ minWidth: "200px" }}
        >
          <RotateCcw size={18} />
          最初からやり直す
        </button>
      </div>

      <ShareQrModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={getShareUrl()}
        title={`${animalDiagnosis?.animalName || "診断結果"} をスマホに保存`}
      />
    </div>
  );
};