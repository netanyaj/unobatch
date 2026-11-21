import { NextResponse } from "next/server";
import { match } from "@/lib/match";
import { PARTNERS } from "@/lib/network";
import { getStore } from "@/lib/store";
import { TEST_BRIEFS } from "@/lib/testBriefs";

export async function GET() {
  const store = getStore();
  const saved = await store.listBriefs();
  // The six example briefs always count, so the view isn't empty on a fresh install.
  const examples = TEST_BRIEFS.map((b) => ({
    id: `example-${b.productName}`, createdAt: "", example: true, brief: b,
    gaps: match(b, PARTNERS).steps.filter((s) => s.gap).map((s) => ({ step: s.type, text: s.gap!, recruit: s.recruit! })),
  }));
  const briefs = [...saved.map((s) => ({ ...s, example: false })), ...examples];
  return NextResponse.json({ briefs, storage: store.kind });
}
