"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants/achievements";
import { computeModuleProgress, isModuleUnlocked } from "@/lib/progress/compute";
import type { GuestProgressData, QuestionAttemptRecord } from "@/lib/progress/guest-types";
import { EMPTY_GUEST_PROGRESS } from "@/lib/progress/guest-types";

export interface ModuleMeta {
  id: string;
  order: number;
  lessons: { slug: string }[];
  lessonCount: number;
  questionCount: number;
}

interface GuestProgressStore extends GuestProgressData {
  modulesMeta: ModuleMeta[];
  questionModuleMap: Record<string, string>;
  setContentMeta: (modules: ModuleMeta[], questionModuleMap: Record<string, string>) => void;
  completeLesson: (lessonId: string) => void;
  recordAttempt: (attempt: Omit<QuestionAttemptRecord, "attemptedAt">) => void;
  recordQuiz: (moduleId: string, score: number, passed: boolean) => void;
  recordExam: (examId: string, score: number, passed: boolean) => void;
  isLessonComplete: (lessonId: string) => boolean;
  isModuleUnlockedById: (moduleId: string) => boolean;
  getModuleProgressPct: (moduleId: string) => number;
  getSolvedCountForModule: (moduleId: string) => number;
  resetProgress: () => void;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(streak: GuestProgressData["streak"]): GuestProgressData["streak"] {
  const today = todayKey();
  if (!streak.lastActive) return { current: 1, longest: 1, lastActive: today };
  if (streak.lastActive === today) return streak;
  const last = new Date(streak.lastActive);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    const current = streak.current + 1;
    return { current, longest: Math.max(current, streak.longest), lastActive: today };
  }
  return { current: 1, longest: streak.longest, lastActive: today };
}

function checkAchievements(state: GuestProgressStore): string[] {
  const earned = new Set(state.achievements);
  const award = (key: string) => earned.add(key);

  if (state.lessonsCompleted.length >= 1) award("first_lesson");
  if (Object.values(state.moduleQuiz).some((q) => q.passed)) award("first_module");
  if (state.questionAttempts.length >= 50) award("questions_50");
  if (state.questionAttempts.length >= 100) award("questions_100");
  if (state.questionAttempts.length >= 250) award("questions_250");
  if (state.streak.current >= 3) award("streak_3");
  if (state.streak.current >= 7) award("streak_7");
  if (state.moduleQuiz["binomial-distribution"]?.passed) award("binomial_master");
  if (state.moduleQuiz["normal-distribution"]?.passed) award("normal_master");
  if (state.examAttempts.some((e) => e.passed)) award("exam_pass");
  if (Object.values(state.moduleQuiz).filter((q) => q.passed).length >= 12) award("all_modules");

  return Array.from(earned);
}

export const useGuestProgress = create<GuestProgressStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_GUEST_PROGRESS,
      modulesMeta: [],
      questionModuleMap: {},
      setContentMeta: (modules, questionModuleMap) => set({ modulesMeta: modules, questionModuleMap }),
      completeLesson: (lessonId) =>
        set((state) => {
          if (state.lessonsCompleted.includes(lessonId)) return state;
          const next = {
            ...state,
            lessonsCompleted: [...state.lessonsCompleted, lessonId],
            streak: updateStreak(state.streak),
          };
          return { ...next, achievements: checkAchievements({ ...get(), ...next }) };
        }),
      recordAttempt: (attempt) =>
        set((state) => {
          const next = {
            ...state,
            questionAttempts: [
              ...state.questionAttempts,
              { ...attempt, attemptedAt: new Date().toISOString() },
            ],
            streak: updateStreak(state.streak),
          };
          return { ...next, achievements: checkAchievements({ ...get(), ...next }) };
        }),
      recordQuiz: (moduleId, score, passed) =>
        set((state) => {
          const next = {
            ...state,
            moduleQuiz: { ...state.moduleQuiz, [moduleId]: { score, passed } },
            streak: updateStreak(state.streak),
          };
          return { ...next, achievements: checkAchievements({ ...get(), ...next }) };
        }),
      recordExam: (examId, score, passed) =>
        set((state) => {
          const next = {
            ...state,
            examAttempts: [
              ...state.examAttempts,
              { examId, score, passed, date: new Date().toISOString() },
            ],
            streak: updateStreak(state.streak),
          };
          return { ...next, achievements: checkAchievements({ ...get(), ...next }) };
        }),
      isLessonComplete: (lessonId) => get().lessonsCompleted.includes(lessonId),
      isModuleUnlockedById: (moduleId) => {
        const mod = get().modulesMeta.find((m) => m.id === moduleId);
        if (!mod) return mod === undefined && moduleId === "foundations";
        return isModuleUnlocked(
          get().modulesMeta.map((m) => ({ id: m.id, order: m.order, lessons: m.lessons })),
          get(),
          mod.order
        );
      },
      getSolvedCountForModule: (moduleId) => {
        const ids = new Set(
          get()
            .questionAttempts.filter((a) => get().questionModuleMap[a.questionId] === moduleId)
            .map((a) => a.questionId)
        );
        return ids.size;
      },
      getModuleProgressPct: (moduleId) => {
        const mod = get().modulesMeta.find((m) => m.id === moduleId);
        if (!mod) return 0;
        const lessonsDone = mod.lessons.filter((l) =>
          get().lessonsCompleted.includes(`${moduleId}/${l.slug}`)
        ).length;
        const quiz = get().moduleQuiz[moduleId];
        return computeModuleProgress(
          lessonsDone,
          mod.lessonCount,
          get().getSolvedCountForModule(moduleId),
          mod.questionCount,
          Boolean(quiz?.passed)
        );
      },
      resetProgress: () =>
        set({
          ...EMPTY_GUEST_PROGRESS,
          modulesMeta: get().modulesMeta,
          questionModuleMap: get().questionModuleMap,
        }),
    }),
    { name: "statmaster-guest-progress" }
  )
);

export { ACHIEVEMENT_DEFINITIONS };
