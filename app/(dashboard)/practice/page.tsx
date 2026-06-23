"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PracticeRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic");

  useEffect(() => {
    if (topic) {
      router.replace(`/learn/${topic}/practice`);
    } else {
      router.replace("/topics");
    }
  }, [topic, router]);

  return <p>Redirecting...</p>;
}

export default function PracticePage() {
  return (
    <Suspense fallback={<p>Redirecting...</p>}>
      <PracticeRedirect />
    </Suspense>
  );
}
