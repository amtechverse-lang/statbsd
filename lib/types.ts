export interface SolutionStep {
  step: number;
  title: string;
  content: string;
  explanation: string;
  formula?: string;
  image?: string;
}

export interface Solution {
  steps: SolutionStep[];
  finalAnswer: string;
  commonMistakes: string[];
}

export interface McqOption {
  label: string;
  value: string;
}

export interface QuestionData {
  id: string;
  moduleId: string;
  topic: string;
  subtopic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "FillIn" | "ProblemSolving";
  question: string;
  options?: McqOption[];
  correctAnswer: string;
  solution: Solution;
  hints: string[];
  tags: string[];
}

export interface LessonData {
  slug: string;
  title: string;
  content: string;
  order: number;
  diagrams: string[];
  examples: unknown[];
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  lessons: LessonData[];
}

export interface ExamData {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  timeLimit: number;
  passingScore: number;
}

export interface RevisionTopic {
  id: string;
  title: string;
  icon: string;
  questionTopic: string;
  summary: string;
  content: string;
}

export interface ProgressSummary {
  overall: number;
  completedModules: number;
  totalModules: number;
  questionsSolved: number;
  questionsCorrect: number;
  accuracy: number;
  streak: number;
  modules: {
    id: string;
    title: string;
    description?: string;
    progress: number;
    unlocked: boolean;
    order: number;
    lessonsCount?: number;
    practiceCount?: number;
  }[];
  achievements: {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
  recommendations: string[];
  allAchievements?: {
    key: string;
    name: string;
    description: string;
    icon: string;
  }[];
}
