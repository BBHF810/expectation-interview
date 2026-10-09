"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
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
  /** 子ども向けモードかどうか（やさしい言葉づかいにする） */
  isSimple?: boolean;
}

const PERMISSION_DENIED_MESSAGE =
  "マイクの使用が許可されていません。ブラウザのアドレスバーの鍵アイコン等からマイクの使用を許可してください。";
const INSECURE_CONTEXT_MESSAGE =
  "マイク機能は安全な通信（HTTPS または localhost）でのみ利用できます。URL をご確認ください。";
const UNSTABLE_MESSAGE =
  "マイクの接続が不安定です。キーボードでの入力をお試しいただくか、もう一度ボタンを押してください。";

/** audio-capture エラー（iOSのCoreAudio切替競合等）時の自動リトライ上限回数 */
export const MAX_AUDIO_CAPTURE_RETRIES = 2;
/** audio-capture 発生時の再試行待機時間（ms） */
export const AUDIO_CAPTURE_RETRY_DELAY_MS = 250;

/** WebKit がイベント（onstart/onerror）を発火させない場合のハング防止タイムアウト（ms） */
const STARTING_SAFETY_TIMEOUT_MS = 1500;

/** 直近の起動からこの時間未満で切断されたら「即死」とみなす */
const RAPID_END_MS = 1200;
/** 即死がこの回数連続したら自動再接続を止めて案内を出す */
const MAX_RAPID_RESTARTS = 3;

/** Safari / Chrome 等の「マイクが許可されていない」時の案内文 */
function getNotAllowedMessage(isSimple = false): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return INSECURE_CONTEXT_MESSAGE;
  }
  return isSimple
    ? "マイクがつかえないようになっています。ブラウザの設定でマイクをきょかしてね。"
    : PERMISSION_DENIED_MESSAGE;
}

function getUnstableMessage(isSimple = false): string {
  return isSimple
    ? "マイクのちょうしがよくないみたい。もじをうつか、もういちどボタンをおしてみてね。"
    : UNSTABLE_MESSAGE;
}

/** iOS / iPadOS 環境の判定 */
function checkIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** 認識インスタンスの安全な完全破棄（イベントリスナーを解除してから abort を呼ぶことでゾンビイベント競合を根絶） */
function teardownRecognition(rec: any) {
  if (!rec) return;
  try {
    rec.onstart = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    rec.abort();
  } catch (_) {}
}

