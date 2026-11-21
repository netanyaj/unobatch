# Test notes (21 Nov 2026)

## Six test briefs

Run `npm run check` to reproduce. I checked every score: the chips add up to the score for all 55 ranked partners.

| Brief | Expected | Result |
|---|---|---|
| Oat & date protein bar (fibre bar, ambient, 800 kg, Bangalore) | Strong matches, mostly Bangalore | ✓ No gaps. The top match at every step is in Bangalore, except the technologist (Hyderabad, 85, narrowly ahead of Bangalore, 82). |
| High-protein curd cups (chilled dairy, 300 kg, Bangalore) | Gap: no small-batch chilled dairy manufacturer | ✓ Gaps for the manufacturer (smallest minimum 1,000 kg), packaging (500 kg) and pilot (nearest is Mysuru). |
| Fresh paneer (fresh cheese, 150 kg, Bangalore) | Gaps: no manufacturer, pilot booked | ✓ Gaps for the manufacturer (minimum 2,000 kg), packaging, and the pilot (the only fit is fully booked). |
| Ashwagandha drink (functional beverage, 1,500 kg, Pune) | Good matches, Pune pilot lab | ✓ Pune lab and pilot rank first. Packaging and the manufacturer are flagged as not in Pune. |
| Sugar-free filled chocolate (600 kg, Bangalore) | Hosur first, Konkan penalised | ✓ Hosur 71, Konkan 44 (far away and has a "didn't work" record). |
| Sugar-free mango kulfi (frozen, 400 kg, Bangalore) | Gap: frozen dessert manufacturer | ✓ Gaps for the manufacturer and packaging (500 kg minimum). Pilot is only in Mumbai. |

## Other checks
- **No AI key:** the stuck box falls back to keywords. A bad key gives a 401 in the server log and also falls back, with nothing broken in the UI.
- **No database:** outcomes and briefs are kept in memory, and the UI says so.
- **Laptop screen (1440×900):** went through every screen in Chromium (form, tags, results, logging, details panel, gaps) with no console errors. Screenshots: `screens/` in the project folder.
- **Logging changes the ranking:** "didn't work" on the #1 technologist drops them 3 points to #2. "Went ahead" on Mysore Dairy Research Lab raises it from 82 to 89.

## Odd things worth knowing
- A fully booked partner can still rank #1 (for example Vikram Shetty for curd, at 70). The warning shows on the card, but workload is only 15 of the 100 points. If you'd rather never put a booked partner first, that is a weight change.
- When the only partners that need a skill are a different type, the score gives a neutral 10 of 20 for skills ("No specific skills asked for"). That's fair, but the chip wording reads a little odd.
- "Not in your city" shows up as a gap next to real gaps such as "nobody does this at all". It could become a softer note instead.
- Technologist names include "(food technologist)", which repeats the step title.
