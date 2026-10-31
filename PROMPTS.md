# AI-assisted development log (IBM Bob)

Every prompt sent to IBM Bob while building Book Worm, what Bob produced, and what I reviewed or changed.

| # | Step | Prompt (short) | What Bob produced | What I changed / why |
|---|------|----------------|-------------------|----------------------|
| 1 | Plan (Plan mode) | Analyse the 6 design screens + architecture; produce a plan (stack, routes, components, data model, responsive behaviour, journeys) | `docs/PLAN.md`: stack, 8 routes, 40+ components, TypeScript data model, responsive table, 12 journeys, 11 sub-tasks, 8 open questions, design inconsistencies | Designs exceeded Bob's 8 MB upload limit, so I compressed them to JPG first |
| 2 | Plan (Agent mode) | Answered Bob's open questions Q1–Q8 | Updated `docs/PLAN.md` with decisions D1–D10 and new sub-task ST12 | Overrode Bob: tests YES (it proposed none), guest checkout allowed (architecture shows a guest path), real device test widths 390/820/1440px, Lighthouse a11y ≥ 90, 12% tax constant |
