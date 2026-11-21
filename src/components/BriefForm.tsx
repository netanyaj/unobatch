"use client";

import { CATEGORIES, CITIES, CLAIMS, STAGES, STORAGE } from "@/lib/constants";
import { TEST_BRIEFS } from "@/lib/testBriefs";
import type { Brief } from "@/lib/types";

export const EMPTY_BRIEF: Brief = {
  productName: "",
  category: "high-fibre-bars",
  stage: "recipe-ready",
  claims: [],
  storage: "ambient",
  shelfLifeDays: 120,
  batchKg: 500,
  city: "Bangalore",
  stuck: "",
  issues: [],
};

const label = "block text-sm font-medium text-stone-700 mb-1";
const input =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none";

function Seg<T extends string>({ value, options, onChange }: {
  value: T; options: { id: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-stone-300 bg-white p-1">
      {options.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)}
          className={`rounded px-3 py-1.5 text-sm ${value === o.id ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function BriefForm({ brief, setBrief, onSubmit, busy }: {
  brief: Brief; setBrief: (b: Brief) => void; onSubmit: () => void; busy: boolean;
}) {
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setBrief({ ...brief, [k]: v });
  const toggleClaim = (c: string) =>
    set("claims", brief.claims.includes(c) ? brief.claims.filter((x) => x !== c) : [...brief.claims, c]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New brief</h1>
          <p className="mt-1 text-sm text-stone-600">
            Tell us about the product. We&apos;ll suggest who to work with, in what order, and why.
          </p>
        </div>
        <select
          className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-600"
          value=""
          onChange={(e) => {
            const b = TEST_BRIEFS[Number(e.target.value)];
            if (b) { const { expect: _e, ...rest } = b; void _e; setBrief({ ...rest, issues: [] }); }
          }}
        >
          <option value="">Fill with an example…</option>
          {TEST_BRIEFS.map((b, i) => <option key={i} value={i}>{b.productName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={label}>Product name</label>
          <input className={input} value={brief.productName} placeholder="e.g. Oat & date protein bar"
            onChange={(e) => set("productName", e.target.value)} />
        </div>
        <div>
          <label className={label}>Category</label>
          <select className={input} value={brief.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className={label}>Where are you now?</label>
          <Seg value={brief.stage} options={STAGES} onChange={(v) => set("stage", v)} />
        </div>

        <div className="col-span-2">
          <label className={label}>Claims on the pack</label>
          <div className="flex flex-wrap gap-2">
            {CLAIMS.map((c) => (
              <button key={c} type="button" onClick={() => toggleClaim(c)}
                className={`rounded-full border px-3 py-1 text-sm ${brief.claims.includes(c) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Storage</label>
          <Seg value={brief.storage} options={STORAGE} onChange={(v) => set("storage", v)} />
        </div>
        <div>
          <label className={label}>Target shelf life (days)</label>
          <input type="number" min={1} className={input} value={brief.shelfLifeDays}
            onChange={(e) => set("shelfLifeDays", Number(e.target.value))} />
        </div>

        <div>
          <label className={label}>First batch size (kg or litres)</label>
          <input type="number" min={1} className={input} value={brief.batchKg}
            onChange={(e) => set("batchKg", Number(e.target.value))} />
        </div>
        <div>
          <label className={label}>Your city</label>
          <select className={input} value={brief.city} onChange={(e) => set("city", e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className={label}>Where are you stuck?</label>
          <textarea rows={3} className={input} value={brief.stuck}
            placeholder="In your own words. e.g. My bar goes hard after 2 weeks."
            onChange={(e) => set("stuck", e.target.value)} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" disabled={busy}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
          {busy ? "Working…" : "Next"}
        </button>
      </div>
    </form>
  );
}
