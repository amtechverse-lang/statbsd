import { prisma } from "@/lib/db/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants/achievements";

export function computeModuleProgress(
  lessonsCompleted: number,
  totalLessons: number,
  questionsSolved: number,
  totalQuestions: number,
  quizPassed: boolean
): number {
  const lessonPct = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 40 : 0;
  const practicePct = totalQuestions > 0 ? (questionsSolved / totalQuestions) * 40 : 0;
  const quizPct = quizPassed ? 20 : 0;
  return Math.min(100, Math.round(lessonPct + practicePct + quizPct));
}

export async function isModuleUnlocked(userId: string, moduleOrder: number): Promise<boolean> {
  if (moduleOrder === 0) return true;

  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });
  const prevModule = modules.find((m) => m.order === moduleOrder - 1);
  if (!prevModule) return true;

  const progress = await prisma.userProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: prevModule.id } },
  });

  if (!progress) return false;
  return progress.quizPassed && progress.lessonsCompleted >= progress.totalLessons;
}

export async function ensureUserProgress(userId: string) {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  for (const mod of modules) {
    const unlocked = mod.order === 0;
    await prisma.userProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: mod.id } },
      create: {
        userId,
        moduleId: mod.id,
        totalLessons: mod._count.lessons,
        unlocked,
      },
      update: { totalLessons: mod._count.lessons },
    });
  }

  await refreshUnlockStatus(userId);
}

export async function refreshUnlockStatus(userId: string) {
  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });
  for (const mod of modules) {
    const unlocked = await isModuleUnlocked(userId, mod.order);
    await prisma.userProgress.updateMany({
      where: { userId, moduleId: mod.id },
      data: { unlocked },
    });
  }
}

export async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.userStreak.upsert({
    where: { userId },
    create: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    update: {},
  });

  const last = new Date(streak.lastActiveDate);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return streak;
  if (diffDays === 1) {
    const newStreak = streak.currentStreak + 1;
    return prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActiveDate: today,
      },
    });
  }
  return prisma.userStreak.update({
    where: { userId },
    data: { currentStreak: 1, lastActiveDate: today },
  });
}

export async function checkAchievements(userId: string) {
  const [progress, attempts, streak, existing] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.questionAttempt.count({ where: { userId } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId } }),
  ]);

  const earned = new Set(existing.map((a) => a.key));
  const toAward: typeof ACHIEVEMENT_DEFINITIONS[number][] = [];

  const lessonsDone = await prisma.lessonCompletion.count({ where: { userId } });
  if (lessonsDone >= 1 && !earned.has("first_lesson")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "first_lesson")!);
  }

  const modulesPassed = progress.filter((p) => p.quizPassed).length;
  if (modulesPassed >= 1 && !earned.has("first_module")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "first_module")!);
  }

  if (attempts >= 50 && !earned.has("questions_50")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "questions_50")!);
  }
  if (attempts >= 100 && !earned.has("questions_100")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "questions_100")!);
  }
  if (attempts >= 250 && !earned.has("questions_250")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "questions_250")!);
  }

  if (streak && streak.currentStreak >= 3 && !earned.has("streak_3")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "streak_3")!);
  }
  if (streak && streak.currentStreak >= 7 && !earned.has("streak_7")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "streak_7")!);
  }

  const binomial = progress.find((p) => p.moduleId === "binomial-distribution");
  if (binomial?.quizPassed && !earned.has("binomial_master")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "binomial_master")!);
  }

  const normal = progress.find((p) => p.moduleId === "normal-distribution");
  if (normal?.quizPassed && !earned.has("normal_master")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "normal_master")!);
  }

  const examPass = await prisma.examAttempt.findFirst({
    where: { userId, score: { gte: 70 } },
  });
  if (examPass && !earned.has("exam_pass")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "exam_pass")!);
  }

  if (modulesPassed >= 12 && !earned.has("all_modules")) {
    toAward.push(ACHIEVEMENT_DEFINITIONS.find((a) => a.key === "all_modules")!);
  }

  for (const def of toAward) {
    await prisma.achievement.create({
      data: {
        userId,
        key: def.key,
        name: def.name,
        description: def.description,
        icon: def.icon,
      },
    });
  }
}

export async function getRecommendations(userId: string): Promise<string[]> {
  const progress = await prisma.userProgress.findMany({
    where: { userId, unlocked: true },
    include: { module: true },
    orderBy: { module: { order: "asc" } },
  });

  const recs: string[] = [];
  const lowAccuracy = [...progress]
    .filter((p) => p.questionsSolved >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)[0];
  if (lowAccuracy) {
    recs.push(`Review: ${lowAccuracy.module.title} (${Math.round(lowAccuracy.accuracy)}% accuracy)`);
  }

  const inProgress = progress.find(
    (p) => p.lessonsCompleted < p.totalLessons || !p.quizPassed
  );
  if (inProgress) {
    recs.push(`Continue: ${inProgress.module.title}`);
  }

  const nextLocked = await prisma.userProgress.findFirst({
    where: { userId, unlocked: false },
    include: { module: true },
    orderBy: { module: { order: "asc" } },
  });
  if (nextLocked) {
    recs.push(`Next unlock: ${nextLocked.module.title}`);
  }

  return recs.slice(0, 3);
}
