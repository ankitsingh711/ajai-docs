import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { getDocumentForUser } from "@/lib/access";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_BYTES = 2_000_000; // 2MB of TipTap JSON is a generous ceiling for this exercise

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const result = await getDocumentForUser(params.id, user.id);
  if (!result) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  return NextResponse.json({ ...result, currentUserId: user.id });
}

// PATCH — rename and/or save content. Only owner or shared users may edit;
// only the owner may rename (kept simple: shared users get edit rights on
// content, renaming is an owner-only action to avoid surprising title churn).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const result = await getDocumentForUser(params.id, user.id);
  if (!result) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data: { title?: string; content?: string } = {};

  if (body.title !== undefined) {
    if (!result.isOwner) {
      return NextResponse.json({ error: "Only the owner can rename this document" }, { status: 403 });
    }
    const title = String(body.title).trim();
    if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }
    data.title = title;
  }

  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "content must be a JSON string" }, { status: 400 });
    }
    if (Buffer.byteLength(body.content, "utf8") > MAX_CONTENT_BYTES) {
      return NextResponse.json({ error: "Document content is too large" }, { status: 413 });
    }
    try {
      JSON.parse(body.content);
    } catch {
      return NextResponse.json({ error: "content must be valid JSON" }, { status: 400 });
    }
    data.content = body.content;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const document = await prisma.document.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ document });
}

// DELETE — owner only.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const result = await getDocumentForUser(params.id, user.id);
  if (!result) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (!result.isOwner) {
    return NextResponse.json({ error: "Only the owner can delete this document" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
