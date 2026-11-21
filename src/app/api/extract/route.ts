import { NextResponse } from "next/server";
import { extractIssuesByKeywords } from "@/lib/extract";
import { extractIssuesWithClaude } from "@/lib/llmExtract";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text: string };
  const fromClaude = await extractIssuesWithClaude(text ?? "");
  if (fromClaude) return NextResponse.json({ issues: fromClaude, source: "llm" });
  return NextResponse.json({ issues: extractIssuesByKeywords(text ?? ""), source: "keywords" });
}
