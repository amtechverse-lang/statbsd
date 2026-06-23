import * as fs from "fs";
import * as path from "path";
import type { ExamData, ExamSection, ModuleData, QuestionData, TopicLesson } from "@/lib/types";
import type { RevisionTopic } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

const LESSON_TOPIC_MATCH: Record<string, string[]> = {
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

export function getExamSections(): ExamSection[] {
  return loadJson<ExamSection[]>(path.join(DATA_DIR, "exam-sections.json"));
}

export function getExamSection(sectionId: string): ExamSection | undefined {
  return getExamSections().find((s) => s.id === sectionId);
}

export function getLessonIds(): string[] {
  const lessonsDir = path.join(DATA_DIR, "lessons");
  return fs
    .readdirSync(lessonsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function getLesson(topicId: string): TopicLesson | undefined {
  const filePath = path.join(DATA_DIR, "lessons", `${topicId}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return loadJson<TopicLesson>(filePath);
}

export function getLessonsForSection(sectionId: string): TopicLesson[] {
  return getLessonIds()
    .map((id) => getLesson(id))
    .filter((l): l is TopicLesson => l !== undefined && l.sectionId === sectionId);
}

/** @deprecated Use getLesson() — kept for API compatibility */
export function getRevisionTopics(): RevisionTopic[] {
  const topics: RevisionTopic[] = [];
  for (const section of getExamSections()) {
    for (const sub of section.subtopics) {
      const lesson = getLesson(sub.id);
      topics.push({
        id: sub.id,
        title: sub.title,
        icon: sub.icon,
        questionTopic: sub.id,
        summary: sub.description,
        content: lesson?.slides.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n") ?? sub.description,
      });
    }
  }
  return topics;
}

export function getRevisionTopic(id: string): RevisionTopic | undefined {
  return getRevisionTopics().find((t) => t.id === id);
}

/** Exam-style practice questions only */
export function getExamPracticeQuestions(): QuestionData[] {
  return getQuestions({ examOnly: true }).filter((q) => q.type === "ProblemSolving");
}

export function filterByLesson(questions: QuestionData[], lessonId: string): QuestionData[] {
  const withMeta = questions.filter((q) => q.lessonId === lessonId);
  if (withMeta.length > 0) return withMeta;
  const keys = LESSON_TOPIC_MATCH[lessonId];
  if (!keys) return questions;
  return questions.filter((q) => keys.some((k) => q.topic.includes(k)));
}

export function filterByRevisionTopic(questions: QuestionData[], revisionTopicId: string): QuestionData[] {
  return filterByLesson(questions, revisionTopicId);
}

export function getModules(): ModuleData[] {
  const modulesDir = path.join(DATA_DIR, "modules");
  if (!fs.existsSync(modulesDir)) return [];
  return fs
    .readdirSync(modulesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => loadJson<ModuleData>(path.join(modulesDir, f)))
    .sort((a, b) => a.order - b.order);
}

export function getModule(moduleId: string): ModuleData | undefined {
  return getModules().find((m) => m.id === moduleId);
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
  lessonId?: string;
  sectionId?: string;
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
  if (filters?.sectionId) {
    questions = questions.filter((q) => q.sectionId === filters.sectionId);
  }
  if (filters?.lessonId) {
    questions = filterByLesson(questions, filters.lessonId);
  }
  if (filters?.revisionTopic) {
    questions = filterByLesson(questions, filters.revisionTopic);
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
    sectionId: question.sectionId,
    lessonId: question.lessonId,
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

export function countQuestionsByLesson(): Record<string, number> {
  const exam = getExamPracticeQuestions();
  const counts: Record<string, number> = {};
  for (const id of getLessonIds()) {
    counts[id] = filterByLesson(exam, id).length;
  }
  return counts;
}

export function countQuestionsByRevisionTopic(): Record<string, number> {
  return countQuestionsByLesson();
}
