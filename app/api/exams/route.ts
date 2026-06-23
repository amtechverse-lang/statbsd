import { NextResponse } from "next/server";
import { getExams, getQuestion } from "@/lib/content";
import { answersMatch } from "@/lib/utils";
import type { Solution } from "@/lib/types";

function checkMcqAnswer(
  answer: string,
  correctAnswer: string,
  options: { label: string; value: string }[] | undefined
): boolean {
  if (!options?.length) return answersMatch(answer, correctAnswer);
  const correctOpt = options.find((o) => o.label === correctAnswer);
  const selectedOpt = options.find((o) => o.label === answer);
  if (correctOpt && selectedOpt) return answersMatch(selectedOpt.value, correctOpt.value);
  if (selectedOpt && answersMatch(selectedOpt.value, correctAnswer)) return true;
  return answersMatch(answer, correctAnswer);
}

export async function GET() {
  const exams = getExams();
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const { examId, answers } = await request.json();
  const exam = getExams().find((e) => e.id === examId);
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const results: { id: string; correct: boolean; correctAnswer: string; solution: Solution }[] = [];
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;

  exam.questionIds.forEach((qid, i) => {
    const question = getQuestion(qid);
    if (!question) return;
    const userAnswer = answers[i] ?? "";
    const correct =
      question.type === "MCQ"
        ? checkMcqAnswer(userAnswer, question.correctAnswer, question.options)
        : answersMatch(userAnswer, question.correctAnswer);
    if (correct) correctCount++;
    if (!topicBreakdown[question.topic]) {
      topicBreakdown[question.topic] = { correct: 0, total: 0 };
    }
    topicBreakdown[question.topic].total++;
    if (correct) topicBreakdown[question.topic].correct++;
    results.push({
      id: qid,
      correct,
      correctAnswer: question.correctAnswer,
      solution: question.solution,
    });
  });

  const total = exam.questionIds.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= exam.passingScore;

  const weakTopics = Object.entries(topicBreakdown)
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.6)
    .map(([topic]) => topic);

  return NextResponse.json({
    score,
    correct: correctCount,
    total,
    passed,
    topicBreakdown,
    studyPlan: {
      weakTopics,
      recommendedModules: weakTopics.map((topic) => ({
        id: topic.toLowerCase().replace(/\s+/g, "-"),
        question: `Review ${topic}`,
        moduleId: "exam-prep",
      })),
    },
    solutions: results,
  });
}
