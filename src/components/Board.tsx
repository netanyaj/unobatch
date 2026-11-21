"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categoryLabel } from "@/lib/constants";
import { STAGE_HINT, STAGE_LABEL, STAGE_ORDER, STATE_LABEL, type BriefStage, type BriefView } from "@/lib/pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Plus, TriangleAlert } from "lucide-react";
import BriefPanel from "./BriefPanel";

const DOT: Record<string, string> = {
  to_pick: "bg-stone-300",
  intro_sent: "bg-sky-500",
  accepted: "bg-indigo-500",
  done: "bg-emerald-500",
  blocked: "bg-amber-400",
};

const COLUMN_TONE: Record<BriefStage, string> = {
  new: "bg-stone-400",
  intros: "bg-sky-500",
  in_progress: "bg-indigo-500",
  blocked: "bg-amber-400",
  done: "bg-emerald-500",
};

function BriefCard({ v, onOpen, selected }: { v: BriefView; onOpen: () => void; selected: boolean }) {
  const b = v.brief;
  const gaps = v.steps.filter((s) => s.state === "blocked").length;
  return (
    <Card onClick={onOpen} role="button" tabIndex={0} aria-label={`Open ${b.productName}`}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className={cn("cursor-pointer gap-0 py-3 transition hover:border-stone-400", selected && "ring-2 ring-primary")}>
      <CardContent className="space-y-2 px-3">
        <div className="text-sm font-medium leading-snug">{b.productName || categoryLabel(b.category)}</div>
        <div className="text-xs text-muted-foreground">{categoryLabel(b.category)} · {b.batchKg.toLocaleString("en-IN")} kg · {b.city}</div>
        <div className="flex gap-1" aria-label="Steps">
          {v.steps.map((s) => (
            <span key={s.type} title={`${s.title}: ${STATE_LABEL[s.state]}`} className={cn("h-1.5 flex-1 rounded-full", DOT[s.state])} />
          ))}
        </div>
        <div className="text-xs">{v.next}</div>
        {gaps > 0 && v.stage !== "blocked" && (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
            <TriangleAlert />{gaps} {gaps === 1 ? "gap" : "gaps"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function Board() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = params.get("brief");
  const [briefs, setBriefs] = useState<BriefView[] | null>(null);
  const [storage, setStorage] = useState("memory");
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/board").then((r) => r.json());
    setBriefs(r.briefs);
    setStorage(r.storage);
  }, []);
  useEffect(() => { load(); }, [load]);

  const select = (id: string | null) => router.replace(id ? `${pathname}?brief=${id}` : pathname, { scroll: false });
  const seed = async () => { setSeeding(true); await fetch("/api/briefs", { method: "POST" }); await load(); setSeeding(false); };

  if (!briefs) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const counts = Object.fromEntries(STAGE_ORDER.map((s) => [s, briefs.filter((b) => b.stage === s).length])) as Record<BriefStage, number>;
  const current = briefs.find((b) => b.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every brief and where it stands. Cards move on their own as you pick partners and log how intros went.
          </p>
          {storage === "memory" && <p className="mt-1 text-xs text-muted-foreground">No database connected, so the board empties when the server restarts.</p>}
        </div>
        <div className="flex gap-2">
          {briefs.length < 6 && (
            <Button variant="outline" onClick={seed} disabled={seeding}>{seeding ? "Adding…" : "Add example briefs"}</Button>
          )}
          <Button asChild><Link href="/new"><Plus />New brief</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {STAGE_ORDER.map((stage) => (
          <section key={stage} className="flex min-h-[420px] flex-col rounded-xl bg-muted/60 p-2">
            <header className="px-1.5 pb-2 pt-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("size-2 rounded-full", COLUMN_TONE[stage])} />
                {STAGE_LABEL[stage]}
                <span className="ml-auto text-xs font-normal tabular-nums text-muted-foreground">{counts[stage]}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{STAGE_HINT[stage]}</div>
            </header>
            <div className="flex flex-col gap-2">
              {briefs.filter((b) => b.stage === stage).map((v) => (
                <BriefCard key={v.id} v={v} selected={v.id === selected} onOpen={() => select(v.id)} />
              ))}
              {stage === "blocked" && counts.blocked > 0 && (
                <Button variant="ghost" size="sm" asChild className="text-amber-800"><Link href="/recruiting">See who to recruit</Link></Button>
              )}
            </div>
          </section>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) select(null); }}>
        <SheetContent className="w-[920px] overflow-y-auto p-0 sm:max-w-[920px]">
          <SheetTitle className="sr-only">{current?.brief.productName ?? "Brief"}</SheetTitle>
          <SheetDescription className="sr-only">Steps, partners and outcomes for this brief</SheetDescription>
          {selected && <BriefPanel key={selected} id={selected} onChanged={load} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
