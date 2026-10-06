"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { getSavedTtsVoice } from "@/lib/tts-voices";

interface ClosingScreenProps {
  closingComment: string;
  isPair?: boolean;
  nameA?: string;
  nameB?: string;
  onProceedToResult: () => void;
  onReset: () => void;
}

export const ClosingScreen: React.FC<ClosingScreenProps> = ({
  closingComment,
  isPair = false,
  nameA,
  nameB,
  onProceedToResult,
  onReset,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopAllAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      audio.pause();
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

  useEffect(() => {
    if (!closingComment || !isSpeechEnabled) {
      stopAllAudio();
      return;
    }

    let isCancelled = false;
    stopAllAudio();

    const playClosingTts = async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: closingComment, voice: getSavedTtsVoice() }),
        });

        if (!res.ok) {
          throw new Error("TTS API unavailable");
        }

        const blob = await res.blob();
        if (isCancelled) return;

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
          if (!isCancelled) playBrowserSpeech(closingComment);
        };

        await audio.play().catch((err) => {
          if (err.name !== "AbortError" && !isCancelled) {
            console.warn("TTS playback error:", err);
            playBrowserSpeech(closingComment);
          }
        });
      } catch (err) {
        if (!isCancelled) {
          playBrowserSpeech(closingComment);
        }
      }
    };

    playClosingTts();

    return () => {
      isCancelled = true;
      stopAllAudio();
    };
  }, [closingComment, isSpeechEnabled]);

  const handleProceed = () => {
    stopAllAudio();
    onProceedToResult();
  };

  const handleReset = () => {
    stopAllAudio();
    onReset();
  };

  const avatarStatus: AvatarStatus = isSpeaking ? "speaking" : "idle";

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "2rem 1.5rem" }}>
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
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "#ECFDF5",
              color: "#059669",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              border: "1px solid #A7F3D0",
            }}
          >
            <Sparkles size={14} color="#059669" />
            インタビュー終了
          </span>
          <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
            {isPair && nameA && nameB ? `${nameA}さん＆${nameB}さん` : "お疲れさまでした！"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* 音声ON/OFF */}
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
            title={isSpeechEnabled ? "AIの音声をミュート" : "AIの音声をオン"}
            aria-label={isSpeechEnabled ? "音声をミュート" : "音声をオン"}
          >
            {isSpeechEnabled ? <Volume2 size={18} color="var(--color-primary)" /> : <VolumeX size={18} />}
          </button>

          {/* 最初から */}
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
            title="最初に戻る"
          >
            <RotateCcw size={16} />
            最初から
          </button>
        </div>
      </div>

      {/* 対面アバター */}
      <div style={{ margin: "0.5rem 0" }}>
        <InterviewerAvatar status={avatarStatus} size={140} />
      </div>

      {/* AIからのクロージングメッセージ吹き出し */}
      <div
        style={{
          background: "linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)",
          border: "2px solid #86EFAC",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.08)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            color: "#15803D",
            fontWeight: 800,
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <span>💬</span>
          <span>AIインタビュアーからのメッセージ</span>
        </div>
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#14532D",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {closingComment}
        </p>
      </div>

      {/* 結果への進むボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={handleProceed}
          className="btn btn-primary"
          style={{
            width: "100%",
            maxWidth: "380px",
            padding: "1rem 1.5rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
          }}
        >
          <span>診断結果のQRコードを見る</span>
          <ArrowRight size={20} />
        </button>
        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          ※ QRコードはお手元のスマートフォンで読み取って記念カードを持ち帰れます
        </div>
      </div>
    </div>
  );
};
