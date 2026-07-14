import { prisma } from "./db";

// Shared by both the dashboard server component (initial render) and the
// /api/documents GET handler (client-side refetch after create/upload), so
// "owned vs shared" logic lives in exactly one place.
export async function getDashboardData(userId: string) {
  const [owned, sharedRows] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      include: { shares: { include: { user: true } } },
    }),
    prisma.share.findMany({
      where: { userId },
      include: {
        document: {
          include: { owner: true, shares: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { owned, shared: sharedRows.map((s: { document: unknown }) => s.document) };
}
