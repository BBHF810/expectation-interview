import React, { useState } from "react";
import { Check, ShieldCheck, ArrowLeft, ArrowRight, AlertTriangle, HelpCircle, Info } from "lucide-react";

interface ConsentScreenProps {
  onConsent: () => void;
  onBack: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsent, onBack }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="card">
      <h2 className="title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ShieldCheck color="var(--color-primary)" size={28} />
        体験をはじめる前にお読みください
      </h2>

      <p className="subtitle">
        安全に楽しく体験していただくために、以下の内容をご確認ください。
      </p>

      {/* 1. 最重要：個人情報入力禁止の警告（一番目立つ赤色ボックス） */}
      <div
        style={{
          background: "#FEF2F2",
          border: "2px solid #F87171",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
        }}
      >
        <AlertTriangle color="#DC2626" size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "#991B1B", fontSize: "1.05rem", display: "block", marginBottom: "0.25rem" }}>
            【最重要】個人情報は入力・発言しないでください
          </strong>
          <span style={{ color: "#7F1D1D", fontSize: "0.95rem", lineHeight: 1.5 }}>
            本名、フルネーム、住所、電話番号、学校名・会社名など、<strong>個人が特定できる具体的な情報は絶対に話さない（書かない）</strong>ようにお願いいたします。
          </span>
        </div>
      </div>

      {/* 2. やってほしいこと（青色カード） */}
      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
        }}
      >
        <HelpCircle color="#2563EB" size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "#1E40AF", fontSize: "1rem", display: "block", marginBottom: "0.25rem" }}>
            【やってほしいこと】
          </strong>
          <span style={{ color: "#1E3A8A", fontSize: "0.95rem", lineHeight: 1.5 }}>
            友だちやご家族など、身近な人との間で<strong>「嬉しかったこと」</strong>や<strong>「すれ違ったこと」</strong>の最近のエピソードを、AIからの質問（全3問）に合わせて気軽にお話ししてください。
          </span>
        </div>
      </div>

      {/* 3. 安心のためのご案内 */}
      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          fontSize: "0.9rem",
          color: "var(--color-text-main)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>研究へのデータ活用：</strong>
            お話しいただいた内容は、個人を特定できない統計情報として、人と人との気持ちの通い合い（相互期待感）に関する学術研究に活用させていただきます。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>お楽しみコンテンツ：</strong>
            最後の動物タイプ診断は工大祭のお楽しみ企画です。医学・心理学的な診断ではありません。
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>●</span>
          <span>
            <strong>いつでも終了可能：</strong>
            気分が変わったらいつでも「終了」や「最初から」ボタンを押して体験をやめることができます。
          </span>
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "1rem 1.25rem",
          background: agreed ? "var(--color-primary-light)" : "var(--color-surface)",
          border: agreed ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          marginBottom: "1.5rem",
          transition: "all 0.15s ease",
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{
            width: "22px",
            height: "22px",
            accentColor: "var(--color-primary)",
            cursor: "pointer",
          }}
          aria-label="上記の内容を確認し、個人情報を入れずに体験を始めます"
        />
        <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-text-main)" }}>
          上記の内容を確認し、個人情報を入れずに体験を始めます
        </span>
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={onConsent}
          disabled={!agreed}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          次へ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
