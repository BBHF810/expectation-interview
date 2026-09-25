"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceInputProps {
  onTranscriptChange: (text: string) => void;
  onListeningStateChange: (isListening: boolean) => void;
  disabled: boolean;
  currentText: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onListeningStateChange,
  disabled,
  currentText,
}) => {
  const [isListening, setIsListening] = useState(false);
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

  // ブラウザの Web Speech API サポート判定（初回マウント時のみ）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      // コンポーネント破棄時のみ認識を中止
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    onListeningStateChangeRef.current(false);
  }, []);

  const startListening = useCallback(() => {
    if (disabled || typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // 既存のインスタンスがあれば停止・破棄
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    setErrorMessage(null);
    isManuallyStoppedRef.current = false;

    // 録音開始時のテキストをベースとして退避
    baseTextRef.current = currentTextRef.current.trim();
    sessionFinalRef.current = "";

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
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
          setErrorMessage(
            "マイクの使用が許可されていません。ブラウザのアドレスバーの鍵アイコン等からマイクの使用を許可してください。"
          );
        } else if (error === "no-speech") {
          // 無音時はエラー扱いせず自然に継続
          return;
        } else if (error === "aborted") {
          // 手動停止や画面遷移時は何もしない
          return;
        } else if (error === "network") {
          setErrorMessage(
            "音声認識ネットワークに一時的に接続できませんでした。通信環境をご確認いただくか、直接キーボードでご入力ください。"
          );
        } else {
          setErrorMessage(
            "音声の聞き取りに一時的な問題が発生しました。もう一度お話しいただくか、手動で入力してください。"
          );
        }

        setIsListening(false);
        onListeningStateChangeRef.current(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListeningStateChangeRef.current(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error("Failed to start speech recognition:", e);
      setErrorMessage("マイクを起動できませんでした。キーボードでの入力をお試しください。");
      setIsListening(false);
      onListeningStateChangeRef.current(false);
    }
  }, [disabled]);

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
          disabled={disabled}
          className="btn"
          style={{
            minHeight: "52px",
            padding: "0.75rem 1.5rem",
            backgroundColor: isListening ? "#DC2626" : "var(--color-primary)",
            color: "#ffffff",
            borderRadius: "var(--radius-full)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.65rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            boxShadow: isListening ? "0 0 15px rgba(220, 38, 38, 0.45)" : "var(--shadow-sm)",
            transition: "all 0.2s ease",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          aria-pressed={isListening}
          aria-label={isListening ? "音声入力を停止する" : "音声で回答する（マイクを開始）"}
        >
          {isListening ? (
            <>
              <MicOff size={22} className="animate-pulse" />
              <span>お話し中（タップで停止）</span>
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