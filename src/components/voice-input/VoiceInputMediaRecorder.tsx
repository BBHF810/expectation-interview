"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";
import { getSharedAudio } from "@/lib/tts-client";
import { VoiceInputProps } from "./VoiceInputWebSpeechAPI";
import { sanitizeWhisperTranscript } from "@/lib/whisper-sanitizer";

export const VoiceInputMediaRecorder: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onListeningStateChange,
  onBeforeStart,
  disabled,
  currentText,
  isAiSpeaking = false,
  isSimple = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const baseTextRef = useRef("");
  const isMountedRef = useRef(true);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTextRef = useRef(currentText);
  currentTextRef.current = currentText;

  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;

  const onListeningStateChangeRef = useRef(onListeningStateChange);
  onListeningStateChangeRef.current = onListeningStateChange;

  const onBeforeStartRef = useRef(onBeforeStart);
  onBeforeStartRef.current = onBeforeStart;

  const isSimpleRef = useRef(isSimple);
  isSimpleRef.current = isSimple;

  /** 端末で鳴っているオーディオを確実に停止・シャットダウン */
  const stopAllAudioInternal = useCallback(() => {
    try {
      const audio = getSharedAudio();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      }
    } catch {}
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  // コンポーネント破棄時の安全なクリーンアップ
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupStream();
    };
  }, [cleanupStream]);

  // disabled になった場合（回答送信中など）は即座に停止
  useEffect(() => {
    if (disabled && isRecording) {
      stopRecording();
    }
  }, [disabled, isRecording]);

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    if (!isMountedRef.current) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      // Whisper API に送るファイル名（iOS Safari は mp4/aac/webm など）
      const ext = audioBlob.type.includes("mp4")
        ? "mp4"
        : audioBlob.type.includes("webm")
        ? "webm"
        : "m4a";
      formData.append("file", audioBlob, `recording.${ext}`);

      const res = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      if (!isMountedRef.current) return;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "音声の文字起こしに失敗しました");
      }

      const data = await res.json();
      const transcribedText = sanitizeWhisperTranscript(data.text);

      if (transcribedText && isMountedRef.current) {
        const base = baseTextRef.current;
        const combined = base
          ? `${base}${base.endsWith(" ") || base.endsWith("、") || base.endsWith("。") ? "" : " "}${transcribedText}`
          : transcribedText;
        onTranscriptChangeRef.current(combined.slice(0, 500));
      }
    } catch (e: any) {
      if (!isMountedRef.current) return;
      console.error("[VoiceInputMediaRecorder] Whisper transcription error:", e);
      setErrorMessage(
        isSimpleRef.current
          ? "こえのききとりにしっぱいしたよ。もういちどためしてね。"
          : "音声の文字起こしに失敗しました。もう一度お話しいただくか手動で入力してください。"
      );
    } finally {
      if (isMountedRef.current) {
        setIsTranscribing(false);
      }
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording || isTranscribing) return;

    if (onBeforeStartRef.current) {
      try {
        onBeforeStartRef.current();
      } catch (_) {}
    }
    stopAllAudioInternal();

    setErrorMessage(null);
    baseTextRef.current = currentTextRef.current.trim();
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("ブラウザがマイク録音をサポートしていません");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // ブラウザがサポートしている最適な MIME タイプを選択
      let options: MediaRecorderOptions | undefined;
      if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          options = { mimeType: "audio/aac" };
        }
      }

      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupStream();
        // 500バイト未満の極小音声（誤タップ等）はWhisperへの無駄なリクエストを避けてスキップ
        if (blob.size >= 500 && isMountedRef.current) {
          sendAudioToWhisper(blob);
        }
      };

      recorder.start(250); // 250ms ごとにチャンク収集

      // 最大60秒の録音保護タイマー（話し終えて停止ボタンを押し忘れた場合の安全停止）
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          stopRecording();
        }
      }, 60000);

      setIsRecording(true);
      onListeningStateChangeRef.current(true);
    } catch (e: any) {
      console.error("[VoiceInputMediaRecorder] Failed to start MediaRecorder:", e);
      cleanupStream();
      setIsRecording(false);
      onListeningStateChangeRef.current(false);
      setErrorMessage(
        isSimpleRef.current
          ? "マイクがつかえないみたい。ブラウザの設定をたしかめてね。"
          : "マイクの起動に失敗しました。アクセス許可をご確認ください。"
      );
    }
  };

  const stopRecording = () => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (!isRecording) return;
    setIsRecording(false);
    onListeningStateChangeRef.current(false);

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else {
        cleanupStream();
      }
    } catch (e) {
      cleanupStream();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || isTranscribing}
          className={`btn ${
            isRecording
              ? "btn-danger"
              : isAiSpeaking
              ? "btn-warning animate-pulse"
              : "btn-secondary"
          }`}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: "var(--radius-md)",
            minHeight: "48px",
            transition: "all 0.2s ease",
            boxShadow: isRecording ? "0 0 0 3px rgba(239, 68, 68, 0.3)" : undefined,
          }}
          aria-label={
            isRecording
              ? "音声入力を終了する"
              : isTranscribing
              ? "文字起こし中"
              : isAiSpeaking
              ? "AIの声を止めてお話しする"
              : "マイクを押してお話しする"
          }
        >
          {isTranscribing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>文字起こし中…</span>
            </>
          ) : isRecording ? (
            <>
              <MicOff size={20} />
              <span>
                {isSimple ? "お話しをおわる（タップ）" : "お話しを終了する（タップ）"}
              </span>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>
                {isAiSpeaking
                  ? isSimple
                    ? "AIの声を止めてお話しする"
                    : "AIの音声を止めて話す"
                  : isSimple
                  ? "マイクを押してお話しする"
                  : "音声で入力する（マイクON）"}
              </span>
            </>
          )}
        </button>
      </div>

      {isRecording && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "#DC2626",
            padding: "0.25rem 0.5rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "#FEF2F2",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#DC2626",
              display: "inline-block",
              animation: "pulse 1.5s infinite",
            }}
          />
          <span>
            {isSimple
              ? "ろくおん中… 話しおわったらボタンを押してね"
              : "録音中（Whisperモード）… 話し終えたらもう一度ボタンを押してください"}
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          className="banner banner-red"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            padding: "0.5rem 0.75rem",
            marginTop: "0.25rem",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
