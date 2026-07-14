import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_COOKIE, getCurrentUser } from "@/lib/currentUser";

// GET: list all seeded users (for the switcher) + who's currently "signed in".
export async function GET() {
  const [users, current] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentUser(),
  ]);
  return NextResponse.json({ users, currentUserId: current?.id ?? null });
}

// POST: switch the mocked "signed in" user by id.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  }

  const res = NextResponse.json({ user });
  res.cookies.set(USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
