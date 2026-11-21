import { NextResponse } from "next/server";
import { getPartners } from "@/lib/network";
import { viewAll } from "@/lib/pipeline";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const [briefs, outcomes, partners] = await Promise.all([store.listBriefs(), store.listOutcomes(), getPartners()]);
  return NextResponse.json({ briefs: viewAll(briefs, outcomes, partners), storage: store.kind });
}
