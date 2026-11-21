import { NextResponse } from "next/server";
import { runMatch } from "@/lib/network";
import { getStore } from "@/lib/store";
import { TEST_BRIEFS } from "@/lib/testBriefs";

/** Adds the six example briefs to the board, skipping any already there. */
export async function POST() {
  const store = getStore();
  const have = new Set((await store.listBriefs()).map((b) => b.brief.productName));
  let added = 0;
  for (const { expect: _e, ...brief } of [...TEST_BRIEFS].reverse()) {
    void _e;
    if (have.has(brief.productName)) continue;
    const result = await runMatch(brief);
    await store.addBrief({
      brief,
      gaps: result.steps.filter((s) => s.gap).map((s) => ({ step: s.type, text: s.gap!, recruit: s.recruit! })),
    });
    added++;
  }
  return NextResponse.json({ added });
}
