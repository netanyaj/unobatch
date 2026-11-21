"use client";

import { ISSUES, TYPE_LABEL } from "@/lib/constants";
import type { Brief, Issue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Plus } from "lucide-react";

export default function IssueReview({ brief, setIssues, source, onBack, onConfirm, busy }: {
  brief: Brief; setIssues: (i: Issue[]) => void; source: "llm" | "keywords";
  onBack: () => void; onConfirm: () => void; busy: boolean;
}) {
  const toggle = (id: Issue) =>
    setIssues(brief.issues.includes(id) ? brief.issues.filter((x) => x !== id) : [...brief.issues, id]);
  const chosen = ISSUES.filter((i) => brief.issues.includes(i.id));

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Here&apos;s what we understood</CardTitle>
        <CardDescription>Check this before we match. Tap to add or remove.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <blockquote className="rounded-md border-l-4 bg-muted px-4 py-3 text-sm italic">“{brief.stuck}”</blockquote>
          <p className="mt-2 text-xs text-muted-foreground">
            {source === "llm"
              ? "Read by an AI model. It can only choose from the list below; it never picks partners."
              : "Matched by keywords (no AI key set). It can only choose from the list below."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ISSUES.map((i) => {
            const on = brief.issues.includes(i.id);
            return (
              <Button key={i.id} type="button" size="sm" variant={on ? "default" : "outline"}
                className={on ? "rounded-full bg-emerald-700 hover:bg-emerald-700/90" : "rounded-full text-muted-foreground"}
                onClick={() => toggle(i.id)}>
                {on ? <Check /> : <Plus />}{i.label}
              </Button>
            );
          })}
        </div>

        {chosen.length > 0 && (
          <div className="rounded-md bg-muted p-4 text-sm">
            <div className="mb-1 font-medium">This means you&apos;ll likely need:</div>
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
              {chosen.map((i) => (
                <li key={i.id}>
                  {i.label}: {[...new Set(i.needs)].map((t) => TYPE_LABEL[t].toLowerCase()).join(" and ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button type="button" variant="ghost" onClick={onBack}><ArrowLeft />Edit brief</Button>
        <Button type="button" onClick={onConfirm} disabled={busy}>{busy ? "Matching…" : "Match and add to pipeline"}</Button>
      </CardFooter>
    </Card>
  );
}
