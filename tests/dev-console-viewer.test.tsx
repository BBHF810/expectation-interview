import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DevConsoleViewer } from "@/components/DevConsoleViewer";
import "@testing-library/jest-dom";

describe("DevConsoleViewer コンポーネント", () => {
  it("画面右下にトグルボタンを描画し、クリックでコンソールパネルを開閉できる", () => {
    render(<DevConsoleViewer />);

    const toggleBtn = screen.getByRole("button", { name: /開発者用コンソールログを開く/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText("DevLog")).toBeInTheDocument();

    // 初期状態ではパネルは非表示
    expect(screen.queryByText(/iPad コンソールログ/i)).not.toBeInTheDocument();

    // クリックして開く
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/iPad コンソールログ/i)).toBeInTheDocument();

    // 閉じるボタンをクリックして閉じる
    const closeBtn = screen.getByTitle("閉じる");
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/iPad コンソールログ/i)).not.toBeInTheDocument();
  });

  it("console.log や console.error をフックしてパネル内に表示する", () => {
    render(<DevConsoleViewer />);

    act(() => {
      console.log("テストログメッセージ 123");
      console.error("テストエラーメッセージ 456");
    });

    const toggleBtn = screen.getByRole("button", { name: /開発者用コンソールログを開く/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/テストログメッセージ 123/i)).toBeInTheDocument();
    expect(screen.getByText(/テストエラーメッセージ 456/i)).toBeInTheDocument();

    // クリアボタンで消去できる
    const clearBtn = screen.getByTitle("ログをクリア");
    fireEvent.click(clearBtn);

    expect(screen.getByText(/ログはありません/i)).toBeInTheDocument();
  });
});
