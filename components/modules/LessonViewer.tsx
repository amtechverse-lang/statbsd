"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MathRenderer } from "@/components/shared/MathRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGuestProgress } from "@/lib/store/guest-progress";

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    content: string;
    moduleId: string;
    moduleTitle: string;
    moduleOrder: number;
    order: number;
  };
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function LessonViewer({ lesson, prev, next }: LessonViewerProps) {
  const guest = useGuestProgress();

  useEffect(() => {
    guest.completeLesson(lesson.id);
  }, [lesson.id, guest]);

  const sections = lesson.content.split(/(?=## )/);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/modules/${lesson.moduleId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Module {lesson.moduleOrder}
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {lesson.moduleOrder}.{lesson.order}: {lesson.title}
        </h1>
        <p className="text-muted-foreground">{lesson.moduleTitle}</p>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
              <MathRenderer content={section} />
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <div className="flex justify-between pt-4">
        {prev ? (
          <Button variant="outline" asChild>
            <Link href={`/modules/${lesson.moduleId}/lesson/${prev.slug}`}>← {prev.title}</Link>
          </Button>
        ) : (
          <div />
        )}
        {next ? (
          <Button asChild>
            <Link href={`/modules/${lesson.moduleId}/lesson/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/modules/${lesson.moduleId}/practice`}>Start Practice →</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
