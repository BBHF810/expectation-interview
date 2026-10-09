"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, RotateCcw, XCircle, Loader2, AlertCircle, Volume2, VolumeX, Edit3, Mic, Keyboard } from "lucide-react";
import { InterviewerAvatar, AvatarStatus } from "./InterviewerAvatar";
import { VoiceInput } from "./VoiceInput";
import { InputMethod } from "@/types";
import { unlockAudioOnUserAction } from "@/lib/tts-client";
import { useSpeechPlayback } from "@/hooks/useSpeechPlayback";
import { FuriganaText } from "./FuriganaText";

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [currentInputMethod, setCurrentInputMethod] = useState<InputMethod>(inputMethod);

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

  const {
    isSpeaking,
    isPreparing: isAudioPreparing,
    needsTap: audioNeedsTap,
    stop: stopAllAudio,
    replay: replayQuestionAudio,
  } = useSpeechPlayback({
    text: currentQuestion,
    enabled: isSpeechEnabled,
    blocked: isLoading,
    preferredSrc: audioStreamingUrl,
  });

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
    stopAllAudio();
    unlockAudioOnUserAction();
    onSubmitAnswer(answer.trim(), false);
  };

  const handleSkip = (reason: "dont_know" | "no_answer") => {
    if (isLoading) return;
    stopAllAudio();
    unlockAudioOnUserAction();
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
          {/* 音声読み上げ操作（発声中: ミュートマーク / 停止中: 音を出すマーク） */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                stopAllAudio();
              } else {
                if (!isSpeechEnabled) setIsSpeechEnabled(true);
                replayQuestionAudio();
              }
            }}
            className="btn btn-outline"
            style={{
              minHeight: "36px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.875rem",
              borderColor: isSpeaking ? "#FCA5A5" : undefined,
              backgroundColor: isSpeaking ? "#FEF2F2" : undefined,
            }}
            title={isSpeaking ? "AIのお話を止める（ミュート）" : "質問を音声で聞く"}
            aria-label={isSpeaking ? "AIのお話を止める" : "質問を音声で聞く"}
          >
            {isSpeaking ? (
              <VolumeX size={18} color="#DC2626" />
            ) : (
              <Volume2 size={18} color="var(--color-primary)" />
            )}
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
            {isSimple ? "おしまいにする" : "体験終了"}
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
            {isSimple ? "さいしょから" : "最初から"}
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
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.4rem",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--color-primary)",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            AIインタビュアーからの質問
          </span>
          {!isWaitingForSpeech && isSpeechEnabled && (
            <button
              type="button"
              onClick={replayQuestionAudio}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.775rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-full)",
                transition: "all 0.15s ease",
              }}
              title="質問をもう一度読み上げます"
              aria-label="質問をもう一度読み上げ"
            >
              <Volume2 size={14} />
              <span>もう一度聞く</span>
            </button>
          )}
        </div>
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: isWaitingForSpeech ? "var(--color-primary)" : "var(--color-text-main)",
            lineHeight: isSimple ? 1.9 : 1.5,
            margin: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isWaitingForSpeech ? (
            progress > 1
              ? "💭 お答えを受け止めて、次の質問を考えています…"
              : "💭 質問を準備しています…"
          ) : isSimple ? (
            <FuriganaText text={currentQuestion} />
          ) : (
            currentQuestion
          )}
        </p>

        {/* 自動再生制限（iPad Safari 等）でタップ待ちの場合の親切なガイドボタン */}
        {audioNeedsTap && (!isWaitingForSpeech || progress === 1) && (
          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={replayQuestionAudio}
              className="btn btn-primary"
              style={{
                fontSize: "0.9rem",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-full)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                margin: "0 auto",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Volume2 size={16} />
              <span>タップして質問を聞く 🔊</span>
            </button>
          </div>
        )}
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
                boxShadow: currentInputMethod === "voice" ? "0 2px 6px rgba(234, 88, 12, 0.25)" : "none",
              }}
            >
              <Mic size={16} />
              {isSimple ? "声でお話しする" : "音声入力"}
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
                boxShadow: currentInputMethod === "text" ? "0 2px 6px rgba(234, 88, 12, 0.25)" : "none",
              }}
            >
              <Keyboard size={16} />
              {isSimple ? "もじをうつ" : "文字入力（タイピング）"}
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
                      <span>
                        {isSimple
                          ? "AIがお話し中だよ。ボタンを押すとすぐに声でお話しできるよ"
                          : "AIがお話し中です。ボタンを押すと音声を止めてすぐにお話しできます"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "1.2rem" }}>🎙️</span>
                      <span>
                        {isSimple
                          ? "下のボタンを押して、声でお話ししてみてね"
                          : "下のボタンを押して、声でお話しください"}
                      </span>
                    </>
                  )}
                </div>
                <VoiceInput
                  currentText={answer}
                  onTranscriptChange={(newText) => setAnswer(newText)}
                  onListeningStateChange={(active) => {
                    setIsListening(active);
                    if (active) {
                      stopAllAudio();
                    }
                  }}
                  onBeforeStart={stopAllAudio}
                  isAiSpeaking={isSpeaking}
                  isSimple={isSimple}
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
                      {isSimple ? "ききとったことば：" : "聞き取った内容："}
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
                      {isSimple
                        ? showManualEdit
                          ? "なおすのをやめる"
                          : "もじをなおす"
                        : showManualEdit
                        ? "手直しを閉じる"
                        : "文字を手直しする"}
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
                  {isSimple
                    ? "（マイクボタンをおしてお話しすると、ここにことばがでるよ）"
                    : "（マイクボタンを押してお話しすると、ここに言葉が表示されます）"}
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
                boxShadow: answer.trim() ? "0 4px 12px rgba(234, 88, 12, 0.25)" : "none",
              }}
            >
              {isSimple ? "お返事して次へ" : "回答して次へ"}
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
              {isSimple ? "おもいつかない" : "思いつかない"}
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
              {isSimple ? "こたえたくない" : "答えたくない"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
