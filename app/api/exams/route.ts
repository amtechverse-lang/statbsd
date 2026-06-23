import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { checkAchievements } from "@/lib/progress";
import { answersMatch } from "@/lib/utils";
import type { Solution } from "@/lib/types";

function checkMcqAnswer(
  answer: string,
  correctAnswer: string,
  options: { label: string; value: string }[] | null
): boolean {
  if (!options?.length) return answer === correctAnswer;
  const correctOpt = options.find((o) => o.label === correctAnswer);
  const selectedOpt = options.find((o) => o.label === answer);
  if (correctOpt && selectedOpt) return answersMatch(selectedOpt.value, correctOpt.value);
  if (selectedOpt && answersMatch(selectedOpt.value, correctAnswer)) return true;
  return answer === correctAnswer;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exams = await prisma.exam.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId, answers, timeTaken } = await request.json();
  const userId = session.user.id;

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const questions = await prisma.question.findMany({
    where: { id: { in: exam.questionIds } },
  });

  const questionOrder = exam.questionIds.map(
    (id) => questions.find((q) => q.id === id)!
  ).filter(Boolean);

  let correct = 0;
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};

  questionOrder.forEach((q, i) => {
    const userAnswer = answers[i] ?? "";
    let isCorrect = false;
    if (q.type === "MCQ") {
      isCorrect = checkMcqAnswer(
        userAnswer,
        q.correctAnswer,
        q.options as { label: string; value: string }[] | null
      );
    } else {
      isCorrect = answersMatch(userAnswer, q.correctAnswer);
    }
    if (isCorrect) correct++;

    if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
    topicBreakdown[q.topic].total++;
    if (isCorrect) topicBreakdown[q.topic].correct++;
  });

  const score = questionOrder.length > 0 ? (correct / questionOrder.length) * 100 : 0;

  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      examId,
      answers,
      score,
      timeTaken,
      topicBreakdown,
    },
  });

  await checkAchievements(userId);

  const weakTopics = Object.entries(topicBreakdown)
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.6)
    .map(([topic]) => topic);

  const studyPlan = {
    weakTopics,
    recommendedModules: weakTopics.length > 0
      ? await prisma.question.findMany({
          where: { topic: { in: weakTopics } },
          take: 5,
          select: { id: true, question: true, moduleId: true, topic: true },
        })
      : [],
  };

  return NextResponse.json({
    score,
    correct,
    total: questionOrder.length,
    passed: score >= exam.passingScore,
    topicBreakdown,
    studyPlan,
    attemptId: attempt.id,
    solutions: questionOrder.map((q) => ({
      id: q.id,
      correctAnswer: q.correctAnswer,
      solution: q.solution as unknown as Solution,
    })),
  });
}
