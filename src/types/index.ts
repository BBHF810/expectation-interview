export type AgeGroup = "under_10" | "11_30" | "31_plus" | "no_answer";

export type PartnerType = "parents" | "child" | "partner" | "friend" | "other";

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
  isSkipped: boolean; // "思いつかない" or "答えたくない"
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
  progress: number; // 1, 2, 3
  isComplete: boolean;
  safetyAction: SafetyAction;
  fallbackUsed: boolean;
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
}

export type ScreenState =
  | "WELCOME"
  | "CONSENT"
  | "AGE_SELECT"
  | "PARTNER_SELECT"
  | "CARE_SELECT"
  | "EXPECTATION_SELECT"
  | "INTERVIEW"
  | "REFLECTION"
  | "SAFETY";
