"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Editor from "@/components/Editor";

type Owner = { id: string; name: string; email: string };
type ShareEntry = { userId: string; name: string; email: string };

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function EditorPage({
  documentId,
  initialTitle,
  initialContent,
  isOwner,
  owner,
  initialShares,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  isOwner: boolean;
  owner: Owner;
  initialShares: ShareEntry[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState(initialShares);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  const parsedContent = useRef(safeParse(initialContent));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    async (payload: { title?: string; content?: string }) => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to save");
          setStatus("error");
          return;
        }
        setError(null);
        setStatus("saved");
      } catch {
        setError("Network error while saving");
        setStatus("error");
      }
    },
    [documentId]
  );

  function scheduleSave(payload: { title?: string; content?: string }) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(payload), 600);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (isOwner) scheduleSave({ title: value });
  }

  function handleContentChange(json: unknown) {
    scheduleSave({ content: JSON.stringify(json) });
  }

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareError(null);
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: shareEmail.trim().toLowerCase() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setShareError(data.error ?? "Failed to share");
      return;
    }
    setShares((prev) => {
      const withoutDup = prev.filter((s) => s.userId !== data.share.user.id);
      return [
        ...withoutDup,
        { userId: data.share.user.id, name: data.share.user.name, email: data.share.user.email },
      ];
    });
    setShareEmail("");
  }

  async function revokeShare(userId: string) {
    await fetch(`/api/documents/${documentId}/share?userId=${userId}`, { method: "DELETE" });
    setShares((prev) => prev.filter((s) => s.userId !== userId));
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <>
      <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
        ← All documents
      </Link>

      <div className="editor-page-header">
        <input
          className="title-input"
          value={title}
          disabled={!isOwner}
          onChange={(e) => handleTitleChange(e.target.value)}
          aria-label="Document title"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="save-status">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && "Save failed"}
            {status === "idle" && !isOwner && "Read-write shared access"}
          </span>
          {isOwner && (
            <button className="btn" onClick={() => setShowShare((s) => !s)}>
              Share
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>
        Owned by {owner.name} ({owner.email})
        {!isOwner && " · you have shared access to this document"}
      </p>

      {error && <div className="error-banner">{error}</div>}

      {isOwner && showShare && (
        <div className="share-panel">
          <h3>Share this document</h3>
          <form className="share-form" onSubmit={handleShare}>
            <input
              type="email"
              placeholder="teammate@ajaia.test"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">
              Grant access
            </button>
          </form>
          {shareError && <div className="error-banner">{shareError}</div>}
          <ul className="share-list">
            {shares.length === 0 && <li>No one else has access yet.</li>}
            {shares.map((s) => (
              <li key={s.userId}>
                <span>
                  {s.name} ({s.email})
                </span>
                <button onClick={() => revokeShare(s.userId)}>Revoke</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Editor content={parsedContent.current} editable={true} onChange={handleContentChange} />
    </>
  );
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
}
