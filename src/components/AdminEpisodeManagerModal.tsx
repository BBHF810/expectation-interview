"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Download, Trash2, Database, Users, User, FileSpreadsheet, FileCode, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Volume2, Play, Square, Settings2 } from "lucide-react";
import { CollectedEpisode } from "@/types";
import {
  getStoredEpisodes,
  clearStoredEpisodes,
  exportEpisodesAsCsv,
  exportEpisodesAsJson,
} from "@/lib/episode-storage";
import { TTS_VOICES, TtsVoiceId, getSavedTtsVoice, saveTtsVoice, DEFAULT_TTS_VOICE } from "@/lib/tts-voices";

interface AdminEpisodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEpisodeManagerModal: React.FC<AdminEpisodeManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"episodes" | "voice">("episodes");
  const [episodes, setEpisodes] = useState<CollectedEpisode[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "single" | "pair">("all");
  const [filterExp, setFilterExp] = useState<"all" | "matched" | "mismatched" | "neutral">("all");
  const [selectedVoice, setSelectedVoice] = useState<TtsVoiceId>(DEFAULT_TTS_VOICE);
  const [playingVoice, setPlayingVoice] = useState<TtsVoiceId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const refreshData = () => {
    const list = getStoredEpisodes();
    setEpisodes(list);
  };

  useEffect(() => {
    if (isOpen) {
      setPinInput("");
      setPinError(false);
      setSelectedVoice(getSavedTtsVoice());
      if (isAuthenticated) {
        refreshData();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setPlayingVoice(null);
    }
  }, [isOpen, isAuthenticated]);

  const handlePlayVoice = async (voiceId: TtsVoiceId) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingVoice === voiceId && isPlaying) {
      setIsPlaying(false);
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);
    setIsPlaying(true);

    try {
      const sampleText = "こんにちは！工大祭の体験展示へようこそ。お話しできるのを楽しみにしています。";
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText, voice: voiceId }),
      });

      if (!res.ok) {
        throw new Error("TTS generation failed");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setPlayingVoice(null);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setPlayingVoice(null);
      };

      await audio.play();
    } catch (err) {
      console.error("Failed to play TTS voice sample", err);
      setIsPlaying(false);
      setPlayingVoice(null);
      alert("音声の試聴に失敗しました。OpenAI APIキーが正しく設定されているかご確認ください。");
    }
  };

  const handleSelectVoice = (voiceId: TtsVoiceId) => {
    saveTtsVoice(voiceId);
    setSelectedVoice(voiceId);
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "2026") {
      setIsAuthenticated(true);
      setPinError(false);
      refreshData();
    } else {
      setPinError(true);
    }
  };

  // 未認証時はPIN入力画面を表示
  if (!isAuthenticated) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0 0 0.5rem" }}>スタッフ専用認証</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "0 0 1.5rem" }}>
            エピソードデータの閲覧・管理には暗証番号が必要です。
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="暗証番号を入力"
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1.5rem",
                  letterSpacing: "0.25em",
                  textAlign: "center",
                  borderRadius: "var(--radius-md)",
                  border: pinError ? "2px solid #EF4444" : "2px solid var(--color-border)",
                  outline: "none",
                }}
              />
              {pinError && (
                <div style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                  暗証番号が正しくありません
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                ロック解除
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 統計集計
  const totalCount = episodes.length;
  const singleCount = episodes.filter((e) => e.mode === "single").length;
  const pairCount = episodes.filter((e) => e.mode === "pair").length;
  const matchedCount = episodes.filter((e) => e.expectationType === "matched").length;
  const mismatchedCount = episodes.filter((e) => e.expectationType === "mismatched").length;
  const neutralCount = episodes.filter((e) => e.expectationType === "neutral").length;

  // フィルタリング
  const filteredEpisodes = episodes.filter((e) => {
    if (filterMode !== "all" && e.mode !== filterMode) return false;
    if (filterExp !== "all" && e.expectationType !== filterExp) return false;
    return true;
  });

  const handleClear = () => {
    if (window.confirm("これまでに収集したローカルデータをすべて消去しますか？\n（事前にCSVやJSONのエクスポートを推奨します）")) {
      clearStoredEpisodes();
      refreshData();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "850px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          padding: "1.75rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                color: "#2563eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                display: "flex",
              }}
            >
              <Database size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                エピソードデータ管理（展示スタッフ・研究用）
              </h2>
              <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-muted)" }}>
                端末ローカルに蓄積された「相互期待感」エピソードの閲覧・集計・CSV出力
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0.25rem",
            }}
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>

        {/* スタッフ管理画面のメインタブ切り替え */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            borderBottom: "2px solid var(--color-border)",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("episodes")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              fontSize: "0.95rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: activeTab === "episodes" ? "#EFF6FF" : "transparent",
              color: activeTab === "episodes" ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottom: activeTab === "episodes" ? "3px solid var(--color-primary)" : "3px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            <Database size={18} />
            エピソードデータ管理 ({episodes.length}件)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              fontSize: "0.95rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: activeTab === "voice" ? "#EFF6FF" : "transparent",
              color: activeTab === "voice" ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottom: activeTab === "voice" ? "3px solid var(--color-primary)" : "3px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            <Volume2 size={18} />
            AI音声・しゃべり方設定（{TTS_VOICES.find((v) => v.id === selectedVoice)?.name}）
          </button>
        </div>

        {activeTab === "voice" ? (
          /* --- AI音声・しゃべり方設定タブ --- */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #86EFAC",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#166534" }}>
                <Volume2 size={18} />
                <span>OpenAI TTS 声質（ボイス）の聴き比べ・切り替え</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#166534", lineHeight: 1.5 }}>
                OpenAI公式の6種類の音声（TTS）をその場で試聴できます。「この声にする」を選択すると、展示本番のAI発話音声が即座に切り替わります（1人モード・2人モード共通）。
              </p>
            </div>

            {/* ボイスカード一覧 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1rem" }}>
              {TTS_VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                const isVoicePlaying = playingVoice === v.id && isPlaying;

                return (
                  <div
                    key={v.id}
                    style={{
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1.25rem",
                      background: isSelected ? "#F0F9FF" : "#FFFFFF",
                      boxShadow: isSelected ? "0 4px 12px rgba(2, 132, 199, 0.15)" : "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{v.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-text-main)" }}>
                              {v.name}
                            </div>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "var(--radius-full)",
                                background: v.genderLabel === "女性的" ? "#FCE7F3" : v.genderLabel === "男性的" ? "#DBEAFE" : "#F3F4F6",
                                color: v.genderLabel === "女性的" ? "#BE185D" : v.genderLabel === "男性的" ? "#1D4ED8" : "#4B5563",
                                fontWeight: 700,
                              }}
                            >
                              {v.genderLabel}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#166534",
                              background: "#DCFCE7",
                              border: "1px solid #86EFAC",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "var(--radius-full)",
                            }}
                          >
                            <CheckCircle size={14} />
                            適用中
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.35rem" }}>
                        {v.tagline}
                      </div>

                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                        {v.description}
                      </p>
                    </div>

                    {/* アクションボタン */}
                    <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(v.id)}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                          background: isVoicePlaying ? "#EF4444" : "#F1F5F9",
                          color: isVoicePlaying ? "#FFFFFF" : "var(--color-text-main)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        {isVoicePlaying ? (
                          <>
                            <Square size={14} fill="currentColor" />
                            停止
                          </>
                        ) : (
                          <>
                            <Play size={14} fill="currentColor" />
                            試聴する
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectVoice(v.id)}
                        disabled={isSelected}
                        className={isSelected ? "btn btn-outline" : "btn btn-primary"}
                        style={{
                          flex: 1,
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                          opacity: isSelected ? 0.7 : 1,
                        }}
                      >
                        {isSelected ? "選択済み" : "この声にする"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- エピソードデータ管理タブ --- */
          <>
        {/* 統計サマリーバー */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>総収集エピソード</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0284c7" }}>{totalCount} 件</div>
          </div>
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>体験モード</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, marginTop: "0.25rem" }}>
              一人: {singleCount} / ペア: {pairCount}
            </div>
          </div>
          <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#065f46" }}>一致（期待どおり）</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669" }}>{matchedCount} 件</div>
          </div>
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#991b1b" }}>不一致（すれ違い）</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626" }}>{mismatchedCount} 件</div>
          </div>
          <div style={{ backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#475569" }}>どちらともいえない</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#64748b" }}>{neutralCount} 件</div>
          </div>
        </div>

        {/* アクションボタンバー */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            marginBottom: "1.25rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <button
            onClick={() => exportEpisodesAsCsv(episodes)}
            disabled={episodes.length === 0}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", padding: "0.5rem 1rem" }}
          >
            <FileSpreadsheet size={16} />
            CSVダウンロード（Excel対応）
          </button>

          <button
            onClick={() => exportEpisodesAsJson(episodes)}
            disabled={episodes.length === 0}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", padding: "0.5rem 1rem" }}
          >
            <FileCode size={16} />
            JSONダウンロード
          </button>

          <button
            onClick={refreshData}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", padding: "0.5rem 0.85rem" }}
            title="最新データに更新"
          >
            <RefreshCw size={15} />
            更新
          </button>

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={handleClear}
              disabled={episodes.length === 0}
              className="btn"
              style={{
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderColor: "#fecaca",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.875rem",
                padding: "0.5rem 0.85rem",
              }}
            >
              <Trash2 size={15} />
              全データ消去
            </button>
          </div>
        </div>

        {/* フィルタバー */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)", marginRight: "0.4rem" }}>モード:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              style={{ padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)" }}
            >
              <option value="all">すべて ({episodes.length})</option>
              <option value="single">一人体験のみ ({singleCount})</option>
              <option value="pair">二人体験のみ ({pairCount})</option>
            </select>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", marginRight: "0.4rem" }}>期待感:</span>
            <select
              value={filterExp}
              onChange={(e) => setFilterExp(e.target.value as any)}
              style={{ padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)" }}
            >
              <option value="all">すべて</option>
              <option value="matched">一致 ({matchedCount})</option>
              <option value="mismatched">不一致 ({mismatchedCount})</option>
              <option value="neutral">どちらともいえない ({neutralCount})</option>
            </select>
          </div>
        </div>

        {/* エピソード一覧 */}
        {filteredEpisodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            まだ保存されたエピソードデータがありません。<br />
            （インタビューを最後まで完了すると自動的にここに蓄積されます）
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredEpisodes.map((ep) => {
              const isExpanded = expandedId === ep.id;
              const isMatched = ep.expectationType === "matched";
              const isMismatched = ep.expectationType === "mismatched";

              return (
                <div
                  key={ep.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    padding: "0.85rem 1rem",
                    backgroundColor: isExpanded ? "#f8fafc" : "#ffffff",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "1rem",
                          backgroundColor: ep.mode === "single" ? "#e0f2fe" : "#f3e8ff",
                          color: ep.mode === "single" ? "#0369a1" : "#7e22ce",
                        }}
                      >
                        {ep.mode === "single" ? "一人体験" : "ペア体験"}
                      </span>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "1rem",
                          backgroundColor: isMatched ? "#dcfce7" : isMismatched ? "#fee2e2" : "#f1f5f9",
                          color: isMatched ? "#15803d" : isMismatched ? "#b91c1c" : "#475569",
                        }}
                      >
                        {isMatched ? "一致（期待どおり）" : isMismatched ? "不一致（すれ違い）" : "どちらともいえない"}
                      </span>

                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                        {ep.mode === "single"
                          ? `相手: ${ep.partner || "家族"} (${ep.ageGroup === "under_10" ? "10歳以下" : ep.ageGroup || ""})`
                          : `${ep.nameA} × ${ep.nameB} (${ep.relationship})`}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(ep.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* 展開時の詳細表示 */}
                  {isExpanded && (
                    <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px dashed var(--border-color)", fontSize: "0.875rem" }}>
                      <div style={{ marginBottom: "0.6rem" }}>
                        <strong style={{ color: "var(--primary-color)" }}>【振り返り要約】</strong>
                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-main)", lineHeight: 1.5 }}>
                          {ep.summary.reflection}
                        </p>
                      </div>

                      {ep.summary.diagnosisTitle && (
                        <div style={{ marginBottom: "0.6rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                          <strong>診断結果:</strong> {ep.summary.diagnosisTitle}
                        </div>
                      )}

                      <div style={{ marginTop: "0.6rem" }}>
                        <strong style={{ color: "#475569" }}>【対話履歴（{ep.turns.length}問）】</strong>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.3rem" }}>
                          {ep.turns.map((t, idx) => (
                            <div key={idx} style={{ backgroundColor: "#ffffff", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)" }}>
                              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                                質問{idx + 1} {t.speaker ? `(${t.speaker})` : ""}: {t.question}
                              </div>
                              <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "0.2rem" }}>
                                回答: {t.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};