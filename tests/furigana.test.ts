import { describe, it, expect } from "vitest";
import { stripFurigana } from "@/components/FuriganaText";

describe("ふりがなユーティリティ", () => {
  it("stripFurigana: カッコ書きのふりがなを除去して親文字のみにする", () => {
    expect(stripFurigana("相手（あいて）に伝えた")).toBe("相手に伝えた");
    expect(stripFurigana("家族（かぞく）と友だち（ともだち）")).toBe("家族と友だち");
  });

  it("stripFurigana: カッコ書きがない文字列はそのまま返す", () => {
    expect(stripFurigana("こんにちは、元気ですか？")).toBe("こんにちは、元気ですか？");
  });

  it("stripFurigana: 出来事は「こと」に置換される", () => {
    expect(stripFurigana("どんな出来事があったかな？")).toBe("どんなことがあったかな？");
  });
});

