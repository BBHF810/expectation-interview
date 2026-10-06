import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClosingScreen } from "@/components/ClosingScreen";

describe("ClosingScreen コンポーネント", () => {
  it("クロージングメッセージとアバターが正しく表示される", () => {
    const handleProceed = vi.fn();
    const handleReset = vi.fn();

    render(
      <ClosingScreen
        closingComment="お話ししてくださり、ありがとうございました！とても素敵なエピソードでした。"
        onProceedToResult={handleProceed}
        onReset={handleReset}
      />
    );

    expect(
      screen.getByText("お話ししてくださり、ありがとうございました！とても素敵なエピソードでした。")
    ).toBeDefined();
    expect(screen.getByText("AIインタビュアーからのメッセージ")).toBeDefined();
    expect(screen.getByText("診断結果のQRコードを見る")).toBeDefined();
  });

  it("「診断結果のQRコードを見る」ボタンをクリックすると onProceedToResult が発火する", () => {
    const handleProceed = vi.fn();
    const handleReset = vi.fn();

    render(
      <ClosingScreen
        closingComment="お話ししてくださり、ありがとうございました！"
        onProceedToResult={handleProceed}
        onReset={handleReset}
      />
    );

    const proceedBtn = screen.getByText("診断結果のQRコードを見る");
    fireEvent.click(proceedBtn);

    expect(handleProceed).toHaveBeenCalledTimes(1);
  });

  it("ペアモード時に参加者名が表示される", () => {
    const handleProceed = vi.fn();
    const handleReset = vi.fn();

    render(
      <ClosingScreen
        closingComment="おふたりでお話ししてくださり、ありがとうございました！"
        isPair={true}
        nameA="たろう"
        nameB="はなこ"
        onProceedToResult={handleProceed}
        onReset={handleReset}
      />
    );

    expect(screen.getByText("たろうさん＆はなこさん")).toBeDefined();
  });
});
