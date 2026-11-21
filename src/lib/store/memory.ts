import type { Partner } from "../types";
import type { LoggedOutcome, SavedBrief, Store } from "./index";

// Lives only as long as the server process. Fine for local use without a database.
const g = globalThis as unknown as { __fbStore?: { outcomes: LoggedOutcome[]; briefs: SavedBrief[]; partners: Partner[] } };
const data = (g.__fbStore ??= { outcomes: [], briefs: [], partners: [] });
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
  async listPartners() { return data.partners; },
  async addPartner(p) {
    const row = { ...p, id: `N${String(data.partners.length + 1).padStart(2, "0")}` };
    data.partners.push(row);
    return row;
  },
  async addBrief(b) {
    const row = { ...b, id: id(), createdAt: new Date().toISOString() };
    data.briefs.push(row);
    return row;
  },
};
