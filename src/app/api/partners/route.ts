import { NextResponse } from "next/server";
import { CATEGORIES, CITIES, TYPE_LABEL } from "@/lib/constants";
import { getPartners } from "@/lib/network";
import { viewAll } from "@/lib/pipeline";
import { getStore } from "@/lib/store";
import type { Partner, PartnerType, Storage, Workload } from "@/lib/types";

const TYPES = Object.keys(TYPE_LABEL) as PartnerType[];
const STORAGES: Storage[] = ["ambient", "chilled", "frozen"];
const WORKLOADS: Workload[] = ["low", "medium", "full"];
const list = (v: unknown) => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20) : []);
const num = (v: unknown) => (v === null || v === "" || v === undefined ? null : Math.max(0, Math.round(Number(v)) || 0));

/** Adds a partner to the network, then reports which briefs it unblocked. */
export async function POST(req: Request) {
  const b = await req.json();
  const p: Omit<Partner, "id"> = {
    name: String(b.name ?? "").trim().slice(0, 80),
    type: b.type,
    categories: list(b.categories).filter((c) => CATEGORIES.some((x) => x.id === c)),
    capabilities: list(b.capabilities).map((c) => c.toLowerCase()),
    storage: list(b.storage).filter((s): s is Storage => STORAGES.includes(s as Storage)),
    minBatchKg: num(b.minBatchKg),
    maxBatchKg: num(b.maxBatchKg),
    certifications: list(b.certifications),
    city: String(b.city ?? ""),
    workload: WORKLOADS.includes(b.workload) ? b.workload : "low",
    pastOutcomes: [],
  };
  if (!p.name || !TYPES.includes(p.type) || !p.categories.length || !p.storage.length || !CITIES.includes(p.city))
    return NextResponse.json({ error: "Add a name, type, at least one category and storage, and a city." }, { status: 400 });

  const store = getStore();
  const [briefs, outcomes] = await Promise.all([store.listBriefs(), store.listOutcomes()]);
  const before = viewAll(briefs, outcomes, await getPartners());
  const partner = await store.addPartner(p);
  const after = viewAll(briefs, outcomes, await getPartners());

  // A brief counts as helped when this partner now ranks in the top 3 for a step that had a gap.
  const helped = after.flatMap((v) => {
    const old = before.find((o) => o.id === v.id)!;
    return v.steps
      .filter((s, i) => old.steps[i]?.gap && s.type === p.type && s.state !== "done")
      .filter((s) => s.best?.id === partner.id || !s.gap)
      .map((s) => ({ id: v.id, name: v.brief.productName, step: s.title, unblocked: old.steps.find((o) => o.type === s.type)?.state === "blocked" }));
  });
  return NextResponse.json({ partner, helped });
}
