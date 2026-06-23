import * as fs from "fs";
import * as path from "path";
import type { ExamData, ModuleData, QuestionData } from "@/lib/types";
import type { RevisionTopic } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

const REVISION_TOPIC_MATCH: Record<string, string[]> = {
  hypergeometric: ["Hypergeometric"],
  poisson: ["Poisson", "Poisson/Binomial"],
  binomial: ["Binomial", "Poisson/Binomial"],
  normal: ["Normal"],
  continuous: ["Continuous"],
  joint: ["Joint", "Covariance", "Correlation"],
  variance: ["Variance", "Covariance", "Correlation"],
};

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function getRevisionTopics(): RevisionTopic[] {
  return loadJson<RevisionTopic[]>(path.join(DATA_DIR, "revision-topics.json"));
}

export function getRevisionTopic(id: string): RevisionTopic | undefined {
  return getRevisionTopics().find((t) => t.id === id);
}

/** Exam-style practice questions only (from important-questions.json) */
export function getExamPracticeQuestions(): QuestionData[] {
  return getQuestions({ tag: "exam-style" }).filter((q) => q.type === "ProblemSolving");
}

export function filterByRevisionTopic(questions: QuestionData[], revisionTopicId: string): QuestionData[] {
  const keys = REVISION_TOPIC_MATCH[revisionTopicId];
  if (!keys) return questions;
  return questions.filter((q) => keys.some((k) => q.topic.includes(k)));
}

export function getModules(): ModuleData[] {
  const modulesDir = path.join(DATA_DIR, "modules");
  return fs
    .readdirSync(modulesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => loadJson<ModuleData>(path.join(modulesDir, f)))
    .sort((a, b) => a.order - b.order);
}

export function getModule(moduleId: string): ModuleData | undefined {
  return getModules().find((m) => m.id === moduleId);
}

export function getLesson(moduleId: string, slug: string) {
  const mod = getModule(moduleId);
  if (!mod) return undefined;
  const lesson = mod.lessons.find((l) => l.slug === slug);
  if (!lesson) return undefined;
  return {
    ...lesson,
    id: `${moduleId}/${lesson.slug}`,
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleOrder: mod.order,
  };
}

export function getAllQuestions(): QuestionData[] {
  const examFile = path.join(DATA_DIR, "questions", "exam-questions.json");
  if (!fs.existsSync(examFile)) {
    return [];
  }
  return loadJson<QuestionData[]>(examFile);
}

export function getQuestions(filters?: {
  moduleId?: string;
  difficulty?: string;
  tag?: string;
  topic?: string;
  revisionTopic?: string;
  examOnly?: boolean;
}): QuestionData[] {
  let questions = getAllQuestions();

  if (filters?.examOnly) {
    questions = questions.filter((q) => q.tags.includes("exam-style") && q.type === "ProblemSolving");
  }
  if (filters?.moduleId) {
    questions = questions.filter((q) => q.moduleId === filters.moduleId);
  }
  if (filters?.difficulty) {
    questions = questions.filter((q) => q.difficulty === filters.difficulty);
  }
  if (filters?.tag) {
    questions = questions.filter((q) => q.tags.includes(filters.tag!));
  }
  if (filters?.topic) {
    questions = questions.filter((q) => q.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
  }
  if (filters?.revisionTopic) {
    questions = filterByRevisionTopic(questions, filters.revisionTopic);
  }

  return questions.sort((a, b) => a.id.localeCompare(b.id));
}

export function getQuestion(id: string): QuestionData | undefined {
  return getAllQuestions().find((q) => q.id === id);
}

export function getExams(): ExamData[] {
  const examsDir = path.join(DATA_DIR, "exams");
  return fs
    .readdirSync(examsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => loadJson<ExamData>(path.join(examsDir, f)));
}

export function getExam(id: string): ExamData | undefined {
  return getExams().find((e) => e.id === id);
}

export function stripQuestionAnswers(question: QuestionData) {
  return {
    id: question.id,
    moduleId: question.moduleId,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    type: question.type,
    question: question.question,
    options: question.options,
    hints: question.hints,
    tags: question.tags,
  };
}

export function getQuestionCountByModule(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of getExamPracticeQuestions()) {
    counts[q.moduleId] = (counts[q.moduleId] ?? 0) + 1;
  }
  return counts;
}

export function getDifficultyCounts(moduleId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of getQuestions({ moduleId, examOnly: true })) {
    counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
  }
  return counts;
}

export function countQuestionsByRevisionTopic(): Record<string, number> {
  const exam = getExamPracticeQuestions();
  const counts: Record<string, number> = {};
  for (const topic of getRevisionTopics()) {
    counts[topic.id] = filterByRevisionTopic(exam, topic.id).length;
  }
  return counts;
}
