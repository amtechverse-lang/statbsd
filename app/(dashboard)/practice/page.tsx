"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionSummary {
  id: string;
  moduleId: string;
  topic: string;
  difficulty: string;
  type: string;
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then(setQuestions);
  }, []);

  const byModule = questions.reduce<Record<string, QuestionSummary[]>>((acc, q) => {
    if (!acc[q.moduleId]) acc[q.moduleId] = [];
    acc[q.moduleId].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Practice Question Bank</h1>
      <p className="text-muted-foreground">{questions.length} questions across all modules</p>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(byModule).map(([moduleId, qs]) => (
          <Card key={moduleId}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{moduleId.replace(/-/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{qs.length} questions</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {["Easy", "Medium", "Hard"].map((d) => {
                  const count = qs.filter((q) => q.difficulty === d).length;
                  return count > 0 ? (
                    <Badge key={d} variant="outline">{d}: {count}</Badge>
                  ) : null;
                })}
              </div>
              <Link href={`/modules/${moduleId}/practice`} className="text-primary text-sm hover:underline">
                Start Practice →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
