# Uno match (First Batch prototype)

A small prototype built for a job application to First Batch Co. A brand fills in a short brief. The tool lays out the partners the project needs, in order, and ranks partners from the network for each step. It shows why each partner matched and where the network has gaps.

The point: matching should be explainable and checkable, not a black box. The gaps tell the team which partners to recruit next.

> **All partner data is made up.** It is sample data, not First Batch's real network. Names are invented, and any match with a real company or person is accidental. The app shows this label on every screen.

## What it does

The app is one loop: brief in, partners picked, outcomes logged, gaps recruited, briefs matched again.

1. **Pipeline.** The home page is a board of every brief, in five columns: New, Intros out, In progress, Blocked by a gap, and Done. Each card shows its steps as small bars and the next thing to do. Cards move on their own as you pick partners and log outcomes.
2. **New brief.** Category, stage, claims, storage, target shelf life, first batch size, city, and a free-text "where are you stuck" box. The stuck box is turned into problem tags, for example "texture problem" or "shelf life too short", which you can change before saving. The brief then lands on the board with its panel open.
3. **Brief panel.** Click a card to open it. The panel lists the partners the project needs, in order (technologist, ingredient supplier, lab, pilot facility, packaging, manufacturer), each with its state: to pick, intro sent, accepted, went ahead, or no partner fits. Open a step to see the top 3 partners. "Why 82?" breaks each score into reasons that add up to the total.
4. **Outcome logging.** Pick a partner, then log how it went: intro accepted, declined, project went ahead, or didn't work, with a reason. The partners re-rank straight away, the step changes state, and the card moves on the board.
5. **Recruiting.** Every gap on unfinished briefs, grouped by the partner that would close it, with the briefs waiting on it. Add a partner from a row (the form is filled in from the gap) and the waiting briefs are matched again. The page says which briefs can now pick a partner for that step.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Optional settings go in `.env.local`. The app works without any of them.

| Variable | What it does | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude reads the "stuck" box | Keyword rules read it instead |
| `ANTHROPIC_MODEL` | Override the model (default `claude-haiku-5-5`) | Uses the default |
| `DATABASE_URL` | Neon Postgres for briefs, logged outcomes and added partners (Vercel sets this when you add Neon) | Kept in memory until the server restarts |

To re-run the matcher on the six test briefs from the command line, run `npm run check`.

## How the score works

**Step 1: hard filters.** A partner is left out if any of these fail:

- They don't work in the brief's product category.
- They can't handle the brief's storage (ambient, chilled or frozen). This filter is skipped for ingredient suppliers, because ingredients ship on their own terms.
- The first batch is outside their range. Manufacturers need the batch between their minimum and maximum. Pilot facilities, ingredient suppliers and packaging only need the batch to reach their minimum. Technologists and labs have no batch range.

**Step 2: score out of 100.** Each factor has a one-sentence reason:

| Factor | Points | In one sentence |
|---|---|---|
| Category experience | 25 | 15 for working in the category, plus 5 for each past project in it that went ahead (up to 10). |
| Capability fit | 20 | Has the specific skills the claims and problem tags call for (8 per skill, plus 4 for having any). |
| Location | 15 | Same city scores full points, the same region scores some, far away scores none. Technologists and labs lose less, because samples can be couriered. |
| Workload | 15 | Low workload scores 15, medium 8, fully booked 0. |
| Track record | 10 | Starts at 5. Each intro that went ahead adds 2, accepted adds 1, declined takes away 2, and didn't work takes away 3. |
| Certifications | 10 | NABL accreditation for labs. FSSAI, ISO 22000 and BRC for the rest. |
| Batch fit | 5 | Full points if the batch is at least 1.5 times their minimum, not right at the edge. |

Logged outcomes feed the track record and the category experience, so matches improve as the team logs results.

**Gaps.** A step is flagged when no partner passes the filters (with the filter that ruled them out), when every partner that fits is fully booked, when the best score is under 50, or when no producing partner is in the brand's city.

## Where the AI is used, and where it isn't

Only one place uses AI: turning the "where are you stuck" text into problem tags. Claude can only return tags from a fixed list, and you see and edit them before matching. The AI never sees the partner list and never picks or ranks partners. Ranking is the plain rules above. If there's no key, or the call fails, keyword rules do the same job.

## What's made up

- All 60 partners, their capabilities, batch sizes, certifications, workloads and past outcomes (`src/data/partners.json`, generated by `data/gen.py`).
- The six example briefs (`src/lib/testBriefs.ts`).
- The city regions used for "nearby", and the score weights. These are reasonable guesses, not tuned on real data.

## Stack

Next.js 15 (App Router) with TypeScript, Tailwind and shadcn/ui (components in `src/components/ui`, settings in `components.json`). The 60 sample partners are a JSON file. Briefs, outcomes and partners added from the Recruiting page go to Neon Postgres when `DATABASE_URL` is set. There is no login.
