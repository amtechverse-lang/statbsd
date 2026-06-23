"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamPracticeEngine } from "@/components/practice/ExamPracticeEngine";
import type { RevisionTopic } from "@/lib/types";

function PracticeContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const [topics, setTopics] = useState<(RevisionTopic & { questionCount: number })[]>([]);

  useEffect(() => {
    fetch("/api/revision").then((r) => r.json()).then(setTopics);
  }, []);

  const fetchUrl = topic
    ? `/api/questions?examOnly=true&revisionTopic=${topic}`
    : "/api/questions?examOnly=true";

  const activeTopic = topics.find((t) => t.id === topic);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam Practice</h1>
        <p className="text-muted-foreground mt-1">
          Real exam-style problems with step-by-step solutions — skip any topic you already know
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={!topic ? "default" : "outline"} size="sm" asChild>
          <Link href="/practice">All topics</Link>
        </Button>
        {topics.map((t) => (
          <Button key={t.id} variant={topic === t.id ? "default" : "outline"} size="sm" asChild>
            <Link href={`/practice?topic=${t.id}`}>
              {t.icon} {t.title} ({t.questionCount})
            </Link>
          </Button>
        ))}
      </div>

      {topic && activeTopic && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Need a quick recap?{" "}
              <Link href={`/revise/${topic}`} className="text-primary hover:underline">
                Read {activeTopic.title} revision notes →
              </Link>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <ExamPracticeEngine
        fetchUrl={fetchUrl}
        title={activeTopic ? `${activeTopic.icon} ${activeTopic.title} Practice` : undefined}
        description={activeTopic?.summary}
      />

      {!topic && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{t.icon}</span> {t.title}
                  <Badge variant="outline">{t.questionCount} Qs</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/practice?topic=${t.id}`}>Practice</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/revise/${t.id}`}>Revise</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PracticeContent />
    </Suspense>
  );
}
