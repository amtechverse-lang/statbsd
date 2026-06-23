"use client";

import { useEffect, useMemo, useState } from "react";
import { buildProgressSummary } from "@/lib/progress/compute";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { ModuleData, ProgressSummary, QuestionData } from "@/lib/types";

export function useContentMeta() {
  const guest = useGuestProgress();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/modules").then((r) => r.json()), fetch("/api/questions").then((r) => r.json())]).then(
      ([mods, qs]) => {
        setModules(mods);
        setQuestions(qs);
        const questionModuleMap = Object.fromEntries(qs.map((q: QuestionData) => [q.id, q.moduleId]));
        useGuestProgress.getState().setContentMeta(
          mods.map((m: ModuleData & { _count: { lessons: number; questions: number } }) => ({
            id: m.id,
            order: m.order,
            lessons: m.lessons.map((l) => ({ slug: l.slug })),
            lessonCount: m._count?.lessons ?? m.lessons.length,
            questionCount: m._count?.questions ?? 0,
          })),
          questionModuleMap
        );
        setReady(true);
      }
    );
  }, []);

  const progress: ProgressSummary | null = useMemo(() => {
    if (!ready || !modules.length) return null;
    return buildProgressSummary(modules, questions, guest);
  }, [ready, modules, questions, guest]);

  return { modules, questions, progress, ready };
}
