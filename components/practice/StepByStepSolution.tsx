"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/shared/MathRenderer";
import type { SolutionStep } from "@/lib/types";

interface StepByStepSolutionProps {
  steps: SolutionStep[];
  finalAnswer?: string;
  commonMistakes?: string[];
}

export function StepByStepSolution({ steps, finalAnswer, commonMistakes }: StepByStepSolutionProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
                  {step.step}
                </Badge>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-muted p-4 rounded-lg">
                <MathRenderer content={step.content} />
              </div>
              <p className="text-sm text-muted-foreground">{step.explanation}</p>
              {step.formula && (
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <MathRenderer content={step.formula} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {finalAnswer && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="pt-4">
            <p className="font-semibold">Final Answer: <MathRenderer content={finalAnswer} /></p>
          </CardContent>
        </Card>
      )}
      {commonMistakes && commonMistakes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-base">Common Mistakes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
