"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGES, TYPE_LABEL, categoryLabel } from "@/lib/constants";
import type { BriefPartner } from "@/lib/briefs";
import type { Brief, PartnerType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RESULT_LABEL } from "./PartnerCard";
import { ArrowRight } from "lucide-react";

interface Row {
  id: string; createdAt: string; brief: Brief; steps: PartnerType[];
  gaps: { step: PartnerType; text: string }[]; partners: BriefPartner[];
}

const TONE: Record<string, string> = {
  picked: "bg-sky-100 text-sky-800",
  went_ahead: "bg-emerald-100 text-emerald-800",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-stone-200 text-stone-700",
  didnt_work: "bg-rose-100 text-rose-800",
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " +
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export default function BriefsView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [storage, setStorage] = useState("memory");
  useEffect(() => {
    fetch("/api/briefs").then((r) => r.json()).then((r) => { setRows(r.briefs); setStorage(r.storage); });
  }, []);
  if (!rows) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Briefs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every brief that&apos;s been matched, with the partners picked for it and how each intro went.
          </p>
          {storage === "memory" && (
            <p className="mt-1 text-xs text-muted-foreground">No database connected, so this list empties when the server restarts.</p>
          )}
        </div>
        <Button asChild><Link href="/">New brief</Link></Button>
      </div>

      <Card className="py-0">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No briefs yet. Run one from New brief and it will show up here.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-muted-foreground">Brief</TableHead>
                <TableHead className="text-muted-foreground">Path</TableHead>
                <TableHead className="text-muted-foreground">Partners picked</TableHead>
                <TableHead className="w-24 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const b = r.brief;
                const covered = r.steps.length - r.gaps.length;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-normal py-3 pl-6 align-top">
                      <Link href={`/?brief=${r.id}`} className="font-medium hover:underline">{b.productName || categoryLabel(b.category)}</Link>
                      <div className="text-xs text-muted-foreground">
                        {categoryLabel(b.category)} · {STAGES.find((s) => s.id === b.stage)?.label} · {b.batchKg.toLocaleString("en-IN")} kg · {b.city}
                      </div>
                      <div className="text-xs text-muted-foreground">{when(r.createdAt)}</div>
                    </TableCell>
                    <TableCell className="whitespace-normal py-3 align-top">
                      <div className="text-sm">{covered} of {r.steps.length} steps covered</div>
                      {r.gaps.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.gaps.map((g) => (
                            <Badge key={g.step} variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                              Gap: {TYPE_LABEL[g.step]}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal py-3 align-top">
                      {r.partners.length === 0 ? (
                        <span className="text-sm text-muted-foreground">None yet</span>
                      ) : (
                        <ul className="space-y-1.5">
                          {r.partners.map((p) => (
                            <li key={p.partnerId} className="flex flex-wrap items-center gap-2 text-sm">
                              <span>{p.name}</span>
                              {p.type && <span className="text-xs text-muted-foreground">{TYPE_LABEL[p.type]}</span>}
                              <Badge variant="secondary" className={TONE[p.result]}>
                                {p.result === "picked" ? "Picked, no outcome yet" : RESULT_LABEL[p.result]}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell className="py-3 pr-6 text-right align-top">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/?brief=${r.id}`}>Open<ArrowRight /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
