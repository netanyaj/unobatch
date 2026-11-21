import { TYPE_LABEL } from "./constants";
import { partnersForBrief, type BriefPartner } from "./briefs";
import { match } from "./match";
import { toOutcomeMap } from "./network";
import type { LoggedOutcome, SavedBrief } from "./store";
import type { Brief, MatchResult, Partner, PartnerType } from "./types";

/** Where one step of a brief stands. */
export type StepState = "to_pick" | "intro_sent" | "accepted" | "done" | "blocked";

/** Which board column a brief sits in. */
export type BriefStage = "new" | "intros" | "in_progress" | "blocked" | "done";

export const STAGE_ORDER: BriefStage[] = ["new", "intros", "in_progress", "blocked", "done"];
export const STAGE_LABEL: Record<BriefStage, string> = {
  new: "New",
  intros: "Intros out",
  in_progress: "In progress",
  blocked: "Blocked by a gap",
  done: "Done",
};
export const STAGE_HINT: Record<BriefStage, string> = {
  new: "Matched, nobody picked yet",
  intros: "Waiting to hear back",
  in_progress: "Some steps done, more to pick",
  blocked: "Only gaps left: recruit to unblock",
  done: "Every step went ahead",
};
export const STATE_LABEL: Record<StepState, string> = {
  to_pick: "To pick",
  intro_sent: "Intro sent",
  accepted: "Accepted",
  done: "Went ahead",
  blocked: "No partner fits",
};

export interface StepView {
  type: PartnerType;
  title: string;
  state: StepState;
  gap: string | null;
  best: { id: string; name: string; score: number } | null;
  pick: BriefPartner | null; // the latest pick or outcome for this step, if any
}

export interface BriefView {
  id: string;
  createdAt: string;
  brief: Brief;
  steps: StepView[];
  stage: BriefStage;
  next: string; // one line on what to do next
  picks: BriefPartner[];
}

export function viewBrief(saved: SavedBrief, result: MatchResult, picks: BriefPartner[]): BriefView {
  const steps: StepView[] = result.steps.map((s) => {
    // Latest pick or outcome for a partner of this type on this brief.
    const mine = picks.filter((p) => p.type === s.type).sort((a, b) => a.at.localeCompare(b.at));
    const pick = mine.at(-1) ?? null;
    let state: StepState = s.matches.length === 0 ? "blocked" : "to_pick";
    if (mine.some((p) => p.result === "went_ahead")) state = "done";
    else if (pick?.result === "picked") state = "intro_sent";
    else if (pick?.result === "accepted") state = "accepted";
    const top = s.matches[0];
    return {
      type: s.type, title: s.title, state, gap: s.gap, pick,
      best: top ? { id: top.partner.id, name: top.partner.name, score: top.score } : null,
    };
  });

  const open = steps.filter((s) => s.state !== "done");
  const waiting = steps.filter((s) => s.state === "intro_sent" || s.state === "accepted");
  const pickable = open.filter((s) => s.state === "to_pick");
  let stage: BriefStage;
  if (open.length === 0) stage = "done";
  else if (waiting.length > 0) stage = "intros";
  else if (pickable.length === 0) stage = "blocked";
  else if (picks.length > 0) stage = "in_progress";
  else stage = "new";

  let next: string;
  if (stage === "done") next = "All steps went ahead";
  else if (waiting.length > 0) next = `Waiting on ${waiting[0].pick!.name}${waiting.length > 1 ? ` and ${waiting.length - 1} more` : ""}`;
  else if (pickable.length > 0) next = `Pick a ${TYPE_LABEL[pickable[0].type].toLowerCase()}`;
  else next = `Recruit a ${TYPE_LABEL[open[0].type].toLowerCase()}`;

  return { id: saved.id, createdAt: saved.createdAt, brief: saved.brief, steps, stage, next, picks };
}

/** Match every saved brief against the current network and work out where it stands. */
export function viewAll(briefs: SavedBrief[], outcomes: LoggedOutcome[], partners: Partner[]): BriefView[] {
  const logged = toOutcomeMap(outcomes);
  return [...briefs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => viewBrief(b, match(b.brief, partners, logged), partnersForBrief(outcomes, b.id, partners)));
}
