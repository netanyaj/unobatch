import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { partnersForBrief } from "@/lib/briefs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const saved = await store.getBrief(id);
  if (!saved) return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  return NextResponse.json({ brief: saved.brief, createdAt: saved.createdAt, partners: partnersForBrief(await store.listOutcomes(), id) });
}
