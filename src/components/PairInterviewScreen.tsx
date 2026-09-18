"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, RotateCcw, XCircle, Loader2, AlertCircle, Volume2, VolumeX, User } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { VoiceInput } from "./VoiceInput";

interface PairInterviewScreenProps {
  currentQuestion: string;
  currentSpeaker: "A" | "B";
  currentSpeakerName: string;
  progress: number;
  isLoading: boolean;
  fallbackUsed: boolean;
  onSubmitAnswer: (answer: string, isSkipped: boolean) => void;
  onFinishEarly: () => void;
  onReset: () => void;
  onOpenConceptExplanation?: () => void;
}

export const PairInterviewScreen: React.FC<PairInterviewScreenProps> = ({
  currentQuestion,
  currentSpeaker,
  currentSpeakerName,
  progress,
  isLoading,
  fallbackUsed,
  onSubmitAnswer,
  onFinishEarly,
  onReset,
  onOpenConceptExplanation,
}) => {
  const [answer, setAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  useEffect(() => {
    setAnswer("");
  }, [currentQuestion, currentSpeaker]);

  // 新しい質問の音声読み上げ
  useEffect(() => {
    if (!currentQuestion || isLoading || !isSpeechEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, isLoading, isSpeechEnabled]);

  let avatarStatus: AvatarStatus = "idle";
  if (isLoading) {
    avatarStatus = "thinking";
  } else if (isSpeaking) {
    avatarStatus = "speaking";
  } else if (isListening) {
    avatarStatus = "listening";
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isLoading) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onSubmitAnswer(answer.trim(), false);
  };

  const handleSkip = () => {
    if (isLoading) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onSubmitAnswer("（スキップ）", true);
  };

  const isSpeakerA = currentSpeaker === "A";

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* 上部ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            ふたりで体験中（質問 {progress} / 3）
          </span>
          {fallbackUsed && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              （用意された質問で進行中）
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              if (isSpeaking && typeof window !== "undefined") {
                window.speechSynthesis.cancel();
              }
              setIsSpeechEnabled(!isSpeechEnabled);
            }}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.6rem" }}
            title={isSpeechEnabled ? "音声をミュート" : "音声をオン"}
          >
            {isSpeechEnabled ? <Volume2 size={18} color="var(--color-primary)" /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={onFinishEarly}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
          >
            <XCircle size={16} />
            終了
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
          >
            <RotateCcw size={16} />
            やり直す
          </button>
        </div>
      </div>

      {/* アバター */}
      <div style={{ margin: "0.25rem 0" }}>
        <InterviewerAvatar status={avatarStatus} size={120} />
      </div>

      {/* 誰の番かを示すターンバナー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.6rem 1.2rem",
          borderRadius: "var(--radius-full)",
          background: isSpeakerA ? "#EFF6FF" : "#FEF3C7",
          border: isSpeakerA ? "2px solid #3B82F6" : "2px solid #F59E0B",
          color: isSpeakerA ? "#1D4ED8" : "#B45309",
          fontWeight: 800,
          fontSize: "1.1rem",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <User size={20} />
        <span>いまは【 {currentSpeakerName} 】のお返事タイムです！</span>
      </div>

      {/* AI質問吹き出し */}
      <div
        style={{
          background: "var(--color-primary-light)",
          border: "2px solid var(--color-primary-border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          boxShadow: "var(--shadow-sm)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
          AIインタビュアーからの質問
        </div>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)", lineHeight: 1.5, margin: 0 }}>
          {currentQuestion}
        </p>
      </div>

      {/* ローディングまたは入力フォーム */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "0.75rem" }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
            ふたりのお返事をAIがじっくり考えています…
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* 音声入力コンポーネント */}
          <div
            style={{
              background: isSpeakerA ? "#F8FAFC" : "#FFFBEB",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              🎙️ {currentSpeakerName}、声でお話しください
            </div>
            <VoiceInput
              currentText={answer}
              onTranscriptChange={(newText) => setAnswer(newText)}
              onListeningStateChange={(active) => setIsListening(active)}
              disabled={isLoading}
            />
          </div>

          <div>
            <textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
              placeholder={`${currentSpeakerName}の声がここに文字起こしされます。キーボード入力や修正もOKです。`}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--color-border)",
                resize: "vertical",
                minHeight: "75px",
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ fontSize: "0.95rem", minHeight: "44px" }}
              >
                スキップ
              </button>
              {onOpenConceptExplanation && (
                <button
                  type="button"
                  onClick={onOpenConceptExplanation}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    backgroundColor: "transparent",
                    color: "var(--color-primary)",
                    border: "1px dashed var(--color-primary-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: "44px",
                  }}
                >
                  📖 マンガで例を見る
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!answer.trim() || isLoading}
              className="btn btn-primary"
              style={{ minWidth: "160px" }}
            >
              {currentSpeakerName}のお返事を送信
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};