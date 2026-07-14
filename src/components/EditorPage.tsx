"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Editor from "@/components/Editor";
import { avatarColor, initials } from "@/lib/avatar";

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

  const statusClass =
    status === "saving" ? "is-saving" : status === "saved" ? "is-saved" : status === "error" ? "is-error" : "";
  const statusLabel =
    status === "saving"
      ? "Saving…"
      : status === "saved"
      ? "Saved"
      : status === "error"
      ? "Save failed"
      : !isOwner
      ? "Shared access"
      : "";

  return (
    <>
      <Link href="/" className="back-link">
        <ArrowLeftIcon /> All documents
      </Link>

      <div className="editor-page-header">
        <input
          className="title-input"
          value={title}
          disabled={!isOwner}
          onChange={(e) => handleTitleChange(e.target.value)}
          aria-label="Document title"
          placeholder="Untitled document"
        />
        <div className="header-actions">
          {statusLabel && (
            <span className={`save-status ${statusClass}`}>
              <span className="save-dot" />
              {statusLabel}
            </span>
          )}
          {isOwner && (
            <button className="btn" onClick={() => setShowShare((s) => !s)}>
              <ShareIcon /> Share
            </button>
          )}
        </div>
      </div>

      <p className="owner-line">
        Owned by {owner.name} ({owner.email})
        {!isOwner && " · you have shared access to this document"}
      </p>

      {error && (
        <div className="error-banner">
          <AlertIcon /> {error}
        </div>
      )}

      {isOwner && showShare && (
        <div className="share-panel">
          <h3>Share this document</h3>
          <p className="share-subtitle">Anyone you add can view and edit this document.</p>
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
          {shareError && (
            <div className="error-banner">
              <AlertIcon /> {shareError}
            </div>
          )}
          <ul className="share-list">
            {shares.length === 0 && <li>No one else has access yet.</li>}
            {shares.map((s) => (
              <li key={s.userId}>
                <span className="share-user">
                  <span className="avatar avatar-sm" style={{ background: avatarColor(s.name) }}>
                    {initials(s.name)}
                  </span>
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

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
      <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.6l6.8-3.2M8.6 13.4l6.8 3.2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}
