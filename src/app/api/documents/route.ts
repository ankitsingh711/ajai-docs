import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { getDashboardData } from "@/lib/documents";

const MAX_TITLE_LENGTH = 200;

// GET /api/documents — documents owned by the current user, and documents
// shared with them, returned as two separate lists so the UI can show a
// clear owned/shared distinction (required by the assignment).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No users seeded. Run the seed script." }, { status: 500 });
  }

  const { owned, shared } = await getDashboardData(user.id);

  return NextResponse.json({ currentUser: user, owned, shared });
}

// POST /api/documents — create a new blank document owned by the current user.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No users seeded. Run the seed script." }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  let title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) title = "Untitled document";
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const content =
    typeof body?.content === "string" && body.content.length > 0
      ? body.content
      : JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

  const document = await prisma.document.create({
    data: { title, ownerId: user.id, content },
  });

  return NextResponse.json({ document }, { status: 201 });
}
