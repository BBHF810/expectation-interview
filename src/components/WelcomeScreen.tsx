import React from "react";
import { User, Users, Sparkles, BookOpen } from "lucide-react";

interface WelcomeScreenProps {
  onStartSingle: () => void;
  onStartPair: () => void;
}

/**
 * iOS Safari環境におけるAVAudioSessionプライミングおよびマイク権限先行取得
 * 体験開始ボタン押下時に一瞬だけgetUserMediaを呼び出して即座に停止することで、
 * ① マイク権限ダイアログをこの初期画面で確定させる（インタビュー中のダイアログ出現を防止）
 * ② iOSのAudioSessionをPlayAndRecord対応ハードウェアとして先行初期化する
 */
function primeAudioSessionIOS(): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!isIOS) return;

  try {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (_) {}
          });
        })
        .catch((e) => {
          // ユーザーがマイク拒否した場合や利用不可環境でも問題なし
          console.debug("[primeAudioSessionIOS] skipped or denied:", e);
        });
    }
  } catch (e) {
    console.debug("[primeAudioSessionIOS] skipped or denied:", e);
  }
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSingle,
  onStartPair,
}) => {
  const handleStartSingle = () => {
    primeAudioSessionIOS();
    onStartSingle();
  };

  const handleStartPair = () => {
    primeAudioSessionIOS();
    onStartPair();
  };

  return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.75rem" }}>
      <div
        style={{
          display: "inline-flex",
          padding: "0.75rem",
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-primary)",
          marginBottom: "1.25rem",
        }}
      >
        <span style={{ fontSize: "2.25rem" }}>🌱</span>
      </div>

      <h1 className="title" style={{ fontSize: "1.875rem", marginBottom: "0.75rem", lineHeight: 1.35 }}>
        AIに話して見つける、
        <br />
        <span style={{ color: "var(--color-primary)" }}>すれ違いのカタチ</span>
      </h1>

      <p className="subtitle" style={{ fontSize: "1.025rem", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
        身近な人との最近の出来事やちょっとしたすれ違いをAIとお話ししてみませんか？
        <br />
        対話の最後にお互いの気持ちの受け止めや未来の関係性を<strong>【かわいい動物タイプ】</strong>で楽しく診断します！
        <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          ⏱️ 所要時間：約3分（質問は3つだけ）
        </span>
      </p>

      {/* 体験開始ボタン群 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={handleStartSingle}
          className="btn btn-primary"
          style={{ width: "100%", padding: "1.1rem 1rem", fontSize: "1.15rem", borderRadius: "var(--radius-md)" }}
          aria-label="ひとりで体験するを開始"
        >
          <User size={24} />
          ひとりで体験する
        </button>

        <button
          type="button"
          onClick={handleStartPair}
          className="btn btn-secondary"
          style={{
            width: "100%",
            padding: "1.1rem 1rem",
            fontSize: "1.15rem",
            border: "2px solid #FED7AA",
            backgroundColor: "#FFF7ED",
            color: "var(--color-primary)",
            fontWeight: 700,
            borderRadius: "var(--radius-md)",
          }}
          aria-label="ふたりで体験するを開始"
        >
          <Users size={24} />
          ふたりで体験する
        </button>
      </div>
    </div>
  );
};