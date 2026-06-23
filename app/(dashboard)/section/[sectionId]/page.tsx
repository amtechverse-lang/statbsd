import { notFound } from "next/navigation";
import Link from "next/link";
import { getExamSection, getLessonsForSection, countQuestionsByLesson } from "@/lib/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SectionPage({ params }: { params: { sectionId: string } }) {
  const section = getExamSection(params.sectionId);
  if (!section) notFound();

  const lessons = getLessonsForSection(section.id);
  const counts = countQuestionsByLesson();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold mt-2">{section.title}</h1>
        <p className="text-muted-foreground mt-1">{section.description}</p>
        <Badge variant="outline" className="mt-2">{section.examQuestions}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {section.subtopics.map((sub) => {
          const lesson = lessons.find((l) => l.id === sub.id);
          const slideCount = lesson?.slides.length ?? 0;
          const exampleCount = lesson?.workedExamples.length ?? 0;
          const questionCount = counts[sub.id] ?? 0;

          return (
            <Card key={sub.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{sub.icon}</span> {sub.title}
                </CardTitle>
                <CardDescription>{sub.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{slideCount} slides</Badge>
                  <Badge variant="secondary">{exampleCount} examples</Badge>
                  <Badge variant="secondary">{questionCount} questions</Badge>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/learn/${sub.id}`}>Start learning</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
