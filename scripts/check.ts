import data from "../src/data/partners.json";
import { match } from "../src/lib/match";
import { TEST_BRIEFS } from "../src/lib/testBriefs";
import type { Partner } from "../src/lib/types";
for (const b of TEST_BRIEFS) {
  const r = match(b, data.partners as Partner[]);
  console.log(`\n=== ${b.productName} (${b.category}, ${b.storage}, ${b.batchKg} kg, ${b.city}) — expect: ${b.expect}`);
  for (const s of r.steps) {
    console.log(`  [${s.title}] ${s.passedFilters}/${s.candidates} pass` + (s.gap ? `  GAP: ${s.gap}` : ""));
    for (const m of s.matches) console.log(`     ${m.score}  ${m.partner.name} (${m.partner.city}, ${m.partner.workload})`);
  }
}
