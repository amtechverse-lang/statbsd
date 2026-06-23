"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionDisplay } from "@/components/practice/QuestionDisplay";
import { HintPanel } from "@/components/practice/HintPanel";
import { StepByStepSolution } from "@/components/practice/StepByStepSolution";
import { usePracticeStore } from "@/lib/store/practice";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { Solution } from "@/lib/types";

interface Question {
  id: string;
  question: string;
  difficulty: string;
  type: string;
  topic: string;
  subtopic: string;
  hints: string[];
}

interface ExamPracticeEngineProps {
  fetchUrl: string;
  title?: string;
  description?: string;
}

export function ExamPracticeEngine({ fetchUrl, title, description }: ExamPracticeEngineProps) {
  const guest = useGuestProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ correct: boolean; solution: Solution; correctAnswer: string } | null>(null);

  const {
    currentIndex,
    answers,
    showHint,
    submitted,
    setAnswer,
    setCurrentIndex,
    revealHint,
    markSubmitted,
    reset,
  } = usePracticeStore();

  useEffect(() => {
    reset();
    setLoading(true);
    fetch(fetchUrl)
      .then((r) => r.json())
      .then((data: Question[]) => {
        setQuestions(data);
        setLoading(false);
      });
  }, [fetchUrl, reset]);

  const current = questions[currentIndex];

  const handleSubmit = useCallback(async () => {
    if (!current || submitted[currentIndex]) return;
    const answer = answers[currentIndex] ?? "";
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, answer }),
    });
    const data = await res.json();
    setResult(data);
    markSubmitted(currentIndex);
    guest.recordAttempt({ questionId: current.id, correct: data.correct, answer, timeMs: 0 });
  }, [current, currentIndex, answers, submitted, markSubmitted, guest]);

  if (loading) return <p>Loading exam-style questions...</p>;
  if (!questions.length) return <p>No questions in this topic yet.</p>;
  if (!current) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {(title || description) && (
        <div>
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{current.topic}</CardTitle>
          <CardDescription>{current.subtopic} · {current.difficulty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuestionDisplay question={current} index={currentIndex} total={questions.length} />

          <Input
            placeholder="Enter your answer (number, probability, or short expression)"
            value={answers[currentIndex] ?? ""}
            onChange={(e) => setAnswer(currentIndex, e.target.value)}
            disabled={submitted[currentIndex]}
            onKeyDown={(e) => e.key === "Enter" && !submitted[currentIndex] && handleSubmit()}
          />

          <HintPanel hints={current.hints} revealed={showHint} />

          {result && submitted[currentIndex] && (
            <>
              <div className={result.correct ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {result.correct ? "✓ Correct!" : `✗ Incorrect. Expected: ${result.correctAnswer}`}
              </div>
              <StepByStepSolution
                steps={result.solution.steps}
                finalAnswer={result.solution.finalAnswer}
                commonMistakes={result.solution.commonMistakes}
              />
            </>
          )}

          <div className="flex flex-wrap gap-2">
            {!submitted[currentIndex] && (
              <>
                <Button onClick={handleSubmit} disabled={!answers[currentIndex]?.trim()}>
                  Submit & Learn
                </Button>
                {showHint < current.hints.length && (
                  <Button variant="outline" onClick={revealHint}>
                    Hint ({showHint}/{current.hints.length})
                  </Button>
                )}
              </>
            )}
            {currentIndex > 0 && (
              <Button variant="outline" onClick={() => { setCurrentIndex(currentIndex - 1); setResult(null); }}>
                Previous
              </Button>
            )}
            {currentIndex < questions.length - 1 && (
              <Button variant="outline" onClick={() => { setCurrentIndex(currentIndex + 1); setResult(null); }}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {questions.map((_, i) => (
          <Button
            key={i}
            variant={i === currentIndex ? "default" : "outline"}
            size="icon"
            className="w-10 h-10"
            onClick={() => { setCurrentIndex(i); setResult(null); }}
          >
            {submitted[i] ? "✓" : i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
