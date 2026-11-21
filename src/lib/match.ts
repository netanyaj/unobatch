import { CLAIM_CAPABILITIES, ISSUES, REGIONS, TYPE_LABEL, categoryLabel } from "./constants";
import type { Brief, MatchResult, Outcome, Partner, PartnerType, Reason, ScoredPartner, Step } from "./types";

/**
 * Score weights. Each factor has one plain-sentence explanation (see README).
 * They add up to 100.
 */
export const WEIGHTS = {
  experience: 25, // has done this product category, and how often it went ahead
  capability: 20, // has the specific skills this brief needs
  location: 15, // same city, or close by
  workload: 15, // has room to take the project now
  history: 10, // how past intros went (went ahead / didn't work / declined)
  certification: 10, // certifications that matter for this partner type
  batchFit: 5, // first batch sits comfortably inside their range
};

/* ---------------- Project path ---------------- */

const BASE_PATH: Record<Brief["stage"], PartnerType[]> = {
  idea: ["technologist", "ingredient-supplier", "lab", "pilot-facility", "packaging", "manufacturer"],
  "recipe-ready": ["ingredient-supplier", "lab", "pilot-facility", "packaging", "manufacturer"],
  "samples-made": ["lab", "pilot-facility", "packaging", "manufacturer"],
  "ready-to-scale": ["lab", "packaging", "manufacturer"],
};
const ORDER: PartnerType[] = ["technologist", "ingredient-supplier", "lab", "pilot-facility", "packaging", "manufacturer"];

const STEP_WHY: Record<PartnerType, (b: Brief) => string> = {
  technologist: () => "Fix the recipe before spending on trials.",
  "ingredient-supplier": () => "Source the ingredients the recipe and claims depend on.",
  lab: (b) => `Test shelf life (target ${b.shelfLifeDays} days) and back up the label claims.`,
  "pilot-facility": () => "Run a small trial batch on real equipment before committing to a factory.",
  packaging: () => "Packaging that suits the storage and shelf life, at a minimum order you can afford.",
  manufacturer: (b) => `Make the first production batch of ${b.batchKg.toLocaleString("en-IN")} kg.`,
};

export function buildPath(brief: Brief): { type: PartnerType; reason: string }[] {
  const steps = new Set<PartnerType>(BASE_PATH[brief.stage]);
  const added: Partial<Record<PartnerType, string>> = {};
  for (const id of brief.issues) {
    const issue = ISSUES.find((i) => i.id === id);
    if (!issue) continue;
    for (const t of issue.needs) {
      if (!steps.has(t)) added[t] = issue.label;
      steps.add(t);
    }
  }
  return ORDER.filter((t) => steps.has(t)).map((t) => ({
    type: t,
    reason: added[t] ? `${STEP_WHY[t](brief)} Added because of: ${added[t].toLowerCase()}.` : STEP_WHY[t](brief),
  }));
}

/* ---------------- Needed capabilities ---------------- */

export function neededCapabilities(brief: Brief): string[] {
  const caps = new Set<string>();
  for (const c of brief.claims) (CLAIM_CAPABILITIES[c] ?? []).forEach((x) => caps.add(x));
  for (const id of brief.issues) ISSUES.find((i) => i.id === id)?.capabilities.forEach((x) => caps.add(x));
  if (brief.shelfLifeDays >= 90) caps.add("shelf-life study");
  return [...caps];
}

/* ---------------- Hard filters ---------------- */

const usesBatch = (t: PartnerType) => t !== "technologist" && t !== "lab";

function batchCheck(p: Partner, kg: number): string | null {
  if (!usesBatch(p.type) || p.minBatchKg == null) return null;
  if (p.type === "manufacturer") {
    if (kg < p.minBatchKg) return `min ${p.minBatchKg.toLocaleString("en-IN")} kg`;
    if (p.maxBatchKg != null && kg > p.maxBatchKg) return `max ${p.maxBatchKg.toLocaleString("en-IN")} kg`;
    return null;
  }
  // Pilot runs, ingredient orders and packaging runs only need the minimum to fit.
  if (kg < p.minBatchKg) return `min ${p.minBatchKg.toLocaleString("en-IN")} kg`;
  return null;
}

export function hardFilter(p: Partner, brief: Brief): string | null {
  if (!p.categories.includes(brief.category)) return "category";
  // Ingredients ship on their own terms, so storage only filters the other types.
  if (p.type !== "ingredient-supplier" && !p.storage.includes(brief.storage)) return "storage";
  if (batchCheck(p, brief.batchKg)) return "batch";
  return null;
}

