import { NextResponse } from "next/server";
import { partnersForBrief } from "@/lib/briefs";
import { match } from "@/lib/match";
import { PARTNERS } from "@/lib/network";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const [briefs, outcomes] = await Promise.all([store.listBriefs(), store.listOutcomes()]);
  const rows = [...briefs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => ({
      id: b.id, createdAt: b.createdAt, brief: b.brief, gaps: b.gaps,
      steps: match(b.brief, PARTNERS).steps.map((s) => s.type),
      partners: partnersForBrief(outcomes, b.id),
    }));
  return NextResponse.json({ briefs: rows, storage: store.kind });
}
