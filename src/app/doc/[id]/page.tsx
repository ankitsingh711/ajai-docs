import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getDocumentForUser } from "@/lib/access";
import EditorPage from "@/components/EditorPage";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="container">
        <div className="error-banner">No users found. Run the seed script.</div>
      </main>
    );
  }

  const result = await getDocumentForUser(params.id, user.id);

  if (!result) {
    return (
      <main className="container">
        <div className="error-banner">
          This document doesn&apos;t exist, or you don&apos;t have access to it.
        </div>
        <Link href="/" className="btn" style={{ display: "inline-block", marginTop: 12 }}>
          Back to documents
        </Link>
      </main>
    );
  }

  const { document, isOwner } = result;

  return (
    <main className="container">
      <EditorPage
        // Same reasoning as the dashboard: remount on user switch so
        // isOwner/title/share state doesn't get stuck from whoever was
        // signed in before.
        key={user.id}
        documentId={document.id}
        initialTitle={document.title}
        initialContent={document.content}
        isOwner={isOwner}
        owner={{ id: document.owner.id, name: document.owner.name, email: document.owner.email }}
        initialShares={document.shares.map((s: { user: { id: string; name: string; email: string } }) => ({
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
        }))}
      />
    </main>
  );
}
