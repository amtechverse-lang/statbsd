import { NextResponse } from "next/server";
import { getAllQuestions, getModules } from "@/lib/content";

export async function GET() {
  const modules = getModules();
  const questions = getAllQuestions();

  return NextResponse.json({
    status: "ok",
    mode: "guest",
    database: false,
    seeded: true,
    modules: modules.length,
    questions: questions.length,
  });
}
