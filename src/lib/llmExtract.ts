import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ISSUES } from "./constants";
import type { Issue } from "./types";

const ISSUE_IDS = ISSUES.map((i) => i.id) as [Issue, ...Issue[]];

// The model can only return ids from the fixed list. It never sees or picks partners.
const Extraction = z.object({ issues: z.array(z.enum(ISSUE_IDS)) });

const SYSTEM = `You read a food or drink brand's note about where they are stuck and tag it with problem types.
Only use these tags:
${ISSUES.map((i) => `- ${i.id}: ${i.label}`).join("\n")}
Pick every tag that clearly applies and no others. If nothing applies, return an empty list.`;

/** Returns null when no key is set or the call fails, so the caller can fall back to keywords. */
export async function extractIssuesWithClaude(text: string): Promise<Issue[] | null> {
  if (!process.env.ANTHROPIC_API_KEY || !text.trim()) return null;
  try {
    const client = new Anthropic({ timeout: 15_000, maxRetries: 1 });
    const response = await client.messages.parse({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 1024,
      system: SYSTEM,
      output_config: { effort: "low", format: zodOutputFormat(Extraction) },
      messages: [{ role: "user", content: text.slice(0, 2000) }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    return [...new Set(response.parsed_output.issues)];
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`Claude extract failed (${error.status}):`, error.message);
    else console.error("Claude extract failed:", error);
    return null;
  }
}
