import { describe, it, expect, vi } from "vitest";
import { logSafeRequest } from "@/lib/logger";

describe("プライバシー保護ロガー (logSafeRequest)", () => {
  it("ログ出力に回答本文や個人情報が含まれず、メタデータのみ記録される", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logSafeRequest({
      requestId: "req-test-123",
      endpoint: "/api/interview",
      status: "success",
      durationMs: 120,
      model: "gemini-2.5-flash-lite",
      fallbackUsed: false,
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const outputString = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(outputString);

    expect(parsed.requestId).toBe("req-test-123");
    expect(parsed.endpoint).toBe("/api/interview");
    expect(parsed.status).toBe("success");
    expect(parsed.durationMs).toBe(120);
    expect(parsed.model).toBe("gemini-2.5-flash-lite");
    expect(parsed.fallbackUsed).toBe(false);

    // 回答本文や個人情報のキーが存在しないこと
    expect(parsed.answer).toBeUndefined();
    expect(parsed.content).toBeUndefined();
    expect(parsed.prompt).toBeUndefined();

    consoleSpy.mockRestore();
  });
});
