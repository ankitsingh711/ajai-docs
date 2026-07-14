"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  return (
    <>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar-row">
        <button className="btn btn-primary" onClick={createDocument} disabled={creating}>
          {creating ? "Creating…" : "+ New document"}
        </button>

        <label className="file-input-label">
          {uploading ? "Uploading…" : "Import a file"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "block", marginTop: 4 }}
          />
        </label>
      </div>
      <p className="upload-note">Supported formats: .txt and .md (1MB max). The file becomes a new document.</p>

      <h2 className="section-title">Your documents</h2>
      {owned.length === 0 ? (
        <p className="empty-state">No documents yet. Create one above.</p>
      ) : (
        <div className="doc-list">
          {owned.map((doc) => (
            <DocRow key={doc.id} doc={doc} onDelete={() => deleteDocument(doc.id)} />
          ))}
        </div>
      )}

      <h2 className="section-title">Shared with you</h2>
      {shared.length === 0 ? (
        <p className="empty-state">Nothing has been shared with you yet.</p>
      ) : (
        <div className="doc-list">
          {shared.map((doc) => (
            <DocRow key={doc.id} doc={doc} sharedByOwner />
          ))}
        </div>
      )}
    </>
  );
}

function DocRow({
  doc,
  sharedByOwner,
  onDelete,
}: {
  doc: DocSummary;
  sharedByOwner?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="doc-row">
      <Link href={`/doc/${doc.id}`} style={{ flex: 1, textDecoration: "none" }}>
        <div style={{ fontWeight: 600 }}>{doc.title}</div>
        <div className="meta">
          Updated {new Date(doc.updatedAt).toLocaleString()}
          {sharedByOwner && doc.owner ? ` · shared by ${doc.owner.name}` : ""}
          {!sharedByOwner && doc.shares.length > 0
            ? ` · shared with ${doc.shares.map((s) => s.user.name).join(", ")}`
            : ""}
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={`badge ${sharedByOwner ? "badge-shared" : ""}`}>
          {sharedByOwner ? "Shared" : "Owned"}
        </span>
        {onDelete && (
          <button
            className="btn btn-danger"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
