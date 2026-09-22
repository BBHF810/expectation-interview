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

  it("開始画面: 「ひとりで体験する」「ふたりで体験する」両方のボタンが有効である", () => {
    const handleStartSingle = vi.fn();
    const handleStartPair = vi.fn();
    render(<WelcomeScreen onStartSingle={handleStartSingle} onStartPair={handleStartPair} />);

    const pairBtn = screen.getByRole("button", { name: /ふたりで体験する/i });
    expect(pairBtn).toBeEnabled();
    fireEvent.click(pairBtn);
    expect(handleStartPair).toHaveBeenCalledTimes(1);

    const singleBtn = screen.getByRole("button", { name: /ひとりで体験する/i });
    expect(singleBtn).toBeEnabled();
    fireEvent.click(singleBtn);
    expect(handleStartSingle).toHaveBeenCalledTimes(1);
  });

  it("相手選択画面: 友だち、親子、兄弟、夫婦、恋人、その他が表示される", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();
    render(<PartnerScreen onSelect={handleSelect} onBack={handleBack} isSimple={false} />);

    expect(screen.getByText("友だち")).toBeInTheDocument();
    expect(screen.getByText("親子")).toBeInTheDocument();
    expect(screen.getByText("兄弟")).toBeInTheDocument();
    expect(screen.getByText("夫婦")).toBeInTheDocument();
    expect(screen.getByText("恋人")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
    expect(screen.getByText(/親・子ども など/i)).toBeInTheDocument();
    expect(screen.getByText(/兄弟姉妹 など/i)).toBeInTheDocument();
  });

  it("アバター: 正しいARIAラベルで描画される", () => {
    const { rerender } = render(<InterviewerAvatar status="speaking" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話し中")).toBeInTheDocument();

    rerender(<InterviewerAvatar status="listening" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話を聞いています")).toBeInTheDocument();
  });
});