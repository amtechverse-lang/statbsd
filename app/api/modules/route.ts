import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserProgress } from "@/lib/progress";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await ensureUserProgress(session.user.id);
  }

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { lessons: true, questions: true } },
      lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } },
    },
  });

  let progressMap: Record<string, { unlocked: boolean; progress: number }> = {};
  if (session?.user?.id) {
    const progress = await prisma.userProgress.findMany({ where: { userId: session.user.id } });
    progressMap = Object.fromEntries(
      progress.map((p) => [p.moduleId, { unlocked: p.unlocked, progress: p.accuracy }])
    );
  }

  return NextResponse.json(
    modules.map((m) => ({
      ...m,
      unlocked: progressMap[m.id]?.unlocked ?? m.order === 0,
    }))
  );
}
