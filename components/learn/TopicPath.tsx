"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuestProgress } from "@/lib/store/guest-progress";

const STEPS = [
  { key: "learn", label: "Learn", suffix: "" },
  { key: "examples", label: "Examples", suffix: "/examples" },
  { key: "practice", label: "Practice", suffix: "/practice" },
] as const;

export function TopicPath({ topicId, current }: { topicId: string; current: "learn" | "examples" | "practice" }) {
  const guest = useGuestProgress();

  const isDone = (step: string) => {
    if (step === "learn") return guest.isLessonComplete(`learn:${topicId}`);
    if (step === "examples") return guest.isLessonComplete(`examples:${topicId}`);
    return false;
  };

  return (
    <nav className="flex items-center gap-2 flex-wrap" aria-label="Topic progress">
      {STEPS.map((step, i) => {
        const active = step.key === current;
        const done = isDone(step.key);
        const href = `/learn/${topicId}${step.suffix}`;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">→</span>}
            <Link
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {step.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
