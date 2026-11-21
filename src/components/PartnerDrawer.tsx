"use client";

import { TYPE_LABEL, categoryLabel } from "@/lib/constants";
import type { LoggedOutcome } from "@/lib/store";
import type { Partner } from "@/lib/types";
import { RESULT_LABEL } from "./PartnerCard";

const RESULT_TONE: Record<string, string> = {
  went_ahead: "bg-emerald-100 text-emerald-800",
  accepted: "bg-sky-100 text-sky-800",
  declined: "bg-stone-200 text-stone-700",
  didnt_work: "bg-rose-100 text-rose-800",
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-stone-100 py-2 text-sm">
      <div className="text-stone-500">{k}</div>
      <div className="col-span-2">{v}</div>
    </div>
  );
}

export default function PartnerDrawer({ partner, logged, onClose }: {
  partner: Partner | null; logged: LoggedOutcome[]; onClose: () => void;
}) {
  if (!partner) return null;
  const p = partner;
  const mine = logged.filter((o) => o.partnerId === p.id && o.result !== "picked");
  const history = [
    ...mine.map((o) => ({ date: o.createdAt.slice(0, 10), category: o.category, result: o.result, note: o.note || `For ${o.briefName}`, logged: true })),
    ...[...p.pastOutcomes].reverse().map((o) => ({ ...o, logged: false })),
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <aside className="h-full w-[440px] overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-500">{TYPE_LABEL[p.type]}</div>
            <h2 className="text-xl font-semibold">{p.name}</h2>
          </div>
          <button onClick={onClose} className="rounded px-2 py-1 text-stone-500 hover:bg-stone-100" aria-label="Close">✕</button>
        </div>

        <div className="mt-4">
          <Row k="City" v={p.city} />
          <Row k="Categories" v={p.categories.map(categoryLabel).join(", ")} />
          <Row k="Can do" v={p.capabilities.join(", ")} />
          <Row k="Storage" v={p.storage.join(", ")} />
          {p.minBatchKg != null && (
            <Row k="Batch size" v={`${p.minBatchKg.toLocaleString("en-IN")} – ${(p.maxBatchKg ?? 0).toLocaleString("en-IN")} kg`} />
          )}
          <Row k="Certifications" v={p.certifications.length ? p.certifications.join(", ") : "None listed"} />
          <Row k="Current workload" v={{ low: "Low: can start soon", medium: "Medium", full: "Full: booked up" }[p.workload]} />
        </div>

        <h3 className="mt-6 text-sm font-semibold">Past intros</h3>
        {history.length === 0 && <p className="mt-2 text-sm text-stone-500">No intros yet.</p>}
        <ul className="mt-2 space-y-2">
          {history.map((o, i) => (
            <li key={i} className="rounded-md border border-stone-200 p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${RESULT_TONE[o.result]}`}>
                  {RESULT_LABEL[o.result as keyof typeof RESULT_LABEL]}
                </span>
                <span className="text-xs text-stone-500">{o.date} · {categoryLabel(o.category)}</span>
                {o.logged && <span className="ml-auto text-xs text-stone-400">logged here</span>}
              </div>
              <div className="mt-1 text-stone-700">{o.note}</div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
