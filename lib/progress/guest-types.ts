export interface QuestionAttemptRecord {
  questionId: string;
  correct: boolean;
  answer: string;
  timeMs: number;
  attemptedAt: string;
}

export interface GuestProgressData {
  lessonsCompleted: string[];
  questionAttempts: QuestionAttemptRecord[];
  moduleQuiz: Record<string, { score: number; passed: boolean }>;
  examAttempts: { examId: string; score: number; passed: boolean; date: string }[];
  streak: { current: number; longest: number; lastActive: string };
  achievements: string[];
}

export const EMPTY_GUEST_PROGRESS: GuestProgressData = {
  lessonsCompleted: [],
  questionAttempts: [],
  moduleQuiz: {},
  examAttempts: [],
  streak: { current: 0, longest: 0, lastActive: "" },
  achievements: [],
};
