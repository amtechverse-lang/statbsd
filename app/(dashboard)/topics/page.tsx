import Link from "next/link";
import { getExamSections, countQuestionsByLesson } from "@/lib/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TopicsPage() {
  const sections = getExamSections();
  const counts = countQuestionsByLesson();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All Topics</h1>
        <p className="text-muted-foreground mt-1">
          Browse by exam section — learn with slides, then practice
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.examQuestions}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/section/${section.id}`}>View section</Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {section.subtopics.map((sub) => (
                <Card key={sub.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{sub.icon}</span> {sub.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{sub.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{counts[sub.id] ?? 0} Qs</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/learn/${sub.id}`}>Learn</Link>
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
