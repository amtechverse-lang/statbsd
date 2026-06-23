"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { ModuleData } from "@/lib/types";

export default function ModulePage({ params }: { params: { moduleId: string } }) {
  const guest = useGuestProgress();
  const [courseModule, setCourseModule] = useState<ModuleData & { _count?: { lessons: number; questions: number } } | null>(null);
  const [difficultyCounts, setDifficultyCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((mods: (ModuleData & { _count: { lessons: number; questions: number } })[]) => {
        const mod = mods.find((m) => m.id === params.moduleId);
        setCourseModule(mod ?? null);
      });
    fetch(`/api/questions?moduleId=${params.moduleId}`)
      .then((r) => r.json())
      .then((qs: { difficulty: string }[]) => {
        const counts: Record<string, number> = {};
        qs.forEach((q) => {
          counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
        });
        setDifficultyCounts(counts);
      });
  }, [params.moduleId]);

  if (!courseModule) return <p>Loading module...</p>;

  const unlocked = guest.isModuleUnlockedById(courseModule.id);
  const progressPct = guest.getModuleProgressPct(courseModule.id);
  const quiz = guest.moduleQuiz[courseModule.id];
  const completedLessonIds = guest.lessonsCompleted.filter((id) => id.startsWith(`${courseModule.id}/`));
  const allLessonsDone = completedLessonIds.length >= courseModule.lessons.length;

  if (!unlocked) {
    return (
      <div className="text-center py-16">
        <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Module Locked</h1>
        <p className="text-muted-foreground mb-4">Complete the previous module to unlock this one.</p>
        <Button asChild>
          <Link href="/modules">Back to Modules</Link>
        </Button>
      </div>
    );
  }

  const questionCount = courseModule._count?.questions ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/modules" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Modules
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          Module {courseModule.order}: {courseModule.title}
        </h1>
        <p className="text-muted-foreground">{courseModule.description}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Module Progress</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons ({courseModule.lessons.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {courseModule.lessons.map((lesson) => {
            const lessonId = `${courseModule.id}/${lesson.slug}`;
            const done = guest.isLessonComplete(lessonId);
            return (
              <Link
                key={lesson.slug}
                href={`/modules/${courseModule.id}/lesson/${lesson.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                {done ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className={done ? "text-muted-foreground" : ""}>
                  {courseModule.order}.{lesson.order}: {lesson.title}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice ({questionCount} questions)</CardTitle>
          <CardDescription>
            {Object.entries(difficultyCounts).map(([d, c]) => (
              <Badge key={d} variant="outline" className="mr-2">
                {d}: {c}
              </Badge>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/modules/${courseModule.id}/practice`}>Start Practice</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/modules/${courseModule.id}/practice?mode=timed`}>Timed Mode</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Quiz</CardTitle>
          <CardDescription>10 questions, 80% to pass. Complete all lessons first.</CardDescription>
        </CardHeader>
        <CardContent>
          {quiz?.passed ? (
            <Badge className="bg-green-100 text-green-800">Quiz Passed ({Math.round(quiz.score)}%)</Badge>
          ) : allLessonsDone ? (
            <Button asChild>
              <Link href={`/modules/${courseModule.id}/practice?quiz=true`}>Start Quiz</Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete all {courseModule.lessons.length} lessons to unlock the quiz.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
