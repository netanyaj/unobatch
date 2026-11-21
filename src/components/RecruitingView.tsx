"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CITIES, STORAGE, TYPE_LABEL } from "@/lib/constants";
import { STAGE_LABEL } from "@/lib/pipeline";
import type { RecruitNeed } from "@/lib/recruiting";
import type { Partner, PartnerType, Storage, Workload } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CircleCheck, Plus, TriangleAlert } from "lucide-react";

type Draft = {
  name: string; type: PartnerType; city: string; categories: string[]; storage: Storage[];
  capabilities: string; certifications: string; minBatchKg: string; maxBatchKg: string; workload: Workload;
};

const usesBatch = (t: PartnerType) => t !== "technologist" && t !== "lab";

function draftFor(n?: RecruitNeed): Draft {
  const t = n?.type ?? "manufacturer";
  return {
    name: "", type: t, city: n?.cities[0] ?? "Bangalore",
    categories: n ? [n.category] : [], storage: n ? [n.storage] : ["ambient"],
    capabilities: "", certifications: t === "lab" ? "NABL-accredited" : "FSSAI",
    minBatchKg: n && usesBatch(t) ? String(Math.max(50, Math.floor(n.minKg / 2 / 50) * 50)) : "",
    maxBatchKg: n && t === "manufacturer" ? String(Math.max(2000, n.minKg * 10)) : "",
    workload: "low",
  };
}

function Toggle<T extends string>({ value, options, onChange }: { value: T[]; options: { id: T; label: string }[]; onChange: (v: T[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <Button key={o.id} type="button" size="sm" variant={on ? "default" : "outline"} className="h-7 rounded-full px-2.5 text-xs"
            onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}>{o.label}</Button>
        );
      })}
    </div>
  );
}

type Helped = { id: string; name: string; step: string; unblocked: boolean }[];

