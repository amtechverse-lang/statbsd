import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getExamSection } from "@/lib/content";
import { TopicPath } from "@/components/learn/TopicPath";
import { ExamPracticeEngine } from "@/components/practice/ExamPracticeEngine";

export default function LearnPracticePage({ params }: { params: { topicId: string } }) {
  const lesson = getLesson(params.topicId);
  if (!lesson) notFound();

  const section = getExamSection(lesson.sectionId);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/learn/${lesson.id}/examples`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to examples
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {lesson.icon} {lesson.title} — Practice
        </h1>
        <p className="text-muted-foreground mt-1">
          Exam-style questions for {section?.examQuestions ?? "your paper"}
        </p>
      </div>

      <TopicPath topicId={lesson.id} current="practice" />

      <ExamPracticeEngine
        fetchUrl={`/api/questions?examOnly=true&lessonId=${lesson.id}`}
        title={`${lesson.icon} ${lesson.title} Practice`}
        description={lesson.summary}
      />
    </div>
  );
}
