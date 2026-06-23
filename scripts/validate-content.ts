import * as fs from "fs";
import * as path from "path";
import type { ExamSection, QuestionData, TopicLesson } from "../lib/types";

const DATA_DIR = path.join(__dirname, "..", "data");
let errors = 0;

function error(msg: string) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// --- Exam sections ---
const sectionsFile = path.join(DATA_DIR, "exam-sections.json");
if (!fs.existsSync(sectionsFile)) {
  error("Missing exam-sections.json");
} else {
  const sections = JSON.parse(fs.readFileSync(sectionsFile, "utf-8")) as ExamSection[];
  if (sections.length !== 3) error(`Expected 3 exam sections, got ${sections.length}`);
  const subtopicIds = new Set<string>();
  for (const section of sections) {
    if (!section.id || !section.subtopics?.length) {
      error(`Section ${section.id} missing subtopics`);
    }
    for (const sub of section.subtopics) {
      subtopicIds.add(sub.id);
    }
  }
  console.log(`Validated ${sections.length} exam sections, ${subtopicIds.size} subtopics`);
}

// --- Lessons ---
const lessonsDir = path.join(DATA_DIR, "lessons");
const lessonIds: string[] = [];
if (!fs.existsSync(lessonsDir)) {
  error("Missing data/lessons directory");
} else {
  for (const f of fs.readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const lesson = JSON.parse(fs.readFileSync(path.join(lessonsDir, f), "utf-8")) as TopicLesson;
    lessonIds.push(lesson.id);
    if (!lesson.slides?.length) error(`Lesson ${lesson.id} has no slides`);
    if (!lesson.workedExamples?.length) error(`Lesson ${lesson.id} has no worked examples`);
    if (!lesson.sectionId) error(`Lesson ${lesson.id} missing sectionId`);
  }
  console.log(`Validated ${lessonIds.length} lessons`);
}

// --- Questions ---
const examFile = path.join(DATA_DIR, "questions", "exam-questions.json");
if (!fs.existsSync(examFile)) {
  error("Missing exam-questions.json — run npm run generate:exam");
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(examFile, "utf-8")) as QuestionData[];

if (questions.length < 50) {
  error(`Expected at least 50 exam questions, got ${questions.length}`);
}

const topics = new Set<string>();
const lessonCounts: Record<string, number> = {};

questions.forEach((q) => {
  topics.add(q.topic);
  if (q.type !== "ProblemSolving") {
    error(`Question ${q.id} must be ProblemSolving, got ${q.type}`);
  }
  if (!q.tags.includes("exam-style")) {
    error(`Question ${q.id} missing exam-style tag`);
  }
  if (!q.solution?.steps?.length) {
    error(`Question ${q.id} missing solution steps`);
  }
  if (!q.correctAnswer) {
    error(`Question ${q.id} missing correctAnswer`);
  }
  if (q.options?.length) {
    error(`Question ${q.id} should not have MCQ options`);
  }
  if (!q.sectionId) {
    error(`Question ${q.id} missing sectionId — run npm run generate:exam`);
  }
  if (!q.lessonId) {
    error(`Question ${q.id} missing lessonId — run npm run generate:exam`);
  }
  if (q.lessonId) {
    lessonCounts[q.lessonId] = (lessonCounts[q.lessonId] ?? 0) + 1;
  }
});

for (const id of lessonIds) {
  const count = lessonCounts[id] ?? 0;
  if (count < 5) {
    error(`Lesson ${id} has only ${count} questions (need at least 5)`);
  }
}

console.log(`Validated ${questions.length} exam-style questions across ${topics.size} topics`);
console.log(`Per lesson: ${JSON.stringify(lessonCounts)}`);

if (errors > 0) {
  console.error(`${errors} validation error(s)`);
  process.exit(1);
}
console.log("All validations passed!");
