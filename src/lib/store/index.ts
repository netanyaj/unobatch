import type { Brief, OutcomeResult } from "../types";
import { memoryStore } from "./memory";
import { postgresStore } from "./postgres";

export interface LoggedOutcome {
  id: string;
  partnerId: string;
  category: string;
  result: OutcomeResult | "picked";
  note: string;
  briefName: string;
  briefId: string | null; // the saved brief this pick or outcome belongs to
  createdAt: string;
}

export interface SavedBrief {
  id: string;
  createdAt: string;
  brief: Brief;
  gaps: { step: string; text: string; recruit: string }[];
}

export interface Store {
  kind: "memory" | "database";
  listOutcomes(): Promise<LoggedOutcome[]>;
  addOutcome(o: Omit<LoggedOutcome, "id" | "createdAt">): Promise<LoggedOutcome>;
  listBriefs(): Promise<SavedBrief[]>;
  getBrief(id: string): Promise<SavedBrief | null>;
  addBrief(b: Omit<SavedBrief, "id" | "createdAt">): Promise<SavedBrief>;
}

/** Uses the hosted database when one is connected, otherwise keeps things in memory. */
let pg: Store | null = null;
export function getStore(): Store {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return memoryStore;
  return (pg ??= postgresStore(url));
}
