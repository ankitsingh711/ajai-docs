# Ajaia Docs

A lightweight collaborative document editor (Google Docs–inspired) built for the Ajaia AI-Native Full Stack Developer assignment.

Create documents, format text, import `.txt`/`.md` files, and share documents with other mocked users — all persisted to Postgres.

## Tech stack

- **Framework:** Next.js 14 (App Router) — one deployable app for frontend + API routes
- **Editor:** TipTap (ProseMirror) — bold/italic/underline/headings/lists, content stored as structured JSON
- **Database:** PostgreSQL via Prisma ORM (works with any Postgres, documented here against Supabase's free tier)
- **Auth:** Mocked — a user switcher backed by seeded accounts and a cookie (no passwords). See `ARCHITECTURE.md` for why.
- **Testing:** Vitest

## Prerequisites

- Node.js 18+
- A Postgres database. The free tier of [Supabase](https://supabase.com) works well and requires no credit card — create a project, then grab the connection strings from **Project Settings → Database**.

## Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and fill in:

- `DATABASE_URL` — the pooled/transaction connection string (port 6543 on Supabase)
- `DIRECT_URL` — the direct connection string (port 5432 on Supabase), used only for schema migrations

Then push the schema and seed mock users/data:

```bash
npx prisma db push
npm run seed
npm run dev
```

Open http://localhost:3000. Use the account switcher in the top-right corner to act as **Alice**, **Bob**, or **Carol** — a demo document owned by Alice and shared with Bob is seeded automatically so you can see the owned/shared distinction immediately.

## Seeded test accounts

| Name  | Email             |
|-------|-------------------|
| Alice Chen | alice@ajaia.test |
| Bob Okafor | bob@ajaia.test   |
| Carol Nguyen | carol@ajaia.test |

There are no passwords — switching "who you are" is done via the dropdown in the header, which sets a cookie. This is intentional scope-narrowing; see `ARCHITECTURE.md`.

## File upload

Supported formats: **`.txt` and `.md` only**, up to 1MB. Uploading a file creates a new document; Markdown headings (`#`/`##`/`###`) and lists (`-`/`*`/`1.`) are converted into real formatted content, plain text becomes paragraphs. Other file types are rejected with an inline error.

## Sharing

Any document owner can share with another seeded user by email from the **Share** button on a document. Shared users get edit access to content (collaborative-editing spirit of the assignment) but cannot rename or delete the document — only the owner can.

## Running tests

```bash
npm test
```

Covers `textToDoc` (the file-import → rich text conversion logic) — the most bug-prone, non-trivial pure function in the app.

## Deployment

Deployed via Vercel (frontend + API routes) with a Supabase Postgres database. Summary:

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add `DATABASE_URL` and `DIRECT_URL` as Vercel environment variables (same values as your `.env`).
4. Deploy. Vercel runs `prisma generate && next build` automatically (see `package.json`).
5. Run `npx prisma db push` and `npm run seed` once against the production database (locally, pointed at the prod `DATABASE_URL`, or via Vercel's CLI) so the live app has seeded users.

Live URL: _see `SUBMISSION.md`_

## Known limitations

See `ARCHITECTURE.md` for the full list of intentional scope cuts and what would be built next.
