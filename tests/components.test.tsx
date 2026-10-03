import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsentScreen } from "@/components/ConsentScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PartnerScreen } from "@/components/PartnerScreen";
import { InputMethodScreen } from "@/components/InputMethodScreen";
import { InterviewerAvatar } from "@/components/InterviewerAvatar";
import { InterviewScreen } from "@/components/InterviewScreen";
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
    expect(screen.getByText(/先生・同僚・先輩 など/i)).toBeInTheDocument();
    expect(screen.queryByText(/友人・知人 など/i)).not.toBeInTheDocument();
  });

  it("アバター: 正しいARIAラベルで描画される", () => {
    const { rerender } = render(<InterviewerAvatar status="speaking" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話し中")).toBeInTheDocument();

    rerender(<InterviewerAvatar status="listening" />);
    expect(screen.getByLabelText("AIインタビュアーの状態: お話を聞いています")).toBeInTheDocument();
  });

  it("入力方式選択画面: 声でお話しすると文字で入力するの選択ができる", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();
    render(<InputMethodScreen onSelect={handleSelect} onBack={handleBack} />);

    expect(screen.getByText("声でお話しする")).toBeInTheDocument();
    expect(screen.getByText("文字で入力する")).toBeInTheDocument();

    const startBtn = screen.getByRole("button", { name: /インタビュー開始/i });
    expect(startBtn).toBeEnabled();
    fireEvent.click(startBtn);
    expect(handleSelect).toHaveBeenCalledWith("voice");
  });

  it("インタビュー画面: 体験中に音声入力と文字入力をリアルタイムに切り替えられる", () => {
    const handleSubmitAnswer = vi.fn();
    const handleFinishEarly = vi.fn();
    const handleReset = vi.fn();

    render(
      <InterviewScreen
        currentQuestion="どんな出来事でしたか？"
        progress={1}
        isLoading={false}
        fallbackUsed={false}
        inputMethod="voice"
        onSubmitAnswer={handleSubmitAnswer}
        onFinishEarly={handleFinishEarly}
        onReset={handleReset}
        isSimple={false}
      />
    );

    // 初期状態は音声入力UIが表示されている
    expect(screen.getByText(/キーボード入力に切り替える/i)).toBeInTheDocument();

    // 「キーボード入力に切り替える」をクリック
    fireEvent.click(screen.getByText(/キーボード入力に切り替える/i));

    // テキストエリアが表示される
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();

    // 再度「音声入力」タブをクリックして切り替え
    const voiceTab = screen.getByRole("button", { name: /音声入力/i });
    fireEvent.click(voiceTab);

    // 再び音声UIが表示される
    expect(screen.getByText(/キーボード入力に切り替える/i)).toBeInTheDocument();
  });
});