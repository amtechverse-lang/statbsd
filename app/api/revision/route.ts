import { NextResponse } from "next/server";
import { countQuestionsByRevisionTopic, getRevisionTopics } from "@/lib/content";

export async function GET() {
  const topics = getRevisionTopics();
  const counts = countQuestionsByRevisionTopic();
  return NextResponse.json(
    topics.map((t) => ({
      ...t,
      questionCount: counts[t.id] ?? 0,
    }))
  );
}
