"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, X, Trash2, Copy, Check, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useVoiceInputMode } from "@/contexts/VoiceInputContext";
import { getDevLogButtonVisible, DEVLOG_VISIBILITY_EVENT } from "@/lib/devlog-settings";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "log" | "info" | "warn" | "error";
  messages: string[];
}

const MAX_LOGS = 200;

function formatTimestamp(d: Date): string {
  const pad = (n: number, s = 2) => n.toString().padStart(s, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function stringifyArg(arg: any): string {
  if (arg === undefined) return "undefined";
  if (arg === null) return "null";
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

export interface DevConsoleViewerProps {
  forceVisible?: boolean;
}

export const DevConsoleViewer: React.FC<DevConsoleViewerProps> = ({ forceVisible = false }) => {
  const { mode: voiceMode, setMode: setVoiceMode } = useVoiceInputMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(() => {
    if (forceVisible) return true;
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      return true;
    }
    return getDevLogButtonVisible();
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "log">("all");
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 運営者画面からの表示・非表示切り替えイベントをリッスン
  useEffect(() => {
    if (forceVisible) {
      setIsButtonVisible(true);
      return;
    }
    const sync = (e?: any) => {
      if (e?.detail !== undefined) {
        setIsButtonVisible(Boolean(e.detail));
      } else {
        setIsButtonVisible(getDevLogButtonVisible());
      }
    };
    window.addEventListener(DEVLOG_VISIBILITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEVLOG_VISIBILITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [forceVisible]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addEntry = (level: "log" | "info" | "warn" | "error", args: any[]) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: formatTimestamp(new Date()),
        level,
        messages: args.map(stringifyArg),
      };
      setLogs((prev) => {
        const next = [...prev, entry];
        if (next.length > MAX_LOGS) {
          return next.slice(next.length - MAX_LOGS);
        }
        return next;
      });
    };

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      addEntry("log", args);
    };
    console.info = (...args: any[]) => {
      originalInfo.apply(console, args);
      addEntry("info", args);
    };
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      addEntry("warn", args);
    };
    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      addEntry("error", args);
    };

    const handleError = (event: ErrorEvent) => {
      addEntry("error", [`[Uncaught Error] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      addEntry("error", [`[Unhandled Rejection] ${stringifyArg(event.reason)}`]);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  // 新しいログが追加されたら最下部にスクロール
  useEffect(() => {
    if (isOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const errorCount = logs.filter((l) => l.level === "error").length;
  const filteredLogs = logs.filter((l) => {
    if (filter === "all") return true;
    if (filter === "log") return l.level === "log" || l.level === "info";
    return l.level === filter;
  });

  const handleCopyLogs = async () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.messages.join(" ")}`)
      .join("\n");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy logs", e);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (!isButtonVisible) {
    return null;
  }

  return (
    <>
      {/* 画面右下の控えめな開発者用トグルボタン */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "12px",
          right: "12px",
          zIndex: 99998,
          background: "rgba(30, 41, 59, 0.85)",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "9999px",
          padding: "6px 12px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(6px)",
          transition: "all 0.2s ease",
          opacity: isOpen ? 1 : 0.8,
        }}
        aria-label="開発者用コンソールログを開く"
        title="開発者用ログ（タップで開閉）"
      >
        <Terminal size={14} color="#38BDF8" />
        <span>DevLog</span>
        {errorCount > 0 && (
          <span
            style={{
              background: "#EF4444",
              color: "#FFFFFF",
              borderRadius: "9999px",
              padding: "1px 6px",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            {errorCount}
          </span>
        )}
      </button>

      {/* コンソールオーバーレイパネル */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "52px",
            right: "12px",
            left: "12px",
            maxWidth: "700px",
            margin: "0 auto",
            maxHeight: "55vh",
            height: "420px",
            backgroundColor: "#0F172A",
            color: "#E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            border: "1px solid #334155",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#1E293B",
              borderBottom: "1px solid #334155",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={16} color="#38BDF8" />
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#F8FAFC" }}>
                iPad コンソールログ ({logs.length})
              </span>
            </div>

            {/* フィルタータブ */}
            <div style={{ display: "flex", gap: "4px" }}>
              {(["all", "error", "warn", "log"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: filter === f ? "#38BDF8" : "#334155",
                    color: filter === f ? "#0F172A" : "#CBD5E1",
                    fontWeight: filter === f ? 700 : 500,
                  }}
                >
                  {f === "all" ? "All" : f === "error" ? "Error" : f === "warn" ? "Warn" : "Log"}
                </button>
              ))}
            </div>

            {/* アクションボタン */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={handleCopyLogs}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  backgroundColor: "#334155",
                  color: "#E2E8F0",
                  border: "none",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                title="ログをクリップボードにコピー"
              >
                {copied ? <Check size={12} color="#4ADE80" /> : <Copy size={12} />}
                <span>{copied ? "コピー完了" : "コピー"}</span>
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  backgroundColor: "#334155",
                  color: "#E2E8F0",
                  border: "none",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                title="ログをクリア"
              >
                <Trash2 size={12} />
                <span>消去</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "4px",
                  backgroundColor: "transparent",
                  color: "#94A3B8",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                title="閉じる"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 音声入力モード切り替えバー */}
          <div
            style={{
              padding: "6px 12px",
              backgroundColor: "#0B132B",
              borderBottom: "1px solid #1E293B",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#94A3B8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              🎙️ 音声入力モード:
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setVoiceMode("web_speech_api")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: voiceMode === "web_speech_api" ? "#38BDF8" : "#334155",
                  backgroundColor: voiceMode === "web_speech_api" ? "#0284C7" : "#1E293B",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: voiceMode === "web_speech_api" ? 700 : 400,
                  fontSize: "0.7rem",
                }}
              >
                Web Speech API (本番標準)
              </button>
              <button
                type="button"
                onClick={() => setVoiceMode("media_recorder")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: voiceMode === "media_recorder" ? "#F59E0B" : "#334155",
                  backgroundColor: voiceMode === "media_recorder" ? "#D97706" : "#1E293B",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: voiceMode === "media_recorder" ? 700 : 400,
                  fontSize: "0.7rem",
                }}
              >
                MediaRecorder + Whisper (検証)
              </button>
            </div>
          </div>

          {/* ログリスト */}
          <div
            ref={logContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              backgroundColor: "#0F172A",
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ color: "#64748B", textAlign: "center", padding: "2rem" }}>
                ログはありません
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isErr = log.level === "error";
                const isWarn = log.level === "warn";
                const isInfo = log.level === "info";
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: "4px 6px",
                      borderRadius: "4px",
                      backgroundColor: isErr
                        ? "rgba(239, 68, 68, 0.15)"
                        : isWarn
                        ? "rgba(245, 158, 11, 0.12)"
                        : "rgba(255, 255, 255, 0.03)",
                      borderLeft: `3px solid ${
                        isErr ? "#EF4444" : isWarn ? "#F59E0B" : isInfo ? "#38BDF8" : "#64748B"
                      }`,
                      wordBreak: "break-all",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ color: "#64748B", fontSize: "0.7rem" }}>{log.timestamp}</span>
                      {isErr ? (
                        <span style={{ color: "#EF4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <AlertCircle size={10} /> ERROR
                        </span>
                      ) : isWarn ? (
                        <span style={{ color: "#F59E0B", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <AlertTriangle size={10} /> WARN
                        </span>
                      ) : isInfo ? (
                        <span style={{ color: "#38BDF8", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <Info size={10} /> INFO
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontWeight: 600 }}>LOG</span>
                      )}
                    </div>
                    <div style={{ color: isErr ? "#FCA5A5" : isWarn ? "#FDE68A" : "#F1F5F9" }}>
                      {log.messages.join(" ")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};
