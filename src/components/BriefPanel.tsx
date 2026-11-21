"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ISSUES, STAGES, categoryLabel } from "@/lib/constants";
import { STAGE_LABEL, STATE_LABEL, type BriefView, type StepState } from "@/lib/pipeline";
import type { MatchResult, OutcomeResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ChevronDown, Circle, Clock, TriangleAlert } from "lucide-react";
import PartnerCard, { RESULT_LABEL, type CardStatus } from "./PartnerCard";
import PartnerDrawer from "./PartnerDrawer";
import ScoreHelp from "./ScoreHelp";
import type { LoggedOutcome } from "@/lib/store";
import type { Partner } from "@/lib/types";

export const STATE_TONE: Record<StepState, string> = {
  to_pick: "border-stone-300 bg-white text-stone-700",
  intro_sent: "border-sky-200 bg-sky-50 text-sky-800",
  accepted: "border-indigo-200 bg-indigo-50 text-indigo-800",
  done: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blocked: "border-amber-300 bg-amber-50 text-amber-800",
};

export function StateIcon({ state, className }: { state: StepState; className?: string }) {
  const c = cn("size-3.5", className);
  if (state === "done") return <Check className={c} />;
  if (state === "blocked") return <TriangleAlert className={c} />;
  if (state === "intro_sent" || state === "accepted") return <Clock className={c} />;
  return <Circle className={c} />;
}

export default function BriefPanel({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [data, setData] = useState<{ view: BriefView; result: MatchResult } | null>(null);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [delta, setDelta] = useState<{ id: string; by: number } | null>(null);
  const [drawer, setDrawer] = useState<Partner | null>(null);
  const [logged, setLogged] = useState<LoggedOutcome[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/briefs/${encodeURIComponent(id)}`);
    if (!r.ok) { setMissing(true); return null; }
    const d = await r.json();
    setData(d);
    fetch("/api/outcomes").then((r) => r.json()).then((o) => setLogged(o.outcomes));
    return d as { view: BriefView; result: MatchResult };
  }, [id]);

  useEffect(() => {
    load().then((d) => {
      // Open the first step that needs something from the team.
      const first = d?.view.steps.find((s) => s.state === "to_pick") ?? d?.view.steps.find((s) => s.state !== "done");
      setOpen(first?.type ?? null);
    });
  }, [load]);

  if (missing) return <p className="p-6 text-sm text-muted-foreground">This brief isn&apos;t here any more.</p>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">Loading brief…</p>;
  const { view, result } = data;
  const b = view.brief;

  const status: Record<string, CardStatus> = {};
  for (const p of view.picks) status[p.partnerId] = p.result === "picked" ? { state: "picked" } : { state: "logged", result: p.result };

  const log = async (partnerId: string, res: OutcomeResult | "picked", note = "") => {
    const before = result.steps.flatMap((s) => s.matches).find((m) => m.partner.id === partnerId)?.score;
    await fetch("/api/outcomes", {
      method: "POST",
      body: JSON.stringify({ partnerId, category: b.category, result: res, note, briefName: b.productName || categoryLabel(b.category), briefId: id }),
    });
    const d = await load();
    const after = d?.result.steps.flatMap((s) => s.matches).find((m) => m.partner.id === partnerId)?.score;
    if (res !== "picked" && before != null && after != null) setDelta({ id: partnerId, by: after - before });
    onChanged();
  };

  const issues = ISSUES.filter((i) => b.issues.includes(i.id)).map((i) => i.label);
  const done = view.steps.filter((s) => s.state === "done").length;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{STAGE_LABEL[view.stage]}</Badge>
          <span className="text-xs text-muted-foreground">{done} of {view.steps.length} steps done · Next: {view.next}</span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{b.productName || categoryLabel(b.category)}</h2>
        <p className="text-sm text-muted-foreground">
          {categoryLabel(b.category)} · {STAGES.find((s) => s.id === b.stage)?.label} · {b.storage} ·{" "}
          {b.batchKg.toLocaleString("en-IN")} kg first batch · {b.city}
        </p>
        {issues.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Stuck on</span>
            {issues.map((l) => <Badge key={l} variant="secondary">{l}</Badge>)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {view.steps.map((s, i) => {
          const step = result.steps[i];
          const isOpen = open === s.type;
          const who = s.pick && s.state !== "to_pick" ? s.pick.name : s.best?.name;
          return (
            <Collapsible key={s.type} open={isOpen} onOpenChange={(o) => setOpen(o ? s.type : null)}>
              <Card className={cn("gap-0 py-0", isOpen && "ring-1 ring-primary")}>
                <CollapsibleTrigger asChild>
                  <button className="grid w-full grid-cols-[24px_1fr_auto_auto] items-center gap-3 px-4 py-3 text-left">
                    <span className="text-sm tabular-nums text-muted-foreground">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="font-medium">{s.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.state === "blocked" ? "No partner in the network fits"
                          : s.pick && s.state !== "to_pick" ? <>{s.pick.name}{s.pick.note ? ` · ${s.pick.note}` : ""}</>
                          : s.pick ? <>{s.pick.name}: {RESULT_LABEL[s.pick.result as OutcomeResult]}. Best now: {s.best?.name} ({s.best?.score})</>
                          : <>Best match: {who} ({s.best?.score})</>}
                      </span>
                    </span>
                    <Badge variant="outline" className={STATE_TONE[s.state]}>
                      <StateIcon state={s.state} />{STATE_LABEL[s.state]}
                    </Badge>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 border-t px-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      {step.why} {step.passedFilters} of {step.candidates} partners can do this job.
                    </p>
                    {s.gap && (
                      <div className="flex items-start justify-between gap-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold"><TriangleAlert className="size-4" />Gap in the network</div>
                          <div className="mt-0.5">{s.gap}</div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="shrink-0 border-amber-300 bg-white">
                          <Link href={`/recruiting?need=${encodeURIComponent(`${s.type}|${b.category}|${b.storage}`)}`}>Recruit<ArrowRight /></Link>
                        </Button>
                      </div>
                    )}
                    {step.matches.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {step.matches.map((m, idx) => (
                          <PartnerCard key={m.partner.id} s={m} rank={idx + 1}
                            delta={delta?.id === m.partner.id ? delta.by : null}
                            status={status[m.partner.id] ?? { state: "none" }}
                            onDetails={() => setDrawer(m.partner)}
                            onPick={() => log(m.partner.id, "picked")}
                            onLog={(r, note) => log(m.partner.id, r, note)} />
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="group -ml-3 text-muted-foreground">
            How the score works <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent><ScoreHelp /></CollapsibleContent>
      </Collapsible>

      <PartnerDrawer partner={drawer} logged={logged} onClose={() => setDrawer(null)} />
    </div>
  );
}
