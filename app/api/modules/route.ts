import { NextResponse } from "next/server";
import { getModules, getQuestionCountByModule } from "@/lib/content";

export async function GET() {
  const modules = getModules();
  const questionCounts = getQuestionCountByModule();

  return NextResponse.json(
    modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order: m.order,
      prerequisites: m.prerequisites,
      lessons: m.lessons.map((l) => ({
        id: `${m.id}/${l.slug}`,
        slug: l.slug,
        title: l.title,
        order: l.order,
      })),
      _count: {
        lessons: m.lessons.length,
        questions: questionCounts[m.id] ?? 0,
      },
    }))
  );
}
