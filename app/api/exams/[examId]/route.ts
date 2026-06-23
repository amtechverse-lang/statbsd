import { NextResponse } from "next/server";
import { getExam, getQuestion, stripQuestionAnswers } from "@/lib/content";

export async function GET(_request: Request, { params }: { params: { examId: string } }) {
  const exam = getExam(params.examId);
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const questions = exam.questionIds
    .map((id) => getQuestion(id))
    .filter(Boolean)
    .map((q) => stripQuestionAnswers(q!));

  return NextResponse.json({
    id: exam.id,
    name: exam.name,
    description: exam.description,
    timeLimit: exam.timeLimit,
    passingScore: exam.passingScore,
    questions,
  });
}
