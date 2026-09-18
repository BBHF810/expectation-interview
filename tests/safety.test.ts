import { describe, it, expect } from "vitest";
import { checkSafetyLocally } from "@/lib/safety";

describe("安全チェック (checkSafetyLocally)", () => {
  it("自傷・希死念慮の表現を検知して stop を返す", () => {
    expect(checkSafetyLocally("もう死にたいと思ってしまった")).toBe("stop");
    expect(checkSafetyLocally("消えてしまいたい")).toBe("stop");
    expect(checkSafetyLocally("いなくなりたいです")).toBe("stop");
    expect(checkSafetyLocally("リストカットをしてしまった")).toBe("stop");
  });

  it("暴力・虐待・脅迫の表現を検知して stop を返す", () => {
    expect(checkSafetyLocally("相手に殴られて痛かった")).toBe("stop");
    expect(checkSafetyLocally("暴力を受けて怖かった")).toBe("stop");
    expect(checkSafetyLocally("親から虐待されている")).toBe("stop");
  });

  it("通常の日常的な回答では continue を返す", () => {
    expect(checkSafetyLocally("話を聞いてほしいと思っていたのに忙しそうだった")).toBe("continue");
    expect(checkSafetyLocally("一緒に買い物に行きたかった")).toBe("continue");
    expect(checkSafetyLocally("お礼を言ってくれたので嬉しかった")).toBe("continue");
    expect(checkSafetyLocally("テストで死ぬほど勉強した")).toBe("continue");
  });

  it("空文字や未入力では continue を返す", () => {
    expect(checkSafetyLocally("")).toBe("continue");
  });
});
