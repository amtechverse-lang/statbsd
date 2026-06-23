import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [modules, questions] = await Promise.all([
      prisma.module.count(),
      prisma.question.count(),
    ]);
    return NextResponse.json({
      status: "ok",
      database: "connected",
      modules,
      questions,
      seeded: modules > 0 && questions > 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
