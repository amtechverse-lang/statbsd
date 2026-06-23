"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RevisionTopic } from "@/lib/types";

export default function RevisePage() {
  const [topics, setTopics] = useState<(RevisionTopic & { questionCount: number })[]>([]);

  useEffect(() => {
    fetch("/api/revision").then((r) => r.json()).then(setTopics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quick Revision</h1>
        <p className="text-muted-foreground mt-1">
          Short notes only — jump to any topic, no order required. Then practice exam-style questions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">{t.icon}</span>
                {t.title}
              </CardTitle>
              <CardDescription>{t.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{t.questionCount} practice questions</Badge>
              <Button size="sm" asChild>
                <Link href={`/revise/${t.id}`}>Read notes</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/practice?topic=${t.id}`}>Practice</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
