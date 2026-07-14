# Submission

## Included in this folder

- `ajaia-docs-final-source.zip` — full source code (Next.js app, Prisma schema, tests)
- Source is also browsable with full commit history on GitHub: https://github.com/ankitsingh711/ajai-docs
- `README.md` — local setup and run instructions
- `ARCHITECTURE.md` — architecture note and scope-cut rationale
- `AI_WORKFLOW.md` — AI usage disclosure
- `SUBMISSION.md` — this file
- `walkthrough-video-url.txt` — link to the recorded walkthrough

## Live product URL

https://ajai-docs-seven.vercel.app

## Google Drive folder

https://drive.google.com/drive/folders/1T2s_5Tn2nm17iNOUgalH0LRqt_DYDJJk

(Contains this file, README.md, ARCHITECTURE.md, AI_WORKFLOW.md, walkthrough-video-url.txt, and the full source code zip.)

## Test accounts

No passwords — use the account switcher in the app header.

| Name  | Email             |
|-------|-------------------|
| Alice Chen | alice@ajaia.test |
| Bob Okafor | bob@ajaia.test   |
| Carol Nguyen | carol@ajaia.test |

A demo document ("Welcome to Ajaia Docs") is seeded, owned by Alice and shared with Bob — switch to Bob to see it under "Shared with you."

## What's working

- Create, rename, edit, and reopen documents with rich-text formatting (bold, italic, underline, headings, bullet/numbered lists)
- Autosave with visible save status
- `.txt`/`.md` file upload that converts to a new editable document (headings/lists parsed from Markdown)
- Sharing: owner grants/revokes access by email; owned vs. shared documents are visually distinguished on the dashboard
- Persistence via Postgres (Prisma) — documents and shares survive refresh
- Basic validation (title length, content size, file type/size) and error handling (inline error banners, 4xx responses with messages)
- One automated test suite (`npm test`) covering the file-import conversion logic

## What's incomplete / out of scope

- No real authentication (mocked user switcher — documented as an intentional scope cut in `ARCHITECTURE.md`)
- No permission tiers (share access is edit-only, no view-only mode)
- No real-time collaboration/presence
- File import limited to `.txt`/`.md` (no `.docx` parsing)
- No version history or comments

See `ARCHITECTURE.md` → "What I'd build next with 2–4 more hours" for prioritized next steps.

## Video walkthrough

https://www.loom.com/share/bb7d8a36c1db4e6a8f62abc94081cd26
