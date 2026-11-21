"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ISSUES, STAGES, categoryLabel } from "@/lib/constants";
import { WEIGHTS } from "@/lib/match";
import type { LoggedOutcome } from "@/lib/store";
import type { Brief, Issue, MatchResult, OutcomeResult, Partner } from "@/lib/types";
import BriefForm, { EMPTY_BRIEF } from "./BriefForm";
import IssueReview from "./IssueReview";
import PartnerCard, { type CardStatus } from "./PartnerCard";
import PartnerDrawer from "./PartnerDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, TriangleAlert, X } from "lucide-react";

type View = "form" | "issues" | "results";

const FACTORS: [keyof typeof WEIGHTS, string][] = [
  ["experience", "Has worked in this category, plus extra for past projects in it that went ahead."],
  ["capability", "Has the specific skills your claims and problems call for."],
  ["location", "In your city, or nearby. Matters less for technologists and labs."],
  ["workload", "Has room to take you on now."],
  ["history", "How past intros went: went ahead counts for, declined or didn't work counts against."],
  ["certification", "Holds the certifications that matter for this type of partner."],
  ["batchFit", "Your first batch sits comfortably inside their range, not right at the minimum."],
];

function ScoreHelp() {
  return (
    <div className="rounded-md bg-muted p-3 text-sm">
      <p className="text-muted-foreground">
        First we remove partners who can&apos;t do the job: wrong category, can&apos;t handle your storage, or your
        batch is outside their range. Then we score the rest out of 100:
      </p>
      <Table className="mt-2">
        <TableBody>
          {FACTORS.map(([k, text]) => (
            <TableRow key={k} className="hover:bg-transparent">
              <TableCell className="w-10 py-1.5 font-medium tabular-nums">{WEIGHTS[k]}</TableCell>
              <TableCell className="whitespace-normal py-1.5">{text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function MatchApp() {
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [view, setView] = useState<View>("form");
  const [source, setSource] = useState<"llm" | "keywords">("keywords");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  const [changed, setChanged] = useState<string | null>(null);
  const [logged, setLogged] = useState<LoggedOutcome[]>([]);
  const [storage, setStorage] = useState<"memory" | "database">("memory");
  const [status, setStatus] = useState<Record<string, CardStatus>>({});
  const [drawer, setDrawer] = useState<Partner | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const loadOutcomes = async () => {
    const r = await fetch("/api/outcomes").then((r) => r.json());
    setLogged(r.outcomes);
    setStorage(r.storage);
  };
  useEffect(() => { loadOutcomes(); }, []);

  const runMatch = async (b: Brief, save: boolean) => {
    const r = await fetch("/api/match", { method: "POST", body: JSON.stringify({ brief: b, save }) }).then((r) => r.json());
    setResult(r.result);
    setStorage(r.storage);
    return r.result as MatchResult;
  };

  const submitBrief = async () => {
    if (!brief.stuck.trim()) { await confirm({ ...brief, issues: [] }); return; }
    setBusy(true);
    const r = await fetch("/api/extract", { method: "POST", body: JSON.stringify({ text: brief.stuck }) }).then((r) => r.json());
    setBrief({ ...brief, issues: r.issues });
    setSource(r.source);
    setBusy(false);
    setView("issues");
  };

  const confirm = async (b: Brief = brief) => {
    setBusy(true);
    setPrevScores({}); setChanged(null); setStatus({}); setOpen(null);
    await runMatch(b, true);
    setBusy(false);
    setView("results");
    window.scrollTo({ top: 0 });
  };

  const logOutcome = async (partnerId: string, res: OutcomeResult | "picked", note = "") => {
    await fetch("/api/outcomes", {
      method: "POST",
      body: JSON.stringify({ partnerId, category: brief.category, result: res, note, briefName: brief.productName || categoryLabel(brief.category) }),
    });
    if (res === "picked") { setStatus((s) => ({ ...s, [partnerId]: { state: "picked" } })); await loadOutcomes(); return; }
    // Remember scores before re-ranking so the change is visible.
    const before: Record<string, number> = {};
    result?.steps.forEach((s) => s.matches.forEach((m) => { before[m.partner.id] = m.score; }));
    setPrevScores(before);
    setChanged(partnerId);
    setStatus((s) => ({ ...s, [partnerId]: { state: "logged", result: res } }));
    await loadOutcomes();
    await runMatch(brief, false);
  };

  if (view === "form")
    return <BriefForm brief={brief} setBrief={setBrief} onSubmit={submitBrief} busy={busy} />;
  if (view === "issues")
    return (
      <IssueReview brief={brief} source={source} busy={busy}
        setIssues={(i: Issue[]) => setBrief({ ...brief, issues: i })}
        onBack={() => setView("form")} onConfirm={() => confirm()} />
    );

  const issueLabels = ISSUES.filter((i) => brief.issues.includes(i.id)).map((i) => i.label);
  const steps = result?.steps ?? [];
  const current = open != null ? steps[open] : undefined;
  const gapCount = steps.filter((s) => s.gap).length;

  return (
    <div className="space-y-5">
      {/* Brief summary */}
      <div>
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" onClick={() => setView("form")}>
          <ArrowLeft />Edit brief
        </Button>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{brief.productName || categoryLabel(brief.category)}</h1>
          <p className="text-sm text-muted-foreground">
            {categoryLabel(brief.category)} · {STAGES.find((s) => s.id === brief.stage)?.label} · {brief.storage} ·{" "}
            {brief.batchKg.toLocaleString("en-IN")} kg first batch · {brief.city}
          </p>
        </div>
        {issueLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Stuck on</span>
            {issueLabels.map((l) => <Badge key={l} variant="secondary">{l}</Badge>)}
          </div>
        )}
      </div>

      <div className={cn("items-start gap-5", open != null && "grid grid-cols-[minmax(0,1fr)_440px]")}>
        {/* Summary table: one row per step */}
        <Card className="gap-0 py-0">
          <Collapsible>
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardTitle className="text-base">Path to a first batch: {steps.length} steps</CardTitle>
              <CardDescription>
                {gapCount > 0
                  ? <span className="text-amber-700">{gapCount} {gapCount === 1 ? "step has" : "steps have"} a gap in the network</span>
                  : "Every step has a partner who fits"}
              </CardDescription>
              <CardAction>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="group text-muted-foreground">
                    How the score works <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </CardAction>
            </CardHeader>
            <CollapsibleContent className="border-b p-4"><ScoreHelp /></CollapsibleContent>
          </Collapsible>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-6 text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Step</TableHead>
                <TableHead className="text-muted-foreground">Best match</TableHead>
                <TableHead className="w-16 text-right text-muted-foreground">Score</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step, i) => {
                const top = step.matches[0];
                const on = i === open;
                return (
                  <TableRow key={step.type} data-state={on ? "selected" : undefined}
                    className="cursor-pointer" onClick={() => setOpen(on ? null : i)}>
                    <TableCell className="pl-6 align-top tabular-nums text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="whitespace-normal align-top">
                      <div className="font-medium">{step.title}</div>
                      {open == null && <div className="text-xs text-muted-foreground">{step.why}</div>}
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      {top ? (
                        <>
                          <div>{top.partner.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {top.partner.city}{step.matches.length > 1 && <> · {step.matches.length - 1} more</>}
                          </div>
                        </>
                      ) : <span className="text-muted-foreground">No partner fits</span>}
                    </TableCell>
                    <TableCell className="text-right align-top text-base font-semibold tabular-nums">{top?.score ?? "–"}</TableCell>
                    <TableCell className="whitespace-normal align-top">
                      {step.gap
                        ? <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><TriangleAlert />Gap</Badge>
                        : <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Covered</Badge>}
                      {step.gap && open == null && <div className="mt-1 max-w-xs text-xs text-amber-800">{step.gap}</div>}
                    </TableCell>
                    <TableCell className="pr-4 text-right align-top text-muted-foreground"><ChevronRight className="ml-auto size-4" /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {open == null && (
            <div className="border-t px-6 py-3 text-xs text-muted-foreground">
              Click a step to see the top 3 partners and why they scored the way they did.
            </div>
          )}
        </Card>

        {/* Side panel for the selected step */}
        {current && open != null && (
          <Card className="sticky top-20 max-h-[calc(100vh-6rem)] gap-4 overflow-y-auto py-4">
            <CardHeader className="px-4">
              <CardDescription className="text-xs">
                Step {open + 1} of {steps.length} · {current.passedFilters} of {current.candidates} partners can do this job
              </CardDescription>
              <CardTitle className="text-lg">{current.title}</CardTitle>
              <CardDescription>{current.why}</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm" onClick={() => setOpen(null)} aria-label="Close"><X /></Button>
              </CardAction>
            </CardHeader>

            <CardContent className="space-y-3 px-4">
              {current.gap && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold"><TriangleAlert className="size-4" />Gap in the network</div>
                  <div className="mt-0.5">{current.gap}</div>
                  {current.recruit && <div className="mt-1 text-amber-800">Recruit: {current.recruit}</div>}
                </div>
              )}

              {current.matches.map((m, idx) => (
                <PartnerCard key={m.partner.id} s={m} rank={idx + 1}
                  delta={m.partner.id === changed && prevScores[m.partner.id] != null ? m.score - prevScores[m.partner.id] : null}
                  status={status[m.partner.id] ?? { state: "none" }}
                  onDetails={() => setDrawer(m.partner)}
                  onPick={() => logOutcome(m.partner.id, "picked")}
                  onLog={(r, note) => logOutcome(m.partner.id, r, note)} />
              ))}

              <div className="flex justify-between pt-1">
                <Button variant="ghost" size="sm" disabled={open === 0} className={open === 0 ? "invisible" : ""}
                  onClick={() => setOpen(open - 1)}><ArrowLeft />Previous</Button>
                {open < steps.length - 1
                  ? <Button variant="outline" size="sm" onClick={() => setOpen(open + 1)}>Next: {steps[open + 1].title}<ArrowRight /></Button>
                  : gapCount > 0 && <Button variant="outline" size="sm" asChild><Link href="/gaps">See all network gaps<ArrowRight /></Link></Button>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {storage === "memory" && (
        <p className="text-xs text-muted-foreground">No database connected, so logged outcomes last until the server restarts.</p>
      )}

      <PartnerDrawer partner={drawer} logged={logged} onClose={() => setDrawer(null)} />
    </div>
  );
}
