"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { AchievementBadge } from "@/components/shared/AchievementBadge";
import { CircularProgress } from "@/components/shared/CircularProgress";
import type { ProgressSummary } from "@/lib/types";

export default function HomePage() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load progress");
        return r.json();
      })
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  const inProgressModules = progress?.modules
    .filter((m) => m.unlocked && m.progress > 0 && m.progress < 100)
    .slice(0, 3) ?? [];

  const startModule = progress?.modules.find((m) => m.unlocked && m.progress === 0);

  const earnedKeys = new Set(progress?.achievements.map((a) => a.key) ?? []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Student"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your probability & statistics journey
        </p>
      </div>

      {!progress && session && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <p className="text-sm">
              Unable to load progress. On a fresh deploy, run database migrate and seed (see DEPLOYMENT.md).
            </p>
          </CardContent>
        </Card>
      )}

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <CircularProgress value={progress.overall} />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Modules Completed</span>
                  <span className="font-bold">{progress.completedModules}/{progress.totalModules}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions Solved</span>
                  <span className="font-bold">{progress.questionsSolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-bold">{progress.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-bold">{progress.streak} days</span>
                </div>
                <Progress value={progress.overall} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {inProgressModules.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {inProgressModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                id={mod.id}
                title={mod.title}
                description={mod.description ?? ""}
                progress={mod.progress}
                isLocked={false}
                lessonsCount={mod.lessonsCount ?? 0}
                practiceCount={mod.practiceCount ?? 0}
                order={mod.order}
              />
            ))}
          </div>
        </section>
      )}

      {inProgressModules.length === 0 && startModule && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Begin your learning journey with Module {startModule.order}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/modules/${startModule.id}`}>Start {startModule.title}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {progress && progress.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended</CardTitle>
            <CardDescription>Based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {progress.recommendations.map((rec, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="text-primary">•</span> {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {progress && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(progress.allAchievements ?? []).slice(0, 8).map((def) => (
              <AchievementBadge
                key={def.key}
                achievement={def}
                locked={!earnedKeys.has(def.key)}
              />
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Practice</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/practice">Start Practice</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools">Distribution Explorer</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/exam-prep">Mock Exam</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
