"use client";

import { useRouter } from "next/navigation";
import { SlideDeck } from "@/components/learn/SlideDeck";
import type { LessonSlide } from "@/lib/types";

export function LearnSlidesClient({ topicId, slides }: { topicId: string; slides: LessonSlide[] }) {
  const router = useRouter();
  return (
    <SlideDeck
      topicId={topicId}
      slides={slides}
      onComplete={() => router.push(`/learn/${topicId}/examples`)}
    />
  );
}
