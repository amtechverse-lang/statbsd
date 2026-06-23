import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { answersMatch } from "@/lib/utils";
import { updateStreak, checkAchievements } from "@/lib/progress";
import type { Solution } from "@/lib/types";

const PUBLIC_QUESTION_FIELDS = {
  id: true,
  moduleId: true,
  topic: true,
  subtopic: true,
  difficulty: true,
  type: true,
  question: true,
  options: true,
  hints: true,
  tags: true,
} as const;

function stripAnswers(question: {
  id: string;
  moduleId: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  question: string;
  options?: unknown;
  hints: string[];
  tags: string[];
  correctAnswer?: string;
  solution?: unknown;
}) {
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  const difficulty = searchParams.get("difficulty");
  const questionId = searchParams.get("id");
  const forExam = searchParams.get("exam") === "true";

  if (questionId) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (forExam) {
      return NextResponse.json(stripAnswers(question));
    }
    return NextResponse.json({
      ...stripAnswers(question),
      hints: question.hints,
    });
  }

  const where: Record<string, string> = {};
  if (moduleId) where.moduleId = moduleId;
  if (difficulty) where.difficulty = difficulty;

  const questions = await prisma.question.findMany({
    where,
    orderBy: { id: "asc" },
    select: PUBLIC_QUESTION_FIELDS,
  });

  return NextResponse.json(questions);
}

function checkMcqAnswer(
  answer: string,
  correctAnswer: string,
  options: { label: string; value: string }[] | null
): boolean {
  if (!options?.length) return answer === correctAnswer;

  const correctOpt = options.find((o) => o.label === correctAnswer);
  const selectedOpt = options.find((o) => o.label === answer);

  if (correctOpt && selectedOpt) {
    return answersMatch(selectedOpt.value, correctOpt.value);
  }
  if (selectedOpt && answersMatch(selectedOpt.value, correctAnswer)) {
    return true;
  }
  return answer === correctAnswer;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, answer, timeMs = 0 } = await request.json();
  const userId = session.user.id;

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct =
    question.type === "MCQ"
      ? checkMcqAnswer(
          answer,
          question.correctAnswer,
          question.options as { label: string; value: string }[] | null
        )
      : answersMatch(answer, question.correctAnswer);

  await prisma.questionAttempt.create({
    data: { userId, questionId, answer, correct, timeMs },
  });

  const moduleAttempts = await prisma.questionAttempt.findMany({
    where: { userId, question: { moduleId: question.moduleId } },
  });
  const solved = new Set(moduleAttempts.map((a) => a.questionId)).size;
  const correctCount = moduleAttempts.filter((a) => a.correct).length;
  const accuracy = moduleAttempts.length > 0 ? (correctCount / moduleAttempts.length) * 100 : 0;

  const totalLessons = await prisma.lesson.count({ where: { moduleId: question.moduleId } });

  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: question.moduleId } },
    create: {
      userId,
      moduleId: question.moduleId,
      questionsSolved: solved,
      questionsCorrect: correctCount,
      accuracy,
      totalLessons,
      lastActivity: new Date(),
      unlocked: question.moduleId === "foundations",
    },
    update: {
      questionsSolved: solved,
      questionsCorrect: correctCount,
      accuracy,
      lastActivity: new Date(),
    },
  });

  await updateStreak(userId);
  await checkAchievements(userId);

  const solution = question.solution as unknown as Solution;

  return NextResponse.json({
    correct,
    solution,
    correctAnswer: question.correctAnswer,
  });
}
