# Architecture Note

## Framing

The brief was explicit: depth in a few areas beats shallow coverage everywhere. Given a 4–6 hour budget, I picked one deployable surface (a single Next.js app) and spent the time budget on making document editing, file import, and sharing actually work end to end, rather than spreading effort across auth, real-time collaboration, and permission tiers that the assignment explicitly treats as optional.

## What I prioritized

1. **A coherent editing loop.** Create → edit with real rich-text formatting → autosave → reopen and see the same content. This is the core "does it feel like a product" test, so it got the most polish (debounced autosave, save-status indicator, structured JSON persistence instead of raw HTML soup).
2. **Correct access control, not just UI badges.** Every document route (`GET`/`PATCH`/`DELETE`/share) goes through one shared `getDocumentForUser` check (`src/lib/access.ts`) rather than each route re-deriving "is this person allowed to see this." Renaming and deleting are owner-only; content edits are allowed for anyone with share access, matching the "shared with" framing in the brief.
3. **A data model that isn't a toy.** `User` / `Document` / `Share` as a proper many-to-many join table (not a JSON blob of emails on the document) so revoking access, listing "who has this," and enforcing uniqueness (`@@unique([documentId, userId])`) are all real constraints, not app-level conventions.
4. **One database, one provider, for dev and prod.** Postgres (via Supabase) end to end, instead of SQLite locally and Postgres in prod. Provider drift between environments is a classic source of "works on my machine" bugs, and the assignment already names Supabase as an acceptable choice — so I standardized on it rather than adding a second code path.

## Deliberate scope cuts

- **No real authentication.** Users are seeded and switched via a cookie-backed dropdown, not login/password/OAuth. The assignment explicitly allows "mocked auth or a lightweight login flow if that keeps the scope reasonable" — building real auth would have consumed a third of the time budget on something orthogonal to what's being evaluated (document editing, file handling, sharing logic).
- **No view-only vs. edit-only permission tiers.** Sharing is binary: you either have access (and can edit) or you don't. Real products need this distinction, but it's listed as an *optional stretch* ("role-based sharing permissions") — I chose to keep the core sharing model simple and correct rather than add a permission enum I wouldn't have time to fully wire through the UI and API.
- **No real-time collaboration.** Edits are last-write-wins with a 600ms debounce on save; there's no WebSocket layer, no CRDT/OT, no "who's currently viewing" presence. This is the single biggest thing a Google-Docs-inspired editor is "supposed" to have, and it's also explicitly called out as optional stretch work. Building it correctly (conflict resolution, cursor presence) is a multi-day problem on its own.
- **File import limited to `.txt` and `.md`.** `.docx` parsing (real OOXML, not just a text extract) needed a non-trivial dependency and edge-case handling I didn't have budget for. The assignment explicitly permits narrowing supported types as long as it's stated clearly — it is, in the UI and README.
- **No version history / comments.** Also named as optional stretch; skipped to protect time for the core requirements.

## Notable implementation decisions

- **TipTap over a from-scratch contentEditable implementation or a heavier editor (e.g. Slate with full custom schema).** TipTap is a maintained wrapper over ProseMirror with sane defaults for exactly the formatting set required (bold/italic/underline/headings/lists), and it persists as structured JSON — which maps directly onto the "formatting or structure is preserved in a reasonable way" persistence requirement without inventing a serialization format.
- **Markdown import is a small hand-written converter (`src/lib/textToDoc.ts`), not a full Markdown parser.** It only implements headings and lists because that's what the editor supports — pulling in a general Markdown AST parser would have added a dependency and a translation layer for features (tables, nested blockquotes, etc.) the editor can't even render.
- **Prisma + Postgres over a file-based store.** SQLite/file-based storage is explicitly allowed, but Vercel's filesystem is ephemeral per-invocation, which would break persistence in production. Postgres via Supabase avoids that failure mode without adding meaningfully more setup complexity.

## What I'd build next with 2–4 more hours

1. View-only vs. edit permission levels on shares (the most requested "missing" feature relative to a real product).
2. Basic real-time presence (who else has this doc open) using polling or a lightweight WebSocket channel — short of full CRDT-based concurrent editing, even presence indicators would materially improve the collaborative feel.
3. `.docx` import via a library like `mammoth`, converting to the same TipTap JSON shape `textToDoc` already produces.
4. Document version snapshots (store a diff or full snapshot on each save interval) so accidental overwrites are recoverable.
5. Replace the cookie-based mock auth with a real lightweight auth flow (e.g. email magic link) if this were headed toward being a real internal tool rather than a scoped exercise.
