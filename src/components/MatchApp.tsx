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
    <details className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
      <summary className="cursor-pointer font-medium">How the score works</summary>
      <p className="mt-3 text-stone-600">
        First we remove partners who can&apos;t do the job: wrong category, can&apos;t handle your storage, or your
        batch is outside their range. Then we score the rest out of 100:
      </p>
      <table className="mt-2 w-full">
        <tbody>
          {FACTORS.map(([k, text]) => (
            <tr key={k} className="border-t border-stone-100">
              <td className="w-12 py-1.5 font-medium tabular-nums">{WEIGHTS[k]}</td>
              <td className="py-1.5 text-stone-700">{text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
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
    setPrevScores({}); setChanged(null); setStatus({});
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <button onClick={() => setView("form")} className="text-sm text-stone-500 hover:text-stone-800">← Edit brief</button>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{brief.productName || categoryLabel(brief.category)}</h1>
          <p className="mt-1 text-sm text-stone-600">
            {categoryLabel(brief.category)} · {STAGES.find((s) => s.id === brief.stage)?.label} · {brief.storage} ·{" "}
            {brief.shelfLifeDays} days shelf life · {brief.batchKg.toLocaleString("en-IN")} kg first batch · {brief.city}
            {brief.claims.length > 0 && <> · {brief.claims.join(", ")}</>}
          </p>
          {issueLabels.length > 0 && (
            <p className="mt-1 text-sm text-stone-600">Stuck on: {issueLabels.join(", ")}</p>
          )}
        </div>
        {storage === "memory" && (
          <div className="max-w-xs rounded-md border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500">
            No database connected, so logged outcomes last until the server restarts.
          </div>
        )}
      </div>

      {result && result.gaps.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-900">Gaps in the network for this brief</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
          <Link href="/gaps" className="mt-2 inline-block text-sm font-medium text-amber-900 underline">
            See all network gaps →
          </Link>
        </div>
      )}

      <ScoreHelp />

      <ol className="space-y-6">
        {result?.steps.map((step, i) => (
          <li key={step.type} className="relative rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex items-baseline gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white">{i + 1}</span>
              <div className="flex-1">
                <h2 className="font-semibold">{step.title}</h2>
                <p className="text-sm text-stone-600">{step.why}</p>
              </div>
              <span className="text-xs text-stone-500">
                {step.passedFilters} of {step.candidates} passed the filters
              </span>
            </div>

            {step.gap && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <span className="font-medium">Gap:</span> {step.gap}
              </div>
            )}

            {step.matches.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {step.matches.map((m, idx) => (
                  <PartnerCard key={m.partner.id} s={m} rank={idx + 1}
                    delta={m.partner.id === changed && prevScores[m.partner.id] != null ? m.score - prevScores[m.partner.id] : null}
                    status={status[m.partner.id] ?? { state: "none" }}
                    onDetails={() => setDrawer(m.partner)}
                    onPick={() => logOutcome(m.partner.id, "picked")}
                    onLog={(r, note) => logOutcome(m.partner.id, r, note)} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>

      <PartnerDrawer partner={drawer} logged={logged} onClose={() => setDrawer(null)} />
    </div>
  );
}
