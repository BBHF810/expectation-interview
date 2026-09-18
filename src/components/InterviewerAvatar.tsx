"use client";

import React from "react";

export type AvatarStatus = "idle" | "speaking" | "listening" | "thinking";

interface InterviewerAvatarProps {
  status: AvatarStatus;
  size?: number;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  status,
  size = 140,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        position: "relative",
      }}
      aria-label={`AIインタビュアーの状態: ${
        status === "speaking"
          ? "お話し中"
          : status === "listening"
          ? "お話を聞いています"
          : status === "thinking"
          ? "考えています"
          : "待機中"
      }`}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s ease",
          animation: status === "thinking" ? "avatar-tilt 2s infinite ease-in-out" : "avatar-breathe 3.5s infinite ease-in-out",
        }}
      >
        {/* 背景の光・パルスエフェクト */}
        {status === "listening" && (
          <div
            style={{
              position: "absolute",
              width: "125%",
              height: "125%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 70%)",
              animation: "avatar-pulse 1.2s infinite ease-out",
            }}
          />
        )}
        {status === "speaking" && (
          <div
            style={{
              position: "absolute",
              width: "120%",
              height: "120%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)",
              animation: "avatar-pulse 1.6s infinite ease-out",
            }}
          />
        )}

        {/* メインアバターSVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* アンテナ */}
          <rect x="67" y="10" width="6" height="18" rx="3" fill="#3B82F6" />
          <circle
            cx="70"
            cy="10"
            r="8"
            fill={status === "speaking" ? "#10B981" : status === "listening" ? "#F59E0B" : "#60A5FA"}
            className={status === "thinking" ? "antenna-glow" : ""}
          />

          {/* 頭部（やわらかい丸角） */}
          <rect
            x="20"
            y="26"
            width="100"
            height="86"
            rx="28"
            fill="#FFFFFF"
            stroke="#3B82F6"
            strokeWidth="5"
          />

          {/* フェイスディスプレイ面 */}
          <rect
            x="28"
            y="36"
            width="84"
            height="66"
            rx="20"
            fill={status === "listening" ? "#EFF6FF" : "#F8FAFC"}
          />

          {/* 耳（左右） */}
          <rect
            x="10"
            y="54"
            width="10"
            height="30"
            rx="5"
            fill={status === "listening" ? "#3B82F6" : "#93C5FD"}
            style={{
              transformOrigin: "center",
              transform: status === "listening" ? "scaleY(1.15)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
          <rect
            x="120"
            y="54"
            width="10"
            height="30"
            rx="5"
            fill={status === "listening" ? "#3B82F6" : "#93C5FD"}
            style={{
              transformOrigin: "center",
              transform: status === "listening" ? "scaleY(1.15)" : "none",
              transition: "transform 0.2s ease",
            }}
          />

          {/* 目（左目・右目） */}
          {status === "thinking" ? (
            <>
              {/* 考え中の目（右上を向く） */}
              <circle cx="52" cy="58" r="6" fill="#1E293B" />
              <circle cx="54" cy="56" r="2" fill="#FFFFFF" />
              <circle cx="88" cy="58" r="6" fill="#1E293B" />
              <circle cx="90" cy="56" r="2" fill="#FFFFFF" />
            </>
          ) : status === "listening" ? (
            <>
              {/* 聴き取り中の目（ぱっちり・キラキラ） */}
              <circle cx="50" cy="62" r="7" fill="#1D4ED8" />
              <circle cx="48" cy="60" r="2.5" fill="#FFFFFF" />
              <circle cx="90" cy="62" r="7" fill="#1D4ED8" />
              <circle cx="88" cy="60" r="2.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* 通常・お話し中の目（瞬きアニメーションつき） */}
              <g className="avatar-eyes">
                <ellipse cx="50" cy="62" rx="6" ry="7" fill="#1E293B" />
                <circle cx="48" cy="60" r="2.5" fill="#FFFFFF" />
                <ellipse cx="90" cy="62" rx="6" ry="7" fill="#1E293B" />
                <circle cx="88" cy="60" r="2.5" fill="#FFFFFF" />
              </g>
            </>
          )}

          {/* ほっぺ（ほんのりピンク） */}
          <circle cx="40" cy="74" r="5" fill="#FCA5A5" opacity="0.6" />
          <circle cx="100" cy="74" r="5" fill="#FCA5A5" opacity="0.6" />

          {/* 口（状態によって変化） */}
          {status === "speaking" ? (
            <ellipse
              cx="70"
              cy="80"
              rx="9"
              ry="7"
              fill="#E11D48"
              className="mouth-speaking"
            />
          ) : status === "listening" ? (
            <path
              d="M62 80 Q70 86 78 80"
              stroke="#1D4ED8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          ) : status === "thinking" ? (
            <circle cx="70" cy="80" r="4" fill="#64748B" />
          ) : (
            <path
              d="M62 79 Q70 85 78 79"
              stroke="#334155"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* ネクタイ / ブローチ飾り */}
          <polygon points="70,114 62,126 78,126" fill="#F59E0B" />
        </svg>
      </div>

      {/* 状態ラベルバッジ */}
      <div
        style={{
          marginTop: "0.5rem",
          padding: "0.25rem 0.85rem",
          borderRadius: "9999px",
          fontSize: "0.85rem",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          background:
            status === "speaking"
              ? "#DCFCE7"
              : status === "listening"
              ? "#FEF3C7"
              : status === "thinking"
              ? "#F1F5F9"
              : "#EFF6FF",
          color:
            status === "speaking"
              ? "#15803D"
              : status === "listening"
              ? "#B45309"
              : status === "thinking"
              ? "#475569"
              : "#1D4ED8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "currentColor",
            display: "inline-block",
            animation: status !== "idle" ? "avatar-pulse 1s infinite" : "none",
          }}
        />
        {status === "speaking" && "お話し中（聞いてね）"}
        {status === "listening" && "あなたの声を聞いています…"}
        {status === "thinking" && "質問を考えています…"}
        {status === "idle" && "あなたのペースで話してください"}
      </div>

      <style>{`
        @keyframes avatar-breathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes avatar-tilt {
          0%, 100% { transform: rotate(0deg) translateY(-2px); }
          50% { transform: rotate(4deg) translateY(-4px); }
        }
        @keyframes avatar-pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes mouth-move {
          0%, 100% { transform: scaleY(0.7); }
          50% { transform: scaleY(1.3); }
        }
        .mouth-speaking {
          transform-origin: 70px 80px;
          animation: mouth-move 0.25s infinite alternate ease-in-out;
        }
        @keyframes eyes-blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
        .avatar-eyes {
          transform-origin: 70px 62px;
          animation: eyes-blink 4.5s infinite;
        }
      `}</style>
    </div>
  );
};