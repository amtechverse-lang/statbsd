"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGuestProgress } from "@/lib/store/guest-progress";
import { useEffect, useState } from "react";

interface SectionData {
  id: string;
  title: string;
  description: string;
  examQuestions: string;
  subtopics: {
    id: string;
    title: string;
    icon: string;
    description: string;
    slideCount: number;
    questionCount: number;
  }[];
}

export default function HomePage() {
  const guest = useGuestProgress();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [totalQs, setTotalQs] = useState(0);

  useEffect(() => {
    fetch("/api/sections").then((r) => r.json()).then(setSections);
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
          Learn with interactive slides, work through examples, then practice exam-style questions
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

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Pick an exam section</h2>
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <Badge variant="outline">{section.examQuestions}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                {section.subtopics.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/learn/${sub.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-2xl">{sub.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.slideCount} slides · {sub.questionCount} questions
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Button asChild variant="outline">
                <Link href={`/section/${section.id}`}>View all sub-topics →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Ready for the full paper?</CardTitle>
          <CardDescription>Timed mock exam with questions from all sections</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/exam-prep">Mock exam (timed)</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/topics">Browse all topics</Link>
          </Button>
        </CardContent>
      </Card>

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
