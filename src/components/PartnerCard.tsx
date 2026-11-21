"use client";

import { useState } from "react";
import type { OutcomeResult, ScoredPartner } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, TriangleAlert, X } from "lucide-react";

export const RESULT_LABEL: Record<OutcomeResult, string> = {
  accepted: "Intro accepted",
  declined: "Declined",
  went_ahead: "Project went ahead",
  didnt_work: "Didn't work",
};

export type CardStatus = { state: "none" } | { state: "picked" } | { state: "logged"; result: OutcomeResult };

/** One row of the score breakdown: label, a small bar, and points out of the factor's maximum. */
function ReasonRow({ label, points, max, good }: { label: string; points: number; max: number; good: boolean }) {
  const pct = max > 0 ? Math.round((points / max) * 100) : 0;
  const bar = good ? "bg-emerald-500" : points === 0 ? "bg-rose-400" : "bg-stone-400";
  return (
    <li className="grid grid-cols-[1fr_56px_44px] items-center gap-2 text-xs">
      <span className={points === 0 && !good ? "text-rose-700" : ""}>{label}</span>
      <span className="h-1.5 rounded-full bg-background">
        <span className={cn("block h-1.5 rounded-full", bar)} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-right tabular-nums text-muted-foreground">+{points}<span className="opacity-50">/{max}</span></span>
    </li>
  );
}

/** A thin bar split by factor, so the score's make-up shows at a glance. */
function ScoreBar({ reasons }: { reasons: ScoredPartner["reasons"] }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      {reasons.filter((r) => r.points > 0).map((r, i) => (
        <span key={i} className={cn("h-2 border-r border-card last:border-r-0", r.good ? "bg-emerald-500" : "bg-stone-400")}
          style={{ width: `${r.points}%` }} />
      ))}
    </div>
  );
}

export default function PartnerCard({ s, rank, delta, status, onDetails, onPick, onLog }: {
  s: ScoredPartner; rank: number; delta: number | null; status: CardStatus;
  onDetails: () => void; onPick: () => void; onLog: (r: OutcomeResult, note: string) => Promise<void>;
}) {
  const [result, setResult] = useState<OutcomeResult>("went_ahead");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const p = s.partner;
  const top = [...s.reasons].filter((r) => r.good && r.points > 0).sort((a, b) => b.points - a.points).slice(0, 2);
  const weak = s.reasons.find((r) => r.points === 0 && !r.good);
  const best = rank === 1;

  return (
    <Card className={cn("gap-0 py-4", status.state !== "none" && "ring-2 ring-primary")}>
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {best ? <Badge className="bg-emerald-600 text-white">Best match</Badge> : <span>Option {rank}</span>}
              <span>{p.city}</span>
            </div>
            <button onClick={onDetails} className="mt-1 text-left font-medium leading-snug hover:underline">{p.name}</button>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-semibold leading-none tabular-nums">{s.score}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">of 100</div>
            {delta != null && delta !== 0 && (
              <div className={cn("mt-1 text-xs font-medium", delta > 0 ? "text-emerald-700" : "text-rose-700")}>
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} since last outcome
              </div>
            )}
          </div>
        </div>

        <div className="mt-3"><ScoreBar reasons={s.reasons} /></div>

        <ul className="mt-3 space-y-1 text-sm">
          {top.map((r, i) => <li key={i} className="flex items-center gap-2"><Check className="size-4 text-emerald-600" />{r.label}</li>)}
          {weak && <li className="flex items-center gap-2 text-rose-700"><X className="size-4" />{weak.label}</li>}
        </ul>
        {s.warnings.map((w, i) => (
          <div key={i} className="mt-2 flex items-center gap-1.5 text-xs text-amber-800"><TriangleAlert className="size-3.5" />{w}</div>
        ))}

        <Collapsible className="mt-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="group -ml-3 text-muted-foreground">
              Why {s.score}? <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1 space-y-1.5 rounded-md bg-muted p-2.5">
              {s.reasons.map((r, i) => <ReasonRow key={i} {...r} />)}
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-3">
          {status.state === "none" && (
            <div className="flex gap-2">
              <Button className="flex-1" size="sm" onClick={onPick}>Pick</Button>
              <Button variant="outline" size="sm" onClick={onDetails}>Details</Button>
            </div>
          )}
          {status.state === "picked" && (
            <div className="space-y-2 rounded-md bg-muted p-2.5">
              <div className="text-xs font-medium">Picked. How did it go?</div>
              <Select value={result} onValueChange={(v) => setResult(v as OutcomeResult)}>
                <SelectTrigger className="w-full bg-background" size="sm" aria-label="Outcome"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(RESULT_LABEL) as OutcomeResult[]).map((r) => <SelectItem key={r} value={r}>{RESULT_LABEL[r]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input className="h-8 bg-background" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why? (optional)" />
              <Button size="sm" className="w-full" disabled={saving}
                onClick={async () => { setSaving(true); await onLog(result, note); setSaving(false); }}>
                {saving ? "Saving…" : "Log outcome"}
              </Button>
            </div>
          )}
          {status.state === "logged" && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              Logged: <span className="font-medium">{RESULT_LABEL[status.result]}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
