import { NextResponse } from "next/server";
import { getQuestion, getQuestions, stripQuestionAnswers } from "@/lib/content";
import { answersMatch } from "@/lib/utils";
import type { Solution } from "@/lib/types";

function checkMcqAnswer(
  answer: string,
  correctAnswer: string,
  options: { label: string; value: string }[] | undefined
): boolean {
  if (!options?.length) return answer === correctAnswer;
  const correctOpt = options.find((o) => o.label === correctAnswer);
  const selectedOpt = options.find((o) => o.label === answer);
  if (correctOpt && selectedOpt) return answersMatch(selectedOpt.value, correctOpt.value);
  if (selectedOpt && answersMatch(selectedOpt.value, correctAnswer)) return true;
  return answer === correctAnswer;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId") ?? undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const questionId = searchParams.get("id");

  if (questionId) {
    const question = getQuestion(questionId);
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(stripQuestionAnswers(question));
  }

  const questions = getQuestions({ moduleId, difficulty, tag });
  return NextResponse.json(questions.map(stripQuestionAnswers));
}

export async function POST(request: Request) {
  const { questionId, answer } = await request.json();
  const question = getQuestion(questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct =
    question.type === "MCQ"
      ? checkMcqAnswer(answer, question.correctAnswer, question.options)
      : answersMatch(answer, question.correctAnswer);

  const solution = question.solution as Solution;

  return NextResponse.json({
    correct,
    solution,
    correctAnswer: question.correctAnswer,
    moduleId: question.moduleId,
  });
}
