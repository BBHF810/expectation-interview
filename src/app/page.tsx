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
  AnimalDiagnosis,
  ExperienceMode,
  PairTurn,
  PairInterviewResponseData,
  PairReflectionResponseData,
  PairAnimalDiagnosis,
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
import { PairSetupScreen } from "@/components/PairSetupScreen";
import { PairExpectationScreen } from "@/components/PairExpectationScreen";
import { PairInterviewScreen } from "@/components/PairInterviewScreen";
import { PairReflectionScreen } from "@/components/PairReflectionScreen";
import { ANIMAL_DIAGNOSES } from "@/lib/fallbacks";
import { PAIR_ANIMAL_COMBOS } from "@/lib/pair-fallbacks";

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>("WELCOME");
  const [mode, setMode] = useState<ExperienceMode>("single");

  // 一人モード用ステート
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("no_answer");
  const [partner, setPartner] = useState<string>("家族");
  const [isCare, setIsCare] = useState<CareStatus>("no");
  const [expectationType, setExpectationType] = useState<ExpectationType>("neutral");
  const [turns, setTurns] = useState<DialogTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentProgress, setCurrentProgress] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);
  const [reflectionData, setReflectionData] = useState<{
    expected: string;
    actual: string;
    reflection: string;
    animalDiagnosis: AnimalDiagnosis;
  }>({
    expected: "",
    actual: "",
    reflection: "",
    animalDiagnosis: ANIMAL_DIAGNOSES[0],
  });

  // ふたりモード用ステート
  const [pairNameA, setPairNameA] = useState("Aさん");
  const [pairNameB, setPairNameB] = useState("Bさん");
  const [pairRelationship, setPairRelationship] = useState("友だち");
  const [pairExpectationType, setPairExpectationType] = useState<ExpectationType>("neutral");
  const [pairTurns, setPairTurns] = useState<PairTurn[]>([]);
  const [pairCurrentQuestion, setPairCurrentQuestion] = useState<string>("");
  const [pairCurrentSpeaker, setPairCurrentSpeaker] = useState<"A" | "B">("A");
  const [pairCurrentSpeakerName, setPairCurrentSpeakerName] = useState<string>("Aさん");
  const [pairProgress, setPairProgress] = useState<number>(1);
  const [pairReflectionData, setPairReflectionData] = useState<{
    perspectiveA: string;
    perspectiveB: string;
    reflection: string;
    pairAnimalDiagnosis: PairAnimalDiagnosis;
  }>({
    perspectiveA: "",
    perspectiveB: "",
    reflection: "",
    pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
  });

  const isSimple = ageGroup === "under_10";

  // 完全リセット
  const handleReset = () => {
    setScreen("WELCOME");
    setMode("single");
    setAgeGroup("no_answer");
    setPartner("家族");
    setIsCare("no");
    setExpectationType("neutral");
    setTurns([]);
    setCurrentQuestion("");
    setCurrentProgress(1);
    setIsLoading(false);
    setFallbackUsed(false);
    setReflectionData({
      expected: "",
      actual: "",
      reflection: "",
      animalDiagnosis: ANIMAL_DIAGNOSES[0],
    });

    setPairNameA("Aさん");
    setPairNameB("Bさん");
    setPairRelationship("友だち");
    setPairExpectationType("neutral");
    setPairTurns([]);
    setPairCurrentQuestion("");
    setPairCurrentSpeaker("A");
    setPairCurrentSpeakerName("Aさん");
    setPairProgress(1);
    setPairReflectionData({
      perspectiveA: "",
      perspectiveB: "",
      reflection: "",
      pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
    });
  };

  // 年齢選択時の分岐処理
  const handleAgeSelect = (selectedAge: AgeGroup) => {
    setAgeGroup(selectedAge);
    if (selectedAge === "31_plus") {
      setScreen("CARE_SELECT");
    } else {
      setIsCare("no");
      setScreen("PARTNER_SELECT");
    }
  };

  const handlePartnerBack = () => {
    if (ageGroup === "31_plus") {
      setScreen("CARE_SELECT");
    } else {
      setScreen("AGE_SELECT");
    }
  };

  // 一人モード：インタビュー開始
  const handleStartSingleInterview = async (selectedExp: ExpectationType) => {
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

      if (!res.ok) throw new Error("Failed");
      const data: InterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setCurrentQuestion(data.nextQuestion || "どんな出来事でしたか？");
      setCurrentProgress(data.progress || 1);
      setFallbackUsed(Boolean(data.fallbackUsed));
    } catch (err) {
      setCurrentQuestion(isSimple ? "どんなことがあったか、おしえてくれる？" : "どんな出来事でしたか？");
      setCurrentProgress(1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 一人モード：回答送信
  const handleSingleAnswerSubmit = async (
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

    if (nextHistory.length >= 3) {
      await fetchSingleReflection(nextHistory);
      return;
    }

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

      if (!res.ok) throw new Error("API failed");
      const data: InterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      if (data.isComplete) {
        await fetchSingleReflection(nextHistory);
        return;
      }

      setCurrentQuestion(data.nextQuestion);
      setCurrentProgress(data.progress);
      if (data.fallbackUsed) setFallbackUsed(true);
    } catch (err) {
      const fallbackIndex = nextHistory.length;
      const fallbackQ =
        fallbackIndex === 1
          ? isSimple
            ? "ほんとうは、どうしてほしかった？"
            : "相手に、どんなことを期待していましたか？"
          : isSimple
          ? "どうおもったか、おしえてくれる？"
          : "そのとき、どのように受け止めましたか？";
      setCurrentQuestion(fallbackQ);
      setCurrentProgress(fallbackIndex + 1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 一人モード：振り返り取得
  const fetchSingleReflection = async (history: DialogTurn[]) => {
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

      if (!res.ok) throw new Error("Reflection failed");
      const data: ReflectionResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setReflectionData({
        expected: data.expected,
        actual: data.actual,
        reflection: data.reflection,
        animalDiagnosis: data.animalDiagnosis || ANIMAL_DIAGNOSES[0],
      });
      setScreen("REFLECTION");
    } catch (err) {
      setReflectionData({
        expected: history[1]?.answer || history[0]?.answer || "（相手への思い）",
        actual: history[0]?.answer || "（実際の出来事）",
        reflection: "お互いの気持ちに気づき、温かい対話の振り返りとなりました。",
        animalDiagnosis: ANIMAL_DIAGNOSES[0],
      });
      setScreen("REFLECTION");
    } finally {
      setIsLoading(false);
    }
  };

  // ふたりモード：インタビュー開始
  const handleStartPairInterview = async (selectedExp: ExpectationType) => {
    setPairExpectationType(selectedExp);
    setIsLoading(true);
    setScreen("PAIR_INTERVIEW");

    try {
      const res = await fetch("/api/pair-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameA: pairNameA,
          nameB: pairNameB,
          relationship: pairRelationship,
          expectationType: selectedExp,
          currentTurnSpeaker: "A",
          conversationHistory: [],
        }),
      });

      if (!res.ok) throw new Error("Pair API failed");
      const data: PairInterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setPairCurrentQuestion(
        data.nextQuestion || `${pairNameA}さん、ふたりであった出来事について教えてください。`
      );
      setPairCurrentSpeaker(data.nextSpeaker || "A");
      setPairCurrentSpeakerName(data.nextSpeakerName || pairNameA);
      setPairProgress(data.progress || 1);
      setFallbackUsed(Boolean(data.fallbackUsed));
    } catch (err) {
      setPairCurrentQuestion(
        `${pairNameA}さん、ふたりであったどんな出来事ですか？そのとき${pairNameB}さんにどんなことを期待していましたか？`
      );
      setPairCurrentSpeaker("A");
      setPairCurrentSpeakerName(pairNameA);
      setPairProgress(1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ふたりモード：回答送信
  const handlePairAnswerSubmit = async (answerText: string, isSkipped: boolean) => {
    if (isLoading) return;

    const newTurn: PairTurn = {
      questionNumber: pairProgress,
      speaker: pairCurrentSpeaker,
      speakerName: pairCurrentSpeakerName,
      question: pairCurrentQuestion,
      answer: answerText,
      isSkipped,
    };

    const nextHistory = [...pairTurns, newTurn];
    setPairTurns(nextHistory);

    if (nextHistory.length >= 3) {
      await fetchPairReflection(nextHistory);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/pair-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameA: pairNameA,
          nameB: pairNameB,
          relationship: pairRelationship,
          expectationType: pairExpectationType,
          currentTurnSpeaker: pairCurrentSpeaker === "A" ? "B" : "A",
          conversationHistory: nextHistory,
        }),
      });

      if (!res.ok) throw new Error("API failed");
      const data: PairInterviewResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      if (data.isComplete) {
        await fetchPairReflection(nextHistory);
        return;
      }

      setPairCurrentQuestion(data.nextQuestion);
      setPairCurrentSpeaker(data.nextSpeaker);
      setPairCurrentSpeakerName(data.nextSpeakerName);
      setPairProgress(data.progress);
      if (data.fallbackUsed) setFallbackUsed(true);
    } catch (err) {
      const fallbackIdx = nextHistory.length;
      if (fallbackIdx === 1) {
        setPairCurrentQuestion(
          `${pairNameB}さん、${pairNameA}さんのお話を聞いて、そのとき実際にはどう思っていましたか？`
        );
        setPairCurrentSpeaker("B");
        setPairCurrentSpeakerName(pairNameB);
      } else {
        setPairCurrentQuestion(
          `その出来事を通してお互いにどう感じましたか？`
        );
        setPairCurrentSpeaker("A");
        setPairCurrentSpeakerName(`${pairNameA}さん・${pairNameB}さん`);
      }
      setPairProgress(fallbackIdx + 1);
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ふたりモード：振り返り取得
  const fetchPairReflection = async (history: PairTurn[]) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pair-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameA: pairNameA,
          nameB: pairNameB,
          relationship: pairRelationship,
          expectationType: pairExpectationType,
          conversationHistory: history,
        }),
      });

      if (!res.ok) throw new Error("Reflection failed");
      const data: PairReflectionResponseData = await res.json();

      if (data.safetyAction === "stop") {
        setScreen("SAFETY");
        return;
      }

      setPairReflectionData({
        perspectiveA: data.perspectiveA,
        perspectiveB: data.perspectiveB,
        reflection: data.reflection,
        pairAnimalDiagnosis: data.pairAnimalDiagnosis || PAIR_ANIMAL_COMBOS[0],
      });
      setScreen("PAIR_REFLECTION");
    } catch (err) {
      setPairReflectionData({
        perspectiveA: history[0]?.answer || "（思い）",
        perspectiveB: history[1]?.answer || "（受け止め）",
        reflection: `${pairNameA}さんと${pairNameB}さんの素直な気持ちが通い合った、温かい対話の記録です。`,
        pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
      });
      setScreen("PAIR_REFLECTION");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {screen === "WELCOME" && (
        <WelcomeScreen
          onStartSingle={() => {
            setMode("single");
            setScreen("CONSENT");
          }}
          onStartPair={() => {
            setMode("pair");
            setScreen("CONSENT");
          }}
        />
      )}

      {screen === "CONSENT" && (
        <ConsentScreen
          onConsent={() => {
            if (mode === "single") {
              setScreen("AGE_SELECT");
            } else {
              setScreen("PAIR_SETUP");
            }
          }}
          onBack={() => setScreen("WELCOME")}
        />
      )}

      {/* --- 一人モード用画面 --- */}
      {screen === "AGE_SELECT" && (
        <AgeScreen onSelect={handleAgeSelect} onBack={() => setScreen("CONSENT")} />
      )}

      {screen === "CARE_SELECT" && (
        <CareScreen
          onSelect={(status) => {
            setIsCare(status);
            setScreen("PARTNER_SELECT");
          }}
          onBack={() => setScreen("AGE_SELECT")}
          isSimple={isSimple}
        />
      )}

      {screen === "PARTNER_SELECT" && (
        <PartnerScreen
          onSelect={(partnerLabel) => {
            setPartner(partnerLabel);
            setScreen("EXPECTATION_SELECT");
          }}
          onBack={handlePartnerBack}
          isSimple={isSimple}
        />
      )}

      {screen === "EXPECTATION_SELECT" && (
        <ExpectationScreen
          onSelect={(exp) => handleStartSingleInterview(exp)}
          onBack={() => setScreen("PARTNER_SELECT")}
          isSimple={isSimple}
        />
      )}

      {screen === "INTERVIEW" && (
        <InterviewScreen
          currentQuestion={currentQuestion}
          progress={currentProgress}
          isLoading={isLoading}
          fallbackUsed={fallbackUsed}
          onSubmitAnswer={handleSingleAnswerSubmit}
          onFinishEarly={() => fetchSingleReflection(turns)}
          onReset={handleReset}
          isSimple={isSimple}
        />
      )}

      {screen === "REFLECTION" && (
        <ReflectionScreen
          expected={reflectionData.expected}
          actual={reflectionData.actual}
          reflection={reflectionData.reflection}
          animalDiagnosis={reflectionData.animalDiagnosis}
          onReset={handleReset}
          isSimple={isSimple}
        />
      )}

      {/* --- ふたりモード用画面 --- */}
      {screen === "PAIR_SETUP" && (
        <PairSetupScreen
          onNext={(nA, nB, rel) => {
            setPairNameA(nA);
            setPairNameB(nB);
            setPairRelationship(rel);
            setScreen("PAIR_EXPECTATION");
          }}
          onBack={() => setScreen("CONSENT")}
        />
      )}

      {screen === "PAIR_EXPECTATION" && (
        <PairExpectationScreen
          nameA={pairNameA}
          nameB={pairNameB}
          onSelect={(exp) => handleStartPairInterview(exp)}
          onBack={() => setScreen("PAIR_SETUP")}
        />
      )}

      {screen === "PAIR_INTERVIEW" && (
        <PairInterviewScreen
          currentQuestion={pairCurrentQuestion}
          currentSpeaker={pairCurrentSpeaker}
          currentSpeakerName={pairCurrentSpeakerName}
          progress={pairProgress}
          isLoading={isLoading}
          fallbackUsed={fallbackUsed}
          onSubmitAnswer={handlePairAnswerSubmit}
          onFinishEarly={() => fetchPairReflection(pairTurns)}
          onReset={handleReset}
        />
      )}

      {screen === "PAIR_REFLECTION" && (
        <PairReflectionScreen
          nameA={pairNameA}
          nameB={pairNameB}
          perspectiveA={pairReflectionData.perspectiveA}
          perspectiveB={pairReflectionData.perspectiveB}
          reflection={pairReflectionData.reflection}
          pairAnimalDiagnosis={pairReflectionData.pairAnimalDiagnosis}
          onReset={handleReset}
        />
      )}

      {/* 共通：センシティブ安全画面 */}
      {screen === "SAFETY" && (
        <SafetyScreen onReset={handleReset} isSimple={isSimple} />
      )}
    </>
  );
}