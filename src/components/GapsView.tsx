"use client";

import { useEffect, useState } from "react";
import { TYPE_LABEL, categoryLabel } from "@/lib/constants";
import type { Brief, PartnerType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  if (!rows) return <p className="text-sm text-muted-foreground">Loading…</p>;

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
        <p className="mt-1 text-sm text-muted-foreground">
          Where briefs couldn&apos;t be matched well. This is the list of partners to recruit next.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {withGaps} of {total} briefs had at least one gap. Includes 6 example briefs
          {storage === "memory" ? "; briefs you run are kept until the server restarts (no database connected)." : "."}
        </p>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 text-muted-foreground">Recruit</TableHead>
              <TableHead className="text-muted-foreground">Why</TableHead>
              <TableHead className="pr-6 text-right text-muted-foreground">Briefs hit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((g) => (
              <TableRow key={g.key}>
                <TableCell className="whitespace-normal py-3 pl-6 align-top">
                  <Badge variant="secondary" className="mb-1">{TYPE_LABEL[g.step]}</Badge>
                  <div className="font-medium first-letter:uppercase">{g.what}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.step !== "technologist" && g.step !== "lab" && <>Batches from {g.minKg.toLocaleString("en-IN")} kg · </>}
                    Near {[...g.cities].join(", ")}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal py-3 align-top">
                  {g.example}
                  <div className="mt-1 text-xs text-muted-foreground">{[...new Set(g.briefs)].join(", ")}</div>
                </TableCell>
                <TableCell className="py-3 pr-6 text-right align-top text-lg font-semibold tabular-nums">{g.briefs.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
