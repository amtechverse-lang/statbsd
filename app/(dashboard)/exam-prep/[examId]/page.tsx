"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionDisplay } from "@/components/practice/QuestionDisplay";
import { OptionsDisplay } from "@/components/practice/OptionsDisplay";
import { Input } from "@/components/ui/input";
import { StepByStepSolution } from "@/components/practice/StepByStepSolution";
import { formatTime } from "@/lib/utils";
import type { McqOption, Solution } from "@/lib/types";
import { useGuestProgress } from "@/lib/store/guest-progress";

interface Question {
  id: string;
  question: string;
  difficulty: string;
  type: string;
  topic: string;
  options?: McqOption[];
}

interface ExamResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  studyPlan: { weakTopics: string[]; recommendedModules: { id: string; question: string; moduleId: string }[] };
  solutions: { id: string; correctAnswer: string; solution: Solution }[];
}

function ExamContent({ examId }: { examId: string }) {
  const guest = useGuestProgress();
  const [exam, setExam] = useState<{ name: string; timeLimit: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load exam");
        return r.json();
      })
      .then((data) => {
        setExam({ name: data.name, timeLimit: data.timeLimit });
        setTimeLeft(data.timeLimit * 60);
        setQuestions(data.questions ?? []);
      })
      .catch(() => setLoadError("Could not load exam. Please try again."));
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (submitted || !exam) return;
    setSubmitted(true);
    const answerArray = questions.map((_, i) => answers[i] ?? "");
    const timeTaken = exam.timeLimit * 60 - timeLeft;
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, answers: answerArray, timeTaken }),
    });
    if (!res.ok) {
      setLoadError("Failed to submit exam.");
      setSubmitted(false);
      return;
    }
    const data = await res.json();
    setResult(data);
    guest.recordExam(examId, data.score, data.passed);
  }, [submitted, exam, questions, answers, timeLeft, examId, guest]);

  useEffect(() => {
    if (submitted || !exam) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, exam]);

  useEffect(() => {
    if (timeLeft === 0 && exam && !submitted && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, exam, submitted, questions.length, handleSubmit]);

  if (loadError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{loadError}</p>
        <Button asChild><Link href="/exam-prep">Back to Exams</Link></Button>
      </div>
    );
  }

  if (!exam || questions.length === 0) return <p>Loading exam...</p>;

  if (result) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-3xl font-bold">Exam Results</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold">{Math.round(result.score)}%</p>
              <p className={result.passed ? "text-green-600" : "text-red-600"}>
                {result.passed ? "Passed!" : "Not passed"} ({result.correct}/{result.total})
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Topic Breakdown</h3>
              {Object.entries(result.topicBreakdown).map(([topic, v]) => (
                <div key={topic} className="flex justify-between text-sm py-1">
                  <span>{topic}</span>
                  <span>{v.correct}/{v.total} ({Math.round((v.correct / v.total) * 100)}%)</span>
                </div>
              ))}
            </div>

            {result.studyPlan.weakTopics.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Weak Topics</h3>
                <ul className="list-disc pl-5 text-sm">
                  {result.studyPlan.weakTopics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.studyPlan.recommendedModules.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recommended Practice</h3>
                <ul className="space-y-1 text-sm">
                  {result.studyPlan.recommendedModules.map((q) => (
                    <li key={q.id}>
                      <Link href={`/modules/${q.moduleId}/practice`} className="text-primary hover:underline">
                        {q.question.slice(0, 60)}...
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setShowReview(!showReview)}>
                {showReview ? "Hide" : "Show"} Solutions
              </Button>
              <Button variant="outline" asChild>
                <Link href="/exam-prep">Back to Exams</Link>
              </Button>
            </div>

            {showReview &&
              result.solutions.map((s, i) => (
                <div key={s.id} className="border-t pt-4">
                  <p className="font-medium mb-2">Question {i + 1}</p>
                  <StepByStepSolution steps={s.solution.steps} finalAnswer={s.solution.finalAnswer} />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{exam.name}</h1>
          <p className="text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="text-xl font-mono" aria-live="polite">⏱ {formatTime(timeLeft)}</div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <QuestionDisplay question={current} index={currentIndex} total={questions.length} />

          {current.type === "MCQ" && current.options && (
            <OptionsDisplay
              options={current.options}
              selected={answers[currentIndex]}
              onSelect={(label) => setAnswers({ ...answers, [currentIndex]: label })}
            />
          )}

          {(current.type === "FillIn" || current.type === "ProblemSolving") && (
            <Input
              value={answers[currentIndex] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
              placeholder="Enter your answer"
            />
          )}

          <div className="flex justify-between">
            <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
              Previous
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit}>Submit Exam</Button>
            ) : (
              <Button onClick={() => setCurrentIndex(currentIndex + 1)}>Next</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {questions.map((_, i) => (
          <Button
            key={i}
            variant={i === currentIndex ? "default" : answers[i] ? "secondary" : "outline"}
            size="icon"
            className="w-10 h-10"
            onClick={() => setCurrentIndex(i)}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function ExamPage({ params }: { params: { examId: string } }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ExamContent examId={params.examId} />
    </Suspense>
  );
}
