import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import type { ModuleData, QuestionData, ExamData } from "../lib/types";

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, "..", "data");

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function seedModules() {
  const modulesDir = path.join(DATA_DIR, "modules");
  const files = fs.readdirSync(modulesDir).filter((f) => f.endsWith(".json"));

  for (const file of files.sort()) {
    const moduleData = loadJson<ModuleData>(path.join(modulesDir, file));

    await prisma.module.upsert({
      where: { id: moduleData.id },
      create: {
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        prerequisites: moduleData.prerequisites,
      },
      update: {
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        prerequisites: moduleData.prerequisites,
      },
    });

    for (const lesson of moduleData.lessons) {
      const existing = await prisma.lesson.findFirst({
        where: { moduleId: moduleData.id, slug: lesson.slug },
      });

      if (existing) {
        await prisma.lesson.update({
          where: { id: existing.id },
          data: {
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            diagrams: lesson.diagrams,
            examples: lesson.examples as object,
          },
        });
      } else {
        await prisma.lesson.create({
          data: {
            moduleId: moduleData.id,
            slug: lesson.slug,
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            diagrams: lesson.diagrams,
            examples: lesson.examples as object,
          },
        });
      }
    }
  }
}

async function seedQuestions() {
  const questionsDir = path.join(DATA_DIR, "questions");
  const files = fs.readdirSync(questionsDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const questions = loadJson<QuestionData[]>(path.join(questionsDir, file));

    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          moduleId: q.moduleId,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
          correctAnswer: q.correctAnswer,
          solution: q.solution as object,
          hints: q.hints,
          tags: q.tags,
        },
        update: {
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
          correctAnswer: q.correctAnswer,
          solution: q.solution as object,
          hints: q.hints,
          tags: q.tags,
        },
      });
    }
  }
}

async function seedExams() {
  const examsDir = path.join(DATA_DIR, "exams");
  const files = fs.readdirSync(examsDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const exam = loadJson<ExamData>(path.join(examsDir, file));
    await prisma.exam.upsert({
      where: { id: exam.id },
      create: {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        questionIds: exam.questionIds,
        timeLimit: exam.timeLimit,
        passingScore: exam.passingScore,
      },
      update: {
        name: exam.name,
        description: exam.description,
        questionIds: exam.questionIds,
        timeLimit: exam.timeLimit,
        passingScore: exam.passingScore,
      },
    });
  }
}

async function main() {
  console.log("Seeding StatMaster...");
  await seedModules();
  console.log("Modules seeded");
  await seedQuestions();
  console.log("Questions seeded");
  await seedExams();
  console.log("Exams seeded");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
