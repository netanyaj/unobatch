"use client";

import { ISSUES, TYPE_LABEL } from "@/lib/constants";
import type { Brief, Issue } from "@/lib/types";

export default function IssueReview({ brief, setIssues, source, onBack, onConfirm, busy }: {
  brief: Brief; setIssues: (i: Issue[]) => void; source: "llm" | "keywords";
  onBack: () => void; onConfirm: () => void; busy: boolean;
}) {
  const toggle = (id: Issue) =>
    setIssues(brief.issues.includes(id) ? brief.issues.filter((x) => x !== id) : [...brief.issues, id]);
  const chosen = ISSUES.filter((i) => brief.issues.includes(i.id));

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Here&apos;s what we understood</h1>
      <p className="mt-1 text-sm text-stone-600">Check this before we match. Tap to add or remove.</p>

      <blockquote className="mt-5 rounded-md border-l-4 border-stone-300 bg-stone-50 px-4 py-3 text-sm italic text-stone-700">
        “{brief.stuck}”
      </blockquote>
      <p className="mt-2 text-xs text-stone-500">
        {source === "llm"
          ? "Read by an AI model. It can only choose from the list below; it never picks partners."
          : "Matched by keywords (no AI key set). It can only choose from the list below."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {ISSUES.map((i) => {
          const on = brief.issues.includes(i.id);
          return (
            <button key={i.id} type="button" onClick={() => toggle(i.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"}`}>
              {on ? "✓ " : "+ "}{i.label}
            </button>
          );
        })}
      </div>

      {chosen.length > 0 && (
        <div className="mt-6 rounded-md bg-stone-50 p-4 text-sm text-stone-700">
          <div className="mb-1 font-medium">This means you&apos;ll likely need:</div>
          <ul className="list-disc space-y-0.5 pl-5">
            {chosen.map((i) => (
              <li key={i.id}>
                {i.label}: {[...new Set(i.needs)].map((t) => TYPE_LABEL[t].toLowerCase()).join(" and ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-md px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">
          ← Edit brief
        </button>
        <button type="button" onClick={onConfirm} disabled={busy}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
          {busy ? "Matching…" : "Find partners"}
        </button>
      </div>
    </div>
  );
}
