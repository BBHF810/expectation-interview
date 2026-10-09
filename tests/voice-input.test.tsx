import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { VoiceInput } from "@/components/VoiceInput";

describe("VoiceInput コンポーネント", () => {
  let originalSpeechRecognition: any;
  let originalWebkitSpeechRecognition: any;
  let originalIsSecureContext: any;

  beforeEach(() => {
    originalSpeechRecognition = (window as any).SpeechRecognition;
    originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
    originalIsSecureContext = window.isSecureContext;
    (window as any).isSecureContext = true;
  });

  afterEach(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    (window as any).isSecureContext = originalIsSecureContext;
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

  it("AI発話中（isAiSpeaking: true）の場合でも自然なラベルで表示され、クリック時に onBeforeStart が即座に呼ばれる", () => {
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

    const handleBeforeStart = vi.fn();
    const handleListeningChange = vi.fn();

    render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={handleListeningChange}
        onBeforeStart={handleBeforeStart}
        isAiSpeaking={true}
        disabled={false}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    expect(micButton).toBeInTheDocument();
    expect(screen.getByText(/マイクを押して声で話す/i)).toBeInTheDocument();

    fireEvent.click(micButton);

    expect(handleBeforeStart).toHaveBeenCalledTimes(1);
    expect(mockInstance).not.toBeNull();
    expect(mockInstance.start).toHaveBeenCalled();
  });

  it("audio-capture エラーが発生した際、自動リトライを試行し、上限（2回）を超えた場合にエラーメッセージを表示する", () => {
    let instances: any[] = [];

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
        instances.push(this);
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

    expect(instances.length).toBe(1);

    // 1回目の audio-capture: 自動リトライされるためエラーメッセージは出ず、新インスタンスが起動
    act(() => {
      instances[0].onerror?.({ error: "audio-capture" });
    });

    expect(
      screen.queryByText(/マイクの接続で問題が発生しました/i)
    ).not.toBeInTheDocument();
    expect(instances.length).toBe(2);

    // 2回目の audio-capture: 再度自動リトライ
    act(() => {
      instances[1].onerror?.({ error: "audio-capture" });
    });

    expect(
      screen.queryByText(/マイクの接続で問題が発生しました/i)
    ).not.toBeInTheDocument();
    expect(instances.length).toBe(3);

    // 3回目（上限到達）: エラーメッセージを表示して停止
    act(() => {
      instances[2].onerror?.({ error: "audio-capture" });
    });

    expect(
      screen.getByText(/マイクの接続で問題が発生しました/i)
    ).toBeInTheDocument();
  });

  it("子ども向けモード（isSimple: true）で audio-capture 上限に達した場合、子ども向けメッセージを表示する", () => {
    let instances: any[] = [];

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
        instances.push(this);
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={() => {}}
        disabled={false}
        isSimple={true}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    fireEvent.click(micButton);

    // 上限（2回リトライ後の3回目）まで発生させる
    act(() => {
      instances[0].onerror?.({ error: "audio-capture" });
    });
    act(() => {
      instances[1].onerror?.({ error: "audio-capture" });
    });
    act(() => {
      instances[2].onerror?.({ error: "audio-capture" });
    });

    expect(
      screen.getByText(/マイクがうまくつながらなかったよ/i)
    ).toBeInTheDocument();
  });

  it("認識中に disabled が true に変化した場合、認識を中止してリスニング状態を解除する", () => {
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

    const handleListeningChange = vi.fn();

    const { rerender } = render(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={handleListeningChange}
        disabled={false}
      />
    );

    const micButton = screen.getByRole("button", { name: /音声で回答する/i });
    fireEvent.click(micButton);

    expect(handleListeningChange).toHaveBeenCalledWith(true);
    expect(mockInstance.abort).not.toHaveBeenCalled();

    // disabled を true に更新（回答送信時をシミュレート）
    rerender(
      <VoiceInput
        currentText=""
        onTranscriptChange={() => {}}
        onListeningStateChange={handleListeningChange}
        disabled={true}
      />
    );

    expect(mockInstance.abort).toHaveBeenCalled();
    expect(handleListeningChange).toHaveBeenCalledWith(false);
  });
});
