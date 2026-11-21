import { NextResponse } from "next/server";
import { getPartners } from "@/lib/network";
import { viewAll } from "@/lib/pipeline";
import { recruitingNeeds } from "@/lib/recruiting";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const [briefs, outcomes, partners, added] = await Promise.all([
    store.listBriefs(), store.listOutcomes(), getPartners(), store.listPartners(),
  ]);
  return NextResponse.json({ needs: recruitingNeeds(viewAll(briefs, outcomes, partners)), added, storage: store.kind });
}
