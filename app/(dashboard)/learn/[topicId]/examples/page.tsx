import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getExamSection } from "@/lib/content";
import { TopicPath } from "@/components/learn/TopicPath";
import { LearnExamplesClient } from "@/components/learn/LearnExamplesClient";

export default function LearnExamplesPage({ params }: { params: { topicId: string } }) {
  const lesson = getLesson(params.topicId);
  if (!lesson) notFound();

  const section = getExamSection(lesson.sectionId);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/learn/${lesson.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to slides
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {lesson.icon} {lesson.title} — Worked Examples
        </h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step solutions from {section?.title ?? "your exam syllabus"}
        </p>
      </div>

      <TopicPath topicId={lesson.id} current="examples" />

      <LearnExamplesClient topicId={lesson.id} examples={lesson.workedExamples} />
    </div>
  );
}
