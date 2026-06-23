"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/shared/MathRenderer";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { WorkedExample } from "@/lib/types";

interface WorkedExampleViewerProps {
  topicId: string;
  examples: WorkedExample[];
  onComplete?: () => void;
}

export function WorkedExampleViewer({ topicId, examples, onComplete }: WorkedExampleViewerProps) {
  const guest = useGuestProgress();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const example = examples[exampleIndex];
  if (!example) return null;

  const allRevealed = revealedSteps >= example.steps.length;
  const isLastExample = exampleIndex === examples.length - 1;

  const revealNext = () => {
    if (revealedSteps < example.steps.length) {
      setRevealedSteps((n) => n + 1);
    } else if (!isLastExample) {
      setExampleIndex((i) => i + 1);
      setRevealedSteps(0);
    } else {
      guest.completeLesson(`examples:${topicId}`);
      onComplete?.();
    }
  };

  const visibleSteps = example.steps.slice(0, revealedSteps);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Example {exampleIndex + 1} of {examples.length}</span>
        {example.source && <Badge variant="outline">{example.source}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problem</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer content={example.problem} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {visibleSteps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
                    {step.step}
                  </Badge>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <MathRenderer content={step.content} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {allRevealed && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="pt-4">
            <p className="font-semibold">
              Final Answer: <MathRenderer content={example.finalAnswer} className="inline prose-sm" />
            </p>
          </CardContent>
        </Card>
      )}

      <Button onClick={revealNext} size="lg">
        {!allRevealed
          ? "Show next step"
          : isLastExample
            ? "Finish examples → Practice"
            : "Next example"}
      </Button>
    </div>
  );
}
