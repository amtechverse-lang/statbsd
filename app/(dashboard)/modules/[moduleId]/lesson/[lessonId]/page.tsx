import { notFound } from "next/navigation";
import { getLesson, getModule } from "@/lib/content";
import { LessonViewer } from "@/components/modules/LessonViewer";

export default function LessonPage({
  params,
}: {
  params: { moduleId: string; lessonId: string };
}) {
  const lesson = getLesson(params.moduleId, params.lessonId);
  if (!lesson) notFound();

  const mod = getModule(params.moduleId)!;
  const allLessons = mod.lessons.map((l) => ({ slug: l.slug, title: l.title, order: l.order }));
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
        moduleTitle: lesson.moduleTitle,
        moduleOrder: lesson.moduleOrder,
        order: lesson.order,
      }}
      prev={prev}
      next={next}
    />
  );
}
