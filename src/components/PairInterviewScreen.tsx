"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, RotateCcw, XCircle, Loader2, Volume2, VolumeX, User, Edit3, Mic, Keyboard } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { VoiceInput } from "./VoiceInput";
import { InputMethod } from "@/types";
import { getSavedTtsVoice } from "@/lib/tts-voices";
import { fetchTtsBlob } from "@/lib/tts-client";

interface PairInterviewScreenProps {
  currentQuestion: string;
  currentSpeaker: "A" | "B";
  currentSpeakerName: string;
  progress: number;
  isLoading: boolean;
  fallbackUsed: boolean;
  inputMethod?: InputMethod;
  onSubmitAnswer: (answer: string, isSkipped: boolean) => void;
  onFinishEarly: () => void;
  onReset: () => void;
}

export const PairInterviewScreen: React.FC<PairInterviewScreenProps> = ({
  currentQuestion,
  currentSpeaker,
  currentSpeakerName,
  progress,
  isLoading,
  fallbackUsed,
  inputMethod = "voice",
  onSubmitAnswer,
  onFinishEarly,
  onReset,
}) => {
  const [answer, setAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [currentInputMethod, setCurrentInputMethod] = useState<InputMethod>(inputMethod || "voice");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setCurrentInputMethod(inputMethod || "voice");
  }, [inputMethod]);

  useEffect(() => {
    setAnswer("");
    setShowManualEdit(false);
  }, [currentQuestion, currentSpeaker]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      audio.pause();
      // currentTime = 0 を呼ぶと revoke された Blob URL への再フェッチが走り ERR_FILE_NOT_FOUND となるため、
      // currentTime は操作せず src を解除して load() でリソースを切り離す
      audio.removeAttribute("src");
      audio.load();
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playBrowserSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // 新しい質問の音声読み上げ（TTS優先 ＋ ブラウザフォールバック）
  useEffect(() => {
    if (!currentQuestion || isLoading || !isSpeechEnabled) {
      stopAllAudio();
      return;
    }

    let isCancelled = false;
    stopAllAudio();

    const playTtsAudio = async () => {
      try {
        const { blob } = await fetchTtsBlob(currentQuestion, getSavedTtsVoice());
        if (isCancelled) return;

        // 前のオーディオがあれば安全に停止・破棄
        stopAllAudio();

        const audioUrl = URL.createObjectURL(blob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          if (!isCancelled) setIsSpeaking(true);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          if (audioRef.current === audio) {
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
          }
          if (audioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            audioUrlRef.current = null;
          }
        };
        audio.onerror = () => {
          if (audioRef.current === audio) {
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
          }
          if (audioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            audioUrlRef.current = null;
          }
          if (!isCancelled) playBrowserSpeech(currentQuestion);
        };

        await audio.play().catch((err) => {
          // ユーザーによる中断（AbortError）は正常な挙動として無視
          if (err.name !== "AbortError" && !isCancelled) {
            console.warn("TTS playback error:", err);
            playBrowserSpeech(currentQuestion);
          }
        });
      } catch (err) {
        if (!isCancelled) {
          playBrowserSpeech(currentQuestion);
        }
      }
    };

    playTtsAudio();

    return () => {
      isCancelled = true;
      stopAllAudio();
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
    stopAllAudio();
    onSubmitAnswer(answer.trim(), false);
  };

  const handleSkip = () => {
    if (isLoading) return;
    stopAllAudio();
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
            ふたりで体験中（質問 {progress} / 2）
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
              if (isSpeaking) {
                stopAllAudio();
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
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: isLoading ? "var(--color-primary)" : "var(--color-text-main)",
            lineHeight: 1.5,
            margin: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "💭 ふたりのお返事を受け止めて、次の質問を考えています…" : currentQuestion}
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* 音声/テキストのリアルタイム切り替えタブ */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              background: "#F1F5F9",
              borderRadius: "var(--radius-full)",
              padding: "0.25rem",
              width: "fit-content",
              margin: "0 auto",
              border: "1px solid var(--color-border)",
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentInputMethod("voice")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 1.1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.9rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: currentInputMethod === "voice" ? "var(--color-primary)" : "transparent",
                color: currentInputMethod === "voice" ? "#FFFFFF" : "var(--color-text-muted)",
                boxShadow: currentInputMethod === "voice" ? "0 2px 6px rgba(2, 132, 199, 0.25)" : "none",
              }}
            >
              <Mic size={16} />
              音声入力
            </button>
            <button
              type="button"
              onClick={() => setCurrentInputMethod("text")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 1.1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.9rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: currentInputMethod === "text" ? "var(--color-primary)" : "transparent",
                color: currentInputMethod === "text" ? "#FFFFFF" : "var(--color-text-muted)",
                boxShadow: currentInputMethod === "text" ? "0 2px 6px rgba(2, 132, 199, 0.25)" : "none",
              }}
            >
              <Keyboard size={16} />
              文字入力（タイピング）
            </button>
          </div>

          {currentInputMethod === "voice" ? (
            /* 音声入力専用 */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: isSpeaking
                    ? "#FEF3C7"
                    : isSpeakerA
                    ? "#EFF6FF"
                    : "#FEF3C7",
                  border: isSpeaking
                    ? "2px solid #FCD34D"
                    : isSpeakerA
                    ? "2px solid #93C5FD"
                    : "2px solid #FCD34D",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: isSpeaking ? "#92400E" : isSpeakerA ? "#1E40AF" : "#92400E",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isSpeaking ? (
                    <>
                      <span style={{ fontSize: "1.2rem" }}>🔊</span>
                      <span>AIがお話し中です。聞き終わったらボタンを押してください</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "1.2rem" }}>🎙️</span>
                      <span>{currentSpeakerName}、下のボタンを押して声でお話しください</span>
                    </>
                  )}
                </div>
                <VoiceInput
                  currentText={answer}
                  onTranscriptChange={(newText) => setAnswer(newText)}
                  onListeningStateChange={(active) => setIsListening(active)}
                  disabled={isLoading}
                />
              </div>

              {answer ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "2px solid var(--color-primary-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>
                      聞き取った内容：
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowManualEdit(!showManualEdit)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Edit3 size={14} />
                      {showManualEdit ? "手直しを閉じる" : "文字を手直しする"}
                    </button>
                  </div>
                  {showManualEdit ? (
                    <textarea
                      rows={3}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                        fontSize: "1rem",
                        lineHeight: 1.5,
                      }}
                    />
                  ) : (
                    <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-main)", lineHeight: 1.5 }}>
                      「{answer}」
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  （マイクボタンを押してお話しすると、ここに言葉が表示されます）
                </div>
              )}
            </div>
          ) : (
            /* キーボード入力専用 */
            <div>
              <label
                htmlFor="user-answer"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: isSpeakerA ? "#1D4ED8" : "#B45309",
                }}
              >
                {currentSpeakerName}の回答を入力してください（最大500文字）
              </label>
              <textarea
                id="user-answer"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                placeholder={`${currentSpeakerName}のお返事をキーボードで入力してください`}
                disabled={isLoading}
                autoFocus
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: isSpeakerA ? "2px solid #93C5FD" : "2px solid #FCD34D",
                  fontSize: "1.05rem",
                  resize: "vertical",
                  minHeight: "100px",
                  lineHeight: 1.5,
                }}
              />
              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                {answer.length} / 500 文字
              </div>
            </div>
          )}

          {/* メインアクション：回答ボタン */}
          <div>
            <button
              type="submit"
              disabled={!answer.trim() || isLoading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1.15rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                boxShadow: answer.trim() ? "0 4px 12px rgba(2, 132, 199, 0.25)" : "none",
              }}
            >
              回答してお返事完了
              <ArrowRight size={22} />
            </button>
          </div>

          {/* スキップ */}
          <div style={{ textAlign: "center", paddingTop: "0.5rem", borderTop: "1px dashed var(--color-border)" }}>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                cursor: "pointer",
                padding: "0.4rem 0.6rem",
                textDecoration: "underline",
              }}
            >
              この質問をスキップする
            </button>
          </div>
        </form>
      )}
    </div>
  );
};