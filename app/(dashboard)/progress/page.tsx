"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { AchievementBadge } from "@/components/shared/AchievementBadge";
import type { ProgressSummary } from "@/lib/types";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading progress...</p>;

  const earnedKeys = new Set(data.achievements.map((a) => a.key));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Progress</h1>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularProgress value={data.overall} size={120} />
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
                <p className="text-2xl font-bold">{data.completedModules}/{data.totalModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Solved</p>
                <p className="text-2xl font-bold">{data.questionsSolved}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{data.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{data.streak} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.modules.map((mod) => (
            <div key={mod.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{mod.title}</span>
                <span className="font-medium">{mod.progress}%</span>
              </div>
              <Progress value={mod.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(data.allAchievements ?? []).map((def) => (
              <AchievementBadge
                key={def.key}
                achievement={
                  earnedKeys.has(def.key)
                    ? data.achievements.find((a) => a.key === def.key) ?? def
                    : def
                }
                locked={!earnedKeys.has(def.key)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