/* ---------------- Scoring ---------------- */

const region = (city: string) => REGIONS.findIndex((r) => r.includes(city));

export function historyFor(p: Partner, logged: Outcome[]): Outcome[] {
  return [...p.pastOutcomes, ...logged];
}

/** Keep only the needed skills that this type of partner could offer at all. */
export function neededForType(type: PartnerType, needed: string[], all: Partner[]): string[] {
  const offered = new Set(all.filter((p) => p.type === type).flatMap((p) => p.capabilities));
  return needed.filter((c) => offered.has(c));
}

export function scorePartner(p: Partner, brief: Brief, needed: string[], logged: Outcome[]): ScoredPartner {
  const reasons: Reason[] = [];
  const warnings: string[] = [];
  const history = historyFor(p, logged);
  const inCat = history.filter((o) => o.category === brief.category);

  // Experience: listed for the category (15) + up to 10 for past projects in it that went ahead.
  const wentAheadInCat = inCat.filter((o) => o.result === "went_ahead").length;
  const exp = 15 + Math.min(10, wentAheadInCat * 5);
  reasons.push({
    label: wentAheadInCat
      ? `${wentAheadInCat} ${categoryLabel(brief.category).toLowerCase()} project${wentAheadInCat > 1 ? "s" : ""} went ahead`
      : `Works in ${categoryLabel(brief.category).toLowerCase()}`,
    points: exp, max: WEIGHTS.experience, good: true,
  });

  // Capability: share of needed capabilities this partner type could cover.
  const has = p.capabilities.filter((c) => needed.includes(c));
  let cap: number;
  if (needed.length === 0) cap = WEIGHTS.capability / 2;
  else cap = Math.min(WEIGHTS.capability, has.length * 8 + (has.length ? 4 : 0));
  if (has.length) reasons.push({ label: `Can do: ${has.slice(0, 2).join(", ")}`, points: cap, max: WEIGHTS.capability, good: true });
  else reasons.push({ label: needed.length ? "None of the specific skills asked for" : "No specific skills asked for", points: cap, max: WEIGHTS.capability, good: needed.length === 0 });

  // Location. Technologists and labs matter less: samples can be couriered.
  const remoteOk = p.type === "technologist" || p.type === "lab";
  let loc: number;
  if (p.city === brief.city) loc = 15;
  else if (region(p.city) === region(brief.city)) loc = remoteOk ? 12 : 8;
  else loc = remoteOk ? 8 : 0;
  reasons.push({
    label: p.city === brief.city ? `In ${p.city}` : region(p.city) === region(brief.city) ? `Nearby (${p.city})` : `Far away (${p.city})`,
    points: loc, max: WEIGHTS.location, good: loc >= 8,
  });

  // Workload.
  const wl = { low: 15, medium: 8, full: 0 }[p.workload];
  reasons.push({ label: { low: "Has capacity now", medium: "Some capacity", full: "Fully booked" }[p.workload], points: wl, max: WEIGHTS.workload, good: wl > 0 });
  if (p.workload === "full") warnings.push("Fully booked right now; expect a wait.");

  // History across all categories: start at 5, +2 went ahead, +1 accepted, -2 declined, -3 didn't work.
  let hist = 5;
  for (const o of history) hist += { went_ahead: 2, accepted: 1, declined: -2, didnt_work: -3 }[o.result];
  hist = Math.max(0, Math.min(WEIGHTS.history, hist));
  const ahead = history.filter((o) => o.result === "went_ahead").length;
  const bad = history.filter((o) => o.result === "didnt_work" || o.result === "declined").length;
  reasons.push({
    label: history.length ? `Past intros: ${ahead} went ahead, ${bad} didn't` : "No past intros yet",
    points: hist, max: WEIGHTS.history, good: hist >= 5,
  });
  const lastLogged = logged[logged.length - 1];
  if (lastLogged && (lastLogged.result === "didnt_work" || lastLogged.result === "declined"))
    warnings.push(`Last logged intro: ${lastLogged.result === "declined" ? "declined" : "didn't work"}${lastLogged.note ? ` (${lastLogged.note})` : ""}.`);

  // Certifications that matter for the type.
  let cert = 0;
  if (p.type === "lab") cert = p.certifications.includes("NABL-accredited") ? 10 : 4;
  else if (p.type === "technologist") cert = 5;
  else {
    if (p.certifications.includes("FSSAI licence")) cert += 4;
    if (p.certifications.includes("ISO 22000")) cert += 3;
    if (p.certifications.includes("BRC")) cert += 3;
  }
  if (p.type === "technologist")
    reasons.push({ label: "Certifications don't apply", points: cert, max: WEIGHTS.certification, good: true });
  else
    reasons.push({
      label: p.certifications.length ? p.certifications.join(" · ") : "No certifications listed",
      points: cert, max: WEIGHTS.certification, good: cert >= 7,
    });

  // Batch fit: comfortable if at least 1.5x the minimum (not right at the edge).
  let bf = WEIGHTS.batchFit;
  if (usesBatch(p.type) && p.minBatchKg) {
    bf = brief.batchKg >= p.minBatchKg * 1.5 ? 5 : 2;
    if (bf === 2) reasons.push({ label: `Your batch is near their minimum (${p.minBatchKg.toLocaleString("en-IN")} kg)`, points: bf, max: WEIGHTS.batchFit, good: false });
    else reasons.push({ label: `Takes ${p.minBatchKg.toLocaleString("en-IN")}–${(p.maxBatchKg ?? 0).toLocaleString("en-IN")} kg`, points: bf, max: WEIGHTS.batchFit, good: true });
  } else {
    reasons.push({ label: "Batch size doesn't apply", points: bf, max: WEIGHTS.batchFit, good: true });
  }

  const score = Math.round(exp + cap + loc + wl + hist + cert + bf);
  return { partner: p, score, reasons, warnings };
}

