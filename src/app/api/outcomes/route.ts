import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

const RESULTS = ["picked", "accepted", "declined", "went_ahead", "didnt_work"];

export async function GET() {
  const store = getStore();
  return NextResponse.json({ outcomes: await store.listOutcomes(), storage: store.kind });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!RESULTS.includes(body.result) || typeof body.partnerId !== "string")
    return NextResponse.json({ error: "Bad outcome" }, { status: 400 });
  const row = await getStore().addOutcome({
    partnerId: body.partnerId, category: String(body.category ?? ""), result: body.result,
    note: String(body.note ?? "").slice(0, 300), briefName: String(body.briefName ?? "").slice(0, 120),
    briefId: typeof body.briefId === "string" ? body.briefId.slice(0, 40) : null,
  });
  return NextResponse.json({ outcome: row });
}
