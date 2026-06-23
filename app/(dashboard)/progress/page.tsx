"use client";

import { useContentMeta } from "@/lib/hooks/use-content-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { AchievementBadge } from "@/components/shared/AchievementBadge";
import { Button } from "@/components/ui/button";
import { useGuestProgress } from "@/lib/store/guest-progress";

export default function ProgressPage() {
  const { progress } = useContentMeta();
  const guest = useGuestProgress();

  if (!progress) return <p>Loading progress...</p>;

  const earnedKeys = new Set(guest.achievements);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <Button variant="outline" size="sm" onClick={() => guest.resetProgress()}>
          Reset progress
        </Button>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Saved locally in your browser. Clearing site data will reset progress.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularProgress value={progress.overall} size={120} />
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
                <p className="text-2xl font-bold">{progress.completedModules}/{progress.totalModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Solved</p>
                <p className="text-2xl font-bold">{progress.questionsSolved}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{progress.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{progress.streak} days</p>
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
          {progress.modules.map((mod) => (
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
            {(progress.allAchievements ?? []).map((def) => (
              <AchievementBadge
                key={def.key}
                achievement={def}
                locked={!earnedKeys.has(def.key)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
