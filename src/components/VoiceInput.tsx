"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";
import { getSharedAudio } from "@/lib/tts-client";

interface VoiceInputProps {
  onTranscriptChange: (text: string) => void;
  onListeningStateChange: (isListening: boolean) => void;
  /** マイク起動直前（同期的）に呼ばれるコールバック（AI発話音声の即座遮断用） */
  onBeforeStart?: () => void;
  disabled: boolean;
  currentText: string;
  /** AIが現在発話中（音声再生中）かどうか */
  isAiSpeaking?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onListeningStateChange,
  onBeforeStart,
  disabled,
  currentText,
  isAiSpeaking = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const baseTextRef = useRef("");
  const sessionFinalRef = useRef("");

  // 最新の props / state を ref で保持し、非同期イベントリスナー内で安全に参照
  const currentTextRef = useRef(currentText);
  currentTextRef.current = currentText;

  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;

  const onListeningStateChangeRef = useRef(onListeningStateChange);
  onListeningStateChangeRef.current = onListeningStateChange;

  const onBeforeStartRef = useRef(onBeforeStart);
  onBeforeStartRef.current = onBeforeStart;

  const isAiSpeakingRef = useRef(isAiSpeaking);
  isAiSpeakingRef.current = isAiSpeaking;

  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ブラウザの Web Speech API サポート判定（初回マウント時のみ）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      // コンポーネント破棄時のみ認識を中止 & タイマークリア
      isManuallyStoppedRef.current = true;
      if (startDelayTimerRef.current) {
        clearTimeout(startDelayTimerRef.current);
        startDelayTimerRef.current = null;
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  /** 端末で鳴っているオーディオを確実に停止・シャットダウン */
  const stopAllAudioInternal = useCallback(() => {
    try {
      const audio = getSharedAudio();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch {}
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (startDelayTimerRef.current) {
      clearTimeout(startDelayTimerRef.current);
      startDelayTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsStarting(false);
    setIsListening(false);
    onListeningStateChangeRef.current(false);
  }, []);

  const startListening = useCallback(() => {
    if (disabled || typeof window === "undefined") return;

    // 連打ガード
    if (isStarting) return;

    // ① 何よりもまず同期的にすべての音声を完全停止（親と内部の二重防壁）
    if (onBeforeStartRef.current) {
      try {
        onBeforeStartRef.current();
      } catch (_) {}
    }
    stopAllAudioInternal();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    if (startDelayTimerRef.current) {
      clearTimeout(startDelayTimerRef.current);
      startDelayTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // 既存の認識インスタンスがあれば停止・破棄
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    setErrorMessage(null);
    isManuallyStoppedRef.current = false;
    setIsStarting(true);

    // 録音開始時のテキストをベースとして退避
    baseTextRef.current = currentTextRef.current.trim();
    sessionFinalRef.current = "";

    // ② iOS / iPadOS WebKit の AVAudioSession 切り替え待機（ディレイ）
    // audio.pause() からハードウェアのオーディオセッションがマイク入力に解放されるまで、
    // AI発話中であった場合は安全のため極小ディレイ（80ms）を設ける
    const delayMs = isAiSpeakingRef.current ? 80 : 0;

    const launchRecognition = () => {
      startDelayTimerRef.current = null;
      if (isManuallyStoppedRef.current) {
        setIsStarting(false);
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "ja-JP";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsStarting(false);
          setIsListening(true);
          onListeningStateChangeRef.current(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcript = result[0]?.transcript || "";
            if (result.isFinal) {
              sessionFinalRef.current += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const sessionSpoken = sessionFinalRef.current + interimTranscript;
          if (sessionSpoken) {
            const base = baseTextRef.current;
            // ベーステキストがある場合は自然に接続
            const combined = base
              ? `${base}${base.endsWith(" ") || base.endsWith("、") || base.endsWith("。") ? "" : " "}${sessionSpoken.trim()}`
              : sessionSpoken.trim();

            onTranscriptChangeRef.current(combined.slice(0, 500));
          }
        };

        recognition.onerror = (event: any) => {
          const error = event.error;
          console.warn("Speech recognition error:", error);

          if (error === "not-allowed" || error === "service-not-allowed") {
            isManuallyStoppedRef.current = true;
            setErrorMessage(
              "マイクの使用が許可されていません。ブラウザのアドレスバーの鍵アイコン等からマイクの使用を許可してください。"
            );
            setIsStarting(false);
            setIsListening(false);
            onListeningStateChangeRef.current(false);
          } else if (error === "audio-capture") {
            // iOS等でオーディオセッション競合が起きた場合、再接続ループを防止
            isManuallyStoppedRef.current = true;
            setErrorMessage(
              "マイクの接続で問題が発生しました。もう一度「お話しする」ボタンを押してください。"
            );
            setIsStarting(false);
            setIsListening(false);
            onListeningStateChangeRef.current(false);
          } else if (error === "no-speech") {
            // 無音時はエラー扱いせず継続（onendで自動再開判定へ）
            return;
          } else if (error === "aborted") {
            // 手動停止や再起動時は何もしない
            setIsStarting(false);
            return;
          } else if (error === "network") {
            // ネットワーク一時エラー時も手動停止でなければ自動再接続に委ねる
            return;
          } else {
            isManuallyStoppedRef.current = true;
            setErrorMessage(
              "音声の聞き取りに一時的な問題が発生しました。もう一度お話しいただくか、手動で入力してください。"
            );
            setIsStarting(false);
            setIsListening(false);
            onListeningStateChangeRef.current(false);
          }
        };

        recognition.onend = () => {
          setIsStarting(false);
          // iPad Safari 等でユーザーが停止を押していないのに勝手に切れた場合、自動で継続再開する
          if (!isManuallyStoppedRef.current && process.env.NODE_ENV !== "test") {
            // これまでに認識したテキストを baseText に統合して新規セッションに引き継ぐ
            if (sessionFinalRef.current) {
              const base = baseTextRef.current;
              baseTextRef.current = base
                ? `${base}${base.endsWith(" ") || base.endsWith("、") || base.endsWith("。") ? "" : " "}${sessionFinalRef.current.trim()}`
                : sessionFinalRef.current.trim();
              sessionFinalRef.current = "";
            }

            // 短いディレイで自動再接続
            restartTimerRef.current = setTimeout(() => {
              if (!isManuallyStoppedRef.current) {
                try {
                  recognition.start();
                } catch (_) {
                  // startに失敗した場合は手動停止扱いにして無限ループを断ち切る
                  isManuallyStoppedRef.current = true;
                  setIsListening(false);
                  onListeningStateChangeRef.current(false);
                }
              }
            }, 250);
            return;
          }

          setIsListening(false);
          onListeningStateChangeRef.current(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e: any) {
        console.error("Failed to start speech recognition:", e);
        setErrorMessage("マイクを起動できませんでした。キーボードでの入力をお試しください。");
        setIsStarting(false);
        setIsListening(false);
        onListeningStateChangeRef.current(false);
      }
    };

    if (delayMs > 0 && process.env.NODE_ENV !== "test") {
      startDelayTimerRef.current = setTimeout(launchRecognition, delayMs);
    } else {
      launchRecognition();
    }
  }, [disabled, stopAllAudioInternal, isStarting]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
        ※ お使いのブラウザは音声入力に対応していません。下の枠から直接文字を入力してください。
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled || isStarting}
          className="btn"
          style={{
            minHeight: "52px",
            padding: "0.75rem 1.5rem",
            backgroundColor: isListening
              ? "#DC2626"
              : isAiSpeaking
              ? "var(--color-primary)"
              : "var(--color-primary)",
            color: "#ffffff",
            borderRadius: "var(--radius-full)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.65rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            boxShadow: isListening ? "0 0 15px rgba(220, 38, 38, 0.45)" : "var(--shadow-sm)",
            transition: "all 0.2s ease",
            cursor: disabled || isStarting ? "not-allowed" : "pointer",
            opacity: isStarting ? 0.85 : 1,
          }}
          aria-pressed={isListening}
          aria-label={
            isListening
              ? "音声入力を停止する"
              : isAiSpeaking
              ? "AIの声を止めて音声で回答する"
              : "音声で回答する（マイクを開始）"
          }
        >
          {isListening ? (
            <>
              <MicOff size={22} className="animate-pulse" />
              <span>お話し中（タップで停止）</span>
            </>
          ) : isStarting ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>マイク準備中…</span>
            </>
          ) : isAiSpeaking ? (
            <>
              <Mic size={22} />
              <span>AIの声を止めて話す 🎙️</span>
            </>
          ) : (
            <>
              <Mic size={22} />
              <span>マイクを押して声で話す</span>
            </>
          )}
        </button>

        {isListening && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#DC2626",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                backgroundColor: "#DC2626",
                borderRadius: "50%",
                animation: "voice-record-pulse 1s infinite",
              }}
            />
            マイクが聞いています…
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="banner banner-pink" style={{ marginTop: "0.5rem" }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes voice-record-pulse {
          0% { transform: scale(0.9); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(0.9); opacity: 1; }
        }
      `}</style>
    </div>
  );
};