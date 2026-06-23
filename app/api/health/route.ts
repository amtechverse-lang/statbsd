import { NextResponse } from "next/server";
import { getExamPracticeQuestions, getRevisionTopics } from "@/lib/content";

export async function GET() {
  const exam = getExamPracticeQuestions();
  return NextResponse.json({
    status: "ok",
    mode: "exam-prep",
    database: false,
    revisionTopics: getRevisionTopics().length,
    examQuestions: exam.length,
  });
}
