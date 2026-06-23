import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants/achievements";
import type { ModuleData, ProgressSummary, QuestionData } from "@/lib/types";
import type { GuestProgressData } from "./guest-types";

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

export function isModuleUnlocked(
  modules: { id: string; order: number; lessons: { slug: string }[] }[],
  progress: GuestProgressData,
  moduleOrder: number
): boolean {
  if (moduleOrder === 0) return true;
  const prevModule = modules.find((m) => m.order === moduleOrder - 1);
  if (!prevModule) return true;
  const quiz = progress.moduleQuiz[prevModule.id];
  const lessonsDone = prevModule.lessons.filter((l) =>
    progress.lessonsCompleted.includes(`${prevModule.id}/${l.slug}`)
  ).length;
  return Boolean(quiz?.passed) && lessonsDone >= prevModule.lessons.length;
}

export function buildProgressSummary(
  modules: ModuleData[],
  questions: QuestionData[],
  progress: GuestProgressData
): ProgressSummary {
  const questionCounts: Record<string, number> = {};
  for (const q of questions) {
    questionCounts[q.moduleId] = (questionCounts[q.moduleId] ?? 0) + 1;
  }

  const attempts = progress.questionAttempts;
  const correctAttempts = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length > 0 ? Math.round((correctAttempts / attempts.length) * 100) : 0;

  const moduleProgress = modules.map((mod) => {
    const lessonsDone = mod.lessons.filter((l) =>
      progress.lessonsCompleted.includes(`${mod.id}/${l.slug}`)
    ).length;
    const solvedIds = new Set(
      attempts.filter((a) => {
        const q = questions.find((qq) => qq.id === a.questionId);
        return q?.moduleId === mod.id;
      }).map((a) => a.questionId)
    );
    const quiz = progress.moduleQuiz[mod.id];
    const pct = computeModuleProgress(
      lessonsDone,
      mod.lessons.length,
      solvedIds.size,
      questionCounts[mod.id] ?? 0,
      Boolean(quiz?.passed)
    );
    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      progress: pct,
      unlocked: isModuleUnlocked(modules, progress, mod.order),
      order: mod.order,
      lessonsCount: mod.lessons.length,
      practiceCount: questionCounts[mod.id] ?? 0,
    };
  });

  const overall =
    moduleProgress.length > 0
      ? Math.round(moduleProgress.reduce((s, m) => s + m.progress, 0) / moduleProgress.length)
      : 0;

  const recommendations: string[] = [];
  const lowModule = [...moduleProgress]
    .filter((m) => m.unlocked && m.progress > 0 && m.progress < 100)
    .sort((a, b) => a.progress - b.progress)[0];
  if (lowModule) recommendations.push(`Continue: ${lowModule.title}`);
  const nextLocked = moduleProgress.find((m) => !m.unlocked);
  if (nextLocked) recommendations.push(`Next unlock: ${nextLocked.title}`);
  const importantCount = questions.filter((q) => q.tags.includes("important")).length;
  if (importantCount > 0) {
    recommendations.push(`Review ${importantCount} important exam-style questions in Exam Prep`);
  }

  return {
    overall,
    completedModules: Object.values(progress.moduleQuiz).filter((q) => q.passed).length,
    totalModules: modules.length,
    questionsSolved: attempts.length,
    questionsCorrect: correctAttempts,
    accuracy,
    streak: progress.streak.current,
    modules: moduleProgress,
    achievements: progress.achievements.map((key) => {
      const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!;
      return {
        id: key,
        key,
        name: def.name,
        description: def.description,
        icon: def.icon,
        earnedAt: new Date().toISOString(),
      };
    }),
    allAchievements: [...ACHIEVEMENT_DEFINITIONS],
    recommendations: recommendations.slice(0, 3),
  };
}
