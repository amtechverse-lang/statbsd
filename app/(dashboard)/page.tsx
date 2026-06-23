"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGuestProgress } from "@/lib/store/guest-progress";
import { useEffect, useState } from "react";
import type { RevisionTopic } from "@/lib/types";

export default function HomePage() {
  const guest = useGuestProgress();
  const [topics, setTopics] = useState<(RevisionTopic & { questionCount: number })[]>([]);
  const [totalQs, setTotalQs] = useState(0);

  useEffect(() => {
    fetch("/api/revision").then((r) => r.json()).then(setTopics);
    fetch("/api/questions?examOnly=true").then((r) => r.json()).then((q) => setTotalQs(q.length));
  }, []);

  const attempts = guest.questionAttempts;
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Exam Prep — Probability & Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Practice real exam questions, revise only what you need, skip anything you already know
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Questions attempted</CardDescription>
            <CardTitle className="text-3xl">{attempts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accuracy</CardDescription>
            <CardTitle className="text-3xl">{accuracy}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Exam-style bank</CardDescription>
            <CardTitle className="text-3xl">{totalQs}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Start here</CardTitle>
          <CardDescription>Most students go straight to practice</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/practice">Practice exam questions</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/exam-prep">Mock exam (timed)</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/revise">Quick revision notes</Link>
          </Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold mb-4">Pick a topic — no fixed order</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{t.icon}</span> {t.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">{t.summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/practice?topic=${t.id}`}>Practice</Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/revise/${t.id}`}>Revise</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Reference tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/tools/formulas">Formula sheet</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/z-table">Z-table</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/calculator">Calculator</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
