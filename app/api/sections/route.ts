import { NextResponse } from "next/server";
import { countQuestionsByLesson, getExamSections, getLesson } from "@/lib/content";

export async function GET() {
  const sections = getExamSections();
  const counts = countQuestionsByLesson();

  return NextResponse.json(
    sections.map((section) => ({
      ...section,
      subtopics: section.subtopics.map((sub) => {
        const lesson = getLesson(sub.id);
        return {
          ...sub,
          slideCount: lesson?.slides.length ?? 0,
          exampleCount: lesson?.workedExamples.length ?? 0,
          questionCount: counts[sub.id] ?? 0,
        };
      }),
    }))
  );
}
