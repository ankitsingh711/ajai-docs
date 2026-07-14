"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { avatarColor, initials } from "@/lib/avatar";

type Owner = { id: string; name: string; email: string };
type DocSummary = {
  id: string;
  title: string;
  updatedAt: string;
  owner?: Owner;
  shares: { user: Owner }[];
};

export default function Dashboard({
  currentUser,
  initialOwned,
  initialShared,
}: {
  currentUser: Owner;
  initialOwned: DocSummary[];
  initialShared: DocSummary[];
}) {
  const [owned, setOwned] = useState(initialOwned);
  const [shared, setShared] = useState(initialShared);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/documents");
    if (!res.ok) return;
    const data = await res.json();
    setOwned(data.owned);
    setShared(data.shared);
  }

  async function createDocument() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled document" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create document");
        return;
      }
      router.push(`/doc/${data.document.id}`);
    } catch {
      setError("Network error while creating document");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to upload file");
        return;
      }
      router.push(`/doc/${data.document.id}`);
    } catch {
      setError("Network error while uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setError(null);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete document");
      return;
    }
    refresh();
  }

  const firstName = currentUser.name.split(" ")[0];

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Welcome back, {firstName}</h1>
          <div className="subtitle">{currentUser.email}</div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertIcon /> {error}
        </div>
      )}

      <div className="toolbar-row">
        <button className="btn btn-primary" onClick={createDocument} disabled={creating}>
          <PlusIcon /> {creating ? "Creating…" : "New document"}
        </button>

        <label className={`btn upload-btn ${uploading ? "btn-disabled" : ""}`} aria-disabled={uploading}>
          <UploadIcon /> {uploading ? "Uploading…" : "Import a file"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleUpload}
            disabled={uploading}
            aria-label="Import a .txt or .md file"
          />
        </label>
      </div>
      <p className="upload-note">Supports .txt and .md (1MB max) — the file becomes a new document.</p>

      <h2 className="section-title">Your documents</h2>
      {owned.length === 0 ? (
        <EmptyState message="No documents yet. Create one above to get started." />
      ) : (
        <div className="doc-grid">
          {owned.map((doc) => (
            <DocCard key={doc.id} doc={doc} onDelete={() => deleteDocument(doc.id)} />
          ))}
        </div>
      )}

      <h2 className="section-title">Shared with you</h2>
      {shared.length === 0 ? (
        <EmptyState message="Nothing has been shared with you yet." />
      ) : (
        <div className="doc-grid">
          {shared.map((doc) => (
            <DocCard key={doc.id} doc={doc} sharedByOwner />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <DocIcon />
      </span>
      {message}
    </div>
  );
}

function DocCard({
  doc,
  sharedByOwner,
  onDelete,
}: {
  doc: DocSummary;
  sharedByOwner?: boolean;
  onDelete?: () => void;
}) {
  return (
    <Link href={`/doc/${doc.id}`} className="doc-card">
      {onDelete && (
        <div className="doc-card-actions">
          <button
            className="btn btn-danger btn-icon"
            title="Delete document"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            <TrashIcon />
          </button>
        </div>
      )}

      <span className={`doc-card-icon ${sharedByOwner ? "is-shared" : ""}`}>
        <DocIcon />
      </span>

      <div>
        <div className="doc-card-title">{doc.title}</div>
        <div className="doc-card-meta">
          Updated <FormattedDate value={doc.updatedAt} />
        </div>
      </div>

      <div className="doc-card-footer">
        <span className={`badge ${sharedByOwner ? "badge-shared" : ""}`}>
          {sharedByOwner ? "Shared" : "Owned"}
        </span>
        {sharedByOwner && doc.owner ? (
          <span
            className="avatar avatar-sm"
            style={{ background: avatarColor(doc.owner.name) }}
            title={`Shared by ${doc.owner.name}`}
          >
            {initials(doc.owner.name)}
          </span>
        ) : doc.shares.length > 0 ? (
          <div style={{ display: "flex", marginLeft: -4 }}>
            {doc.shares.slice(0, 3).map((s) => (
              <span
                key={s.user.id}
                className="avatar avatar-sm"
                style={{ background: avatarColor(s.user.name), marginLeft: -4, border: "2px solid var(--surface)" }}
                title={s.user.name}
              >
                {initials(s.user.name)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Renders a locale-formatted date, but only after mounting on the client.
 *
 * `toLocaleString()` formats using the runtime's locale/timezone. The
 * Next.js server that renders the initial HTML and the user's browser can
 * disagree on both (e.g. server defaults to en-US/UTC, browser is
 * en-GB/IST), so formatting the date during SSR produces text that doesn't
 * match what the client renders on hydration — a hydration mismatch. This
 * component sidesteps it by rendering a static placeholder on the server
 * and filling in the real formatted date in an effect, which runs only on
 * the client after hydration has already succeeded.
 */
function FormattedDate({ value }: { value: string }) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    setFormatted(
      new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
  }, [value]);

  return <span suppressHydrationWarning>{formatted ?? "…"}</span>;
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" strokeLinejoin="round" />
      <path d="M14 2v6h6" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" strokeLinecap="round" strokeLinejoin="round" />
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
