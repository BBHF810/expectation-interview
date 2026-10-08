import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsentScreen } from "@/components/ConsentScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PartnerScreen } from "@/components/PartnerScreen";
import { InputMethodScreen } from "@/components/InputMethodScreen";
import { InterviewerAvatar } from "@/components/InterviewerAvatar";
import { InterviewScreen } from "@/components/InterviewScreen";
import { AgeScreen } from "@/components/AgeScreen";
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

    // 初期状態は音声入力UIが表示されている（マイクボタン案内がある）
    expect(screen.getByText(/声でお話しください/i)).toBeInTheDocument();

    // 「文字入力（タイピング）」タブをクリック
    const typingTab = screen.getByRole("button", { name: /文字入力（タイピング）/i });
    fireEvent.click(typingTab);

    // テキストエリアが表示される
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();

    // 再度「音声入力」タブをクリックして切り替え
    const voiceTab = screen.getByRole("button", { name: /音声入力/i });
    fireEvent.click(voiceTab);

    // 再び音声UIが表示される
    expect(screen.getByText(/声でお話しください/i)).toBeInTheDocument();
  });

  it("年齢選択画面: 初期状態では未回答で次へが無効、年代ボタンまたは答えない選択で有効化される（20代→25歳）", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(<AgeScreen onSelect={handleSelect} onBack={handleBack} />);

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeDisabled();
    expect(screen.getByText("--")).toBeInTheDocument();

    // 「20代」をタップ（統一された代表年齢 25歳）
    const btn20s = screen.getByRole("button", { name: "20代" });
    fireEvent.click(btn20s);

    expect(nextBtn).toBeEnabled();
    expect(screen.getByText("25")).toBeInTheDocument();

    // ＋ボタンで1歳増やす（26歳）
    const plusBtn = screen.getByRole("button", { name: /年齢を1歳増やす/i });
    fireEvent.click(plusBtn);
    expect(screen.getByText("26")).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith(26, "11_30");
  });

  it("年齢選択画面: カスタムタイトルと初期年齢が正しく反映される（ふたりモード対応）", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(
      <AgeScreen
        title="Aさんの年齢を教えてください"
        initialAge={35}
        onSelect={handleSelect}
        onBack={handleBack}
      />
    );

    expect(screen.getByText("Aさんの年齢を教えてください")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith(35, "31_plus");
  });

  it("年齢選択画面: 60代（65歳）と70代〜（75歳）が正しく選択できる", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(<AgeScreen onSelect={handleSelect} onBack={handleBack} />);

    // 60代ボタンをタップ
    const btn60s = screen.getByRole("button", { name: "60代" });
    fireEvent.click(btn60s);
    expect(screen.getByText("65")).toBeInTheDocument();

    // 70代〜ボタンをタップ
    const btn70s = screen.getByRole("button", { name: "70代〜" });
    fireEvent.click(btn70s);
    expect(screen.getByText("75")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith(75, "31_plus");
  });
});