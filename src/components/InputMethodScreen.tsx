import React, { useState } from "react";
import { InputMethod } from "@/types";
import { Mic, Keyboard, ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { unlockAudioOnUserAction } from "@/lib/tts-client";

interface InputMethodScreenProps {
  onSelect: (method: InputMethod) => void;
  onBack: () => void;
}

export const InputMethodScreen: React.FC<InputMethodScreenProps> = ({ onSelect, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>("voice");

  return (
    <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h2 className="title" style={{ textAlign: "center" }}>お話しする方法を選んでください</h2>
      <p className="subtitle" style={{ textAlign: "center" }}>
        AIとのインタビューで使いやすい方法をお選びください。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1.5rem 0 2rem" }}>
        {/* 音声入力オプション */}
        <button
          type="button"
          onClick={() => setSelectedMethod("voice")}
          className={`option-card ${selectedMethod === "voice" ? "selected" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-full)",
                backgroundColor: selectedMethod === "voice" ? "var(--color-primary)" : "var(--color-primary-light)",
                color: selectedMethod === "voice" ? "#FFFFFF" : "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mic size={26} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>声でお話しする</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                  }}
                >
                  おすすめ・簡単
                </span>
              </div>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                マイクボタンを押して喋るだけ！AIが自動で聞き取ります。
              </p>
            </div>
          </div>
          {selectedMethod === "voice" && <Check size={24} color="var(--color-primary)" />}
        </button>

        {/* キーボード入力オプション */}
        <button
          type="button"
          onClick={() => setSelectedMethod("text")}
          className={`option-card ${selectedMethod === "text" ? "selected" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-full)",
                backgroundColor: selectedMethod === "text" ? "var(--color-primary)" : "var(--color-surface-subtle)",
                color: selectedMethod === "text" ? "#FFFFFF" : "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Keyboard size={26} />
            </div>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>文字で入力する</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                キーボードやフリック入力で文章を打ち込んで答えます。
              </p>
            </div>
          </div>
          {selectedMethod === "text" && <Check size={24} color="var(--color-primary)" />}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={() => {
            unlockAudioOnUserAction();
            onSelect(selectedMethod);
          }}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          インタビュー開始
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
