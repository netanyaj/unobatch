import type { LoggedOutcome, SavedBrief, Store } from "./index";

// Lives only as long as the server process. Fine for local use without a database.
const g = globalThis as unknown as { __fbStore?: { outcomes: LoggedOutcome[]; briefs: SavedBrief[] } };
const data = (g.__fbStore ??= { outcomes: [], briefs: [] });
const id = () => Math.random().toString(36).slice(2, 10);

export const memoryStore: Store = {
  kind: "memory",
  async listOutcomes() { return data.outcomes; },
  async addOutcome(o) {
    const row = { ...o, id: id(), createdAt: new Date().toISOString() };
    data.outcomes.push(row);
    return row;
  },
  async listBriefs() { return data.briefs; },
  async getBrief(briefId) { return data.briefs.find((b) => b.id === briefId) ?? null; },
  async addBrief(b) {
    const row = { ...b, id: id(), createdAt: new Date().toISOString() };
    data.briefs.push(row);
    return row;
  },
};
