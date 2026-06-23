import * as fs from "fs";
import * as path from "path";
import type { QuestionData } from "../lib/types";

const DATA_DIR = path.join(__dirname, "..", "data");
let errors = 0;

function error(msg: string) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

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
});

console.log(`Validated ${questions.length} exam-style questions across ${topics.size} topics`);
console.log(`Topics: ${[...topics].sort().join(", ")}`);

if (errors > 0) {
  console.error(`${errors} validation error(s)`);
  process.exit(1);
}
console.log("All validations passed!");
