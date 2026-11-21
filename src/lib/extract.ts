import type { Issue } from "./types";

/**
 * Keyword fallback used when no LLM key is set. Turns the free-text
 * "where are you stuck" box into issue tags the matcher understands.
 */
const RULES: { issue: Issue; words: RegExp }[] = [
  { issue: "texture", words: /\b(hard|soft|soggy|crumbl|chewy|sticky|texture|grainy|gritty|brittle|dry|stale|separat|bloom|leak|streak|crystal|melt|runny|watery)\w*/i },
  { issue: "shelf-life", words: /\b(shelf[- ]?life|spoil\w*|mou?ld\w*|goes bad|go bad|rancid\w*|expir\w*|lasts?|weeks?|days?|months?)\b/i },
  { issue: "taste", words: /\b(taste\w*|aftertaste|bitter\w*|flavou?r\w*|chalky|beany|icy|sweetness)\b/i },
  { issue: "sugar-reduction", words: /\b(sugar|sweeten|stevia|jaggery|erythritol)\w*/i },
  { issue: "protein", words: /\bprotein\b/i },
  { issue: "fibre", words: /\bfib(re|er)\b/i },
  { issue: "scale-up", words: /\b(scale|factor(y|ies)|manufactur|co-?pack|moq|minimum order|bigger batch|production|commercial|first run)\w*/i },
  { issue: "labelling", words: /\b(label|claim|fssai|nutrition|complian|regulat)\w*/i },
  { issue: "packaging", words: /\b(pack|pouch|bottle|jar|wrapper|carton|tub)\w*/i },
  { issue: "food-safety", words: /\b(microb|bacteria|safety|contamin|yeast|swell|bloat|sour)\w*/i },
];

export function extractIssuesByKeywords(text: string): Issue[] {
  if (!text.trim()) return [];
  return RULES.filter((r) => r.words.test(text)).map((r) => r.issue);
}