/* ---------------- Gaps ---------------- */

function explainGap(type: PartnerType, brief: Brief, all: Partner[]): string {
  const ofType = all.filter((p) => p.type === type);
  const inCat = ofType.filter((p) => p.categories.includes(brief.category));
  const label = TYPE_LABEL[type].toLowerCase();
  const cat = categoryLabel(brief.category).toLowerCase();
  if (inCat.length === 0) return `No ${label} in the network works in ${cat}.`;
  const inStorage = inCat.filter((p) => type === "ingredient-supplier" || p.storage.includes(brief.storage));
  const what = cat.includes(brief.storage) ? cat : `${brief.storage} ${cat}`;
  if (inStorage.length === 0) return `No ${label} in the network handles ${what}.`;
  const mins = inStorage.map((p) => p.minBatchKg ?? 0).filter((m) => m > brief.batchKg);
  if (mins.length) {
    const lowest = Math.min(...mins);
    return `No ${label} in the network does ${what} at ${brief.batchKg.toLocaleString("en-IN")} kg. The smallest minimum is ${lowest.toLocaleString("en-IN")} kg.`;
  }
  return `No ${label} in the network fits this brief.`;
}

export const WEAK_SCORE = 50;

export function match(brief: Brief, partners: Partner[], logged: Record<string, Outcome[]> = {}): MatchResult {
  const needed = neededCapabilities(brief);
  const gaps: string[] = [];
  const steps: Step[] = buildPath(brief).map(({ type, reason }) => {
    const ofType = partners.filter((p) => p.type === type);
    const passed = ofType.filter((p) => !hardFilter(p, brief));
    const scored = passed
      .map((p) => scorePartner(p, brief, neededForType(type, needed, partners), logged[p.id] ?? []))
      .sort((a, b) => b.score - a.score || a.partner.name.localeCompare(b.partner.name));
    let gap: string | null = null;
    if (scored.length === 0) {
      gap = explainGap(type, brief, partners);
    } else {
      const available = scored.filter((s) => s.partner.workload !== "full");
      if (available.length === 0)
        gap = `Every ${TYPE_LABEL[type].toLowerCase()} that fits is fully booked (${scored.map((s) => s.partner.name).join(", ")}).`;
      else if (scored[0].score < WEAK_SCORE)
        gap = `Only weak matches for ${TYPE_LABEL[type].toLowerCase()}: the best scores ${scored[0].score}/100.`;
      else if (type !== "technologist" && type !== "lab" && type !== "ingredient-supplier" && !scored.some((s) => s.partner.city === brief.city))
        gap = `No ${TYPE_LABEL[type].toLowerCase()} in ${brief.city} fits; the nearest is in ${scored[0].partner.city}.`;
    }
    if (gap) gaps.push(gap);
    const recruit = gap
      ? `${TYPE_LABEL[type]} for ${categoryLabel(brief.category).toLowerCase()} (${brief.storage}${usesBatch(type) ? `, around ${brief.batchKg.toLocaleString("en-IN")} kg` : ""}) near ${brief.city}`
      : null;
    return {
      type, title: TYPE_LABEL[type], why: reason,
      matches: scored.slice(0, 3), candidates: ofType.length, passedFilters: passed.length, gap, recruit,
    };
  });
  return { steps, gaps };
}
