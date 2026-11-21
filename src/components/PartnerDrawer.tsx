"use client";

import { TYPE_LABEL, categoryLabel } from "@/lib/constants";
import type { LoggedOutcome } from "@/lib/store";
import type { Partner } from "@/lib/types";
import { RESULT_LABEL } from "./PartnerCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const RESULT_TONE: Record<string, string> = {
  went_ahead: "bg-emerald-100 text-emerald-800",
  accepted: "bg-sky-100 text-sky-800",
  declined: "bg-stone-200 text-stone-700",
  didnt_work: "bg-rose-100 text-rose-800",
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 py-2 text-sm">
        <div className="text-muted-foreground">{k}</div>
        <div className="col-span-2">{v}</div>
      </div>
      <Separator />
    </>
  );
}

export default function PartnerDrawer({ partner, logged, onClose }: {
  partner: Partner | null; logged: LoggedOutcome[]; onClose: () => void;
}) {
  return (
    <Sheet open={!!partner} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-[440px] overflow-y-auto sm:max-w-[440px]">
        {partner && <Body p={partner} logged={logged} />}
      </SheetContent>
    </Sheet>
  );
}

function Body({ p, logged }: { p: Partner; logged: LoggedOutcome[] }) {
  const mine = logged.filter((o) => o.partnerId === p.id && o.result !== "picked");
  const history = [
    ...mine.map((o) => ({ date: o.createdAt.slice(0, 10), category: o.category, result: o.result, note: o.note || `For ${o.briefName}`, logged: true })),
    ...[...p.pastOutcomes].reverse().map((o) => ({ ...o, logged: false })),
  ];

  return (
    <>
      <SheetHeader className="pb-0">
        <SheetDescription className="text-xs uppercase tracking-wide">{TYPE_LABEL[p.type]}</SheetDescription>
        <SheetTitle className="text-xl">{p.name}</SheetTitle>
      </SheetHeader>

      <div className="px-4">
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

      <div className="px-4 pb-6">
        <h3 className="text-sm font-semibold">Past intros</h3>
        {history.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No intros yet.</p>}
        <ul className="mt-2 space-y-2">
          {history.map((o, i) => (
            <li key={i}>
              <Card className="gap-1 p-3 text-sm shadow-none">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={RESULT_TONE[o.result]}>
                    {RESULT_LABEL[o.result as keyof typeof RESULT_LABEL]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{o.date} · {categoryLabel(o.category)}</span>
                  {o.logged && <span className="ml-auto text-xs text-muted-foreground">logged here</span>}
                </div>
                <div>{o.note}</div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
