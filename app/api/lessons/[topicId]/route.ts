import { NextResponse } from "next/server";
import { countQuestionsByLesson, getLesson } from "@/lib/content";

export async function GET(
  _request: Request,
  { params }: { params: { topicId: string } }
) {
  const lesson = getLesson(params.topicId);
  if (!lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const counts = countQuestionsByLesson();
  return NextResponse.json({
    ...lesson,
    slideCount: lesson.slides.length,
    exampleCount: lesson.workedExamples.length,
    questionCount: counts[lesson.id] ?? 0,
  });
}
