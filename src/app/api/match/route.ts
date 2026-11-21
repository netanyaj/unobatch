import { NextResponse } from "next/server";
import { runMatch } from "@/lib/network";
import { getStore } from "@/lib/store";
import type { Brief } from "@/lib/types";

export async function POST(req: Request) {
  const { brief, save } = (await req.json()) as { brief: Brief; save?: boolean };
  const result = await runMatch(brief);
  const store = getStore();
  let briefId: string | null = null;
  if (save) {
    briefId = (await store.addBrief({
      brief,
      gaps: result.steps.filter((s) => s.gap).map((s) => ({ step: s.type, text: s.gap!, recruit: s.recruit! })),
    })).id;
  }
  return NextResponse.json({ result, storage: store.kind, briefId });
}
