import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "@/app/api/episodes/route";
import { NextRequest } from "next/server";
import { CollectedEpisode } from "@/types";

describe("エピソード保存API (/api/episodes)", () => {
  it("エピソードをPOST送信して保存し、GETで取得できる", async () => {
    const episode: CollectedEpisode = {
      id: "api_test_1",
      createdAt: new Date().toISOString(),
      mode: "single",
      ageGroup: "11_30",
      partner: "家族",
      isCare: "no",
      expectationType: "matched",
      turns: [
        { turnNumber: 1, question: "Q1", answer: "A1" }
      ],
      summary: {
        expected: "期待",
        actual: "結果",
        reflection: "振り返り",
      }
    };

    const postReq = new NextRequest("http://localhost:3000/api/episodes", {
      method: "POST",
      body: JSON.stringify(episode),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.success).toBe(true);
    expect(postData.id).toBe("api_test_1");

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.episodes.some((e: any) => e.id === "api_test_1")).toBe(true);
  });

  it("不正なボディの場合は400を返す", async () => {
    const postReq = new NextRequest("http://localhost:3000/api/episodes", {
      method: "POST",
      body: JSON.stringify({ invalid: true }),
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(400);
  });
});