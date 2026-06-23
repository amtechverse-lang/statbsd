"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionDisplay } from "@/components/practice/QuestionDisplay";
import { OptionsDisplay } from "@/components/practice/OptionsDisplay";
import { HintPanel } from "@/components/practice/HintPanel";
import { StepByStepSolution } from "@/components/practice/StepByStepSolution";
import { usePracticeStore } from "@/lib/store/practice";
import { formatTime } from "@/lib/utils";
import type { Solution, McqOption } from "@/lib/types";

interface Question {
  id: string;
  moduleId: string;
  question: string;
  difficulty: string;
  type: string;
  topic: string;
  options?: McqOption[];
  hints: string[];
}

function PracticeContent({ moduleId }: { moduleId: string }) {
  const searchParams = useSearchParams();
  const isQuiz = searchParams.get("quiz") === "true";
  const isTimed = searchParams.get("mode") === "timed";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ correct: boolean; solution: Solution; correctAnswer: string } | null>(null);

  const {
    currentIndex,
    answers,
    timeElapsed,
    showHint,
    submitted,
    setAnswer,
    setCurrentIndex,
    incrementTime,
    resetTime,
    revealHint,
    markSubmitted,
    reset,
  } = usePracticeStore();

  useEffect(() => {
    reset();
    resetTime();
    fetch(`/api/questions?moduleId=${moduleId}`)
      .then((r) => r.json())
      .then((data: Question[]) => {
        const qs = isQuiz
          ? [...data].sort(() => Math.random() - 0.5).slice(0, 10)
          : data;
        setQuestions(qs);
        setLoading(false);
      });
  }, [moduleId, isQuiz, reset, resetTime]);

  useEffect(() => {
    if (!isTimed) return;
    const timer = setInterval(incrementTime, 1000);
    return () => clearInterval(timer);
  }, [isTimed, incrementTime]);

  const current = questions[currentIndex];

  const handleSubmit = useCallback(async () => {
    if (!current || submitted[currentIndex]) return;
    const answer = answers[currentIndex] ?? "";
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, answer, timeMs: timeElapsed * 1000 }),
    });
    const data = await res.json();
    setResult(data);
    markSubmitted(currentIndex);
  }, [current, currentIndex, answers, submitted, timeElapsed, markSubmitted]);

  const handleQuizComplete = useCallback(async () => {
    if (!isQuiz) return;
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answers[i] ?? "";
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, answer }),
      });
      const data = await res.json();
      if (data.correct) correct++;
    }
    const score = (correct / questions.length) * 100;
    const passed = score >= 80;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "quiz", moduleId, score, passed }),
    });
    alert(`Quiz complete! Score: ${Math.round(score)}%${passed ? " - Passed!" : " - Try again"}`);
  }, [isQuiz, questions, answers, moduleId]);

  if (loading) return <p>Loading questions...</p>;
  if (!current) return <p>No questions found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <Link href={`/modules/${moduleId}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Module
        </Link>
        {isTimed && <span className="font-mono text-lg">⏱ {formatTime(timeElapsed)}</span>}
        {isQuiz && <span className="text-sm font-medium text-primary">Quiz Mode</span>}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <QuestionDisplay question={current} index={currentIndex} total={questions.length} />

          {current.type === "MCQ" && current.options && (
            <OptionsDisplay
              options={current.options}
              selected={answers[currentIndex]}
              onSelect={(label) => setAnswer(currentIndex, label)}
              disabled={submitted[currentIndex]}
              showCorrect={submitted[currentIndex]}
              correctAnswer={result?.correctAnswer}
            />
          )}

          {(current.type === "FillIn" || current.type === "ProblemSolving") && (
            <Input
              placeholder="Enter your answer"
              value={answers[currentIndex] ?? ""}
              onChange={(e) => setAnswer(currentIndex, e.target.value)}
              disabled={submitted[currentIndex]}
            />
          )}

          <HintPanel hints={current.hints} revealed={showHint} />

          {result && submitted[currentIndex] && (
            <div className={result.correct ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {result.correct ? "✓ Correct!" : `✗ Incorrect. Answer: ${result.correctAnswer}`}
            </div>
          )}

          {result && submitted[currentIndex] && (
            <StepByStepSolution
              steps={result.solution.steps}
              finalAnswer={result.solution.finalAnswer}
              commonMistakes={result.solution.commonMistakes}
            />
          )}

          <div className="flex flex-wrap gap-2">
            {!submitted[currentIndex] && (
              <>
                <Button onClick={handleSubmit} disabled={!answers[currentIndex]}>
                  Submit
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
            {currentIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                onClick={() => { setCurrentIndex(currentIndex + 1); setResult(null); }}
              >
                Next
              </Button>
            ) : isQuiz ? (
              <Button onClick={handleQuizComplete}>Finish Quiz</Button>
            ) : null}
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

export default function ModulePracticePage({ params }: { params: { moduleId: string } }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PracticeContent moduleId={params.moduleId} />
    </Suspense>
  );
}
