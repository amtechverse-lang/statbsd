import * as fs from "fs";
import * as path from "path";
import type { QuestionData, ModuleData } from "../lib/types";

const DATA_DIR = path.join(__dirname, "..", "data");

const EXPECTED_COUNTS: Record<string, number> = {
  foundations: 20,
  "random-variables": 30,
  "discrete-distributions": 35,
  "continuous-distributions": 30,
  "discrete-uniform": 15,
  "binomial-distribution": 40,
  "hypergeometric-distribution": 30,
  "geometric-distribution": 25,
  "poisson-distribution": 35,
  "joint-distributions": 30,
  "normal-distribution": 45,
  "normal-applications": 35,
  "exam-prep": 35,
};

let errors = 0;

function error(msg: string) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// Validate modules
const modulesDir = path.join(DATA_DIR, "modules");
const moduleFiles = fs.readdirSync(modulesDir).filter((f) => f.endsWith(".json"));
if (moduleFiles.length !== 13) {
  error(`Expected 13 modules, found ${moduleFiles.length}`);
}

const moduleIds = new Set<string>();
moduleFiles.forEach((file) => {
  const mod = JSON.parse(fs.readFileSync(path.join(modulesDir, file), "utf-8")) as ModuleData;
  moduleIds.add(mod.id);
  if (!mod.lessons || mod.lessons.length === 0) {
    error(`Module ${mod.id} has no lessons`);
  }
});

// Validate questions
const questionsDir = path.join(DATA_DIR, "questions");
let totalQuestions = 0;

Object.entries(EXPECTED_COUNTS).forEach(([moduleId, minCount]) => {
  const file = path.join(questionsDir, `${moduleId}.json`);
  if (!fs.existsSync(file)) {
    error(`Missing questions file for ${moduleId}`);
    return;
  }
  const questions = JSON.parse(fs.readFileSync(file, "utf-8")) as QuestionData[];
  if (questions.length < minCount) {
    error(`Module ${moduleId}: expected at least ${minCount} questions, got ${questions.length}`);
  }
  totalQuestions += questions.length;

  questions.forEach((q) => {
    if (!moduleIds.has(q.moduleId)) {
      error(`Question ${q.id} references unknown module ${q.moduleId}`);
    }
    if (!q.solution?.steps || q.solution.steps.length < 1) {
      error(`Question ${q.id} missing solution steps`);
    }
    if (!q.correctAnswer) {
      error(`Question ${q.id} missing correctAnswer`);
    }
    if (q.type === "MCQ" && (!q.options || q.options.length < 2)) {
      error(`MCQ ${q.id} missing options`);
    }
  });
});

if (totalQuestions < 340) {
  error(`Total questions ${totalQuestions} is less than 340`);
}

const importantFile = path.join(questionsDir, "important-questions.json");
if (fs.existsSync(importantFile)) {
  const important = JSON.parse(fs.readFileSync(importantFile, "utf-8")) as QuestionData[];
  if (important.length < 25) {
    error(`Expected at least 25 important questions, got ${important.length}`);
  }
  totalQuestions += important.length;
  important.forEach((q) => {
    if (!q.tags.includes("important")) {
      error(`Important question ${q.id} missing 'important' tag`);
    }
  });
  console.log(`  + ${important.length} important exam-style questions`);
} else {
  error("Missing important-questions.json");
}

console.log(`Validated ${moduleFiles.length} modules, ${totalQuestions} questions`);
if (errors > 0) {
  console.error(`${errors} validation error(s)`);
  process.exit(1);
}
console.log("All validations passed!");
