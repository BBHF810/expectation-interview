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
import { ExpectationScreen } from "@/components/ExpectationScreen";
import { AdminEpisodeManagerModal } from "@/components/AdminEpisodeManagerModal";
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
        initialAge={25}
        onSelect={handleSelect}
        onBack={handleBack}
      />
    );

    expect(screen.getByText("Aさんの年齢を教えてください")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith(25, "11_30");
  });

  it("年齢選択画面: 30代以上を選択した場合は微調整をスキップして即座に選択される", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(<AgeScreen onSelect={handleSelect} onBack={handleBack} />);

    // 「30代以上」ボタンをタップ
    const btn30s = screen.getByRole("button", { name: "30代以上" });
    fireEvent.click(btn30s);

    // 次へボタンを押さなくても即座にコールバックが実行される
    expect(handleSelect).toHaveBeenCalledWith(35, "31_plus");
  });

  it("運営者モード: 暗証番号でロック解除後、動物診断マスタータブで根拠と具体例が確認できる", () => {
    const handleClose = vi.fn();

    render(<AdminEpisodeManagerModal isOpen={true} onClose={handleClose} />);

    // 暗証番号入力
    const pinInput = screen.getByPlaceholderText("暗証番号を入力");
    fireEvent.change(pinInput, { target: { value: "2026" } });
    const unlockBtn = screen.getByRole("button", { name: "ロック解除" });
    fireEvent.click(unlockBtn);

    // 動物診断マスタータブをタップ
    const animalTabBtn = screen.getByRole("button", { name: /動物診断マスター/i });
    expect(animalTabBtn).toBeInTheDocument();
    fireEvent.click(animalTabBtn);

    // タイプ名、判定の根拠、具体例が表示される
    expect(screen.getByText("素直なワンちゃんタイプ")).toBeInTheDocument();
    expect(screen.getAllByText(/判定の根拠/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/具体例/i).length).toBeGreaterThan(0);
  });

  it("一人用期待選択画面 (ExpectationScreen): 選択肢が表示され、選択後に「次へ」でonSelectが呼ばれる", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(<ExpectationScreen onSelect={handleSelect} onBack={handleBack} isSimple={false} />);

    expect(screen.getAllByText(/ぴったり合っていた/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/少しすれちがった/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/どちらともいえない・両方あった/i)).toBeInTheDocument();

    const matchedBtn = screen.getByRole("button", { name: /ぴったり合っていた/i });
    fireEvent.click(matchedBtn);

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith("matched");
  });

  it("一人用期待選択画面 (ExpectationScreen): 子ども向けモード(isSimple: true)でひらがな・ふりがな付き表示される", () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(<ExpectationScreen onSelect={handleSelect} onBack={handleBack} isSimple={true} />);

    // ふりがな付き・ひらがな表示
    expect(screen.getAllByText(/きもち/i).length).toBeGreaterThan(0);
    const mismatchedBtn = screen.getByRole("button", { name: /すれちがった/i });
    fireEvent.click(mismatchedBtn);

    const nextBtn = screen.getByRole("button", { name: /次へ/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handleSelect).toHaveBeenCalledWith("mismatched");
  });
});