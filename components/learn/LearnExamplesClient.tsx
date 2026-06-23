"use client";

import { useRouter } from "next/navigation";
import { WorkedExampleViewer } from "@/components/learn/WorkedExampleViewer";
import type { WorkedExample } from "@/lib/types";

export function LearnExamplesClient({ topicId, examples }: { topicId: string; examples: WorkedExample[] }) {
  const router = useRouter();
  return (
    <WorkedExampleViewer
      topicId={topicId}
      examples={examples}
      onComplete={() => router.push(`/learn/${topicId}/practice`)}
    />
  );
}
