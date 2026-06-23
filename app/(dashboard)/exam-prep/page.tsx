"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Exam {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questionIds: string[];
}

export default function ExamPrepPage() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then(setExams);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam Preparation</h1>
        <p className="text-muted-foreground">Timed mock exams using real exam-style problems</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <CardTitle>{exam.name}</CardTitle>
              <CardDescription>{exam.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="outline">{exam.questionIds.length} questions</Badge>
                <Badge variant="outline">{exam.timeLimit} min</Badge>
                <Badge variant="outline">{exam.passingScore}% to pass</Badge>
              </div>
              <Button asChild className="w-full">
                <Link href={`/exam-prep/${exam.id}`}>Start Exam</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Review</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/tools/formulas">Formula Sheet</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/z-table">Z-Table Visualizer</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/practice">Practice by topic</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/revise">Quick revision</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
