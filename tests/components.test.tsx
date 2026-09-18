import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsentScreen } from "@/components/ConsentScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PartnerScreen } from "@/components/PartnerScreen";
import { InterviewerAvatar } from "@/components/InterviewerAvatar";
import "@testing-library/jest-dom";

describe("UIコンポーネントテスト", () => {
  it("同意画面: 同意チェックボックスをオンにするまで「次へ」ボタンが無効", () => {
    const handleConsent = vi.fn();
    const handleBack = vi.fn();

    render(<ConsentScreen onConsent={handleConsent} onBack={handleBack} />);

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeDisabled();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleConsent).toHaveBeenCalledTimes(1);
  });

  it("開始画面: 「ふたりで体験する」ボタンは無効（準備中）である", () => {
    const handleStart = vi.fn();
    render(<WelcomeScreen onStartSingle={handleStart} />);

    const pairBtn = screen.getByRole("button", { name: /ふたりで体験する（準備中）/i });
    expect(pairBtn).toBeDisabled();

    const singleBtn = screen.getByRole("button", { name: /ひとりで体験する/i });
    expect(singleBtn).toBeEnabled();
    fireEvent.click(singleBtn);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it("相手選択画面: 親・子・兄弟が「家族」にまとめられている", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();
    render(<PartnerScreen onSelect={handleSelect} onBack={handleBack} isSimple={false} />);

    const familyOption = screen.getByText("家族");
    expect(familyOption).toBeInTheDocument();
    expect(screen.getByText(/親・子ども・兄弟姉妹 など/i)).toBeInTheDocument();
  });

  it("アバター: 正しいARIAラベルで描画される", () => {
    const { rerender } = render(<InterviewerAvatar status="speaking" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話し中")).toBeInTheDocument();

    rerender(<InterviewerAvatar status="listening" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話を聞いています")).toBeInTheDocument();
  });
});