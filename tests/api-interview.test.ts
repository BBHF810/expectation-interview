import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/interview/route";
import { NextRequest } from "next/server";

describe("インタビューAPI (/api/interview)", () => {
  it("初回アクセス時に1問目の質問を返す（APIキー未設定時はフォールバック）", async () => {
    const req = new NextRequest("http://localhost:3000/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "11_30",
        partner: "友だち",
        isCare: "no",
        expectationType: "matched",
        conversationHistory: [],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.progress).toBe(1);
    expect(data.isComplete).toBe(false);
    expect(data.nextQuestion).toBeTruthy();
    expect(data.safetyAction).toBe("continue");
  });

  it("3問回答済みの場合は4問目を生成せず isComplete: true を返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "31_plus",
        partner: "パートナー",
        isCare: "no",
        expectationType: "mismatched",
        conversationHistory: [
          { question: "質問1", answer: "回答1", questionPurpose: "event" },
          { question: "質問2", answer: "回答2", questionPurpose: "expectation" },
          { question: "質問3", answer: "回答3", questionPurpose: "reason" },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.progress).toBe(3);
    expect(data.isComplete).toBe(true);
    expect(data.nextQuestion).toBe("");
  });

  it("センシティブな回答が含まれる場合は safetyAction: stop を返す", async () => {
    const req = new NextRequest("http://localhost:3000/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "11_30",
        partner: "友だち",
        isCare: "no",
        expectationType: "mismatched",
        conversationHistory: [
          { question: "どんな出来事でしたか？", answer: "相手に殴られて怪我をした", questionPurpose: "event" },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.safetyAction).toBe("stop");
    expect(data.isComplete).toBe(true);
  });

  it("500文字を超える回答は 400 エラーとして拒絶する", async () => {
    const longAnswer = "あ".repeat(501);
    const req = new NextRequest("http://localhost:3000/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageGroup: "11_30",
        partner: "友だち",
        isCare: "no",
        expectationType: "mismatched",
        conversationHistory: [
          { question: "どんな出来事でしたか？", answer: longAnswer },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
