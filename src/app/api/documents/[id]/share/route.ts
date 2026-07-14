import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { getDocumentForUser } from "@/lib/access";

// POST — owner grants access to another seeded user by email.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const result = await getDocumentForUser(params.id, user.id);
  if (!result) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (!result.isOwner) {
    return NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json({ error: `No user found with email ${email}` }, { status: 404 });
  }
  if (targetUser.id === user.id) {
    return NextResponse.json({ error: "You already own this document" }, { status: 400 });
  }

  const share = await prisma.share.upsert({
    where: { documentId_userId: { documentId: params.id, userId: targetUser.id } },
    update: {},
    create: { documentId: params.id, userId: targetUser.id },
    include: { user: true },
  });

  return NextResponse.json({ share }, { status: 201 });
}

// DELETE — owner revokes access. Pass ?userId=... as a query param.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const result = await getDocumentForUser(params.id, user.id);
  if (!result) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (!result.isOwner) {
    return NextResponse.json({ error: "Only the owner can modify sharing" }, { status: 403 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId query param is required" }, { status: 400 });

  await prisma.share
    .delete({ where: { documentId_userId: { documentId: params.id, userId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
