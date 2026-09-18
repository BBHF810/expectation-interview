"use client";

import React, { useState, useEffect } from "react";
import { X, Download, Trash2, Database, Users, User, FileSpreadsheet, FileCode, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { CollectedEpisode } from "@/types";
import {
  getStoredEpisodes,
  clearStoredEpisodes,
  exportEpisodesAsCsv,
  exportEpisodesAsJson,
} from "@/lib/episode-storage";

interface AdminEpisodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEpisodeManagerModal: React.FC<AdminEpisodeManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [episodes, setEpisodes] = useState<CollectedEpisode[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "single" | "pair">("all");
  const [filterExp, setFilterExp] = useState<"all" | "matched" | "mismatched" | "neutral">("all");

  const refreshData = () => {
    const list = getStoredEpisodes();
    setEpisodes(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      </div>
    </div>
  );
};