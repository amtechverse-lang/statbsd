"use client";

import { useEffect, useState } from "react";
import { ModuleCard } from "@/components/modules/ModuleCard";

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  order: number;
  unlocked: boolean;
  _count: { lessons: number; questions: number };
}

export default function ModulesIndexPage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([fetch("/api/modules").then((r) => r.json()), fetch("/api/progress").then((r) => r.json())]).then(
      ([mods, prog]) => {
        setModules(mods);
        const pmap: Record<string, number> = {};
        prog.modules?.forEach((m: { id: string; progress: number }) => {
          pmap[m.id] = m.progress;
        });
        setProgress(pmap);
      }
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground">12 structured modules from foundations to exam prep</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            id={mod.id}
            title={mod.title}
            description={mod.description}
            progress={progress[mod.id] ?? 0}
            isLocked={!mod.unlocked}
            lessonsCount={mod._count.lessons}
            practiceCount={mod._count.questions}
            order={mod.order}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Complete each module&apos;s lessons and quiz to unlock the next module.
      </p>
    </div>
  );
}
