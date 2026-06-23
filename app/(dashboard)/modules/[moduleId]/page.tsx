import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/session";
import { computeModuleProgress, ensureUserProgress } from "@/lib/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: { moduleId: string } }) {
  const courseModule = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });

  if (!courseModule) notFound();

  const user = await getCurrentUser();
  let progress = null;
  let completedLessonIds: string[] = [];
  let unlocked = courseModule.order === 0;

  if (user?.id) {
    await ensureUserProgress(user.id);
    progress = await prisma.userProgress.findUnique({
      where: { userId_moduleId: { userId: user.id, moduleId: courseModule.id } },
    });
    unlocked = progress?.unlocked ?? courseModule.order === 0;
    const completions = await prisma.lessonCompletion.findMany({
      where: { userId: user.id, lessonId: { in: courseModule.lessons.map((l) => l.id) } },
    });
    completedLessonIds = completions.map((c) => c.lessonId);
  }

  const difficultyCounts = await prisma.question.groupBy({
    by: ["difficulty"],
    where: { moduleId: courseModule.id },
    _count: true,
  });

  const progressPct = progress
    ? computeModuleProgress(
        progress.lessonsCompleted,
        courseModule.lessons.length,
        progress.questionsSolved,
        courseModule._count.questions,
        progress.quizPassed
      )
    : 0;

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
            const done = completedLessonIds.includes(lesson.id);
            return (
              <Link
                key={lesson.id}
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
          <CardTitle>Practice ({courseModule._count.questions} questions)</CardTitle>
          <CardDescription>
            {difficultyCounts.map((d) => (
              <Badge key={d.difficulty} variant="outline" className="mr-2">
                {d.difficulty}: {d._count}
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

      {(courseModule.id.includes("binomial") ||
        courseModule.id.includes("poisson") ||
        courseModule.id.includes("normal") ||
        courseModule.id.includes("hypergeometric") ||
        courseModule.id.includes("geometric")) && (
        <Card>
          <CardHeader>
            <CardTitle>Interactive Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/tools/explorer">Distribution Explorer</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/calculator">Probability Calculator</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Module Quiz</CardTitle>
          <CardDescription>10 questions, 80% to pass. Complete all lessons first.</CardDescription>
        </CardHeader>
        <CardContent>
          {progress?.quizPassed ? (
            <Badge className="bg-green-100 text-green-800">Quiz Passed ({Math.round(progress.quizScore)}%)</Badge>
          ) : completedLessonIds.length >= courseModule.lessons.length ? (
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
