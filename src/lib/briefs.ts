import type { LoggedOutcome } from "./store";
import type { Partner } from "./types";

/** The latest pick or outcome for each partner on one brief. */
export function partnersForBrief(outcomes: LoggedOutcome[], briefId: string, partners: Partner[]) {
  const byId = new Map(partners.map((p) => [p.id, p]));
  const latest = new Map<string, LoggedOutcome>();
  for (const o of outcomes) if (o.briefId === briefId) latest.set(o.partnerId, o);
  return [...latest.values()].map((o) => {
    const p = byId.get(o.partnerId);
    return { partnerId: o.partnerId, name: p?.name ?? o.partnerId, type: p?.type ?? null, result: o.result, note: o.note, at: o.createdAt };
  });
}

export type BriefPartner = ReturnType<typeof partnersForBrief>[number];
