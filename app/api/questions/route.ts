import { NextResponse } from "next/server";
import { getQuestion, getQuestions, stripQuestionAnswers } from "@/lib/content";
import { answersMatch } from "@/lib/utils";
import type { Solution } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("id");

  if (questionId) {
    const question = getQuestion(questionId);
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(stripQuestionAnswers(question));
  }

  const examOnly = searchParams.get("examOnly") !== "false";
  const questions = getQuestions({
    moduleId: searchParams.get("moduleId") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    topic: searchParams.get("topic") ?? undefined,
    revisionTopic: searchParams.get("revisionTopic") ?? undefined,
    examOnly,
  });

  return NextResponse.json(questions.map(stripQuestionAnswers));
}

export async function POST(request: Request) {
  const { questionId, answer } = await request.json();
  const question = getQuestion(questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct = answersMatch(answer, question.correctAnswer);
  const solution = question.solution as Solution;

  return NextResponse.json({
    correct,
    solution,
    correctAnswer: question.correctAnswer,
    moduleId: question.moduleId,
    topic: question.topic,
  });
}
