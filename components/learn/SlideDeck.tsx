"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/shared/MathRenderer";
import { useGuestProgress } from "@/lib/store/guest-progress";
import type { LessonSlide, LessonSlideType } from "@/lib/types";

const TYPE_LABELS: Record<LessonSlideType, string> = {
  concept: "Concept",
  formula: "Formula",
  whenToUse: "When to use",
  tip: "Tip",
  diagram: "Diagram",
};

const TYPE_COLORS: Record<LessonSlideType, string> = {
  concept: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  formula: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  whenToUse: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  tip: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  diagram: "bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300",
};

interface SlideDeckProps {
  topicId: string;
  slides: LessonSlide[];
  onComplete?: () => void;
}

export function SlideDeck({ topicId, slides, onComplete }: SlideDeckProps) {
  const guest = useGuestProgress();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      guest.completeLesson(`learn:${topicId}`);
      onComplete?.();
    } else {
      setIndex((i) => i + 1);
    }
  }, [isLast, guest, topicId, onComplete]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!slide) return null;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{index + 1} of {slides.length} slides</span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-primary" : i < index ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="min-h-[320px]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={TYPE_COLORS[slide.type]} variant="secondary">
                  {TYPE_LABELS[slide.type]}
                </Badge>
              </div>
              <CardTitle className="text-xl">{slide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <MathRenderer content={slide.content} />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goPrev} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={goNext}>
          {isLast ? "Finish & continue" : "Next"}
          {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
