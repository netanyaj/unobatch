import { categoryLabel } from "./constants";
import type { BriefStage, BriefView } from "./pipeline";
import type { PartnerType, Storage } from "./types";

export interface RecruitNeed {
  key: string;
  type: PartnerType;
  category: string;
  storage: Storage;
  what: string; // e.g. "chilled dairy"
  minKg: number;
  cities: string[];
  example: string; // one gap sentence
  blocking: number; // briefs where no partner fits at all
  briefs: { id: string; name: string; stage: BriefStage; blocked: boolean }[];
}

/** Groups open gaps across briefs by who would fix them: partner type, category and storage. */
export function recruitingNeeds(views: BriefView[]): RecruitNeed[] {
  const groups = new Map<string, RecruitNeed>();
  for (const v of views) {
    const b = v.brief;
    for (const s of v.steps) {
      if (!s.gap || s.state === "done") continue;
      const key = `${s.type}|${b.category}|${b.storage}`;
      const cat = categoryLabel(b.category).toLowerCase();
      const g = groups.get(key) ?? {
        key, type: s.type, category: b.category, storage: b.storage,
        what: cat.includes(b.storage) ? cat : `${b.storage} ${cat}`,
        minKg: b.batchKg, cities: [], example: s.gap, blocking: 0, briefs: [],
      };
      g.minKg = Math.min(g.minKg, b.batchKg);
      if (!g.cities.includes(b.city)) g.cities.push(b.city);
      const blocked = s.state === "blocked";
      if (blocked) { g.blocking++; g.example = s.gap; }
      g.briefs.push({ id: v.id, name: b.productName || categoryLabel(b.category), stage: v.stage, blocked });
      groups.set(key, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.blocking - a.blocking || b.briefs.length - a.briefs.length);
}