export default function RecruitingView() {
  const params = useSearchParams();
  const focus = params.get("need");
  const [needs, setNeeds] = useState<RecruitNeed[] | null>(null);
  const [added, setAdded] = useState<Partner[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ name: string; helped: Helped } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/recruiting").then((r) => r.json());
    setNeeds(r.needs);
    setAdded(r.added);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft) return;
    setSaving(true); setError(null);
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const r = await fetch("/api/partners", {
      method: "POST",
      body: JSON.stringify({
        ...draft, capabilities: split(draft.capabilities), certifications: split(draft.certifications),
        minBatchKg: usesBatch(draft.type) ? draft.minBatchKg : null,
        maxBatchKg: usesBatch(draft.type) ? draft.maxBatchKg : null,
      }),
    });
    const body = await r.json();
    setSaving(false);
    if (!r.ok) { setError(body.error); return; }
    setDone({ name: body.partner.name, helped: body.helped });
    setDraft(null);
    load();
  };

  if (!needs) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => draft && setDraft({ ...draft, [k]: v });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recruiting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gaps from every brief on the board, grouped by the partner that would close them. Add a partner and the briefs waiting on it are matched again.
          </p>
        </div>
        <Button variant="outline" onClick={() => { setDone(null); setDraft(draftFor()); }}><Plus />Add a partner</Button>
      </div>

      {done && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <div className="font-medium">{done.name} is in the network.</div>
            {done.helped.length === 0 ? (
              <div>No brief on the board ranks them in its top 3 yet.</div>
            ) : (
              <ul className="space-y-0.5">
                {done.helped.map((h) => (
                  <li key={h.id + h.step}>
                    <Link href={`/?brief=${h.id}`} className="font-medium underline">{h.name}</Link>
                    {h.unblocked ? ` can now pick a ${h.step.toLowerCase()}.` : `: ${h.step.toLowerCase()} gap closed.`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Card className="py-0">
        {needs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No gaps on the board right now.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-muted-foreground">Recruit</TableHead>
                <TableHead className="text-muted-foreground">Why</TableHead>
                <TableHead className="text-muted-foreground">Briefs waiting</TableHead>
                <TableHead className="w-32 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {needs.map((n) => (
                <TableRow key={n.key} data-state={n.key === focus ? "selected" : undefined}>
                  <TableCell className="whitespace-normal py-3 pl-6 align-top">
                    <Badge variant="secondary" className="mb-1">{TYPE_LABEL[n.type]}</Badge>
                    <div className="font-medium first-letter:uppercase">{n.what}</div>
                    <div className="text-xs text-muted-foreground">
                      {usesBatch(n.type) && <>Batches from {n.minKg.toLocaleString("en-IN")} kg · </>}Near {n.cities.join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm whitespace-normal py-3 align-top">{n.example}</TableCell>
                  <TableCell className="whitespace-normal py-3 align-top">
                    <ul className="space-y-1">
                      {n.briefs.map((b) => (
                        <li key={b.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                          <Link href={`/?brief=${b.id}`} className="hover:underline">{b.name}</Link>
                          {b.blocked
                            ? <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><TriangleAlert />No fit</Badge>
                            : <Badge variant="outline" className="text-muted-foreground">Weak fit</Badge>}
                          <span className="text-xs text-muted-foreground">{STAGE_LABEL[b.stage]}</span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="py-3 pr-6 text-right align-top">
                    <Button size="sm" variant={n.key === focus ? "default" : "outline"} onClick={() => { setDone(null); setDraft(draftFor(n)); }}>
                      <Plus />Add partner
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {added.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Added by the team: {added.map((p) => `${p.name} (${TYPE_LABEL[p.type].toLowerCase()}, ${p.city})`).join(", ")}
        </div>
      )}

      <Sheet open={!!draft} onOpenChange={(o) => { if (!o) setDraft(null); }}>
        <SheetContent className="w-[480px] overflow-y-auto sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Add a partner</SheetTitle>
            <SheetDescription>Filled in from the gap. Change anything that doesn&apos;t match the partner you signed.</SheetDescription>
          </SheetHeader>
          {draft && (
            <div className="grid gap-4 px-4">
              <div className="grid gap-2">
                <Label htmlFor="pname">Name</Label>
                <Input id="pname" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hebbal Dairy Co-packers" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={draft.type} onValueChange={(v) => set("type", v as PartnerType)}>
                    <SelectTrigger className="w-full" aria-label="Type"><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(TYPE_LABEL) as PartnerType[]).map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Select value={draft.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger className="w-full" aria-label="City"><SelectValue /></SelectTrigger>
                    <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categories</Label>
                <Toggle value={draft.categories} options={CATEGORIES} onChange={(v) => set("categories", v)} />
              </div>
              <div className="grid gap-2">
                <Label>Storage they handle</Label>
                <Toggle value={draft.storage} options={STORAGE} onChange={(v) => set("storage", v)} />
              </div>
              {usesBatch(draft.type) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="min">Smallest batch (kg)</Label>
                    <Input id="min" type="number" value={draft.minBatchKg} onChange={(e) => set("minBatchKg", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max">Largest batch (kg)</Label>
                    <Input id="max" type="number" value={draft.maxBatchKg} onChange={(e) => set("maxBatchKg", e.target.value)} />
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="caps">What they can do</Label>
                <Input id="caps" value={draft.capabilities} onChange={(e) => set("capabilities", e.target.value)} placeholder="Comma separated, e.g. cup filling, small runs" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="certs">Certifications</Label>
                <Input id="certs" value={draft.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="Comma separated" />
              </div>
              <div className="grid gap-2">
                <Label>Workload right now</Label>
                <div className="flex gap-1.5">
                  {(["low", "medium", "full"] as Workload[]).map((w) => (
                    <Button key={w} type="button" size="sm" variant={draft.workload === w ? "default" : "outline"} className={cn("capitalize")} onClick={() => set("workload", w)}>{w}</Button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
          <SheetFooter>
            <Button onClick={save} disabled={saving}>{saving ? "Adding…" : "Add to network and re-match"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
