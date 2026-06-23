"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { RevisionTopic } from "@/lib/types";

export default function ProgressPage() {
  const guest = useGuestProgress();
  const [topics, setTopics] = useState<(RevisionTopic & { questionCount: number })[]>([]);

  useEffect(() => {
    fetch("/api/revision").then((r) => r.json()).then(setTopics);
  }, []);

  const attempts = guest.questionAttempts;
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;

  const byTopic = topics.map((t) => ({
    ...t,
    done: 0,
    total: t.questionCount,
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-sm text-muted-foreground">Saved in this browser only</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => guest.resetProgress()}>
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Attempted</CardTitle>
            <p className="text-3xl font-bold">{attempts.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Correct</CardTitle>
            <p className="text-3xl font-bold">{correct}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Accuracy</CardTitle>
            <p className="text-3xl font-bold">{accuracy}%</p>
          </CardHeader>
        </Card>
      </div>

      {guest.examAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mock exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {guest.examAttempts.map((e, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{e.examId}</span>
                <span className={e.passed ? "text-green-600" : "text-muted-foreground"}>
                  {Math.round(e.score)}% {e.passed ? "✓" : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Practice by topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {byTopic.map((t) => (
            <div key={t.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Link href={`/practice?topic=${t.id}`} className="hover:text-primary">
                  {t.icon} {t.title}
                </Link>
                <span>{t.questionCount} questions</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
