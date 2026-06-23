import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { LessonViewer } from "@/components/modules/LessonViewer";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { moduleId: string; lessonId: string };
}) {
  const lesson = await prisma.lesson.findFirst({
    where: { moduleId: params.moduleId, slug: params.lessonId },
    include: { module: true },
  });

  if (!lesson) notFound();

  const allLessons = await prisma.lesson.findMany({
    where: { moduleId: params.moduleId },
    orderBy: { order: "asc" },
    select: { slug: true, title: true, order: true },
  });

  const currentIdx = allLessons.findIndex((l) => l.slug === params.lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <LessonViewer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        moduleId: lesson.moduleId,
        moduleTitle: lesson.module.title,
        moduleOrder: lesson.module.order,
        order: lesson.order,
      }}
      prev={prev}
      next={next}
    />
  );
}
