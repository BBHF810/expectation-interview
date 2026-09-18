export type AgeGroup = "under_10" | "11_30" | "31_plus" | "no_answer";

export type PartnerType = "family" | "partner" | "friend" | "other";

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
  isSkipped: boolean;
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

export type ScreenState =
  | "WELCOME"
  | "CONSENT"
  | "AGE_SELECT"
  | "CARE_SELECT"
  | "PARTNER_SELECT"
  | "EXPECTATION_SELECT"
  | "INTERVIEW"
  | "REFLECTION"
  | "SAFETY";