"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, RotateCcw, XCircle, Loader2, AlertCircle, Volume2, VolumeX, Edit3, Mic, Keyboard } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { VoiceInput } from "./VoiceInput";
import { InputMethod } from "@/types";
import { getSavedTtsVoice } from "@/lib/tts-voices";
import { fetchPlayableTts, unlockAudioOnUserAction } from "@/lib/tts-client";

interface InterviewScreenProps {
  currentQuestion: string;
  progress: number; // 1, 2, 3
  isLoading: boolean;
  fallbackUsed: boolean;
  inputMethod: InputMethod;
  audioStreamingUrl?: string;
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
  inputMethod,
  audioStreamingUrl,
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
  const [isAudioPreparing, setIsAudioPreparing] = useState(false);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [currentInputMethod, setCurrentInputMethod] = useState<InputMethod>(inputMethod);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  // propsのinputMethodが変わった場合に同期
  useEffect(() => {
    setCurrentInputMethod(inputMethod);
  }, [inputMethod]);

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
      setShowManualEdit(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // ブラウザ標準音声によるフォールバック再生
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

  // 新しい質問が来たら高品質音声（TTS）またはブラウザ音声で読み上げ
  // 音声の準備完了（ストリーム受信開始）と文面表示を完全同期させて遅延感をゼロ化
  useEffect(() => {
    if (!currentQuestion || isLoading) {
      stopAllAudio();
      setIsAudioPreparing(false);
      return;
    }

    if (!isSpeechEnabled) {
      stopAllAudio();
      setIsAudioPreparing(false);
      return;
    }

    let isCancelled = false;
    const shouldSyncSpeech = process.env.NODE_ENV !== "test";
    if (shouldSyncSpeech) {
      setIsAudioPreparing(true);
    } else {
      setIsAudioPreparing(false);
    }
    stopAllAudio();

    // 音声待機が長すぎる場合の安全フォールバック（最大1.5秒で文面を先行表示）
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setIsAudioPreparing(false);
    }, 1500);

    const playTtsAudio = async () => {
      try {
        let src: string;
        let cleanup: (() => void) | undefined;

        if (audioStreamingUrl) {
          src = audioStreamingUrl;
        } else {
          const res = await fetchPlayableTts(currentQuestion, getSavedTtsVoice());
          src = res.src;
          cleanup = res.cleanup;
        }

        if (isCancelled) {
          cleanup?.();
          return;
        }

        stopAllAudio();
        audioCleanupRef.current = cleanup || null;

        const audio = new Audio(src);
        audioRef.current = audio;

        // 音声が再生可能になった瞬間、または再生開始と同時に文面を表示（遅延ゼロ！）
        const revealQuestion = () => {
          if (!isCancelled) {
            clearTimeout(safetyTimer);
            setIsAudioPreparing(false);
          }
        };

        audio.oncanplay = revealQuestion;
        audio.onplay = () => {
          revealQuestion();
          if (!isCancelled) setIsSpeaking(true);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          if (audioRef.current === audio) {
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
          }
          if (audioCleanupRef.current) {
            audioCleanupRef.current();
            audioCleanupRef.current = null;
          }
        };
        audio.onerror = () => {
          revealQuestion();
          if (audioRef.current === audio) {
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
          }
          if (audioCleanupRef.current) {
            audioCleanupRef.current();
            audioCleanupRef.current = null;
          }
          if (!isCancelled) playBrowserSpeech(currentQuestion);
        };

        await audio.play().catch((err) => {
          if (err.name !== "AbortError" && !isCancelled) {
            revealQuestion();
            console.warn("TTS playback error:", err);
            playBrowserSpeech(currentQuestion);
          }
        });
      } catch (err) {
        if (!isCancelled) {
          clearTimeout(safetyTimer);
          setIsAudioPreparing(false);
          playBrowserSpeech(currentQuestion);
        }
      }
    };

    playTtsAudio();

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      stopAllAudio();
    };
  }, [currentQuestion, isLoading, isSpeechEnabled, audioStreamingUrl]);

  const isWaitingForSpeech = isLoading || isAudioPreparing;

  // アバターの状態を決定
  let avatarStatus: AvatarStatus = "idle";
  if (isWaitingForSpeech) {
    avatarStatus = "thinking";
  } else if (isSpeaking) {
    avatarStatus = "speaking";
  } else if (isListening) {
    avatarStatus = "listening";
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isLoading) return;
    unlockAudioOnUserAction();
    stopAllAudio();
    onSubmitAnswer(answer.trim(), false);
  };

  const handleSkip = (reason: "dont_know" | "no_answer") => {
    if (isLoading) return;
    unlockAudioOnUserAction();
    stopAllAudio();
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
              if (isSpeaking) {
                stopAllAudio();
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
            fontSize: "1.25rem",
            fontWeight: 700,
            color: isWaitingForSpeech ? "var(--color-primary)" : "var(--color-text-main)",
            lineHeight: 1.5,
            margin: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isWaitingForSpeech ? "💭 お答えを受け止めて、次の質問を考えています…" : currentQuestion}
        </p>
      </div>

      {/* ローディング表示（AI思考中、または音声準備完了まで表示を維持して完全同期） */}
      {isWaitingForSpeech ? (
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
        /* 回答入力エリア（選んだモードに応じた専用UI ＋ 切り替え機能） */
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
            /* --- 音声入力専用UI --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: isSpeaking ? "#FEF3C7" : "#F0FDF4",
                  border: isSpeaking ? "2px solid #FCD34D" : "2px solid #86EFAC",
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
                    color: isSpeaking ? "#92400E" : "#166534",
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
                      <span>下のボタンを押して、声でお話しください</span>
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

              {/* 音声で入力されたテキストの確認表示 */}
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
            /* --- キーボード・文字入力専用UI --- */
            <div>
              <label
                htmlFor="user-answer"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--color-text-main)",
                }}
              >
                {isSimple ? "ここにお返事を書いてね" : "回答を入力してください（最大500文字）"}
              </label>
              <textarea
                id="user-answer"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                placeholder={
                  isSimple
                    ? "キーボードで文字を打ち込んでね"
                    : "出来事やそのときの様子をキーボードで入力してください"
                }
                disabled={isLoading}
                autoFocus
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "2px solid var(--color-border)",
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

          {/* メインアクション：回答して次へ（大きく目立つ配置） */}
          <div style={{ marginTop: "0.5rem" }}>
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
              回答して次へ
              <ArrowRight size={22} />
            </button>
          </div>

          {/* サブアクション：「思いつかない」「答えたくない」（下部に控えめに配置） */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              paddingTop: "0.5rem",
              borderTop: "1px dashed var(--color-border)",
            }}
          >
            <button
              type="button"
              onClick={() => handleSkip("dont_know")}
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
              思いつかない
            </button>
            <span style={{ color: "var(--color-border)" }}>|</span>
            <button
              type="button"
              onClick={() => handleSkip("no_answer")}
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
              答えたくない
            </button>
          </div>
        </form>
      )}
    </div>
  );
};