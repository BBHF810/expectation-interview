"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, RotateCcw, XCircle, Bot, Loader2, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { VoiceInput } from "./VoiceInput";

interface InterviewScreenProps {
  currentQuestion: string;
  progress: number; // 1, 2, 3
  isLoading: boolean;
  fallbackUsed: boolean;
  onSubmitAnswer: (answer: string, isSkipped: boolean, skipReason?: "dont_know" | "no_answer") => void;
  onFinishEarly: () => void;
  onReset: () => void;
  isSimple: boolean;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  currentQuestion,
  progress,
  isLoading,
  fallbackUsed,
  onSubmitAnswer,
  onFinishEarly,
  onReset,
  isSimple,
}) => {
  const [answer, setAnswer] = useState("");
  const [longWait, setLongWait] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  // 10秒以上の待機メッセージ用タイマー
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setLongWait(false);
      timer = setTimeout(() => {
        setLongWait(true);
      }, 10000);
    } else {
      setLongWait(false);
      setAnswer("");
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // 新しい質問が来たら音声合成で読み上げ
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

  // アバターの状態を決定
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

  const handleSkip = (reason: "dont_know" | "no_answer") => {
    if (isLoading) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onSubmitAnswer(reason === "dont_know" ? "（思いつかない）" : "（答えたくない）", true, reason);
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* 上部ヘッダー：進行状況と操作ボタン */}
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
            質問 {progress} / 3
          </span>
          {fallbackUsed && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              （用意された質問で進行中）
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* 音声読み上げON/OFF */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking && typeof window !== "undefined") {
                window.speechSynthesis.cancel();
              }
              setIsSpeechEnabled(!isSpeechEnabled);
            }}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.6rem", fontSize: "0.875rem" }}
            title={isSpeechEnabled ? "AIの読み上げ音声をミュート" : "AIの読み上げ音声を有効化"}
            aria-label={isSpeechEnabled ? "音声をミュート" : "音声をオン"}
          >
            {isSpeechEnabled ? <Volume2 size={18} color="var(--color-primary)" /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={onFinishEarly}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
            title="ここで対話を終えて振り返りを表示します"
          >
            <XCircle size={16} />
            体験終了
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
            title="すべてリセットして最初に戻ります"
          >
            <RotateCcw size={16} />
            最初から
          </button>
        </div>
      </div>

      {/* 対面風アニメーションアバター */}
      <div style={{ margin: "0.25rem 0" }}>
        <InterviewerAvatar status={avatarStatus} size={130} />
      </div>

      {/* AI質問表示エリア（対面対話風） */}
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
        <div
          style={{
            fontSize: "0.875rem",
            color: "var(--color-primary)",
            fontWeight: 700,
            marginBottom: "0.4rem",
            letterSpacing: "0.05em",
          }}
        >
          AIインタビュアーからの質問
        </div>
        <p
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--color-text-main)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {currentQuestion}
        </p>
      </div>

      {/* ローディング表示 */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem 1rem",
            gap: "1rem",
            color: "var(--color-text-muted)",
          }}
        >
          <Loader2
            className="animate-spin"
            size={38}
            color="var(--color-primary)"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            お答えをじっくり受け止めています…
          </span>
          {longWait && (
            <div className="banner banner-yellow" style={{ marginTop: "0.5rem" }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>少し時間がかかっています。このままお待ちいただくか、通信が不安定な場合は固定の質問に切り替わります。</span>
            </div>
          )}
        </div>
      ) : (
        /* 回答入力エリア（音声入力優先＋テキストエリア併用） */
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* 音声入力コンポーネント */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-main)" }}>
              🎙️ 声でお話しください（基本操作）
            </div>
            <VoiceInput
              currentText={answer}
              onTranscriptChange={(newText) => setAnswer(newText)}
              onListeningStateChange={(active) => setIsListening(active)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="user-answer"
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "var(--color-text-muted)",
              }}
            >
              {isSimple ? "文字で直す・確認する（キーボード入力もできます）" : "文字で修正・入力も可能です（最大500文字）"}
            </label>
            <textarea
              id="user-answer"
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
              placeholder={isSimple ? "声で話した内容がここに入ります。キーボードで書いてもOK！" : "マイクで話した内容がここに文字起こしされます。直接入力・修正も可能です。"}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--color-border)",
                resize: "vertical",
                minHeight: "80px",
                lineHeight: 1.5,
              }}
            />
            <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {answer.length} / 500 文字
            </div>
          </div>

          {/* ボタン群：「思いつかない」「答えたくない」「次へ」 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleSkip("dont_know")}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ fontSize: "0.95rem", padding: "0.6rem 1rem", minHeight: "44px" }}
              >
                思いつかない
              </button>
              <button
                type="button"
                onClick={() => handleSkip("no_answer")}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ fontSize: "0.95rem", padding: "0.6rem 1rem", minHeight: "44px" }}
              >
                答えたくない
              </button>
            </div>

            <button
              type="submit"
              disabled={!answer.trim() || isLoading}
              className="btn btn-primary"
              style={{ minWidth: "150px" }}
            >
              回答して次へ
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};