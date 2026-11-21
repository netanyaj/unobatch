import { NextResponse } from "next/server";
import { partnersForBrief } from "@/lib/briefs";
import { match } from "@/lib/match";
import { getPartners, toOutcomeMap } from "@/lib/network";
import { viewBrief } from "@/lib/pipeline";
import { getStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const saved = await store.getBrief(id);
  if (!saved) return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  const [outcomes, partners] = await Promise.all([store.listOutcomes(), getPartners()]);
  const result = match(saved.brief, partners, toOutcomeMap(outcomes));
  const view = viewBrief(saved, result, partnersForBrief(outcomes, id, partners));
  return NextResponse.json({ view, result });
}
