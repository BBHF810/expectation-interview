import { describe, it, expect, beforeEach } from "vitest";
import {
  saveEpisodeLocally,
  getStoredEpisodes,
  clearStoredEpisodes,
} from "@/lib/episode-storage";
import { CollectedEpisode } from "@/types";

describe("エピソードデータのローカル保存・管理 (episode-storage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockEpisodeSingle: CollectedEpisode = {
    id: "single_test_1",
    createdAt: "2026-09-18T10:00:00.000Z",
    mode: "single",
    ageGroup: "11_30",
    partner: "家族",
    isCare: "no",
    expectationType: "matched",
    turns: [
      { turnNumber: 1, question: "どんな出来事でしたか？", answer: "ケーキを買ってきてくれた" },
    ],
    summary: {
      expected: "ケーキを買ってきてくれること",
      actual: "ケーキでお祝いしてくれた",
      reflection: "気持ちが通じ合って嬉しい時間でした。",
      diagnosisTitle: "🐬 共感イルカ",
    },
  };

  const mockEpisodePair: CollectedEpisode = {
    id: "pair_test_1",
    createdAt: "2026-09-18T11:00:00.000Z",
    mode: "pair",
    nameA: "たろう",
    nameB: "はなこ",
    relationship: "友だち",
    expectationType: "mismatched",
    turns: [
      { turnNumber: 1, speaker: "たろう", question: "どんな出来事？", answer: "看板塗りを手伝ってほしかった" },
      { turnNumber: 2, speaker: "はなこ", question: "どう思った？", answer: "用事があって手伝えなかった" },
    ],
    summary: {
      perspectiveA: "手伝ってほしかった",
      perspectiveB: "都合が合わなかった",
      reflection: "少しすれ違ったけれど、お互いの状況を知るきっかけになりました。",
      diagnosisTitle: "息ぴったりのチームワークペア",
    },
  };

  it("初期状態では空の配列が返る", () => {
    expect(getStoredEpisodes()).toEqual([]);
  });

  it("一人用エピソードを正しく保存・取得できる", () => {
    saveEpisodeLocally(mockEpisodeSingle);
    const stored = getStoredEpisodes();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe("single_test_1");
    expect(stored[0].mode).toBe("single");
    expect(stored[0].expectationType).toBe("matched");
    expect(stored[0].summary.diagnosisTitle).toBe("🐬 共感イルカ");
  });

  it("複数件のエピソードを新しい順に保存できる", () => {
    saveEpisodeLocally(mockEpisodeSingle);
    saveEpisodeLocally(mockEpisodePair);
    const stored = getStoredEpisodes();
    expect(stored.length).toBe(2);
    expect(stored[0].id).toBe("pair_test_1"); // 新しいものが先頭
    expect(stored[1].id).toBe("single_test_1");
  });

  it("同一IDのエピソードは重複せず上書きされる", () => {
    saveEpisodeLocally(mockEpisodeSingle);
    const updated = { ...mockEpisodeSingle, expectationType: "neutral" as const };
    saveEpisodeLocally(updated);
    const stored = getStoredEpisodes();
    expect(stored.length).toBe(1);
    expect(stored[0].expectationType).toBe("neutral");
  });

  it("clearStoredEpisodes で全データが消去される", () => {
    saveEpisodeLocally(mockEpisodeSingle);
    saveEpisodeLocally(mockEpisodePair);
    expect(getStoredEpisodes().length).toBe(2);
    clearStoredEpisodes();
    expect(getStoredEpisodes().length).toBe(0);
  });

  it("ペアエピソード（4ターン）を保存して正しく保持できる", () => {
    const pair4Turns: CollectedEpisode = {
      ...mockEpisodePair,
      id: "pair_4turns",
      turns: [
        { turnNumber: 1, speaker: "たろう", question: "Q1", answer: "A1" },
        { turnNumber: 2, speaker: "はなこ", question: "Q2", answer: "A2" },
        { turnNumber: 3, speaker: "たろう", question: "Q3", answer: "A3" },
        { turnNumber: 4, speaker: "はなこ", question: "Q4", answer: "A4" },
      ],
    };
    saveEpisodeLocally(pair4Turns);
    const stored = getStoredEpisodes();
    expect(stored[0].turns.length).toBe(4);
    expect(stored[0].turns[3].answer).toBe("A4");
  });
});