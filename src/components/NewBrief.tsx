"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brief, Issue } from "@/lib/types";
import BriefForm, { EMPTY_BRIEF } from "./BriefForm";
import IssueReview from "./IssueReview";

/** Brief form, then a check of the tags, then the brief lands on the board with its panel open. */
export default function NewBrief() {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [step, setStep] = useState<"form" | "issues">("form");
  const [source, setSource] = useState<"llm" | "keywords">("keywords");
  const [busy, setBusy] = useState(false);

  const save = async (b: Brief) => {
    setBusy(true);
    const r = await fetch("/api/match", { method: "POST", body: JSON.stringify({ brief: b, save: true }) }).then((r) => r.json());
    router.push(r.briefId ? `/?brief=${r.briefId}` : "/");
  };

  const submit = async () => {
    if (!brief.stuck.trim()) return save({ ...brief, issues: [] });
    setBusy(true);
    const r = await fetch("/api/extract", { method: "POST", body: JSON.stringify({ text: brief.stuck }) }).then((r) => r.json());
    setBrief({ ...brief, issues: r.issues });
    setSource(r.source);
    setBusy(false);
    setStep("issues");
  };

  if (step === "form") return <BriefForm brief={brief} setBrief={setBrief} onSubmit={submit} busy={busy} />;
  return (
    <IssueReview brief={brief} source={source} busy={busy}
      setIssues={(i: Issue[]) => setBrief({ ...brief, issues: i })}
      onBack={() => setStep("form")} onConfirm={() => save(brief)} />
  );
}
