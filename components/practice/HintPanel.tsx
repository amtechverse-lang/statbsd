"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function HintPanel({ hints, revealed }: { hints: string[]; revealed: number }) {
  if (revealed === 0) return null;
  const visibleHints = hints.slice(0, revealed);
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
          <Lightbulb className="h-4 w-4" />
          <span className="font-semibold text-sm">Hint {revealed} of {hints.length}</span>
        </div>
        <ul className="space-y-1">
          {visibleHints.map((hint, i) => (
            <li key={i} className="text-sm">{hint}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
