"use client";

import { CATEGORIES, CITIES, CLAIMS, STAGES, STORAGE } from "@/lib/constants";
import { TEST_BRIEFS } from "@/lib/testBriefs";
import type { Brief } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

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

/** A row of buttons where one is chosen. */
function Choice<T extends string>({ value, options, onChange }: {
  value: T; options: { id: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button key={o.id} type="button" size="sm" variant={value === o.id ? "default" : "outline"} onClick={() => onChange(o.id)}>
          {o.label}
        </Button>
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">New brief</CardTitle>
          <CardDescription>Tell us about the product. We&apos;ll suggest who to work with, in what order, and why.</CardDescription>
          <CardAction>
            <Select value="" onValueChange={(v) => {
              const b = TEST_BRIEFS[Number(v)];
              if (b) { const { expect: _e, ...rest } = b; void _e; setBrief({ ...rest, issues: [] }); }
            }}>
              <SelectTrigger size="sm" aria-label="Fill with an example"><SelectValue placeholder="Fill with an example…" /></SelectTrigger>
              <SelectContent align="end">
                {TEST_BRIEFS.map((b, i) => <SelectItem key={i} value={String(i)}>{b.productName}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-x-5 gap-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" value={brief.productName} placeholder="e.g. Oat & date protein bar"
              onChange={(e) => set("productName", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={brief.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="w-full" aria-label="Category"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="col-span-2 grid gap-2">
            <Label>Where are you now?</Label>
            <Choice value={brief.stage} options={STAGES} onChange={(v) => set("stage", v)} />
          </div>

          <div className="col-span-2 grid gap-2">
            <Label>Claims on the pack</Label>
            <div className="flex flex-wrap gap-2">
              {CLAIMS.map((c) => {
                const on = brief.claims.includes(c);
                return (
                  <Button key={c} type="button" size="sm" variant={on ? "default" : "outline"} className="rounded-full" onClick={() => toggleClaim(c)}>
                    {on && <Check />}{c}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Storage</Label>
            <Choice value={brief.storage} options={STORAGE} onChange={(v) => set("storage", v)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shelf">Target shelf life (days)</Label>
            <Input id="shelf" type="number" min={1} value={brief.shelfLifeDays}
              onChange={(e) => set("shelfLifeDays", Number(e.target.value))} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="batch">First batch size (kg or litres)</Label>
            <Input id="batch" type="number" min={1} value={brief.batchKg}
              onChange={(e) => set("batchKg", Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Your city</Label>
            <Select value={brief.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger className="w-full" aria-label="Your city"><SelectValue /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="col-span-2 grid gap-2">
            <Label htmlFor="stuck">Where are you stuck?</Label>
            <Textarea id="stuck" rows={3} value={brief.stuck}
              placeholder="In your own words. e.g. My bar goes hard after 2 weeks."
              onChange={(e) => set("stuck", e.target.value)} />
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" disabled={busy}>{busy ? "Working…" : "Next"}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
