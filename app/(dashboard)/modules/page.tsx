"use client";

import { useContentMeta } from "@/lib/hooks/use-content-meta";
import { ModuleCard } from "@/components/modules/ModuleCard";

export default function ModulesIndexPage() {
  const { progress } = useContentMeta();
  const modules = progress?.modules ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground">13 structured modules from foundations to exam prep</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            id={mod.id}
            title={mod.title}
            description={mod.description ?? ""}
            progress={mod.progress}
            isLocked={!mod.unlocked}
            lessonsCount={mod.lessonsCount ?? 0}
            practiceCount={mod.practiceCount ?? 0}
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
