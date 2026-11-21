import data from "@/data/partners.json";
import { match } from "./match";
import { getStore, type LoggedOutcome } from "./store";
import type { Brief, Outcome, Partner } from "./types";

// The step already says "Food technologist", so drop the repeated label from names.
export const PARTNERS = (data.partners as Partner[]).map((p) => ({ ...p, name: p.name.replace(/ \(food technologist\)$/, "") }));

export function toOutcomeMap(rows: LoggedOutcome[]): Record<string, Outcome[]> {
  const map: Record<string, Outcome[]> = {};
  for (const r of rows) {
    if (r.result === "picked") continue;
    (map[r.partnerId] ??= []).push({
      date: r.createdAt.slice(0, 7), category: r.category, result: r.result,
      note: r.note || `Logged for ${r.briefName}`, logged: true,
    });
  }
  return map;
}

export async function runMatch(brief: Brief) {
  const outcomes = await getStore().listOutcomes();
  return match(brief, PARTNERS, toOutcomeMap(outcomes));
}
