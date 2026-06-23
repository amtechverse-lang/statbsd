import { NextResponse } from "next/server";
import { getExamPracticeQuestions, getExamSections, getLessonIds } from "@/lib/content";

export async function GET() {
  const exam = getExamPracticeQuestions();
  return NextResponse.json({
    status: "ok",
    mode: "exam-prep",
    database: false,
    examSections: getExamSections().length,
    lessons: getLessonIds().length,
    examQuestions: exam.length,
  });
}
