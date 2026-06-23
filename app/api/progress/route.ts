import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  computeModuleProgress,
  ensureUserProgress,
  getRecommendations,
  checkAchievements,
} from "@/lib/progress";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants/achievements";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserProgress(session.user.id);

  const userId = session.user.id;
  const [modules, progress, attempts, streak, achievements, recommendations] = await Promise.all([
    prisma.module.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { lessons: true, questions: true } } },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: { module: true },
    }),
    prisma.questionAttempt.findMany({ where: { userId } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } }),
    getRecommendations(userId),
  ]);

  const progressMap = new Map(progress.map((p) => [p.moduleId, p]));
  const moduleProgress = modules.map((mod) => {
    const p = progressMap.get(mod.id);
    const totalQuestions = mod._count.questions;
    const pct = p
      ? computeModuleProgress(
          p.lessonsCompleted,
          p.totalLessons || mod._count.lessons,
          p.questionsSolved,
          totalQuestions,
          p.quizPassed
        )
      : 0;
    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      progress: pct,
      unlocked: p?.unlocked ?? mod.order === 0,
      order: mod.order,
      lessonsCount: mod._count.lessons,
      practiceCount: mod._count.questions,
    };
  });

  const overall =
    moduleProgress.length > 0
      ? Math.round(moduleProgress.reduce((s, m) => s + m.progress, 0) / moduleProgress.length)
      : 0;

  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;

  return NextResponse.json({
    overall,
    completedModules: progress.filter((p) => p.quizPassed).length,
    totalModules: modules.length,
    questionsSolved: attempts.length,
    questionsCorrect: correct,
    accuracy,
    streak: streak?.currentStreak ?? 0,
    modules: moduleProgress,
    achievements: achievements.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon,
      earnedAt: a.earnedAt.toISOString(),
    })),
    allAchievements: ACHIEVEMENT_DEFINITIONS,
    recommendations,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const userId = session.user.id;

  if (body.type === "lesson") {
    const { lessonId, moduleId } = body;
    await prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId },
      update: {},
    });

    const completed = await prisma.lessonCompletion.count({
      where: {
        userId,
        lessonId: { in: (await prisma.lesson.findMany({ where: { moduleId }, select: { id: true } })).map((l) => l.id) },
      },
    });

    const totalLessons = await prisma.lesson.count({ where: { moduleId } });
    await prisma.userProgress.update({
      where: { userId_moduleId: { userId, moduleId } },
      data: { lessonsCompleted: completed, totalLessons, lastActivity: new Date() },
    });

    await checkAchievements(userId);
    return NextResponse.json({ success: true, lessonsCompleted: completed });
  }

  if (body.type === "quiz") {
    const { moduleId, score, passed } = body;
    await prisma.userProgress.update({
      where: { userId_moduleId: { userId, moduleId } },
      data: { quizPassed: passed, quizScore: score, lastActivity: new Date() },
    });
    const { refreshUnlockStatus, checkAchievements: check } = await import("@/lib/progress");
    await refreshUnlockStatus(userId);
    await check(userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
