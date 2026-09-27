export type ExperienceMode = "single" | "pair";

export type AgeGroup = "under_10" | "11_30" | "31_plus" | "no_answer";

export type PartnerType = "friend" | "parent_child" | "sibling" | "spouse" | "lover" | "other";

export type CareStatus = "yes" | "no" | "no_answer";

export type ExpectationType = "matched" | "mismatched" | "neutral";

export type QuestionPurpose =
  | "event"
  | "expectation"
  | "outcome"
  | "reason"
  | "communication"
  | "feeling";

export type SafetyAction = "continue" | "stop";

export interface DialogTurn {
  questionNumber: number;
  question: string;
  questionPurpose?: QuestionPurpose;
  answer: string;
  isSkipped?: boolean;
  skipReason?: "dont_know" | "no_answer";
}

export interface InterviewRequestBody {
  ageGroup: AgeGroup;
  partner: string;
  isCare: CareStatus;
  expectationType: ExpectationType;
  conversationHistory: Array<{
    question: string;
    answer: string;
    questionPurpose?: QuestionPurpose;
    isSkipped?: boolean;
    skipReason?: "dont_know" | "no_answer";
  }>;
}

export interface InterviewResponseData {
  nextQuestion: string;
  questionPurpose: QuestionPurpose;
  progress: number;
  isComplete: boolean;
  safetyAction: SafetyAction;
  fallbackUsed: boolean;
}

export interface AnimalDiagnosis {
  animalEmoji: string;
  animalName: string;
  catchphrase: string;
  description: string;
}

export interface ReflectionRequestBody {
  ageGroup: AgeGroup;
  partner: string;
  isCare: CareStatus;
  expectationType: ExpectationType;
  conversationHistory: Array<{
    question: string;
    answer: string;
    questionPurpose?: QuestionPurpose;
    isSkipped?: boolean;
    skipReason?: "dont_know" | "no_answer";
  }>;
}

export interface ReflectionResponseData {
  expected: string;
  actual: string;
  reflection: string;
  safetyAction: SafetyAction;
  missingInformation: string[];
  fallbackUsed?: boolean;
  animalDiagnosis: AnimalDiagnosis;
}

// ふたりで体験するモード用
export interface PairTurn {
  questionNumber: number;
  speaker: "A" | "B";
  speakerName: string;
  question: string;
  answer: string;
  isSkipped?: boolean;
}

export interface PairInterviewRequestBody {
  nameA: string;
  nameB: string;
  relationship: string;
  expectationType: ExpectationType;
  currentTurnSpeaker: "A" | "B";
  conversationHistory: PairTurn[];
}

export interface PairInterviewResponseData {
  nextQuestion: string;
  nextSpeaker: "A" | "B";
  nextSpeakerName: string;
  progress: number; // 1, 2, 3
  isComplete: boolean;
  safetyAction: SafetyAction;
  fallbackUsed: boolean;
}

export interface PairAnimalDiagnosis {
  animalA: { emoji: string; name: string };
  animalB: { emoji: string; name: string };
  pairTitle: string;
  pairCatchphrase: string;
  pairDescription: string;
}

export interface PairReflectionRequestBody {
  nameA: string;
  nameB: string;
  relationship: string;
  expectationType: ExpectationType;
  conversationHistory: PairTurn[];
}

export interface PairReflectionResponseData {
  perspectiveA: string;
  perspectiveB: string;
  reflection: string;
  pairAnimalDiagnosis: PairAnimalDiagnosis;
  safetyAction: SafetyAction;
  fallbackUsed?: boolean;
}

export type ScreenState =
  | "WELCOME"
  | "CONSENT"
  | "AGE_SELECT"
  | "CARE_SELECT"
  | "PARTNER_SELECT"
  | "EXPECTATION_SELECT"
  | "INTERVIEW"
  | "REFLECTION"
  | "SAFETY"
  | "PAIR_SETUP"
  | "PAIR_EXPECTATION"
  | "PAIR_INTERVIEW"
  | "PAIR_REFLECTION";

export interface CollectedEpisode {
  id: string;
  createdAt: string;
  mode: ExperienceMode;
  ageGroup?: AgeGroup;
  partner?: string;
  isCare?: CareStatus;
  nameA?: string;
  nameB?: string;
  ageA?: AgeGroup;
  ageB?: AgeGroup;
  relationship?: string;
  expectationType: ExpectationType;
  turns: Array<{
    turnNumber: number;
    speaker?: string;
    question: string;
    answer: string;
  }>;
  summary: {
    expected?: string;
    actual?: string;
    perspectiveA?: string;
    perspectiveB?: string;
    reflection: string;
    diagnosisTitle?: string;
  };
}