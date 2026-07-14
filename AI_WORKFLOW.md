# AI Workflow Note

## Which AI tools I used

Claude (Anthropic), via Cowork, as the primary build partner for this assignment — used for scaffolding the Next.js/Prisma/TipTap application, writing API routes and UI components, generating the unit test, and drafting this documentation set.

## Where AI materially sped up my work

- **Boilerplate and wiring.** Project scaffolding (Next.js config, Prisma schema, TipTap integration, API route structure) is mechanical and well-documented territory — generating a working first pass in minutes instead of an hour-plus of assembling it by hand freed up time budget for the parts that actually needed judgment: what the sharing model should enforce, what to cut, and how to explain the tradeoffs.
- **Consistent access-control pattern.** Having AI apply the same `getDocumentForUser` check across every route (rather than me hand-writing four slightly-different permission checks) reduced the chance of an inconsistent auth bug — the kind of thing that's easy to introduce under time pressure.
- **Test and doc generation.** The `textToDoc` unit tests and the first drafts of `README.md`/`ARCHITECTURE.md` were AI-drafted from the actual code, which is faster than writing prose from scratch and lets me spend review time checking accuracy instead of typing.

## What I changed or rejected

*(Fill in after your own review — see action items below. Example prompts for what to look for: Did you change the sharing permission model? Adjust the styling? Rework how autosave debouncing works? Reject any proposed library or approach?)*

- [ ] ...
- [ ] ...

## How I verified correctness, UX quality, and implementation reliability

- **Automated tests:** `npm test` — covers the file-import → rich-text conversion logic (`textToDoc`), the most bug-prone pure function in the app (markdown heading/list parsing, edge cases like empty input).
- **Type checking:** `npx tsc --noEmit` passes cleanly against the application code (the only remaining errors before running `prisma generate` are the expected "Prisma client not yet generated" errors, which resolve once the schema is generated against a real database connection).
- **Manual walkthrough:** *(Fill in after you personally click through the app — create a doc, format text, upload a `.txt`/`.md` file, switch users via the switcher, share a doc, confirm the owned/shared badges and revoke flow work as expected, refresh to confirm persistence.)*
- **Build verification:** *(Run `npm run build` locally or let Vercel's build run it — confirms the production build compiles, since Prisma's engine binaries need real network access that wasn't available in the sandbox this was drafted in.)*

## Action items before submitting

1. Run the app locally end to end and fill in the two sections above honestly based on what you actually did.
2. Record the walkthrough video showing the flows you verified.
3. Confirm the deployed URL behaves the same as local (seeded users present, sharing works).
