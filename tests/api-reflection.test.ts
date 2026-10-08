import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/reflection/route";
import { NextRequest } from "next/server";

describe("振り返りAPI (/api/reflection)", () => {
  it("回答履歴から振り返りと動物診断を返す（APIキー未設定時は固定フォールバック）", async () => {
    const req = new NextRequest("http://localhost:3000/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "11_30",
        partner: "友だち",
        isCare: "no",
        expectationType: "matched",
        conversationHistory: [
          { question: "どんな出来事でしたか？", answer: "一緒に勉強しようと誘ったらノートをまとめてくれた" },
          { question: "相手にどんなことを期待していましたか？", answer: "一緒に頑張ってほしいと思っていた" },
          { question: "どう思いましたか？", answer: "すごく嬉しかった" },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.expected).toBeTruthy();
    expect(data.actual).toBeTruthy();
    expect(data.reflection).toBeTruthy();
    expect(data.closingComment).toBeTruthy();
    expect(data.closingComment).toMatch(/お話ししてくださり/i);
    expect(data.safetyAction).toBe("continue");
    expect(data.animalDiagnosis).toBeTruthy();
    expect(data.animalDiagnosis.animalName).toBeTruthy();
  });

  it("センシティブな回答が含まれる場合は safetyAction: stop を返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "11_30",
        partner: "友だち",
        isCare: "no",
        expectationType: "mismatched",
        conversationHistory: [
          { question: "どんな出来事でしたか？", answer: "消えてしまいたいと感じるほど辛かった" },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.safetyAction).toBe("stop");
  });
});