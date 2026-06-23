import { notFound } from "next/navigation";
import Link from "next/link";
import { getRevisionTopic } from "@/lib/content";
import { MathRenderer } from "@/components/shared/MathRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RevisionTopicPage({ params }: { params: { topicId: string } }) {
  const topic = getRevisionTopic(params.topicId);
  if (!topic) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/revise" className="text-sm text-muted-foreground hover:text-foreground">
          ← All topics
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {topic.icon} {topic.title}
        </h1>
        <p className="text-muted-foreground">{topic.summary}</p>
      </div>

      <Card>
        <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
          <MathRenderer content={topic.content} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={`/practice?topic=${topic.id}`}>Practice {topic.title} questions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/exam-prep">Take mock exam</Link>
        </Button>
      </div>
    </div>
  );
}
