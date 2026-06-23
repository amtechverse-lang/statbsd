"use client";

import { MathRenderer } from "@/components/shared/MathRenderer";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  question: string;
  difficulty: string;
  type: string;
  topic: string;
}

export function QuestionDisplay({
  question,
  index,
  total,
}: {
  question: Question;
  index: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <Badge variant="outline">{question.difficulty}</Badge>
      </div>
      <div className="text-lg">
        <MathRenderer content={question.question} />
      </div>
    </div>
  );
}
