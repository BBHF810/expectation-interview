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
import { ConceptExplanationModal } from "@/components/ConceptExplanationModal";
import { AdminEpisodeManagerModal } from "@/components/AdminEpisodeManagerModal";
import { ANIMAL_DIAGNOSES, getInitialSingleQuestion } from "@/lib/fallbacks";
import { PAIR_ANIMAL_COMBOS, getInitialPairQuestion, getFallbackPairQuestion } from "@/lib/pair-fallbacks";
import { saveEpisodeLocally } from "@/lib/episode-storage";
import { CollectedEpisode } from "@/types";

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>("WELCOME");
  const [mode, setMode] = useState<ExperienceMode>("single");
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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
  const [pairAgeA, setPairAgeA] = useState<AgeGroup>("11_30");
  const [pairAgeB, setPairAgeB] = useState<AgeGroup>("11_30");
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

  // 一人モード：インタビュー開始（属性に応じた固定質問を即時セット）
  const handleStartSingleInterview = (selectedExp: ExpectationType) => {
    setExpectationType(selectedExp);
    const initialQ = getInitialSingleQuestion({
      ageGroup,
      partner,
      isCare,
      expectationType: selectedExp,
    });
    setCurrentQuestion(initialQ.question);
    setCurrentProgress(1);
    setFallbackUsed(false);
    setIsLoading(false);
    setScreen("INTERVIEW");
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

      const animalDiag = data.animalDiagnosis || ANIMAL_DIAGNOSES[0];
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
        ageGroup,
        partner,
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

      setScreen("REFLECTION");
    } catch (err) {
      const fallbackDiag = ANIMAL_DIAGNOSES[0];
      const fallbackExpected = history[1]?.answer || history[0]?.answer || "（相手への思い）";
      const fallbackActual = history[0]?.answer || "（実際の出来事）";
      const fallbackRef = "お互いの気持ちに気づき、温かい対話の振り返りとなりました。";

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
        ageGroup,
        partner,
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

      setScreen("REFLECTION");
    } finally {
      setIsLoading(false);
    }
  };

  // ふたりモード：インタビュー開始（名前・関係性・期待に応じた固定質問を即時セット）
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
  // Q1: A回答 → B回答(同じ質問) → Q2: A回答 → B回答(同じ質問)
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
      // Q1のBさん向け文面に自然に変更
      setPairCurrentSpeaker("B");
      setPairCurrentSpeakerName(pairNameB);
      setPairCurrentQuestion(
        `${pairNameB}さん、${pairNameA}さんのお話を聞いて、そのとき実際にはどう思っていたり、どんな状況でしたか？`
      );
      return;
    }

    if (turnCount === 3) {
      // Q2のBさん向け文面に自然に変更
      setPairCurrentSpeaker("B");
      setPairCurrentSpeakerName(pairNameB);
      setPairCurrentQuestion(
        `${pairNameB}さん、同じ出来事を振り返って、${pairNameA}さんとのお互いの気持ちについてどう感じましたか？`
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
            relationship: pairRelationship,
            expectationType: pairExpectationType,
            currentTurnSpeaker: "A",
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
        setPairCurrentSpeaker("A");
        setPairCurrentSpeakerName(pairNameA);
        setPairProgress(2);
        if (data.fallbackUsed) setFallbackUsed(true);
      } catch (err) {
        // フォールバック: Q2 の固定質問
        const fallback = getFallbackPairQuestion(pairNameA, pairNameB, 2, pairExpectationType);
        setPairCurrentQuestion(fallback.question);
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
        nameA: pairNameA,
        nameB: pairNameB,
        ageA: pairAgeA,
        ageB: pairAgeB,
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

      setScreen("PAIR_REFLECTION");
    } catch (err) {
      const fallbackDiag = PAIR_ANIMAL_COMBOS[0];
      const fallbackPerspA = history[0]?.answer || "（思い）";
      const fallbackPerspB = history[1]?.answer || "（受け止め）";
      const fallbackRef = `${pairNameA}さんと${pairNameB}さんの素直な気持ちが通い合った、温かい対話の記録です。`;

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
        nameA: pairNameA,
        nameB: pairNameB,
        ageA: pairAgeA,
        ageB: pairAgeB,
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
          onOpenConceptExplanation={() => setIsConceptModalOpen(true)}
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
          onOpenConceptExplanation={() => setIsConceptModalOpen(true)}
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
          onNext={(nA, nB, rel, aA, aB) => {
            setPairNameA(nA);
            setPairNameB(nB);
            setPairRelationship(rel);
            setPairAgeA(aA);
            setPairAgeB(aB);
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
          onOpenConceptExplanation={() => setIsConceptModalOpen(true)}
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

      {/* 共通フッターツールバー（具体例解説＆スタッフ用データ管理） */}
      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          fontSize: "0.825rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setIsConceptModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-color)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.825rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
            }}
          >
            📖 マンガでわかる「相互期待感」
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            style={{
              background: "rgba(241, 245, 249, 0.8)",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.775rem",
              padding: "0.3rem 0.6rem",
              borderRadius: "0.375rem",
              transition: "all 0.15s ease",
            }}
            title="端末に蓄積されたエピソードの閲覧・CSVエクスポート"
          >
            📊 エピソードデータ管理（スタッフ用）
          </button>
        </div>
      </footer>

      {/* モーダル群 */}
      <ConceptExplanationModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />

      <AdminEpisodeManagerModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}