type VoiceStatus = "idle" | "starting" | "listening" | "stopping";

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onListeningStateChange,
  onBeforeStart,
  disabled,
  currentText,
  isAiSpeaking = false,
  isSimple = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusRef = useRef<VoiceStatus>("idle");
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

  const isSimpleRef = useRef(isSimple);
  isSimpleRef.current = isSimple;

  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startingSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 自動再接続の暴走検知用
  const sessionStartedAtRef = useRef<number | null>(null);
  const rapidEndCountRef = useRef(0);

  // audio-capture 競合の自動リトライ用
  const audioCaptureRetriesRef = useRef(0);

  // Permissions API で取得したマイク権限
  const micPermissionRef = useRef<PermissionState | null>(null);

  const clearAllTimers = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (startingSafetyTimerRef.current) {
      clearTimeout(startingSafetyTimerRef.current);
      startingSafetyTimerRef.current = null;
    }
  }, []);

  // マイク権限の状態を監視
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let status: PermissionStatus | null = null;
    let cancelled = false;

    const sync = () => {
      if (!status) return;
      micPermissionRef.current = status.state;
      if (status.state === "granted") {
        setErrorMessage((prev) =>
          prev === PERMISSION_DENIED_MESSAGE || prev === INSECURE_CONTEXT_MESSAGE ? null : prev
        );
      }
    };

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((s) => {
        if (cancelled) return;
        status = s;
        sync();
        s.onchange = sync;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, []);

  // ブラウザの Web Speech API サポート判定（初回マウント時のみ）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      // コンポーネント破棄時のみ認識を完全破棄 & タイマークリア
      statusRef.current = "idle";
      isManuallyStoppedRef.current = true;
      audioCaptureRetriesRef.current = 0;
      clearAllTimers();
      if (recognitionRef.current) {
        teardownRecognition(recognitionRef.current);
        recognitionRef.current = null;
      }
    };
  }, [clearAllTimers]);

  // disabled になった場合（回答送信中など）は即座にマイクを完全停止する
  useEffect(() => {
    if (disabled && (statusRef.current === "listening" || statusRef.current === "starting" || isListening)) {
      stopListening();
    }
  }, [disabled, isListening]);

  /** 端末で鳴っているオーディオを確実に停止・シャットダウン */
  const stopAllAudioInternal = useCallback(() => {
    try {
      const audio = getSharedAudio();
      if (audio) {
        audio.onplay = null;
        audio.onplaying = null;
        audio.oncanplay = null;
        audio.onended = null;
        audio.onerror = null;
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

  const stopListening = useCallback(() => {
    statusRef.current = "stopping";
    isManuallyStoppedRef.current = true;
    audioCaptureRetriesRef.current = 0;
    clearAllTimers();

    if (recognitionRef.current) {
      teardownRecognition(recognitionRef.current);
      recognitionRef.current = null;
    }

    sessionStartedAtRef.current = null;
    rapidEndCountRef.current = 0;
    statusRef.current = "idle";
    setIsListening(false);
    onListeningStateChangeRef.current(false);
  }, [clearAllTimers]);

  /**
   * 新規の音声認識セッションを生成して開始する
   * ※ iOS Safari ではユーザージェスチャー（タップ）のコンテキスト内で同期的に呼び出される必要がある
   */
  const startRecognitionSession = useCallback(() => {
    if (isManuallyStoppedRef.current || typeof window === "undefined") {
      statusRef.current = "idle";
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      statusRef.current = "idle";
      return;
    }

    try {
      // 既存インスタンスがあればクリーンアップ
      if (recognitionRef.current) {
        teardownRecognition(recognitionRef.current);
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "ja-JP";

      const isIOS = checkIsIOS();
      recognition.continuous = !isIOS;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const isCurrent = () => recognitionRef.current === recognition;

      // WebKit が onstart も onerror も返さないフリーズを検出するセーフティタイマー
      if (startingSafetyTimerRef.current) clearTimeout(startingSafetyTimerRef.current);
      startingSafetyTimerRef.current = setTimeout(() => {
        if (isCurrent() && statusRef.current === "starting") {
          console.warn("[VoiceInput] 認識開始タイムアウト（WebKitが無応答）。ステートをリセットします。");
          teardownRecognition(recognition);
          if (recognitionRef.current === recognition) {
            recognitionRef.current = null;
          }
          statusRef.current = "idle";
          setIsListening(false);
          onListeningStateChangeRef.current(false);
        }
      }, STARTING_SAFETY_TIMEOUT_MS);

      recognition.onstart = () => {
        if (!isCurrent()) return;
        if (startingSafetyTimerRef.current) {
          clearTimeout(startingSafetyTimerRef.current);
          startingSafetyTimerRef.current = null;
        }
        statusRef.current = "listening";
        sessionStartedAtRef.current = Date.now();
        setErrorMessage(null);
        setIsListening(true);
        onListeningStateChangeRef.current(true);
      };

      recognition.onresult = (event: any) => {
        if (!isCurrent()) return;
        audioCaptureRetriesRef.current = 0;
        rapidEndCountRef.current = 0;
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
          const combined = base
            ? `${base}${base.endsWith(" ") || base.endsWith("、") || base.endsWith("。") ? "" : " "}${sessionSpoken.trim()}`
            : sessionSpoken.trim();

          onTranscriptChangeRef.current(combined.slice(0, 500));
        }
      };

      recognition.onerror = (event: any) => {
        if (!isCurrent()) return;
        if (startingSafetyTimerRef.current) {
          clearTimeout(startingSafetyTimerRef.current);
          startingSafetyTimerRef.current = null;
        }

        const error = event.error;

        // 意図的な中断（aborted: 送信時・手動停止時）や無音（no-speech）は正常な動作のため警告ログを出さずに無視
        if (error === "aborted" || error === "no-speech" || isManuallyStoppedRef.current) {
          if (error === "aborted") {
            statusRef.current = "idle";
          }
          return;
        }

        console.warn("Speech recognition error:", error);

        if (error === "not-allowed" || error === "service-not-allowed") {
          isManuallyStoppedRef.current = true;
          statusRef.current = "idle";
          setErrorMessage(getNotAllowedMessage(isSimpleRef.current));
          setIsListening(false);
          onListeningStateChangeRef.current(false);
        } else if (error === "audio-capture") {
          // iOS / iPadOS 等で直前のオーディオ再生セッション解放が間に合わなかった場合の一時競合
          if (
            audioCaptureRetriesRef.current < MAX_AUDIO_CAPTURE_RETRIES &&
            !isManuallyStoppedRef.current
          ) {
            audioCaptureRetriesRef.current += 1;
            console.warn(
              `[VoiceInput] audio-capture 競合を検知しました。自動リトライ (${audioCaptureRetriesRef.current}/${MAX_AUDIO_CAPTURE_RETRIES}) を実行します...`
            );
            // 音声を再度確実に完全解放
            stopAllAudioInternal();
            teardownRecognition(recognition);
            recognitionRef.current = null;

            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            const isTest =
              typeof process !== "undefined" && process.env?.NODE_ENV === "test";
            if (isTest) {
              startRecognitionSession();
            } else {
              restartTimerRef.current = setTimeout(() => {
                if (!isManuallyStoppedRef.current) {
                  startRecognitionSession();
                }
              }, AUDIO_CAPTURE_RETRY_DELAY_MS);
            }
            return;
          }

          isManuallyStoppedRef.current = true;
          statusRef.current = "idle";
          setErrorMessage(
            isSimpleRef.current
              ? "マイクがうまくつながらなかったよ。もういちど「お話しする」ボタンをおしてみてね。"
              : "マイクの接続で問題が発生しました。もう一度「お話しする」ボタンを押してください。"
          );
          setIsListening(false);
          onListeningStateChangeRef.current(false);
        } else if (error === "no-speech") {
          return;
        } else if (error === "aborted") {
          return;
        } else if (error === "network") {
          return;
        } else {
          isManuallyStoppedRef.current = true;
          statusRef.current = "idle";
          setErrorMessage(
            "音声の聞き取りに一時的な問題が発生しました。もう一度お話しいただくか、手動で入力してください。"
          );
          setIsListening(false);
          onListeningStateChangeRef.current(false);
        }
      };

      recognition.onend = () => {
        if (!isCurrent()) return;
        if (startingSafetyTimerRef.current) {
          clearTimeout(startingSafetyTimerRef.current);
          startingSafetyTimerRef.current = null;
        }

        // iPad Safari 等でユーザーが停止を押していないのに勝手に切れた場合、自動で継続再開する
        if (!isManuallyStoppedRef.current && statusRef.current !== "stopping" && process.env.NODE_ENV !== "test") {
          const startedAt = sessionStartedAtRef.current;
          const endedRapidly = startedAt !== null && Date.now() - startedAt < RAPID_END_MS;
          rapidEndCountRef.current = endedRapidly ? rapidEndCountRef.current + 1 : 0;
          sessionStartedAtRef.current = null;

          if (rapidEndCountRef.current >= MAX_RAPID_RESTARTS) {
            isManuallyStoppedRef.current = true;
            statusRef.current = "idle";
            setErrorMessage(getUnstableMessage(isSimpleRef.current));
            setIsListening(false);
            onListeningStateChangeRef.current(false);
            return;
          }

          // これまでに認識したテキストを baseText に統合して新規セッションに引き継ぐ
          if (sessionFinalRef.current) {
            const base = baseTextRef.current;
            baseTextRef.current = base
              ? `${base}${base.endsWith(" ") || base.endsWith("、") || base.endsWith("。") ? "" : " "}${sessionFinalRef.current.trim()}`
              : sessionFinalRef.current.trim();
            sessionFinalRef.current = "";
          }

          // WebKit では同一インスタンスを start() できないため、新規インスタンスを生成して再開する
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (!isManuallyStoppedRef.current && isCurrent()) {
              startRecognitionSession();
            }
          }, 80);
          return;
        }

        statusRef.current = "idle";
        setIsListening(false);
        onListeningStateChangeRef.current(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      if (startingSafetyTimerRef.current) {
        clearTimeout(startingSafetyTimerRef.current);
        startingSafetyTimerRef.current = null;
      }
      statusRef.current = "idle";
      console.error("Failed to start speech recognition:", e);
      setErrorMessage("マイクを起動できませんでした。キーボードでの入力をお試しください。");
      setIsListening(false);
      onListeningStateChangeRef.current(false);
    }
  }, [stopAllAudioInternal]);

  /**
   * ユーザージェスチャー（ボタンタップ）から直接呼び出される関数
   * iOS WebKit のユーザージェスチャー制限を回避するため、タイマーを介さず同期的にマイクを起動する
   */
  const startListening = useCallback(() => {
    if (disabled || typeof window === "undefined") return;
    if (statusRef.current === "starting" || statusRef.current === "listening") return;

    // マイクがブロックされていると分かっている場合は案内だけを表示する
    if (micPermissionRef.current === "denied") {
      setErrorMessage(getNotAllowedMessage(isSimpleRef.current));
      return;
    }

    // ① 同期的にすべての音声を即座に完全停止（バージイン: AI音声を遮断）
    if (onBeforeStartRef.current) {
      try {
        onBeforeStartRef.current();
      } catch (_) {}
    }
    stopAllAudioInternal();

    clearAllTimers();

    isManuallyStoppedRef.current = false;
    statusRef.current = "starting";
    audioCaptureRetriesRef.current = 0;
    rapidEndCountRef.current = 0;
    sessionStartedAtRef.current = null;

    // ② 即時リスニング状態へ遷移（UIの即応性を確保）
    setIsListening(true);
    onListeningStateChangeRef.current(true);

    // 録音開始時のテキストをベースとして退避
    baseTextRef.current = currentTextRef.current.trim();
    sessionFinalRef.current = "";

    // ③ ユーザージェスチャー直下で同期的・即座に認識セッションを開始する（iOS Safari での遅延・ブロックを完全根絶）
    startRecognitionSession();
  }, [disabled, stopAllAudioInternal, clearAllTimers, startRecognitionSession]);

  const toggleListening = () => {
    if (isListening || statusRef.current === "listening" || statusRef.current === "starting") {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
        {isSimple
          ? "※ このがめんではマイクがつかえません。したの枠から文字をいれてね。"
          : "※ お使いのブラウザは音声入力に対応していません。下の枠から直接文字を入力してください。"}
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
              <span>{isSimple ? "お話し中（おわったらタップ）" : "お話し中（タップで停止）"}</span>
            </>
          ) : (
            <>
              <Mic size={22} />
              <span>{isSimple ? "マイクを押してお話しする" : "マイクを押して声で話す"}</span>
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
            {isSimple ? "マイクがきいているよ…" : "マイクが聞いています…"}
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