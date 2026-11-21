import type { Issue, PartnerType, Stage, Storage } from "./types";

export const CATEGORIES: { id: string; label: string }[] = [
  { id: "protein-snacks", label: "Protein snacks" },
  { id: "high-fibre-bars", label: "High-fibre bars" },
  { id: "bakery", label: "Bakery" },
  { id: "sugar-free-desserts", label: "Sugar-free desserts" },
  { id: "rte-breakfast", label: "Ready-to-eat breakfast (shelf-stable)" },
  { id: "filled-chocolates", label: "Filled chocolates" },
  { id: "fresh-cheese", label: "Fresh cheese" },
  { id: "chilled-dairy", label: "Chilled dairy" },
  { id: "clean-label-purees", label: "Clean-label purées" },
  { id: "functional-beverages", label: "Functional beverages" },
  { id: "functional-coffee", label: "Functional coffee" },
];
export const categoryLabel = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const STAGES: { id: Stage; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "recipe-ready", label: "Recipe ready" },
  { id: "samples-made", label: "Samples made" },
  { id: "ready-to-scale", label: "Ready to scale" },
];

export const STORAGE: { id: Storage; label: string }[] = [
  { id: "ambient", label: "Ambient" },
  { id: "chilled", label: "Chilled" },
  { id: "frozen", label: "Frozen" },
];

export const CLAIMS = [
  "High protein",
  "High fibre",
  "Sugar-free",
  "No added sugar",
  "Clean label",
  "Vegan",
  "Gluten-free",
  "Probiotic",
];

export const CITIES = [
  "Bangalore",
  "Mysuru",
  "Chennai",
  "Coimbatore",
  "Kochi",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Ahmedabad",
  "Delhi NCR",
];

// Cities close enough for a day trip / cheap freight. Used for the "nearby" score.
export const REGIONS: string[][] = [
  ["Bangalore", "Mysuru", "Chennai", "Coimbatore", "Kochi", "Hyderabad"],
  ["Pune", "Mumbai", "Ahmedabad"],
  ["Delhi NCR"],
];

export const TYPE_LABEL: Record<PartnerType, string> = {
  technologist: "Food technologist",
  lab: "Testing lab",
  "ingredient-supplier": "Ingredient supplier",
  "pilot-facility": "Pilot facility",
  manufacturer: "Contract manufacturer",
  packaging: "Packaging supplier",
};

export const ISSUES: { id: Issue; label: string; needs: PartnerType[]; capabilities: string[] }[] = [
  { id: "texture", label: "Texture problem", needs: ["technologist", "lab"],
    capabilities: ["texture fixes", "bar reformulation", "texture analysis", "fat bloom fixes"] },
  { id: "shelf-life", label: "Shelf life too short", needs: ["technologist", "lab"],
    capabilities: ["shelf-life study", "shelf-life planning", "challenge testing", "clean-label preservation", "natural preservatives"] },
  { id: "taste", label: "Taste or aftertaste", needs: ["technologist", "lab"],
    capabilities: ["plant protein taste masking", "sensory panel", "sensory testing", "sweetener blends"] },
  { id: "sugar-reduction", label: "Cutting sugar", needs: ["technologist", "ingredient-supplier"],
    capabilities: ["sugar reduction", "sweetener blends", "stevia", "monk fruit", "erythritol", "sugar-free chocolate", "sugar profiling"] },
  { id: "protein", label: "Adding protein", needs: ["technologist", "ingredient-supplier"],
    capabilities: ["protein fortification", "whey protein", "pea protein", "protein crisps"] },
  { id: "fibre", label: "Adding fibre", needs: ["technologist", "ingredient-supplier"],
    capabilities: ["fibre fortification", "inulin", "oat fibre", "resistant dextrin"] },
  { id: "scale-up", label: "Moving from kitchen to factory", needs: ["pilot-facility", "manufacturer"],
    capabilities: ["scale-up planning"] },
  { id: "labelling", label: "Label or claim check", needs: ["lab"],
    capabilities: ["nutrition analysis", "nutrition labelling", "label claims", "regulatory review", "allergen testing"] },
  { id: "packaging", label: "Packaging", needs: ["packaging"],
    capabilities: ["low MOQ printing"] },
  { id: "food-safety", label: "Food safety or spoilage", needs: ["lab"],
    capabilities: ["microbial testing", "challenge testing", "dairy microbiology"] },
];

// Claims that call for particular capabilities.
export const CLAIM_CAPABILITIES: Record<string, string[]> = {
  "High protein": ["protein fortification", "whey protein", "pea protein", "protein crisps"],
  "High fibre": ["fibre fortification", "inulin", "oat fibre", "resistant dextrin"],
  "Sugar-free": ["sugar reduction", "sweetener blends", "stevia", "monk fruit", "sugar-free chocolate", "sugar profiling", "sugar-free confectionery"],
  "No added sugar": ["sugar reduction", "date paste", "sweetener blends"],
  "Clean label": ["clean-label emulsifiers", "clean-label preservation", "natural emulsifiers", "natural preservatives", "citrus fibre"],
  "Gluten-free": ["allergen testing", "millet flours"],
  Probiotic: ["probiotic cultures", "dairy microbiology", "culture selection"],
  Vegan: ["pea protein", "eggless baking"],
};
