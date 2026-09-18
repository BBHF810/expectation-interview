"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle, Volume2 } from "lucide-react";

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

  useEffect(() => {
    // Web Speech API の有無を確認
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const speechChunk = finalTranscript || interimTranscript;
      if (speechChunk) {
        // 現在のテキストの末尾に自然に追加
        const newFullText = currentText
          ? `${currentText.trim()} ${speechChunk.trim()}`
          : speechChunk.trim();
        onTranscriptChange(newFullText.slice(0, 500));
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setErrorMessage("マイクの使用が許可されていません。キーボードで入力するか、ブラウザの設定をご確認ください。");
      } else if (event.error === "no-speech") {
        // 声が聞こえなかっただけなので何もしない
      } else {
        setErrorMessage("音声認識に一時的なエラーが発生しました。もう一度お話しいただくか、手動で入力してください。");
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningStateChange(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentText, onTranscriptChange, onListeningStateChange]);

  const startListening = () => {
    if (!recognitionRef.current || disabled) return;
    setErrorMessage(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
      onListeningStateChange(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (_) {}
    setIsListening(false);
    onListeningStateChange(false);
  };

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