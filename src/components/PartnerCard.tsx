"use client";

import { useState } from "react";
import type { OutcomeResult, ScoredPartner } from "@/lib/types";

export const RESULT_LABEL: Record<OutcomeResult, string> = {
  accepted: "Intro accepted",
  declined: "Declined",
  went_ahead: "Project went ahead",
  didnt_work: "Didn't work",
};

export type CardStatus = { state: "none" } | { state: "picked" } | { state: "logged"; result: OutcomeResult };

function Chip({ label, points, max, good }: { label: string; points: number; max: number; good: boolean }) {
  const tone = good
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : points === 0
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-stone-200 bg-stone-50 text-stone-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tone}`}
      title={`${points} of ${max} points`}>
      {label}
      <span className="opacity-60">+{points}</span>
    </span>
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

  return (
    <div className={`flex flex-col rounded-lg border bg-white p-4 ${status.state !== "none" ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-stone-500">#{rank} · {p.city}</div>
          <button onClick={onDetails} className="truncate text-left font-medium hover:underline">{p.name}</button>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{s.score}</div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400">of 100</div>
          {delta != null && delta !== 0 && (
            <div className={`text-xs font-medium ${delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} since last outcome
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {s.reasons.map((r, i) => <Chip key={i} {...r} />)}
      </div>
      {s.warnings.map((w, i) => (
        <div key={i} className="mt-2 text-xs text-amber-800">⚠ {w}</div>
      ))}

      <div className="mt-auto pt-4">
        {status.state === "none" && (
          <div className="flex gap-2">
            <button onClick={onPick} className="flex-1 rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700">Pick</button>
            <button onClick={onDetails} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Details</button>
          </div>
        )}
        {status.state === "picked" && (
          <div className="space-y-2 rounded-md bg-stone-50 p-2">
            <div className="text-xs font-medium text-stone-700">Picked. How did it go?</div>
            <select value={result} onChange={(e) => setResult(e.target.value as OutcomeResult)}
              className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm">
              {(Object.keys(RESULT_LABEL) as OutcomeResult[]).map((r) => <option key={r} value={r}>{RESULT_LABEL[r]}</option>)}
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why? (optional)"
              className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm" />
            <button disabled={saving}
              onClick={async () => { setSaving(true); await onLog(result, note); setSaving(false); }}
              className="w-full rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50">
              {saving ? "Saving…" : "Log outcome"}
            </button>
          </div>
        )}
        {status.state === "logged" && (
          <div className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-700">
            Logged: <span className="font-medium">{RESULT_LABEL[status.result]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
