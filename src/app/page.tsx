"use client";

import React, { useState } from "react";
import {
  AgeGroup,
  CareStatus,
  DialogTurn,
  ExpectationType,
  InterviewResponseData,
  ReflectionResponseData,
  ScreenState,
} from "@/types";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ConsentScreen } from "@/components/ConsentScreen";
import { AgeScreen } from "@/components/AgeScreen";
import { PartnerScreen } from "@/components/PartnerScreen";
import { CareScreen } from "@/components/CareScreen";
import { ExpectationScreen } from "@/components/ExpectationScreen";
import { InterviewScreen } from "@/components/InterviewScreen";
import { ReflectionScreen } from "@/components/ReflectionScreen";
import { SafetyScreen } from "@/components/SafetyScreen";

export default function Home() {
  // セッション内メモリ状態（ページリロードやリセットで破棄）
  const [screen, setScreen] = useState<ScreenState>("WELCOME");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("no_answer");
  const [partner, setPartner] = useState<string>("相手");
  const [isCare, setIsCare] = useState<CareStatus>("no");
  const [expectationType, setExpectationType] = useState<ExpectationType>("neutral");

  // インタビュー対話履歴
  const [turns, setTurns] = useState<DialogTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentProgress, setCurrentProgress] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);

  // 振り返り結果
  const [reflectionData, setReflectionData] = useState<{
    expected: string;
    actual: string;
    reflection: string;
  }>({
    expected: "",
    actual: "",
    reflection: "",
  });

  const isSimple = ageGroup === "under_10";

  // 完全リセット
  const handleReset = () => {
    setScreen("WELCOME");
    setAgeGroup("no_answer");
    setPartner("相手");
    setIsCare("no");
    setExpectationType("neutral");
    setTurns([]);
    setCurrentQuestion("");
    setCurrentProgress(1);
    setIsLoading(false);
    setFallbackUsed(false);
    setReflectionData({ expected: "", actual: "", reflection: "" });
  };

  // 最初の質問を取得してインタビュー画面へ移行
  const handleStartInterview = async (selectedExp: ExpectationType) => {
    setExpectationType(selectedExp);
    setIsLoading(true);
    setScreen("INTERVIEW");

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup,
          partner,
          isCare,
          expectationType: selectedExp,
          conversationHistory: [],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to start interview");
      }

      const data: InterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setCurrentQuestion(data.nextQuestion || "どんな出来事でしたか？");
      setCurrentProgress(data.progress || 1);
      setFallbackUsed(Boolean(data.fallbackUsed));
    } catch (err) {
      // ネットワーク切断時などのクライアントフォールバック
      setCurrentQuestion(isSimple ? "どんなことがあったか、おしえてくれる？" : "どんな出来事でしたか？");
      setCurrentProgress(1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザーの回答送信
  const handleAnswerSubmit = async (
    answerText: string,
    isSkipped: boolean,
    skipReason?: "dont_know" | "no_answer"
  ) => {
    if (isLoading) return;

    const newTurn: DialogTurn = {
      questionNumber: currentProgress,
      question: currentQuestion,
      answer: answerText,
      isSkipped,
      skipReason,
    };

    const nextHistory = [...turns, newTurn];
    setTurns(nextHistory);

    // 最大3問に達した場合は振り返り画面へ
    if (nextHistory.length >= 3) {
      await fetchReflection(nextHistory);
      return;
    }

    // 次の質問を取得
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup,
          partner,
          isCare,
          expectationType,
          conversationHistory: nextHistory.map((t) => ({
            question: t.question,
            answer: t.answer,
            questionPurpose: t.questionPurpose,
            isSkipped: t.isSkipped,
            skipReason: t.skipReason,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data: InterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      if (data.isComplete) {
        await fetchReflection(nextHistory);
        return;
      }

      setCurrentQuestion(data.nextQuestion);
      setCurrentProgress(data.progress);
      if (data.fallbackUsed) {
        setFallbackUsed(true);
      }
    } catch (err) {
      // ネットワークエラー等のフォールバック
      const fallbackIndex = nextHistory.length; // 1 or 2
      const fallbackQ = fallbackIndex === 1
        ? (isSimple ? "あいてに、どうしてほしかった？" : "相手に、どんなことを期待していましたか？")
        : (isSimple ? "どうおもったか、おしえてくれる？" : "そのとき、どのように受け止めましたか？");
      setCurrentQuestion(fallbackQ);
      setCurrentProgress(fallbackIndex + 1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 振り返りAPI呼び出し
  const fetchReflection = async (history: DialogTurn[]) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup,
          partner,
          isCare,
          expectationType,
          conversationHistory: history.map((t) => ({
            question: t.question,
            answer: t.answer,
            questionPurpose: t.questionPurpose,
            isSkipped: t.isSkipped,
            skipReason: t.skipReason,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Reflection failed");
      }

      const data: ReflectionResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setReflectionData({
        expected: data.expected,
        actual: data.actual,
        reflection: data.reflection,
      });
      setScreen("REFLECTION");
    } catch (err) {
      // フォールバック振り返り
      const isMatched = expectationType === "matched";
      const isMismatched = expectationType === "mismatched";
      const fallbackSummary = isSimple
        ? "話してくれてありがとう！相手のことをおもって過ごした大切なひとコマでしたね。"
        : isMatched
        ? "相手への期待と実際の出来事が重なり、互いの意図が伝わった温かい出来事でした。"
        : isMismatched
        ? "相手への期待と結果にすれ違いが生じた場面でしたが、自分の気持ちに気づく貴重な振り返りとなりました。"
        : "期待どおりの面と異なった面の両方があり、相手との関係を多面的に見つめ直す機会となりました。";

      setReflectionData({
        expected: history[1]?.answer || history[0]?.answer || "（相手への思い）",
        actual: history[0]?.answer || "（実際の出来事）",
        reflection: fallbackSummary,
      });
      setScreen("REFLECTION");
    } finally {
      setIsLoading(false);
    }
  };

  // 途中終了
  const handleFinishEarly = async () => {
    await fetchReflection(turns);
  };

  return (
    <>
      {screen === "WELCOME" && (
        <WelcomeScreen onStartSingle={() => setScreen("CONSENT")} />
      )}

      {screen === "CONSENT" && (
        <ConsentScreen
          onConsent={() => setScreen("AGE_SELECT")}
          onBack={() => setScreen("WELCOME")}
        />
      )}

      {screen === "AGE_SELECT" && (
        <AgeScreen
          onSelect={(age) => {
            setAgeGroup(age);
            setScreen("PARTNER_SELECT");
          }}
          onBack={() => setScreen("CONSENT")}
        />
      )}

      {screen === "PARTNER_SELECT" && (
        <PartnerScreen
          onSelect={(partnerLabel) => {
            setPartner(partnerLabel);
            setScreen("CARE_SELECT");
          }}
          onBack={() => setScreen("AGE_SELECT")}
          isSimple={isSimple}
        />
      )}

      {screen === "CARE_SELECT" && (
        <CareScreen
          onSelect={(status) => {
            setIsCare(status);
            setScreen("EXPECTATION_SELECT");
          }}
          onBack={() => setScreen("PARTNER_SELECT")}
          isSimple={isSimple}
        />
      )}

      {screen === "EXPECTATION_SELECT" && (
        <ExpectationScreen
          onSelect={(exp) => handleStartInterview(exp)}
          onBack={() => setScreen("CARE_SELECT")}
          isSimple={isSimple}
        />
      )}

      {screen === "INTERVIEW" && (
        <InterviewScreen
          currentQuestion={currentQuestion}
          progress={currentProgress}
          isLoading={isLoading}
          fallbackUsed={fallbackUsed}
          onSubmitAnswer={handleAnswerSubmit}
          onFinishEarly={handleFinishEarly}
          onReset={handleReset}
          isSimple={isSimple}
        />
      )}

      {screen === "REFLECTION" && (
        <ReflectionScreen
          expected={reflectionData.expected}
          actual={reflectionData.actual}
          reflection={reflectionData.reflection}
          onReset={handleReset}
          isSimple={isSimple}
        />
      )}

      {screen === "SAFETY" && (
        <SafetyScreen onReset={handleReset} isSimple={isSimple} />
      )}
    </>
  );
}
