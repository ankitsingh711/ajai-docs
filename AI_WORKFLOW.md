# AI Workflow Note

## Which AI tools I used

Claude (Anthropic), via Cowork, as the primary build partner for this assignment — used for scaffolding the Next.js/Prisma/TipTap application, writing API routes and UI components, generating the unit test, and drafting this documentation set.

## Where AI materially sped up my work

- **Boilerplate and wiring.** Project scaffolding (Next.js config, Prisma schema, TipTap integration, API route structure) is mechanical and well-documented territory — generating a working first pass in minutes instead of an hour-plus of assembling it by hand freed up time budget for the parts that actually needed judgment: what the sharing model should enforce, what to cut, and how to explain the tradeoffs.
- **Consistent access-control pattern.** Having AI apply the same `getDocumentForUser` check across every route (rather than me hand-writing four slightly-different permission checks) reduced the chance of an inconsistent auth bug — the kind of thing that's easy to introduce under time pressure.
- **Test and doc generation.** The `textToDoc` unit tests and the first drafts of `README.md`/`ARCHITECTURE.md` were AI-drafted from the actual code, which is faster than writing prose from scratch and lets me spend review time checking accuracy instead of typing.

## What I changed or rejected

- **Design direction:** when asked to improve the UI, I was offered a choice between a "Modern SaaS (Notion/Linear-inspired)" direction and a "Bold & colorful" one. I picked the former deliberately — this is a productivity tool, not a marketing page, and I didn't want the redesign to read as decoration.
- **Auth model:** I chose seeded mock users over building a lightweight real login flow, to keep the time budget on document editing, sharing, and file handling rather than authentication plumbing that wasn't the point of the exercise.
- **Caught a hydration bug AI's first pass introduced:** the dashboard rendered "Updated {date}" using `toLocaleString()` directly during server-side rendering. Locally this looked fine, but on my actual machine's browser I saw a React hydration mismatch in the console (server formatted the date as `7/14/2026`, my browser as `14/7/2026`). I flagged the exact console output rather than accepting "looks fine," and had it fixed by moving the date formatting into a client-only effect.
- **Caught a state bug via my own testing, not AI foresight:** after switching users with the account switcher, the document list kept showing the previous user's documents. I found this myself by clicking through the app, described the exact symptom, and confirmed the fix (keying the client components on user id so they remount on switch) actually resolved it before moving on.
- **Rejected AI's first two guesses on a production outage:** when the deployed app crashed with a generic "server-side exception," AI's first hypotheses were a missing DB schema push and missing environment variables. Both were reasonable but wrong. I pulled the actual Vercel runtime logs myself (not just build logs, which is a separate tab that's easy to check by mistake) and got the real Prisma error, which pointed to a completely different root cause.

## How I verified correctness, UX quality, and implementation reliability

- **Automated tests:** `npm test` — covers the file-import → rich-text conversion logic (`textToDoc`), the most bug-prone pure function in the app (markdown heading/list parsing, edge cases like empty input).
- **Type checking:** `npx tsc --noEmit` passes cleanly against the application code.
- **Manual walkthrough, local and live:** I personally clicked through document creation/editing/formatting, file upload, user switching, sharing and revoking access, and refresh-persistence — both on `localhost` and on the deployed Vercel URL, not just one or the other.
- **Real production debugging, not just "it built successfully":** the Vercel build passing didn't mean the app worked — I hit an actual runtime crash after deploying. I diagnosed it down to the real cause (Supabase's direct Postgres connection is IPv6-only, which Vercel's serverless functions can't reach) by reading the actual Prisma error text from Vercel's runtime logs, then fixed it by switching to Supabase's transaction pooler connection string. I confirmed the fix by reloading the live site until the error was actually gone, not by assuming the config change would work.
- **Browser console as a source of truth:** for both the hydration bug and the production outage, I went to DevTools/Vercel logs myself and pasted back the exact error text rather than describing symptoms secondhand — that's what got both issues root-caused correctly instead of guessed at.
