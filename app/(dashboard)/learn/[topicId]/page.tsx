import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getExamSection } from "@/lib/content";
import { LearnSlidesClient } from "@/components/learn/LearnSlidesClient";
import { TopicPath } from "@/components/learn/TopicPath";

export default function LearnPage({ params }: { params: { topicId: string } }) {
  const lesson = getLesson(params.topicId);
  if (!lesson) notFound();

  const section = getExamSection(lesson.sectionId);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/section/${lesson.sectionId}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {section?.title ?? "Section"}
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {lesson.icon} {lesson.title}
        </h1>
        <p className="text-muted-foreground mt-1">{lesson.summary}</p>
      </div>

      <TopicPath topicId={lesson.id} current="learn" />

      <LearnSlidesClient topicId={lesson.id} slides={lesson.slides} />
    </div>
  );
}
