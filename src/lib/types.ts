export type PartnerType =
  | "technologist"
  | "lab"
  | "ingredient-supplier"
  | "pilot-facility"
  | "manufacturer"
  | "packaging";

export type Storage = "ambient" | "chilled" | "frozen";
export type Workload = "low" | "medium" | "full";
export type OutcomeResult = "accepted" | "declined" | "went_ahead" | "didnt_work";
export type Stage = "idea" | "recipe-ready" | "samples-made" | "ready-to-scale";

export interface Outcome {
  date: string;
  category: string;
  result: OutcomeResult;
  note: string;
  logged?: boolean; // true when logged in this browser
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  categories: string[];
  capabilities: string[];
  storage: Storage[];
  minBatchKg: number | null;
  maxBatchKg: number | null;
  certifications: string[];
  city: string;
  workload: Workload;
  pastOutcomes: Outcome[];
}

export type Issue =
  | "texture"
  | "shelf-life"
  | "taste"
  | "sugar-reduction"
  | "protein"
  | "fibre"
  | "scale-up"
  | "labelling"
  | "packaging"
  | "food-safety";

export interface Brief {
  productName: string;
  category: string;
  stage: Stage;
  claims: string[];
  storage: Storage;
  shelfLifeDays: number;
  batchKg: number;
  city: string;
  stuck: string;
  issues: Issue[];
}

export interface Reason {
  label: string; // short chip text
  points: number;
  max: number;
  good: boolean;
}

export interface ScoredPartner {
  partner: Partner;
  score: number;
  reasons: Reason[];
  warnings: string[];
}

export interface Step {
  type: PartnerType;
  title: string;
  why: string;
  matches: ScoredPartner[];
  candidates: number; // partners of this type in the network
  passedFilters: number;
  gap: string | null;
  recruit: string | null; // who the team should recruit to close this gap
}

export interface MatchResult {
  steps: Step[];
  gaps: string[];
}
