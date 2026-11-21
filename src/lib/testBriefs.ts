import type { Brief } from "./types";

/** Six briefs used to sanity-check the matcher (and as quick-fill examples in the form). */
export const TEST_BRIEFS: (Brief & { expect: string })[] = [
  { productName: "Oat & date protein bar", category: "high-fibre-bars", stage: "recipe-ready",
    claims: ["High protein", "High fibre", "Clean label"], storage: "ambient", shelfLifeDays: 180, batchKg: 800,
    city: "Bangalore", stuck: "My bar goes hard after 2 weeks on the shelf.", issues: ["texture", "shelf-life"],
    expect: "Strong matches at every step, mostly in Bangalore." },
  { productName: "High-protein curd cups", category: "chilled-dairy", stage: "samples-made",
    claims: ["High protein", "Probiotic"], storage: "chilled", shelfLifeDays: 21, batchKg: 300,
    city: "Bangalore", stuck: "Need a factory that will do a small first run.", issues: ["scale-up"],
    expect: "Gap: no chilled dairy manufacturer takes 300 kg." },
  { productName: "Fresh paneer", category: "fresh-cheese", stage: "recipe-ready",
    claims: ["High protein"], storage: "chilled", shelfLifeDays: 14, batchKg: 150,
    city: "Bangalore", stuck: "Paneer goes sour after 5 days.", issues: ["shelf-life", "food-safety"],
    expect: "Gaps: no manufacturer at 150 kg, pilot facility fully booked." },
  { productName: "Ashwagandha sleep drink", category: "functional-beverages", stage: "idea",
    claims: ["No added sugar", "Clean label"], storage: "ambient", shelfLifeDays: 270, batchKg: 1500,
    city: "Pune", stuck: "Bitter aftertaste from the extract.", issues: ["taste"],
    expect: "Good matches; Pune pilot lab and Kochi technologist should show." },
  { productName: "Sugar-free filled chocolate", category: "filled-chocolates", stage: "samples-made",
    claims: ["Sugar-free"], storage: "ambient", shelfLifeDays: 240, batchKg: 600,
    city: "Bangalore", stuck: "Filling leaks and the chocolate gets white streaks.", issues: ["texture"],
    expect: "Hosur Chocolate (Bangalore, sugar-free) should rank first; Konkan penalised for a leaking-filling failure." },
  { productName: "Sugar-free mango kulfi", category: "sugar-free-desserts", stage: "recipe-ready",
    claims: ["Sugar-free"], storage: "frozen", shelfLifeDays: 180, batchKg: 400,
    city: "Bangalore", stuck: "Ice crystals form and it tastes icy.", issues: ["texture", "sugar-reduction"],
    expect: "Gap: only frozen dessert manufacturer is full and needs 500 kg." },
];
