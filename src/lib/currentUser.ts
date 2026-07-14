import { cookies } from "next/headers";
import { prisma } from "./db";

export const USER_COOKIE = "ajaia_user_id";

/**
 * Resolves the "current user" for this request. Auth is intentionally mocked
 * (see README/architecture note): we trust a signed-in-looking cookie set by
 * the user switcher rather than building real authentication, which was
 * explicitly out of scope for this exercise.
 *
 * Falls back to the first seeded user so the app never renders in a
 * signed-out dead end.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get(USER_COOKIE)?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  const fallback = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  return fallback;
}
