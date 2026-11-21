"use client";

import { useEffect, useState } from "react";
import { TYPE_LABEL, categoryLabel } from "@/lib/constants";
import type { Brief, PartnerType } from "@/lib/types";

interface Row {
  id: string; createdAt: string; example: boolean; brief: Brief;
  gaps: { step: PartnerType; text: string; recruit: string }[];
}

export default function GapsView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [storage, setStorage] = useState("memory");
  useEffect(() => {
    fetch("/api/gaps").then((r) => r.json()).then((r) => { setRows(r.briefs); setStorage(r.storage); });
  }, []);
  if (!rows) return <p className="text-sm text-stone-500">Loading…</p>;

  // Group by who to recruit, counting how many briefs hit the same gap.
  type G = { key: string; step: PartnerType; what: string; briefs: string[]; example: string; minKg: number; cities: Set<string> };
  const groups = new Map<string, G>();
  for (const r of rows) {
    for (const g of r.gaps) {
      const b = r.brief;
      const key = `${g.step}|${b.category}|${b.storage}`;
      const cat = categoryLabel(b.category).toLowerCase();
      const cur = groups.get(key) ?? {
        key, step: g.step, what: cat.includes(b.storage) ? cat : `${b.storage} ${cat}`,
        briefs: [], example: g.text, minKg: b.batchKg, cities: new Set<string>(),
      };
      cur.briefs.push(b.productName || categoryLabel(b.category));
      cur.minKg = Math.min(cur.minKg, b.batchKg);
      cur.cities.add(b.city);
      groups.set(key, cur);
    }
  }
  const sorted = [...groups.values()].sort((a, b) => b.briefs.length - a.briefs.length);
  const total = rows.length;
  const withGaps = rows.filter((r) => r.gaps.length > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Network gaps</h1>
        <p className="mt-1 text-sm text-stone-600">
          Where briefs couldn&apos;t be matched well. This is the list of partners to recruit next.
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {withGaps} of {total} briefs had at least one gap. Includes 6 example briefs
          {storage === "memory" ? "; briefs you run are kept until the server restarts (no database connected)." : "."}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-2">Recruit</th>
              <th className="px-4 py-2">Why</th>
              <th className="px-4 py-2 text-right">Briefs hit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((g) => (
              <tr key={g.key} className="border-t border-stone-100 align-top">
                <td className="px-4 py-3">
                  <div className="text-xs text-stone-500">{TYPE_LABEL[g.step]}</div>
                  <div className="font-medium first-letter:uppercase">{g.what}</div>
                  <div className="text-xs text-stone-500">
                    {g.step !== "technologist" && g.step !== "lab" && <>Batches from {g.minKg.toLocaleString("en-IN")} kg · </>}
                    Near {[...g.cities].join(", ")}
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-700">
                  {g.example}
                  <div className="mt-1 text-xs text-stone-500">{[...new Set(g.briefs)].join(", ")}</div>
                </td>
                <td className="px-4 py-3 text-right text-lg font-semibold tabular-nums">{g.briefs.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
