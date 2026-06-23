import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { examId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: params.examId } });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const questions = await prisma.question.findMany({
    where: { id: { in: exam.questionIds } },
    select: {
      id: true,
      topic: true,
      difficulty: true,
      type: true,
      question: true,
      options: true,
    },
  });

  const ordered = exam.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean);

  return NextResponse.json({
    id: exam.id,
    name: exam.name,
    description: exam.description,
    timeLimit: exam.timeLimit,
    passingScore: exam.passingScore,
    questions: ordered,
  });
}
