import React, { useState, useEffect } from "react";
import { ArrowRight, RotateCcw, XCircle, Bot, Loader2, AlertCircle } from "lucide-react";

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmitAnswer(answer.trim(), false);
  };

  const handleSkip = (reason: "dont_know" | "no_answer") => {
    if (isLoading) return;
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

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onFinishEarly}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ minHeight: "36px", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }}
            title="ここで対話を終えて振り返りを表示します"
          >
            <XCircle size={16} />
            体験を終了する
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
            最初からやり直す
          </button>
        </div>
      </div>

      {/* AI質問表示エリア（チャット吹き出し風） */}
      <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", marginTop: "0.5rem" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-primary)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <Bot size={26} />
        </div>

        <div
          style={{
            background: "var(--color-primary-light)",
            border: "1px solid var(--color-primary-border)",
            borderRadius: "4px var(--radius-lg) var(--radius-lg) var(--radius-lg)",
            padding: "1.25rem 1.5rem",
            maxWidth: "100%",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.25rem" }}>
            AIインタビュアー
          </div>
          <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-main)", lineHeight: 1.5 }}>
            {currentQuestion}
          </p>
        </div>
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
          <Loader2 className="animate-spin" size={36} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <span style={{ fontSize: "1.05rem", fontWeight: 500 }}>
            AIが回答を読み込んでいます…
          </span>
          {longWait && (
            <div className="banner banner-yellow" style={{ marginTop: "0.5rem" }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>少し時間がかかっています。このままお待ちいただくか、通信が不安定な場合は固定の質問に切り替わります。</span>
            </div>
          )}
        </div>
      ) : (
        /* 回答入力エリア */
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          <div>
            <label htmlFor="user-answer" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              {isSimple ? "あなたのお返事" : "あなたの回答（最大500文字）"}
            </label>
            <textarea
              id="user-answer"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
              placeholder={isSimple ? "ここに書いてね（短くてもだいじょうぶです）" : "思ったことや出来事を自由に書いてください（短文でも構いません）"}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--color-border)",
                resize: "vertical",
                minHeight: "100px",
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
              style={{ minWidth: "140px" }}
            >
              次へ
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
