import { prisma } from "./db";

/**
 * Returns the document if the given user is the owner or has been granted
 * share access, otherwise null. Centralizing this check keeps every route
 * that touches a document honest about access control instead of
 * re-implementing the same "owner or shared" logic ad hoc.
 */
export async function getDocumentForUser(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!document) return null;

  const isOwner = document.ownerId === userId;
  const isShared = document.shares.some((s: { userId: string }) => s.userId === userId);

  if (!isOwner && !isShared) return null;

  return { document, isOwner };
}
