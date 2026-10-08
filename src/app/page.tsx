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
  InputMethod,
  PairTurn,
  PairInterviewResponseData,
  PairReflectionResponseData,
  PairAnimalDiagnosis,
  ageToAgeGroup,
} from "@/types";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ConsentScreen } from "@/components/ConsentScreen";
import { AgeScreen } from "@/components/AgeScreen";
import { InputMethodScreen } from "@/components/InputMethodScreen";
import { InterviewScreen } from "@/components/InterviewScreen";
import { ReflectionScreen } from "@/components/ReflectionScreen";
import { SafetyScreen } from "@/components/SafetyScreen";
import { PairSetupScreen } from "@/components/PairSetupScreen";
import { PairExpectationScreen } from "@/components/PairExpectationScreen";
import { PairInterviewScreen } from "@/components/PairInterviewScreen";
import { PairReflectionScreen } from "@/components/PairReflectionScreen";
import { ClosingScreen } from "@/components/ClosingScreen";
import { AdminEpisodeManagerModal } from "@/components/AdminEpisodeManagerModal";
import { ANIMAL_DIAGNOSES, getInitialSingleQuestion, getSmartFallbackQuestion } from "@/lib/fallbacks";
import { PAIR_ANIMAL_COMBOS, getInitialPairQuestion, getFallbackPairQuestion } from "@/lib/pair-fallbacks";
import { saveEpisodeLocally } from "@/lib/episode-storage";
import { getSavedTtsVoice } from "@/lib/tts-voices";
import { CollectedEpisode } from "@/types";

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>("WELCOME");
  const [mode, setMode] = useState<ExperienceMode>("single");
  const [inputMethod, setInputMethod] = useState<InputMethod>("voice");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // 一人モード用ステート
  const [age, setAge] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("no_answer");
  const [partner, setPartner] = useState<string>("");
  const [isCare, setIsCare] = useState<CareStatus>("no");
  const [expectationType, setExpectationType] = useState<ExpectationType>("neutral");
  const [turns, setTurns] = useState<DialogTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [singleAudioStreamingUrl, setSingleAudioStreamingUrl] = useState<string | undefined>(undefined);
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

  const [closingComment, setClosingComment] = useState<string>("");

  // ふたりモード用ステート
  const [pairNameA, setPairNameA] = useState("Aさん");
  const [pairNameB, setPairNameB] = useState("Bさん");
  const [pairAgeA, setPairAgeA] = useState<number | null>(null);
  const [pairAgeB, setPairAgeB] = useState<number | null>(null);
  const [pairRelationship, setPairRelationship] = useState("友だち");
  const [pairExpectationType, setPairExpectationType] = useState<ExpectationType>("neutral");
  const [pairTurns, setPairTurns] = useState<PairTurn[]>([]);
  const [pairCurrentQuestion, setPairCurrentQuestion] = useState<string>("");
  const [pairAudioStreamingUrl, setPairAudioStreamingUrl] = useState<string | undefined>(undefined);
  const [pairCurrentSpeaker, setPairCurrentSpeaker] = useState<"A" | "B">("A");
  const [pairCurrentSpeakerName, setPairCurrentSpeakerName] = useState<string>("Aさん");
  const [pairProgress, setPairProgress] = useState<number>(1);
  const [pairClosingComment, setPairClosingComment] = useState<string>("");
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
    setInputMethod("voice");
    setAge(null);
    setAgeGroup("no_answer");
    setPartner("");
    setIsCare("no");
    setExpectationType("neutral");
    setTurns([]);
    setCurrentQuestion("");
    setSingleAudioStreamingUrl(undefined);
    setCurrentProgress(1);
    setIsLoading(false);
    setFallbackUsed(false);
    setClosingComment("");
    setReflectionData({
      expected: "",
      actual: "",
      reflection: "",
      animalDiagnosis: ANIMAL_DIAGNOSES[0],
    });
    setPairNameA("Aさん");
    setPairNameB("Bさん");
    setPairAgeA(null);
    setPairAgeB(null);
    setPairRelationship("友だち");
    setPairExpectationType("neutral");
    setPairTurns([]);
    setPairCurrentQuestion("");
    setPairAudioStreamingUrl(undefined);
    setPairCurrentSpeaker("A");
    setPairCurrentSpeakerName("Aさん");
    setPairProgress(1);
    setPairClosingComment("");
    setPairReflectionData({
      perspectiveA: "",
      perspectiveB: "",
      reflection: "",
      pairAnimalDiagnosis: PAIR_ANIMAL_COMBOS[0],
    });
  };

  // 年齢選択 → 入力方式選択へ遷移
  const handleAgeSelect = (selectedAge: number | null, selectedAgeGroup: AgeGroup) => {
    setAge(selectedAge);
    setAgeGroup(selectedAgeGroup);
    setScreen("INPUT_METHOD_SELECT");
  };

  // 入力方式選択 → インタビュー開始
  const handleInputMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    if (mode === "single") {
      const initialQ = getInitialSingleQuestion({ ageGroup });
      setCurrentQuestion(initialQ.question);
      setCurrentProgress(1);
      setFallbackUsed(false);
      setIsLoading(false);
      setScreen("INTERVIEW");
    } else {
      const initialQ = getInitialPairQuestion({
        nameA: pairNameA,
        nameB: pairNameB,
        relationship: pairRelationship,
        expectationType: pairExpectationType,
      });
      setPairCurrentQuestion(initialQ.question);
      setPairCurrentSpeaker(initialQ.nextSpeaker);
      setPairCurrentSpeakerName(initialQ.nextSpeakerName);
      setPairProgress(1);
      setFallbackUsed(false);
      setIsLoading(false);
      setScreen("PAIR_INTERVIEW");
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
          age,
          partner: partner || undefined,
          isCare: isCare !== "no" ? isCare : undefined,
          expectationType: expectationType !== "neutral" ? expectationType : undefined,
          voice: getSavedTtsVoice(),
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

      // AIが検出した基本情報を更新
      if (data.detectedPartner && !partner) {
        setPartner(data.detectedPartner);
      }
      if (data.detectedExpectationType) {
        setExpectationType(data.detectedExpectationType);
      }
      if (data.detectedIsCare) {
        setIsCare(data.detectedIsCare);
      }

      if (data.isComplete) {
        await fetchSingleReflection(nextHistory);
        return;
      }

      setCurrentQuestion(data.nextQuestion);
      setSingleAudioStreamingUrl(data.audioStreamingUrl);
      setCurrentProgress(data.progress);
      if (data.fallbackUsed) setFallbackUsed(true);
    } catch (err) {
      // エラー時は直前の回答がポジティブかネガティブかを判定して自然な質問を生成
      const prevAnswers = nextHistory.map((t) => t.answer).filter(Boolean);
      const fallbackQ = getSmartFallbackQuestion(prevAnswers, isSimple);
      setCurrentQuestion(fallbackQ);
      setSingleAudioStreamingUrl(undefined);
      setCurrentProgress(nextHistory.length + 1);
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
          age,
          partner: partner || "相手",
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

      const animalDiag = data.animalDiagnosis || ANIMAL_DIAGNOSES[0];
      const comment =
        data.closingComment ||
        `お話ししてくださり、ありがとうございました！${
          partner && partner !== "相手" ? `${partner}さんとの` : ""
        }エピソードを教えていただき、とても嬉しかったです。あなたの診断結果をお渡ししますね！`;
      setClosingComment(comment);
      setReflectionData({
        expected: data.expected,
        actual: data.actual,
        reflection: data.reflection,
        animalDiagnosis: animalDiag,
      });

      // エピソードデータをローカルに自動保存
      const episode: CollectedEpisode = {
        id: `single_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        mode: "single",
        inputMethod,
        age: age ?? undefined,
        ageGroup,
        partner: partner || undefined,
        isCare,
        expectationType,
        turns: history.map((t, idx) => ({
          turnNumber: idx + 1,
          question: t.question,
          answer: t.answer,
        })),
        summary: {
          expected: data.expected,
          actual: data.actual,
          reflection: data.reflection,
          diagnosisTitle: `${animalDiag.animalEmoji} ${animalDiag.animalName}`,
        },
      };
      saveEpisodeLocally(episode);

      setScreen("CLOSING");
    } catch (err) {
      const fallbackDiag = ANIMAL_DIAGNOSES[0];
      const fallbackExpected = history[1]?.answer || history[0]?.answer || "（相手への思い）";
      const fallbackActual = history[0]?.answer || "（実際の出来事）";
      const fallbackRef = "お互いの気持ちに気づき、温かい対話の振り返りとなりました。";
      const fallbackComment =
        "お話ししてくださり、ありがとうございました！あなたのお気持ちや出来事がとてもよく伝わってきました。診断結果をお渡ししますね！";

      setClosingComment(fallbackComment);
      setReflectionData({
        expected: fallbackExpected,
        actual: fallbackActual,
        reflection: fallbackRef,
        animalDiagnosis: fallbackDiag,
      });

      // フォールバック時もローカル保存
      const episode: CollectedEpisode = {
        id: `single_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        mode: "single",
        inputMethod,
        age: age ?? undefined,
        ageGroup,
        partner: partner || undefined,
        isCare,
        expectationType,
        turns: history.map((t, idx) => ({
          turnNumber: idx + 1,
          question: t.question,
          answer: t.answer,
        })),
        summary: {
          expected: fallbackExpected,
          actual: fallbackActual,
          reflection: fallbackRef,
          diagnosisTitle: `${fallbackDiag.animalEmoji} ${fallbackDiag.animalName}`,
        },
      };
      saveEpisodeLocally(episode);

      setScreen("CLOSING");
    } finally {
      setIsLoading(false);
    }
  };

  // ふたりモード：インタビュー開始
  const handleStartPairInterview = (selectedExp: ExpectationType) => {
    setPairExpectationType(selectedExp);
    const initialQ = getInitialPairQuestion({
      nameA: pairNameA,
      nameB: pairNameB,
      relationship: pairRelationship,
      expectationType: selectedExp,
    });
    setPairCurrentQuestion(initialQ.question);
    setPairCurrentSpeaker(initialQ.nextSpeaker);
    setPairCurrentSpeakerName(initialQ.nextSpeakerName);
    setPairProgress(1);
    setFallbackUsed(false);
    setIsLoading(false);
    setScreen("PAIR_INTERVIEW");
  };

  // ふたりモード：回答送信（2問×2人 = 4ターン構成）
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

    const turnCount = nextHistory.length;

    // 4ターン完了 → 振り返りへ
    if (turnCount >= 4) {
      await fetchPairReflection(nextHistory);
      return;
    }

    // 同じ質問内で A→B の切り替え（ターン1→2、ターン3→4）
    if (turnCount === 1) {
      setPairCurrentSpeaker("B");
      setPairCurrentSpeakerName(pairNameB);
      setPairCurrentQuestion(
        `${pairNameB}さん、${pairNameA}さんのお話を聞いて、そのとき${pairNameB}さんはどんな状況だったり、どう思っていましたか？`
      );
      return;
    }

    if (turnCount === 3) {
      setPairCurrentSpeaker("B");
      setPairCurrentSpeakerName(pairNameB);
      setPairCurrentQuestion(
        `${pairNameB}さん、${pairNameA}さんのそのお気持ちを聞いてみて、どう感じますか？ 今${pairNameA}さんに伝えたいことはありますか？`
      );
      return;
    }

    // Q1 完了（ターン2終了）→ API から Q2 を取得
    if (turnCount === 2) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/pair-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameA: pairNameA,
            nameB: pairNameB,
            ageA: pairAgeA,
            ageB: pairAgeB,
            relationship: pairRelationship,
            expectationType: pairExpectationType,
            currentTurnSpeaker: "A",
            voice: getSavedTtsVoice(),
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
        setPairAudioStreamingUrl(data.audioStreamingUrl);
        setPairCurrentSpeaker("A");
        setPairCurrentSpeakerName(pairNameA);
        setPairProgress(2);
        if (data.fallbackUsed) setFallbackUsed(true);
      } catch (err) {
        const fallback = getFallbackPairQuestion(pairNameA, pairNameB, 2, pairExpectationType);
        setPairCurrentQuestion(fallback.question);
        setPairAudioStreamingUrl(undefined);
        setPairCurrentSpeaker("A");
        setPairCurrentSpeakerName(pairNameA);
        setPairProgress(2);
        setFallbackUsed(true);
      } finally {
        setIsLoading(false);
      }
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

      const pairDiag = data.pairAnimalDiagnosis || PAIR_ANIMAL_COMBOS[0];
      const pairComment =
        data.closingComment ||
        `おふたりでお話ししてくださり、ありがとうございました！${pairNameA}さんと${pairNameB}さんの素直なやり取りがとても素敵でした。ふたりの診断結果をお渡ししますね！`;
      setPairClosingComment(pairComment);
      setPairReflectionData({
        perspectiveA: data.perspectiveA,
        perspectiveB: data.perspectiveB,
        reflection: data.reflection,
        pairAnimalDiagnosis: pairDiag,
      });

      // エピソードデータをローカルに自動保存
      const episode: CollectedEpisode = {
        id: `pair_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        mode: "pair",
        inputMethod,
        nameA: pairNameA,
        nameB: pairNameB,
        ageA: pairAgeA ?? undefined,
        ageB: pairAgeB ?? undefined,
        relationship: pairRelationship,
        expectationType: pairExpectationType,
        turns: history.map((t) => ({
          turnNumber: t.questionNumber,
          speaker: t.speakerName || t.speaker,
          question: t.question,
          answer: t.answer,
        })),
        summary: {
          perspectiveA: data.perspectiveA,
          perspectiveB: data.perspectiveB,
          reflection: data.reflection,
          diagnosisTitle: pairDiag.pairTitle,
        },
      };
      saveEpisodeLocally(episode);

      setScreen("PAIR_CLOSING");
    } catch (err) {
      const fallbackDiag = PAIR_ANIMAL_COMBOS[0];
      const fallbackPerspA = history[0]?.answer || "（思い）";
      const fallbackPerspB = history[1]?.answer || "（受け止め）";
      const fallbackRef = `${pairNameA}さんと${pairNameB}さんの素直な気持ちが通い合った、温かい対話の記録です。`;
      const fallbackComment =
        `おふたりでお話ししてくださり、ありがとうございました！${pairNameA}さんと${pairNameB}さんの思いがとてもよく伝わってきました。ふたりの診断結果をお渡ししますね！`;

      setPairClosingComment(fallbackComment);
      setPairReflectionData({
        perspectiveA: fallbackPerspA,
        perspectiveB: fallbackPerspB,
        reflection: fallbackRef,
        pairAnimalDiagnosis: fallbackDiag,
      });

      // フォールバック時もローカル保存
      const episode: CollectedEpisode = {
        id: `pair_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        mode: "pair",
        inputMethod,
        nameA: pairNameA,
        nameB: pairNameB,
        ageA: pairAgeA ?? undefined,
        ageB: pairAgeB ?? undefined,
        relationship: pairRelationship,
        expectationType: pairExpectationType,
        turns: history.map((t) => ({
          turnNumber: t.questionNumber,
          speaker: t.speakerName || t.speaker,
          question: t.question,
          answer: t.answer,
        })),
        summary: {
          perspectiveA: fallbackPerspA,
          perspectiveB: fallbackPerspB,
          reflection: fallbackRef,
          diagnosisTitle: fallbackDiag.pairTitle,
        },
      };
      saveEpisodeLocally(episode);

      setScreen("PAIR_CLOSING");
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

      {screen === "INPUT_METHOD_SELECT" && (
        <InputMethodScreen
          onSelect={handleInputMethodSelect}
          onBack={() => {
            if (mode === "single") {
              setScreen("AGE_SELECT");
            } else {
              setScreen("PAIR_EXPECTATION");
            }
          }}
        />
      )}

      {screen === "INTERVIEW" && (
        <InterviewScreen
          currentQuestion={currentQuestion}
          progress={currentProgress}
          isLoading={isLoading}
          fallbackUsed={fallbackUsed}
          inputMethod={inputMethod}
          audioStreamingUrl={singleAudioStreamingUrl}
          onSubmitAnswer={handleSingleAnswerSubmit}
          onFinishEarly={() => fetchSingleReflection(turns)}
          onReset={handleReset}
          isSimple={isSimple}
        />
      )}

      {screen === "CLOSING" && (
        <ClosingScreen
          closingComment={closingComment}
          onProceedToResult={() => setScreen("REFLECTION")}
          onReset={handleReset}
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
          initialNameA={pairNameA}
          initialNameB={pairNameB}
          initialRelationship={pairRelationship}
          onNext={(nA, nB, rel) => {
            setPairNameA(nA);
            setPairNameB(nB);
            setPairRelationship(rel);
            setScreen("PAIR_AGE_A");
          }}
          onBack={() => setScreen("CONSENT")}
        />
      )}

      {screen === "PAIR_AGE_A" && (() => {
        const displayNameA = pairNameA.endsWith("さん") || pairNameA.endsWith("ちゃん") || pairNameA.endsWith("くん")
          ? pairNameA
          : `${pairNameA}さん`;
        return (
          <AgeScreen
            title={`${displayNameA}の年齢を教えてください`}
            subtitle={`${displayNameA}に合わせた、話しやすい言葉づかいで質問するために使用します。`}
            initialAge={pairAgeA}
            onSelect={(selectedAge) => {
              setPairAgeA(selectedAge);
              setScreen("PAIR_AGE_B");
            }}
            onBack={() => setScreen("PAIR_SETUP")}
          />
        );
      })()}

      {screen === "PAIR_AGE_B" && (() => {
        const displayNameB = pairNameB.endsWith("さん") || pairNameB.endsWith("ちゃん") || pairNameB.endsWith("くん")
          ? pairNameB
          : `${pairNameB}さん`;
        return (
          <AgeScreen
            title={`${displayNameB}の年齢を教えてください`}
            subtitle={`${displayNameB}に合わせた、話しやすい言葉づかいで質問するために使用します。`}
            initialAge={pairAgeB}
            onSelect={(selectedAge) => {
              setPairAgeB(selectedAge);
              setScreen("PAIR_EXPECTATION");
            }}
            onBack={() => setScreen("PAIR_AGE_A")}
          />
        );
      })()}

      {screen === "PAIR_EXPECTATION" && (
        <PairExpectationScreen
          nameA={pairNameA}
          nameB={pairNameB}
          onSelect={(exp) => {
            setPairExpectationType(exp);
            setScreen("INPUT_METHOD_SELECT");
          }}
          onBack={() => setScreen("PAIR_AGE_B")}
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
          inputMethod={inputMethod}
          audioStreamingUrl={pairAudioStreamingUrl}
          onSubmitAnswer={handlePairAnswerSubmit}
          onFinishEarly={() => fetchPairReflection(pairTurns)}
          onReset={handleReset}
        />
      )}

      {screen === "PAIR_CLOSING" && (
        <ClosingScreen
          closingComment={pairClosingComment}
          isPair={true}
          nameA={pairNameA}
          nameB={pairNameB}
          onProceedToResult={() => setScreen("PAIR_REFLECTION")}
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

      {/* 共通フッターツールバー（スタッフ専用データ管理） */}
      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.825rem",
          color: "var(--text-muted)",
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            style={{
              background: "rgba(241, 245, 249, 0.8)",
              border: "1px solid var(--border-color)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.775rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "0.375rem",
              transition: "all 0.15s ease",
            }}
            title="ブース担当者用データ閲覧（暗証番号が必要です）"
          >
            <span>🔒</span>
            <span>スタッフ専用管理</span>
          </button>
        </div>
      </footer>

      {/* スタッフ専用モーダル */}
      <AdminEpisodeManagerModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}