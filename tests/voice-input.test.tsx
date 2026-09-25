import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { VoiceInput } from "@/components/VoiceInput";

describe("VoiceInput コンポーネント", () => {
  let originalSpeechRecognition: any;
  let originalWebkitSpeechRecognition: any;

  beforeEach(() => {
    originalSpeechRecognition = (window as any).SpeechRecognition;
    originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
  });

  afterEach(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it("Web Speech API が未対応の環境では非対応メッセージを表示する", () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={() => {}}
        disabled={false}
      />
    );

    expect(
      screen.getByText(/お使いのブラウザは音声入力に対応していません/i)
    ).toBeInTheDocument();
  });

  it("Web Speech API が対応している場合、マイク開始ボタンを描画する", () => {
    class MockSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      onstart = null;
      onresult = null;
      onerror = null;
      onend = null;
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={() => {}}
        disabled={false}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    expect(micButton).toBeInTheDocument();
    expect(micButton).toBeEnabled();
  });

  it("マイクボタンをクリックすると音声認識が開始され、音声認識結果がコールバックに渡される", () => {
    let mockInstance: any = null;

    class MockSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      start = vi.fn().mockImplementation(() => {
        if (this.onstart) {
          this.onstart();
        }
      });
      stop = vi.fn();
      abort = vi.fn();
      onstart: any = null;
      onresult: any = null;
      onerror: any = null;
      onend: any = null;

      constructor() {
        mockInstance = this;
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    const handleTranscriptChange = vi.fn();
    const handleListeningChange = vi.fn();

    render(
      <VoiceInput
        currentText="最初のメモ"
        onTranscriptChange={handleTranscriptChange}
        onListeningStateChange={handleListeningChange}
        disabled={false}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    fireEvent.click(micButton);

    expect(mockInstance).not.toBeNull();
    expect(mockInstance.start).toHaveBeenCalled();
    expect(handleListeningChange).toHaveBeenCalledWith(true);

    // 音声認識結果イベントをシミュレート
    act(() => {
      if (mockInstance.onresult) {
        mockInstance.onresult({
          resultIndex: 0,
          results: [
            Object.assign([{ transcript: "楽しかったです" }], { isFinal: true }),
          ],
        });
      }
    });

    expect(handleTranscriptChange).toHaveBeenCalledWith("最初のメモ 楽しかったです");
  });

  it("マイク権限が拒絶された場合（not-allowed）に適切なエラーメッセージを表示する", () => {
    let mockInstance: any = null;

    class MockSpeechRecognition {
      start = vi.fn().mockImplementation(() => {
        if (this.onstart) this.onstart();
      });
      stop = vi.fn();
      abort = vi.fn();
      onstart: any = null;
      onresult: any = null;
      onerror: any = null;
      onend: any = null;

      constructor() {
        mockInstance = this;
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={() => {}}
        disabled={false}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    fireEvent.click(micButton);

    // エラーイベントをシミュレート
    act(() => {
      if (mockInstance.onerror) {
        mockInstance.onerror({ error: "not-allowed" });
      }
    });

    expect(
      screen.getByText(/マイクの使用が許可されていません/i)
    ).toBeInTheDocument();
  });
});
