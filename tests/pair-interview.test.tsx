import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PairSetupScreen } from "@/components/PairSetupScreen";
import { PairReflectionScreen } from "@/components/PairReflectionScreen";
import { POST as pairInterviewPost } from "@/app/api/pair-interview/route";
import { POST as pairReflectionPost } from "@/app/api/pair-reflection/route";
import { NextRequest } from "next/server";
import "@testing-library/jest-dom";

describe("ふたりで体験するモードのテスト", () => {
  it("WelcomeScreen: 「ふたりで体験する」ボタンが有効化されクリックできる", () => {
    const handleSingle = vi.fn();
    const handlePair = vi.fn();

    render(<WelcomeScreen onStartSingle={handleSingle} onStartPair={handlePair} />);

    const pairBtn = screen.getByRole("button", { name: /ふたりで体験する/i });
    expect(pairBtn).toBeEnabled();
    fireEvent.click(pairBtn);
    expect(handlePair).toHaveBeenCalledTimes(1);
  });

  it("PairSetupScreen: 「その他」を選択すると自由入力欄が表示され入力した関係性が渡される", () => {
    const handleNext = vi.fn();
    const handleBack = vi.fn();

    render(<PairSetupScreen onNext={handleNext} onBack={handleBack} />);

    // 「その他」ボタンをクリック
    const otherBtn = screen.getByRole("button", { name: "その他" });
    fireEvent.click(otherBtn);

    // 自由入力欄が表示される
    const customInput = screen.getByPlaceholderText(/具体的な関係性/i);
    expect(customInput).toBeInTheDocument();

    // 入力して送信
    fireEvent.change(customInput, { target: { value: "サークルの先輩後輩" } });
    const submitBtn = screen.getByRole("button", { name: /次へ/i });
    fireEvent.click(submitBtn);

    expect(handleNext).toHaveBeenCalledWith(
      "Aさん",
      "Bさん",
      "サークルの先輩後輩",
      null,
      null
    );
  });

  it("PairReflectionScreen: 「QRが読めない場合はリンクをコピー」が存在しないこと", () => {
    const handleReset = vi.fn();
    render(
      <PairReflectionScreen
        nameA="たろう"
        nameB="はなこ"
        perspectiveA="A視点"
        perspectiveB="B視点"
        reflection="ふたりの振り返り"
        pairAnimalDiagnosis={{
          animalA: { emoji: "🐶", name: "素直なワンちゃん" },
          animalB: { emoji: "🐱", name: "マイペースな猫ちゃん" },
          pairTitle: "お互いを引き立て合うナイスペア",
          pairCatchphrase: "正反対のテンポが心地よい絶妙なバランス",
          pairDescription: "素敵なふたりです。",
          futureRelationship: "パートナー",
          academicDynamic: "相補的適応型",
        }}
        onReset={handleReset}
      />
    );

    expect(screen.queryByText(/QRが読めない場合はリンクをコピー/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/周りの人に見られず/i)).not.toBeInTheDocument();
  });

  it("ふたりインタビューAPI: 初回はAさんへの質問を返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/pair-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameA: "たろう",
        nameB: "はなこ",
        relationship: "友だち",
        expectationType: "matched",
        currentTurnSpeaker: "A",
        conversationHistory: [],
      }),
    });

    const res = await pairInterviewPost(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.progress).toBe(1);
    expect(data.nextQuestion).toBeTruthy();
    expect(data.isComplete).toBe(false);
  });

  it("ふたり振り返りAPI: perspectiveA, perspectiveB, pairAnimalDiagnosis を返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/pair-reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameA: "たろう",
        nameB: "はなこ",
        relationship: "友だち",
        expectationType: "matched",
        conversationHistory: [
          { questionNumber: 1, speaker: "A", speakerName: "たろう", question: "出来事は？", answer: "一緒にカフェに行った", isSkipped: false },
          { questionNumber: 2, speaker: "B", speakerName: "はなこ", question: "どう思いましたか？", answer: "楽しかった", isSkipped: false },
        ],
      }),
    });

    const res = await pairReflectionPost(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.perspectiveA).toBeTruthy();
    expect(data.perspectiveB).toBeTruthy();
    expect(data.reflection).toBeTruthy();
    expect(data.pairAnimalDiagnosis).toBeTruthy();
    expect(data.pairAnimalDiagnosis.animalA).toBeTruthy();
    expect(data.pairAnimalDiagnosis.animalB).toBeTruthy();
    expect(data.pairAnimalDiagnosis.pairTitle).toBeTruthy();
  });
});